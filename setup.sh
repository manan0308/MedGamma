#!/bin/bash

# MedScan AI Setup Script
# Run this after cloning the repository

set -e

echo "=================================="
echo "  MedScan AI - Setup"
echo "=================================="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: Python 3 is required."; exit 1; }

echo "[1/4] Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo "[2/4] Installing Modal CLI..."
pip install modal --quiet

echo "[3/4] Checking Modal authentication..."
if ! modal token show >/dev/null 2>&1; then
    echo ""
    echo "Modal not authenticated. Running 'modal setup'..."
    echo "This will open a browser window."
    echo ""
    modal setup
fi

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "=================================="
echo "  Next Steps"
echo "=================================="
echo ""
echo "1. Accept MedGemma license:"
echo "   https://huggingface.co/google/medgemma-1.5-4b-it"
echo ""
echo "2. Create HuggingFace secret in Modal:"
echo "   modal secret create huggingface-secret HF_TOKEN=hf_your_token"
echo ""
echo "3. Deploy Modal endpoint:"
echo "   modal deploy modal/modal_app.py"
echo ""
echo "4. Copy the endpoint URL and create .env file:"
echo "   echo 'VITE_MODAL_ENDPOINT=https://YOUR_URL' > frontend/.env"
echo ""
echo "5. Start the app:"
echo "   cd frontend && npm run dev"
echo ""
