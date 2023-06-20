import { useState } from 'react';
import logo from './assets/logo.png';
import { StApp, StHeader } from './styled-ui';
import { Uploader } from './components/Uploader';
import { ResultsViewer } from './components/ResultsViewer';
import { LogViewer } from './components/LogViewer';

const App = () => {
  const [results, setResults] = useState(null);
  return (
    <StApp>
      <StHeader>
        <img src={logo} alt="logo" height='40px'/>
        <h2>Log Validator</h2>
      </StHeader>
      <Uploader {...{setResults}}/>
      {results && <ResultsViewer {...{results}}/>}
      {results && results.hasErrors && <LogViewer {...{results}}/>}
    </StApp>
  );
}

export default App;
