// Itens da loja, definidos em código (não vêm mais da API/banco).
// nivelMinimo = nível máximo desbloqueado necessário pra esse item
// aparecer na loja (gate de remessas a cada 10 níveis).
// efeito = qual mecânica do jogo esse item ativa (ver itemEffects.js).
//   'escudo'              -> cargas de escudo (vale a maior compra, não soma)
//   'vida_extra'          -> vidas iniciais a mais (soma entre compras)
//   'tiro_duplo/triplo/quadruplo' -> upgrades de tiro (vale o maior comprado)
//   'bonus_moedas'        -> moedas fixas de bônus ao vencer uma fase (soma)
//   'multiplicador_moedas'-> multiplica moedas ganhas por abate (vale o maior)
//   'cooldown'            -> multiplica BALA_COOLDOWN (vale o menor, não soma)
//   'velocidade'          -> multiplica PLAYER_VELOCIDADE (vale o maior, não soma)
//   'escudo_regen'        -> nº de vezes que o escudo recarrega sozinho na fase
//   'revive'              -> nº de revives com 1 vida se for abatido
//   'kit_lendario'        -> combo: escudo(3) + vida_extra(3) + tiro_triplo
const ITENS_LOJA = [
  // ===== Remessa 1 — a partir do nível 1 =====
  { id: 'escudo', nome: 'Escudo', descricao: 'Bloqueia o próximo dano recebido.', icone: '🛡️', preco: 60, nivelMinimo: 1, efeito: 'escudo', valor: 1 },
  { id: 'vida_extra', nome: 'Vida Extra', descricao: 'Começa a fase com uma vida a mais.', icone: '❤️', preco: 80, nivelMinimo: 1, efeito: 'vida_extra', valor: 1 },
  { id: 'tiro_duplo', nome: 'Tiro Duplo', descricao: 'Atira dois projéteis de uma vez.', icone: '🔫', preco: 120, nivelMinimo: 1, efeito: 'tiro_duplo', valor: 1 },
  { id: 'escudo_2', nome: 'Escudo Reforçado', descricao: 'O escudo bloqueia 2 impactos antes de sumir.', icone: '🛡️', preco: 150, nivelMinimo: 1, efeito: 'escudo', valor: 2 },
  { id: 'moedas_5', nome: 'Bolsa de Moedas', descricao: '+5 moedas de bônus ao concluir uma fase.', icone: '💰', preco: 70, nivelMinimo: 1, efeito: 'bonus_moedas', valor: 5 },
  { id: 'vida_extra_2', nome: 'Fôlego Extra', descricao: 'Começa a fase com duas vidas a mais.', icone: '❤️', preco: 180, nivelMinimo: 1, efeito: 'vida_extra', valor: 2 },
  { id: 'cooldown_1', nome: 'Gatilho Leve', descricao: 'Reduz um pouco o tempo entre tiros.', icone: '⚡', preco: 140, nivelMinimo: 1, efeito: 'cooldown', valor: 0.9 },
  { id: 'moedas_10', nome: 'Baú Pequeno', descricao: '+10 moedas de bônus ao concluir uma fase.', icone: '🪙', preco: 150, nivelMinimo: 1, efeito: 'bonus_moedas', valor: 10 },
  { id: 'velocidade_1', nome: 'Motor Ajustado', descricao: 'Aumenta um pouco a velocidade da nave.', icone: '💨', preco: 170, nivelMinimo: 1, efeito: 'velocidade', valor: 1.1 },
  { id: 'tiro_duplo_2', nome: 'Tiro Duplo Rápido', descricao: 'Tiro duplo com cooldown reduzido.', icone: '🔫', preco: 240, nivelMinimo: 1, efeito: 'tiro_duplo', valor: 2 },

  // ===== Remessa 2 — a partir do nível 11 =====
  { id: 'escudo_3', nome: 'Escudo de Batalha', descricao: 'O escudo bloqueia 3 impactos antes de sumir.', icone: '🛡️', preco: 320, nivelMinimo: 11, efeito: 'escudo', valor: 3 },
  { id: 'vida_extra_3', nome: 'Coração Blindado', descricao: 'Começa a fase com três vidas a mais.', icone: '❤️', preco: 360, nivelMinimo: 11, efeito: 'vida_extra', valor: 3 },
  { id: 'moedas_20', nome: 'Baú Médio', descricao: '+20 moedas de bônus ao concluir uma fase.', icone: '🪙', preco: 280, nivelMinimo: 11, efeito: 'bonus_moedas', valor: 20 },
  { id: 'cooldown_2', nome: 'Gatilho Ágil', descricao: 'Reduz bastante o tempo entre tiros.', icone: '⚡', preco: 340, nivelMinimo: 11, efeito: 'cooldown', valor: 0.75 },
  { id: 'velocidade_2', nome: 'Turbo', descricao: 'Aumenta bastante a velocidade da nave.', icone: '💨', preco: 330, nivelMinimo: 11, efeito: 'velocidade', valor: 1.25 },
  { id: 'ima_moedas', nome: 'Ímã de Moedas', descricao: 'Aumenta as moedas ganhas por abate.', icone: '🧲', preco: 350, nivelMinimo: 11, efeito: 'multiplicador_moedas', valor: 1.2 },
  { id: 'escudo_regen', nome: 'Escudo Regenerativo', descricao: 'O escudo recarrega uma vez durante a fase.', icone: '🔄', preco: 400, nivelMinimo: 11, efeito: 'escudo_regen', valor: 1 },
  { id: 'vida_extra_4', nome: 'Coração de Ferro', descricao: 'Começa a fase com quatro vidas a mais.', icone: '❤️', preco: 420, nivelMinimo: 11, efeito: 'vida_extra', valor: 4 },
  { id: 'tiro_triplo', nome: 'Tiro Triplo', descricao: 'Atira três projéteis de uma vez.', icone: '🔫', preco: 440, nivelMinimo: 11, efeito: 'tiro_triplo', valor: 1 },
  { id: 'moedas_35', nome: 'Baú Grande', descricao: '+35 moedas de bônus ao concluir uma fase.', icone: '🪙', preco: 380, nivelMinimo: 11, efeito: 'bonus_moedas', valor: 35 },

  // ===== Remessa 3 — a partir do nível 21 =====
  { id: 'escudo_5', nome: 'Escudo Lendário', descricao: 'O escudo bloqueia 5 impactos antes de sumir.', icone: '🛡️', preco: 520, nivelMinimo: 21, efeito: 'escudo', valor: 5 },
  { id: 'vida_extra_5', nome: 'Coração de Aço', descricao: 'Começa a fase com cinco vidas a mais.', icone: '❤️', preco: 560, nivelMinimo: 21, efeito: 'vida_extra', valor: 5 },
  { id: 'cooldown_3', nome: 'Gatilho Lendário', descricao: 'Reduz ao máximo o tempo entre tiros.', icone: '⚡', preco: 580, nivelMinimo: 21, efeito: 'cooldown', valor: 0.6 },
  { id: 'velocidade_3', nome: 'Turbo Lendário', descricao: 'Velocidade máxima da nave.', icone: '💨', preco: 540, nivelMinimo: 21, efeito: 'velocidade', valor: 1.4 },
  { id: 'ima_moedas_2', nome: 'Ímã de Moedas+', descricao: 'Aumenta ainda mais as moedas ganhas por abate.', icone: '🧲', preco: 570, nivelMinimo: 21, efeito: 'multiplicador_moedas', valor: 1.4 },
  { id: 'tiro_quadruplo', nome: 'Tiro Quádruplo', descricao: 'Atira quatro projéteis de uma vez.', icone: '🔫', preco: 650, nivelMinimo: 21, efeito: 'tiro_quadruplo', valor: 1 },
  { id: 'moedas_50', nome: 'Baú Lendário', descricao: '+50 moedas de bônus ao concluir uma fase.', icone: '🪙', preco: 500, nivelMinimo: 21, efeito: 'bonus_moedas', valor: 50 },
  { id: 'revive', nome: 'Segunda Chance', descricao: 'Revive uma vez com 1 vida se for abatido.', icone: '✨', preco: 700, nivelMinimo: 21, efeito: 'revive', valor: 1 },
  { id: 'escudo_regen_2', nome: 'Escudo Regenerativo+', descricao: 'O escudo recarrega duas vezes durante a fase.', icone: '🔄', preco: 620, nivelMinimo: 21, efeito: 'escudo_regen', valor: 2 },
  { id: 'kit_completo', nome: 'Kit do Piloto Lendário', descricao: 'Combina escudo forte, vida extra e tiro triplo.', icone: '👑', preco: 800, nivelMinimo: 21, efeito: 'kit_lendario', valor: 1 },
];

export default ITENS_LOJA;