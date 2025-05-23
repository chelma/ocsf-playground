import json
import logging
from typing import List
import uuid

from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from langchain_core.messages import HumanMessage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.categorization_expert.expert_def import get_categorization_expert, invoke_categorization_expert
from backend.categorization_expert.task_def import CategorizationTask

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.validation_report import ValidationReport

from backend.entities_expert.entities import EntityMapping, Entity
from backend.entities_expert.extraction_pattern import ExtractionPattern
from backend.entities_expert.expert_def import get_analysis_expert, get_extraction_expert, invoke_analysis_expert, invoke_extraction_expert
from backend.entities_expert.task_def import AnalysisTask, ExtractTask
from backend.entities_expert.validators import PythonExtractionPatternValidator

from backend.regex_expert.expert_def import get_regex_expert, invoke_regex_expert
from backend.regex_expert.task_def import RegexTask
from backend.regex_expert.parameters import RegexFlavor

from backend.transformers.parameters import TransformLanguage
from backend.transformers.transformers import Transformer, create_transformer_python
from backend.transformers.validators import PythonOcsfV1_1_0TransformValidator

from .serializers import (TransformerHeuristicCreateRequestSerializer, TransformerHeuristicCreateResponseSerializer,
                          TransformerCategorizeV1_1_0RequestSerializer, TransformerCategorizeV1_1_0ResponseSerializer,
                          TransformerEntitiesV1_1_0AnalyzeRequestSerializer, TransformerEntitiesV1_1_0AnalyzeResponseSerializer,
                          TransformerEntitiesV1_1_0ExtractRequestSerializer, TransformerEntitiesV1_1_0ExtractResponseSerializer,
                          TransformerEntitiesV1_1_0TestRequestSerializer, TransformerEntitiesV1_1_0TestResponseSerializer,
                          TransformerLogicV1_1_0CreateRequestSerializer, TransformerLogicV1_1_0CreateResponseSerializer
                          )


logger = logging.getLogger("playground_api")


class TransformerHeuristicCreateView(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerHeuristicCreateRequestSerializer,
        responses=TransformerHeuristicCreateResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received heuristic creation request: {request.data}")

        # Validate incoming data
        request = TransformerHeuristicCreateRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid heuristic creation request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            result = self._create_regex(task_id, request)
            logger.info(f"Regex creation successful")
            logger.debug(f"Regex value:\n{result.regex.value}")
        except Exception as e:
            logger.error(f"Regex creation failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerHeuristicCreateResponseSerializer(data={
            "new_heuristic": result.regex.value,
            "rationale": result.regex.rationale
        })
        if not response.is_valid():
            logger.error(f"Invalid heuristic creation response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _create_regex(self, task_id: str, request: TransformerHeuristicCreateRequestSerializer) -> RegexTask:
            expert = get_regex_expert(
                regex_flavor=RegexFlavor.JAVASCRIPT # Hardcoded for now
            )

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                user_guidance=request.validated_data["user_guidance"]
            )
            turns = [
                system_message,
                HumanMessage(content="Please create the regex.")
            ]

            task = RegexTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=turns,
                regex=None
            )

            result = invoke_regex_expert(expert, task)

            return result
    
class TransformerCategorizeV1_1_0View(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerCategorizeV1_1_0RequestSerializer,
        responses=TransformerCategorizeV1_1_0ResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received categorization request: {request.data}")

        # Validate incoming data
        request = TransformerCategorizeV1_1_0RequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid categorization request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            result = self._categorize(task_id, request)
            logger.info(f"Categorization successful")
            logger.debug(f"Category value:\n{result.category.value}")
        except Exception as e:
            logger.error(f"Categorization failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerCategorizeV1_1_0ResponseSerializer(data={
            "ocsf_category":  result.category.value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "rationale": result.category.rationale
        })
        if not response.is_valid():
            logger.error(f"Invalid categorization response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _categorize(self, task_id: str, request: TransformerCategorizeV1_1_0RequestSerializer) -> CategorizationTask:
            expert = get_categorization_expert(OcsfVersion.V1_1_0)

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                user_guidance=request.validated_data["user_guidance"]
            )
            turns = [
                system_message,
                HumanMessage(content="Please categorize the input.")
            ]

            task = CategorizationTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=turns,
                category=None
            )

            result = invoke_categorization_expert(expert, task)

            return result
    

class UnsupportedTransformLanguageError(Exception):
    pass
    
