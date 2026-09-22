import { useState, useEffect } from 'react';
import StartScreen from './components/Startscreen';
import SelecaoNiveis from './components/Selecaoniveis';
import Combate from './components/Combate';
import ITENS_LOJA from './data/itens';

// Endereço da API do backend Django. Depois, quando for hospedar de
// verdade, troque isso por uma variável de ambiente.
const API_BASE_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [tela, setTela] = useState('inicio'); // 'inicio' | 'selecao' | 'combate'
  const [piloto, setPiloto] = useState(null);
  const [moedas, setMoedas] = useState(100);
  const [itensComprados, setItensComprados] = useState([]);
  const [nivelMaximo, setNivelMaximo] = useState(1);
  const [nivelAtual, setNivelAtual] = useState(null);

  // Lista bruta de níveis vinda da API (array, na ordem cadastrada no admin)
  const [niveisRaw, setNiveisRaw] = useState([]);

  // Versão em mapa (por número do nível, camelCase) usada pelo Combate.js
  const [niveisApi, setNiveisApi] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/niveis/`)
      .then((res) => res.json())
      .then((dados) => {
        setNiveisRaw(dados);

        const mapa = {};
        dados.forEach((item) => {
          mapa[item.numero] = {
            spawnIntervalBase: item.spawn_interval_base,
            enemySpeedBase: item.enemy_speed_base,
            abatesParaVencer: item.abates_para_vencer,
            temChefe: item.tem_chefe,
            chefeVida: item.chefe_vida,
            chanceTanque: item.chance_tanque,
            chanceRapido: item.chance_rapido,
            fundoChave: item.fundo_chave,
          };
        });
        setNiveisApi(mapa);
      })
      .catch((erro) => {
        console.error('Não foi possível buscar os níveis da API:', erro);
      });
  }, []);

  // Lista já no formato que o SelecaoNiveis.js espera pra exibir os cards
  const niveisParaSelecao = niveisRaw.map((item) => ({
    id: item.numero,
    nome: item.nome,
    descricao: item.descricao,
    dificuldade: item.dificuldade,
  }));

  const handleStart = (pilotoEscolhido) => {
    setPiloto(pilotoEscolhido);
    setTela('selecao');
  };

  const handleComprarItem = (item) => {
    if (moedas >= item.preco) {
      setMoedas(moedas - item.preco);
      setItensComprados([...itensComprados, item.id]);
    }
  };

  const handleSelecionarNivel = (nivelId) => {
    setNivelAtual(nivelId);
    setTela('combate');
  };

  const handleVitoriaNivel = (nivelId, moedasGanhas) => {
    setMoedas((atual) => atual + moedasGanhas);
    setNivelMaximo((atual) => Math.max(atual, nivelId + 1));
    setTela('selecao');
  };

  const handleSairCombate = () => {
    setTela('selecao');
  };

  if (tela === 'inicio') return <StartScreen onStart={handleStart} />;

  if (tela === 'combate') {
    return (
      <Combate
        piloto={piloto}
        nivelId={nivelAtual}
        itensComprados={itensComprados}
        niveisApi={niveisApi}
        onVitoria={handleVitoriaNivel}
        onSair={handleSairCombate}
      />
    );
  }

  return (
    <SelecaoNiveis
      moedas={moedas}
      nivelMaximoDesbloqueado={nivelMaximo}
      itensComprados={itensComprados}
      niveis={niveisParaSelecao}
      itensLoja={ITENS_LOJA.filter((item) => item.nivelMinimo <= nivelMaximo)}
      onSelecionarNivel={handleSelecionarNivel}
      onComprarItem={handleComprarItem}
      onVoltar={() => setTela('inicio')}
    />
  );
}

export default App;