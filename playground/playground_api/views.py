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

from backend.entities_expert.entities import EntityMapping, Entity
from backend.entities_expert.extraction_pattern import ExtractionPattern
from backend.entities_expert.expert_def import get_analysis_expert, get_extraction_expert, invoke_analysis_expert, invoke_extraction_expert
from backend.entities_expert.task_def import AnalysisTask, ExtractTask
from backend.entities_expert.validators import PythonExtractionPatternValidator

from backend.regex_expert.expert_def import get_regex_expert, invoke_regex_expert
from backend.regex_expert.task_def import RegexTask
from backend.regex_expert.parameters import RegexFlavor

from backend.transformation_expert.expert_def import get_transformation_expert, invoke_transformation_expert
from backend.transformation_expert.parameters import TransformLanguage
from backend.transformation_expert.task_def import PythonTransformTask, TransformTask
from backend.transformation_expert.transforms import TransformPython
from backend.transformation_expert.validation import OcsfV1_1_0TransformValidator, ValidationReportTransform

from .serializers import (TransformerHeuristicCreateRequestSerializer, TransformerHeuristicCreateResponseSerializer,
                          TransformerCategorizeV1_1_0RequestSerializer, TransformerCategorizeV1_1_0ResponseSerializer,
                          TransformerEntitiesV1_1_0AnalyzeRequestSerializer, TransformerEntitiesV1_1_0AnalyzeResponseSerializer,
                          TransformerEntitiesV1_1_0ExtractRequestSerializer, TransformerEntitiesV1_1_0ExtractResponseSerializer,
                          TransformerLogicV1_1_0CreateRequestSerializer, TransformerLogicV1_1_0CreateResponseSerializer,
                          TransformerLogicV1_1_0TestRequestSerializer, TransformerLogicV1_1_0TestResponseSerializer,
                          TransformerLogicV1_1_0IterateRequestSerializer, TransformerLogicV1_1_0IterateResponseSerializer
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
            result = self._create(task_id, request)
            logger.info(f"Transform creation completed")
            logger.debug(f"Transform value:\n{result.transform.to_json()}")

            # Validate the transform
            report = self._validate(result)
            logger.info(f"Transform validation completed")
            logger.debug(f"Validation outcome:\n{report.passed}")
            logger.debug(f"Validation report entries:\n{report.report_entries}")
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
            "transform_logic":  result.transform.to_file_format(),
            "transform_output":  json.dumps(report.output, indent=4),
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "input_entry":  request.validated_data["input_entry"],
            "validation_report": report.report_entries,
            "validation_outcome": "PASSED" if report.passed else "FAILED"
        })

        if not response.is_valid():
            logger.error(f"Invalid transform creation response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)

    def _create(self, task_id: str, request: TransformerLogicV1_1_0CreateRequestSerializer) -> TransformTask:
            expert = get_transformation_expert(
                ocsf_version=OcsfVersion.V1_1_0,
                ocsf_category_name=request.validated_data["ocsf_category"].get_category_name(),
                transform_language=request.validated_data["transform_language"],
                is_followup=False
            )

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                user_guidance=request.validated_data["user_guidance"]
            )
            turns = [
                system_message,
                HumanMessage(content="Please create the transform.")
            ]

            if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
                task = PythonTransformTask(
                    task_id=task_id,
                    input=request.validated_data["input_entry"],
                    context=turns,
                    category_name=request.validated_data["ocsf_category"].get_category_name(),
                    transform=None
                )
            else:
                raise UnsupportedTransformLanguageError(f"Unsupported transform language: {request.validated_data['transform_language']}")

            result = invoke_transformation_expert(expert, task)

            return result
    
    def _validate(self, transform_taks: TransformTask) -> ValidationReportTransform:
        # Create the validator
        validator = OcsfV1_1_0TransformValidator(transform_task=transform_taks)

        # Validate the transform
        report = validator.validate()

        return report
    
class TransformerLogicV1_1_0TestView(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerLogicV1_1_0TestRequestSerializer,
        responses=TransformerLogicV1_1_0TestResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received transform testing request: {request.data}")

        # Validate incoming data
        request = TransformerLogicV1_1_0TestRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid transform testing request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            # Validate the transform
            report = self._validate(task_id, request)
            logger.info(f"Transform validation completed")
            logger.debug(f"Validation outcome:\n{report.passed}")
            logger.debug(f"Validation report entries:\n{report.report_entries}")
        except UnsupportedTransformLanguageError as e:
            logger.error(f"{str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Transform testing failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerLogicV1_1_0TestResponseSerializer(data={
            "transform_language":  request.validated_data["transform_language"].value,
            "transform_logic":  request.validated_data["transform_logic"],
            "transform_output":  json.dumps(report.output, indent=4),
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "input_entry":  request.validated_data["input_entry"],
            "validation_report": report.report_entries,
            "validation_outcome": "PASSED" if report.passed else "FAILED"
        })

        if not response.is_valid():
            logger.error(f"Invalid transform testing response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)
    
    def _validate(self, task_id: str, request: TransformerLogicV1_1_0TestRequestSerializer) -> ValidationReportTransform:
        # Create the task object to validate
        if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
            task = PythonTransformTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=[],
                category_name=request.validated_data["ocsf_category"].get_category_name(),
                transform=TransformPython(
                    imports="", # Just put everything in the `code` section
                    description="", # Just put everything in the `code` section
                    code=request.validated_data["transform_logic"], # Will contain all three sections
                )
            )
        else:
            raise UnsupportedTransformLanguageError(f"Unsupported transform language: {request.validated_data['transform_language']}")

        # Create the validator
        validator = OcsfV1_1_0TransformValidator(transform_task=task)

        # Validate the transform
        report = validator.validate()

        return report
    
