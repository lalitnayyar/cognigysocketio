#!/bin/bash

# Create dist directory
mkdir -p dist

# Copy static files
cp -r public/* dist/

# Create _redirects file for SPA
echo "/* /index.html 200" > dist/_redirects
