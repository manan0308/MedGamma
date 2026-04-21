import modal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = modal.App("medgemma-inference")

# Create FastAPI app with CORS
web_app = FastAPI()
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define container image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch",
        "transformers>=4.50.0",
        "accelerate",
        "Pillow",
        "numpy",
        "fastapi",
        "scipy",
    )
)


# ============================================================================
# MODALITY-SPECIFIC PROMPTS
# ============================================================================

PROMPTS = {
    "chest_xray": {
        "technical": """You are a board-certified thoracic radiologist preparing a formal chest X-ray report.

**EXAMINATION**: Chest radiograph, [PA/AP/Lateral] view

**TECHNIQUE**: Assess exposure, inspiration, rotation, and image quality.

**SYSTEMATIC REVIEW** (evaluate each in order):

*Airway*: Trachea position, carina, mainstem bronchi
*Breathing (Lungs)*:
- Lung volumes and expansion
- Parenchyma: opacities, nodules, masses, consolidation
- Interstitium: reticular/nodular patterns, Kerley lines
- Each zone: upper, mid, lower for both lungs
*Cardiac*:
- Heart size (cardiothoracic ratio, normal <0.5)
- Heart borders: right (RA), left (LV, LA appendage)
- Cardiac silhouette contour
*Diaphragm*: Position, costophrenic angles, free air
*Everything else*:
- Mediastinum width and contour
- Hila: size, density, position
- Bones: ribs, clavicles, spine, shoulders
- Soft tissues: chest wall, breast shadows
- Lines/tubes if present

**FINDINGS**: List all abnormalities with precise location (e.g., "right upper lobe", "left costophrenic angle")

**IMPRESSION**:
1. Primary diagnosis with confidence level
2. Differential diagnoses ranked by probability
3. Incidental findings

**RECOMMENDATIONS**: Follow-up imaging, clinical correlation, urgency level""",

        "simple": """Explain this chest X-ray to someone without medical training.

Cover:
1. **The basics**: What does a chest X-ray show? (heart, lungs, ribs, etc.)
2. **What looks normal**: Point out the healthy structures
3. **What stands out**: Any findings, explained in plain terms
4. **What this means**: Should they be concerned? What might happen next?

Use analogies (e.g., "your lungs should look dark like empty balloons filled with air"). Be direct but not alarming. ~250 words."""
    },

    "brain_mri": {
        "technical": """You are a board-certified neuroradiologist preparing a formal brain MRI report.

**EXAMINATION**: MRI Brain [with/without contrast], [sequence type if identifiable]

**TECHNIQUE**: Assess image quality, artifacts, sequences visible.

**SYSTEMATIC REVIEW**:

*Extra-axial spaces*:
- Ventricles: size, symmetry, periventricular signal
- Sulci: prominence, effacement
- Cisterns: basal cisterns, cerebellopontine angles

*Brain parenchyma*:
- Gray-white differentiation
- Cortex: thickness, signal abnormalities
- White matter: T2/FLAIR hyperintensities, location (periventricular, subcortical, deep)
- Basal ganglia and thalami
- Brainstem and cerebellum

*Midline structures*:
- Corpus callosum
- Septum pellucidum
- Pineal and pituitary regions

*Vascular*:
- Major vessels if visible
- Any evidence of infarct (DWI if available)

*Other*:
- Orbits, paranasal sinuses, mastoids
- Calvarium and skull base

**FINDINGS**: Describe abnormalities with:
- Location (anatomical and laterality)
- Size (measure if possible)
- Signal characteristics (T1, T2, FLAIR, enhancement pattern)
- Mass effect, edema, midline shift

**IMPRESSION**:
1. Primary diagnosis with differential
2. Comparison to typical findings for age
3. Stability assessment if prior available

**RECOMMENDATIONS**: Follow-up interval, additional sequences, clinical correlation""",

        "simple": """Explain this brain MRI to the patient in clear terms.

Cover:
1. **What is an MRI?**: Brief explanation of what we're looking at
2. **Brain anatomy visible**: Main structures (gray matter, white matter, ventricles, etc.)
3. **What the scan shows**: Normal findings AND any abnormalities
4. **Context**: How this compares to what's expected, what it might mean

Be honest and clear. If something looks abnormal, explain what it could represent without causing panic. ~250 words."""
    },

    "ct_abdomen": {
        "technical": """You are a board-certified abdominal radiologist preparing a formal abdominal CT report.

**EXAMINATION**: CT Abdomen/Pelvis [with/without IV contrast, with/without oral contrast]

**TECHNIQUE**: Assess phase (non-contrast, arterial, portal venous, delayed), image quality.

**SYSTEMATIC REVIEW**:

*Liver*: Size, contour, parenchymal attenuation, focal lesions, vessels
*Biliary*: Gallbladder, CBD diameter, intrahepatic ducts
*Pancreas*: Size, contour, duct, focal lesions
*Spleen*: Size, homogeneity, focal lesions
*Adrenals*: Size, nodules, masses
*Kidneys*: Size, cortical thickness, stones, hydronephrosis, masses, cysts
*GI tract*:
- Stomach: wall thickness, distension
- Small bowel: caliber, wall thickness, obstruction
- Colon: wall thickness, diverticulosis, masses
- Appendix: visualized? normal?
*Vasculature*: Aorta diameter, calcification, aneurysm; IVC; portal vein
*Lymph nodes*: Retroperitoneal, mesenteric, pelvic (>1cm short axis = enlarged)
*Pelvis*: Bladder, uterus/prostate, ovaries, free fluid
*Musculoskeletal*: Spine, pelvis, visible ribs
*Lung bases*: Include any visible pulmonary findings

**FINDINGS**: Organ-by-organ abnormalities with measurements

**IMPRESSION**: Prioritized findings with differential diagnoses

**RECOMMENDATIONS**: Follow-up, additional imaging, clinical action""",

        "simple": """Explain this abdominal CT scan in plain language.

Cover:
1. **What CT shows**: The organs visible (liver, kidneys, intestines, etc.)
2. **Normal structures**: What looks healthy
3. **Any findings**: Abnormalities explained simply (e.g., "a small cyst on the kidney - like a tiny fluid-filled bubble, very common and usually harmless")
4. **Next steps**: What this means for the patient

Be straightforward. Medical findings can sound scary - provide context. ~250 words."""
    },

    "msk": {
        "technical": """You are a board-certified musculoskeletal radiologist.

**EXAMINATION**: [X-ray/MRI/CT] of [body part]

**TECHNIQUE**: Views obtained, image quality, positioning.

**SYSTEMATIC REVIEW**:

*Bones*:
- Alignment and anatomical relationships
- Cortical integrity: fractures, erosions, periosteal reaction
- Medullary bone: density, lesions, marrow signal (MRI)
- Joint spaces: width, uniformity

*Joints*:
- Articular surfaces
- Joint effusion
- Synovial thickening
- Cartilage (if MRI)

*Soft tissues*:
- Muscles: atrophy, edema, tears
- Tendons: integrity, tendinosis, tears
- Ligaments: integrity, sprain/tear
- Fat planes
- Soft tissue masses

*Other*:
- Hardware if present
- Vascular calcifications
- Lymph nodes

**FINDINGS**: Describe with precise anatomical location, measurements, and characteristics

**IMPRESSION**: Diagnosis with differential, grading of injury if applicable

**RECOMMENDATIONS**: Weight-bearing status, follow-up imaging, clinical correlation""",

        "simple": """Explain this musculoskeletal scan to the patient.

Cover:
1. **What we're looking at**: The bone/joint/muscle being examined
2. **What looks normal**: Healthy structures
3. **What's found**: Any fractures, tears, arthritis, etc. in plain terms
4. **Recovery/next steps**: What this typically means for healing or treatment

Use everyday comparisons. ~250 words."""
    },

    "general": {
        "technical": """You are a board-certified radiologist with 20+ years of experience. Analyze this medical image systematically.

**EXAMINATION**: Identify the imaging modality, body part, and technique.

**TECHNIQUE**: Comment on image quality and any limitations.

**FINDINGS**:
- Systematic review of all visible structures
- Describe any abnormalities with location, size, characteristics
- Note normal findings as well

**IMPRESSION**:
1. Primary diagnosis with differential
2. Secondary findings
3. Incidental findings

**RECOMMENDATIONS**: Follow-up imaging, clinical correlation, urgency level

Use precise radiological terminology. Be thorough and systematic.""",

        "simple": """Explain what you see in this medical image to someone without medical training.

1. **What type of image is this?** (X-ray, MRI, CT, etc. and what body part)
2. **What am I looking at?** (Main structures visible)
3. **What does this show?** (Normal findings and any abnormalities)
4. **What does this mean?** (Practical implications)

Be clear and honest. Use everyday language. ~250 words."""
    }
}


