#!/bin/bash
# Airport Transfer Portal - Deployment Script
# Usage: ./deploy.sh

echo "Deploying to production server..."

ssh airporttransfer@134.209.137.11 "cd ~/airporttransfer && git pull && npm run build && pm2 restart airporttransfer"

echo "Deployment complete!"
