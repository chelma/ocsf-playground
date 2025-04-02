import logging
import uuid

from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from langchain_core.messages import HumanMessage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend.regex_expert.expert_def import get_regex_expert, invoke_regex_expert
from backend.regex_expert.task_def import RegexTask
from backend.regex_expert.parameters import RegexFlavor

from .serializers import (TransformerHeuristicCreateRequestSerializer, TransformerHeuristicCreateResponseSerializer)


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

        regex_id = str(uuid.uuid4())

        # Perform the transformation
        try:
            result = self._create_regex(regex_id, requestSerializer)
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

    def _create_regex(self, regex_id: str, request: TransformerHeuristicCreateRequestSerializer) -> RegexTask:
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
                task_id=regex_id,
                input=request.validated_data["input_entry"],
                context=turns,
                regex=None
            )

            result = invoke_regex_expert(expert, regex_task)

            return result