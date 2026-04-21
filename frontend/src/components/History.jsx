import React from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';
import { relativeTime, modalityAbbr } from '../lib/format';
import { SAMPLE_HISTORY } from '../data/sample';

export default function History() {
  const { history, clearHistory, selectFile, files } = useStore();
  const list = history.length ? history : SAMPLE_HISTORY;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow mb-2">History</div>
            <h1 className="font-display text-4xl leading-none">Past scans</h1>
            <p className="text-sm text-muted mt-2">
              Your recent analyses. Scoped to this browser — nothing leaves your device unless
              you export or re-analyze.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-faint">{list.length} entries · rolling 30</span>
            <button className="btn btn-sm" onClick={clearHistory} disabled={!history.length}>
              Clear
            </button>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div
            className="hairline px-4 py-2 flex items-center gap-4 eyebrow"
            style={{ background: 'var(--sunken)' }}
          >
            <div className="w-14">Type</div>
            <div className="flex-1">File</div>
            <div className="w-40">Summary</div>
            <div className="w-24 text-right">Age</div>
            <div className="w-16 text-right">Actions</div>
          </div>
          {list.map((h) => (
            <div
              key={h.id}
              className="px-4 py-3 flex items-center gap-4 hairline group hover:bg-sunken transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <div className="w-14">
                <div
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded inline-block"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
                >
                  {modalityAbbr(h.modality)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate">{h.fileName}</div>
                <div className="text-[11px] font-mono text-faint truncate">
                  {h.placeholderLabel}
                </div>
              </div>
              <div className="w-40 text-[11px] text-muted truncate-2">{h.snippet}</div>
              <div className="w-24 text-right">
                <div className="text-[11px] font-mono text-muted">{relativeTime(h.timestamp)}</div>
                {h.hasHeatmap && (
                  <div className="text-[10px] font-mono text-faint mt-0.5">+heatmap</div>
                )}
              </div>
              <div className="w-16 text-right flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100">
                <button className="btn btn-ghost btn-xs"><Icon name="eye" size={11} /></button>
                <button className="btn btn-ghost btn-xs"><Icon name="download" size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
