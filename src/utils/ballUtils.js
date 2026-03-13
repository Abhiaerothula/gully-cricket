import { C } from '../data/constants.js'

/** Returns {bg, col} for a ball log string */
export function ballStyle(b, isDark = true) {
  if (!b) return { bg: isDark ? C.midGray : C.lightGray, col: isDark ? '#fff' : C.black }
  if (b.startsWith('FH')) return { bg: C.info,    col: '#fff' }
  if (b.startsWith('W'))  return { bg: C.danger,  col: '#fff' }
  if (b.startsWith('NB')) return { bg: C.warn,    col: C.black }
  if (b.startsWith('Wd')) return { bg: '#FF6B35', col: '#fff' }
  if (b.startsWith('B'))  return { bg: '#8B5CF6', col: '#fff' }
  if (b.startsWith('LB')) return { bg: '#6366F1', col: '#fff' }
  if (b === '6')          return { bg: C.yellow,  col: C.black }
  if (b === '4')          return { bg: C.success, col: '#fff' }
  if (b === '0')          return { bg: '#2A2A2A', col: '#555' }
  return { bg: isDark ? C.midGray : C.lightGray, col: isDark ? '#fff' : C.black }
}

/** Glow shadow for special balls */
export function ballGlow(b) {
  if (b === '6')           return `0 0 8px ${C.yellow}88`
  if (b === '4')           return `0 0 6px ${C.success}66`
  if (b === 'W')           return `0 0 6px ${C.danger}66`
  if (b?.startsWith('NB')) return `0 0 0 2px ${C.yellow}`
  return 'none'
}

/** Group a ballLog array into overs (6 legal balls each) */
export function groupIntoOvers(balls) {
  const overs = []
  let cur = [], legal = 0
  balls.forEach((b, i) => {
    cur.push({ b, i })
    const isExtra = b.startsWith('Wd') || b.startsWith('NB')
    if (!isExtra) legal++
    if (legal === 6) { overs.push([...cur]); cur = []; legal = 0 }
  })
  if (cur.length) overs.push(cur)
  return overs
}

/** Runs scored in an over array */
export function overRuns(over) {
  return over.reduce((s, { b }) => {
    if (b.startsWith('Wd') || b.startsWith('NB')) return s + 1
    if (b === '4') return s + 4
    if (b === '6') return s + 6
    if (b === 'W') return s
    return s + (parseInt(b) || 0)
  }, 0)
}

/** Match result string */
export function matchResult(match) {
  const i0 = match.innings?.[0], i1 = match.innings?.[1]
  if (!i0 || !i1 || match.status !== 'completed') return null
  if (i1.score > i0.score) {
    const diff = 10 - i1.wickets
    return `${i1.batting} won by ${diff} wicket${diff !== 1 ? 's' : ''}`
  } else if (i0.score > i1.score) {
    const diff = i0.score - i1.score
    return `${i0.batting} won by ${diff} run${diff !== 1 ? 's' : ''}`
  }
  return 'Match tied'
}

/** Top scorer in an innings (from teamsDB) */
export function topScorer(innings, teamsDB) {
  if (!innings?.batting) return null
  const players = teamsDB?.[innings.batting] || []
  return players.length ? players.reduce((a, b) => b.runs > a.runs ? b : a, players[0]) : null
}

/** Generate CSV template string */
export function generateCSVTemplate() {
  return 'name,role\nArjun Mehta,Batsman\nRahul Verma,Bowler\nPriya Sharma,All-Rounder\nKiran Nair,Wicket-Keeper\n'
}

/** Parse CSV text → array of {name, role} */
export function parsePlayerCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (!lines.length) return []
  const header = lines[0].toLowerCase().split(',').map(h => h.trim())
  const nameIdx = header.indexOf('name')
  const roleIdx = header.indexOf('role')
  if (nameIdx === -1) return []
  const VALID_ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim())
    const name = cols[nameIdx] || ''
    const rawRole = cols[roleIdx] || 'Batsman'
    const role = VALID_ROLES.find(r => r.toLowerCase() === rawRole.toLowerCase()) || 'Batsman'
    return { name, role }
  }).filter(p => p.name)
}

/** Export players array to CSV string (full stats) */
export function exportPlayersCSV(players) {
  const header = 'name,team,role,matches,runs,balls,wickets,catches,fours,sixes'
  const rows = players.map(p =>
    [p.name, p.team, p.role, p.matches, p.runs, p.balls, p.wickets, p.catches, p.fours, p.sixes].join(',')
  )
  return [header, ...rows].join('\n')
}

/** Generate round-robin fixtures for a list of teams */
export function generateFixtures(teams) {
  const fixtures = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({ home: teams[i], away: teams[j], result: null })
    }
  }
  return fixtures
}
