# MedScan AI

Medical image analysis powered by Google's **MedGemma 1.5 4B** model. Upload CT scans, MRIs, or X-rays and get professional radiology-style reports plus plain-English explanations.

![MedScan AI](https://img.shields.io/badge/AI-MedGemma%201.5-blue) ![GPU](https://img.shields.io/badge/GPU-A10G-green) ![React](https://img.shields.io/badge/React-18-61DAFB) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Live Demo

**[https://medgamma.vercel.app](https://medgamma.vercel.app)** (coming soon)

---

## Features

### Core Analysis
- **Professional Radiology Reports**: Structured findings with medical terminology, differential diagnoses, and recommendations
- **Simple Explanations**: Clear explanations for patients without medical jargon
- **Multi-format Support**: PNG, JPG, DICOM files up to 100MB

### Advanced Features
- **Modality-Specific Analysis**: Optimized prompts for:
  - Chest X-ray (systematic ABCDE review)
  - Brain MRI (neuroradiology protocol)
  - CT Abdomen/Pelvis (organ-by-organ)
  - Musculoskeletal imaging
  - General medical imaging

- **Patient Context Integration**: Provide clinical history for more relevant analysis:
  - Chief complaint & duration
  - Age & sex
  - Medical history (smoking, diabetes, etc.)
  - Associated symptoms

- **Visual Attention Heatmaps**: See which areas the AI focused on during analysis

- **Multi-Image Comparison**: Compare current vs. prior studies for progression tracking

- **PDF Export**: Generate downloadable clinical reports

### UI/UX
- Premium design with Instrument Serif + DM Sans typography
- Smooth Framer Motion animations
- Responsive layout for all devices

---

## Quick Start

### Option 1: Use the Live Demo
Visit [https://medgamma.vercel.app](https://medgamma.vercel.app) - no setup required!

### Option 2: Run Locally

#### Prerequisites
- Node.js 18+
- Python 3.11+
- [Modal](https://modal.com) account (free tier works)
- [HuggingFace](https://huggingface.co) account

#### Step 1: Clone & Install

```bash
git clone https://github.com/manan0308/MedGamma.git
cd MedGamma

# Frontend dependencies
cd frontend && npm install && cd ..

# Modal CLI
pip install modal
```

#### Step 2: Accept MedGemma License

Go to [MedGemma on HuggingFace](https://huggingface.co/google/medgemma-1.5-4b-it) and click **"Agree and access repository"**.

#### Step 3: Deploy Modal Backend

```bash
# Login to Modal (opens browser)
modal setup

# Create HuggingFace token secret
# Get your token from: https://huggingface.co/settings/tokens
modal secret create huggingface-secret HF_TOKEN=hf_xxxxxxxxxxxxx

# Deploy the inference endpoint
modal deploy modal/modal_app.py
```

Copy the endpoint URL from the output:
```
https://YOUR_USERNAME--medgemma-inference-fastapi-app.modal.run
```

#### Step 4: Configure Frontend

Create `frontend/.env.local`:

```env
VITE_MODAL_ENDPOINT=https://YOUR_USERNAME--medgemma-inference-fastapi-app.modal.run
```

Or edit `frontend/src/utils/api.js` directly:

```javascript
const MODAL_BASE_URL = 'https://YOUR_USERNAME--medgemma-inference-fastapi-app.modal.run';
```

#### Step 5: Run

```bash
cd frontend && npm run dev
```

Open http://localhost:5173

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                       │
│  - Upload Panel (drag & drop)                                    │
│  - Patient Context Form                                          │
│  - Modality Selector                                             │
│  - Image Gallery & Viewer                                        │
│  - Analysis Panel (Technical + Simple tabs)                      │
│  - PDF Export                                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Direct HTTPS (CORS enabled)
┌─────────────────────────────────────────────────────────────────┐
│              Modal Serverless GPU (A10G 24GB)                    │
│                                                                  │
│  Endpoints:                                                      │
│  POST /analyze     - Single image analysis                       │
│  POST /compare     - Two-image comparison                        │
│                                                                  │
│  Features:                                                       │
│  - MedGemma 1.5 4B with bfloat16 precision                      │
│  - Modality-specific prompt engineering                          │
│  - Patient context integration                                   │
│  - Attention heatmap generation                                  │
│  - 120s idle timeout, then scales to zero                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Reference

### POST /analyze

Analyze a single medical image.

```json
{
  "image_base64": "base64_encoded_image",
  "mode": "both",           // "technical", "simple", or "both"
  "modality": "chest_xray", // "chest_xray", "brain_mri", "ct_abdomen", "msk", "general"
  "context": {              // Optional patient context
    "chief_complaint": "Persistent cough",
    "duration": "2 weeks",
    "age": "45",
    "sex": "Male",
    "history": ["smoker", "hypertension"],
    "symptoms": ["cough", "fever"]
  },
  "generate_heatmap": true  // Generate attention visualization
}
```

**Response:**
```json
{
  "technical": "**EXAMINATION**: Chest radiograph, PA view...",
  "simple": "This chest X-ray shows your lungs and heart...",
  "heatmap": "base64_encoded_heatmap_image"
}
```

### POST /compare

Compare current study with prior study.

```json
{
  "current_image_base64": "base64_current",
  "prior_image_base64": "base64_prior",
  "modality": "chest_xray",
  "context": { ... }
}
```

**Response:**
```json
{
  "comparison": "**INTERVAL CHANGES**: The consolidation in the right lower lobe has decreased...",
  "current_heatmap": "base64_heatmap",
  "prior_heatmap": "base64_heatmap"
}
```

---

## Deployment

### Deploy Frontend to Vercel

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Import from GitHub: `manan0308/MedGamma`
4. Set root directory to `frontend`
5. Add environment variable:
   ```
   VITE_MODAL_ENDPOINT=https://manan0308--medgemma-inference-fastapi-app.modal.run
   ```
6. Deploy!

### Deploy Your Own Modal Backend

```bash
# Clone the repo
git clone https://github.com/manan0308/MedGamma.git
cd MedGamma

# Set up Modal
pip install modal
modal setup

# Create your HuggingFace secret
modal secret create huggingface-secret HF_TOKEN=your_token_here

# Deploy
modal deploy modal/modal_app.py
```

---

## Project Structure

```
MedGamma/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # App header with status
│   │   │   ├── UploadPanel.jsx  # Drag & drop upload
│   │   │   ├── ImageGallery.jsx # Thumbnail grid
│   │   │   ├── ImageViewer.jsx  # Full image with zoom
│   │   │   ├── AnalysisPanel.jsx # Results display
│   │   │   ├── ELI5Section.jsx  # Simple explanation
│   │   │   ├── ContextForm.jsx  # Patient context input
│   │   │   ├── ModalitySelector.jsx # Scan type dropdown
│   │   │   ├── HeatmapOverlay.jsx   # Attention visualization
│   │   │   ├── ComparisonView.jsx   # Side-by-side comparison
│   │   │   └── PDFExport.jsx    # Report download
│   │   ├── store/useStore.js    # Zustand state management
│   │   ├── utils/api.js         # Modal API client
│   │   ├── index.css            # Global styles
│   │   └── App.jsx              # Main application
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── modal/
│   └── modal_app.py             # Modal serverless backend
├── backend/                     # Optional FastAPI server
└── README.md
```

---

## Performance Notes

### Cold Start
First request takes **60-90 seconds** because Modal needs to:
1. Start a GPU container
2. Download MedGemma (~8GB)
3. Load model into VRAM

### Warm Requests
Subsequent requests take **10-30 seconds** depending on:
- Image size
- Whether heatmap generation is enabled
- Whether comparison mode is used

### Cost (Modal Pay-as-you-go)

| Usage | Approximate Daily Cost |
|-------|------------------------|
| 5 analyses/day | ~$0.05 |
| 20 analyses/day | ~$0.15 |
| 100 analyses/day | ~$0.50 |

Modal A10G costs ~$0.76/hour. Container stays warm for 2 minutes then shuts down.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Network Error" | Check Modal is deployed: `modal app list` |
| CORS errors | Ensure you're using the `/analyze` and `/compare` routes |
| Very slow first analysis | Cold start is normal (60-90s) |
| "Model access denied" | Accept MedGemma license on HuggingFace |
| Analysis timeout | Increase timeout in api.js (default 5 min) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand |
| UI Components | Radix UI |
| Animations | Framer Motion |
| Typography | Instrument Serif, DM Sans, IBM Plex Mono |
| PDF | jsPDF |
| ML Model | Google MedGemma 1.5 4B |
| Infrastructure | Modal Labs (A10G GPU) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Disclaimer

**FOR EDUCATIONAL PURPOSES ONLY**

MedScan AI is a demonstration of AI capabilities in medical imaging. It is **NOT** intended for:
- Clinical diagnosis
- Medical decision-making
- Treatment recommendations
- Patient care decisions

**Always consult qualified healthcare professionals for medical advice.**

---

## License

MIT License - see [LICENSE](LICENSE) for details.

MedGemma model usage is governed by [Google's Health AI Developer Terms](https://huggingface.co/google/medgemma-1.5-4b-it).

---

## Acknowledgments

- [Google Health AI](https://health.google/) for MedGemma
- [Modal Labs](https://modal.com/) for serverless GPU infrastructure
- [Anthropic](https://anthropic.com/) for Claude AI assistance in development
