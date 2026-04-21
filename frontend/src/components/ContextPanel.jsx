import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Icon } from './Icon';

const COMMON_HISTORY = [
  'smoker',
  'diabetes',
  'hypertension',
  'asthma',
  'cancer history',
  'immunocompromised',
];

export default function ContextPanel() {
  const { patientContext, setPatientContext } = useStore();
  const [open, setOpen] = useState(true);

  const set = (k, v) => setPatientContext({ ...patientContext, [k]: v });
  const toggleHist = (tag) => {
    const cur = patientContext.history || [];
    const next = cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag];
    set('history', next);
  };

  return (
    <div className="surface">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="eyebrow">Patient context</div>
          <span className="text-[10px] font-mono text-faint">optional</span>
        </div>
        <Icon name={open ? 'eye' : 'eye-off'} size={13} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <div>
            <label className="eyebrow block mb-1">Chief complaint</label>
            <input
              className="input"
              placeholder="e.g. persistent cough × 2 weeks"
              value={patientContext.chief_complaint || ''}
              onChange={(e) => set('chief_complaint', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="eyebrow block mb-1">Age</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="45"
                value={patientContext.age || ''}
                onChange={(e) => set('age', e.target.value)}
              />
            </div>
            <div>
              <label className="eyebrow block mb-1">Sex</label>
              <div className="flex gap-1">
                {['M', 'F', 'Other'].map((s) => {
                  const active = patientContext.sex === s;
                  return (
                    <button
                      key={s}
                      onClick={() => set('sex', active ? '' : s)}
                      className="flex-1 h-[var(--row)] rounded-md text-xs"
                      style={{
                        background: active ? 'var(--accent-soft)' : 'var(--panel)',
                        color: active ? 'var(--accent-ink)' : 'var(--ink)',
                        border: `1px solid ${active ? 'transparent' : 'var(--line)'}`,
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="eyebrow block mb-1.5">Medical history</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_HISTORY.map((tag) => {
                const active = (patientContext.history || []).includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleHist(tag)}
                    className={`chip ${active ? 'chip-active' : ''}`}
                  >
                    {active ? <Icon name="check" size={10} /> : null}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
