// Placeholder sample files (no real image) for the prototype empty-state.
// The UI renders stripes-placeholder when `preview` is null and uses
// `placeholderLabel` as the caption.
export const SAMPLE_FILES = [
  {
    id: 'sample-1',
    name: 'CT-ABDO-PORTAL-VENOUS.dcm',
    size: 18_432_120,
    type: 'application/dicom',
    preview: null,
    placeholderLabel: 'CT · Abdomen · Portal venous',
    sampleModality: 'ct_abdomen',
    timestamp: Date.now() - 1000 * 60 * 2,
  },
  {
    id: 'sample-2',
    name: 'CXR-PA-UPRIGHT.png',
    size: 2_210_984,
    type: 'image/png',
    preview: null,
    placeholderLabel: 'CXR · PA · Upright',
    sampleModality: 'chest_xray',
    timestamp: Date.now() - 1000 * 60 * 12,
  },
  {
    id: 'sample-3',
    name: 'BRAIN-MRI-T2-AXIAL.png',
    size: 4_510_220,
    type: 'image/png',
    preview: null,
    placeholderLabel: 'MRI · Brain · T2 axial',
    sampleModality: 'brain_mri',
    timestamp: Date.now() - 1000 * 60 * 24,
  },
];

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
