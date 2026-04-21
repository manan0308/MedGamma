import React from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';
import { compareImages } from '../utils/api';
import { modalityAbbr, renderReport } from '../lib/format';

const SAMPLE_COMPARISON = `### Interval changes
The right lower lobe consolidation seen on the prior exam has *decreased* in extent and opacity, consistent with **improving pneumonia**.

### Stable findings
- Cardiomediastinal silhouette unchanged
- No new pleural effusion or pneumothorax
- Osseous structures stable

### Impression
1. **Interval improvement** of right lower lobe pneumonia.
2. No new acute cardiopulmonary process.
3. Continue current therapy. Follow-up CXR in 4–6 weeks if clinically indicated.`;

function Pane({ role, file }) {
  return (
    <div className="flex-1 surface overflow-hidden flex flex-col">
      <div className="hairline px-3 h-9 flex items-center gap-2 shrink-0">
        <span
          className="font-mono text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: role === 'current' ? 'var(--accent)' : 'var(--accent-ink)',
            color: 'white',
          }}
        >
          {role.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-muted truncate">
          {file ? `${modalityAbbr(file.sampleModality || 'general')} · ${file.name}` : 'select a series'}
        </span>
      </div>
      <div className="flex-1 film relative">
        {file ? (
          file.preview ? (
            <img src={file.preview} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="stripes-placeholder w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="eyebrow mb-1 opacity-70">Placeholder</div>
                <div className="font-display text-2xl text-muted">{file.placeholderLabel}</div>
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="eyebrow text-faint">pick a series from the strip</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparisonView() {
  const {
    selected,
    prior,
    setComparing,
    setComparisonResult,
    comparisonResult,
    comparing,
    modality,
    patientContext,
    setError,
    clearError,
  } = useStore();
  const current = selected();
  const p = prior();

  const run = async () => {
    if (!current || !p) return;
    clearError();
    setComparing(true);
    try {
      if (!current.file || !p.file) {
        await new Promise((r) => setTimeout(r, 1600));
        setComparisonResult({ comparison: SAMPLE_COMPARISON });
      } else {
        const r = await compareImages(current.file, p.file, {
          modality,
          context: Object.keys(patientContext).length ? patientContext : null,
        });
        if (r.error) setError(r.error);
        else setComparisonResult(r);
      }
    } catch (e) {
      setError(e.message || 'Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 gap-4">
      {/* header */}
      <div className="surface px-4 py-3 flex items-center gap-4">
        <div>
          <div className="eyebrow">Comparison</div>
          <div className="font-display text-xl">Current vs. prior</div>
        </div>
        <div className="grow-1" />
        <div className="text-[11px] font-mono text-faint">
          Pick a current and prior from the series strip below. Comparison tracks interval change.
        </div>
        <button
          className="btn btn-primary btn-sm"
          disabled={!current || !p || comparing}
          onClick={run}
        >
          {comparing ? <span className="spin" /> : <Icon name="compare" size={12} />}
          {comparing ? 'Comparing' : 'Run comparison'}
        </button>
      </div>

      {/* panes */}
      <div className="flex-1 flex gap-4 min-h-0">
        <Pane role="prior" file={p} />
        <Pane role="current" file={current} />
      </div>

      {/* result */}
      {comparisonResult && (
        <div className="surface p-5 max-h-[34%] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="eyebrow">Interval analysis</div>
            <span className="grow-1 divider-dotted" />
          </div>
          <div
            className="report text-[13px] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: renderReport(comparisonResult.comparison) }}
          />
        </div>
      )}
    </div>
  );
}
