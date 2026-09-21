import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from ...models import Nivel


class Command(BaseCommand):
    help = "Cria ou atualiza os níveis a partir de um arquivo niveis.json."

    def add_arguments(self, parser):
        parser.add_argument(
            "--arquivo",
            default="niveis.json",
            help="Caminho para o arquivo JSON. Padrão: niveis.json"
        )

    def handle(self, *args, **options):
        caminho = Path(options["arquivo"])

        if not caminho.exists():
            raise CommandError(f"Arquivo não encontrado: {caminho}")

        try:
            with caminho.open("r", encoding="utf-8") as arquivo:
                dados = json.load(arquivo)
        except json.JSONDecodeError as erro:
            raise CommandError(f"JSON inválido: {erro}")

        if not isinstance(dados, list):
            raise CommandError("O JSON precisa conter uma lista de níveis.")

        campos = [
            "nome",
            "descricao",
            "dificuldade",
            "spawn_interval_base",
            "enemy_speed_base",
            "abates_para_vencer",
            "tem_chefe",
            "chefe_vida",
            "fundo_chave",
            "chance_tanque",
            "chance_rapido",
        ]

        criados = 0
        atualizados = 0

        for item in dados:
            numero = item.get("numero")

            if numero is None:
                raise CommandError(
                    "Encontrado um nível sem o campo 'numero'."
                )

            valores = {
                campo: item[campo]
                for campo in campos
                if campo in item
            }

            nivel, criado = Nivel.objects.update_or_create(
                numero=numero,
                defaults=valores,
            )

            if criado:
                criados += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Criado: Nível {nivel.numero} - {nivel.nome}"
                    )
                )

            else:
                atualizados += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"Atualizado: Nível {nivel.numero} - {nivel.nome}"
                    )
                )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                f"Finalizado: {criados} criados, {atualizados} atualizados."
            )
        )