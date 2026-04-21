import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Icon } from './Icon';

export default function DisclaimerModal() {
  const { disclaimerAcknowledged, setDisclaimerAck } = useStore();
  if (disclaimerAcknowledged) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(14,18,26,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="surface max-w-md mx-4 shadow-lift">
        <div className="px-6 py-5">
          <div className="eyebrow mb-2">Before you start</div>
          <h2 className="font-display text-3xl leading-tight mb-3">
            Educational use only.
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-4">
            MedGamma generates AI-assisted radiology reports using Google's MedGemma. It is
            <strong className="text-ink"> not a medical device </strong>
            and must not be used for clinical diagnosis or treatment decisions.
            Always consult a qualified radiologist.
          </p>
          <ul className="space-y-1.5 text-[12px] text-muted mb-5">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
              Images are sent to a GPU endpoint for inference and not stored long-term.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
              Do not upload identifiable patient data.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
              AI output can be wrong. Treat it as a prompt for review, not a verdict.
            </li>
          </ul>
        </div>
        <div className="hairline-t px-6 py-3 flex items-center gap-2" style={{ background: 'var(--sunken)' }}>
          <a
            href="https://huggingface.co/google/medgemma-1.5-4b-it"
            target="_blank" rel="noreferrer"
            className="text-[11px] text-muted underline underline-offset-2 hover:text-ink"
          >
            MedGemma terms
          </a>
          <div className="grow-1" />
          <button className="btn btn-primary btn-sm" onClick={() => setDisclaimerAck(true)}>
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
