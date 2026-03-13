# 🏏 GullyCricket PWA v3.0

## Quick Start
```bash
npm install && npm run dev
# → http://localhost:5173
```

## First-time Git Push
```bash
chmod +x setup-git.sh
./setup-git.sh
# Prompts for GitHub repo URL, your name/email, then pushes automatically
```

## Admin CSV Upload
Only `abhi.aero.thula@gmail.com` can import players via CSV.
To add more admins edit `src/utils/adminUtils.js` → `ADMIN_EMAILS` array.

CSV format (name + role only):
```
name,role
Arjun Mehta,Batsman
Rahul Verma,Bowler
```

## New in v3.0
- Over-by-over scorecard • Match summary • Player of the Match
- Delete matches • Custom overs • WhatsApp share
- Search matches & players • Admin CSV upload • Export CSV
- Add teams to existing tournaments • 100-ball ball view
- useMemo leaderboards • debounced localStorage
