import styled from 'styled-components';

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
    min-height: 60px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    color: white;
`;

const StCode = styled.code`
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
`;

const StUploadForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 200px;
 `;

 const StDropZone = styled.div`
  width: 100%;
  height: 100%;
  border: 1px dotted #4285f5;
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

export { 
  StApp,
  StHeader,
  StCode,
  StUploadForm,
  StDropZone,
  StFileInput,
  StButton,
  StControlWrapper
}
