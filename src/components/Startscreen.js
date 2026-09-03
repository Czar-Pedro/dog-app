import React, { useState } from 'react';
import luna from '../static/luna.png';
import sol from '../static/sol.png';
import './StartScreen.css';

// Dados dos 2 cachorrinhos pilotos iniciais
// Troque 'sprite' pelos caminhos das suas imagens quando tiver a arte pronta
const PILOTOS = [
  {
    id: 'sol',
    nome: 'sol',
    descricao: 'Piloto veloz e ágil',
    sprite: sol, // ex: '/assets/pilotos/rex.png'
    corTema: '#FFB6C1',
  },
  {
    id: 'luna',
    nome: 'Luna',
    descricao: 'Piloto resistente e forte',
    sprite: luna, // ex: '/assets/pilotos/luna.png'
    corTema: '#AEE1FF',
  },
];

export default function StartScreen({ onStart }) {
  const [selecionado, setSelecionado] = useState(null);

  const handleJogar = () => {
    if (selecionado) {
      onStart(selecionado);
    }
  };

  return (
    <div className="start-screen">
      <div className="start-screen__bg-placeholder" />
      <div className="start-screen__conteudo">

        <h1 className="start-screen__titulo">DOG<span className="letra-destaque">S</span>KY</h1>
        <p className="start-screen__subtitulo">Escolha seu piloto</p>

        <div className="start-screen__pilotos">
          {PILOTOS.map((piloto) => (
            <button
              key={piloto.id}
              className={`piloto-card ${selecionado?.id === piloto.id ? 'piloto-card--selecionado' : ''}`}
              style={{ '--cor-tema': piloto.corTema }}
              onClick={() => setSelecionado(piloto)}
            >
              <div className="piloto-card__sprite">
                {piloto.sprite ? (
                  <img src={piloto.sprite} alt={piloto.nome} />
                ) : (
                  <div className="piloto-card__sprite-placeholder">🐶</div>
                )}
              </div>
              <span className="piloto-card__nome">{piloto.nome}</span>
              <span className="piloto-card__descricao">{piloto.descricao}</span>
            </button>
          ))}
        </div>

        <button
          className="start-screen__botao-jogar"
          disabled={!selecionado}
          onClick={handleJogar}
        >
          Jogar
        </button>

      </div>
    </div>
  );
}