from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from playground_api.views import (TransformerHeuristicCreateView, TransformerCategorizeV1_1_0View,
                                  TransformerLogicV1_1_0CreateView, TransformerLogicV1_1_0TestView,
                                  TransformerLogicV1_1_0IterateView)


urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('transformer/heuristic/create/', TransformerHeuristicCreateView.as_view(), name='transformer_heuristic_create'),
    path('transformer/categorize/v1_1_0/', TransformerCategorizeV1_1_0View.as_view(), name='transformer_categorize_v1_1_0'),
    path('transformer/logic/v1_1_0/create/', TransformerLogicV1_1_0CreateView.as_view(), name='transformer_logic_v1_1_0_create'),
    path('transformer/logic/v1_1_0/test/', TransformerLogicV1_1_0TestView.as_view(), name='transformer_logic_v1_1_0_test'),
    path('transformer/logic/v1_1_0/iterate/', TransformerLogicV1_1_0IterateView.as_view(), name='transformer_logic_v1_1_0_iterate'),
]