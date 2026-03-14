import{useState}from'react'
import{Plus,X,ChevronRight,UserPlus,Trash2,Calendar,Play,UserCheck,MapPin,RotateCcw,ChevronDown}from'lucide-react'
import{BarChart,Bar,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer}from'recharts'
import{C,FORMATS,COLORS_BAR}from'../data/constants.js'
import{GSection,PAv,GIn,MatchCard}from'../components/Shared.jsx'
import{generateFixtures}from'../utils/ballUtils.js'

// Ball dot renderer
function BallDot({b,size=28,isDark=true}){
  let bg=isDark?C.midGray:'#CCCCCC',col=isDark?'#fff':C.black
  if(b==='6'){bg=C.yellow;col=C.black}
  else if(b==='4'){bg=C.success;col='#fff'}
  else if(b==='W'){bg=C.danger;col='#fff'}
  else if(b&&b.startsWith('NB')){bg=C.warn;col=C.black}
  else if(b&&b.startsWith('Wd')){bg='#FF6B35';col='#fff'}
  else if(b==='0'){bg=isDark?'#333':'#AAAAAA';col=isDark?'#888':C.black}
  return(
    <div style={{width:size,height:size,borderRadius:'50%',background:bg,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.3,fontWeight:700,flexShrink:0,boxShadow:b==='6'?`0 0 6px ${C.yellow}66`:b==='W'?`0 0 4px ${C.danger}66`:b==='4'?`0 0 4px ${C.success}66`:'none'}}>{b}</div>
  )
}

// 100 balls display grouped into overs
function BallsView({innings,css,isDark}){
  const[show100,setShow100]=useState(false)
  if(!innings||!innings.ballLog||innings.ballLog.length===0)return(
    <div style={{textAlign:'center',padding:20,color:css.sub,fontSize:13}}>No ball data yet.</div>
  )
  const balls=innings.ballLog
  const total=balls.length
  // group into overs of 6 legal balls
  const overs=[]
  let cur=[]
  let legalCount=0
  balls.forEach((b,i)=>{
    cur.push({b,i})
    const isExtra=b.startsWith('Wd')||b.startsWith('NB')
    if(!isExtra)legalCount++
    if(legalCount===6&&!isExtra){overs.push([...cur]);cur=[];legalCount=0}
  })
  if(cur.length)overs.push(cur)
  const displayOvers=show100?overs:overs.slice(0,3)
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{fontSize:11,color:css.sub}}>{innings.batting} · {innings.score}/{innings.wickets} ({innings.oversDisplay||'0.0'}) · <span style={{color:css.accent,fontWeight:700}}>{total} balls</span></span>
      </div>
      {displayOvers.map((over,oi)=>(
        <div key={oi} style={{marginBottom:10}}>
          <div style={{fontSize:10,color:css.sub,marginBottom:5,letterSpacing:0.5}}>Over {oi+1}</div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
            {over.map(({b,i})=><BallDot key={i} b={b} size={26} isDark={isDark}/>)}
            {oi<displayOvers.length-1&&<span style={{fontSize:11,color:css.sub,marginLeft:4,fontWeight:700}}>{over.reduce((s,{b})=>{
              if(b.startsWith('Wd')||b.startsWith('NB'))return s+1
              if(b==='4')return s+4
              if(b==='6')return s+6
              if(b==='W')return s
              return s+(parseInt(b)||0)
            },0)}</span>}
          </div>
        </div>
      ))}
      {overs.length>3&&(
        <button onClick={()=>setShow100(v=>!v)} style={{background:`${css.accent}22`,border:`1px solid ${css.accent}44`,borderRadius:8,padding:'7px 14px',fontSize:11,fontWeight:700,color:css.accent,cursor:'pointer',width:'100%',marginTop:4}}>
          {show100?'▲ Show Less':`▼ Show All ${overs.length} Overs (${total} balls)`}
        </button>
      )}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
        {[{l:'0',bg:isDark?'#333':'#AAAAAA'},{l:'1',bg:isDark?C.midGray:'#CCCCCC'},{l:'4',bg:C.success},{l:'6',bg:C.yellow},{l:'W',bg:C.danger},{l:'Wd',bg:'#FF6B35'},{l:'NB',bg:C.warn}].map(x=>(
          <span key={x.l} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:css.sub}}>
            <span style={{width:12,height:12,borderRadius:'50%',background:x.bg,display:'inline-block'}}/>
            {x.l}={balls.filter(b=>b===x.l||(x.l==='NB'&&b.startsWith('NB'))||(x.l==='Wd'&&b.startsWith('Wd'))).length}
          </span>
        ))}
      </div>
    </div>
  )
}

