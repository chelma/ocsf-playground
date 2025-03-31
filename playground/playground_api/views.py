import logging
import uuid

from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from langchain_core.messages import HumanMessage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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

        # Serialize and return the response
        response_serializer = TransformerHeuristicCreateResponseSerializer(data={
            "new_heuristic": ".*",
            "rationale": "this is a test heuristic"
        })
        if not response_serializer.is_valid():
            logger.error(f"Invalid heuristic creation response: {response_serializer.errors}")
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response_serializer.data, status=status.HTTP_200_OK)
