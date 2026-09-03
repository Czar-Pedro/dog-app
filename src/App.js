import { useState } from 'react';
import StartScreen from './components/Startscreen';
import SelecaoNiveis from './components/Selecaoniveis';

function App() {
  const [tela, setTela] = useState('inicio'); // 'inicio' | 'selecao'
  const [piloto, setPiloto] = useState(null);
  const [moedas, setMoedas] = useState(100);
  const [itensComprados, setItensComprados] = useState([]);
  const [nivelMaximo, setNivelMaximo] = useState(1);

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
    console.log('Jogar nível', nivelId, 'com', piloto);
    // aqui depois entra a tela do jogo em si
  };

  if (tela === 'inicio') return <StartScreen onStart={handleStart} />;

  return (
    <SelecaoNiveis
      moedas={moedas}
      nivelMaximoDesbloqueado={nivelMaximo}
      itensComprados={itensComprados}
      onSelecionarNivel={handleSelecionarNivel}
      onComprarItem={handleComprarItem}
      onVoltar={() => setTela('inicio')}
    />
  );
}

export default App;