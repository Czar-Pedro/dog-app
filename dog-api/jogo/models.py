from django.db import models


class Nivel(models.Model):
    numero = models.IntegerField(unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.CharField(max_length=200, blank=True, default='')
    dificuldade = models.CharField(max_length=50, blank=True, default='')
    spawn_interval_base = models.IntegerField(default=1000)
    enemy_speed_base = models.IntegerField(default=100)
    abates_para_vencer = models.IntegerField(default=15)
    tem_chefe = models.BooleanField(default=False)
    chefe_vida = models.IntegerField(default=0)

    class Meta:
        ordering = ['numero']

    def __str__(self):
        return f"Nível {self.numero} - {self.nome}"