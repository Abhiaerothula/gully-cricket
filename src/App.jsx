import{useState,useMemo}from'react'
import{Activity,Home,Menu,Moon,Sun,Trophy,Users,X,Radio,Settings,Share2,Info}from'lucide-react'
import{C,THEMES}from'./data/constants.js'
import{DEFAULT_TEAMS_DB,DEFAULT_TOURNAMENTS,MOCK_NOTICES}from'./data/seedData.js'
import{useStorage}from'./hooks/useStorage.js'
import HomePage from'./pages/HomePage.jsx'
import ScorePage from'./pages/ScorePage.jsx'
import LeaguePage from'./pages/LeaguePage.jsx'
import PlayersPage from'./pages/PlayersPage.jsx'
import NewsPage from'./pages/NewsPage.jsx'

export default function App(){
  const[tab,setTab]=useState('home')
  const[theme,setTheme]=useStorage('theme','dark')
  const[matches,setMatches]=useStorage('matches',[])
  const[teamsDB,setTeamsDB]=useStorage('teamsDB',DEFAULT_TEAMS_DB)
  const[tournaments,setTournaments]=useStorage('tournaments',DEFAULT_TOURNAMENTS)
  const[notices,setNotices]=useState(MOCK_NOTICES)
  const[showNewMatch,setShowNewMatch]=useState(false)
  const[activeScoring,setActiveScoring]=useState(null)
  const[noticeInput,setNoticeInput]=useState('')
  const[menuOpen,setMenuOpen]=useState(false)
  const css=THEMES[theme]
  const isDark=theme==='dark'
  const allPlayers=useMemo(()=>Object.values(teamsDB).flat(),[teamsDB])
  const leaderboards=useMemo(()=>({
    orange:[...allPlayers].sort((a,b)=>b.runs-a.runs).slice(0,8),
    purple:[...allPlayers].sort((a,b)=>b.wickets-a.wickets).slice(0,8),
  }),[allPlayers])
  const postNotice=()=>{
    if(!noticeInput.trim())return
    setNotices(p=>[{id:Date.now(),author:'You',role:'Organizer',msg:noticeInput,time:'Just now',urgent:false},...p])
    setNoticeInput('')
  }
  const navItems=[
    {id:'home',icon:Home,label:'Home'},
    {id:'score',icon:Activity,label:'Score'},
    {id:'league',icon:Trophy,label:'League'},
    {id:'players',icon:Users,label:'Players'},
    {id:'news',icon:Radio,label:'News'},
  ]
  return(
    <div style={{minHeight:'100vh',background:css.bg,color:css.text,fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:480,margin:'0 auto',position:'relative',paddingBottom:72}}>
      {/* HEADER — always dark so logo/brand stays crisp */}
      <header style={{background:css.header,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50,borderBottom:`2px solid ${C.yellow}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 0 12px ${C.yellow}55`}}>🏏</div>
          <div>
            <div style={{fontWeight:900,fontSize:17,color:C.yellow,letterSpacing:'-0.5px',lineHeight:1}}>GullyCricket</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',letterSpacing:2,textTransform:'uppercase'}}>Cricket Platform v3</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:7,cursor:'pointer',color:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center'}}>
            {isDark?<Sun size={15}/>:<Moon size={15}/>}
          </button>
          <button onClick={()=>setMenuOpen(true)} style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:7,cursor:'pointer',color:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center'}}><Menu size={15}/></button>
        </div>
      </header>
      {/* SPONSOR */}
      <div style={{background:isDark?C.midGray:'#E0E0E0',padding:'5px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${css.border}`}}>
        <span style={{fontSize:9,color:css.sub,letterSpacing:1}}>POWERED BY</span>
        <span style={{fontSize:11,fontWeight:800,color:isDark?C.yellow:'#7A6000'}}>⚡ PowerPlay Energy Drinks</span>
        <span style={{fontSize:9,color:css.sub}}>Sponsor Slot</span>
      </div>
      {/* PAGES */}
      <main>
        {tab==='home'   &&<HomePage    css={css} isDark={isDark} matches={matches} setTab={setTab} setShowNewMatch={setShowNewMatch} notices={notices} leaderboards={leaderboards} allPlayers={allPlayers}/>}
        {tab==='score'  &&<ScorePage   css={css} isDark={isDark} matches={matches} setMatches={setMatches} showNewMatch={showNewMatch} setShowNewMatch={setShowNewMatch} activeScoring={activeScoring} setActiveScoring={setActiveScoring} teamsDB={teamsDB}/>}
        {tab==='league' &&<LeaguePage  css={css} isDark={isDark} tournaments={tournaments} setTournaments={setTournaments} teamsDB={teamsDB}/>}
        {tab==='players'&&<PlayersPage css={css} isDark={isDark} teamsDB={teamsDB} setTeamsDB={setTeamsDB}/>}
        {tab==='news'   &&<NewsPage    css={css} isDark={isDark} notices={notices} noticeInput={noticeInput} setNoticeInput={setNoticeInput} postNotice={postNotice}/>}
      </main>
      {/* BOTTOM NAV */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:css.nav,borderTop:`2px solid ${C.yellow}`,display:'grid',gridTemplateColumns:'repeat(5,1fr)',backdropFilter:'blur(16px)',zIndex:40,boxShadow:'0 -2px 12px rgba(0,0,0,0.15)'}}>
        {navItems.map(n=>{const active=tab===n.id;return(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:'none',border:'none',padding:'10px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',color:active?C.yellow:css.sub,transition:'all 0.2s'}}>
            <n.icon size={20} strokeWidth={active?2.5:1.8}/>
            <span style={{fontSize:8,fontWeight:active?800:400,letterSpacing:0.8,textTransform:'uppercase'}}>{n.label}</span>
            {active&&<div style={{width:24,height:2,background:C.yellow,borderRadius:2}}/>}
          </button>
        )})}
      </nav>
      {/* SLIDE MENU */}
      {menuOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:100}}>
          <div onClick={()=>setMenuOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)'}}/>
          <div style={{position:'absolute',right:0,top:0,bottom:0,width:270,background:css.card,borderLeft:`2px solid ${C.yellow}`,padding:20,display:'flex',flexDirection:'column',gap:10,boxShadow:'-4px 0 20px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontWeight:900,fontSize:18,color:C.yellow}}>Menu</span>
              <button onClick={()=>setMenuOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:css.text}}><X size={20}/></button>
            </div>
            {[{icon:Settings,label:'Settings'},{icon:Share2,label:'Share App'},{icon:Info,label:'About GullyCricket'}].map(m=>(
              <button key={m.label} style={{background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',border:`1px solid ${css.border}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',color:css.text,fontSize:13,fontWeight:500}}>
                <m.icon size={15} color={C.yellow}/>{m.label}
              </button>
            ))}
            <div style={{marginTop:'auto',background:isDark?C.midGray:'#F0E8C8',borderRadius:12,padding:14,border:`1px solid ${C.yellow}44`}}>
              <div style={{fontSize:10,color:css.sub}}>App Version</div>
              <div style={{fontSize:13,fontWeight:700,color:isDark?C.yellow:'#7A6000'}}>GullyCricket PWA v3.0</div>
              <div style={{fontSize:10,color:css.sub}}>© 2025 GullyCricket</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
