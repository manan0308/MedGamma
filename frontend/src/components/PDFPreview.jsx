import React from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';
import { modalityAbbr, renderReport } from '../lib/format';
import { SAMPLE_REPORT_TECHNICAL, SAMPLE_REPORT_SIMPLE } from '../data/sample';

export default function PDFPreview() {
  const { selected, results, patientContext, modality } = useStore();
  const file = selected();
  const result = file ? results[file.id] : null;
  const technical = result?.technical || SAMPLE_REPORT_TECHNICAL;
  const simple = result?.simple || SAMPLE_REPORT_SIMPLE;

  return (
    <div className="flex-1 min-h-0 flex">
      {/* toolbar */}
      <div
        className="shrink-0 flex flex-col gap-3 p-6"
        style={{ width: 260, borderRight: '1px solid var(--line)' }}
      >
        <div className="eyebrow">Export</div>
        <h1 className="font-display text-3xl leading-none">Clinical report</h1>
        <p className="text-sm text-muted">
          A one-page PDF with findings, impression, and — if enabled — a plain-English summary.
        </p>

        <div className="surface-sunken p-3 space-y-2 mt-2">
          <label className="flex items-center justify-between text-xs">
            <span>Include technical report</span>
            <Toggle defaultChecked />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span>Include patient summary</span>
            <Toggle defaultChecked />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span>Include heatmap thumbnail</span>
            <Toggle />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span>Include patient context</span>
            <Toggle defaultChecked />
          </label>
        </div>

        <button className="btn btn-primary btn-sm mt-2">
          <Icon name="download" size={12} />
          Download PDF
        </button>
        <button className="btn btn-sm">
          <Icon name="file" size={12} />
          Copy report text
        </button>
      </div>

      {/* paper */}
      <div className="flex-1 overflow-y-auto p-10" style={{ background: 'var(--sunken)' }}>
        <div
          className="mx-auto bg-panel shadow-lift"
          style={{ width: 760, minHeight: 1050, padding: '56px 64px', border: '1px solid var(--line)' }}
        >
          {/* letterhead */}
          <div className="flex items-start justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-accent"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <Icon name="logo" size={14} />
                </div>
                <div className="font-display text-xl">MedGamma</div>
              </div>
              <div className="eyebrow">AI-assisted radiology report</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-muted">REPORT ID</div>
              <div className="font-mono text-[11px]">MG-{Date.now().toString(36).toUpperCase().slice(-8)}</div>
              <div className="font-mono text-[10px] text-muted mt-2">{new Date().toLocaleString()}</div>
            </div>
          </div>

          {/* metadata grid */}
          <div className="grid grid-cols-4 gap-4 py-4 text-xs" style={{ borderBottom: '1px solid var(--line)' }}>
            <div>
              <div className="eyebrow mb-1">Exam</div>
              <div>{file ? file.placeholderLabel || file.name : 'Chest radiograph, PA'}</div>
            </div>
            <div>
              <div className="eyebrow mb-1">Modality</div>
              <div className="font-mono">{modalityAbbr(modality)}</div>
            </div>
            <div>
              <div className="eyebrow mb-1">Patient</div>
              <div>
                {patientContext.age
                  ? `${patientContext.age}${patientContext.sex ? ' · ' + patientContext.sex : ''}`
                  : '— / —'}
              </div>
            </div>
            <div>
              <div className="eyebrow mb-1">Indication</div>
              <div className="truncate">{patientContext.chief_complaint || 'Not provided'}</div>
            </div>
          </div>

          {/* body */}
          <div className="py-6">
            <div className="eyebrow mb-3">Radiology report</div>
            <div
              className="report text-[12px] leading-[1.55]"
              dangerouslySetInnerHTML={{ __html: renderReport(technical) }}
            />
          </div>

          <div className="py-6" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="eyebrow mb-3">For the patient</div>
            <div
              className="report text-[12px] leading-[1.55]"
              dangerouslySetInnerHTML={{ __html: renderReport(simple) }}
            />
          </div>

          {/* footer */}
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="text-[10px] font-mono text-faint leading-relaxed">
              Generated by MedGemma 1.5 · 4B on A10G. This report is AI-assisted and intended for
              educational review only. Not a substitute for professional medical judgement. Always
              consult a qualified radiologist before clinical action.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ defaultChecked }) {
  const [on, setOn] = React.useState(!!defaultChecked);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="relative shrink-0"
      style={{
        width: 28,
        height: 16,
        borderRadius: 999,
        background: on ? 'var(--accent)' : 'var(--line-strong)',
        transition: 'background .15s',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white"
        style={{
          width: 12,
          height: 12,
          left: on ? 14 : 2,
          transition: 'left .15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
