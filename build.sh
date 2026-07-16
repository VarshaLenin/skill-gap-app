#!/usr/bin/env bash
# Build script for deployment platforms (e.g. Render "Build Command").
# Installs backend deps and builds the frontend into frontend/dist,
# which Flask serves as static files at runtime.
set -e

echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build

echo "Build complete."
