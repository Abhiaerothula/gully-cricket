import{useState,useEffect,useCallback}from'react'
import{Plus,X,ChevronDown,RotateCcw}from'lucide-react'
import{C,FORMATS,WICKET_TYPES,EXTRAS_TYPES}from'../data/constants.js'
import{GSection,MatchCard,GIn}from'../components/Shared.jsx'

function LiveScorer({match,setMatches,css,isDark,onExit,currentUser}){
  const[inn,setInn]=useState(0)
  const[showWicket,setShowWicket]=useState(false)
  const[showExtras,setShowExtras]=useState(false)
  const[wicketType,setWicketType]=useState('')
  const[dismissedBatter,setDismissedBatter]=useState('striker')
  const[nextBatter,setNextBatter]=useState('')
  const[showScorerChange,setShowScorerChange]=useState(false)
  const[newScorer,setNewScorer]=useState('')
  const[showBowlerChange,setShowBowlerChange]=useState(false)
  const[nextBowler,setNextBowler]=useState('')
  const[lastBowlerPrompt,setLastBowlerPrompt]=useState('')
  const[tempTeam1,setTempTeam1]=useState(match.team1)
  const[tempTeam2,setTempTeam2]=useState(match.team2)
  const[setupStriker,setSetupStriker]=useState('')
  const[setupNonStriker,setSetupNonStriker]=useState('')
  const[setupBowler,setSetupBowler]=useState('')
  const ci=match.innings[inn]
  const fmt=FORMATS[match.format]
  const isHundred=match.format==='HUNDRED'
  const effectiveOvers=match.format==='CUSTOM'?match.customOvers:fmt.overs
  const totalBalls=isHundred?100:(effectiveOvers?effectiveOvers*6:null)
  const isFreeHit=(ci.ballLog||[]).length>0&&(ci.ballLog[ci.ballLog.length-1]||'').startsWith('NB')
  const battingPlayers=ci?.batting===match.team1?(match.team1Players||[]):(match.team2Players||[])
  const bowlingPlayers=ci?.batting===match.team1?(match.team2Players||[]):(match.team1Players||[])
  const bowlersForChange=bowlingPlayers.filter(p=>p!==ci?.bowler)
  const bowlerOptions=bowlersForChange.length?bowlersForChange:bowlingPlayers
  const outPlayers=ci?.outPlayers||[]
  const needsInningsSetup=!ci?.striker||!ci?.nonStriker||!ci?.bowler
  const availableIncoming=battingPlayers.filter(p=>p!==ci?.striker&&p!==ci?.nonStriker&&!outPlayers.includes(p))
  const canScore=!!currentUser?.email

  useEffect(()=>{
    setSetupStriker(ci?.striker||'')
    setSetupNonStriker(ci?.nonStriker||'')
    setSetupBowler(ci?.bowler||'')
  },[inn,ci?.striker,ci?.nonStriker,ci?.bowler])

  useEffect(()=>{
    if(needsInningsSetup||match.status!=='live'||!ci?.balls||ci.balls%6!==0)return
    const inningsDone=(ci.wickets>=10)||(isHundred?ci.balls>=100:(effectiveOvers&&ci.overs>=effectiveOvers))
    if(inningsDone)return
    const promptKey=`${inn}-${ci.overs}`
    if(lastBowlerPrompt===promptKey)return
    setLastBowlerPrompt(promptKey)
    setNextBowler('')
    setShowBowlerChange(true)
  },[ci?.balls,ci?.overs,ci?.wickets,inn,match.status,needsInningsSetup,isHundred,effectiveOvers,lastBowlerPrompt])

  const addBall=useCallback((runs,isWicket=false,extras=null)=>{
    if(!canScore)return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings]
      const c={...innings[inn]}
      const balls=[...(c.ballLog||[])]
      const snaps=[...(c.snapshots||[])]
      snaps.push({
        score:c.score,wickets:c.wickets,balls:c.balls,overs:c.overs,
        extras:c.extras||0,oversDisplay:c.oversDisplay,
        striker:c.striker,nonStriker:c.nonStriker,bowler:c.bowler,
        outPlayers:[...(c.outPlayers||[])]
      })
      let legal=true,log=''
      if(extras==='No Ball'){log=`NB${runs>0?'+'+runs:''}`;legal=false}
      else if(extras==='Wide'){log=`Wd${runs>0?'+'+runs:''}`;legal=false}
      else if(extras==='Bye'){log=`B${runs>0?'+'+runs:''}`}
      else if(extras==='Leg Bye'){log=`LB${runs>0?'+'+runs:''}`}
      else if(isWicket){
        const fh=balls.length>0&&balls[balls.length-1].startsWith('NB')
        if(fh){log=`FH-${runs}`}
        else{log=`W${runs>0?'+'+runs:''}`;c.wickets=Math.min(c.wickets+1,10)}
      }else{log=`${runs}`}
      c.score+=runs+(extras?1:0)
      if(extras)c.extras=(c.extras||0)+1+runs
      if(legal){
        c.balls=(c.balls||0)+1
        c.overs=Math.floor(c.balls/6)
        c.oversDisplay=`${c.overs}.${c.balls%6}`
      }

      const rotateForRuns=extras!=='No Ball'&&extras!=='Wide'&&!isWicket&&runs%2===1
      if(rotateForRuns){
        const temp=c.striker
        c.striker=c.nonStriker
        c.nonStriker=temp
      }
      if(legal&&c.balls%6===0){
        const temp=c.striker
        c.striker=c.nonStriker
        c.nonStriker=temp
      }

      balls.push(log);c.ballLog=balls;c.snapshots=snaps;innings[inn]=c
      let status=m.status
      if(c.wickets>=10)status=inn===0?'break':'completed'
      const eff=m.format==='CUSTOM'?m.customOvers:FORMATS[m.format]?.overs
      if(m.format==='HUNDRED'&&legal&&c.balls>=100)status=inn===0?'break':'completed'
      else if(eff&&legal&&c.balls%6===0&&c.overs>=eff)status=inn===0?'break':'completed'
      return{...m,innings,status}
    }))
  },[match.id,inn,setMatches,fmt,canScore])

  const undoLast=useCallback(()=>{
    if(!canScore)return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings]
      const c={...innings[inn]}
      const balls=[...(c.ballLog||[])],snaps=[...(c.snapshots||[])]
      if(!balls.length)return m
      balls.pop();const sn=snaps.pop()
      if(sn){
        c.score=sn.score;c.wickets=sn.wickets;c.balls=sn.balls;c.overs=sn.overs
        c.extras=sn.extras;c.oversDisplay=sn.oversDisplay
        c.striker=sn.striker;c.nonStriker=sn.nonStriker;c.bowler=sn.bowler
        c.outPlayers=sn.outPlayers
      }
      c.ballLog=balls;c.snapshots=snaps;innings[inn]=c
      return{...m,innings,status:'live'}
    }))
  },[match.id,inn,setMatches,canScore])

  const swapTeams=()=>{
    if(!canScore)return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      return{...m,team1:tempTeam2,team2:tempTeam1}
    }))
    setTempTeam1(tempTeam2)
    setTempTeam2(tempTeam1)
  }

  const changeScorer=()=>{
    if(!canScore)return
    if(!newScorer.trim())return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      return{...m,scorer:newScorer.trim()}
    }))
    setShowScorerChange(false)
    setNewScorer('')
  }

  const saveInningsSetup=()=>{
    if(!canScore)return
    if(!setupStriker||!setupNonStriker||!setupBowler||setupStriker===setupNonStriker)return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings]
      innings[inn]={...innings[inn],striker:setupStriker,nonStriker:setupNonStriker,bowler:setupBowler,outPlayers:innings[inn].outPlayers||[]}
      return{...m,innings}
    }))
  }

  const confirmWicket=()=>{
    if(!canScore)return
    if(!nextBatter)return
    const dismissed= dismissedBatter==='striker'?ci.striker:ci.nonStriker
    addBall(0,true,null)
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings]
      const c={...innings[inn]}
      const out=[...(c.outPlayers||[])]
      if(dismissed&&!out.includes(dismissed))out.push(dismissed)
      if(dismissedBatter==='striker')c.striker=nextBatter
      else c.nonStriker=nextBatter
      c.outPlayers=out
      innings[inn]=c
      return{...m,innings}
    }))
    setShowWicket(false)
    setWicketType('')
    setDismissedBatter('striker')
    setNextBatter('')
  }

  const confirmBowlerChange=()=>{
    if(!canScore)return
    if(!nextBowler)return
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings]
      innings[inn]={...innings[inn],bowler:nextBowler}
      return{...m,innings}
    }))
    setShowBowlerChange(false)
    setNextBowler('')
  }

  const target=inn===1?(match.innings[0].score+1):null
  const chasing=target&&ci.score>=target
  const crr=ci.balls>0?((ci.score/ci.balls)*6).toFixed(2):'0.00'
  const bLeft=totalBalls?(totalBalls-ci.balls):null
  const rrr=(target&&inn===1&&bLeft>0)?(((target-ci.score)/bLeft)*6).toFixed(2):null
  const canUndo=(ci.ballLog||[]).length>0
  const bStyle=b=>{
    if(b.startsWith('FH'))return{bg:C.info,col:'#fff'}
    if(b.startsWith('W'))return{bg:C.danger,col:'#fff'}
    if(b.startsWith('NB'))return{bg:C.warn,col:C.black}
    if(b.startsWith('Wd'))return{bg:'#FF6B35',col:'#fff'}
    if(b==='6')return{bg:C.yellow,col:C.black}
    if(b==='4')return{bg:C.success,col:'#fff'}
    return{bg:isDark?C.midGray:C.lightGray,col:isDark?'#fff':C.black}
  }
  return(
    <div style={{paddingBottom:12}}>
      <div style={{background:`linear-gradient(135deg,${C.black},${C.darkGray})`,padding:'14px 16px',borderBottom:`2px solid ${C.yellow}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <button onClick={onExit} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:8,cursor:'pointer',color:C.yellow,display:'flex',alignItems:'center'}}><ChevronDown size={16}/></button>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:1}}>{match.format}·{match.status.toUpperCase()}</div>
            {isFreeHit&&<div style={{fontSize:11,fontWeight:900,color:C.yellow}}>⚡ FREE HIT BALL</div>}
          </div>
          <button onClick={undoLast} disabled={!canUndo||!canScore} style={{background:canUndo&&canScore?`${C.danger}33`:'rgba(255,255,255,0.05)',border:`1px solid ${canUndo&&canScore?C.danger+'55':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'6px 10px',cursor:canUndo&&canScore?'pointer':'default',color:canUndo&&canScore?C.danger:'rgba(255,255,255,0.3)',display:'flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700}}>
            <RotateCcw size={12}/>Undo
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:2}}>{match.team1}</div>
            <div style={{fontSize:30,fontWeight:900,color:inn===0?C.yellow:C.white,lineHeight:1}}>{inn===0?`${ci.score}/${ci.wickets}`:`${match.innings[0].score}/${match.innings[0].wickets}`}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{isHundred?(inn===0?`${ci.balls}b`:`${match.innings[0].balls}b`):`${inn===0?ci.oversDisplay||'0.0':match.innings[0].oversDisplay||'0.0'} ov`}</div>
          </div>
          <div style={{width:32,height:32,borderRadius:'50%',background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:C.yellow}}>VS</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:2}}>{match.team2}</div>
            <div style={{fontSize:30,fontWeight:900,color:inn===1?C.yellow:'rgba(255,255,255,0.35)',lineHeight:1}}>{inn===1?`${ci.score}/${ci.wickets}`:(match.innings[1]?.score>0?`${match.innings[1].score}/${match.innings[1].wickets}`:'—')}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{isHundred?(inn===1?`${ci.balls}b`:'—'):`${inn===1?ci.oversDisplay||'0.0':'—'} ov`}</div>
          </div>
        </div>
        {target&&!chasing&&<div style={{marginTop:10,background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'6px 12px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:'rgba(255,255,255,0.8)'}}>Need {target-ci.score} off {bLeft} balls</span><span style={{fontSize:11,color:C.yellow,fontWeight:700}}>RRR:{rrr}</span></div>}
        {chasing&&<div style={{marginTop:10,textAlign:'center',color:C.yellow,fontWeight:900,fontSize:15}}>🎉 {match.team2} wins!</div>}
      </div>
      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
        {!canScore&&<div style={{background:`${C.warn}22`,border:`1px solid ${C.warn}55`,borderRadius:10,padding:'10px 12px',fontSize:12,color:C.warn,fontWeight:700}}>Please login to continue live scoring.</div>}
        {isFreeHit&&(<div style={{background:`${C.yellow}15`,border:`2px solid ${C.yellow}`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:24}}>⚡</span><div><div style={{fontSize:14,fontWeight:900,color:C.yellow}}>FREE HIT!</div><div style={{fontSize:11,color:css.sub}}>No dismissal except Run Out</div></div></div>)}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[{label:'CRR',value:crr},{label:'Extras',value:ci.extras||0},{label:totalBalls?'Left':'Balls',value:bLeft??ci.balls}].map(s=>(
            <div key={s.label} style={{background:css.card,borderRadius:10,padding:'10px 8px',border:`1px solid ${css.border}`,textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:C.yellow}}>{s.value}</div>
              <div style={{fontSize:9,color:css.sub,marginTop:2,letterSpacing:0.5}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:css.card,borderRadius:12,padding:12,border:`1px solid ${css.border}`}}>
          <div style={{fontSize:10,color:css.sub,letterSpacing:1,marginBottom:8}}>ON FIELD</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            <div style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:8}}>
              <div style={{fontSize:9,color:css.sub}}>Striker</div>
              <div style={{fontSize:12,fontWeight:700,color:css.text}}>{ci.striker||'Select'}</div>
            </div>
            <div style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:8}}>
              <div style={{fontSize:9,color:css.sub}}>Non-Striker</div>
              <div style={{fontSize:12,fontWeight:700,color:css.text}}>{ci.nonStriker||'Select'}</div>
            </div>
            <div style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:8}}>
              <div style={{fontSize:9,color:css.sub}}>Bowler</div>
              <div style={{fontSize:12,fontWeight:700,color:css.text}}>{ci.bowler||'Select'}</div>
            </div>
          </div>
        </div>
        {needsInningsSetup&&canScore&&(
          <div style={{background:css.card,borderRadius:12,padding:12,border:`2px solid ${C.info}`}}>
            <div style={{fontSize:12,fontWeight:800,color:C.info,marginBottom:10}}>Set Players for {ci.batting}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:8}}>
              <select value={setupStriker} onChange={e=>setSetupStriker(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text}}>
                <option value="">Select striker</option>
                {battingPlayers.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <select value={setupNonStriker} onChange={e=>setSetupNonStriker(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text}}>
                <option value="">Select non-striker</option>
                {battingPlayers.filter(p=>p!==setupStriker).map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <select value={setupBowler} onChange={e=>setSetupBowler(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text}}>
                <option value="">Select bowler</option>
                {bowlingPlayers.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={saveInningsSetup} disabled={!setupStriker||!setupNonStriker||!setupBowler||setupStriker===setupNonStriker} style={{background:(!setupStriker||!setupNonStriker||!setupBowler||setupStriker===setupNonStriker)?css.border:`linear-gradient(135deg,${C.info},#0066cc)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:(!setupStriker||!setupNonStriker||!setupBowler||setupStriker===setupNonStriker)?'not-allowed':'pointer'}}>Save Field Setup</button>
            </div>
          </div>
        )}
        <div style={{background:css.card,borderRadius:12,padding:12,border:`1px solid ${css.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:10,color:css.sub,letterSpacing:1}}>THIS OVER</span>
            {canUndo&&canScore&&<button onClick={undoLast} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'3px 8px',cursor:'pointer',color:C.danger,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',gap:4}}><RotateCcw size={10}/>Undo last</button>}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {(ci.ballLog||[]).slice(-6).map((b,i)=>{const{bg,col}=bStyle(b);const isNB=b.startsWith('NB');return(
              <div key={i} style={{position:'relative'}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:bg,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,boxShadow:isNB?`0 0 0 2px ${C.yellow}`:b==='6'?`0 0 6px ${C.yellow}55`:'none'}}>{b}</div>
                {isNB&&<div style={{position:'absolute',top:-6,right:-6,background:C.yellow,color:C.black,fontSize:7,fontWeight:900,borderRadius:4,padding:'1px 3px'}}>FH</div>}
              </div>
            )})}
            {!(ci.ballLog||[]).length&&<span style={{fontSize:12,color:css.sub}}>No balls yet</span>}
          </div>
        </div>
        {match.status==='live'&&!needsInningsSetup&&!showBowlerChange&&canScore&&(
          <>
            <div style={{background:css.card,borderRadius:12,padding:12,border:`2px solid ${isFreeHit?C.yellow:css.border}`,transition:'border 0.3s'}}>
              <div style={{fontSize:10,color:isFreeHit?C.yellow:css.sub,marginBottom:10,letterSpacing:1,fontWeight:isFreeHit?800:400}}>{isFreeHit?'⚡ FREE HIT — RUNS':'RUNS'}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
                {[0,1,2,3].map(r=><button key={r} onClick={()=>addBall(r)} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:10,padding:14,fontSize:18,fontWeight:700,cursor:'pointer',color:css.text}}>{r}</button>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>addBall(4)} style={{background:`linear-gradient(135deg,${C.success},#16a34a)`,border:'none',borderRadius:10,padding:16,fontSize:22,fontWeight:900,cursor:'pointer',color:'#fff'}}>4 ●</button>
                <button onClick={()=>addBall(6)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:16,fontSize:22,fontWeight:900,cursor:'pointer',color:C.black,boxShadow:`0 4px 12px ${C.yellow}44`}}>6 ★</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={()=>{if(!isFreeHit)setShowWicket(true)}} style={{background:isFreeHit?'rgba(100,100,100,0.15)':`linear-gradient(135deg,${C.danger},#cc0000)`,border:`1px solid ${isFreeHit?css.border:C.danger}`,borderRadius:10,padding:14,fontSize:13,fontWeight:800,color:isFreeHit?css.sub:'#fff',cursor:isFreeHit?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,position:'relative'}}>
                🎯 WICKET
                {isFreeHit&&<span style={{position:'absolute',top:3,right:4,fontSize:8,background:`${C.yellow}33`,color:C.yellow,borderRadius:3,padding:'1px 4px',fontWeight:700}}>BLOCKED</span>}
              </button>
              <button onClick={()=>setShowExtras(true)} style={{background:`linear-gradient(135deg,${C.warn},#e67e00)`,border:'none',borderRadius:10,padding:14,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>⚡ EXTRAS</button>
            </div>
          </>
        )}
        {inn===0&&(match.status==='break'||(match.status==='live'&&!showBowlerChange&&((isHundred&&ci.balls>=100)||(effectiveOvers&&ci.overs>=effectiveOvers))))&&canScore&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{background:`${C.yellow}11`,border:`1px solid ${C.yellow}33`,borderRadius:12,padding:'10px 14px',textAlign:'center'}}>
              <div style={{fontSize:13,fontWeight:800,color:C.yellow}}>🏏 1st Innings Complete</div>
              <div style={{fontSize:12,color:css.sub,marginTop:2}}>{match.innings[0].batting}: {match.innings[0].score}/{match.innings[0].wickets} ({match.innings[0].oversDisplay||'0.0'} ov)</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={()=>setShowScorerChange(true)} style={{background:`linear-gradient(135deg,${C.info},#0066cc)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>👤 Change Scorer</button>
              <button onClick={swapTeams} style={{background:`linear-gradient(135deg,${C.warn},#e67e00)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>🔄 Swap Teams</button>
            </div>
            <button onClick={()=>{setInn(1);setMatches(prev=>prev.map(m=>m.id===match.id?{...m,status:'live'}:m))}} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',boxShadow:`0 4px 16px ${C.yellow}44`}}>Start 2nd Innings →</button>
          </div>
        )}
        {showWicket&&canScore&&(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'flex-end'}}>
            <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.yellow}`,borderBottom:'none'}}>
              <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:C.yellow}}>🎯 Wicket Type</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {WICKET_TYPES.map(t=><button key={t} onClick={()=>setWicketType(t)} style={{background:wicketType===t?C.danger:css.bg,color:wicketType===t?'#fff':css.text,border:`1px solid ${wicketType===t?C.danger:css.border}`,borderRadius:8,padding:'10px 8px',fontSize:12,fontWeight:600,cursor:'pointer'}}>{t}</button>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <button onClick={()=>setDismissedBatter('striker')} style={{background:dismissedBatter==='striker'?C.yellow:css.bg,color:dismissedBatter==='striker'?C.black:css.text,border:`1px solid ${dismissedBatter==='striker'?C.yellow:css.border}`,borderRadius:8,padding:'8px 6px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Striker Out</button>
                <button onClick={()=>setDismissedBatter('nonStriker')} style={{background:dismissedBatter==='nonStriker'?C.yellow:css.bg,color:dismissedBatter==='nonStriker'?C.black:css.text,border:`1px solid ${dismissedBatter==='nonStriker'?C.yellow:css.border}`,borderRadius:8,padding:'8px 6px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Non-Striker Out</button>
              </div>
              <select value={nextBatter} onChange={e=>setNextBatter(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,marginBottom:12}}>
                <option value="">Select next batsman</option>
                {availableIncoming.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>{setShowWicket(false);setWicketType('');setDismissedBatter('striker');setNextBatter('')}} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
                <button onClick={confirmWicket} disabled={!nextBatter} style={{background:!nextBatter?css.border:`linear-gradient(135deg,${C.danger},#cc0000)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:!nextBatter?'not-allowed':'pointer'}}>Confirm W</button>
              </div>
            </div>
          </div>
        )}
        {showExtras&&canScore&&(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'flex-end'}}>
            <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.yellow}`,borderBottom:'none'}}>
              <div style={{fontWeight:800,fontSize:16,marginBottom:4,color:C.yellow}}>⚡ Extras</div>
              <div style={{fontSize:11,color:css.sub,marginBottom:14}}>No Ball triggers a Free Hit next delivery</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:12}}>
                {EXTRAS_TYPES.map(t=><button key={t} onClick={()=>{addBall(0,false,t);setShowExtras(false)}} style={{background:t==='No Ball'?`${C.yellow}22`:css.bg,border:`1px solid ${t==='No Ball'?C.yellow:css.border}`,borderRadius:10,padding:14,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>{t==='No Ball'?'⚡ No Ball → FH':t}</button>)}
              </div>
              <button onClick={()=>setShowExtras(false)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
            </div>
          </div>
        )}
        {showScorerChange&&canScore&&(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'flex-end'}}>
            <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.info}`,borderBottom:'none'}}>
              <div style={{fontWeight:800,fontSize:16,marginBottom:14,color:C.info}}>👤 Change Scorer</div>
              <input type="text" value={newScorer} onChange={e=>setNewScorer(e.target.value)} placeholder="Enter scorer name" style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'12px 14px',fontSize:14,color:css.text,boxSizing:'border-box',outline:'none',marginBottom:12}}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>{setShowScorerChange(false);setNewScorer('')}} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
                <button onClick={changeScorer} style={{background:`linear-gradient(135deg,${C.info},#0066cc)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer'}}>Confirm</button>
              </div>
            </div>
          </div>
        )}
        {showBowlerChange&&canScore&&(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:210,display:'flex',alignItems:'flex-end'}}>
            <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.warn}`,borderBottom:'none'}}>
              <div style={{fontWeight:800,fontSize:16,marginBottom:6,color:C.warn}}>🎯 Over Complete</div>
              <div style={{fontSize:11,color:css.sub,marginBottom:12}}>Select bowler for over {ci.overs+1}</div>
              <div style={{fontSize:11,color:css.sub,marginBottom:8}}>Current bowler: <span style={{color:css.text,fontWeight:700}}>{ci.bowler||'—'}</span></div>
              <select value={nextBowler} onChange={e=>setNextBowler(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,marginBottom:12}}>
                <option value="">Select next bowler</option>
                {bowlerOptions.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={confirmBowlerChange} disabled={!nextBowler} style={{width:'100%',background:!nextBowler?css.border:`linear-gradient(135deg,${C.warn},#e67e00)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:!nextBowler?css.sub:C.black,cursor:!nextBowler?'not-allowed':'pointer'}}>Confirm Bowler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ballColor(b){
  if(b==='6')return{bg:C.yellow,col:C.black}
  if(b==='4')return{bg:C.success,col:'#fff'}
  if(b&&(b==='W'||b.startsWith('W+')))return{bg:C.danger,col:'#fff'}
  if(b&&b.startsWith('NB'))return{bg:C.warn,col:C.black}
  if(b&&b.startsWith('Wd'))return{bg:'#FF6B35',col:'#fff'}
  if(b==='0')return{bg:'#333',col:'#555'}
  return{bg:'#555',col:'#fff'}
}

function getScorecard(innings){
  const log=innings.ballLog||[],snaps=innings.snapshots||[]
  const batters={},bowlers={}
  log.forEach((ball,i)=>{
    const snap=snaps[i]||{},striker=snap.striker,bowler=snap.bowler
    if(striker&&!batters[striker])batters[striker]={name:striker,R:0,B:0,fours:0,sixes:0,out:false,bowlerOut:''}
    if(bowler&&!bowlers[bowler])bowlers[bowler]={name:bowler,balls:0,R:0,W:0}
    const isWide=ball.startsWith('Wd'),isNB=ball.startsWith('NB')
    const isWicket=!isWide&&(ball==='W'||ball.startsWith('W+'))
    const isBye=ball.startsWith('B')&&!isWicket,isLB=ball.startsWith('LB'),isFH=ball.startsWith('FH')
    const legal=!isWide&&!isNB
    let batterR=0,totalR=0
    if(isWide){const p=ball.indexOf('+');const bonus=p>=0?parseInt(ball.slice(p+1))||0:0;totalR=1+bonus}
    else if(isNB){const p=ball.indexOf('+');const bonus=p>=0?parseInt(ball.slice(p+1))||0:0;batterR=bonus;totalR=1+bonus}
    else if(isWicket){const p=ball.indexOf('+');batterR=p>=0?parseInt(ball.slice(p+1))||0:0;totalR=batterR}
    else if(isBye){totalR=parseInt(ball.slice(1))||0}
    else if(isLB){totalR=parseInt(ball.slice(2))||0}
    else if(isFH){batterR=parseInt(ball.slice(3))||0;totalR=batterR}
    else{batterR=parseInt(ball)||0;totalR=batterR}
    if(striker&&batters[striker]){
      if(!isWide){batters[striker].R+=batterR;batters[striker].B++;if(batterR===4)batters[striker].fours++;if(batterR===6)batters[striker].sixes++}
      if(isWicket){batters[striker].out=true;batters[striker].bowlerOut=bowler||''}
    }
    if(bowler&&bowlers[bowler]){bowlers[bowler].R+=totalR;if(legal)bowlers[bowler].balls++;if(isWicket)bowlers[bowler].W++}
  })
  return{batting:Object.values(batters),bowling:Object.values(bowlers)}
}

function getCommentary(innings){
  const log=innings.ballLog||[],snaps=innings.snapshots||[]
  const lines=[];let legalInOver=0,overNum=0
  log.forEach((ball,i)=>{
    const snap=snaps[i]||{},striker=snap.striker||'—',bowler=snap.bowler||'—'
    const isWide=ball.startsWith('Wd'),isNB=ball.startsWith('NB'),legal=!isWide&&!isNB
    if(legal)legalInOver++
    const overRef=`${overNum}.${legalInOver}`
    let msg='',type='normal'
    if(ball==='0'){msg=`Dot ball. ${bowler} to ${striker}.`;type='dot'}
    else if(ball==='4'){msg=`FOUR! ${striker} drives ${bowler} for a boundary!`;type='four'}
    else if(ball==='6'){msg=`SIX! ${striker} launches ${bowler} out of the park!`;type='six'}
    else if(ball==='W'||ball.startsWith('W+')){msg=`WICKET! ${striker} dismissed by ${bowler}!`;type='wicket'}
    else if(ball.startsWith('NB')){msg=`No Ball! ${bowler} oversteps. FREE HIT next!`;type='nb'}
    else if(ball.startsWith('Wd')){msg=`Wide! ${bowler} strays off the line.`;type='wide'}
    else if(ball.startsWith('B')&&!ball.startsWith('Wd')){const r=parseInt(ball.slice(1))||0;msg=`${r} Bye${r!==1?'s':''}.`;type='bye'}
    else if(ball.startsWith('LB')){const r=parseInt(ball.slice(2))||0;msg=`${r} Leg Bye${r!==1?'s':''} off ${striker}.`;type='lb'}
    else if(ball.startsWith('FH')){const r=parseInt(ball.slice(3))||0;msg=`Free Hit! ${striker} scores ${r} run${r!==1?'s':''} off ${bowler}.`;type='fh'}
    else{const r=parseInt(ball)||0;msg=r===0?`Dot ball. ${bowler} to ${striker}.`:`${r} run${r!==1?'s':''}. ${striker} off ${bowler}.`}
    lines.push({ref:overRef,ball,msg,type})
    if(legal&&legalInOver===6){overNum++;legalInOver=0}
  })
  return lines.reverse()
}

function BallsViewScore({innings,css,isDark}){
  const[show,setShow]=useState(false)
  if(!innings||!(innings.ballLog||[]).length)return<div style={{textAlign:'center',padding:20,color:css.sub,fontSize:13}}>No ball data yet.</div>
  const balls=innings.ballLog,overs=[];let cur=[],lc=0
  balls.forEach((b,i)=>{cur.push({b,i});const ie=b.startsWith('Wd')||b.startsWith('NB');if(!ie)lc++;if(lc===6&&!ie){overs.push([...cur]);cur=[];lc=0}})
  if(cur.length)overs.push(cur)
  const display=show?overs:overs.slice(0,3)
  return(
    <div>
      {display.map((over,oi)=>(
        <div key={oi} style={{marginBottom:10}}>
          <div style={{fontSize:10,color:css.sub,marginBottom:4,letterSpacing:0.5}}>Over {oi+1}</div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {over.map(({b,i})=>{const{bg,col}=ballColor(b);return<div key={i} style={{width:28,height:28,borderRadius:'50%',background:bg,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{b}</div>})}
          </div>
        </div>
      ))}
      {overs.length>3&&<button onClick={()=>setShow(v=>!v)} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'6px 12px',fontSize:11,color:C.yellow,cursor:'pointer',width:'100%',marginTop:4,fontWeight:700}}>{show?'▲ Less':`▼ All ${overs.length} Overs`}</button>}
    </div>
  )
}

function MatchAnalysisView({match,onBack,css,isDark}){
  const[innIdx,setInnIdx]=useState(0)
  const[tab,setTab]=useState('scorecard')
  const ci=match.innings[innIdx]||match.innings[0]
  const sc=getScorecard(ci)
  const comm=getCommentary(ci)
  const inn0=match.innings[0],inn1=match.innings[1]
  const getWinner=()=>{
    if(match.status!=='completed')return null
    if(!inn1||inn1.score===undefined)return null
    if(inn1.score>inn0.score)return`${inn1.batting} won by ${10-inn1.wickets} wicket${(10-inn1.wickets)!==1?'s':''}`
    if(inn0.score>inn1.score){const mg=inn0.score-inn1.score;return`${inn0.batting} won by ${mg} run${mg!==1?'s':''}`}
    return'Match Tied!'
  }
  const winner=getWinner()
  return(
    <div style={{paddingBottom:20}}>
      <div style={{background:`linear-gradient(135deg,${C.black},#1a1a1a)`,padding:'14px 16px',borderBottom:`2px solid ${C.yellow}`}}>
        <button onClick={onBack} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'6px 12px',cursor:'pointer',color:C.yellow,fontSize:12,fontWeight:700,marginBottom:10}}>← Back</button>
        <div style={{fontSize:14,fontWeight:900,marginBottom:2,color:'#fff'}}>{match.team1} vs {match.team2}</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10}}>{match.format} · {new Date(match.created).toLocaleDateString()}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {match.innings.map((inn,i)=>(
            <div key={i} onClick={()=>setInnIdx(i)} style={{background:'rgba(255,255,255,0.07)',borderRadius:10,padding:10,textAlign:'center',border:innIdx===i?`2px solid ${C.yellow}`:'2px solid transparent',cursor:'pointer'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginBottom:2}}>{inn.batting||`Inn ${i+1}`}</div>
              <div style={{fontSize:22,fontWeight:900,color:innIdx===i?C.yellow:'#fff'}}>{inn.score}/{inn.wickets}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{inn.oversDisplay||'0.0'} ov</div>
            </div>
          ))}
        </div>
        {winner&&<div style={{marginTop:10,background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'8px 12px',textAlign:'center',fontSize:12,fontWeight:700,color:C.yellow}}>🏆 {winner}</div>}
      </div>
      <div style={{display:'flex',gap:6,padding:'12px 14px 0',overflowX:'auto'}}>
        {[{id:'scorecard',label:'📋 Scorecard'},{id:'balls',label:'🎯 Balls'},{id:'commentary',label:'💬 Commentary'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?C.yellow:css.card,color:tab===t.id?C.black:css.text,border:`1px solid ${tab===t.id?C.yellow:css.border}`,borderRadius:20,padding:'7px 14px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.label}</button>
        ))}
      </div>
      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
        {tab==='scorecard'&&(
          <>
            <div style={{background:css.card,borderRadius:14,overflow:'hidden',border:`1px solid ${css.border}`}}>
              <div style={{padding:'10px 12px',background:isDark?'#2a2a2a':'#f0f0f0',fontSize:11,fontWeight:800,color:css.text}}>🏏 BATTING — {ci.batting}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 36px 36px 28px 28px 52px',gap:2,padding:'7px 10px',fontSize:9,fontWeight:700,color:css.sub,letterSpacing:0.5}}>
                <div>BATTER</div><div style={{textAlign:'right'}}>R</div><div style={{textAlign:'right'}}>B</div><div style={{textAlign:'right'}}>4s</div><div style={{textAlign:'right'}}>6s</div><div style={{textAlign:'right'}}>SR</div>
              </div>
              {sc.batting.length===0&&<div style={{textAlign:'center',padding:14,color:css.sub,fontSize:12}}>No batting data recorded.</div>}
              {sc.batting.map(p=>(
                <div key={p.name} style={{display:'grid',gridTemplateColumns:'1fr 36px 36px 28px 28px 52px',gap:2,padding:'9px 10px',borderTop:`1px solid ${css.border}`,background:!p.out?`${C.success}09`:'transparent'}}>
                  <div><div style={{fontSize:12,fontWeight:700,color:css.text}}>{p.name}</div><div style={{fontSize:9,color:css.sub}}>{p.out?`b ${p.bowlerOut||'—'}`:'not out'}</div></div>
                  <div style={{fontSize:14,fontWeight:900,color:p.R>=50?C.yellow:css.text,textAlign:'right'}}>{p.R}</div>
                  <div style={{fontSize:12,color:css.sub,textAlign:'right'}}>{p.B}</div>
                  <div style={{fontSize:12,color:C.success,textAlign:'right'}}>{p.fours}</div>
                  <div style={{fontSize:12,color:C.yellow,textAlign:'right'}}>{p.sixes}</div>
                  <div style={{fontSize:11,color:css.sub,textAlign:'right'}}>{p.B>0?((p.R/p.B)*100).toFixed(1):'—'}</div>
                </div>
              ))}
            </div>
            <div style={{background:css.card,borderRadius:14,overflow:'hidden',border:`1px solid ${css.border}`}}>
              <div style={{padding:'10px 12px',background:isDark?'#2a2a2a':'#f0f0f0',fontSize:11,fontWeight:800,color:css.text}}>🎯 BOWLING</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 40px 36px 36px 52px',gap:2,padding:'7px 10px',fontSize:9,fontWeight:700,color:css.sub,letterSpacing:0.5}}>
                <div>BOWLER</div><div style={{textAlign:'right'}}>O</div><div style={{textAlign:'right'}}>R</div><div style={{textAlign:'right'}}>W</div><div style={{textAlign:'right'}}>ECO</div>
              </div>
              {sc.bowling.length===0&&<div style={{textAlign:'center',padding:14,color:css.sub,fontSize:12}}>No bowling data recorded.</div>}
              {sc.bowling.map(p=>(
                <div key={p.name} style={{display:'grid',gridTemplateColumns:'1fr 40px 36px 36px 52px',gap:2,padding:'9px 10px',borderTop:`1px solid ${css.border}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:css.text}}>{p.name}</div>
                  <div style={{fontSize:12,color:css.sub,textAlign:'right'}}>{Math.floor(p.balls/6)}.{p.balls%6}</div>
                  <div style={{fontSize:12,color:C.danger,textAlign:'right'}}>{p.R}</div>
                  <div style={{fontSize:14,fontWeight:900,color:p.W>=3?C.yellow:css.text,textAlign:'right'}}>{p.W}</div>
                  <div style={{fontSize:11,color:css.sub,textAlign:'right'}}>{p.balls>0?((p.R/(p.balls/6))).toFixed(2):'—'}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab==='balls'&&(
          <div style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`}}>
            <BallsViewScore innings={ci} css={css} isDark={isDark}/>
          </div>
        )}
        {tab==='commentary'&&(
          <div style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`}}>
            {comm.length===0&&<div style={{textAlign:'center',padding:20,color:css.sub,fontSize:13}}>No commentary yet.</div>}
            {comm.map((line,i)=>{const{bg,col}=ballColor(line.ball);return(
              <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:i<comm.length-1?`1px solid ${css.border}`:'none',alignItems:'flex-start'}}>
                <div style={{fontSize:9,color:css.sub,minWidth:28,fontWeight:700,paddingTop:3}}>{line.ref}</div>
                <div style={{width:24,height:24,borderRadius:'50%',flexShrink:0,background:bg,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700}}>{line.ball}</div>
                <div style={{flex:1,fontSize:12,lineHeight:1.5,color:line.type==='four'?C.success:line.type==='six'?C.yellow:line.type==='wicket'?C.danger:css.text,fontWeight:line.type==='four'||line.type==='six'||line.type==='wicket'?700:400}}>{line.msg}</div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}

function isUserInMatch(match,userId){
  if(!match||!userId)return false
  const t1Emails=match.team1PlayerEmails||[]
  const t2Emails=match.team2PlayerEmails||[]
  if(t1Emails.includes(userId)||t2Emails.includes(userId))return true
  const t1=match.team1Players||[]
  const t2=match.team2Players||[]
  return t1.includes(userId)||t2.includes(userId)
}

function getMatchScoreByTeam(match){
  const scoreByTeam={}
  ;(match.innings||[]).forEach(inn=>{
    if(!inn?.batting)return
    scoreByTeam[inn.batting]=inn.score||0
  })
  return scoreByTeam
}

function applyMatchResultToTournament(tournament,match){
  const scores=getMatchScoreByTeam(match)
  const t1=match.team1
  const t2=match.team2
  const s1=scores[t1]??0
  const s2=scores[t2]??0
  const isTie=s1===s2
  const winner=isTie?null:(s1>s2?t1:t2)
  const loser=isTie?null:(winner===t1?t2:t1)
  const pointsByTeam={}
  if(isTie){pointsByTeam[t1]=1;pointsByTeam[t2]=1}
  else{pointsByTeam[winner]=2;pointsByTeam[loser]=0}

  const updateRows=rows=>(rows||[]).map(r=>{
    if(r.team!==t1&&r.team!==t2)return r
    const isWin=!isTie&&r.team===winner
    const isLoss=!isTie&&r.team===loser
    const delta=(scores[r.team]||0)-(scores[r.team===t1?t2:t1]||0)
    const prevNrr=r.nrr==='—'?0:parseFloat(r.nrr)||0
    const nextNrr=prevNrr+(delta/10)
    return{
      ...r,
      p:(r.p||0)+1,
      w:(r.w||0)+(isWin?1:0),
      l:(r.l||0)+(isLoss?1:0),
      pts:(r.pts||0)+(pointsByTeam[r.team]||0),
      nrr:`${nextNrr>=0?'+':''}${nextNrr.toFixed(2)}`,
    }
  })

  const updatedGroups=(tournament.groups||[]).map(g=>({
    ...g,
    table:updateRows(g.table),
  }))

  const matchForHistory={
    id:match.id,
    team1:match.team1,
    team2:match.team2,
    format:match.format,
    status:'completed',
    created:match.created,
    innings:match.innings,
  }

  return{
    ...tournament,
    played:(tournament.played||0)+1,
    status:(tournament.status==='upcoming'?'ongoing':tournament.status),
    recentMatches:[matchForHistory,...(tournament.recentMatches||[])],
    table:updateRows(tournament.table),
    groups:updatedGroups,
  }
}

export default function ScorePage({css,isDark,matches,setMatches,showNewMatch,setShowNewMatch,activeScoring,setActiveScoring,teamsDB,tournaments,setTournaments,currentUser,authSession}){
  const MIN_PLAYERS_PER_TEAM=8
  const isAdmin=currentUser?.role==='admin'
  const[newForm,setNewForm]=useState({team1:'',team2:'',format:'T20',tournamentId:'',toss:'',bat:'',customOvers:'10',team1Players:[],team2Players:[],striker:'',nonStriker:'',firstBowler:''})
  const[viewMatch,setViewMatch]=useState(null)
  useEffect(()=>{if(showNewMatch)setActiveScoring(null)},[showNewMatch])
  const allTeams=Object.keys(teamsDB)
  const tossTeam=(newForm.toss===newForm.team1||newForm.toss===newForm.team2)?newForm.toss:''
  const bowlingFirstTeam=tossTeam?(newForm.bat==='Bat'?(tossTeam===newForm.team1?newForm.team2:newForm.team1):tossTeam):''
  const battingFirstTeam=tossTeam?(newForm.bat==='Bat'?tossTeam:(tossTeam===newForm.team1?newForm.team2:newForm.team1)):''
  const battingFirstPlayers=battingFirstTeam===newForm.team1?newForm.team1Players:(battingFirstTeam===newForm.team2?newForm.team2Players:[])
  const bowlingFirstPlayers=bowlingFirstTeam===newForm.team1?newForm.team1Players:(bowlingFirstTeam===newForm.team2?newForm.team2Players:[])
  const hasMinPlayers=newForm.team1Players.length>=MIN_PLAYERS_PER_TEAM&&newForm.team2Players.length>=MIN_PLAYERS_PER_TEAM
  const canStartMatch=!!(newForm.team1&&newForm.team2&&hasMinPlayers&&newForm.toss&&newForm.bat&&newForm.striker&&newForm.nonStriker&&newForm.firstBowler)
  const verifyCurrentUserPassword=()=>{
    if(!(authSession?.authenticated&&authSession?.name===currentUser?.email)){
      window.alert(`Please login as ${currentUser?.email||'your account'} using the Login button first.`)
      return false
    }
    return true
  }

  useEffect(()=>{
    const pending=(matches||[]).filter(m=>m.status==='completed'&&m.tournamentId&&!m.pointsPosted)
    const mine=pending.filter(m=>isAdmin||isUserInMatch(m,currentUser?.email))
    if(!mine.length)return
    setTournaments(prev=>prev.map(t=>{
      const relevant=mine.filter(m=>m.tournamentId===t.id)
      if(!relevant.length)return t
      return relevant.reduce((acc,m)=>applyMatchResultToTournament(acc,m),t)
    }))
    const doneIds=new Set(mine.map(m=>m.id))
    setMatches(prev=>prev.map(m=>doneIds.has(m.id)?{...m,pointsPosted:true}:m))
  },[matches,currentUser?.email,setMatches,setTournaments])

  const startMatch=()=>{
    if(!newForm.team1||!newForm.team2||!hasMinPlayers){
      window.alert(`Select at least ${MIN_PLAYERS_PER_TEAM} players for both teams before starting the match.`)
      return
    }
    if(!battingFirstTeam||!bowlingFirstTeam||!newForm.striker||!newForm.nonStriker||!newForm.firstBowler)return
    const fmt=FORMATS[newForm.format]
    const custOv=newForm.format==='CUSTOM'?(parseInt(newForm.customOvers)||10):null
    const maxOv=newForm.format==='HUNDRED'?null:(custOv||fmt.overs)
    const secondBatting=battingFirstTeam===newForm.team1?newForm.team2:newForm.team1
    const team1EmailMap=(teamsDB[newForm.team1]||[]).filter(p=>newForm.team1Players.includes(p.name)).map(p=>p.email).filter(Boolean)
    const team2EmailMap=(teamsDB[newForm.team2]||[]).filter(p=>newForm.team2Players.includes(p.name)).map(p=>p.email).filter(Boolean)
    const m={
      id:Date.now(),team1:newForm.team1,team2:newForm.team2,format:newForm.format,customOvers:custOv,status:'live',
      tournamentId:newForm.tournamentId?parseInt(newForm.tournamentId):null,
      pointsPosted:false,
      team1Players:newForm.team1Players,team2Players:newForm.team2Players,
      team1PlayerEmails:team1EmailMap,team2PlayerEmails:team2EmailMap,
      innings:[
        {batting:battingFirstTeam,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],snapshots:[],maxOvers:maxOv,striker:newForm.striker,nonStriker:newForm.nonStriker,bowler:newForm.firstBowler,outPlayers:[]},
        {batting:secondBatting,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],snapshots:[],maxOvers:maxOv,striker:'',nonStriker:'',bowler:'',outPlayers:[]}
      ],
      created:Date.now()
    }
    setMatches(p=>[...p,m]);setActiveScoring(m);setShowNewMatch(false)
  }
  if(activeScoring){
    const live=matches.find(m=>m.id===activeScoring.id)||activeScoring
    if(!currentUser?.email){
      window.alert('Please login to continue live scoring.')
      setActiveScoring(null)
      return null
    }
    return<LiveScorer match={live} setMatches={setMatches} css={css} isDark={isDark} onExit={()=>setActiveScoring(null)} currentUser={currentUser}/>
  }
  if(viewMatch){
    const m=matches.find(x=>x.id===viewMatch.id)||viewMatch
    return<MatchAnalysisView match={m} onBack={()=>setViewMatch(null)} css={css} isDark={isDark}/>
  }
  return(
    <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:14}}>
      {showNewMatch?(
        <div style={{background:css.card,borderRadius:16,padding:18,border:`1px solid ${C.yellow}44`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontWeight:800,fontSize:16,color:C.yellow}}>New Match</span>
            <button onClick={()=>setShowNewMatch(false)} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={18}/></button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {['team1','team2'].map((key,i)=>(
              <div key={key}>
                <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Team {i+1}</label>
                <input value={newForm[key]} onChange={e=>{const t=e.target.value;const upd={...newForm,[key]:t,[`${key}Players`]:[],striker:'',nonStriker:'',firstBowler:'',toss:'',bat:'',tournamentId:''};setNewForm(upd)}} placeholder={`Team ${i+1} name`} list={`tl-${key}`} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                <datalist id={`tl-${key}`}>{allTeams.map(t=><option key={t} value={t}/>)}</datalist>
                {newForm[key]&&teamsDB[newForm[key]]&&(
                  <div style={{marginTop:10}}>
                    <label style={{fontSize:11,color:css.sub,display:'block',marginBottom:6}}>Select Players from {newForm[key]}</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,maxHeight:120,overflowY:'auto'}}>
                      {teamsDB[newForm[key]].map(p=>(
                        <button key={p.id} onClick={()=>{const pList=newForm[`${key}Players`].includes(p.name)?newForm[`${key}Players`].filter(x=>x!==p.name):[...newForm[`${key}Players`],p.name];setNewForm(f=>({...f,[`${key}Players`]:pList}))}} style={{background:newForm[`${key}Players`].includes(p.name)?C.yellow:'transparent',border:`1px solid ${newForm[`${key}Players`].includes(p.name)?C.yellow:css.border}`,borderRadius:8,padding:'8px 6px',fontSize:10,fontWeight:600,cursor:'pointer',color:newForm[`${key}Players`].includes(p.name)?C.black:css.text,textAlign:'center',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</button>
                      ))}
                    </div>
                    <div style={{marginTop:6,fontSize:10,color:newForm[`${key}Players`].length>=MIN_PLAYERS_PER_TEAM?C.success:C.warn,fontWeight:700}}>
                      Selected: {newForm[`${key}Players`].length} / min {MIN_PLAYERS_PER_TEAM}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Tournament (optional)</label>
              <select value={newForm.tournamentId} onChange={e=>setNewForm(f=>({...f,tournamentId:e.target.value}))} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,boxSizing:'border-box',cursor:'pointer'}}>
                <option value="">No tournament (friendly match)</option>
                {tournaments.filter(t=>(t.teams||[]).includes(newForm.team1)&&(t.teams||[]).includes(newForm.team2)).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {newForm.team1&&newForm.team2&&tournaments.filter(t=>(t.teams||[]).includes(newForm.team1)&&(t.teams||[]).includes(newForm.team2)).length===0&&<div style={{fontSize:10,color:css.sub,marginTop:4,fontStyle:'italic'}}>No common tournaments found for these teams.</div>}
            </div>
            {hasMinPlayers&&battingFirstTeam&&bowlingFirstTeam&&(
              <>
                <div style={{background:`${C.info}11`,border:`1px solid ${C.info}33`,borderRadius:10,padding:12}}>
                  <div style={{fontSize:11,color:css.sub,marginBottom:8}}>1st Innings: <span style={{color:C.info,fontWeight:800}}>{battingFirstTeam}</span> batting, <span style={{color:C.info,fontWeight:800}}>{bowlingFirstTeam}</span> bowling</div>
                  <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:8}}>🏏 Striker ({battingFirstTeam})</label>
                  <select value={newForm.striker} onChange={e=>setNewForm(f=>({...f,striker:e.target.value,nonStriker:f.nonStriker===e.target.value?'':f.nonStriker}))} style={{width:'100%',background:css.bg,border:`1px solid ${C.info}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,boxSizing:'border-box',cursor:'pointer',marginBottom:8}}>
                    <option value="">Select striker</option>
                    {battingFirstPlayers.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:8}}>🏃 Non-Striker ({battingFirstTeam})</label>
                  <select value={newForm.nonStriker} onChange={e=>setNewForm(f=>({...f,nonStriker:e.target.value}))} style={{width:'100%',background:css.bg,border:`1px solid ${C.info}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,boxSizing:'border-box',cursor:'pointer',marginBottom:8}}>
                    <option value="">Select non-striker</option>
                    {battingFirstPlayers.filter(p=>p!==newForm.striker).map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:8}}>🎯 Opening Bowler ({bowlingFirstTeam})</label>
                  <select value={newForm.firstBowler} onChange={e=>setNewForm(f=>({...f,firstBowler:e.target.value}))} style={{width:'100%',background:css.bg,border:`1px solid ${C.info}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:css.text,boxSizing:'border-box',cursor:'pointer'}}>
                    <option value="">Select bowler</option>
                    {bowlingFirstPlayers.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Format</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {Object.keys(FORMATS).map(f=><button key={f} onClick={()=>setNewForm(fm=>({...fm,format:f}))} style={{background:newForm.format===f?C.yellow:css.bg,color:newForm.format===f?C.black:css.text,border:`1px solid ${newForm.format===f?C.yellow:css.border}`,borderRadius:8,padding:'8px 4px',fontSize:11,fontWeight:700,cursor:'pointer'}}>{FORMATS[f].name}</button>)}
              </div>
              {newForm.format==='CUSTOM'&&(
                <div style={{marginTop:10}}>
                  <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Overs per Innings <span style={{color:C.yellow}}>(1–50)</span></label>
                  <input type="number" min="1" max="50" value={newForm.customOvers} onChange={e=>setNewForm(f=>({...f,customOvers:String(Math.max(1,Math.min(50,parseInt(e.target.value)||1)))}))} style={{width:'100%',background:css.bg,border:`1px solid ${C.yellow}55`,borderRadius:8,padding:'10px 12px',fontSize:14,fontWeight:700,color:C.yellow,boxSizing:'border-box',outline:'none'}}/>
                </div>
              )}
              {newForm.format==='HUNDRED'&&(
                <div style={{marginTop:8,background:`${C.yellow}11`,border:`1px solid ${C.yellow}33`,borderRadius:8,padding:'8px 12px',fontSize:11,color:css.sub}}>💯 Each team faces exactly <span style={{color:C.yellow,fontWeight:800}}>100 balls</span>. Innings ends on 10 wickets or 100 balls.</div>
              )}
            </div>
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Toss Winner</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {[newForm.team1,newForm.team2].filter(Boolean).map(team=><button key={team} onClick={()=>setNewForm(f=>({...f,toss:team,bat:'',striker:'',nonStriker:'',firstBowler:''}))} style={{background:newForm.toss===team?C.yellow:css.bg,color:newForm.toss===team?C.black:css.text,border:`1px solid ${newForm.toss===team?C.yellow:css.border}`,borderRadius:8,padding:10,fontSize:12,fontWeight:700,cursor:'pointer'}}>{team}</button>)}
              </div>
            </div>
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Elected to</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {['Bat','Bowl'].map(opt=><button key={opt} onClick={()=>setNewForm(f=>({...f,bat:opt,striker:'',nonStriker:'',firstBowler:''}))} disabled={!newForm.toss} style={{background:newForm.bat===opt?C.yellow:css.bg,color:newForm.bat===opt?C.black:css.text,border:`1px solid ${newForm.bat===opt?C.yellow:css.border}`,borderRadius:8,padding:10,fontSize:13,fontWeight:600,cursor:!newForm.toss?'not-allowed':'pointer',opacity:!newForm.toss?0.6:1}}>{opt} First</button>)}
              </div>
            </div>
            <button onClick={startMatch} disabled={!canStartMatch} style={{background:!canStartMatch?`linear-gradient(135deg,#666,#444)`:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:800,color:!canStartMatch?'#999':C.black,cursor:!canStartMatch?'not-allowed':'pointer',marginTop:4,boxShadow:!canStartMatch?'none':`0 4px 16px ${C.yellow}44`}}>Start Match 🏏</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowNewMatch(true)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:12,padding:16,fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 16px ${C.yellow}44`}}><Plus size={18}/>Start New Match</button>
      )}
      <GSection title="ALL MATCHES" css={css}>
        {matches.length===0&&<div style={{textAlign:'center',padding:30,color:css.sub}}><div style={{fontSize:36,marginBottom:8}}>🏏</div><div style={{fontSize:13}}>No matches yet!</div></div>}
        {[...matches].reverse().map(m=><MatchCard key={m.id} match={m} css={css} isDark={isDark} onClick={()=>{if(m.status==='live'){if(!verifyCurrentUserPassword())return;setActiveScoring(m)}else{setViewMatch(m)}}}/>)}
      </GSection>
    </div>
  )
}
