import axios from 'axios';

const MODAL_BASE_URL =
  import.meta.env.VITE_MODAL_ENDPOINT ||
  'https://manan0308--medgemma-inference-fastapi-app.modal.run';

const ANALYZE_ENDPOINT = `${MODAL_BASE_URL}/analyze`;
const COMPARE_ENDPOINT = `${MODAL_BASE_URL}/compare`;

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
  });
}

export async function analyzeWithModal(file, opts = {}) {
  const base64 = await fileToBase64(file);
  const {
    mode = 'both',
    modality = 'general',
    context = null,
    generateHeatmap = true,
  } = opts;

  const { data } = await axios.post(
    ANALYZE_ENDPOINT,
    {
      image_base64: base64,
      mode,
      modality,
      context,
      generate_heatmap: generateHeatmap,
    },
    {
      timeout: 300000,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return data;
}

export async function compareImages(currentFile, priorFile, opts = {}) {
  const [c, p] = await Promise.all([
    fileToBase64(currentFile),
    fileToBase64(priorFile),
  ]);
  const { modality = 'general', context = null } = opts;
  const { data } = await axios.post(
    COMPARE_ENDPOINT,
    {
      current_image_base64: c,
      prior_image_base64: p,
      modality,
      context,
    },
    {
      timeout: 300000,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return data;
}
