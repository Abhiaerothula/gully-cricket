# 🏏 GullyCricket PWA v3.0

WEBSITE and APP for GullyCricket

## Quick Start
```bash
npm install
npm run dev
# → http://localhost:5173
```

## New in v3.0
- ✅ **100 Balls View** — Every tournament match shows all 100 balls, grouped by over with colour-coded dots (4=green, 6=yellow, W=red, Wd=orange, NB=amber)
- ✅ **Add Teams to Existing Tournament** — Open any tournament → Teams tab → "Add Team" button
- ✅ **Ball Summary Legend** — Shows count of each ball type per innings

## Folder Structure
```
src/
├── App.jsx              ← Root + nav + header
├── main.jsx
├── index.css
├── data/
│   ├── constants.js     ← Palette, themes, formats
│   └── seedData.js      ← Players, tournaments, 100-ball match data
├── hooks/useStorage.js
├── components/Shared.jsx
└── pages/
    ├── HomePage.jsx
    ├── ScorePage.jsx    ← Live scorer, Free Hit, Undo
    ├── LeaguePage.jsx   ← Tournaments + 100 balls + Add Teams
    ├── PlayersPage.jsx
    └── NewsPage.jsx
```

## Deploy
```bash
npm run build
npx vercel --prod
```
