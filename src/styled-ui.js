import styled from 'styled-components';
import { ReactComponent as Passed } from './assets/passed.svg';
import { ReactComponent as Failed } from './assets/failed.svg';
import { ReactComponent as Warning } from './assets/warning.svg';

const StApp = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100vh;
    background-color: #eee;
`;

const StHeader = styled.header`
    background-color: #fff;
    min-height: 50px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    color: #4285f5;
    margin-bottom: 20px;
    border-bottom: 1px dotted #4285f5;
    border-left: 10px solid #4285f5;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
`;

const StCode = styled.code`
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  border-radius: 5px;
  border: 1px dotted #fff;
  padding: 5px;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  background-color: #668;
  color: #fff;
`;

const StUploadForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 50%;
  height: 200px;
 `;

const StDropZone = styled.div`
  width: 100%;
  height: 100%;
  border: 1px dotted #4285f5;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4285f5;
  cursor: pointer;
  user-select: none;
  background-color: ${(props) => (props.$isDragging ? '#4285f5' : '#fff')};
`;

const StFileInput = styled.input`
  display: none;
`;

const StButton = styled.button`
  color: #fff;
  border: none;
  padding: 10px 30px;
  border-radius: 5px;
  cursor: pointer;
  ${(props) => {
    if (props.disabled) return 'background-color: #ccc; cursor: not-allowed;'
    return props.$isCancel ? 'background-color: #df4027' : 'background-color: #4285f5'
  }};  
`;

const StControlWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 10px 0;
`;

const StPassed = styled(Passed)`
  height: 20px;
  width: 20px;
`;

const StFailed = styled(Failed)`
  height: 20px;
  width: 20px;
`;

const StWarning = styled(Warning)`
  height: 20px;
  width: 20px;
`;

const StResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
  user-select: none;
`;

const StSensorStatus = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 20px;
  grid-gap: 10px;
  width: 100%;
  padding: 5px;
  margin: 2px;
  background-color: #ddd;
  border-radius: 5px;  
  &:nth-child(odd) {
    background-color: #ccc;
  }
  & > div:first-child {
    background-color: #4285f5;
    border-radius: 5px;
    text-align: center;
    color: #fff;
  }
`;

const StInfoMessage = styled.div`
  border: 1px dotted #4285f5;
  border-radius: 5px;
  padding: 20px;
  text-align: left;
  background-color: #fff;
  color: #4285f5;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  align-content: center;
`;

export { 
  StApp,
  StHeader,
  StCode,
  StUploadForm,
  StDropZone,
  StFileInput,
  StButton,
  StControlWrapper,
  StPassed,
  StFailed,
  StWarning,
  StResultsWrapper,
  StSensorStatus,
  StInfoMessage
}