# ============================================================================
# CONTEXT-AWARE PROMPT BUILDER
# ============================================================================

def build_prompt(base_prompt: str, context: dict = None) -> str:
    """Enhance prompt with patient context if provided."""
    if not context:
        return base_prompt

    context_section = "\n\n**CLINICAL CONTEXT PROVIDED**:\n"

    if context.get("chief_complaint"):
        context_section += f"- Chief Complaint: {context['chief_complaint']}\n"
    if context.get("duration"):
        context_section += f"- Duration: {context['duration']}\n"
    if context.get("age"):
        context_section += f"- Patient Age: {context['age']}\n"
    if context.get("sex"):
        context_section += f"- Patient Sex: {context['sex']}\n"
    if context.get("history"):
        context_section += f"- Relevant History: {', '.join(context['history'])}\n"
    if context.get("symptoms"):
        context_section += f"- Associated Symptoms: {', '.join(context['symptoms'])}\n"

    context_section += "\nIncorporate this clinical context into your analysis. Correlate imaging findings with the provided history.\n"

    return base_prompt + context_section


@app.cls(
    gpu="A10G",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=600,
    scaledown_window=120,
)
class MedGemmaInference:

    @modal.enter()
    def load_model(self):
        """Load model once when container starts"""
        import os
        from transformers import AutoProcessor, AutoModelForImageTextToText
        import torch

        model_id = "google/medgemma-1.5-4b-it"

        self.model = AutoModelForImageTextToText.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            token=os.environ.get("HF_TOKEN"),
        )
        self.processor = AutoProcessor.from_pretrained(
            model_id,
            token=os.environ.get("HF_TOKEN"),
        )
        print("Model loaded successfully!")

    def _run_inference(self, image, prompt: str) -> str:
        import torch

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        inputs = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt"
        ).to(self.model.device, dtype=torch.bfloat16)

        input_len = inputs["input_ids"].shape[-1]

        with torch.inference_mode():
            generation = self.model.generate(
                **inputs,
                max_new_tokens=2000,
                do_sample=False
            )
            generation = generation[0][input_len:]

        return self.processor.decode(generation, skip_special_tokens=True)

    def _generate_attention_map(self, image) -> str:
        """Generate a saliency/attention heatmap showing areas of interest."""
        import numpy as np
        from PIL import Image as PILImage
        import base64
        import io

        # Convert image to numpy array
        img_array = np.array(image)

        # Simple edge detection + gradient magnitude as proxy for "areas of interest"
        # In production, you'd use GradCAM on the actual model
        from scipy import ndimage

        # Convert to grayscale if color
        if len(img_array.shape) == 3:
            gray = np.mean(img_array, axis=2)
        else:
            gray = img_array.astype(float)

        # Compute gradient magnitude (edges = areas of interest in medical images)
        sx = ndimage.sobel(gray, axis=0, mode='reflect')
        sy = ndimage.sobel(gray, axis=1, mode='reflect')
        gradient_magnitude = np.hypot(sx, sy)

        # Normalize
        gradient_magnitude = (gradient_magnitude - gradient_magnitude.min()) / (gradient_magnitude.max() - gradient_magnitude.min() + 1e-8)

        # Apply Gaussian blur for smoother heatmap
        heatmap = ndimage.gaussian_filter(gradient_magnitude, sigma=10)
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)

        # Create color heatmap (blue -> green -> yellow -> red)
        heatmap_color = np.zeros((*heatmap.shape, 4), dtype=np.uint8)

        # Color mapping
        for i in range(heatmap.shape[0]):
            for j in range(heatmap.shape[1]):
                val = heatmap[i, j]
                if val < 0.25:
                    # Blue to cyan
                    heatmap_color[i, j] = [0, int(val * 4 * 255), 255, int(val * 200)]
                elif val < 0.5:
                    # Cyan to green
                    heatmap_color[i, j] = [0, 255, int((0.5 - val) * 4 * 255), int(val * 200)]
                elif val < 0.75:
                    # Green to yellow
                    heatmap_color[i, j] = [int((val - 0.5) * 4 * 255), 255, 0, int(val * 200)]
                else:
                    # Yellow to red
                    heatmap_color[i, j] = [255, int((1 - val) * 4 * 255), 0, int(val * 255)]

        # Resize heatmap to match original image
        heatmap_img = PILImage.fromarray(heatmap_color, mode='RGBA')
        heatmap_img = heatmap_img.resize(image.size, PILImage.Resampling.BILINEAR)

        # Overlay on original image
        if image.mode != 'RGBA':
            base_img = image.convert('RGBA')
        else:
            base_img = image.copy()

        # Composite
        composite = PILImage.alpha_composite(base_img, heatmap_img)

        # Convert to base64
        buffer = io.BytesIO()
        composite.save(buffer, format='PNG')
        buffer.seek(0)

        return base64.b64encode(buffer.getvalue()).decode('utf-8')

    @modal.method()
    def analyze(
        self,
        image_bytes: bytes,
        mode: str = "both",
        modality: str = "general",
        context: dict = None,
        generate_heatmap: bool = False
    ) -> dict:
        """
        Analyze medical image with modality-specific prompts and optional context.

        Args:
            image_bytes: Image data
            mode: "technical", "simple", or "both"
            modality: "chest_xray", "brain_mri", "ct_abdomen", "msk", or "general"
            context: Optional dict with patient context (chief_complaint, history, etc.)
            generate_heatmap: Whether to generate attention heatmap
        """
        from PIL import Image
        import io

        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if necessary
        if image.mode not in ["RGB", "RGBA"]:
            image = image.convert("RGB")

        # Get modality-specific prompts
        prompts = PROMPTS.get(modality, PROMPTS["general"])

        results = {}

        if mode in ["technical", "both"]:
            prompt = build_prompt(prompts["technical"], context)
            results["technical"] = self._run_inference(image, prompt)

        if mode in ["simple", "eli5", "both"]:
            prompt = build_prompt(prompts["simple"], context)
            results["simple"] = self._run_inference(image, prompt)

        # Generate attention heatmap if requested
        if generate_heatmap:
            results["heatmap"] = self._generate_attention_map(image)

        return results

    @modal.method()
    def compare_images(
        self,
        current_image_bytes: bytes,
        prior_image_bytes: bytes,
        modality: str = "general",
        context: dict = None
    ) -> dict:
        """Compare current image with prior study for progression assessment."""
        from PIL import Image
        import io

        current = Image.open(io.BytesIO(current_image_bytes))
        prior = Image.open(io.BytesIO(prior_image_bytes))

        if current.mode != "RGB":
            current = current.convert("RGB")
        if prior.mode != "RGB":
            prior = prior.convert("RGB")

        comparison_prompt = f"""You are a radiologist comparing two medical images: a CURRENT study and a PRIOR study.

**TASK**: Perform a detailed comparison analysis.

**CURRENT IMAGE**: [First image provided]
**PRIOR IMAGE**: [Second image provided]

**COMPARISON ANALYSIS**:

1. **Interval Changes**: What has changed between the two studies?
   - New findings not present on prior
   - Resolved findings that were present on prior
   - Progressed findings (larger, more extensive)
   - Improved findings (smaller, less extensive)
   - Stable findings (unchanged)

2. **Measurements**: If applicable, compare sizes of any lesions/abnormalities

3. **Clinical Significance**: What do these changes mean?
   - Is the condition improving, worsening, or stable?
   - Are new findings concerning?

4. **Recommendations**: Based on the comparison
   - Follow-up interval
   - Need for additional imaging
   - Urgency of clinical action

Be specific about locations and quantify changes where possible."""

        if context:
            comparison_prompt = build_prompt(comparison_prompt, context)

        # For comparison, we need to modify how we send images
        # MedGemma supports multiple images
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Current study:"},
                    {"type": "image", "image": current},
                    {"type": "text", "text": "Prior study:"},
                    {"type": "image", "image": prior},
                    {"type": "text", "text": comparison_prompt}
                ]
            }
        ]

        import torch
        inputs = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt"
        ).to(self.model.device, dtype=torch.bfloat16)

        input_len = inputs["input_ids"].shape[-1]

        with torch.inference_mode():
            generation = self.model.generate(
                **inputs,
                max_new_tokens=2000,
                do_sample=False
            )
            generation = generation[0][input_len:]

        comparison_result = self.processor.decode(generation, skip_special_tokens=True)

        return {
            "comparison": comparison_result,
            "current_heatmap": self._generate_attention_map(current),
            "prior_heatmap": self._generate_attention_map(prior)
        }