// Match resolution actions dropdown
function MatchActions({tid,sm,css,isDark,resolveScheduledMatch,isLive}){
  const[open,setOpen]=useState(false)
  const[walkoWinner,setWalkoWinner]=useState('')
  return(
    <div style={{marginTop:4}}>
      <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'7px 12px',fontSize:11,fontWeight:700,color:css.sub,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <ChevronDown size={12} style={{transform:open?'rotate(180deg)':'none',transition:'transform 0.2s'}}/> Match Actions
      </button>
      {open&&(
        <div style={{marginTop:6,background:isDark?C.midGray:C.white,borderRadius:10,border:`1px solid ${css.border}`,padding:10,display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:10,color:css.sub,fontWeight:700,letterSpacing:0.5,textTransform:'uppercase',marginBottom:2}}>Resolve without play</div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <div style={{fontSize:11,color:css.sub,fontWeight:600}}>🏆 Walkover — select winner:</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {[sm.team1,sm.team2].map(team=>(
                <button key={team} onClick={()=>resolveScheduledMatch(tid,sm.id,'walkover',team)} style={{background:`${C.yellow}11`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'8px 6px',fontSize:11,fontWeight:700,color:C.yellow,cursor:'pointer',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{team}</button>
              ))}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${css.border}`,paddingTop:6,display:'flex',flexDirection:'column',gap:4}}>
            <button onClick={()=>resolveScheduledMatch(tid,sm.id,'draw')} style={{width:'100%',background:`${C.info}11`,border:`1px solid ${C.info}33`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer'}}>🤝 Draw</button>
            <button onClick={()=>resolveScheduledMatch(tid,sm.id,'no_result')} style={{width:'100%',background:`${C.info}11`,border:`1px solid ${C.info}33`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer'}}>⛈️ No Result (Rain / Other)</button>
            <button onClick={()=>resolveScheduledMatch(tid,sm.id,'abandoned')} style={{width:'100%',background:`${C.danger}11`,border:`1px solid ${C.danger}33`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,color:C.danger,cursor:'pointer'}}>🚫 Match Abandoned</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeaguePage({css,isDark,tournaments,setTournaments,teamsDB,currentUser,authSession,matches,setTab,setShowNewMatch,setPendingMatch,setActiveScoring}){
  const[view,setView]=useState('list')
  const[selT,setSelT]=useState(null)
  const[innerT,setInnerT]=useState('table')
  const[showNew,setShowNew]=useState(false)
  const[nForm,setNForm]=useState({name:'',format:'T20',teams:'',hasGroups:false,customOvers:'10'})
  const[selectedTeams,setSelectedTeams]=useState([])
  // Add team to existing tournament
  const[showAddTeam,setShowAddTeam]=useState(false)
  const[newTeamName,setNewTeamName]=useState('')
  // Selected match for ball-by-ball view
  const[selMatch,setSelMatch]=useState(null)
  const[selInnings,setSelInnings]=useState(0)
  const[editGroups,setEditGroups]=useState(false)
  const[groupDraft,setGroupDraft]=useState(null)
  const[accessName,setAccessName]=useState('')
  // Schedule match states
  const[showScheduleForm,setShowScheduleForm]=useState(false)
  const[schedForm,setSchedForm]=useState({team1:'',team2:'',date:'',time:'',scorer:'',location:''})
  const[challengeIdx,setChallengeIdx]=useState(null)

  const isAdmin=currentUser?.role==='admin'
  const canManageTournament=t=>isAdmin||(t?.accessUsers||[]).includes(currentUser?.email)
  const allUserNames=[...new Set(Object.values(teamsDB||{}).flat().map(p=>p.email).filter(Boolean))]
  const verifyEditorPassword=()=>{
    if(!(authSession?.authenticated&&authSession?.name===currentUser?.email)){
      window.alert(`Please login as ${currentUser?.email||'your account'} using the Login button first.`)
      return false
    }
    return true
  }

  const moveTeamToGroup=(team,targetGrp)=>{
    setGroupDraft(prev=>prev.map(g=>({...g,teams:g.name===targetGrp?g.teams.includes(team)?g.teams:[...g.teams,team]:g.teams.filter(x=>x!==team)})))
  }
  const addNewGroup=()=>{
    if(!groupDraft)return
    const letter=String.fromCharCode(65+groupDraft.length)
    setGroupDraft(prev=>[...prev,{name:`Group ${letter}`,teams:[],table:[]}])
  }
  const saveGroupEdit=(tid)=>{
    if(!groupDraft)return
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){
      window.alert('You do not have access to edit this tournament.')
      return
    }
    if(!verifyEditorPassword())return
    setTournaments(prev=>prev.map(t=>{
      if(t.id!==tid)return t
      const allExistingRows=(t.groups||[]).flatMap(g=>g.table||[])
      const updGroups=groupDraft.map(g=>({
        ...g,
        table:g.teams.map(team=>allExistingRows.find(r=>r.team===team)||{team,p:0,w:0,l:0,pts:0,nrr:'—'})
      }))
      return{...t,groups:updGroups}
    }))
    setEditGroups(false);setGroupDraft(null)
  }
  const statusColor=s=>s==='ongoing'?C.yellow:s==='upcoming'?C.info:css.sub
  const statusBg=s=>s==='ongoing'?`${C.yellow}22`:s==='upcoming'?`${C.info}22`:css.border
  const statusLabel=s=>s==='ongoing'?'● LIVE':s==='upcoming'?'⏳ UPCOMING':'✅ DONE'
  const dbTeams=Object.keys(teamsDB||{})

  const createT=()=>{
    if(!isAdmin){
      window.alert('Only Admin can create tournaments.')
      return
    }
    if(!verifyEditorPassword())return
    if(!nForm.name.trim())return
    const rawTeams=selectedTeams.length?[...selectedTeams]:nForm.teams.split(',').map(t=>t.trim()).filter(Boolean)
    const tl=[...new Set(rawTeams)]
    const invalid=tl.filter(t=>!dbTeams.includes(t))
    if(invalid.length){
      window.alert(`Only teams from Players DB can be added. Invalid: ${invalid.join(', ')}`)
      return
    }
    if(tl.length<2)return
    const groupCount=nForm.hasGroups?Math.ceil(tl.length/4):0
    const groups=nForm.hasGroups?Array.from({length:groupCount},(_, gi)=>({
      name:`Group ${String.fromCharCode(65+gi)}`,
      teams:tl.slice(gi*4,(gi+1)*4),
      table:tl.slice(gi*4,(gi+1)*4).map(team=>({team,p:0,w:0,l:0,pts:0,nrr:'—'}))
    })):null
    const fixtures=generateFixtures(tl)
    const t={
      id:Date.now(),name:nForm.name,shortName:nForm.name.slice(0,6).toUpperCase(),
      format:nForm.format,customOvers:nForm.format==='CUSTOM'?(parseInt(nForm.customOvers)||10):null,status:'upcoming',emoji:'🏏',
      color:COLORS_BAR[tournaments.length%COLORS_BAR.length],
      teams:tl,startDate:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),
      endDate:'TBD',matches:Math.floor(tl.length*(tl.length-1)/2),played:0,prize:'TBD',
      recentMatches:[],hasGroups:nForm.hasGroups,groups:groups,
      accessUsers:[currentUser?.email||'admin@example.com'],
      table:tl.map(team=>({team,p:0,w:0,l:0,pts:0,nrr:'—'})),
      fixtures:fixtures,
    }
    setTournaments(p=>[t,...p]);setShowNew(false);setNForm({name:'',format:'T20',teams:'',hasGroups:false,customOvers:'10'});setSelectedTeams([])
  }

  const addTeamToTournament=(tid,teamName)=>{
    if(!teamName.trim())return
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){
      window.alert('You do not have access to edit this tournament.')
      return
    }
    if(!verifyEditorPassword())return
    if(!dbTeams.includes(teamName.trim())){
      window.alert('Team must exist in Players DB before adding to tournament.')
      return
    }
    setTournaments(prev=>prev.map(t=>{
      if(t.id!==tid)return t
      if(t.teams.includes(teamName.trim()))return t
      const newTeams=[...t.teams,teamName.trim()]
      const newTable=[...t.table,{team:teamName.trim(),p:0,w:0,l:0,pts:0,nrr:'—'}]
      const newMatches=Math.floor(newTeams.length*(newTeams.length-1)/2)
      return{...t,teams:newTeams,table:newTable,matches:newMatches}
    }))
    setNewTeamName('');setShowAddTeam(false)
  }

  const deleteTournament=(tid,name='this tournament')=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){
      window.alert('You do not have access to delete this tournament.')
      return
    }
    if(!verifyEditorPassword())return
    const ok=window.confirm(`Delete "${name}" permanently?`)
    if(!ok)return
    const t=tournaments.find(x=>x.id===tid)
    const hasMatchHistory=!!t&&((t.played||0)>0||((t.recentMatches||[]).length>0))
    if(hasMatchHistory){
      const confirmHistory=window.confirm(`"${name}" has match history. Delete anyway? This action cannot be undone.`)
      if(!confirmHistory)return
    }
    setTournaments(prev=>prev.filter(t=>t.id!==tid))
    if(selT===tid){
      setSelT(null)
      setView('list')
      setInnerT('table')
      setSelMatch(null)
    }
  }

  const grantTournamentAccess=(tid,name)=>{
    const clean=name.trim()
    if(!clean)return
    if(!isAdmin){
      window.alert('Only Admin can grant tournament access.')
      return
    }
    if(!verifyEditorPassword())return
    if(!allUserNames.includes(clean)){
      window.alert('Access can be granted only to registered player emails from Players DB.')
      return
    }
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,accessUsers:[...new Set([...(t.accessUsers||[]),clean])]}))
    setAccessName('')
  }

  const revokeTournamentAccess=(tid,name)=>{
    if(!isAdmin){
      window.alert('Only Admin can revoke tournament access.')
      return
    }
    if(!verifyEditorPassword())return
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,accessUsers:(t.accessUsers||[]).filter(x=>x!==name)}))
  }

  const scheduleMatch=(tid)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){window.alert('You do not have access to schedule matches.');return}
    if(!verifyEditorPassword())return
    if(!schedForm.team1||!schedForm.team2){window.alert('Select both teams.');return}
    if(schedForm.team1===schedForm.team2){window.alert('Teams must be different.');return}
    if(!schedForm.scorer){window.alert('Please assign a scorer for this match.');return}
    const sm={id:Date.now(),team1:schedForm.team1,team2:schedForm.team2,date:schedForm.date||'TBD',time:schedForm.time||'TBD',scorer:schedForm.scorer,location:schedForm.location||'',status:'scheduled',matchId:null}
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,scheduledMatches:[...(t.scheduledMatches||[]),sm]}))
    setSchedForm({team1:'',team2:'',date:'',time:'',scorer:'',location:''});setShowScheduleForm(false)
  }

  const deleteScheduledMatch=(tid,smId)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){window.alert('No access.');return}
    if(!verifyEditorPassword())return
    if(!window.confirm('Delete this scheduled match?'))return
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,scheduledMatches:(t.scheduledMatches||[]).filter(s=>s.id!==smId)}))
  }

  const handleStartScheduledMatch=(tid,sm)=>{
    if(!currentUser?.email){window.alert('Please login first.');return}
    if(!isAdmin&&sm.scorer!==currentUser?.email){window.alert('Only the assigned scorer or admin can start this match.');return}
    if(!verifyEditorPassword())return
    const tt2=tournaments.find(x=>x.id===tid)
    setPendingMatch({team1:sm.team1,team2:sm.team2,tournamentId:tid,format:tt2?.format||'T20',customOvers:tt2?.customOvers||null,smId:sm.id})
    setShowNewMatch(true);setTab('score')
  }

  const updateScheduledScorer=(tid,smId,newScorer)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){window.alert('No access.');return}
    if(!verifyEditorPassword())return
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,scheduledMatches:(t.scheduledMatches||[]).map(s=>s.id!==smId?s:{...s,scorer:newScorer})}))
  }

  const updateScheduledMatch=(tid,smId,updates)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt))return
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,scheduledMatches:(t.scheduledMatches||[]).map(s=>s.id!==smId?s:{...s,...updates})}))
  }

  const updateFixture=(tid,idx,updates)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt))return
    setTournaments(prev=>prev.map(t=>t.id!==tid?t:{...t,fixtures:(t.fixtures||[]).map((f,i)=>i!==idx?f:{...f,...updates})}))
  }

  const handleResumeMatch=(tid,sm)=>{
    if(!currentUser?.email){window.alert('Please login first.');return}
    if(!isAdmin&&sm.scorer!==currentUser?.email){window.alert('Only the assigned scorer or admin can resume this match.');return}
    const liveMatch=(matches||[]).find(m=>m.tournamentId===tid&&m.status==='live'&&((m.team1===sm.team1&&m.team2===sm.team2)||(m.team1===sm.team2&&m.team2===sm.team1)))
    if(!liveMatch){window.alert('Could not find the live match to resume.');return}
    setActiveScoring(liveMatch);setTab('score')
  }

  const resolveScheduledMatch=(tid,smId,resolution,winnerTeam)=>{
    const tt=tournaments.find(x=>x.id===tid)
    if(!canManageTournament(tt)){window.alert('No access.');return}
    if(!verifyEditorPassword())return
    const sm=(tt.scheduledMatches||[]).find(s=>s.id===smId)
    if(!sm)return
    const label=resolution==='walkover'?`Walkover: ${winnerTeam} wins`:resolution==='no_result'?'No Result':resolution==='abandoned'?'Match Abandoned':resolution==='draw'?'Match Drawn':'Cancelled'
    if(!window.confirm(`${label}\n\nAre you sure?`))return
    // Update scheduled match status
    const updScheduled=(tt.scheduledMatches||[]).map(s=>s.id!==smId?s:{...s,status:'completed',resolution,winner:winnerTeam||null})
    // Build points and table updates
    const updateRows=rows=>(rows||[]).map(r=>{
      if(r.team!==sm.team1&&r.team!==sm.team2)return r
      if(resolution==='walkover'){
        const isWin=r.team===winnerTeam
        return{...r,p:(r.p||0)+1,w:(r.w||0)+(isWin?1:0),l:(r.l||0)+(isWin?0:1),pts:(r.pts||0)+(isWin?2:0),nrr:r.nrr}
      }
      if(resolution==='draw'||resolution==='no_result'){
        return{...r,p:(r.p||0)+1,pts:(r.pts||0)+1,nrr:r.nrr}
      }
      // abandoned / cancelled — count as played with no points
      return{...r,p:(r.p||0)+1,nrr:r.nrr}
    })
    // Create a history entry
    const historyEntry={id:Date.now(),team1:sm.team1,team2:sm.team2,format:tt.format,status:'completed',created:Date.now(),resolution,resultLabel:label,innings:[{batting:sm.team1,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],oversDisplay:'0.0'},{batting:sm.team2,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],oversDisplay:'0.0'}]}
    setTournaments(prev=>prev.map(t=>{
      if(t.id!==tid)return t
      return{...t,scheduledMatches:updScheduled,played:(t.played||0)+1,status:t.status==='upcoming'?'ongoing':t.status,table:updateRows(t.table),groups:(t.groups||[]).map(g=>({...g,table:updateRows(g.table)})),recentMatches:[historyEntry,...(t.recentMatches||[])]}
    }))
  }

  if(selMatch){
    const t=tournaments.find(x=>x.id===selT)
    const m=selMatch
    const tabs=[{id:0,label:`🏏 ${m.innings[0]?.batting||'Inn 1'}`},{id:1,label:`🏏 ${m.innings[1]?.batting||'Inn 2'}`}]
    return(
      <div style={{paddingBottom:12}}>
        <div style={{background:`linear-gradient(135deg,${C.black},${C.darkGray})`,padding:'14px',borderBottom:`2px solid ${t?.color||C.yellow}`}}>
          <button onClick={()=>setSelMatch(null)} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'6px 12px',cursor:'pointer',color:C.yellow,fontSize:12,fontWeight:700,marginBottom:10}}>← Back to Match List</button>
          <div style={{fontSize:15,fontWeight:900,marginBottom:4}}>{m.team1} vs {m.team2}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{m.format} · {new Date(m.created).toLocaleDateString()}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
            {m.innings.map((inn,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:10,textAlign:'center'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2}}>{inn.batting}</div>
                <div style={{fontSize:22,fontWeight:900,color:C.yellow}}>{inn.score}/{inn.wickets}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{inn.oversDisplay||'0.0'} ov</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:'12px 14px'}}>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            {tabs.map(tb=><button key={tb.id} onClick={()=>setSelInnings(tb.id)} style={{background:selInnings===tb.id?C.yellow:css.card,color:selInnings===tb.id?C.black:css.text,border:`1px solid ${selInnings===tb.id?C.yellow:css.border}`,borderRadius:20,padding:'7px 14px',fontSize:11,fontWeight:700,cursor:'pointer',flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{tb.label}</button>)}
          </div>
          <div style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`}}>
            <BallsView innings={m.innings[selInnings]} css={css} isDark={isDark}/>
          </div>
        </div>
      </div>
    )
  }

  if(view==='detail'&&selT){
    const t=tournaments.find(x=>x.id===selT)||tournaments[0]
    const canEditT=canManageTournament(t)
    const tp=t.teams.flatMap(tn=>teamsDB[tn]||[])
    const orange=[...tp].sort((a,b)=>b.runs-a.runs).slice(0,5)
    const purple=[...tp].sort((a,b)=>b.wickets-a.wickets).slice(0,5)
    const iTabs=[{id:'table',label:'🏟️ Table'},{id:'fixtures',label:'📋 Fixtures'},{id:'matches',label:'🏏 Matches'},{id:'batting',label:'🟠 Batting'},{id:'bowling',label:'🟣 Bowling'},{id:'teams',label:'👥 Teams'},{id:'chart',label:'📊 Chart'}]
    return(
      <div style={{paddingBottom:12}}>
        <div style={{background:`linear-gradient(135deg,${C.black},${C.darkGray})`,padding:'14px',borderBottom:`2px solid ${t.color}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <button onClick={()=>setView('list')} style={{background:`${t.color}22`,border:`1px solid ${t.color}44`,borderRadius:8,padding:'6px 10px',cursor:'pointer',color:t.color,fontSize:12,fontWeight:700}}>← Back</button>
            <div style={{fontSize:22}}>{t.emoji}</div>
            <div>
              <div style={{fontWeight:900,fontSize:15,color:C.white}}>{t.name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>{t.format}{t.format==='CUSTOM'&&t.customOvers?` (${t.customOvers} ov)`:''}·{t.teams.length} teams{canEditT?' · edit access':' · read only'}</div>
            </div>
            {canEditT&&<button onClick={()=>deleteTournament(t.id,t.name)} style={{marginLeft:'auto',background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:8,padding:'6px 10px',cursor:'pointer',color:C.danger,fontSize:11,fontWeight:700,display:'flex',alignItems:'center',gap:6}}><Trash2 size={13}/>Delete</button>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {[{label:'Teams',value:t.teams.length},{label:'Matches',value:t.matches},{label:'Played',value:t.played},{label:'Prize',value:t.prize}].map(s=>(
              <div key={s.label} style={{background:'rgba(0,0,0,0.35)',borderRadius:8,padding:'8px 6px',textAlign:'center'}}>
                <div style={{fontSize:13,fontWeight:900,color:t.color}}>{s.value}</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.45)',marginTop:1,textTransform:'uppercase',letterSpacing:0.5}}>{s.label}</div>
              </div>
            ))}
          </div>
          {t.winner&&<div style={{marginTop:10,background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18}}>🏆</span><span style={{fontSize:13,fontWeight:700,color:C.yellow}}>Winner: {t.winner}</span></div>}
        </div>
        <div style={{display:'flex',gap:6,padding:'12px 14px 0',overflowX:'auto',paddingBottom:4}}>
          {iTabs.map(tb=><button key={tb.id} onClick={()=>setInnerT(tb.id)} style={{background:innerT===tb.id?t.color:css.card,color:innerT===tb.id?C.black:css.text,border:`1px solid ${innerT===tb.id?t.color:css.border}`,borderRadius:20,padding:'7px 12px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{tb.label}</button>)}
        </div>
        <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
          {innerT==='table'&&(
            <div style={{background:css.card,borderRadius:14,overflow:'hidden',border:`1px solid ${css.border}`}}>
              {t.hasGroups&&t.groups?(
                <div>
                  {!editGroups&&canEditT&&(
                    <div style={{padding:'10px 12px',display:'flex',justifyContent:'flex-end'}}>
                      <button onClick={()=>{setGroupDraft(t.groups.map(g=>({...g,teams:[...g.teams]})));setEditGroups(true)}} style={{background:`${t.color}22`,border:`1px solid ${t.color}44`,borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:700,color:t.color,cursor:'pointer'}}>✏️ Edit Groups</button>
                    </div>
                  )}
                  {editGroups&&groupDraft&&(
                    <div style={{padding:14,borderBottom:`2px solid ${t.color}`}}>
                      <div style={{fontSize:13,fontWeight:800,color:t.color,marginBottom:10}}>✏️ Assign Teams to Groups</div>
                      <div style={{fontSize:11,color:css.sub,marginBottom:12}}>For each team, choose which group they belong to.</div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                        {t.teams.map(team=>{
                          const curGrp=groupDraft.find(g=>g.teams.includes(team))?.name||''
                          return(
                            <div key={team} style={{display:'flex',alignItems:'center',gap:10,background:css.bg,borderRadius:8,padding:'8px 12px',border:`1px solid ${css.border}`}}>
                              <span style={{flex:1,fontSize:12,fontWeight:600,color:css.text}}>{team}</span>
                              <select value={curGrp} onChange={e=>moveTeamToGroup(team,e.target.value)} style={{background:css.card,border:`1px solid ${css.border}`,borderRadius:6,padding:'6px 10px',fontSize:11,color:css.text,cursor:'pointer'}}>
                                <option value="">— Unassigned —</option>
                                {groupDraft.map(g=><option key={g.name} value={g.name}>{g.name}</option>)}
                              </select>
                            </div>
                          )
                        })}
                      </div>
                      <button onClick={addNewGroup} style={{background:`${C.info}22`,border:`1px solid ${C.info}44`,borderRadius:8,padding:'7px 12px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer',width:'100%',marginBottom:8}}>+ Add New Group</button>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        <button onClick={()=>{setEditGroups(false);setGroupDraft(null)}} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'9px 12px',fontSize:12,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
                        <button onClick={()=>saveGroupEdit(t.id)} style={{background:`linear-gradient(135deg,${t.color},${t.color}cc)`,border:'none',borderRadius:8,padding:'9px 12px',fontSize:12,fontWeight:700,cursor:'pointer',color:C.black}}>Save Groups</button>
                      </div>
                    </div>
                  )}
                  {!editGroups&&t.groups.map(grp=>(
                    <div key={grp.name} style={{marginBottom:16}}>
                      <div style={{fontSize:13,fontWeight:900,color:t.color,marginBottom:8,paddingLeft:12}}>{grp.name}</div>
                      <div style={{display:'grid',gridTemplateColumns:'24px 1fr 28px 28px 28px 44px 48px',gap:4,padding:'8px 12px',background:isDark?C.midGray:C.lightGray,fontSize:9,fontWeight:700,color:css.sub,letterSpacing:0.5}}>
                        <div>#</div><div>TEAM</div><div>P</div><div>W</div><div>L</div><div>PTS</div><div>NRR</div>
                      </div>
                      {grp.table.map((row,i)=>(
                        <div key={row.team} style={{display:'grid',gridTemplateColumns:'24px 1fr 28px 28px 28px 44px 48px',gap:4,padding:'10px 12px',borderTop:`1px solid ${css.border}`,background:i===0?`${t.color}11`:'transparent'}}>
                          <div style={{fontSize:12,fontWeight:800,color:i<1?t.color:css.sub}}>{i+1}</div>
                          <div style={{fontSize:12,fontWeight:i===0?700:500}}>{i===0?'🥇 ':''}{ row.team}</div>
                          <div style={{fontSize:12,color:css.sub}}>{row.p}</div>
                          <div style={{fontSize:12,color:C.success,fontWeight:600}}>{row.w}</div>
                          <div style={{fontSize:12,color:C.danger}}>{row.l}</div>
                          <div style={{fontSize:13,fontWeight:900,color:t.color}}>{row.pts}</div>
                          <div style={{fontSize:11,color:row.nrr.startsWith('+')?C.success:row.nrr==='—'?css.sub:C.danger}}>{row.nrr}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ):(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'24px 1fr 28px 28px 28px 44px 48px',gap:4,padding:'8px 12px',background:isDark?C.midGray:C.lightGray,fontSize:9,fontWeight:700,color:css.sub,letterSpacing:0.5}}>
                    <div>#</div><div>TEAM</div><div>P</div><div>W</div><div>L</div><div>PTS</div><div>NRR</div>
                  </div>
                  {t.table.map((row,i)=>(
                    <div key={row.team} style={{display:'grid',gridTemplateColumns:'24px 1fr 28px 28px 28px 44px 48px',gap:4,padding:'10px 12px',borderTop:`1px solid ${css.border}`,background:i===0?`${t.color}11`:'transparent'}}>
                      <div style={{fontSize:12,fontWeight:800,color:i<2?t.color:css.sub}}>{i+1}</div>
                      <div style={{fontSize:12,fontWeight:i===0?700:500}}>{i===0?'🥇 ':i===1?'🥈 ':''}{row.team}</div>
                      <div style={{fontSize:12,color:css.sub}}>{row.p}</div>
                      <div style={{fontSize:12,color:C.success,fontWeight:600}}>{row.w}</div>
                      <div style={{fontSize:12,color:C.danger}}>{row.l}</div>
                      <div style={{fontSize:13,fontWeight:900,color:t.color}}>{row.pts}</div>
                      <div style={{fontSize:11,color:row.nrr.startsWith('+')?C.success:row.nrr==='—'?css.sub:C.danger}}>{row.nrr}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {innerT==='fixtures'&&(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <GSection title="📋 FIXTURES" css={css}>
                {(!t.fixtures||t.fixtures.length===0)?<div style={{textAlign:'center',padding:24,color:css.sub,fontSize:13}}>No fixtures generated.</div>:(
                  t.fixtures.map((f,i)=>{
                    const sm=(t.scheduledMatches||[]).find(s=>(s.team1===f.home&&s.team2===f.away)||(s.team1===f.away&&s.team2===f.home))
                    const played=t.recentMatches?.find(m=>(m.team1===f.home&&m.team2===f.away)||(m.team1===f.away&&m.team2===f.home))
                    const liveMatch=sm?(matches||[]).find(m=>m.tournamentId===t.id&&m.status==='live'&&((m.team1===sm.team1&&m.team2===sm.team2)||(m.team1===sm.team2&&m.team2===sm.team1))):null
                    const isResolved=sm&&sm.status==='completed'&&sm.resolution
                    const actualStatus=sm?(isResolved?'completed':played?'completed':liveMatch?'live':sm.status):(played?'completed':'upcoming')
                    const statusCol=actualStatus==='upcoming'?C.yellow:actualStatus==='scheduled'?C.info:actualStatus==='live'?C.yellow:C.success
                    const statusLbl=actualStatus==='upcoming'?'⏳ Upcoming':actualStatus==='scheduled'?'⏳ Scheduled':actualStatus==='live'?'● LIVE':isResolved?(sm.resolution==='walkover'?'🏆 Walkover':sm.resolution==='no_result'?'⛈️ No Result':sm.resolution==='abandoned'?'🚫 Abandoned':sm.resolution==='draw'?'🤝 Draw':'✅ Completed'):'✅ Played'
                    const canStart=sm&&(isAdmin||sm.scorer===currentUser?.email)
                    const isChallenging=challengeIdx===i
                    return(
                      <div key={i} style={{background:isDark?C.midGray:C.white,borderRadius:12,padding:14,marginBottom:8,border:`1px solid ${actualStatus==='live'?`${C.yellow}66`:actualStatus==='completed'?`${C.success}44`:css.border}`,boxShadow:actualStatus==='live'?`0 0 8px ${C.yellow}22`:'none'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{fontSize:11,fontWeight:800,color:css.sub}}>{i+1}.</span>
                            <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:statusCol,background:`${statusCol}22`,padding:'2px 8px',borderRadius:4}}>{statusLbl}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            {sm&&sm.date&&sm.date!=='TBD'&&<span style={{fontSize:10,color:css.sub}}>{new Date(sm.date+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})} {sm.time&&sm.time!=='TBD'?sm.time:''}</span>}
                            {sm&&sm.location&&<span style={{fontSize:10,color:css.sub,display:'flex',alignItems:'center',gap:2}}><MapPin size={9}/>{sm.location}</span>}
                            {canEditT&&sm&&actualStatus!=='completed'&&<button onClick={()=>deleteScheduledMatch(t.id,sm.id)} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'3px 6px',cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}} title="Delete challenge"><Trash2 size={11}/></button>}
                          </div>
                        </div>
                        {(()=>{
                          const g1=t.hasGroups&&t.groups?(t.groups||[]).find(g=>g.teams.includes(f.home)):null
                          const g2=t.hasGroups&&t.groups?(t.groups||[]).find(g=>g.teams.includes(f.away)):null
                          const sameGroup=g1&&g2&&g1.name===g2.name
                          return(<>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:g1||g2?4:8}}>
                              <div>
                                <div style={{fontSize:14,fontWeight:700}}>{f.home}</div>
                                {g1&&<span style={{fontSize:9,fontWeight:600,color:css.accent,background:`${css.accent}15`,padding:'1px 6px',borderRadius:4,marginTop:2,display:'inline-block'}}>{g1.name}</span>}
                              </div>
                              <div style={{fontSize:11,color:css.sub,fontWeight:700}}>vs</div>
                              <div style={{textAlign:'right'}}>
                                <div style={{fontSize:14,fontWeight:700}}>{f.away}</div>
                                {g2&&<span style={{fontSize:9,fontWeight:600,color:css.accent,background:`${css.accent}15`,padding:'1px 6px',borderRadius:4,marginTop:2,display:'inline-block'}}>{g2.name}</span>}
                              </div>
                            </div>
                            {!sameGroup&&g1&&g2&&<div style={{fontSize:10,color:C.warn,fontWeight:600,marginBottom:6}}>⚔️ Cross-Group</div>}
                          </>)
                        })()}
                        {/* Date & Location fields on fixture */}
                        {!sm&&actualStatus==='upcoming'&&(
                          <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                            <div style={{flex:1,minWidth:100}}>
                              <label style={{fontSize:10,color:css.sub,display:'block',marginBottom:2}}>📅 Date</label>
                              {canEditT?(
                                <input type="date" value={f.date||''} onChange={e=>updateFixture(t.id,i,{date:e.target.value})} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:6,padding:'5px 8px',fontSize:11,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                              ):(
                                <span style={{fontSize:11,color:css.text}}>{f.date?new Date(f.date+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—'}</span>
                              )}
                            </div>
                            <div style={{flex:1,minWidth:100}}>
                              <label style={{fontSize:10,color:css.sub,display:'block',marginBottom:2}}>📍 Location</label>
                              {canEditT?(
                                <input value={f.location||''} onChange={e=>updateFixture(t.id,i,{location:e.target.value})} placeholder="Optional" style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:6,padding:'5px 8px',fontSize:11,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                              ):(
                                <span style={{fontSize:11,color:css.text}}>{f.location||'—'}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {/* No scheduled match yet — show Challenge button */}
                        {!sm&&actualStatus==='upcoming'&&!isChallenging&&canEditT&&(
                          <button onClick={()=>{setChallengeIdx(i);setSchedForm({team1:f.home,team2:f.away,date:f.date||'',time:'',scorer:'',location:f.location||''})}} style={{width:'100%',background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.yellow}33`}}>
                            ⚔️ Challenge
                          </button>
                        )}
                        {/* Challenge form inline */}
                        {isChallenging&&(
                          <div style={{background:css.bg,borderRadius:10,padding:12,border:`1px solid ${C.yellow}44`,marginBottom:6}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                              <span style={{fontWeight:800,fontSize:13,color:css.accent}}>⚔️ Challenge Setup</span>
                              <button onClick={()=>{setChallengeIdx(null);setSchedForm({team1:'',team2:'',date:'',time:'',scorer:'',location:''})}} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={14}/></button>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                              <div>
                                <label style={{fontSize:11,color:css.sub,display:'block',marginBottom:4}}>Date</label>
                                <input type="date" value={schedForm.date} onChange={e=>setSchedForm(p=>({...p,date:e.target.value}))} style={{width:'100%',background:css.card,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                              </div>
                              <div>
                                <label style={{fontSize:11,color:css.sub,display:'block',marginBottom:4}}>Time</label>
                                <input type="time" value={schedForm.time} onChange={e=>setSchedForm(p=>({...p,time:e.target.value}))} style={{width:'100%',background:css.card,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                              </div>
                            </div>
                            <div style={{marginBottom:8}}>
                              <label style={{fontSize:11,color:css.sub,display:'block',marginBottom:4}}>📍 Location (optional)</label>
                              <input value={schedForm.location} onChange={e=>setSchedForm(p=>({...p,location:e.target.value}))} placeholder="e.g. Central Park Ground" style={{width:'100%',background:css.card,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                            </div>
                            <div style={{marginBottom:8}}>
                              <label style={{fontSize:11,color:css.sub,display:'block',marginBottom:4}}>🎯 Assign Scorer</label>
                              <select value={schedForm.scorer} onChange={e=>setSchedForm(p=>({...p,scorer:e.target.value}))} style={{width:'100%',background:css.card,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,boxSizing:'border-box',cursor:'pointer'}}>
                                <option value="">Select Scorer</option>
                                {allUserNames.map(email=><option key={email} value={email}>{email}</option>)}
                              </select>
                              <div style={{fontSize:9,color:css.sub,marginTop:2}}>Only assigned scorer (or admin) can start.</div>
                            </div>
                            <button onClick={()=>{scheduleMatch(t.id);setChallengeIdx(null)}} disabled={!schedForm.scorer} style={{width:'100%',background:!schedForm.scorer?css.border:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:10,fontSize:13,fontWeight:800,color:!schedForm.scorer?css.sub:C.black,cursor:!schedForm.scorer?'not-allowed':'pointer'}}>⚔️ Confirm Challenge</button>
                          </div>
                        )}
                        {/* Scheduled — show editable date/location/scorer */}
                        {sm&&actualStatus!=='completed'&&(
                          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
                            {canEditT&&actualStatus==='scheduled'&&(
                              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                                <div style={{flex:1,minWidth:90}}>
                                  <label style={{fontSize:10,color:css.sub,display:'block',marginBottom:2}}>📅 Date</label>
                                  <input type="date" value={sm.date&&sm.date!=='TBD'?sm.date:''} onChange={e=>updateScheduledMatch(t.id,sm.id,{date:e.target.value||'TBD'})} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:6,padding:'5px 8px',fontSize:11,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                                </div>
                                <div style={{flex:1,minWidth:90}}>
                                  <label style={{fontSize:10,color:css.sub,display:'block',marginBottom:2}}>🕐 Time</label>
                                  <input type="time" value={sm.time&&sm.time!=='TBD'?sm.time:''} onChange={e=>updateScheduledMatch(t.id,sm.id,{time:e.target.value||'TBD'})} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:6,padding:'5px 8px',fontSize:11,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                                </div>
                                <div style={{flex:2,minWidth:120}}>
                                  <label style={{fontSize:10,color:css.sub,display:'block',marginBottom:2}}>📍 Location</label>
                                  <input value={sm.location||''} onChange={e=>updateScheduledMatch(t.id,sm.id,{location:e.target.value})} placeholder="Optional" style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:6,padding:'5px 8px',fontSize:11,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                                </div>
                              </div>
                            )}
                            <div style={{display:'flex',alignItems:'center',gap:6,background:css.bg,borderRadius:8,padding:'6px 10px',border:`1px solid ${css.border}`}}>
                              <UserCheck size={12} style={{color:css.accent,flexShrink:0}}/>
                              <span style={{fontSize:11,color:css.sub}}>Scorer:</span>
                              {canEditT&&actualStatus==='scheduled'?(
                                <select value={sm.scorer} onChange={e=>updateScheduledScorer(t.id,sm.id,e.target.value)} style={{flex:1,background:'transparent',border:'none',fontSize:11,fontWeight:700,color:css.accent,cursor:'pointer',outline:'none'}}>
                                  <option value="">Select</option>
                                  {allUserNames.map(email=><option key={email} value={email}>{email}</option>)}
                                </select>
                              ):(
                                <span style={{fontSize:11,fontWeight:700,color:css.accent}}>{sm.scorer||'Not assigned'}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {sm&&actualStatus==='scheduled'&&canStart&&(
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            <button onClick={()=>handleStartScheduledMatch(t.id,sm)} style={{width:'100%',background:`linear-gradient(135deg,${C.success},#27ae60)`,border:'none',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:800,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.success}44`}}>
                              <Play size={14}/> Start Match
                            </button>
                            {canEditT&&<MatchActions tid={t.id} sm={sm} css={css} isDark={isDark} resolveScheduledMatch={resolveScheduledMatch}/>}
                          </div>
                        )}
                        {sm&&actualStatus==='scheduled'&&!canStart&&(
                          <div>
                            <div style={{fontSize:11,color:css.sub,textAlign:'center',padding:'8px 0',fontStyle:'italic'}}>Only {sm.scorer||'assigned scorer'} or admin can start</div>
                            {canEditT&&<MatchActions tid={t.id} sm={sm} css={css} isDark={isDark} resolveScheduledMatch={resolveScheduledMatch}/>}
                          </div>
                        )}
                        {sm&&actualStatus==='live'&&(
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            {canStart&&(
                              <button onClick={()=>handleResumeMatch(t.id,sm)} style={{width:'100%',background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.yellow}44`}}>
                                <RotateCcw size={14}/> Resume Scoring
                              </button>
                            )}
                            {!canStart&&(
                              <div style={{background:`${C.yellow}11`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'8px 12px',textAlign:'center'}}>
                                <span style={{fontSize:12,fontWeight:700,color:C.yellow}}>● Match is LIVE</span>
                                <div style={{fontSize:10,color:css.sub,marginTop:2}}>Only {sm.scorer||'assigned scorer'} or admin can resume</div>
                              </div>
                            )}
                            {canEditT&&<MatchActions tid={t.id} sm={sm} css={css} isDark={isDark} resolveScheduledMatch={resolveScheduledMatch} isLive/>}
                          </div>
                        )}
                        {actualStatus==='completed'&&isResolved&&sm&&(
                          <div style={{background:sm.resolution==='walkover'?`${C.yellow}11`:sm.resolution==='draw'||sm.resolution==='no_result'?`${C.info}11`:`${C.danger}11`,border:`1px solid ${sm.resolution==='walkover'?`${C.yellow}44`:sm.resolution==='draw'||sm.resolution==='no_result'?`${C.info}44`:`${C.danger}44`}`,borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
                            <span style={{fontSize:11,fontWeight:700,color:sm.resolution==='walkover'?C.yellow:sm.resolution==='draw'||sm.resolution==='no_result'?C.info:C.danger}}>{sm.resolution==='walkover'?`🏆 ${sm.winner} wins by Walkover`:sm.resolution==='draw'?'🤝 Match Drawn':sm.resolution==='no_result'?'⛈️ No Result':sm.resolution==='abandoned'?'🚫 Match Abandoned':'Resolved'}</span>
                          </div>
                        )}
                        {actualStatus==='completed'&&!isResolved&&played&&(
                          <div style={{background:`${C.success}11`,border:`1px solid ${C.success}44`,borderRadius:8,padding:'8px 10px'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                              <span style={{color:css.text,fontWeight:600}}>{played.innings[0]?.batting}: {played.innings[0]?.score}/{played.innings[0]?.wickets}</span>
                              <span style={{color:css.text,fontWeight:600}}>{played.innings[1]?.batting}: {played.innings[1]?.score}/{played.innings[1]?.wickets}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </GSection>
            </div>
          )}
          {innerT==='matches'&&(
            <GSection title="🏏 RECENT MATCHES" css={css}>
              {(!t.recentMatches||t.recentMatches.length===0)&&<div style={{textAlign:'center',padding:24,color:css.sub,fontSize:13}}>No match data yet.</div>}
              {(t.recentMatches||[]).map(m=>{
                const inn0=m.innings?.[0],inn1=m.innings?.[1]
                const resultText=m.resolution?(m.resolution==='walkover'?`🏆 ${m.resultLabel||'Walkover'}`:m.resolution==='draw'?'🤝 Match Drawn':m.resolution==='no_result'?'⛈️ No Result':m.resolution==='abandoned'?'🚫 Abandoned':'Resolved'):(inn0&&inn1&&inn1.score!==undefined?(inn1.score>inn0.score?`🏆 ${inn1.batting} won by ${10-inn1.wickets} wicket${(10-inn1.wickets)!==1?'s':''}`:inn0.score>inn1.score?`🏆 ${inn0.batting} won by ${inn0.score-inn1.score} run${(inn0.score-inn1.score)!==1?'s':''}`:inn0.score===inn1.score?'🤝 Match Tied':null):null)
                const resultColor=m.resolution?(m.resolution==='walkover'?C.yellow:m.resolution==='draw'||m.resolution==='no_result'?C.info:C.danger):(resultText?.includes('Tied')?C.info:C.success)
                return(
                <div key={m.id} onClick={()=>{setSelMatch(m);setSelInnings(0)}} style={{background:isDark?C.midGray:C.white,borderRadius:12,padding:12,marginBottom:8,border:`1px solid ${css.border}`,cursor:'pointer',boxShadow:isDark?'none':'0 1px 3px rgba(0,0,0,0.08)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:css.accent,background:`${css.accent}22`,padding:'2px 6px',borderRadius:4}}>✅ COMPLETED · {m.format}</span>
                    <span style={{fontSize:10,color:css.sub}}>{new Date(m.created).toLocaleDateString()}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700}}>{m.team1}</div>
                      <div style={{fontSize:11,color:css.sub}}>{inn0?`${inn0.score}/${inn0.wickets} (${inn0.oversDisplay||'0.0'})`:'—'}</div>
                    </div>
                    <div style={{fontSize:11,color:css.sub,fontWeight:600}}>vs</div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:700}}>{m.team2}</div>
                      <div style={{fontSize:11,color:css.sub}}>{inn1?`${inn1.score}/${inn1.wickets} (${inn1.oversDisplay||'0.0'})`:'—'}</div>
                    </div>
                  </div>
                  {resultText&&<div style={{background:`${resultColor}15`,border:`1px solid ${resultColor}33`,borderRadius:8,padding:'6px 10px',marginBottom:6,textAlign:'center'}}><span style={{fontSize:11,fontWeight:700,color:resultColor}}>{resultText}</span></div>}
                  {!m.resolution&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:4}}>
                    {(inn0?.ballLog||[]).slice(0,12).map((b,i)=><BallDot key={i} b={b} size={18} isDark={isDark}/>)}
                    {(inn0?.ballLog||[]).length>12&&<span style={{fontSize:9,color:css.sub,alignSelf:'center'}}>+{(inn0.ballLog.length-12)} more</span>}
                  </div>}
                  <div style={{fontSize:10,color:css.accent,fontWeight:700,textAlign:'right'}}>View details →</div>
                </div>
              )})}
            </GSection>
          )}
          {innerT==='batting'&&(
            <GSection title="🟠 TOP BATTERS" css={css}>
              {orange.length===0&&<div style={{textAlign:'center',padding:20,color:css.sub,fontSize:13}}>No player data. Add players in Players tab!</div>}
              {orange.map((p,i)=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<orange.length-1?`1px solid ${css.border}`:'none'}}>
                  <div style={{width:22,fontSize:13,fontWeight:800,color:css.sub,textAlign:'center'}}>{i+1}</div>
                  <PAv name={p.name} photo={p.photo} size={36}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.name}</div><div style={{fontSize:11,color:css.sub}}>{p.team}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontSize:20,fontWeight:900,color:css.accent}}>{p.runs}</div><div style={{fontSize:9,color:css.sub}}>RUNS</div></div>
                </div>
              ))}
            </GSection>
          )}
          {innerT==='bowling'&&(
            <GSection title="🟣 TOP BOWLERS" css={css}>
              {purple.length===0&&<div style={{textAlign:'center',padding:20,color:css.sub,fontSize:13}}>No data yet.</div>}
              {purple.map((p,i)=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<purple.length-1?`1px solid ${css.border}`:'none'}}>
                  <div style={{width:22,fontSize:13,fontWeight:800,color:css.sub,textAlign:'center'}}>{i+1}</div>
                  <PAv name={p.name} photo={p.photo} size={36}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.name}</div><div style={{fontSize:11,color:css.sub}}>{p.team}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontSize:20,fontWeight:900,color:'#9b59b6'}}>{p.wickets}</div><div style={{fontSize:9,color:css.sub}}>WKTS</div></div>
                </div>
              ))}
            </GSection>
          )}
          {innerT==='teams'&&(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {/* ADD TEAM to existing tournament */}
              {canEditT&&(!showAddTeam?(
                <button onClick={()=>setShowAddTeam(true)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.yellow}33`}}>
                  <UserPlus size={15}/> Add Team to {t.name}
                </button>
              ):(
                <div style={{background:css.card,borderRadius:12,padding:14,border:`1px solid ${C.yellow}44`}}>
                  <div style={{fontWeight:800,fontSize:13,color:css.accent,marginBottom:10}}>Add New Team</div>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} placeholder="Team name" style={{flex:1,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'9px 12px',fontSize:13,color:css.text,outline:'none'}}/>
                    <button onClick={()=>addTeamToTournament(t.id,newTeamName)} style={{background:C.yellow,border:'none',borderRadius:8,padding:'9px 14px',fontSize:12,fontWeight:800,color:C.black,cursor:'pointer'}}>Add</button>
                    <button onClick={()=>{setShowAddTeam(false);setNewTeamName('')}} style={{background:'none',border:`1px solid ${css.border}`,borderRadius:8,padding:'9px 10px',cursor:'pointer',color:css.sub}}><X size={14}/></button>
                  </div>
                  <div style={{fontSize:11,color:css.sub}}>Adding a team will update the points table and match count.</div>
                </div>
              ))}
              {!canEditT&&<div style={{fontSize:11,color:css.sub,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px'}}>You have read-only access. Ask Admin to grant edit access for this tournament.</div>}
              <div style={{background:css.card,borderRadius:12,padding:12,border:`1px solid ${css.border}`}}>
                <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>🔐 Tournament Access</div>
                {(t.accessUsers||[]).length===0&&<div style={{fontSize:11,color:css.sub}}>No additional users have access yet.</div>}
                {(t.accessUsers||[]).map(u=><div key={u} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderTop:`1px solid ${css.border}`}}><span style={{fontSize:12,fontWeight:600}}>{u}</span>{isAdmin&&<button onClick={()=>revokeTournamentAccess(t.id,u)} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'4px 8px',fontSize:10,fontWeight:700,color:C.danger,cursor:'pointer'}}>Revoke</button>}</div>)}
                {isAdmin&&<div style={{display:'flex',gap:8,marginTop:8}}>
                  <input value={accessName} onChange={e=>setAccessName(e.target.value)} list="access-user-list" placeholder="Grant access to email" style={{flex:1,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,outline:'none'}}/>
                  <datalist id="access-user-list">{allUserNames.map(name=><option key={name} value={name}/>)}</datalist>
                  <button onClick={()=>grantTournamentAccess(t.id,accessName)} style={{background:`${C.info}22`,border:`1px solid ${C.info}44`,borderRadius:8,padding:'8px 12px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer'}}>Grant</button>
                </div>}
              </div>
              <GSection title={`👥 TEAMS (${t.teams.length})`} css={css}>
                {t.teams.map((team,i)=>(
                  <div key={team} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<t.teams.length-1?`1px solid ${css.border}`:'none'}}>
                    <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${t.color}33,${t.color}66)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:t.color,border:`1px solid ${t.color}44`}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{team}</div>
                      <div style={{fontSize:11,color:css.sub}}>{(teamsDB[team]||[]).length} registered players</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:t.color}}>{(t.table.find(r=>r.team===team)||{}).pts||0} pts</div>
                  </div>
                ))}
              </GSection>
            </div>
          )}
          {innerT==='chart'&&(
            <GSection title="RUNS COMPARISON" css={css}>
              {orange.length===0?<div style={{textAlign:'center',padding:20,color:css.sub}}>No data yet.</div>:
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={orange} margin={{top:4,right:4,bottom:4,left:-20}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={css.border}/>
                    <XAxis dataKey="name" tick={{fontSize:9,fill:css.sub}} tickFormatter={n=>n.split(' ')[0]}/>
                    <YAxis tick={{fontSize:9,fill:css.sub}}/>
                    <Tooltip contentStyle={{background:css.card,border:`1px solid ${css.border}`,borderRadius:8,fontSize:11}}/>
                    <Bar dataKey="runs" radius={[4,4,0,0]}>{orange.map((_,i)=><Cell key={i} fill={COLORS_BAR[i%COLORS_BAR.length]}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              }
            </GSection>
          )}
        </div>
      </div>
    )
  }

  return(
    <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontWeight:900,fontSize:16}}>Tournaments</div><div style={{fontSize:11,color:css.sub}}>{tournaments.length} total</div></div>
        <button onClick={()=>{if(!isAdmin){window.alert('Only Admin can create tournaments.');return}setShowNew(true)}} style={{background:isAdmin?`linear-gradient(135deg,${C.yellow},${C.yellowDark})`:css.border,border:'none',borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:800,color:isAdmin?C.black:css.sub,cursor:isAdmin?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:6}}><Plus size={13}/>New</button>
      </div>
      {showNew&&(
        <div style={{background:css.card,borderRadius:16,padding:16,border:`1px solid ${C.yellow}44`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <span style={{fontWeight:800,fontSize:14,color:css.accent}}>Create Tournament</span>
            <button onClick={()=>setShowNew(false)} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={16}/></button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <GIn label="Tournament Name" value={nForm.name} onChange={v=>setNForm(f=>({...f,name:v}))} css={css}/>
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Format</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {Object.keys(FORMATS).map(f=><button key={f} onClick={()=>setNForm(fm=>({...fm,format:f}))} style={{background:nForm.format===f?C.yellow:css.bg,color:nForm.format===f?C.black:css.text,border:`1px solid ${nForm.format===f?C.yellow:css.border}`,borderRadius:8,padding:'7px 4px',fontSize:11,fontWeight:700,cursor:'pointer'}}>{f}</button>)}
              </div>
              {nForm.format==='CUSTOM'&&(
                <div style={{marginTop:10}}>
                  <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Overs per Innings</label>
                  <input type="number" min="1" value={nForm.customOvers} onChange={e=>{const v=parseInt(e.target.value);if(v>0)setNForm(f=>({...f,customOvers:String(v)}))}} style={{width:'100%',background:css.bg,border:`1px solid ${css.accent}55`,borderRadius:8,padding:'10px 12px',fontSize:14,fontWeight:700,color:css.accent,boxSizing:'border-box',outline:'none'}}/>
                  <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                    {[2,3,4,5,6,8,10,15,20].map(o=><button key={o} onClick={()=>setNForm(f=>({...f,customOvers:String(o)}))} style={{background:parseInt(nForm.customOvers)===o?C.yellow:`${css.accent}22`,color:parseInt(nForm.customOvers)===o?C.black:css.accent,border:`1px solid ${css.accent}44`,borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>{o} ov</button>)}
                  </div>
                </div>
              )}
              {nForm.format==='HUNDRED'&&(
                <div style={{marginTop:8,background:`${css.accent}11`,border:`1px solid ${css.accent}33`,borderRadius:8,padding:'8px 12px',fontSize:11,color:css.sub}}>💯 Each team faces exactly <span style={{color:css.accent,fontWeight:800}}>100 balls</span>. Innings ends on 10 wickets or 100 balls.</div>
              )}
            </div>
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Select Teams from Players DB</label>
              {dbTeams.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                  <button onClick={()=>setSelectedTeams([...dbTeams])} style={{background:`${C.info}22`,border:`1px solid ${C.info}44`,borderRadius:8,padding:'7px 10px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer'}}>Select All</button>
                  <button onClick={()=>setSelectedTeams([])} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'7px 10px',fontSize:11,fontWeight:700,color:css.sub,cursor:'pointer'}}>Clear All</button>
                </div>
              )}
              {dbTeams.length===0&&<div style={{fontSize:11,color:css.sub,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px'}}>No teams in Players DB yet. Add teams in Players tab first.</div>}
              {dbTeams.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,maxHeight:140,overflowY:'auto',paddingRight:2}}>
                  {dbTeams.map(team=>{
                    const active=selectedTeams.includes(team)
                    return(
                      <button key={team} onClick={()=>setSelectedTeams(prev=>active?prev.filter(x=>x!==team):[...prev,team])} style={{background:active?`${css.accent}22`:css.bg,color:active?css.accent:css.text,border:`1px solid ${active?css.accent:css.border}`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,cursor:'pointer',textAlign:'left',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{active?'✓ ':''}{team}</button>
                    )
                  })}
                </div>
              )}
              <div style={{fontSize:11,color:css.sub,marginTop:8}}>Selected: {selectedTeams.length?selectedTeams.join(', '):'None'}</div>
            </div>
            <div style={{background:nForm.hasGroups?`${C.info}11`:css.bg,border:`1px solid ${nForm.hasGroups?C.info:css.border}`,borderRadius:10,padding:12,cursor:'pointer'}} onClick={()=>setNForm(f=>({...f,hasGroups:!f.hasGroups}))}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${nForm.hasGroups?C.info:css.border}`,background:nForm.hasGroups?C.info:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{nForm.hasGroups&&'✓'}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:css.text}}>📊 Use Groups</div>
                  <div style={{fontSize:11,color:css.sub}}>Divide teams into groups for round-robin, then knockouts</div>
                </div>
              </div>
            </div>
            <div style={{fontSize:11,color:css.sub}}>💡 You can add more teams later from the Teams tab inside the tournament.</div>
            <button onClick={createT} disabled={selectedTeams.length<2} style={{background:selectedTeams.length<2?css.border:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:selectedTeams.length<2?css.sub:C.black,cursor:selectedTeams.length<2?'not-allowed':'pointer'}}>🏆 Create Tournament</button>
          </div>
        </div>
      )}
      {tournaments.map(t=>(
        <div key={t.id} onClick={()=>{setSelT(t.id);setView('detail');setInnerT('table')}} style={{background:css.card,borderRadius:16,padding:16,border:`1px solid ${css.border}`,cursor:'pointer',borderLeft:`4px solid ${t.color}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{fontSize:28}}>{t.emoji}</div>
              <div><div style={{fontWeight:800,fontSize:14}}>{t.name}</div><div style={{fontSize:11,color:css.sub}}>{t.format}{t.format==='CUSTOM'&&t.customOvers?` (${t.customOvers} ov)`:''}\u00b7{t.teams.length} teams</div></div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              {canManageTournament(t)&&<button onClick={e=>{e.stopPropagation();deleteTournament(t.id,t.name)}} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:7,padding:'5px 7px',cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}} title="Delete tournament"><Trash2 size={12}/></button>}
              <div style={{background:statusBg(t.status),color:statusColor(t.status),fontSize:9,fontWeight:700,letterSpacing:0.5,padding:'3px 7px',borderRadius:6,whiteSpace:'nowrap'}}>{statusLabel(t.status)}</div>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,color:css.sub}}>{t.played}/{t.matches} matches</span><span style={{fontSize:11,color:t.color,fontWeight:700}}>{t.prize}</span></div>
            <div style={{height:4,background:css.border,borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',background:t.color,borderRadius:2,width:t.matches>0?`${(t.played/t.matches)*100}%`:'0%'}}/></div>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {t.teams.slice(0,4).map(team=><span key={team} style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${t.color}22`,color:t.color,fontWeight:600}}>{team}</span>)}
            {t.teams.length>4&&<span style={{fontSize:10,color:css.sub,padding:'2px 8px'}}>+{t.teams.length-4} more</span>}
          </div>
          {t.winner&&<div style={{marginTop:10,background:`${css.accent}22`,borderRadius:8,padding:'6px 10px',display:'flex',alignItems:'center',gap:6}}><span>🏆</span><span style={{fontSize:11,fontWeight:700,color:css.accent}}>{t.winner} won</span></div>}
          <div style={{marginTop:10,display:'flex',justifyContent:'flex-end',fontSize:11,color:css.sub,alignItems:'center',gap:4}}>View<ChevronRight size={12}/></div>
        </div>
      ))}
    </div>
  )
}
