#!/bin/bash

# Build UMD bundles for VistaView and all extensions

set -e  # Exit on error

echo "Building UMD bundles..."

# Main library
BUILD_ENV=prod BUILD_UMD=true vite build

# UI Extensions
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=download vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=logger vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=image-story vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=select-box vite build

# Video Platform Extensions
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=youtube-video vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=vimeo-video vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=dailymotion-video vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=wistia-video vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=vidyard-video vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=streamable-video vite build

# Map Extensions
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=google-maps vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=mapbox vite build
BUILD_ENV=prod BUILD_UMD=true BUILD_EXT=openstreetmap vite build

echo "UMD builds completed successfully!"
