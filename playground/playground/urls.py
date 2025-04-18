from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from playground_api.views import (TransformerHeuristicCreateView, TransformerCategorizeV1_1_0View,
                                  TransformerEntitiesV1_1_0AnalyzeView, TransformerEntitiesV1_1_0ExtractView,
                                  TransformerLogicV1_1_0CreateView, TransformerLogicV1_1_0TestView,
                                  TransformerLogicV1_1_0IterateView)


urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('transformer/heuristic/create/', TransformerHeuristicCreateView.as_view(), name='transformer_heuristic_create'),
    path('transformer/categorize/v1_1_0/', TransformerCategorizeV1_1_0View.as_view(), name='transformer_categorize_v1_1_0'),
    path('transformer/entities/v1_1_0/analyze/', TransformerEntitiesV1_1_0AnalyzeView.as_view(), name='transformer_entities_v1_1_0_analyze'),
    path('transformer/entities/v1_1_0/extract/', TransformerEntitiesV1_1_0ExtractView.as_view(), name='transformer_entities_v1_1_0_extract'),
    path('transformer/logic/v1_1_0/create/', TransformerLogicV1_1_0CreateView.as_view(), name='transformer_logic_v1_1_0_create'),
    path('transformer/logic/v1_1_0/test/', TransformerLogicV1_1_0TestView.as_view(), name='transformer_logic_v1_1_0_test'),
    path('transformer/logic/v1_1_0/iterate/', TransformerLogicV1_1_0IterateView.as_view(), name='transformer_logic_v1_1_0_iterate'),
]