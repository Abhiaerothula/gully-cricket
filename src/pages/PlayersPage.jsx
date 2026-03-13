import { useState, useMemo, useRef } from 'react'
import { Plus, X, UserPlus, Trash2, Edit3, Database, Download, Upload, Shield, LogOut, Search } from 'lucide-react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { C, ROLES, COLORS_BAR } from '../data/constants.js'
import { GSection, PAv, GIn, Empty } from '../components/Shared.jsx'
import { isAdmin, getAdminSession, setAdminSession, clearAdminSession } from '../utils/adminUtils.js'
import { parsePlayerCSV, exportPlayersCSV, generateCSVTemplate } from '../utils/ballUtils.js'

// ── Admin Login Panel ──────────────────────────────────────────────────────────
function AdminLogin({ css, onLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const attempt = () => {
    if (isAdmin(email)) { onLogin(email); setError('') }
    else setError('This email is not an admin. Contact the app owner.')
  }
  return (
    <div style={{ background:css.card, borderRadius:16, padding:20, border:`2px solid ${C.yellow}44` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <Shield size={20} color={C.yellow}/>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:C.yellow }}>Admin Access</div>
          <div style={{ fontSize:11, color:css.sub }}>CSV upload is restricted to admins</div>
        </div>
      </div>
      <GIn label="Your email address" value={email} onChange={setEmail} css={css} ph="you@example.com" type="email"/>
      {error && <div style={{ fontSize:11, color:C.danger, marginTop:8 }}>⚠️ {error}</div>}
      <button onClick={attempt} style={{ width:'100%', marginTop:12, background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`, border:'none', borderRadius:10, padding:12, fontSize:13, fontWeight:800, color:C.black, cursor:'pointer' }}>
        Verify Admin →
      </button>
    </div>
  )
}

// ── CSV Upload Panel ───────────────────────────────────────────────────────────
function CSVUpload({ team, css, onImport, onClose }) {
  const [text, setText]       = useState('')
  const [preview, setPreview] = useState([])
  const [error, setError]     = useState('')
  const fileRef               = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => { setText(e.target.result); handleParse(e.target.result) }
    reader.readAsText(file)
  }
  const handleParse = (raw) => {
    const players = parsePlayerCSV(raw || text)
    if (!players.length) { setError('Could not parse CSV. Make sure it has a "name" column.'); setPreview([]); return }
    setError(''); setPreview(players)
  }
  const downloadTemplate = () => {
    const blob = new Blob([generateCSVTemplate()], { type:'text/csv' })
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='players_template.csv'; a.click()
  }

  return (
    <div style={{ background:css.card, borderRadius:16, padding:16, border:`2px solid ${C.yellow}44` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontWeight:800, fontSize:14, color:C.yellow }}>📂 Import Players via CSV</div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:css.sub }}><X size={16}/></button>
      </div>
      <div style={{ fontSize:11, color:css.sub, marginBottom:12 }}>
        Importing into: <span style={{ color:C.yellow, fontWeight:700 }}>{team}</span>
      </div>

      {/* Template download */}
      <button onClick={downloadTemplate} style={{ width:'100%', marginBottom:12, background:`${C.info}22`, border:`1px solid ${C.info}44`, borderRadius:8, padding:'8px 12px', fontSize:11, fontWeight:700, color:C.info, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <Download size={13}/> Download CSV Template
      </button>

      {/* File picker */}
      <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
      <button onClick={()=>fileRef.current?.click()} style={{ width:'100%', marginBottom:10, background:`${C.yellow}15`, border:`2px dashed ${C.yellow}55`, borderRadius:10, padding:'14px 12px', fontSize:12, fontWeight:700, color:C.yellow, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <Upload size={14}/> Pick CSV File
      </button>

      {/* Or paste */}
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={'Or paste CSV here:\nname,role\nArjun Mehta,Batsman\nRahul Verma,Bowler'}
        style={{ width:'100%', background:css.bg, border:`1px solid ${css.border}`, borderRadius:8, padding:10, fontSize:12, color:css.text, resize:'none', minHeight:90, boxSizing:'border-box', outline:'none', marginBottom:8 }}/>
      <button onClick={()=>handleParse()} style={{ width:'100%', marginBottom:12, background:css.card2, border:`1px solid ${css.border}`, borderRadius:8, padding:'8px 12px', fontSize:11, fontWeight:700, color:css.text, cursor:'pointer' }}>
        Preview →
      </button>

      {error && <div style={{ fontSize:11, color:C.danger, marginBottom:10 }}>⚠️ {error}</div>}

      {/* Preview */}
      {preview.length>0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.success, fontWeight:700, marginBottom:8 }}>✅ {preview.length} players found</div>
          <div style={{ background:css.bg, borderRadius:8, padding:8, maxHeight:120, overflowY:'auto', border:`1px solid ${css.border}` }}>
            {preview.map((p,i)=>(
              <div key={i} style={{ fontSize:11, color:css.text, padding:'2px 0', borderBottom:i<preview.length-1?`1px solid ${css.border}`:'none' }}>
                {p.name} <span style={{ color:css.sub }}>— {p.role}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>onImport(preview)} style={{ width:'100%', marginTop:10, background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`, border:'none', borderRadius:10, padding:12, fontSize:13, fontWeight:800, color:C.black, cursor:'pointer', boxShadow:`0 4px 12px ${C.yellow}33` }}>
            ✅ Import {preview.length} Players
          </button>
        </div>
      )}
    </div>
  )
}

