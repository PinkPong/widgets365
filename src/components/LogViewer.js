import { useState, useEffect } from 'react';
import { StResultsWrapper, StInfoMessage, StCode } from '../styled-ui';

const LogViewer = ({ results }) => {
    const [detailedResults, setDetailedResults] = useState(null);
    useEffect(() => {
        const { filePath } = results;
        fetch('/api/detailedinfo', { 
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath })
        })
        .then(response => response.text())
        .then(text => setDetailedResults(text))
        .catch(error => console.error(error));
    }, [results]);

    return (
        <StResultsWrapper>
            <h2>Scan errors</h2>
            <StInfoMessage>
                <p>we encountered some errors while scanning your log file.
                please check the logs below for more details...</p>
                <StCode>
                    {detailedResults || 'loading...'}
                </StCode>
            </StInfoMessage>
        </StResultsWrapper>
    );
}

export { LogViewer };
