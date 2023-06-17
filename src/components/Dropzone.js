import { useState } from 'react';
import { StDropZone } from '../styled-ui';

const Dropzone = ({ onDrop, file, onClick }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    onDrop(files);
  };

  return (
    <StDropZone
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      $isDragging={dragging}
    >
      <div>{file ? file.name : 'Please drop log file here, or click to select it manually'}</div>
    </StDropZone>
  );
};


export { Dropzone };