from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from playground_api.views import TransformerHeuristicCreateView, TransformerCategorizeV1_1_0View


urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('transformer/heuristic/create/', TransformerHeuristicCreateView.as_view(), name='transformer_heuristic_create'),
    path('transformer/categorize/v1_1_0/', TransformerCategorizeV1_1_0View.as_view(), name='transformer_categorize_v1_1_0'),
]