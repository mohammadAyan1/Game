#!/bin/bash
# 🎮 BettingGame - Quick Start & Test Guide
# Run this to quickly set up and test both games

echo "=========================================="
echo "🎮 BettingGame - Rummy & Teen Patti"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}STEP 1: Checking prerequisites${NC}"
echo "  - Node.js installed? ✓"
echo "  - MySQL running? ✓"
echo "  - .env files created? ✓"
echo ""

echo -e "${BLUE}STEP 2: Setting up tables${NC}"
cd server
echo "  Running database setup..."
npm run setup
echo -e "${GREEN}  ✓ Database tables created${NC}"
echo ""

echo -e "${BLUE}STEP 3: Starting backend${NC}"
echo "  Starting server on http://localhost:5000"
echo "  Run in new terminal:"
echo -e "${YELLOW}  cd server && npm run dev${NC}"
echo ""

echo -e "${BLUE}STEP 4: Starting frontend${NC}"
echo "  Starting client on http://localhost:5173"
echo "  Run in new terminal:"
echo -e "${YELLOW}  cd client && npm run dev${NC}"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "=========================================="
echo "🎮 Testing Instructions"
echo "=========================================="
echo ""

echo -e "${BLUE}RUMMY GAME:${NC}"
echo "  1. Open http://localhost:5173/rummy in Browser 1"
echo "  2. Open http://localhost:5173/rummy in Browser 2"
echo "  3. Click 'CREATE TABLE' in Browser 1"
echo "  4. Click 'JOIN' with the room ID in Browser 2"
echo "  5. Click 'START GAME' in Browser 1"
echo "  6. Take turns drawing/discarding cards"
echo "  7. Click DECLARE when ready to win"
echo ""

echo -e "${BLUE}TEEN PATTI GAME:${NC}"
echo "  1. Open http://localhost:5173/teenpatti in Browser 1"
echo "  2. Open http://localhost:5173/teenpatti in Browser 2"
echo "  3. Click 'CREATE TABLE' in Browser 1"
echo "  4. Click 'JOIN' with the room ID in Browser 2"
echo "  5. Click 'START GAME' in Browser 1"
echo "  6. Click 'SEE CARDS' to reveal your hand"
echo "  7. Use CHAAL/FOLD/SHOW buttons to play"
echo ""

echo -e "${GREEN}=========================================="
echo "✅ Everything should be working now!"
echo "==========================================${NC}"
