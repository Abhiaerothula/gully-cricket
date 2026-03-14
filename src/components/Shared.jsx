import{C}from'../data/constants.js'
export function PAv({name,size=36,photo}){
  const pal=[C.yellow,'#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#9b59b6','#FF9500','#22C55E']
  const idx=name?name.charCodeAt(0)%pal.length:0
  const init=name?name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'?'
  if(photo){
    return(
      <img
        src={photo}
        alt={name||'player'}
        style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:`2px solid ${C.yellow}33`}}
      />
    )
  }
  return(<div style={{width:size,height:size,borderRadius:'50%',flexShrink:0,background:`linear-gradient(135deg,${pal[idx]},${pal[(idx+3)%pal.length]})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.32,fontWeight:900,color:C.black}}>{init}</div>)
}
export function GSection({title,css,children,onMore}){
  return(
    <div style={{background:css.card,borderRadius:16,padding:'14px',border:`1px solid ${css.border}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{fontSize:10,fontWeight:800,letterSpacing:1.2,color:css.accent,textTransform:'uppercase'}}>{title}</span>
        {onMore&&<button onClick={onMore} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:css.accent,fontWeight:700,padding:0}}>See all →</button>}
      </div>
      {children}
    </div>
  )
}
function getMatchSummary(match){
  const i0=match.innings?.[0],i1=match.innings?.[1]
  if(match.status!=='completed'||!i0||!i1)return null
  let result='',winner=''
  if(i1.score>i0.score){const d=10-i1.wickets;result=`${i1.batting} won by ${d} wkt${d!==1?'s':''}`;winner=i1.batting}
  else if(i0.score>i1.score){const d=i0.score-i1.score;result=`${i0.batting} won by ${d} run${d!==1?'s':''}`;winner=i0.batting}
  else{result='Match Tied'}
  const getTopBatter=(inn)=>{
    const log=inn.ballLog||[],snaps=inn.snapshots||[],b={}
    log.forEach((ball,i)=>{const s=snaps[i]||{};if(!s.striker)return;if(!b[s.striker])b[s.striker]={R:0,B:0};const isW=ball.startsWith('Wd');const isNB=ball.startsWith('NB');if(!isW){let r=0;if(isNB){const p=ball.indexOf('+');r=p>=0?parseInt(ball.slice(p+1))||0:0}else if(ball.startsWith('FH')){r=parseInt(ball.slice(3))||0}else if(!ball.startsWith('B')&&!ball.startsWith('LB')&&!ball.startsWith('W')){r=parseInt(ball)||0}else if(ball.startsWith('W')&&ball.includes('+')){r=parseInt(ball.split('+')[1])||0}b[s.striker].R+=r;b[s.striker].B++}})
    let top=null;Object.entries(b).forEach(([n,v])=>{if(!top||v.R>top.R)top={name:n,...v}});return top
  }
  const getTopBowler=(inn)=>{
    const log=inn.ballLog||[],snaps=inn.snapshots||[],b={}
    log.forEach((ball,i)=>{const s=snaps[i]||{};if(!s.bowler)return;if(!b[s.bowler])b[s.bowler]={W:0,R:0,balls:0};const isW=ball.startsWith('Wd'),isNB=ball.startsWith('NB'),legal=!isW&&!isNB;const isWk=!isW&&(ball==='W'||ball.startsWith('W+'));if(isWk)b[s.bowler].W++;if(legal)b[s.bowler].balls++})
    let top=null;Object.entries(b).forEach(([n,v])=>{if(!top||v.W>top.W||(v.W===top.W&&v.R<(top.R||999)))top={name:n,...v}});return top
  }
  const bat0=getTopBatter(i0),bat1=getTopBatter(i1)
  const topBat=(!bat0&&!bat1)?null:(!bat1||(bat0?.R||0)>=(bat1?.R||0))?bat0:bat1
  const bow0=getTopBowler(i0),bow1=getTopBowler(i1)
  const topBow=(!bow0&&!bow1)?null:(!bow1||(bow0?.W||0)>=(bow1?.W||0))?bow0:bow1
  return{result,winner,topBat,topBow,potm:match.potm||null}
}
export function MatchCard({match,css,isDark,onClick,onDelete}){
  const i0=match.innings?.[0],i1=match.innings?.[1]
  const summary=getMatchSummary(match)
  return(
    <div onClick={onClick} style={{background:isDark?C.midGray:C.white,borderRadius:12,padding:12,marginBottom:8,border:`1px solid ${match.status==='live'?C.yellow+'55':css.border}`,cursor:onClick?'pointer':'default',position:'relative',boxShadow:isDark?'none':'0 1px 3px rgba(0,0,0,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:match.status==='live'?C.yellow:css.sub,background:match.status==='live'?`${C.yellow}22`:css.border,padding:'2px 6px',borderRadius:4}}>
          {match.status==='live'?'● LIVE':match.status.toUpperCase()} · {match.format}
        </span>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:10,color:css.sub}}>{new Date(match.created).toLocaleDateString()}</span>
          {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(match.id)}} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'3px 5px',cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}} title="Delete match"><span style={{fontSize:12}}>🗑️</span></button>}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,fontWeight:700}}>{match.team1}</div>
          <div style={{fontSize:11,color:css.sub}}>{i0?`${i0.score}/${i0.wickets} (${i0.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
        <div style={{fontSize:11,color:css.sub,fontWeight:600}}>vs</div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,fontWeight:700}}>{match.team2}</div>
          <div style={{fontSize:11,color:css.sub}}>{i1&&(i1.score>0||i1.balls>0)?`${i1.score}/${i1.wickets} (${i1.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
      </div>
      {summary&&(
        <div style={{marginTop:8,borderTop:`1px solid ${css.border}`,paddingTop:8}}>
          <div style={{fontSize:11,fontWeight:700,color:css.accent,marginBottom:4}}>🏆 {summary.result}</div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:10,color:css.sub}}>
            {summary.topBat&&<span>⭐ {summary.topBat.name}: {summary.topBat.R}({summary.topBat.B})</span>}
            {summary.topBow&&summary.topBow.W>0&&<span>🎯 {summary.topBow.name}: {summary.topBow.W}W</span>}
            {summary.potm&&<span style={{color:css.accent,fontWeight:700}}>🏅 POTM: {summary.potm}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
export function GIn({label,value,onChange,css,ph=''}){
  return(
    <div>
      <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={ph||label}
        style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,color:css.text,boxSizing:'border-box',outline:'none'}}/>
    </div>
  )
}
