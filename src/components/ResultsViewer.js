import React from 'react';
import { StResultsWrapper, StSensorStatus, StPassed, StFailed, StWarning, StCode } from '../styled-ui';

const ResultsViewer = ({ results }) => {
    const { hasErrors } = results;
    return (
        <StResultsWrapper>
            <h2>Log scan results</h2>
            <StCode>
                log scan status
                {hasErrors ? <StWarning /> : <StPassed />}
            </StCode>
            <StSensorStatus key="reading-title">
                <div>Sensor</div>
                <div>Condition</div>
            </StSensorStatus>
            {
                Object.keys(results)
                .filter(key => key !== 'hasErrors' && key !== 'filePath')
                .map(key => {
                    const value = results[key];
                    return (
                        <StSensorStatus key={key}>
                            <div>{key}</div>
                            <div>{value}</div>
                            {value === 'keep' && <StPassed />}
                            {value === 'discard' && <StFailed />}
                        </StSensorStatus>
                    );
                })
            }
        </StResultsWrapper>
    );
}

export { ResultsViewer };