class TransformerLogicV1_1_0IterateView(APIView):
    @csrf_exempt
    @extend_schema(
        request=TransformerLogicV1_1_0IterateRequestSerializer,
        responses=TransformerLogicV1_1_0IterateResponseSerializer
    )
    def post(self, request):
        logger.info(f"Received transform iteration request: {request.data}")

        # Validate incoming data
        request = TransformerLogicV1_1_0IterateRequestSerializer(data=request.data)
        if not request.is_valid():
            logger.error(f"Invalid transform iteration request: {request.errors}")
            return Response(request.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            # Iterate on the transform
            result = self._iterate(task_id, request)
            logger.info(f"Transform iteration completed")
            logger.debug(f"Transform value:\n{result.transform.to_json()}")

            # Validate the transform
            report = self._validate(result)
            logger.info(f"Transform validation completed")
            logger.debug(f"Validation outcome:\n{report.passed}")
            logger.debug(f"Validation report entries:\n{report.report_entries}")
        except UnsupportedTransformLanguageError as e:
            logger.error(f"{str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Transform iteration failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response = TransformerLogicV1_1_0IterateResponseSerializer(data={
            "transform_language":  request.validated_data["transform_language"].value,
            "transform_logic":  result.transform.to_file_format(),
            "transform_output":  json.dumps(report.output, indent=4),
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "ocsf_category":  request.validated_data["ocsf_category"].value,
            "input_entry":  request.validated_data["input_entry"],
            "validation_report": report.report_entries,
            "validation_outcome": "PASSED" if report.passed else "FAILED"
        })

        if not response.is_valid():
            logger.error(f"Invalid transform iteration response: {response.errors}")
            return Response(response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.data, status=status.HTTP_200_OK)
    
    def _create_validation_report(self, task_id: str, request: TransformerLogicV1_1_0IterateRequestSerializer) -> ValidationReportTransform:
        logger.debug(f"Creating validation report for task ID: {task_id}")        
        # Create the task object to validate
        if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
            output = json.loads(request.validated_data["transform_output"]) if request.validated_data["transform_output"] else {}
            report_entries = request.validated_data["validation_report"] if request.validated_data["validation_report"] else []

            report = ValidationReportTransform(
                input=request.validated_data["input_entry"],
                transform=TransformPython(
                    imports="", # Just put everything in the `code` section
                    description="", # Just put everything in the `code` section
                    code=request.validated_data["transform_logic"], # Will contain all three sections
                ),
                output=output,
                report_entries=report_entries,
                passed=request.validated_data["validation_outcome"] == "PASSED"
            )
        else:
            raise UnsupportedTransformLanguageError(f"Unsupported transform language: {request.validated_data['transform_language']}")
        
        logger.debug(f"Validation report created: {report.to_json()}")

        return report

    def _iterate(self, task_id: str, request: TransformerLogicV1_1_0IterateRequestSerializer) -> TransformTask:
            expert = get_transformation_expert(
                ocsf_version=OcsfVersion.V1_1_0,
                ocsf_category_name=request.validated_data["ocsf_category"].get_category_name(),
                transform_language=request.validated_data["transform_language"],
                is_followup=True
            )

            # Create the validation report
            report = self._create_validation_report(task_id, request)

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                user_guidance=request.validated_data["user_guidance"],
                validation_report=report
            )
            turns = [
                system_message,
                HumanMessage(content="Please create the transform.")
            ]

            if request.validated_data["transform_language"] == TransformLanguage.PYTHON:
                task = PythonTransformTask(
                    task_id=task_id,
                    input=request.validated_data["input_entry"],
                    context=turns,
                    category_name=request.validated_data["ocsf_category"].get_category_name(),
                    transform=None
                )
            else:
                raise UnsupportedTransformLanguageError(f"Unsupported transform language: {request.validated_data['transform_language']}")

            result = invoke_transformation_expert(expert, task)

            return result
    
    def _validate(self, transform_taks: TransformTask) -> ValidationReportTransform:
        # Create the validator
        validator = OcsfV1_1_0TransformValidator(transform_task=transform_taks)

        # Validate the transform
        report = validator.validate()

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
            category_name = request.validated_data["ocsf_category"].get_category_name()
            
            expert = get_analysis_expert(OcsfVersion.V1_1_0, category_name)

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
                ocsf_category_name=request.validated_data["ocsf_category"].get_category_name()
            )

            system_message = expert.system_prompt_factory(
                input_entry=request.validated_data["input_entry"],
                mapping_list=request.validated_data["mappings"]
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
                        entity=Entity(
                            value=raw_mapping["entity"]["value"],
                            description=raw_mapping["entity"]["description"]
                        ),
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