// ── Players Page ───────────────────────────────────────────────────────────────
export default function PlayersPage({ css, isDark, teamsDB, setTeamsDB }) {
  const [selTeam,   setSelTeam]   = useState(Object.keys(teamsDB)[0]||'')
  const [showAdd,   setShowAdd]   = useState(false)
  const [showAddT,  setShowAddT]  = useState(false)
  const [newTName,  setNewTName]  = useState('')
  const [editP,     setEditP]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [pForm,     setPForm]     = useState({ name:'', role:'Batsman', runs:'0', wickets:'0', catches:'0', matches:'0', balls:'0', fours:'0', sixes:'0' })
  // Admin
  const [adminEmail, setAdminEmail] = useState(() => getAdminSession())
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showCSV,   setShowCSV]   = useState(false)
  const loggedIn = adminEmail && isAdmin(adminEmail)

  const teams    = Object.keys(teamsDB)
  const teamPls  = selTeam ? (teamsDB[selTeam]||[]) : []
  const roleColor = r => r==='Batsman'?C.yellow:r==='Bowler'?C.danger:r==='All-Rounder'?C.success:'#9b59b6'
  const resetForm = () => setPForm({ name:'', role:'Batsman', runs:'0', wickets:'0', catches:'0', matches:'0', balls:'0', fours:'0', sixes:'0' })

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase()
    return teamPls.filter(p => !q || p.name.toLowerCase().includes(q) || (p.role||'').toLowerCase().includes(q))
  }, [teamPls, search])

  const savePlayer = () => {
    if (!pForm.name.trim()) return
    const p = { id:editP?editP.id:Date.now(), name:pForm.name, team:selTeam, role:pForm.role,
      runs:+pForm.runs||0, wickets:+pForm.wickets||0, catches:+pForm.catches||0,
      matches:+pForm.matches||0, balls:+pForm.balls||0, fours:+pForm.fours||0, sixes:+pForm.sixes||0, innings:+pForm.matches||0 }
    setTeamsDB(prev=>({...prev,[selTeam]:editP
      ? (prev[selTeam]||[]).map(x=>x.id===editP.id?p:x)
      : [...(prev[selTeam]||[]),p]}))
    setShowAdd(false); setEditP(null); resetForm()
  }

  const delPlayer = pid => setTeamsDB(prev=>({...prev,[selTeam]:(prev[selTeam]||[]).filter(p=>p.id!==pid)}))

  const openEdit = p => {
    setEditP(p)
    setPForm({ name:p.name, role:p.role||'Batsman', runs:''+p.runs, wickets:''+p.wickets, catches:''+p.catches, matches:''+p.matches, balls:''+p.balls, fours:''+p.fours, sixes:''+p.sixes })
    setShowAdd(true)
  }

  const addTeam = () => {
    if (!newTName.trim()) return
    setTeamsDB(prev=>({...prev,[newTName.trim()]:[] }))
    setSelTeam(newTName.trim()); setNewTName(''); setShowAddT(false)
  }

  const importCSV = (players) => {
    const newPlayers = players.map(p => ({
      id:Date.now()+Math.random(), name:p.name, team:selTeam, role:p.role,
      runs:0, wickets:0, catches:0, matches:0, balls:0, fours:0, sixes:0, innings:0
    }))
    setTeamsDB(prev=>({...prev,[selTeam]:[...(prev[selTeam]||[]),...newPlayers]}))
    setShowCSV(false)
  }

  const exportCSV = () => {
    const all = Object.values(teamsDB).flat()
    const csv = exportPlayersCSV(all)
    const blob = new Blob([csv], { type:'text/csv' })
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='gullycricket_players.csv'; a.click()
  }

  const handleAdminLogin = (email) => { setAdminSession(email); setAdminEmail(email); setShowAdminLogin(false) }
  const handleAdminLogout = () => { clearAdminSession(); setAdminEmail(null); setShowCSV(false) }

  return (
    <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:12 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:900, fontSize:16, display:'flex', alignItems:'center', gap:8 }}><Database size={16} color={C.yellow}/> Players DB</div>
          <div style={{ fontSize:11, color:css.sub }}>{Object.values(teamsDB).flat().length} players · {teams.length} teams</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={exportCSV} title="Export all players" style={{ background:`${C.info}22`, border:`1px solid ${C.info}44`, borderRadius:8, padding:'7px 10px', fontSize:11, fontWeight:700, color:C.info, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <Download size={12}/> Export
          </button>
          <button onClick={()=>setShowAddT(true)} style={{ background:`${C.yellow}22`, border:`1px solid ${C.yellow}44`, borderRadius:8, padding:'7px 10px', fontSize:11, fontWeight:700, color:C.yellow, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <Plus size={12}/> Team
          </button>
        </div>
      </div>

      {/* Admin bar */}
      <div style={{ background:css.card, borderRadius:10, padding:'10px 12px', border:`1px solid ${loggedIn?C.yellow+'44':css.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {loggedIn ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Shield size={14} color={C.yellow}/>
              <span style={{ fontSize:11, color:C.yellow, fontWeight:700 }}>Admin: {adminEmail}</span>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setShowCSV(v=>!v)} style={{ background:`${C.yellow}22`, border:`1px solid ${C.yellow}44`, borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, color:C.yellow, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                <Upload size={11}/> CSV Upload
              </button>
              <button onClick={handleAdminLogout} style={{ background:`${C.danger}22`, border:`1px solid ${C.danger}33`, borderRadius:7, padding:'5px 8px', cursor:'pointer', color:C.danger, display:'flex', alignItems:'center' }}><LogOut size={12}/></button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Shield size={14} color={css.sub}/>
              <span style={{ fontSize:11, color:css.sub }}>CSV upload requires admin access</span>
            </div>
            <button onClick={()=>setShowAdminLogin(v=>!v)} style={{ background:`${C.yellow}22`, border:`1px solid ${C.yellow}44`, borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, color:C.yellow, cursor:'pointer' }}>
              Login
            </button>
          </>
        )}
      </div>

      {/* Admin login form */}
      {showAdminLogin && !loggedIn && <AdminLogin css={css} onLogin={handleAdminLogin}/>}

      {/* CSV upload panel */}
      {showCSV && loggedIn && selTeam && (
        <CSVUpload team={selTeam} css={css} onImport={importCSV} onClose={()=>setShowCSV(false)}/>
      )}

      {/* Add team */}
      {showAddT && (
        <div style={{ background:css.card, borderRadius:12, padding:14, border:`1px solid ${C.yellow}44` }}>
          <div style={{ fontSize:12, color:C.yellow, fontWeight:700, marginBottom:8 }}>New Team</div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={newTName} onChange={e=>setNewTName(e.target.value)} placeholder="Team name"
              style={{ flex:1, background:css.bg, border:`1px solid ${css.border}`, borderRadius:8, padding:'8px 12px', fontSize:13, color:css.text, outline:'none' }}
              onKeyDown={e=>e.key==='Enter'&&addTeam()}/>
            <button onClick={addTeam} style={{ background:C.yellow, border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:800, color:C.black, cursor:'pointer' }}>Add</button>
            <button onClick={()=>setShowAddT(false)} style={{ background:'none', border:`1px solid ${css.border}`, borderRadius:8, padding:'8px 10px', cursor:'pointer', color:css.sub }}><X size={14}/></button>
          </div>
        </div>
      )}

      {/* Team tabs */}
      <div style={{ overflowX:'auto', display:'flex', gap:8, paddingBottom:4 }}>
        {teams.map(t=>(
          <button key={t} onClick={()=>{setSelTeam(t);setSearch('')}} style={{ background:selTeam===t?C.yellow:css.card, color:selTeam===t?C.black:css.text, border:`1px solid ${selTeam===t?C.yellow:css.border}`, borderRadius:20, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            {t} <span style={{ fontSize:10, opacity:0.7 }}>({(teamsDB[t]||[]).length})</span>
          </button>
        ))}
      </div>

      {/* Add player button */}
      {selTeam && (
        <button onClick={()=>{ setEditP(null); resetForm(); setShowAdd(true) }} style={{ background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`, border:'none', borderRadius:10, padding:12, fontSize:13, fontWeight:800, color:C.black, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 4px 12px ${C.yellow}33` }}>
          <UserPlus size={15}/> Add Player to {selTeam}
        </button>
      )}

      {/* Add/edit form */}
      {showAdd && (
        <div style={{ background:css.card, borderRadius:16, padding:16, border:`1px solid ${C.yellow}44` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontWeight:800, fontSize:14, color:C.yellow }}>{editP?'Edit Player':'Add Player'}</span>
            <button onClick={()=>{ setShowAdd(false); setEditP(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:css.sub }}><X size={16}/></button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <GIn label="Player Name *" value={pForm.name} onChange={v=>setPForm(f=>({...f,name:v}))} css={css}/>
            <div>
              <label style={{ fontSize:12, color:css.sub, display:'block', marginBottom:6 }}>Role</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
                {ROLES.map(r=><button key={r} onClick={()=>setPForm(f=>({...f,role:r}))} style={{ background:pForm.role===r?`${roleColor(r)}22`:css.bg, color:pForm.role===r?roleColor(r):css.text, border:`1px solid ${pForm.role===r?roleColor(r):css.border}`, borderRadius:8, padding:'8px 6px', fontSize:11, fontWeight:700, cursor:'pointer' }}>{r}</button>)}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[{k:'matches',l:'Matches'},{k:'runs',l:'Runs'},{k:'balls',l:'Balls'},{k:'wickets',l:'Wickets'},{k:'fours',l:'4s'},{k:'sixes',l:'6s'},{k:'catches',l:'Catches'}].map(({k,l})=>(
                <div key={k}>
                  <label style={{ fontSize:10, color:css.sub, display:'block', marginBottom:4 }}>{l}</label>
                  <input type="number" value={pForm[k]} onChange={e=>setPForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:'100%', background:css.bg, border:`1px solid ${css.border}`, borderRadius:8, padding:'8px 10px', fontSize:13, color:css.text, boxSizing:'border-box', outline:'none' }}/>
                </div>
              ))}
            </div>
            <button onClick={savePlayer} style={{ background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`, border:'none', borderRadius:10, padding:12, fontSize:13, fontWeight:800, color:C.black, cursor:'pointer', boxShadow:`0 4px 12px ${C.yellow}44` }}>
              {editP?'💾 Save Changes':'✅ Add Player'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {selTeam && teamPls.length > 3 && (
        <div style={{ position:'relative' }}>
          <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:css.sub }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players..."
            style={{ width:'100%', background:css.card, border:`1px solid ${css.border}`, borderRadius:10, padding:'9px 12px 9px 32px', fontSize:13, color:css.text, boxSizing:'border-box', outline:'none' }}/>
        </div>
      )}

      {/* Player list */}
      {selTeam && (
        <GSection title={`👥 ${selTeam.toUpperCase()} (${teamPls.length})`} css={css}>
          {teamPls.length===0 && <Empty icon="👤" text={`No players in ${selTeam} yet.`}/>}
          {filteredPlayers.length===0 && teamPls.length>0 && <Empty icon="🔍" text={`No players matching "${search}"`}/>}
          {filteredPlayers.map((p,i)=>{
            const sr = p.balls>0 ? ((p.runs/p.balls)*100).toFixed(0) : '—'
            return (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:i<filteredPlayers.length-1?`1px solid ${css.border}`:'none' }}>
                <PAv name={p.name} size={42}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{p.name}</span>
                    <span style={{ fontSize:9, background:`${roleColor(p.role||'Batsman')}22`, color:roleColor(p.role||'Batsman'), padding:'1px 6px', borderRadius:10, fontWeight:700 }}>{p.role||'—'}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, fontSize:11, color:css.sub }}>
                    <span style={{ color:C.yellow, fontWeight:700 }}>{p.runs}r</span>
                    <span>{p.wickets}w</span>
                    <span>SR:{sr}</span>
                    <span>{p.fours}×4</span>
                    <span>{p.sixes}×6</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(p)} style={{ background:`${C.yellow}22`, border:`1px solid ${C.yellow}33`, borderRadius:8, padding:7, cursor:'pointer', color:C.yellow, display:'flex', alignItems:'center' }}><Edit3 size={13}/></button>
                  <button onClick={()=>delPlayer(p.id)} style={{ background:`${C.danger}22`, border:`1px solid ${C.danger}33`, borderRadius:8, padding:7, cursor:'pointer', color:C.danger, display:'flex', alignItems:'center' }}><Trash2 size={13}/></button>
                </div>
              </div>
            )
          })}
        </GSection>
      )}

      {/* Team stats chart */}
      {selTeam && teamPls.length > 0 && (
        <GSection title="📊 TEAM STATS" css={css}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:12 }}>
            {[
              {label:'Total Runs',   value:teamPls.reduce((s,p)=>s+p.runs,0),    color:C.yellow},
              {label:'Wickets',      value:teamPls.reduce((s,p)=>s+p.wickets,0), color:'#9b59b6'},
              {label:'Sixes',        value:teamPls.reduce((s,p)=>s+p.sixes,0),   color:C.success},
              {label:'Fours',        value:teamPls.reduce((s,p)=>s+p.fours,0),   color:C.info},
            ].map(s=>(
              <div key={s.label} style={{ background:css.card2, borderRadius:10, padding:'12px 10px', border:`1px solid ${css.border}`, textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, color:css.sub, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={teamPls.slice(0,6)} margin={{top:4,right:4,bottom:4,left:-24}}>
              <CartesianGrid strokeDasharray="3 3" stroke={css.border}/>
              <XAxis dataKey="name" tick={{fontSize:9,fill:css.sub}} tickFormatter={n=>n.split(' ')[0]}/>
              <YAxis tick={{fontSize:9,fill:css.sub}}/>
              <Tooltip contentStyle={{background:css.card,border:`1px solid ${css.border}`,borderRadius:8,fontSize:11}}/>
              <Bar dataKey="runs" radius={[4,4,0,0]}>
                {teamPls.slice(0,6).map((_,i)=><Cell key={i} fill={COLORS_BAR[i%COLORS_BAR.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GSection>
      )}
    </div>
  )
}
