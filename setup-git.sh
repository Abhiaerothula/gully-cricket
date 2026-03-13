#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  GullyCricket — Git Setup Script
#  Run this ONCE from inside the project folder:
#    chmod +x setup-git.sh
#    ./setup-git.sh
# ─────────────────────────────────────────────────────────────

set -e

echo ""
echo "🏏 GullyCricket — Git Setup"
echo "─────────────────────────────────"

# 1. Check git is installed
if ! command -v git &>/dev/null; then
  echo "❌  git is not installed. Please install it first."
  exit 1
fi

# 2. Ask for repo URL
echo ""
read -p "Enter your GitHub repo URL (e.g. https://github.com/yourname/gullycricket.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌  No URL provided. Exiting."
  exit 1
fi

# 3. Ask for author details
echo ""
read -p "Your name for git commits (e.g. Abhi): " GIT_NAME
read -p "Your email for git commits (e.g. abhi.aero.thula@gmail.com): " GIT_EMAIL

# 4. Initialise git if not already done
if [ ! -d ".git" ]; then
  echo ""
  echo "📁 Initialising git repo..."
  git init
  git config user.name "$GIT_NAME"
  git config user.email "$GIT_EMAIL"
else
  echo ""
  echo "✅  Git repo already initialised."
  git config user.name "$GIT_NAME"
  git config user.email "$GIT_EMAIL"
fi

# 5. Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
*.local
.env
.env.*
EOF
echo "✅  .gitignore created."

# 6. Initial commit
echo ""
echo "📝 Staging all files..."
git add .
git status --short

echo ""
echo "💾 Creating initial commit..."
git commit -m "🏏 Initial commit — GullyCricket PWA v3.0

Features:
- Live match scoring with Free Hit & Undo
- Over-by-over scorecard
- Match summary + WhatsApp share
- Player of the Match selector
- Delete matches
- Custom overs per match
- Tournament management with add-teams-later
- 100-ball ball-by-ball match viewer
- Per-team player database
- Admin-only CSV player import (abhi.aero.thula@gmail.com)
- Export players to CSV
- Search/filter players & matches
- Tournament fixture generator
- Dark / light theme
- localStorage with debounced writes
- PWA ready"

# 7. Set remote
echo ""
echo "🔗 Setting remote origin to: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# 8. Push
echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "────────────────────────────────────"
echo "✅  Done! Your code is on GitHub."
echo "    $REPO_URL"
echo ""
echo "Next steps:"
echo "  npm install     — install dependencies"
echo "  npm run dev     — start dev server (localhost:5173)"
echo "  npm run build   — production build"
echo "  npx vercel --prod   — deploy to Vercel"
echo "────────────────────────────────────"
