from rest_framework import viewsets
from .models import Nivel, Item
from .serializers import NivelSerializer, ItemSerializer


class NivelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Nivel.objects.all()
    serializer_class = NivelSerializer


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Item.objects.filter(ativo=True)
    serializer_class = ItemSerializer