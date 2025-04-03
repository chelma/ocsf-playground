import logging
import uuid

from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from langchain_core.messages import HumanMessage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.categorization_expert.expert_def import get_categorization_expert, invoke_categorization_expert
from backend.categorization_expert.task_def import CategorizationTask
from backend.categorization_expert.parameters import OcsfVersion
from backend.categorization_expert.categories import OcsfCategoriesV1_1_0

from backend.regex_expert.expert_def import get_regex_expert, invoke_regex_expert
from backend.regex_expert.task_def import RegexTask
from backend.regex_expert.parameters import RegexFlavor

from .serializers import (TransformerHeuristicCreateRequestSerializer, TransformerHeuristicCreateResponseSerializer,
                          TransformerCategorizeV1_1_0RequestSerializer, TransformerCategorizeV1_1_0ResponseSerializer)


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
        requestSerializer = TransformerHeuristicCreateRequestSerializer(data=request.data)
        if not requestSerializer.is_valid():
            logger.error(f"Invalid heuristic creation request: {requestSerializer.errors}")
            return Response(requestSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # Perform the task
        try:
            result = self._create_regex(task_id, requestSerializer)
            logger.info(f"Regex creation successful")
            logger.debug(f"Regex value:\n{result.regex.value}")
        except Exception as e:
            logger.error(f"Regex creation failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response_serializer = TransformerHeuristicCreateResponseSerializer(data={
            "new_heuristic": result.regex.value,
            "rationale": result.regex.rationale
        })
        if not response_serializer.is_valid():
            logger.error(f"Invalid heuristic creation response: {response_serializer.errors}")
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response_serializer.data, status=status.HTTP_200_OK)

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

            regex_task = RegexTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=turns,
                regex=None
            )

            result = invoke_regex_expert(expert, regex_task)

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
        requestSerializer = TransformerCategorizeV1_1_0RequestSerializer(data=request.data)
        if not requestSerializer.is_valid():
            logger.error(f"Invalid categorization request: {requestSerializer.errors}")
            return Response(requestSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())

        # # Perform the task
        try:
            result = self._categorize(task_id, requestSerializer)
            logger.info(f"Categorization successful")
            logger.debug(f"Category value:\n{result.category.value}")
        except Exception as e:
            logger.error(f"Categorization failed: {str(e)}")
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize and return the response
        response_serializer = TransformerCategorizeV1_1_0ResponseSerializer(data={
            "ocsf_category":  result.category.value,
            "ocsf_version": OcsfVersion.V1_1_0.value,
            "rationale": result.category.rationale
        })
        if not response_serializer.is_valid():
            logger.error(f"Invalid categorization response: {response_serializer.errors}")
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response_serializer.data, status=status.HTTP_200_OK)

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

            categorization_task = CategorizationTask(
                task_id=task_id,
                input=request.validated_data["input_entry"],
                context=turns,
                category=None
            )

            result = invoke_categorization_expert(expert, categorization_task)

            return result