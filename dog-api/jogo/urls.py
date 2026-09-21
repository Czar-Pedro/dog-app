from rest_framework.routers import DefaultRouter
from .views import NivelViewSet, ItemViewSet

router = DefaultRouter()
router.register('niveis', NivelViewSet)
router.register('itens', ItemViewSet)

urlpatterns = router.urls