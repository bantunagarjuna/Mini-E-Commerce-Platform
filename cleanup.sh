#!/bin/bash

# Remove all files except for certain directories/files
echo "Removing project files to start fresh..."

# Remove files in the root directory
rm -f *.js *.json *.jsx *.ts *.tsx *.html *.css *.lock package-lock.json

# Remove directories (if they exist)
rm -rf server/
rm -rf client/
rm -rf shared/
rm -rf public/
rm -rf src/
rm -rf dist/
rm -rf backup/
rm -rf express-*

echo "Cleanup complete. Ready for a fresh start!"