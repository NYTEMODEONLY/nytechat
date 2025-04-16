#!/bin/bash
# NyteChat - Launch script
# Kills existing processes and starts the server on port 3000

# Kill any existing Next.js processes
echo "Checking for existing Next.js processes..."
pkill -f "next" && echo "Killed existing Next.js processes" || echo "No Next.js processes found"

# Check if port 3000 is in use
echo "Checking if port 3000 is in use..."
if lsof -i :3000 > /dev/null; then
  echo "Port 3000 is in use. Attempting to free it..."
  lsof -i :3000 -t | xargs kill -9
  sleep 1
fi

# Start the Next.js development server on port 3000
echo "Starting NyteChat on port 3000..."
npm run dev -- -p 3000 