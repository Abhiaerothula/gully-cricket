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
        <span style={{fontSize:10,fontWeight:800,letterSpacing:1.2,color:C.yellow,textTransform:'uppercase'}}>{title}</span>
        {onMore&&<button onClick={onMore} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:C.yellow,fontWeight:700,padding:0}}>See all →</button>}
      </div>
      {children}
    </div>
  )
}
export function MatchCard({match,css,isDark,onClick}){
  const i0=match.innings?.[0],i1=match.innings?.[1]
  return(
    <div onClick={onClick} style={{background:isDark?C.midGray:'#f8f8f8',borderRadius:12,padding:12,marginBottom:8,border:`1px solid ${match.status==='live'?C.yellow+'55':css.border}`,cursor:onClick?'pointer':'default'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:match.status==='live'?C.yellow:css.sub,background:match.status==='live'?`${C.yellow}22`:css.border,padding:'2px 6px',borderRadius:4}}>
          {match.status==='live'?'● LIVE':match.status.toUpperCase()} · {match.format}
        </span>
        <span style={{fontSize:10,color:css.sub}}>{new Date(match.created).toLocaleDateString()}</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,fontWeight:700}}>{match.team1}</div>
          <div style={{fontSize:11,color:css.sub}}>{i0?`${i0.score}/${i0.wickets} (${i0.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
        <div style={{fontSize:11,color:css.sub,fontWeight:600}}>vs</div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,fontWeight:700}}>{match.team2}</div>
          <div style={{fontSize:11,color:css.sub}}>{i1&&i1.score>0?`${i1.score}/${i1.wickets} (${i1.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
      </div>
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
