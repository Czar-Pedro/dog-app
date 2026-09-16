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
    FUNDO_CHOICES = [
        ('padrao', 'Padrão'),
        ('noite', 'Noite'),
    ]
    fundo_chave = models.CharField(
        max_length=50,
        choices=FUNDO_CHOICES,
        default='padrao',
        help_text="Precisa bater com uma chave cadastrada em FUNDOS_POR_CHAVE no Combate.js"
    )
    chance_tanque = models.FloatField(
            default=0.0,
            help_text="Probabilidade (0 a 1) de um inimigo comum spawnar como tanque neste nível"
        )

    class Meta:
        ordering = ['numero']

    def __str__(self):
        return f"Nível {self.numero} - {self.nome}"


class Item(models.Model):
    # "chave" é o identificador usado no código do jogo (ex: 'escudo').
    # Diferente do id automático do banco, essa chave não muda nunca,
    # mesmo que você edite o item pelo admin.
    chave = models.SlugField(max_length=50, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.CharField(max_length=200, blank=True, default='')
    icone = models.CharField(max_length=10, default='🎁')
    preco = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ['preco']

    def __str__(self):
        return f"{self.nome} ({self.preco} moedas)"