class TransformerLogicV1_1_0CreateView(APIView):

    @csrf_exempt
    @extend_schema(
        request=TransformerLogicV1_1_0CreateRequestSerializer,
        responses=TransformerLogicV1_1_0CreateResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received transform creation request: {request.data}")

        # Validate incoming data
        request = TransformerLogicV1_1_0CreateRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid transform creation request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            # Create the transform
            transformer = self._create(task_id, request)
            logger.info(f"Transform creation completed")
            logger.debug(f"Transform value:\n{transformer.to_json()}")

            # Validate the transform
            report = self._validate(
                request.validated_data["transform_language"],
                request.validated_data["ocsf_category"].get_event_name(),
                transformer,
                request.validated_data["input_entry"]
            )
            logger.info(f"Transform validation completed")
            logger.debug(f"Validation report:\n{json.dumps(report.to_json(), indent=4)}")
        except UnsupportedTransformLanguageError as e:
            logger.error(f"{str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Transform creation failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerLogicV1_1_0CreateResponseSerializer(data={
            "transform_language":  request.validated_data["transform_language"].value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "transformer":  transformer.to_json()
        })

        if not response.is_valid():
            logger.error(f"Invalid transform creation response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _create(self, task_id: str, request: TransformerLogicV1_1_0CreateRequestSerializer) -> Transformer:
            if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
                patterns = []
                for raw_pattern in request.validated_data["patterns"]:
                    patterns.append(ExtractionPattern.from_json(raw_pattern))

                transformer = create_transformer_python(
                    transformer_id=task_id,
                    patterns=patterns
                )
            else:
                raise UnsupportedTransformLanguageError(f"Unsupported transform language: {request.validated_data['transform_language']}")

            return transformer
    
    def _validate(self, language: TransformLanguage, category_name: str, transformer: Transformer, input_entry: str) -> ValidationReport:
        # Validate the transform
        if language == TransformLanguage.PYTHON:
            validator = PythonOcsfV1_1_0TransformValidator(
                event_name=category_name,
                input_entry=input_entry,
                transformer=transformer
            )
            report = validator.validate()
        else:
            raise UnsupportedTransformLanguageError(f"Unsupported transform language: {language}")

        transformer.validation_report = report

        return report
    
class TransformerEntitiesV1_1_0AnalyzeView(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerEntitiesV1_1_0AnalyzeRequestSerializer,
        responses=TransformerEntitiesV1_1_0AnalyzeResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received analysis request: {request.data}")

        # Validate incoming data
        request = TransformerEntitiesV1_1_0AnalyzeRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid analysis request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            result = self._analyze(task_id, request)
            logger.info(f"Analysis successful")
            logger.debug(f"Entities value:\n{json.dumps(result.entities_report.to_json(), indent=4)}")
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response                
        response = TransformerEntitiesV1_1_0AnalyzeResponseSerializer(data={
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "input_entry": request.validated_data["input_entry"],
            "data_type": result.entities_report.data_type,
            "type_rationale": result.entities_report.type_rationale,
            "mappings": result.entities_report.to_json()["mappings"],
        })
        if not response.is_valid():
            logger.error(f"Invalid analysis response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _analyze(self, task_id: str, request: TransformerEntitiesV1_1_0AnalyzeRequestSerializer) -> AnalysisTask:
            event_name = request.validated_data["ocsf_category"].get_event_name()
            
            expert = get_analysis_expert(OcsfVersion.V1_1_0, event_name)

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"]
            )
            turns = [
                system_message,
                HumanMessage(content="Please analyze the input for entities and create mappings.")
            ]

            task = AnalysisTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=turns,
                entities_report=None
            )

            result = invoke_analysis_expert(expert, task)

            return result
    
class TransformerEntitiesV1_1_0ExtractView(APIView):

    @csrf_exempt
    @extend_schema(
        request=TransformerEntitiesV1_1_0ExtractRequestSerializer,
        responses=TransformerEntitiesV1_1_0ExtractResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received extraction request: {request.data}")

        # Validate incoming data
        request = TransformerEntitiesV1_1_0ExtractRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid extraction request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            # Create the extraction patterns
            result = self._perform_extraction(task_id, request)
            logger.info(f"Extraction completed")
            logger.debug(f"Extraction patterns:\n{json.dumps([pattern.to_json() for pattern in result.patterns], indent=4)}")

            # Validate the patterns
            patterns = self._validate(request.validated_data["input_entry"], result.patterns)
            logger.info(f"Extraction pattern validation completed")
        except UnsupportedTransformLanguageError as e:
            logger.error(f"{str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Extraction process failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerEntitiesV1_1_0ExtractResponseSerializer(data={
            "transform_language":  request.validated_data["transform_language"].value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "input_entry":  request.validated_data["input_entry"],
            "patterns": [pattern.to_json() for pattern in patterns],
        })

        if not response.is_valid():
            logger.error(f"Invalid extraction response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _perform_extraction(self, task_id: str, request: TransformerEntitiesV1_1_0ExtractRequestSerializer) -> ExtractTask:
            # Perform the inference task to create the extraction patterns
            expert = get_extraction_expert(
                ocsf_version=OcsfVersion.V1_1_0,
                ocsf_event_name=request.validated_data["ocsf_category"].get_event_name()
            )

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                mapping_list=[EntityMapping.from_json(raw) for raw in request.validated_data["mappings"]]
            )

            turns = [
                system_message,
                HumanMessage(content="Please create the extraction patterns.")
            ]

            if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
                task = ExtractTask(
                    task_id=task_id,
                    input=request.validated_data["input_entry"],
                    context=turns,
                    patterns=None
                )
            else:
                raise UnsupportedTransformLanguageError(f"Unsupported extraction language: {request.validated_data['transform_language']}")

            result = invoke_extraction_expert(expert, task)

            # Map the patterns to the mappings.  This is necessary because the patterns were created by the LLM, but
            # the LLM did not include the original mapping data in its output to save tokens.  We re-join the two using
            # the mapping ID.
            try:
                for pattern in result.patterns:
                    raw_mapping = next(
                        (mapping for mapping in request.validated_data["mappings"] if mapping["id"] == pattern.id)
                    )
                    pattern.mapping = EntityMapping(
                        id=raw_mapping["id"],
                        entities=[
                            Entity(
                                value=entity["value"],
                                description=entity["description"]
                            )
                            for entity in raw_mapping["entities"]
                        ],
                        ocsf_path=raw_mapping["ocsf_path"],
                        path_rationale=raw_mapping["path_rationale"]
                    )
            except StopIteration:
                raise ValueError(f"Mapping ID {pattern.id} not found in the input mappings.")

            return result
    
    def _validate(self, input_entry: str, patterns: List[ExtractionPattern]) -> List[ExtractionPattern]:
        for pattern in patterns:
            pattern.validation_report = PythonExtractionPatternValidator(
                input_entry=input_entry,
                pattern=pattern
            ).validate()

        return patterns

class TransformerEntitiesV1_1_0TestView(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerEntitiesV1_1_0TestRequestSerializer,
        responses=TransformerEntitiesV1_1_0TestResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received entities test request: {request.data}")

        # Validate incoming data
        request = TransformerEntitiesV1_1_0TestRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid entities test request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            # Validate the patterns
            raw_patterns = request.validated_data["patterns"]
            patterns = []
            for raw_pattern in raw_patterns:
                pattern = ExtractionPattern(
                    id=raw_pattern["id"],
                    dependency_setup=raw_pattern["dependency_setup"],
                    extract_logic=raw_pattern["extract_logic"],
                    transform_logic=raw_pattern["transform_logic"],
                    mapping=EntityMapping(
                        id=raw_pattern["mapping"]["id"],
                        entities=[
                            Entity(
                                value=entity["value"],
                                description=entity["description"]
                            )
                            for entity in raw_pattern["mapping"]["entities"]
                        ],
                        ocsf_path=raw_pattern["mapping"]["ocsf_path"],
                        path_rationale=raw_pattern["mapping"]["path_rationale"]
                    ) if raw_pattern["mapping"] else None,
                )
                patterns.append(pattern)

            validated_patterns = self._validate(request.validated_data["input_entry"], patterns)
            logger.info(f"Extraction pattern validation completed")
        except UnsupportedTransformLanguageError as e:
            logger.error(f"{str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Entities testing process failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerEntitiesV1_1_0TestResponseSerializer(data={
            "transform_language":  request.validated_data["transform_language"].value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "input_entry":  request.validated_data["input_entry"],
            "patterns": [validated_pattern.to_json() for validated_pattern in validated_patterns],
        })

        if not response.is_valid():
            logger.error(f"Invalid entities test response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)
    
    def _validate(self, input_entry: str, patterns: List[ExtractionPattern]) -> List[ExtractionPattern]:
        for pattern in patterns:
            pattern.validation_report = PythonExtractionPatternValidator(
                input_entry=input_entry,
                pattern=pattern
            ).validate()

        return patterns