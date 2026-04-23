const GLIODIL_539_PAIR = {
  key: 'gliodil-539-progression',
  caseId: '539',
  source: 'm1balcerak/GliODIL',
  title: 'GliODIL case 539',
  note:
    'Derived longitudinal brain MRI demo using shared tissue maps plus baseline and follow-up lesion masks.',
  priorVolumeMl: 53.75,
  currentVolumeMl: 154.37,
  deltaVolumeMl: 100.62,
  ratio: 2.87,
  trend: 'growth',
  overlayPreview: '/demo/gliodil/case-539-progression/overlay.png',
  comparison: `### Interval change
Marked interval **progression** is visible on the follow-up MRI-derived view, with substantially greater tumor burden than baseline.

### Quantitative summary
- Baseline lesion burden: **53.75 mL**
- Follow-up lesion burden: **154.37 mL**
- Absolute change: **+100.62 mL**
- Relative change: **2.87x larger**

### Impression
1. **Substantial interval increase** in glioma-related abnormal tissue burden.
2. Progression is most conspicuous around the dominant right hemispheric lesion footprint.
3. Showcase note: this demo uses GliODIL-derived tissue maps and lesion masks rather than raw DICOM slices.`,
};

function buildPriorAnalysis() {
  return {
    technical: `### Examination
Derived longitudinal brain MRI reference view.

### Technique
Axial GliODIL-derived tissue-map background (` + '`t1_wm/t1_gm/t1_csf`' + `) with baseline lesion mask overlay.

### Findings
Baseline tumor burden is visualized along the dominant right hemispheric lesion footprint. Estimated lesion volume is **53.75 mL** on this derived baseline study.

### Impression
1. Baseline pre-treatment / reference tumor burden captured for longitudinal comparison.
2. This panel is intended for demo comparison workflow, not diagnostic interpretation.`,
    simple: `This is the **earlier brain MRI view** in the demo pair.

It shows the tumor region highlighted in blue on top of a grayscale brain background. In this baseline view, the highlighted burden is about **53.75 mL**.

Use this scan as the “prior” study when showing how the follow-up MRI changed over time.`,
    findings: [
      { severity: 'info', label: 'Study role', value: 'Prior / baseline reference MRI view' },
      { severity: 'warn', label: 'Tumor burden', value: '53.75 mL derived lesion volume' },
      { severity: 'info', label: 'Display mode', value: 'GliODIL tissue-map background with baseline mask overlay' },
      { severity: 'ok', label: 'Showcase use', value: 'Good reference for side-by-side interval comparison' },
    ],
  };
}

function buildCurrentAnalysis() {
  return {
    technical: `### Examination
Derived longitudinal brain MRI follow-up view.

### Technique
Axial GliODIL-derived tissue-map background (` + '`t1_wm/t1_gm/t1_csf`' + `) with follow-up lesion mask overlay.

### Findings
Follow-up tumor burden is more extensive than on the baseline demo study. Estimated lesion volume is **154.37 mL**, representing a marked increase versus the paired reference.

### Impression
1. Follow-up study demonstrates **progressive interval increase** in lesion burden.
2. Estimated derived volume is approximately **2.87x** the baseline showcase study.
3. This panel is intended for demo comparison workflow, not diagnostic interpretation.`,
    simple: `This is the **later brain MRI view** in the demo pair.

The orange highlighted region is much larger than in the baseline study. In this derived follow-up view, the tumor burden measures about **154.37 mL**, which is **2.87 times larger** than the earlier scan.

This makes it a strong demo case for showing interval progression.`,
    findings: [
      { severity: 'info', label: 'Study role', value: 'Current / follow-up MRI view' },
      { severity: 'alert', label: 'Tumor burden', value: '154.37 mL derived lesion volume' },
      { severity: 'alert', label: 'Change vs prior', value: '+100.62 mL, approximately 2.87x larger' },
      { severity: 'info', label: 'Display mode', value: 'GliODIL tissue-map background with follow-up mask overlay' },
    ],
  };
}

