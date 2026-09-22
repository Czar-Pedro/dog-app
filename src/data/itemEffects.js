import ITENS_LOJA from './itens';

// Calcula o efeito total dos itens comprados, aplicando a regra de cada
// mecânica (algumas somam entre compras, outras só valem a melhor compra).
export function calcularEfeitosItens(itensComprados = []) {
  const comprados = ITENS_LOJA.filter((item) => itensComprados.includes(item.id));

  const efeitos = {
    escudoCargas: 0,
    vidaExtra: 0,
    nivelTiro: 1, // 1 = simples, 2 = duplo, 3 = triplo, 4 = quádruplo
    bonusMoedas: 0,
    multiplicadorMoedas: 1,
    cooldownMultiplicador: 1,
    velocidadeMultiplicador: 1,
    escudoRegenVezes: 0,
    revives: 0,
  };

  comprados.forEach((item) => {
    switch (item.efeito) {
      case 'escudo':
        efeitos.escudoCargas = Math.max(efeitos.escudoCargas, item.valor);
        break;
      case 'vida_extra':
        efeitos.vidaExtra += item.valor;
        break;
      case 'tiro_duplo':
        efeitos.nivelTiro = Math.max(efeitos.nivelTiro, 2);
        break;
      case 'tiro_triplo':
        efeitos.nivelTiro = Math.max(efeitos.nivelTiro, 3);
        break;
      case 'tiro_quadruplo':
        efeitos.nivelTiro = Math.max(efeitos.nivelTiro, 4);
        break;
      case 'bonus_moedas':
        efeitos.bonusMoedas += item.valor;
        break;
      case 'multiplicador_moedas':
        efeitos.multiplicadorMoedas = Math.max(efeitos.multiplicadorMoedas, item.valor);
        break;
      case 'cooldown':
        efeitos.cooldownMultiplicador = Math.min(efeitos.cooldownMultiplicador, item.valor);
        break;
      case 'velocidade':
        efeitos.velocidadeMultiplicador = Math.max(efeitos.velocidadeMultiplicador, item.valor);
        break;
      case 'escudo_regen':
        efeitos.escudoRegenVezes = Math.max(efeitos.escudoRegenVezes, item.valor);
        break;
      case 'revive':
        efeitos.revives = Math.max(efeitos.revives, item.valor);
        break;
      case 'kit_lendario':
        efeitos.escudoCargas = Math.max(efeitos.escudoCargas, 3);
        efeitos.vidaExtra += 3;
        efeitos.nivelTiro = Math.max(efeitos.nivelTiro, 3);
        break;
      default:
        break;
    }
  });

  return efeitos;
}