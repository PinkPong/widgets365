import { useState, useRef } from 'react';
import { StUploadForm, StFileInput, StButton, StControlWrapper } from '../styled-ui';
import { Dropzone } from './Dropzone';

const Uploader = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(0);

  const xhrRef = useRef(null);
  const fileInputRef = useRef(null);

  const canCancel = uploadStatus === 1 || file;
  const canUpload = uploadStatus === 0 && file;

  const onFileSelect = (event) => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (event) => {
    console.info('----file change', event.target.files[0]);
    setFile(event.target.files[0]);
  };

  const onDrop = (files) => {
    setFile(files[0]);
  }

  const clearUploadData = () => {
    setUploadStatus(0);
    setProgress(0);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelUpload = () => { 
    console.info('----cancel upload',xhrRef);
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    clearUploadData(); 
  };

  const startUpload = () => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open('POST', '/api/logvalidator');
    xhr.upload.addEventListener('progress', handleUploadProgress);
    xhr.addEventListener('load', ((e) => {
        console.info('upload complete', e.target.responseText);
        clearUploadData();
        onComplete(JSON.parse(e.target.responseText));
    }));

    xhr.addEventListener('error', ((e) => { 
        //console.info('----error uploading', e.target.responseText);
        setUploadStatus(-1);
        onComplete(JSON.parse(e.target.responseText));
    }));

    setUploadStatus(1);
    xhr.send(formData);
  };

  const handleUploadProgress = (event) => {
    const { loaded, total } = event;
    const progress = Math.round((loaded / total) * 100);
    setProgress(progress);
  };

  return (
    <StUploadForm>
      <Dropzone onDrop={onDrop} onClick={onFileSelect} file={file} />
      <StControlWrapper>
        <StFileInput type="file" accept=".txt,.log" ref={fileInputRef} onChange={onFileChange} />
        <StButton onClick={startUpload} disabled={!canUpload}>Upload</StButton>
        <StButton $isCancel={true} onClick={cancelUpload} disabled={!canCancel}>Cancel</StButton>
      </StControlWrapper>
      {progress > 0 && <progress value={progress} max="100" />}
    </StUploadForm>
  );
}

export { Uploader };