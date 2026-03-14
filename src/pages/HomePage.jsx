import{Plus,Trophy}from'lucide-react'
import{C}from'../data/constants.js'
import{GSection,MatchCard,PAv}from'../components/Shared.jsx'
export default function HomePage({css,isDark,matches,setTab,setShowNewMatch,setActiveScoring,notices,leaderboards,allPlayers}){
  const live=matches.filter(m=>m.status==='live')
  return(
    <div className="page-pad">
      {/* Full-width hero */}
      <div style={{borderRadius:20,overflow:'hidden',position:'relative',background:`linear-gradient(135deg,${C.darkGray},${C.midGray})`,padding:'28px 32px',border:`1px solid ${C.yellow}33`,marginBottom:0}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:`${C.yellow}08`,pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-30,left:-30,width:150,height:150,borderRadius:'50%',background:`${C.yellow}06`,pointerEvents:'none'}}/>
        <div style={{fontSize:28,marginBottom:6}}>🏏</div>
        <div style={{fontSize:26,fontWeight:900,color:C.white,marginBottom:8,lineHeight:1.2}}>Ready to score<br/><span style={{color:C.yellow}}>today's match?</span></div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:20}}>{live.length>0?`${live.length} match live now 🔴`:'No live matches — start one below'}</div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button onClick={()=>{setActiveScoring(null);setTab('score');setShowNewMatch(true)}} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:'11px 22px',fontSize:14,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',gap:6,boxShadow:`0 4px 14px ${C.yellow}44`}}><Plus size={15}/>New Match</button>
          <button onClick={()=>setTab('league')} style={{background:`${C.yellow}15`,border:`1px solid ${C.yellow}44`,borderRadius:10,padding:'11px 22px',fontSize:14,fontWeight:700,color:C.yellow,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><Trophy size={15}/>League</button>
        </div>
      </div>
      {/* 2-col layout on desktop */}
      <div className="home-grid">
        {/* Left/Main column */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {live.length>0&&(<GSection title="🔴 LIVE NOW" css={css}>{live.map(m=><MatchCard key={m.id} match={m} css={css} isDark={isDark}/>)}</GSection>)}
          {live.length===0&&(
            <GSection title="📋 RECENT MATCHES" css={css} onMore={()=>setTab('score')}>
              {matches.length===0?(
                <div style={{textAlign:'center',padding:32,color:css.sub}}>
                  <div style={{fontSize:40,marginBottom:10}}>🏏</div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No matches yet</div>
                  <div style={{fontSize:12}}>Start a new match to see scores here</div>
                </div>
              ):matches.slice(0,4).map(m=><MatchCard key={m.id} match={m} css={css} isDark={isDark}/>)}
            </GSection>
          )}
          {live.length>0&&matches.length>live.length&&(
            <GSection title="📋 ALL MATCHES" css={css} onMore={()=>setTab('score')}>
              {matches.filter(m=>m.status!=='live').slice(0,3).map(m=><MatchCard key={m.id} match={m} css={css} isDark={isDark}/>)}
            </GSection>
          )}
        </div>
        {/* Right/Sidebar column */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[{label:'Matches',value:matches.length,icon:'🏏',color:C.yellow},{label:'Players',value:allPlayers.length,icon:'👥',color:C.info},{label:'Live',value:live.length,icon:'🔴',color:C.danger}].map(s=>(
              <div key={s.label} style={{background:css.card,borderRadius:14,padding:'16px 8px',border:`1px solid ${css.border}`,textAlign:'center'}}>
                <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:24,fontWeight:900,color:s.color}}>{s.value}</div>
                <div style={{fontSize:10,color:css.sub,marginTop:2,letterSpacing:0.5}}>{s.label}</div>
              </div>
            ))}
          </div>
          <GSection title="🏆 TOP BATTERS" css={css} onMore={()=>setTab('players')}>
            {leaderboards.orange.slice(0,5).map((p,i)=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<4?`1px solid ${css.border}`:'none'}}>
                <div style={{width:28,height:28,borderRadius:8,fontWeight:900,fontSize:13,background:i===0?`linear-gradient(135deg,${C.yellow},${C.yellowDark})`:i===1?'linear-gradient(135deg,#C0C0C0,#A0A0A0)':'linear-gradient(135deg,#CD7F32,#A05A20)',display:'flex',alignItems:'center',justifyContent:'center',color:C.black,flexShrink:0}}>{i+1}</div>
                <PAv name={p.name} photo={p.photo} size={34}/>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div><div style={{fontSize:11,color:css.sub}}>{p.team}·{p.matches}m</div></div>
                <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:18,fontWeight:900,color:C.yellow}}>{p.runs}</div><div style={{fontSize:9,color:css.sub}}>RUNS</div></div>
              </div>
            ))}
          </GSection>
          <GSection title="📌 NOTICES" css={css} onMore={()=>setTab('news')}>
            {notices.slice(0,3).map((n,i)=>(
              <div key={n.id} style={{padding:'10px 0',borderBottom:i<2?`1px solid ${css.border}`:'none',display:'flex',gap:10}}>
                {n.urgent&&<div style={{width:3,borderRadius:2,background:C.danger,flexShrink:0}}/>}
                <div><div style={{fontSize:12,fontWeight:600,marginBottom:2,lineHeight:1.4}}>{n.msg.slice(0,90)}{n.msg.length>90?'...':''}</div><div style={{fontSize:10,color:css.sub}}>{n.author}·{n.time}</div></div>
              </div>
            ))}
          </GSection>
        </div>
      </div>
    </div>
  )
}
