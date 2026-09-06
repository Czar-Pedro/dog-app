import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Combate.css';
import inimigo1Img from '../static/inimigo1.png';
import tanqueImg from '../static/tank.png';
import fundoImg from '../static/bgcombate.jpeg';

import aviaoSolImg from '../static/aviaoSol.png';
import aviaoLunaImg from '../static/aviaoLuna.png';

// Configuração de dificuldade por nível
const CONFIG_NIVEL = {
  1: { spawnIntervalBase: 1300, enemySpeedBase: 90, abatesParaVencer: 15, temChefe: false, chefeVida: 0 },
  2: { spawnIntervalBase: 1000, enemySpeedBase: 120, abatesParaVencer: 20, temChefe: false, chefeVida: 0 },
  3: { spawnIntervalBase: 850, enemySpeedBase: 140, abatesParaVencer: 12, temChefe: true, chefeVida: 26 },
};

const SPRITES_COMBATE_POR_PILOTO = {
  sol: aviaoSolImg,
  luna: aviaoLunaImg,
};

// Fator de escala geral do jogo (tamanho da tela e velocidades)
const ESCALA = 2;

// Fator EXTRA só pro tamanho visual da nave do jogador.
const FATOR_JOGADOR = 1.7;

// Fator EXTRA pro tamanho dos inimigos comuns, tanques e chefe — mais alto
// que o do jogador, porque eles ainda estavam pequenos demais.
const FATOR_INIMIGO = 3.2;

const LARGURA = Math.round(480 * ESCALA);
const ALTURA = Math.round(680 * ESCALA);
const PLAYER_TAMANHO = Math.round(48 * ESCALA * FATOR_JOGADOR);
const PLAYER_VELOCIDADE = Math.round(260 * ESCALA);
const BALA_VELOCIDADE = Math.round(420 * ESCALA);
const BALA_COOLDOWN = 260;
const SPRITES_INIMIGO = [inimigo1Img];

