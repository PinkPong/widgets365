import { useState } from 'react';
import logo from './logo.png';
import { StApp, StHeader } from './styled-ui';
import { Uploader } from './components/Uploader';
import { ResultsViewer } from './components/ResultsViewer';
import { LogViewer } from './components/LogViewer';

const App = () => {
  const [results, setResults] = useState(null);
  return (
    <StApp>
      <StHeader>
        <img src={logo} alt="logo" />
      </StHeader>
      <Uploader onComplete={setResults}/>
      <ResultsViewer {...{results}} />
      <LogViewer />
    </StApp>
  );
}

export default App;
