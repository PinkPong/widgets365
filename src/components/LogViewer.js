import { StResultsWrapper, StInfoMessage, StCode } from '../styled-ui';

const LogViewer = ({ results }) => {
    const { detailedResults } = results;
    return (
        <StResultsWrapper>
            <h2>Log scan error details</h2>
            <StInfoMessage>
                <p>we encountered some errors while scanning your log file.
                please check the logs below for more details...</p>
                <StCode>
                    <pre>
                        {detailedResults || 'loading...'}
                    </pre>
                </StCode>
            </StInfoMessage>
        </StResultsWrapper>
    );
}

export { LogViewer };
