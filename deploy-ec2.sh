#!/bin/bash
# ============================================
# ATS Dashboard — AWS EC2 Deployment Script
# ============================================
# Run this on a fresh Ubuntu 22.04+ EC2 instance
# Make sure ports 5055 and 5173 are open in Security Group
# ============================================

set -e

echo "=========================================="
echo "  ATS Dashboard - EC2 Setup"
echo "=========================================="

# 1. Update system
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker
echo "[2/5] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER

# 3. Install Git
echo "[3/5] Installing Git..."
sudo apt-get install -y git

# 4. Clone / Copy project
echo "[4/5] Setting up project..."
# Option A: If using Git — uncomment and set your repo URL:
# git clone https://github.com/YOUR_USER/YOUR_REPO.git ~/ats-dashboard
# cd ~/ats-dashboard

# Option B: If you SCP'd the files:
cd ~/ats-dashboard

# 5. Create .env file
echo "[5/5] Creating environment file..."
cat > .env << 'EOF'
MONGO_URI=mongodb://admin:bBgd1nWdaWrvO14zLsMHx1RL6zgDbjU4@52.65.157.15:27017/times_ai_interviewer?authSource=admin
PORT=5055
EOF

# 6. Build and run
echo "Building and starting containers..."
sudo docker compose up --build -d

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5173"
echo "  Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5055/api"
echo "=========================================="
