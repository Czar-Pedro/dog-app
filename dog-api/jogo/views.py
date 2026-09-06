from rest_framework import viewsets
from .models import Nivel
from .serializers import NivelSerializer


class NivelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Nivel.objects.all()
    serializer_class = NivelSerializer