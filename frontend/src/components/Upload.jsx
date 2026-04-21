import React, { useCallback, useRef } from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';
import { formatBytes } from '../lib/format';

export default function Upload({ compact = false }) {
  const { addFiles, uploading } = useStore();
  const inputRef = useRef(null);

  const handle = useCallback(
    (files) => {
      const arr = Array.from(files || []);
      if (!arr.length) return;
      addFiles(arr);
    },
    [addFiles]
  );

  if (compact) {
    return (
      <button
        className="btn btn-sm btn-primary w-full"
        onClick={() => inputRef.current?.click()}
      >
        <Icon name="plus" size={13} />
        Add scan
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/*,.dcm"
          onChange={(e) => handle(e.target.files)}
        />
      </button>
    );
  }

  return (
    <div
      className="surface p-4"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.background = 'var(--accent-soft)';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.background = '';
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.background = '';
        handle(e.dataTransfer.files);
      }}
      style={{ transition: 'background .15s, border-color .15s' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow">Upload</div>
        <div className="text-[10px] font-mono text-faint">
          PNG · JPG · DICOM · up to 100MB
        </div>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-md dot-grid"
        style={{ border: '1px dashed var(--line-strong)' }}
      >
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-accent"
          style={{ background: 'var(--accent-soft)' }}
        >
          <Icon name="upload" size={16} />
        </div>
        <div className="text-sm">
          <span className="text-ink font-medium">Drop scans</span>
          <span className="text-muted"> or click to browse</span>
        </div>
        <div className="text-[11px] font-mono text-faint">
          {uploading ? 'Uploading…' : 'single or multi-series'}
        </div>
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/*,.dcm"
          onChange={(e) => handle(e.target.files)}
        />
      </button>
    </div>
  );
}
