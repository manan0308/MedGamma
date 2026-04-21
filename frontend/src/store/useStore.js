import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const rnd = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_TWEAKS = {
  theme: 'light', // 'light' | 'dark'
  density: 'comfortable', // 'comfortable' | 'compact'
  view: 'clinician', // 'clinician' | 'patient'
  accent: 'blue', // 'blue' | 'graphite' | 'green' | 'amber' | 'red'
  typePair: 'serif-sans', // 'serif-sans' | 'sans-mono' | 'all-sans'
};

export const useStore = create()(
  persist(
    (set, get) => ({
      // Session
      files: [],
      selectedFileId: null,
      priorFileId: null,
      comparisonMode: false,
      comparisonResult: null,
      comparing: false,

      // Analysis config
      modality: 'general',
      patientContext: {},
      generateHeatmap: true,
      showHeatmap: true,

      // Results
      results: {},
      analyzing: false,
      coldStart: false,

      // History
      history: [],

      // Upload + errors
      uploading: false,
      uploadProgress: 0,
      error: null,

      // UI
      activePane: 'workspace', // 'workspace' | 'history' | 'compare' | 'export'
      disclaimerAcknowledged: false,
      tweaksOpen: false,

      // Tweaks (design-time controls)
      tweaks: DEFAULT_TWEAKS,
      setTweak: (key, value) =>
        set((s) => ({ tweaks: { ...s.tweaks, [key]: value } })),
      resetTweaks: () => set({ tweaks: DEFAULT_TWEAKS }),

      // --- File actions ---
      addFiles: (raw) => {
        const add = raw.map((f) => ({
          id: rnd(),
          name: f.name,
          size: f.size,
          type: f.type,
          preview: f.preview || (f instanceof File ? URL.createObjectURL(f) : null),
          file: f instanceof File ? f : null,
          timestamp: Date.now(),
          // optional mock modality/label for sample data
          placeholderLabel: f.placeholderLabel,
          sampleModality: f.sampleModality,
        }));
        set((s) => ({
          files: [...s.files, ...add],
          selectedFileId: s.selectedFileId || add[0]?.id,
        }));
        return add;
      },
      removeFile: (id) =>
        set((s) => {
          const f = s.files.find((x) => x.id === id);
          if (f?.preview && f.file) URL.revokeObjectURL(f.preview);
          const files = s.files.filter((x) => x.id !== id);
          const results = { ...s.results };
          delete results[id];
          return {
            files,
            results,
            selectedFileId:
              s.selectedFileId === id ? files[0]?.id || null : s.selectedFileId,
            priorFileId: s.priorFileId === id ? null : s.priorFileId,
          };
        }),
      selectFile: (id) => set({ selectedFileId: id }),
      setPriorFile: (id) => set({ priorFileId: id }),

      // --- Analysis config ---
      setModality: (m) => set({ modality: m }),
      setPatientContext: (c) => set({ patientContext: c }),
      setGenerateHeatmap: (v) => set({ generateHeatmap: v }),
      setShowHeatmap: (v) => set({ showHeatmap: v }),

      // --- Comparison ---
      setComparisonMode: (on) =>
        set({
          comparisonMode: on,
          priorFileId: on ? null : null,
          comparisonResult: on ? null : null,
          activePane: on ? 'compare' : 'workspace',
        }),
      setComparisonResult: (r) => set({ comparisonResult: r }),
      setComparing: (v) => set({ comparing: v }),

      // --- Upload / analyze ---
      setUploading: (v, p = 0) => set({ uploading: v, uploadProgress: p }),
      setAnalyzing: (v) => set({ analyzing: v }),
      setColdStart: (v) => set({ coldStart: v }),
      setResult: (id, result) => {
        const f = get().files.find((x) => x.id === id);
        set((s) => ({ results: { ...s.results, [id]: result } }));
        if (f && result) {
          const entry = {
            id: rnd(),
            fileId: id,
            fileName: f.name,
            thumbnail: f.preview,
            placeholderLabel: f.placeholderLabel,
            modality: get().modality,
            timestamp: Date.now(),
            hasHeatmap: !!result.heatmap,
            snippet:
              (result.technical || '').split('\n').find((l) => l.trim()) ||
              'Analysis complete',
          };
          set((s) => ({ history: [entry, ...s.history].slice(0, 30) }));
        }
      },
      setError: (e) => set({ error: e }),
      clearError: () => set({ error: null }),

      setActivePane: (p) => set({ activePane: p }),
      setDisclaimerAck: (v) => set({ disclaimerAcknowledged: v }),
      setTweaksOpen: (v) => set({ tweaksOpen: v }),

      // Getters
      selected: () => get().files.find((f) => f.id === get().selectedFileId),
      prior: () => get().files.find((f) => f.id === get().priorFileId),

      clearSession: () => {
        get().files.forEach((f) => f.file && f.preview && URL.revokeObjectURL(f.preview));
        set({
          files: [],
          selectedFileId: null,
          priorFileId: null,
          results: {},
          comparisonResult: null,
          error: null,
          patientContext: {},
        });
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'medgamma.v1',
      partialize: (s) => ({
        tweaks: s.tweaks,
        disclaimerAcknowledged: s.disclaimerAcknowledged,
        history: s.history.map((h) => ({ ...h, thumbnail: null })),
      }),
    }
  )
);

export default useStore;
