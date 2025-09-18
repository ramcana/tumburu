import * as React from 'react';
import Button from '../ui/Button';

type ReferenceAudioUploadProps = {
  onUpload: (file: File) => void;
  uploading: boolean;
  progress: number;
};

const ReferenceAudioUpload: React.FC<ReferenceAudioUploadProps> = ({ onUpload, uploading, progress }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`border-2 border-dashed rounded p-4 text-center ${dragActive ? 'border-accent bg-pink-50' : 'border-gray-300'}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={e => e.target.files && onUpload(e.target.files[0])}
      />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? `Uploading... (${progress}%)` : 'Upload Reference Audio'}
      </Button>
      <div className="text-xs text-gray-500 mt-2">or drag and drop</div>
    </div>
  );
};
export default ReferenceAudioUpload;