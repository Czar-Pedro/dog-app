from rest_framework.routers import DefaultRouter
from .views import NivelViewSet

router = DefaultRouter()
router.register('niveis', NivelViewSet)

urlpatterns = router.urls