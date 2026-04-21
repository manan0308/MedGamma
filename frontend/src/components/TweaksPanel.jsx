import React from 'react';
import { Icon } from './Icon';
import { useStore } from '../store/useStore';

const ACCENTS = [
  { id: 'blue', label: 'Clinical blue', swatch: 'oklch(0.55 0.12 230)' },
  { id: 'graphite', label: 'Graphite', swatch: 'oklch(0.42 0.02 260)' },
  { id: 'green', label: 'Medical green', swatch: 'oklch(0.55 0.12 150)' },
  { id: 'amber', label: 'Amber', swatch: 'oklch(0.6 0.14 75)' },
  { id: 'red', label: 'Surgical red', swatch: 'oklch(0.55 0.14 25)' },
];

const TYPE_PAIRS = [
  { id: 'serif-sans', label: 'Instrument Serif · Inter', sample: 'Aa' },
  { id: 'all-sans', label: 'Inter only', sample: 'Aa' },
  { id: 'sans-mono', label: 'Inter · Mono data', sample: 'Aa' },
];

export default function TweaksPanel() {
  const { tweaksOpen, setTweaksOpen, tweaks, setTweak, resetTweaks } = useStore();
  if (!tweaksOpen) return null;

  return (
    <div
      className="fixed right-4 bottom-4 surface shadow-lift z-50 animate-slide-up"
      style={{ width: 320 }}
    >
      <div className="px-4 py-3 hairline flex items-center">
        <div className="eyebrow">Tweaks</div>
        <div className="grow-1" />
        <button className="btn btn-ghost btn-xs" onClick={resetTweaks}>Reset</button>
        <button className="btn btn-ghost btn-xs" onClick={() => setTweaksOpen(false)}>
          <Icon name="x" size={11} />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Theme */}
        <Section label="Theme">
          <Seg
            options={[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }]}
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
          />
        </Section>

        {/* Density */}
        <Section label="Density">
          <Seg
            options={[{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }]}
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
          />
        </Section>

        {/* View */}
        <Section label="View">
          <Seg
            options={[{ id: 'clinician', label: 'Clinician' }, { id: 'patient', label: 'Patient' }]}
            value={tweaks.view}
            onChange={(v) => setTweak('view', v)}
          />
        </Section>

        {/* Accent */}
        <Section label="Accent">
          <div className="flex items-center gap-1.5">
            {ACCENTS.map((a) => {
              const active = tweaks.accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setTweak('accent', a.id)}
                  title={a.label}
                  className="rounded-full"
                  style={{
                    width: 22, height: 22, background: a.swatch,
                    boxShadow: active ? '0 0 0 2px var(--panel), 0 0 0 3.5px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                  }}
                />
              );
            })}
          </div>
        </Section>

        {/* Typography */}
        <Section label="Typography">
          <div className="flex flex-col gap-1.5">
            {TYPE_PAIRS.map((t) => {
              const active = tweaks.typePair === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTweak('typePair', t.id)}
                  className="flex items-center gap-2 px-2 h-8 rounded-md text-left"
                  style={{
                    border: `1px solid ${active ? 'transparent' : 'var(--line)'}`,
                    background: active ? 'var(--accent-soft)' : 'var(--panel)',
                    color: active ? 'var(--accent-ink)' : 'var(--ink)',
                  }}
                >
                  <span
                    className={t.id === 'serif-sans' ? 'font-display text-lg' : t.id === 'sans-mono' ? 'font-mono text-sm' : 'text-sm'}
                    style={{ width: 24 }}
                  >
                    {t.sample}
                  </span>
                  <span className="text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="surface-sunken p-0.5 flex rounded-md">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="flex-1 h-7 text-[11px] rounded-sm"
            style={{
              background: active ? 'var(--panel)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--muted)',
              boxShadow: active ? 'inset 0 0 0 1px var(--line)' : 'none',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