export default function Combate({ piloto, nivelId, itensComprados = [], niveisApi = {}, onVitoria, onDerrota, onSair }) {
  const canvasRef = useRef(null);
  const imgPilotoRef = useRef(null);
  const imgsInimigoRef = useRef([]);
  const imgTanqueRef = useRef(null);
  const imgChefeRef = useRef(null);
  const imgFundoRotacionadoRef = useRef(null);

  // Estado mutável do jogo (não causa re-render a cada frame)
  const gameRef = useRef(null);

  // Estado visível na UI (HUD) — atualizado só quando muda de fato
  const [vidas, setVidas] = useState(3);
  const [abates, setAbates] = useState(0);
  const [moedasRodada, setMoedasRodada] = useState(0);
  const [fase, setFase] = useState('jogando'); // 'jogando' | 'vitoria' | 'derrota'
  const [chefe, setChefe] = useState(null); // { vida, vidaMax } | null
  const [escudoAtivo, setEscudoAtivo] = useState(itensComprados.includes('escudo'));

  // Prioriza o nível vindo da API do Django; se ainda não chegou
  // (ou a API estiver fora do ar), usa os valores fixos como plano B.
  const config = niveisApi[nivelId] || CONFIG_NIVEL[nivelId] || CONFIG_NIVEL[1];

  const inicializarJogo = useCallback(() => {
    const vidaBase = 3 + (itensComprados.includes('vida_extra') ? 1 : 0);
    gameRef.current = {
      player: { x: LARGURA / 2 - PLAYER_TAMANHO / 2, y: ALTURA - PLAYER_TAMANHO - Math.round(24 * ESCALA), w: PLAYER_TAMANHO, h: PLAYER_TAMANHO },
      teclas: {},
      balas: [],
      balasInimigo: [],
      inimigos: [],
      chefe: null,
      ultimoTiro: 0,
      espacoApertadoAntes: false,
      ultimoSpawn: 0,
      tempo: 0,
      abates: 0,
      vidas: vidaBase,
      moedas: 0,
      escudo: itensComprados.includes('escudo'),
      tiroDuplo: itensComprados.includes('tiro_duplo'),
      spawnChefeFeito: false,
      terminou: false,
    };
    setVidas(vidaBase);
    setAbates(0);
    setMoedasRodada(0);
    setChefe(null);
    setEscudoAtivo(itensComprados.includes('escudo'));
    setFase('jogando');
  }, [itensComprados]);

  useEffect(() => {
    inicializarJogo();
  }, [inicializarJogo]);

  // Carrega o sprite do piloto em combate (avião do sol ou da luna)
  useEffect(() => {
    const spriteCombate = SPRITES_COMBATE_POR_PILOTO[piloto?.id] || piloto?.sprite;
    if (spriteCombate) {
      const img = new Image();
      img.src = spriteCombate;
      imgPilotoRef.current = img;
    }
  }, [piloto]);

  // Pré-carrega sprites de inimigos comuns, tanque, chefe e fundo (já rotacionado 90°)
  useEffect(() => {
    imgsInimigoRef.current = SPRITES_INIMIGO.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const tanque = new Image();
    tanque.src = tanqueImg;
    imgTanqueRef.current = tanque;

    // Sem imagem de chefe ainda — fica no placeholder (retângulo roxo) até você adicionar o arquivo

    // Gira a imagem de fundo (horizontal) 90° e desenha num canvas offscreen,
    // que passa a ser usado no lugar da imagem original ao desenhar/rolar o fundo.
    const fundo = new Image();
    fundo.onload = () => {
      const canvasRot = document.createElement('canvas');
      canvasRot.width = fundo.height;  // após girar, a largura vira a altura original
      canvasRot.height = fundo.width;  // e a altura vira a largura original
      const ctxRot = canvasRot.getContext('2d');
      ctxRot.translate(canvasRot.width / 2, canvasRot.height / 2);
      ctxRot.rotate(Math.PI / 2); // 90° no sentido horário
      ctxRot.drawImage(fundo, -fundo.width / 2, -fundo.height / 2);
      imgFundoRotacionadoRef.current = canvasRot;
    };
    fundo.src = fundoImg;
  }, []);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (gameRef.current) gameRef.current.teclas[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e) => {
      if (gameRef.current) gameRef.current.teclas[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const tomarDano = useCallback((g) => {
    if (g.escudo) {
      g.escudo = false;
      setEscudoAtivo(false);
      return;
    }
    g.vidas -= 1;
    setVidas(g.vidas);
    if (g.vidas <= 0 && !g.terminou) {
      g.terminou = true;
      setFase('derrota');
    }
  }, []);

  // Loop principal do jogo
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let ultimoFrame = performance.now();

    const loop = (agora) => {
      const dt = Math.min((agora - ultimoFrame) / 1000, 0.05);
      ultimoFrame = agora;
      const g = gameRef.current;

      if (g && !g.terminou) {
        atualizar(g, dt, agora);
      }
      desenhar(ctx, g);

      animId = requestAnimationFrame(loop);
    };

    const atualizar = (g, dt, agora) => {
      g.tempo += dt * 1000;

      // Movimento do player
      const t = g.teclas;
      let dx = 0, dy = 0;
      if (t['a'] || t['arrowleft']) dx -= 1;
      if (t['d'] || t['arrowright']) dx += 1;
      if (t['w'] || t['arrowup']) dy -= 1;
      if (t['s'] || t['arrowdown']) dy += 1;
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      g.player.x = Math.max(0, Math.min(LARGURA - g.player.w, g.player.x + dx * PLAYER_VELOCIDADE * dt));
      g.player.y = Math.max(0, Math.min(ALTURA - g.player.h, g.player.y + dy * PLAYER_VELOCIDADE * dt));

      // Tiro do player — só dispara no momento em que a tecla é apertada
      // (borda de subida), nunca enquanto ela fica segurada. Isso impede
      // que segurar o espaço vire tiro automático.
      const espacoApertadoAgora = !!t[' '];
      const apertouAgora = espacoApertadoAgora && !g.espacoApertadoAntes;
      g.espacoApertadoAntes = espacoApertadoAgora;

      if (apertouAgora && agora - g.ultimoTiro > BALA_COOLDOWN) {
        g.ultimoTiro = agora;
        const cx = g.player.x + g.player.w / 2;
        const cy = g.player.y;
        const balaW = Math.round(6 * ESCALA);
        const balaH = Math.round(14 * ESCALA);
        if (g.tiroDuplo) {
          g.balas.push({ x: cx - Math.round(14 * ESCALA), y: cy, w: balaW, h: balaH });
          g.balas.push({ x: cx + Math.round(8 * ESCALA), y: cy, w: balaW, h: balaH });
        } else {
          g.balas.push({ x: cx - Math.round(3 * ESCALA), y: cy, w: balaW, h: balaH });
        }
      }

      // Atualiza balas do player
      g.balas = g.balas.filter((b) => b.y > -20);
      g.balas.forEach((b) => { b.y -= BALA_VELOCIDADE * dt; });

      // Atualiza balas do chefe
      g.balasInimigo = g.balasInimigo.filter((b) => b.y < ALTURA + 20);
      g.balasInimigo.forEach((b) => { b.y += b.vel * dt; b.x += (b.vx || 0) * dt; });

      // Spawn de inimigos comuns (pausa spawn se o chefe estiver ativo)
      const spawnInterval = Math.max(400, config.spawnIntervalBase - g.abates * 15);
      if (!g.chefe && g.tempo - g.ultimoSpawn > spawnInterval) {
        g.ultimoSpawn = g.tempo;
        const ehTanque = nivelId >= 2 && Math.random() < 0.25;
        const inimigoTam = Math.round((ehTanque ? 46 : 36) * ESCALA * FATOR_INIMIGO);
        g.inimigos.push({
          x: Math.random() * (LARGURA - inimigoTam),
          y: -inimigoTam,
          w: inimigoTam,
          h: inimigoTam,
          vy: config.enemySpeedBase * ESCALA * (ehTanque ? 0.7 : 1) * (0.85 + Math.random() * 0.3),
          hp: ehTanque ? 2 : 1,
          hpMax: ehTanque ? 2 : 1,
          spriteIndex: ehTanque ? -1 : Math.floor(Math.random() * SPRITES_INIMIGO.length), // -1 = usa sprite de tanque
          fase: Math.random() * Math.PI * 2,
          baseX: 0,
        });
        g.inimigos[g.inimigos.length - 1].baseX = g.inimigos[g.inimigos.length - 1].x;
      }

      // Spawn do chefe (nível 3)
      if (config.temChefe && !g.spawnChefeFeito && g.abates >= config.abatesParaVencer) {
        g.spawnChefeFeito = true;
        g.inimigos = [];
        const chefeW = Math.round(120 * ESCALA * FATOR_INIMIGO);
        const chefeH = Math.round(90 * ESCALA * FATOR_INIMIGO);
        g.chefe = {
          x: LARGURA / 2 - chefeW / 2,
          y: Math.round(40 * ESCALA),
          w: chefeW,
          h: chefeH,
          hp: config.chefeVida,
          hpMax: config.chefeVida,
          dir: 1,
          ultimoTiro: g.tempo,
        };
        setChefe({ vida: g.chefe.hp, vidaMax: g.chefe.hpMax });
      }

      // Move inimigos comuns
      g.inimigos.forEach((e) => {
        e.y += e.vy * dt;
        e.x = e.baseX + Math.sin(g.tempo / 500 + e.fase) * Math.round(30 * ESCALA);
      });
      // Inimigo passou do fundo -> dano no player
      g.inimigos.forEach((e) => {
        if (e.y > ALTURA && !e.saiu) {
          e.saiu = true;
          tomarDano(g);
        }
      });
      g.inimigos = g.inimigos.filter((e) => !e.saiu);

      // Move o chefe e faz ele atirar
      if (g.chefe) {
        const c = g.chefe;
        const limiteBorda = Math.round(20 * ESCALA);
        c.x += c.dir * Math.round(70 * ESCALA) * dt;
        if (c.x < limiteBorda) c.dir = 1;
        if (c.x + c.w > LARGURA - limiteBorda) c.dir = -1;
        if (g.tempo - c.ultimoTiro > 900) {
          c.ultimoTiro = g.tempo;
          const balaChefeW = Math.round(8 * ESCALA);
          const balaChefeH = Math.round(16 * ESCALA);
          g.balasInimigo.push({ x: c.x + c.w / 2 - Math.round(4 * ESCALA), y: c.y + c.h, w: balaChefeW, h: balaChefeH, vel: Math.round(220 * ESCALA), vx: 0 });
          g.balasInimigo.push({ x: c.x + Math.round(16 * ESCALA), y: c.y + c.h, w: balaChefeW, h: balaChefeH, vel: Math.round(200 * ESCALA), vx: Math.round(-40 * ESCALA) });
          g.balasInimigo.push({ x: c.x + c.w - Math.round(16 * ESCALA), y: c.y + c.h, w: balaChefeW, h: balaChefeH, vel: Math.round(200 * ESCALA), vx: Math.round(40 * ESCALA) });
        }
      }

      // Colisão: balas do player x inimigos comuns
      g.balas.forEach((b) => {
        g.inimigos.forEach((e) => {
          if (!b.atingiu && !e.morto && colide(b, e)) {
            b.atingiu = true;
            e.hp -= 1;
            if (e.hp <= 0) {
              e.morto = true;
              g.abates += 1;
              const moedasGanhas = e.hpMax > 1 ? 6 : 3;
              g.moedas += moedasGanhas;
              setAbates(g.abates);
              setMoedasRodada(g.moedas);
            }
          }
        });
      });
      g.balas = g.balas.filter((b) => !b.atingiu);
      g.inimigos = g.inimigos.filter((e) => !e.morto);

      // Colisão: balas do player x chefe
      if (g.chefe) {
        g.balas.forEach((b) => {
          if (!b.atingiu && colide(b, g.chefe)) {
            b.atingiu = true;
            g.chefe.hp -= 1;
            setChefe({ vida: g.chefe.hp, vidaMax: g.chefe.hpMax });
            if (g.chefe.hp <= 0) {
              g.moedas += 80;
              setMoedasRodada(g.moedas);
              g.chefe = null;
              setChefe(null);
              if (!g.terminou) {
                g.terminou = true;
                setFase('vitoria');
              }
            }
          }
        });
        g.balas = g.balas.filter((b) => !b.atingiu);
      }

      // Colisão: inimigos comuns x player
      g.inimigos.forEach((e) => {
        if (!e.morto && colide(e, g.player)) {
          e.morto = true;
          tomarDano(g);
        }
      });
      g.inimigos = g.inimigos.filter((e) => !e.morto);

      // Colisão: balas do chefe x player
      g.balasInimigo.forEach((b) => {
        if (!b.atingiu && colide(b, g.player)) {
          b.atingiu = true;
          tomarDano(g);
        }
      });
      g.balasInimigo = g.balasInimigo.filter((b) => !b.atingiu);

      // Vitória sem chefe: atingiu meta de abates
      if (!config.temChefe && g.abates >= config.abatesParaVencer && !g.terminou) {
        g.terminou = true;
        setFase('vitoria');
      }
    };

    const desenhar = (ctx, g) => {
      // Fundo (já rotacionado 90°) com scroll vertical contínuo
      if (imgFundoRotacionadoRef.current) {
        const vel = 60; // px/s — ajuste a velocidade do scroll aqui
        const offset = ((g ? g.tempo : 0) * (vel / 1000)) % ALTURA;
        ctx.drawImage(imgFundoRotacionadoRef.current, 0, offset - ALTURA, LARGURA, ALTURA);
        ctx.drawImage(imgFundoRotacionadoRef.current, 0, offset, LARGURA, ALTURA);
      } else {
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, LARGURA, ALTURA);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97) % LARGURA;
        const sy = (i * 53 + (g ? g.tempo * 0.03 : 0)) % ALTURA;
        ctx.fillRect(sx, sy, Math.round(2 * ESCALA), Math.round(2 * ESCALA));
      }
      if (!g) return;

      // Player
      const p = g.player;
      if (imgPilotoRef.current && imgPilotoRef.current.complete) {
        ctx.drawImage(imgPilotoRef.current, p.x, p.y, p.w, p.h);
      } else {
        ctx.fillStyle = '#FF6B9D';
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
      if (g.escudo) {
        ctx.strokeStyle = '#AEE1FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Balas do player
      ctx.fillStyle = '#FFD37A';
      g.balas.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Balas inimigas
      ctx.fillStyle = '#FF6B6B';
      g.balasInimigo.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Inimigos comuns (spriteIndex -1 = tanque, senão = inimigo1)
      g.inimigos.forEach((e) => {
        const img = e.spriteIndex === -1 ? imgTanqueRef.current : imgsInimigoRef.current[e.spriteIndex];
        if (img && img.complete) {
          ctx.drawImage(img, e.x, e.y, e.w, e.h);
        } else {
          ctx.fillStyle = '#FF9EC4';
          ctx.beginPath();
          ctx.roundRect(e.x, e.y, e.w, e.h, 8);
          ctx.fill();
        }
      });

      // Chefe
      if (g.chefe) {
        const c = g.chefe;
        if (imgChefeRef.current && imgChefeRef.current.complete) {
          ctx.drawImage(imgChefeRef.current, c.x, c.y, c.w, c.h);
        } else {
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.roundRect(c.x, c.y, c.w, c.h, 16);
          ctx.fill();
        }
      }
    };

    const colide = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [config, nivelId, tomarDano]);

  const handleVitoria = () => {
    onVitoria && onVitoria(nivelId, gameRef.current?.moedas || 0);
  };

  return (
    <div className="combate">
      <div className="combate__hud">
        <button className="combate__botao-sair" onClick={onSair}>◀ Sair</button>
        <div className="combate__vidas">
          {Array.from({ length: vidas }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
          {escudoAtivo && <span title="Escudo ativo">🛡️</span>}
        </div>
        <div className="combate__info">
          <span>🦴 {moedasRodada}</span>
          {!config.temChefe && <span>Abates: {abates}/{config.abatesParaVencer}</span>}
        </div>
      </div>

      {chefe && (
        <div className="combate__barra-chefe">
          <div className="combate__barra-chefe-preenchimento" style={{ width: `${(chefe.vida / chefe.vidaMax) * 100}%` }} />
        </div>
      )}

      <div className="combate__area-jogo">
        <canvas ref={canvasRef} width={LARGURA} height={ALTURA} className="combate__canvas" />

        {fase === 'vitoria' && (
          <div className="combate__overlay">
            <h2>Nível concluído! 🎉</h2>
            <p>Você ganhou 🦴 {gameRef.current?.moedas || 0} moedas</p>
            <button className="combate__botao-principal" onClick={handleVitoria}>Continuar</button>
          </div>
        )}

        {fase === 'derrota' && (
          <div className="combate__overlay">
            <h2>Foi abatido! 💥</h2>
            <p>Tente novamente</p>
            <div className="combate__botoes-derrota">
              <button className="combate__botao-principal" onClick={inicializarJogo}>Tentar de novo</button>
              <button className="combate__botao-secundario" onClick={onSair}>Sair</button>
            </div>
          </div>
        )}
      </div>

      <p className="combate__dica">WASD para mover · ESPAÇO para atirar</p>
    </div>
  );
}