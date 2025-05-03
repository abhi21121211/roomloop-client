#!/bin/bash

# Script to deploy RoomLoop client to Vercel

echo "🚀 Starting deployment of RoomLoop client to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Ensure we have the latest code
echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🏗️ Building the application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "Visit your Vercel dashboard to check the deployment status." 