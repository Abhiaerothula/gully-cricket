import{useState,useEffect,useCallback,useMemo}from'react'
import{Plus,X,ChevronDown,RotateCcw,Share2}from'lucide-react'
import{C,FORMATS,WICKET_TYPES,EXTRAS_TYPES}from'../data/constants.js'
import{GSection,MatchCard,GIn,BallDot,Modal,Empty}from'../components/Shared.jsx'
import{groupIntoOvers,overRuns,matchResult}from'../utils/ballUtils.js'

function OversPanel({innings,css}){
  const[open,setOpen]=useState(false)
  const overs=useMemo(()=>groupIntoOvers(innings?.ballLog||[]),[innings?.ballLog])
  if(!overs.length)return null
  return(
    <div style={{background:css.card,borderRadius:12,border:`1px solid ${css.border}`}}>
      <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',background:'none',border:'none',padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',color:css.text}}>
        <span style={{fontSize:11,fontWeight:700,color:C.yellow}}>📋 Over-by-over</span>
        <span style={{fontSize:11,color:css.sub}}>{open?'▲ Hide':'▼ Show'}</span>
      </button>
      {open&&(
        <div style={{padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:8}}>
          {overs.map((over,oi)=>(
            <div key={oi} style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:36,fontSize:10,color:css.sub,fontWeight:700,flexShrink:0}}>Ov {oi+1}</div>
              <div style={{display:'flex',gap:3,flex:1,flexWrap:'wrap'}}>{over.map(({b,i})=><BallDot key={i} b={b} size={22}/>)}</div>
              <div style={{fontSize:12,fontWeight:800,color:C.yellow,width:24,textAlign:'right'}}>{overRuns(over)}</div>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${css.border}`,paddingTop:8,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:css.sub}}>Total</span>
            <span style={{fontSize:13,fontWeight:900,color:C.yellow}}>{innings.score}/{innings.wickets} ({innings.oversDisplay})</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MatchSummary({match,css,onShare}){
  const result=matchResult(match)
  const i0=match.innings[0],i1=match.innings[1]
  const s0=i0?.ballLog||[],s1=i1?.ballLog||[]
  return(
    <div style={{background:css.summaryBg,borderRadius:16,padding:16,border:`2px solid ${C.yellow}44`,marginBottom:4}}>
      <div style={{textAlign:'center',marginBottom:14}}>
        <div style={{fontSize:28,marginBottom:4}}>🏆</div>
        <div style={{fontSize:16,fontWeight:900,color:C.yellow}}>{result||'Match Over'}</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:2}}>{match.format}·{new Date(match.created).toLocaleDateString()}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[i0,i1].map((inn,idx)=>inn&&(
          <div key={idx} style={{background:css.summaryCard,borderRadius:10,padding:10,textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:4,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{inn.batting}</div>
            <div style={{fontSize:24,fontWeight:900,color:C.yellow}}>{inn.score}/{inn.wickets}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{inn.oversDisplay} ov</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:4}}>{(idx===0?s0:s1).filter(b=>b==='4').length}×4 {(idx===0?s0:s1).filter(b=>b==='6').length}×6</div>
          </div>
        ))}
      </div>
      <button onClick={onShare} style={{width:'100%',background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:10,padding:10,fontSize:12,fontWeight:700,color:C.yellow,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <Share2 size={13}/>Share on WhatsApp
      </button>
    </div>
  )
}

function POTMSelector({match,teamsDB,css,onSelect}){
  const players=[...(teamsDB[match.team1]||[]),...(teamsDB[match.team2]||[])]
  if(!players.length)return null
  return(
    <div style={{background:css.card,borderRadius:12,padding:12,border:`1px solid ${C.yellow}44`}}>
      <div style={{fontSize:12,fontWeight:800,color:C.yellow,marginBottom:10}}>🏅 Player of the Match</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {players.map(p=>(
          <button key={p.id} onClick={()=>onSelect(p)} style={{background:`${C.yellow}20`,border:`1px solid ${C.yellow}55`,borderRadius:20,padding:'5px 10px',fontSize:11,fontWeight:600,color:css.text,cursor:'pointer'}}>{p.name}</button>
        ))}
      </div>
    </div>
  )
}

function LiveScorer({match,setMatches,css,isDark,teamsDB,onExit}){
  const[inn,setInn]=useState(0)
  const[showWicket,setShowWicket]=useState(false)
  const[showExtras,setShowExtras]=useState(false)
  const[wicketType,setWicketType]=useState('')
  const[potm,setPotm]=useState(match.potm||null)
  const ci=match.innings[inn]
  const fmt=FORMATS[match.format]
  const ballLog=ci.ballLog||[]
  const isFreeHit=ballLog.length>0&&ballLog[ballLog.length-1]?.startsWith('NB')
  const canUndo=ballLog.length>0

  const addBall=useCallback((runs,isWicket=false,extras=null)=>{
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings];const c={...innings[inn]}
      const balls=[...(c.ballLog||[])];const snaps=[...(c.snapshots||[])]
      snaps.push({score:c.score,wickets:c.wickets,balls:c.balls,overs:c.overs,extras:c.extras||0,oversDisplay:c.oversDisplay})
      let legal=true,log=''
      if(extras==='No Ball'){log=`NB${runs>0?'+'+runs:''}`;legal=false}
      else if(extras==='Wide'){log=`Wd${runs>0?'+'+runs:''}`;legal=false}
      else if(extras==='Bye'){log=`B${runs>0?'+'+runs:''}`}
      else if(extras==='Leg Bye'){log=`LB${runs>0?'+'+runs:''}`}
      else if(isWicket){const fh=balls.length>0&&balls[balls.length-1]?.startsWith('NB');if(fh){log=`FH-${runs}`}else{log=`W${runs>0?'+'+runs:''}`;c.wickets=Math.min(c.wickets+1,10)}}
      else{log=`${runs}`}
      c.score+=runs+(extras?1:0)
      if(extras)c.extras=(c.extras||0)+1+runs
      if(legal){c.balls=(c.balls||0)+1;c.overs=Math.floor(c.balls/6);c.oversDisplay=`${c.overs}.${c.balls%6}`}
      balls.push(log);c.ballLog=balls;c.snapshots=snaps;innings[inn]=c
      let status=m.status
      if(c.wickets>=10)status=inn===0?'break':'completed'
      if(fmt.overs&&legal&&c.balls>0&&c.balls%(fmt.overs*6)===0)status=inn===0?'break':'completed'
      return{...m,innings,status}
    }))
  },[match.id,inn,setMatches,fmt])

  const undoLast=useCallback(()=>{
    setMatches(prev=>prev.map(m=>{
      if(m.id!==match.id)return m
      const innings=[...m.innings];const c={...innings[inn]}
      const balls=[...(c.ballLog||[])],snaps=[...(c.snapshots||[])]
      if(!balls.length)return m
      balls.pop();const sn=snaps.pop()
      if(sn){c.score=sn.score;c.wickets=sn.wickets;c.balls=sn.balls;c.overs=sn.overs;c.extras=sn.extras;c.oversDisplay=sn.oversDisplay}
      c.ballLog=balls;c.snapshots=snaps;innings[inn]=c
      return{...m,innings,status:'live'}
    }))
  },[match.id,inn,setMatches])

  const savePOTM=useCallback((player)=>{setPotm(player);setMatches(prev=>prev.map(m=>m.id===match.id?{...m,potm:player}:m))},[match.id,setMatches])
  const shareMatch=useCallback(()=>{
    const i0=match.innings[0],i1=match.innings[1];const result=matchResult(match)
    const lines=[`🏏 GullyCricket Scorecard`,`${match.team1} vs ${match.team2} | ${match.format}`,``,`${match.team1}: ${i0?.score}/${i0?.wickets} (${i0?.oversDisplay||'0.0'} ov)`,i1?.score>0?`${match.team2}: ${i1.score}/${i1.wickets} (${i1.oversDisplay||'0.0'} ov)`:'',result?`Result: ${result}`:'',match.potm?`POTM: ${match.potm.name} ⭐`:'','',`Scored with GullyCricket 🏏`].filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`,'_blank')
  },[match])

  const target=inn===1?(match.innings[0].score+1):null
  const chasing=target&&ci.score>=target
  const crr=ci.balls>0?((ci.score/ci.balls)*6).toFixed(2):'0.00'
  const bLeft=fmt.overs?(fmt.overs*6-ci.balls):null
  const rrr=(target&&inn===1&&bLeft>0)?(((target-ci.score)/bLeft)*6).toFixed(2):null
  const thisOver=useMemo(()=>groupIntoOvers(ballLog).slice(-1)[0]||[],[ballLog])
  const isCompleted=match.status==='completed'

  return(
    <div style={{paddingBottom:12}}>
      {/* Scorer header — always dark for visibility */}
      <div style={{background:css.scorerBg,padding:'14px 16px',borderBottom:`2px solid ${C.yellow}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <button onClick={onExit} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:8,cursor:'pointer',color:C.yellow,display:'flex',alignItems:'center'}}><ChevronDown size={16}/></button>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:1}}>{match.format}·{match.status.toUpperCase()}</div>
            {isFreeHit&&<div style={{fontSize:11,fontWeight:900,color:C.yellow}}>⚡ FREE HIT</div>}
          </div>
          <div style={{display:'flex',gap:6}}>
            <button onClick={shareMatch} style={{background:`${C.success}22`,border:`1px solid ${C.success}44`,borderRadius:8,padding:'6px 8px',cursor:'pointer',color:C.success,display:'flex',alignItems:'center'}}><Share2 size={13}/></button>
            <button onClick={undoLast} disabled={!canUndo} style={{background:canUndo?`${C.danger}33`:'rgba(255,255,255,0.05)',border:`1px solid ${canUndo?C.danger+'55':'rgba(255,255,255,0.15)'}`,borderRadius:8,padding:'6px 10px',cursor:canUndo?'pointer':'default',color:canUndo?C.danger:'rgba(255,255,255,0.3)',display:'flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700}}>
              <RotateCcw size={12}/>Undo
            </button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:2}}>{match.team1}</div>
            <div style={{fontSize:30,fontWeight:900,color:inn===0?C.yellow:'rgba(255,255,255,0.9)',lineHeight:1}}>{inn===0?`${ci.score}/${ci.wickets}`:`${match.innings[0].score}/${match.innings[0].wickets}`}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{inn===0?ci.oversDisplay||'0.0':match.innings[0].oversDisplay||'0.0'} ov</div>
          </div>
          <div style={{width:32,height:32,borderRadius:'50%',background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:C.yellow}}>VS</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:2}}>{match.team2}</div>
            <div style={{fontSize:30,fontWeight:900,color:inn===1?C.yellow:'rgba(255,255,255,0.35)',lineHeight:1}}>{inn===1?`${ci.score}/${ci.wickets}`:(match.innings[1]?.score>0?`${match.innings[1].score}/${match.innings[1].wickets}`:'—')}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{inn===1?ci.oversDisplay||'0.0':'—'} ov</div>
          </div>
        </div>
        {target&&!chasing&&<div style={{marginTop:10,background:'rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 12px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:'rgba(255,255,255,0.9)'}}>Need {target-ci.score} off {bLeft} balls</span><span style={{fontSize:11,color:C.yellow,fontWeight:700}}>RRR:{rrr}</span></div>}
        {chasing&&<div style={{marginTop:10,textAlign:'center',color:C.yellow,fontWeight:900,fontSize:15}}>🎉 {match.team2} wins!</div>}
        {match.potm&&<div style={{marginTop:8,background:`${C.yellow}22`,borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:700,color:C.yellow,textAlign:'center'}}>🏅 POTM: {match.potm.name}</div>}
      </div>

      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
        {isCompleted&&<MatchSummary match={match} css={css} onShare={shareMatch}/>}
        {isCompleted&&!match.potm&&<POTMSelector match={match} teamsDB={teamsDB} css={css} onSelect={savePOTM}/>}
        {isFreeHit&&!isCompleted&&<div style={{background:`${C.yellow}18`,border:`2px solid ${C.yellow}`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:24}}>⚡</span><div><div style={{fontSize:14,fontWeight:900,color:C.yellow}}>FREE HIT!</div><div style={{fontSize:11,color:css.sub}}>No dismissal except Run Out</div></div></div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[{label:'CRR',value:crr},{label:'Extras',value:ci.extras||0},{label:fmt.overs?'Balls Left':'Balls',value:bLeft??ci.balls}].map(s=>(
            <div key={s.label} style={{background:css.card,borderRadius:10,padding:'10px 8px',border:`1px solid ${css.border}`,textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:C.yellow}}>{s.value}</div>
              <div style={{fontSize:9,color:css.sub,marginTop:2,letterSpacing:0.5}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:css.card,borderRadius:12,padding:12,border:`1px solid ${css.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:10,color:css.sub,letterSpacing:1,fontWeight:600}}>THIS OVER</span>
            {canUndo&&<button onClick={undoLast} style={{background:`${C.danger}18`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'3px 8px',cursor:'pointer',color:C.danger,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',gap:4}}><RotateCcw size={10}/>Undo</button>}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',minHeight:30}}>
            {thisOver.map(({b,i})=><BallDot key={i} b={b} size={32}/>)}
            {!thisOver.length&&<span style={{fontSize:12,color:css.sub}}>Start of over</span>}
          </div>
        </div>
        <OversPanel innings={ci} css={css}/>
        {!isCompleted&&<>
          <div style={{background:css.card,borderRadius:12,padding:12,border:`2px solid ${isFreeHit?C.yellow:css.border}`}}>
            <div style={{fontSize:10,color:isFreeHit?C.yellow:css.sub,marginBottom:10,letterSpacing:1,fontWeight:isFreeHit?800:600}}>{isFreeHit?'⚡ FREE HIT — RUNS':'RUNS'}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
              {[0,1,2,3].map(r=><button key={r} onClick={()=>addBall(r)} style={{background:css.card2,border:`1px solid ${css.border}`,borderRadius:10,padding:14,fontSize:18,fontWeight:700,cursor:'pointer',color:css.text}}>{r}</button>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={()=>addBall(4)} style={{background:`linear-gradient(135deg,${C.success},#16a34a)`,border:'none',borderRadius:10,padding:16,fontSize:22,fontWeight:900,cursor:'pointer',color:'#fff'}}>4 ●</button>
              <button onClick={()=>addBall(6)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:16,fontSize:22,fontWeight:900,cursor:'pointer',color:C.black,boxShadow:`0 4px 12px ${C.yellow}44`}}>6 ★</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <button onClick={()=>{if(!isFreeHit)setShowWicket(true)}} style={{background:isFreeHit?css.card2:`linear-gradient(135deg,${C.danger},#cc0000)`,border:`1px solid ${isFreeHit?css.border:C.danger}`,borderRadius:10,padding:14,fontSize:13,fontWeight:800,color:isFreeHit?css.sub:'#fff',cursor:isFreeHit?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,position:'relative'}}>
              🎯 WICKET
              {isFreeHit&&<span style={{position:'absolute',top:3,right:4,fontSize:8,background:`${C.yellow}33`,color:C.yellow,borderRadius:3,padding:'1px 4px',fontWeight:700}}>BLOCKED</span>}
            </button>
            <button onClick={()=>setShowExtras(true)} style={{background:`linear-gradient(135deg,${C.warn},#e67e00)`,border:'none',borderRadius:10,padding:14,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>⚡ EXTRAS</button>
          </div>
          {inn===0&&fmt.overs&&ci.overs>=fmt.overs&&<button onClick={()=>setInn(1)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',boxShadow:`0 4px 16px ${C.yellow}44`}}>Start 2nd Innings →</button>}
        </>}
      </div>
      {showWicket&&<Modal onClose={()=>setShowWicket(false)}><div style={{background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.yellow}`,borderBottom:'none'}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:C.yellow}}>🎯 Wicket Type</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>{WICKET_TYPES.map(t=><button key={t} onClick={()=>setWicketType(t)} style={{background:wicketType===t?C.danger:css.card2,color:wicketType===t?'#fff':css.text,border:`1px solid ${wicketType===t?C.danger:css.border}`,borderRadius:8,padding:'10px 8px',fontSize:12,fontWeight:600,cursor:'pointer'}}>{t}</button>)}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button onClick={()=>setShowWicket(false)} style={{background:css.card2,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
          <button onClick={()=>{addBall(0,true,null);setShowWicket(false);setWicketType('')}} style={{background:`linear-gradient(135deg,${C.danger},#cc0000)`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer'}}>Confirm W</button>
        </div>
      </div></Modal>}
      {showExtras&&<Modal onClose={()=>setShowExtras(false)}><div style={{background:css.card,borderRadius:'20px 20px 0 0',padding:20,border:`2px solid ${C.yellow}`,borderBottom:'none'}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:4,color:C.yellow}}>⚡ Extras</div>
        <div style={{fontSize:11,color:css.sub,marginBottom:14}}>No Ball triggers a Free Hit next delivery</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:12}}>{EXTRAS_TYPES.map(t=><button key={t} onClick={()=>{addBall(0,false,t);setShowExtras(false)}} style={{background:t==='No Ball'?`${C.yellow}20`:css.card2,border:`1px solid ${t==='No Ball'?C.yellow:css.border}`,borderRadius:10,padding:14,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>{t==='No Ball'?'⚡ No Ball → FH':t}</button>)}</div>
        <button onClick={()=>setShowExtras(false)} style={{width:'100%',background:css.card2,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
      </div></Modal>}
    </div>
  )
}

export default function ScorePage({css,isDark,matches,setMatches,showNewMatch,setShowNewMatch,activeScoring,setActiveScoring,teamsDB}){
  const[newForm,setNewForm]=useState({team1:'',team2:'',format:'T20',toss:'',bat:'',customOvers:''})
  const[search,setSearch]=useState('')
  useEffect(()=>{if(showNewMatch)setActiveScoring(null)},[showNewMatch,setActiveScoring])
  const allTeams=Object.keys(teamsDB)
  const startMatch=()=>{
    if(!newForm.team1||!newForm.team2)return
    const baseOvers=FORMATS[newForm.format].overs
    const overs=newForm.customOvers?parseInt(newForm.customOvers)||baseOvers:baseOvers
    const m={id:Date.now(),team1:newForm.team1,team2:newForm.team2,format:newForm.format,status:'live',created:Date.now(),innings:[{batting:newForm.bat||newForm.team1,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],snapshots:[],maxOvers:overs},{batting:newForm.bat===newForm.team1?newForm.team2:newForm.team1,score:0,wickets:0,overs:0,balls:0,extras:0,ballLog:[],snapshots:[],maxOvers:overs}]}
    setMatches(p=>[...p,m]);setActiveScoring(m);setShowNewMatch(false)
    setNewForm({team1:'',team2:'',format:'T20',toss:'',bat:'',customOvers:''})
  }
  const deleteMatch=useCallback((id)=>setMatches(prev=>prev.filter(m=>m.id!==id)),[setMatches])
  const filteredMatches=useMemo(()=>{const q=search.toLowerCase();return[...matches].reverse().filter(m=>!q||m.team1.toLowerCase().includes(q)||m.team2.toLowerCase().includes(q)||m.format.toLowerCase().includes(q))},[matches,search])
  if(activeScoring){const live=matches.find(m=>m.id===activeScoring.id)||activeScoring;return<LiveScorer match={live} setMatches={setMatches} css={css} isDark={isDark} teamsDB={teamsDB} onExit={()=>setActiveScoring(null)}/>}
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
                <input value={newForm[key]} onChange={e=>setNewForm(f=>({...f,[key]:e.target.value}))} placeholder={`Team ${i+1} name`} list={`tl-${key}`} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,color:css.text,boxSizing:'border-box',outline:'none'}}/>
                <datalist id={`tl-${key}`}>{allTeams.map(t=><option key={t} value={t}/>)}</datalist>
              </div>
            ))}
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Format</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {Object.keys(FORMATS).map(f=><button key={f} onClick={()=>setNewForm(fm=>({...fm,format:f}))} style={{background:newForm.format===f?C.yellow:css.card2,color:newForm.format===f?C.black:css.text,border:`1px solid ${newForm.format===f?C.yellow:css.border}`,borderRadius:8,padding:'8px 4px',fontSize:12,fontWeight:700,cursor:'pointer'}}>{f}</button>)}
              </div>
            </div>
            <GIn label="Custom Overs (optional)" value={newForm.customOvers} onChange={v=>setNewForm(f=>({...f,customOvers:v}))} css={css} ph={`Default: ${FORMATS[newForm.format].overs||'Unlimited'}`} type="number"/>
            <GIn label="Toss Winner" value={newForm.toss} onChange={v=>setNewForm(f=>({...f,toss:v}))} css={css} ph="Team name"/>
            <div>
              <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Elected to</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {['Bat','Bowl'].map(opt=><button key={opt} onClick={()=>setNewForm(f=>({...f,bat:opt==='Bat'?f.toss:(f.toss===f.team1?f.team2:f.team1)}))} style={{background:(newForm.bat&&opt==='Bat')?C.yellow:css.card2,color:(newForm.bat&&opt==='Bat')?C.black:css.text,border:`1px solid ${css.border}`,borderRadius:8,padding:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>{opt} First</button>)}
              </div>
            </div>
            <button onClick={startMatch} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',marginTop:4,boxShadow:`0 4px 16px ${C.yellow}44`}}>Start Match 🏏</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowNewMatch(true)} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:12,padding:16,fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 16px ${C.yellow}44`}}><Plus size={18}/>Start New Match</button>
      )}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search matches by team or format..." style={{width:'100%',background:css.card,border:`1px solid ${css.border}`,borderRadius:10,padding:'10px 14px',fontSize:13,color:css.text,boxSizing:'border-box',outline:'none'}}/>
      <GSection title={`ALL MATCHES (${matches.length})`} css={css}>
        {matches.length===0&&<Empty icon="🏏" text="No matches yet. Start one above!"/>}
        {filteredMatches.length===0&&matches.length>0&&<Empty icon="🔍" text={`No matches for "${search}"`}/>}
        {filteredMatches.map(m=><MatchCard key={m.id} match={m} css={css} isDark={isDark} onClick={()=>{if(m.status==='live'||m.status==='completed')setActiveScoring(m)}} onDelete={deleteMatch}/>)}
      </GSection>
    </div>
  )
}
