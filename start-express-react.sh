#!/bin/bash

# This script runs the Express.js version with React.js frontend
echo "Starting Express.js application with React.js frontend on port 3000..."
export USE_REACT=true
node express-app.js