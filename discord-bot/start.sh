#!/bin/bash

# ============================================
#  Discord Bot - Termux Startup Script
#  Compatible with Termux (Android)
# ============================================

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "  ____  _                       _   ____        _   "
echo " |  _ \(_)___  ___ ___  _ __ __| | | __ )  ___ | |_ "
echo " | | | | / __|/ __/ _ \| '__/ _\` | |  _ \ / _ \| __|"
echo " | |_| | \__ \ (_| (_) | | | (_| | | |_) | (_) | |_ "
echo " |____/|_|___/\___\___/|_|  \__,_| |____/ \___/ \__|"
echo -e "${RESET}"
echo -e "${BOLD} Termux Optimized Discord Bot${RESET}"
echo "=================================================="

# --- Node.js version check ---
echo -e "\n${YELLOW}[CHECK]${RESET} Memeriksa Node.js..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}[ERROR]${RESET} Node.js tidak ditemukan!"
  echo "Jalankan: pkg install nodejs"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}[ERROR]${RESET} Node.js versi 18+ diperlukan. Versi saat ini: $(node -v)"
  echo "Jalankan: pkg install nodejs"
  exit 1
fi
echo -e "${GREEN}[OK]${RESET} Node.js $(node -v) ✓"

# --- Check .env file ---
echo -e "\n${YELLOW}[CHECK]${RESET} Memeriksa file .env..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}[WARN]${RESET} File .env dibuat dari .env.example"
    echo -e "${RED}${BOLD}⚠️  PENTING: Edit file .env dan isi DISCORD_TOKEN dan CLIENT_ID${RESET}"
    echo -e "     nano .env"
    echo ""
    echo "Setelah mengisi .env, jalankan lagi: bash start.sh"
    exit 1
  else
    echo -e "${RED}[ERROR]${RESET} File .env tidak ditemukan!"
    exit 1
  fi
fi

source .env 2>/dev/null || true
if [ -z "$DISCORD_TOKEN" ] || [ "$DISCORD_TOKEN" = "your_bot_token_here" ]; then
  echo -e "${RED}[ERROR]${RESET} DISCORD_TOKEN belum diisi di file .env!"
  echo "Edit file .env: nano .env"
  exit 1
fi
echo -e "${GREEN}[OK]${RESET} File .env ditemukan ✓"

# --- Install dependencies ---
echo -e "\n${YELLOW}[INSTALL]${RESET} Memeriksa dependencies..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo -e "${YELLOW}[INSTALL]${RESET} Menginstall dependencies..."
  
  # Check if npm is available
  if command -v npm &> /dev/null; then
    npm install --omit=dev --no-audit --no-fund 2>&1
  else
    echo -e "${RED}[ERROR]${RESET} npm tidak ditemukan!"
    exit 1
  fi
  
  echo -e "${GREEN}[OK]${RESET} Dependencies terinstall ✓"
else
  echo -e "${GREEN}[OK]${RESET} Dependencies sudah ada ✓"
fi

# --- Deploy slash commands (first run only) ---
DEPLOYED_FLAG=".commands_deployed"
if [ ! -f "$DEPLOYED_FLAG" ]; then
  echo -e "\n${YELLOW}[DEPLOY]${RESET} Mendaftarkan slash commands ke Discord..."
  node src/deploy-commands.js
  touch "$DEPLOYED_FLAG"
  echo -e "${GREEN}[OK]${RESET} Slash commands terdaftar ✓"
fi

# --- Create data directory ---
mkdir -p data

# --- Start bot ---
echo -e "\n${GREEN}${BOLD}[START]${RESET}${GREEN} Menjalankan Discord Bot...${RESET}"
echo "=================================================="
echo -e " Tekan ${BOLD}Ctrl+C${RESET} untuk menghentikan bot"
echo -e " Untuk run di background: ${CYAN}nohup bash start.sh > bot.log 2>&1 &${RESET}"
echo "=================================================="
echo ""

# Auto-restart loop
while true; do
  node src/index.js
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${YELLOW}[BOT]${RESET} Bot dihentikan secara normal."
    break
  fi
  echo -e "${RED}[BOT]${RESET} Bot crashed (exit code: $EXIT_CODE). Restart dalam 10 detik..."
  sleep 10
done
