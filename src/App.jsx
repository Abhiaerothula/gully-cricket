import{useEffect,useMemo,useState}from'react'
import{Activity,Home,Menu,Moon,Plus,Sun,Trophy,Users,X,Radio,Settings,Share2,Info}from'lucide-react'
import{C,THEMES}from'./data/constants.js'
import{DEFAULT_TEAMS_DB,DEFAULT_TOURNAMENTS,DEFAULT_CAPTAINS,MOCK_NOTICES}from'./data/seedData.js'
import{useStorage}from'./hooks/useStorage.js'
import{useFirebaseSync}from'./hooks/useFirebaseSync.js'
import{auth,db,firebaseEnabled}from'./lib/firebase.js'
import{createUserWithEmailAndPassword,onAuthStateChanged,signInWithEmailAndPassword,signOut}from'firebase/auth'
import{doc,serverTimestamp,setDoc}from'firebase/firestore'
import HomePage from'./pages/HomePage.jsx'
import ScorePage from'./pages/ScorePage.jsx'
import LeaguePage from'./pages/LeaguePage.jsx'
import PlayersPage from'./pages/PlayersPage.jsx'
import NewsPage from'./pages/NewsPage.jsx'

export default function App(){
  const[tab,setTab]=useState('home')
  const[theme,setTheme]=useStorage('theme','dark')
  const[localAuthUser,setLocalAuthUser]=useStorage('localAuthUser',null)
  const[authUser,setAuthUser]=useState(null)
  const[authLoading,setAuthLoading]=useState(firebaseEnabled)
  const[showAuth,setShowAuth]=useState(false)
  const[authMode,setAuthMode]=useState('login')
  const[authForm,setAuthForm]=useState({email:'',password:''})
  const[matches,setMatches]=useStorage('matches',[])
  const[teamsDB,setTeamsDB]=useStorage('teamsDB',DEFAULT_TEAMS_DB)
  const[tournaments,setTournaments]=useStorage('tournaments',DEFAULT_TOURNAMENTS)
  const[captainsDB,setCaptainsDB]=useStorage('captainsDB',DEFAULT_CAPTAINS)
  const[transferReqs,setTransferReqs]=useStorage('transferReqs',[])
  const[premium,setPremium]=useStorage('premium',false)
  const[notices,setNotices]=useStorage('notices',MOCK_NOTICES)
  const[showNewMatch,setShowNewMatch]=useState(false)
  const[activeScoring,setActiveScoring]=useState(null)
  const[noticeInput,setNoticeInput]=useState('')
  const[menuOpen,setMenuOpen]=useState(false)
  const css=THEMES[theme]
  const isDark=theme==='dark'
  const allPlayers=Object.values(teamsDB).flat()
  const adminEmails=['abhi.aero.thula@gmail.com',(import.meta.env.VITE_ADMIN_EMAIL||'').toLowerCase()].filter(Boolean)
  const isAdminEmail=e=>adminEmails.includes(e.toLowerCase())
  const activeUser=firebaseEnabled?authUser:localAuthUser
  const userEmail=activeUser?.email||''
  const playerProfile=allPlayers.find(p=>p.email&&userEmail&&p.email.toLowerCase()===userEmail.toLowerCase())
  const displayName=playerProfile?.name||userEmail
  const currentUser=useMemo(()=>({
    email:userEmail,
    name:displayName,
    role:userEmail?(isAdminEmail(userEmail)?'admin':'player'):'guest',
  }),[userEmail,displayName])
  const authSession={name:userEmail,authenticated:!!userEmail}
  const isLoggedIn=!!userEmail
  const leaderboards={
    orange:[...allPlayers].sort((a,b)=>b.runs-a.runs).slice(0,8),
    purple:[...allPlayers].sort((a,b)=>b.wickets-a.wickets).slice(0,8),
  }
  const postNotice=()=>{
    if(!noticeInput.trim())return
    setNotices(p=>[{id:Date.now(),author:'You',role:'Organizer',msg:noticeInput,time:'Just now',urgent:false},...p])
    setNoticeInput('')
  }
  useEffect(()=>{
    if(!firebaseEnabled||!auth){
      setAuthLoading(false)
      return
    }
    const unsub=onAuthStateChanged(auth,u=>{
      setAuthUser(u?{uid:u.uid,email:u.email||''}:null)
      setAuthLoading(false)
    })
    return()=>unsub()
  },[])

  useFirebaseSync({
    uid:firebaseEnabled?authUser?.uid:null,
    matches,setMatches,
    teamsDB,setTeamsDB,
    tournaments,setTournaments,
  })

  // Auto-create player profile on login for non-admin users
  useEffect(()=>{
    if(!userEmail||currentUser.role==='admin')return
    const emailLower=userEmail.toLowerCase()
    const alreadyExists=Object.values(teamsDB).flat().some(p=>p.email&&p.email.toLowerCase()===emailLower)
    if(alreadyExists)return
    const teams=Object.keys(teamsDB)
    if(!teams.length)return
    let team=teams.length===1?teams[0]:null
    if(!team){
      const choice=window.prompt(`Welcome! Choose your team:\n${teams.map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\nEnter team number:`)
      if(!choice)return
      const idx=parseInt(choice,10)-1
      if(idx>=0&&idx<teams.length)team=teams[idx]
      else return
    }
    const nameFromEmail=emailLower.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    const newPlayer={id:Date.now(),name:nameFromEmail,email:emailLower,photo:'',team,role:'Batsman',runs:0,wickets:0,catches:0,matches:0,balls:0,fours:0,sixes:0,innings:0}
    setTeamsDB(prev=>({...prev,[team]:[...(prev[team]||[]),newPlayer]}))
  },[userEmail,currentUser.role])

  const ADMIN_PASSWORD='ADMIN@12345'
  const submitAuth=async()=>{
    const email=authForm.email.trim().toLowerCase()
    const password=authForm.password
    if(!email||!password)return

    if(!firebaseEnabled||!auth){
      if(isAdminEmail(email)){
        if(password!==ADMIN_PASSWORD){window.alert('Invalid admin password.');return}
      }
      setLocalAuthUser({email})
      setShowAuth(false)
      setAuthForm({email:'',password:''})
      return
    }

    try{
      if(authMode==='register'){
        const cred=await createUserWithEmailAndPassword(auth,email,password)
        if(db){
          await setDoc(doc(db,'users',cred.user.uid),{email,createdAt:serverTimestamp(),lastLoginAt:serverTimestamp()},{merge:true})
        }
      }else{
        const cred=await signInWithEmailAndPassword(auth,email,password)
        if(db){
          await setDoc(doc(db,'users',cred.user.uid),{email,lastLoginAt:serverTimestamp()},{merge:true})
        }
      }
      setShowAuth(false)
      setAuthForm({email:'',password:''})
    }catch(err){
      window.alert(err?.message||'Authentication failed')
    }
  }

  const logoutCurrentUser=async()=>{
    if(firebaseEnabled&&auth){
      await signOut(auth)
    }else{
      setLocalAuthUser(null)
    }
  }
  const navItems=[
    {id:'home',icon:Home,label:'Home'},
    {id:'score',icon:Activity,label:'Score'},
    {id:'league',icon:Trophy,label:'League'},
    {id:'players',icon:Users,label:'Players'},
    {id:'news',icon:Radio,label:'News'},
  ]
  return(
    <div style={{minHeight:'100vh',background:css.bg,color:css.text,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      {/* HEADER */}
      <header style={{background:`linear-gradient(135deg,${C.darkGray},${C.black})`,padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50,borderBottom:`2px solid ${C.yellow}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:`0 0 12px ${C.yellow}55`}}>🏏</div>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:C.yellow,letterSpacing:'-0.5px',lineHeight:1}}>GullyCricket</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.45)',letterSpacing:2,textTransform:'uppercase'}}>Cricket Platform</div>
          </div>
        </div>
        {/* Desktop Horizontal Nav */}
        <nav className="desktop-nav">
          {navItems.map(n=>{
            const active=tab===n.id
            const Icon=n.icon
            return(
              <button key={n.id} onClick={()=>setTab(n.id)} style={{background:active?`${C.yellow}22`:'none',border:active?`1px solid ${C.yellow}55`:'1px solid transparent',borderRadius:10,padding:'8px 18px',cursor:'pointer',color:active?C.yellow:'rgba(255,255,255,0.7)',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:7,transition:'color 0.2s,background 0.2s'}}>
                <Icon size={15}/>{n.label}
              </button>
            )
          })}
        </nav>
        <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
          <button onClick={isLoggedIn?logoutCurrentUser:()=>setShowAuth(true)} style={{background:isLoggedIn?`${C.danger}22`:`${C.info}22`,border:`1px solid ${isLoggedIn?C.danger:C.info}55`,borderRadius:8,padding:'8px 10px',cursor:'pointer',color:isLoggedIn?C.danger:C.info,fontSize:11,fontWeight:800,whiteSpace:'nowrap'}}>{isLoggedIn?'Logout':'Login'}</button>
          {isLoggedIn&&<span style={{background:`${C.success}22`,border:`1px solid ${C.success}55`,borderRadius:8,padding:'8px 10px',color:C.success,fontSize:11,fontWeight:800,whiteSpace:'nowrap',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis'}}>{displayName}</span>}
          <button onClick={()=>{setActiveScoring(null);setTab('score');setShowNewMatch(true)}} className="desktop-only" style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:8,padding:'8px 18px',cursor:'pointer',color:C.black,fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:6}}>
            <Plus size={14}/>New Match
          </button>
          <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:8,cursor:'pointer',color:'rgba(255,255,255,0.8)',display:'flex',alignItems:'center'}}>
            {isDark?<Sun size={15}/>:<Moon size={15}/>}
          </button>
          <button className="mobile-menu-btn" onClick={()=>setMenuOpen(true)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:8,cursor:'pointer',color:'rgba(255,255,255,0.8)',display:'flex',alignItems:'center'}}><Menu size={15}/></button>
        </div>
      </header>
      {/* PAGES */}
      <main className="main-content" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
        {tab==='home'&&<HomePage css={css} isDark={isDark} matches={matches} setTab={setTab} setShowNewMatch={setShowNewMatch} setActiveScoring={setActiveScoring} notices={notices} leaderboards={leaderboards} allPlayers={allPlayers}/>} 
        {tab==='score'&&<ScorePage css={css} isDark={isDark} matches={matches} setMatches={setMatches} showNewMatch={showNewMatch} setShowNewMatch={setShowNewMatch} activeScoring={activeScoring} setActiveScoring={setActiveScoring} teamsDB={teamsDB} tournaments={tournaments} setTournaments={setTournaments} currentUser={currentUser} authSession={authSession}/>}
        {tab==='league'&&<LeaguePage css={css} isDark={isDark} tournaments={tournaments} setTournaments={setTournaments} teamsDB={teamsDB} currentUser={currentUser} authSession={authSession}/>} 
        {tab==='players'&&<PlayersPage css={css} isDark={isDark} teamsDB={teamsDB} setTeamsDB={setTeamsDB} captainsDB={captainsDB} setCaptainsDB={setCaptainsDB} transferReqs={transferReqs} setTransferReqs={setTransferReqs} premium={premium} setPremium={setPremium} currentUser={currentUser}/>} 
        {tab==='news'&&<NewsPage css={css} isDark={isDark} notices={notices} noticeInput={noticeInput} setNoticeInput={setNoticeInput} postNotice={postNotice}/>}
      </main>
      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav" style={{position:'fixed',bottom:0,left:0,right:0,background:css.nav,borderTop:`2px solid ${C.yellow}`,gridTemplateColumns:'repeat(5,1fr)',backdropFilter:'blur(16px)',zIndex:40}}>
        {navItems.map(n=>{
          const active=tab===n.id
          return(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{background:'none',border:'none',padding:'10px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',color:active?css.accent:css.sub,transition:'all 0.2s'}}>
              <n.icon size={20} strokeWidth={active?2.5:1.8}/>
              <span style={{fontSize:8,fontWeight:active?800:400,letterSpacing:0.8,textTransform:'uppercase'}}>{n.label}</span>
              {active&&<div style={{width:24,height:2,background:css.accent,borderRadius:2}}/>}
            </button>
          )
        })}
      </nav>
      {/* SLIDE MENU */}
      {menuOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:100}}>
          <div onClick={()=>setMenuOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)'}}/>
          <div style={{position:'absolute',right:0,top:0,bottom:0,width:300,background:css.card,borderLeft:`2px solid ${C.yellow}`,padding:24,display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontWeight:900,fontSize:18,color:css.accent}}>🏏 GullyCricket</span>
              <button onClick={()=>setMenuOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:css.text}}><X size={20}/></button>
            </div>
            {navItems.map(n=>{
              const Icon=n.icon
              return(
                <button key={n.id} onClick={()=>{setTab(n.id);setMenuOpen(false)}} style={{background:tab===n.id?`${css.accent}22`:'none',border:`1px solid ${tab===n.id?css.accent:css.border}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',color:tab===n.id?css.accent:css.text,fontSize:14,fontWeight:700}}><Icon size={16}/>{n.label}</button>
              )
            })}
            <div style={{background:isDark?C.midGray:C.offWhite,borderRadius:12,padding:12,border:`1px solid ${css.border}`,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{fontSize:10,color:css.sub,letterSpacing:0.8,textTransform:'uppercase'}}>Account</div>
              <button onClick={isLoggedIn?logoutCurrentUser:()=>setShowAuth(true)} style={{background:isLoggedIn?`${C.danger}22`:`${C.info}22`,border:`1px solid ${isLoggedIn?C.danger:C.info}55`,borderRadius:8,padding:'8px 10px',cursor:'pointer',color:isLoggedIn?C.danger:C.info,fontSize:11,fontWeight:800}}>{isLoggedIn?'Logout':'Login'}</button>
              {isLoggedIn&&<span style={{background:`${C.success}22`,border:`1px solid ${C.success}55`,borderRadius:8,padding:'8px 10px',color:C.success,fontSize:11,fontWeight:800,textAlign:'center',wordBreak:'break-all'}}>{displayName}</span>}
            </div>
            <div style={{marginTop:'auto',background:isDark?C.midGray:C.offWhite,borderRadius:12,padding:14,border:`1px solid ${C.yellow}33`}}>
              <div style={{fontSize:10,color:css.sub}}>Version</div>
              <div style={{fontSize:13,fontWeight:700,color:css.accent}}>GullyCricket v3.0</div>
              <div style={{fontSize:10,color:css.sub}}>© 2025 GullyCricket</div>
            </div>
          </div>
        </div>
      )}
      {showAuth&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',zIndex:130,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{width:'100%',maxWidth:420,background:css.card,border:`1px solid ${C.yellow}44`,borderRadius:14,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:16,fontWeight:900,color:css.accent}}>{authMode==='login'?'Login':'Create Account'}</div>
              <button onClick={()=>setShowAuth(false)} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={18}/></button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input type="email" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))} placeholder="Email" style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,color:css.text,outline:'none'}}/>
              <input type="password" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))} placeholder="Password" style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,color:css.text,outline:'none'}}/>
              <button onClick={submitAuth} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:9,padding:11,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer'}}>{authMode==='login'?'Login':'Create Account'}</button>
              <button onClick={()=>setAuthMode(m=>m==='login'?'register':'login')} style={{background:'none',border:'none',color:C.info,cursor:'pointer',fontSize:12,fontWeight:700}}>{authMode==='login'?'Need an account? Register':'Already have an account? Login'}</button>
              {!firebaseEnabled&&<div style={{fontSize:11,color:css.sub}}>Firebase is not configured. Using local login only in this browser.</div>}
              {authLoading&&<div style={{fontSize:11,color:css.sub}}>Checking auth session...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
