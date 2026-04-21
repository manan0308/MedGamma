import React from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';
import { MODALITIES, modalityAbbr } from '../lib/format';

export function ModalityPicker() {
  const { modality, setModality } = useStore();
  return (
    <div className="surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Modality</div>
        <div className="text-[10px] font-mono text-faint">
          prompt: {modalityAbbr(modality)}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {MODALITIES.map((m) => {
          const active = modality === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setModality(m.id)}
              className="text-center rounded-md transition-colors"
              style={{
                padding: '8px 4px',
                border: `1px solid ${active ? 'transparent' : 'var(--line)'}`,
                background: active ? 'var(--accent-soft)' : 'var(--panel)',
                color: active ? 'var(--accent-ink)' : 'var(--ink)',
              }}
              title={m.label}
            >
              <div className="font-mono text-[10px] opacity-70">{m.abbr}</div>
              <div className="text-[10px] mt-0.5 truncate">{m.label.split(' ')[0]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ModalityPicker;