export function getLongitudinalDemoSession() {
  const now = Date.now();
  return {
    modality: 'brain_mri',
    patientContext: {
      chief_complaint: 'Post-treatment glioma surveillance MRI',
    },
    comparisonResult: {
      comparison: GLIODIL_539_PAIR.comparison,
    },
    files: [
      {
        id: 'gliodil-539-prior',
        name: 'GliODIL-539-prior-derived.png',
        size: 412_000,
        type: 'image/png',
        preview: '/demo/gliodil/case-539-progression/prior.png',
        placeholderLabel: 'MRI · Brain · Prior',
        sampleModality: 'brain_mri',
        timestamp: now - 1000 * 60 * 60 * 24 * 120,
        demoRole: 'prior',
        demoPair: GLIODIL_539_PAIR,
        resultTemplate: buildPriorAnalysis(),
      },
      {
        id: 'gliodil-539-current',
        name: 'GliODIL-539-followup-derived.png',
        size: 428_000,
        type: 'image/png',
        preview: '/demo/gliodil/case-539-progression/current.png',
        placeholderLabel: 'MRI · Brain · Follow-up',
        sampleModality: 'brain_mri',
        timestamp: now - 1000 * 60 * 60 * 24 * 7,
        demoRole: 'current',
        demoPair: GLIODIL_539_PAIR,
        resultTemplate: buildCurrentAnalysis(),
      },
    ],
  };
}

export const SAMPLE_HISTORY = [
  {
    id: 'h1',
    fileName: 'CXR-PA-UPRIGHT.png',
    placeholderLabel: 'CXR · PA · Upright',
    modality: 'chest_xray',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    hasHeatmap: true,
    snippet: 'No acute cardiopulmonary process. Mild bibasilar atelectasis.',
  },
  {
    id: 'h2',
    fileName: 'BRAIN-MRI-T2-AXIAL.png',
    placeholderLabel: 'MRI · Brain · T2 axial',
    modality: 'brain_mri',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    hasHeatmap: true,
    snippet: 'Small vessel chronic ischemic change. No acute infarct.',
  },
  {
    id: 'h3',
    fileName: 'KNEE-MRI-SAG-PD.png',
    placeholderLabel: 'MRI · Knee · Sag PD',
    modality: 'msk',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    hasHeatmap: false,
    snippet: 'Grade 2 MCL sprain. Small joint effusion.',
  },
  {
    id: 'h4',
    fileName: 'CT-ABDO-PORTAL-VENOUS.dcm',
    placeholderLabel: 'CT · Abdomen · Portal venous',
    modality: 'ct_abdomen',
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    hasHeatmap: true,
    snippet: 'Hepatic steatosis. No focal lesion. Stable renal cyst.',
  },
];

export const SAMPLE_REPORT_TECHNICAL = `### Examination
Chest radiograph, PA and lateral projections, upright.

### Clinical history
45-year-old male with persistent cough × 2 weeks. Smoker, known hypertension.

### Technique
Adequate inspiratory effort. Mild rotation to the left. Penetration appropriate.

### Findings
**Airway**  Trachea midline. Carina sharp.
**Breathing**  Lungs are clear without consolidation, effusion, or pneumothorax. No focal airspace opacity. *Mild bibasilar atelectasis* likely related to suboptimal inspiration.
**Cardiac**  Cardiomediastinal silhouette within normal limits. No widening of the mediastinum.
**Diaphragm**  Costophrenic angles sharp bilaterally. No subdiaphragmatic free air.
**Everything else**  Osseous structures unremarkable. No acute rib fracture. Soft tissues intact.

### Impression
1. **No acute cardiopulmonary process.**
2. Mild bibasilar atelectasis — likely technique-related.
3. Cardiomediastinal contours within normal limits.

### Recommendations
If symptoms persist beyond 3 weeks or new findings develop, consider CT chest for further characterization.`;

export const SAMPLE_REPORT_SIMPLE = `Your chest X-ray looks reassuring.

**What we looked at**  We checked your lungs, your heart's outline, and the bones of your chest to make sure nothing stood out.

**What we found**  Your lungs are clear — there's no sign of pneumonia, a collapsed lung, or fluid build-up. The bottom parts of your lungs look a little less inflated than ideal, which usually just means you didn't take as deep a breath as possible when the picture was taken. It's not a problem.

**What it means for you**  Nothing on this image needs urgent attention. If your cough continues past another week or two, or you develop fever or chest pain, your doctor may want a follow-up scan.`;