@web_app.post("/analyze")
async def analyze_route(request: dict):
    """
    HTTP endpoint for analysis.

    Request body:
    {
        "image_base64": str,          # Required: base64 encoded image
        "mode": str,                   # Optional: "technical", "simple", or "both" (default)
        "modality": str,               # Optional: "chest_xray", "brain_mri", "ct_abdomen", "msk", "general"
        "context": {                   # Optional: patient context
            "chief_complaint": str,
            "duration": str,
            "age": str,
            "sex": str,
            "history": [str],
            "symptoms": [str]
        },
        "generate_heatmap": bool       # Optional: generate attention heatmap
    }
    """
    import base64

    image_bytes = base64.b64decode(request["image_base64"])
    mode = request.get("mode", "both")
    modality = request.get("modality", "general")
    context = request.get("context")
    generate_heatmap = request.get("generate_heatmap", False)

    inference = MedGemmaInference()
    return inference.analyze.remote(
        image_bytes,
        mode=mode,
        modality=modality,
        context=context,
        generate_heatmap=generate_heatmap
    )


@web_app.post("/compare")
async def compare_route(request: dict):
    """
    HTTP endpoint for comparing two images.

    Request body:
    {
        "current_image_base64": str,   # Required: current study
        "prior_image_base64": str,     # Required: prior study
        "modality": str,               # Optional: imaging modality
        "context": {...}               # Optional: patient context
    }
    """
    import base64

    current_bytes = base64.b64decode(request["current_image_base64"])
    prior_bytes = base64.b64decode(request["prior_image_base64"])
    modality = request.get("modality", "general")
    context = request.get("context")

    inference = MedGemmaInference()
    return inference.compare_images.remote(
        current_bytes,
        prior_bytes,
        modality=modality,
        context=context
    )


@app.function(
    gpu="A10G",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=600,
    scaledown_window=120,
)
@modal.asgi_app()
def fastapi_app():
    """Serve the FastAPI app with CORS enabled."""
    return web_app


# Local testing
@app.local_entrypoint()
def main():
    """Test the model locally"""
    import requests

    # Download a sample chest X-ray
    image_url = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Chest_Xray_PA_3-8-2010.png"
    response = requests.get(image_url, headers={"User-Agent": "MedGemma-Test"})
    image_bytes = response.content

    inference = MedGemmaInference()

    # Test with context
    context = {
        "chief_complaint": "Persistent cough",
        "duration": "2 weeks",
        "history": ["smoker", "hypertension"]
    }

    result = inference.analyze.remote(
        image_bytes,
        mode="both",
        modality="chest_xray",
        context=context,
        generate_heatmap=True
    )

    print("\n" + "="*50)
    print("TECHNICAL ANALYSIS:")
    print("="*50)
    print(result["technical"])

    print("\n" + "="*50)
    print("SIMPLE EXPLANATION:")
    print("="*50)
    print(result["simple"])

    print("\n" + "="*50)
    print("HEATMAP GENERATED:", "Yes" if result.get("heatmap") else "No")
    print("="*50)
