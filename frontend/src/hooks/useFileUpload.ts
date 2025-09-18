import * as React from 'react';

export const useFileUpload = (onUpload: (file: File) => Promise<void>) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    await onUpload(file);
    setProgress(100);
    setUploading(false);
  };

  return { uploading, progress, upload };
};