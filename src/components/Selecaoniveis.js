import React, { useState } from 'react';
import './Selecaoniveis.css';

const NIVEIS = [
  { id: 1, nome: 'Nível 1', descricao: 'Primeiros passos no espaço', dificuldade: 'Fácil' },
  { id: 2, nome: 'Nível 2', descricao: 'A batalha esquenta', dificuldade: 'Médio' },
  { id: 3, nome: 'Nível 3', descricao: 'Encontro com o chefão', dificuldade: 'Difícil' },
];

const ITENS_LOJA = [
  {
    id: 'escudo',
    nome: 'Escudo',
    descricao: 'Bloqueia 1 hit de dano',
    icone: '🛡️',
    preco: 50,
  },
  {
    id: 'vida_extra',
    nome: 'Vida Extra',
    descricao: '+1 vida no início do nível',
    icone: '❤️',
    preco: 80,
  },
  {
    id: 'tiro_duplo',
    nome: 'Tiro Duplo',
    descricao: 'Atira 2 projéteis por vez',
    icone: '💥',
    preco: 120,
  },
];

export default function SelecaoNiveis({
  moedas = 0,
  nivelMaximoDesbloqueado = 1,
  itensComprados = [],
  onSelecionarNivel,
  onComprarItem,
  onVoltar,
}) {
  const [aba, setAba] = useState('niveis'); // 'niveis' | 'loja'

  const jaTemItem = (id) => itensComprados.includes(id);

  return (
    <div className="selecao-niveis">
      <div className="selecao-niveis__bg-placeholder" />

      <div className="selecao-niveis__header">
        {onVoltar && (
          <button className="botao-voltar" onClick={onVoltar}>◀</button>
        )}
        <h1 className="selecao-niveis__titulo">Cosmic Pups</h1>
        <div className="selecao-niveis__moedas">🦴 {moedas}</div>
      </div>

      <div className="selecao-niveis__tabs">
        <button
          className={`tab ${aba === 'niveis' ? 'tab--ativa' : ''}`}
          onClick={() => setAba('niveis')}
        >
          Níveis
        </button>
        <button
          className={`tab ${aba === 'loja' ? 'tab--ativa' : ''}`}
          onClick={() => setAba('loja')}
        >
          Loja
        </button>
      </div>

      {aba === 'niveis' && (
        <div className="niveis-grid">
          {NIVEIS.map((nivel) => {
            const bloqueado = nivel.id > nivelMaximoDesbloqueado;
            return (
              <button
                key={nivel.id}
                className={`nivel-card ${bloqueado ? 'nivel-card--bloqueado' : ''}`}
                disabled={bloqueado}
                onClick={() => onSelecionarNivel && onSelecionarNivel(nivel.id)}
              >
                {bloqueado && <div className="nivel-card__cadeado">🔒</div>}
                <span className="nivel-card__nome">{nivel.nome}</span>
                <span className="nivel-card__dificuldade">{nivel.dificuldade}</span>
                <span className="nivel-card__descricao">{nivel.descricao}</span>
              </button>
            );
          })}
        </div>
      )}

      {aba === 'loja' && (
        <div className="loja-grid">
          {ITENS_LOJA.map((item) => {
            const comprado = jaTemItem(item.id);
            const podeComprar = moedas >= item.preco && !comprado;
            return (
              <div key={item.id} className="item-card">
                <div className="item-card__icone">{item.icone}</div>
                <span className="item-card__nome">{item.nome}</span>
                <span className="item-card__descricao">{item.descricao}</span>
                <button
                  className={`item-card__botao ${comprado ? 'item-card__botao--comprado' : ''}`}
                  disabled={!podeComprar}
                  onClick={() => onComprarItem && onComprarItem(item)}
                >
                  {comprado ? 'Comprado' : `🦴 ${item.preco}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}