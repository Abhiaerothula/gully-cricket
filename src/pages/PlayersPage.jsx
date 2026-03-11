import{useState}from'react'
import{Plus,X,UserPlus,Trash2,Edit3,Database,CheckCircle,Lock,Unlock}from'lucide-react'
import{BarChart,Bar,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer}from'recharts'
import{C,ROLES,COLORS_BAR}from'../data/constants.js'
import{GSection,PAv,GIn}from'../components/Shared.jsx'
export default function PlayersPage({css,isDark,teamsDB,setTeamsDB,premium,setPremium}){
  const[selTeam,setSelTeam]=useState(Object.keys(teamsDB)[0]||'')
  const[showAdd,setShowAdd]=useState(false)
  const[showAddT,setShowAddT]=useState(false)
  const[newTName,setNewTName]=useState('')
  const[editP,setEditP]=useState(null)
  const[pForm,setPForm]=useState({name:'',role:'Batsman',runs:'0',wickets:'0',catches:'0',matches:'0',balls:'0',fours:'0',sixes:'0'})
  const[showPrem,setShowPrem]=useState(false)
  const teams=Object.keys(teamsDB)
  const teamPls=selTeam?(teamsDB[selTeam]||[]):[]
  const roleColor=r=>r==='Batsman'?C.yellow:r==='Bowler'?C.danger:r==='All-Rounder'?C.success:'#9b59b6'
  const resetForm=()=>setPForm({name:'',role:'Batsman',runs:'0',wickets:'0',catches:'0',matches:'0',balls:'0',fours:'0',sixes:'0'})
  const savePlayer=()=>{
    if(!pForm.name.trim())return
    const p={id:editP?editP.id:Date.now(),name:pForm.name,team:selTeam,role:pForm.role,runs:+pForm.runs||0,wickets:+pForm.wickets||0,catches:+pForm.catches||0,matches:+pForm.matches||0,balls:+pForm.balls||0,fours:+pForm.fours||0,sixes:+pForm.sixes||0,innings:+pForm.matches||0}
    setTeamsDB(prev=>({...prev,[selTeam]:editP?(prev[selTeam]||[]).map(x=>x.id===editP.id?p:x):[...(prev[selTeam]||[]),p]}))
    setShowAdd(false);setEditP(null);resetForm()
  }
  const delPlayer=pid=>setTeamsDB(prev=>({...prev,[selTeam]:(prev[selTeam]||[]).filter(p=>p.id!==pid)}))
  const openEdit=p=>{setEditP(p);setPForm({name:p.name,role:p.role||'Batsman',runs:''+p.runs,wickets:''+p.wickets,catches:''+p.catches,matches:''+p.matches,balls:''+p.balls,fours:''+p.fours,sixes:''+p.sixes});setShowAdd(true)}
  const addTeam=()=>{if(!newTName.trim())return;setTeamsDB(prev=>({...prev,[newTName.trim()]:[]}));setSelTeam(newTName.trim());setNewTName('');setShowAddT(false)}
  return(
    <div className="page-pad" style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontWeight:900,fontSize:18,display:'flex',alignItems:'center',gap:8}}><Database size={18} color={C.yellow}/>Players DB</div><div style={{fontSize:12,color:css.sub}}>{Object.values(teamsDB).flat().length} players across {teams.length} teams</div></div>
        <button onClick={()=>setShowAddT(true)} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'7px 12px',fontSize:11,fontWeight:700,color:C.yellow,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><Plus size={12}/>Team</button>
      </div>
      {showAddT&&(<div style={{background:css.card,borderRadius:12,padding:14,border:`1px solid ${C.yellow}44`}}>
        <div style={{fontSize:12,color:C.yellow,fontWeight:700,marginBottom:8}}>New Team</div>
        <div style={{display:'flex',gap:8}}>
          <input value={newTName} onChange={e=>setNewTName(e.target.value)} placeholder="Team name" style={{flex:1,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 12px',fontSize:13,color:css.text,outline:'none'}}/>
          <button onClick={addTeam} style={{background:C.yellow,border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:800,color:C.black,cursor:'pointer'}}>Add</button>
          <button onClick={()=>setShowAddT(false)} style={{background:'none',border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',cursor:'pointer',color:css.sub}}><X size={14}/></button>
        </div>
      </div>)}
      <div style={{overflowX:'auto',display:'flex',gap:8,paddingBottom:4}}>
        {teams.map(t=><button key={t} onClick={()=>setSelTeam(t)} style={{background:selTeam===t?C.yellow:css.card,color:selTeam===t?C.black:css.text,border:`1px solid ${selTeam===t?C.yellow:css.border}`,borderRadius:20,padding:'7px 14px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t}<span style={{fontSize:10,opacity:0.7}}>({(teamsDB[t]||[]).length})</span></button>)}
      </div>
      {selTeam&&(<button onClick={()=>{setEditP(null);resetForm();setShowAdd(true)}} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.yellow}33`}}><UserPlus size={15}/>Add Player to {selTeam}</button>)}
      {showAdd&&(<div style={{background:css.card,borderRadius:16,padding:16,border:`1px solid ${C.yellow}44`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:800,fontSize:14,color:C.yellow}}>{editP?'Edit Player':'Add Player'}</span>
          <button onClick={()=>{setShowAdd(false);setEditP(null)}} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <GIn label="Player Name *" value={pForm.name} onChange={v=>setPForm(f=>({...f,name:v}))} css={css}/>
          <div>
            <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Role</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
              {ROLES.map(r=><button key={r} onClick={()=>setPForm(f=>({...f,role:r}))} style={{background:pForm.role===r?`${roleColor(r)}22`:css.bg,color:pForm.role===r?roleColor(r):css.text,border:`1px solid ${pForm.role===r?roleColor(r):css.border}`,borderRadius:8,padding:'8px 6px',fontSize:11,fontWeight:700,cursor:'pointer'}}>{r}</button>)}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[{k:'matches',l:'Matches'},{k:'runs',l:'Runs'},{k:'balls',l:'Balls'},{k:'wickets',l:'Wickets'},{k:'fours',l:'4s'},{k:'sixes',l:'6s'},{k:'catches',l:'Catches'}].map(({k,l})=>(
              <div key={k}><label style={{fontSize:10,color:css.sub,display:'block',marginBottom:4}}>{l}</label><input type="number" value={pForm[k]} onChange={e=>setPForm(f=>({...f,[k]:e.target.value}))} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:13,color:css.text,boxSizing:'border-box',outline:'none'}}/></div>
            ))}
          </div>
          <button onClick={savePlayer} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',boxShadow:`0 4px 12px ${C.yellow}44`}}>{editP?'💾 Save Changes':'✅ Add Player'}</button>
        </div>
      </div>)}
      <div className="two-col" style={{alignItems:'start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {selTeam&&(<GSection title={`👥 ${selTeam.toUpperCase()} (${teamPls.length})`} css={css}>
        {teamPls.length===0&&(<div style={{textAlign:'center',padding:24,color:css.sub}}><div style={{fontSize:32,marginBottom:8}}>👤</div><div style={{fontSize:13}}>No players yet.</div></div>)}
        {teamPls.map((p,i)=>{const sr=p.balls>0?((p.runs/p.balls)*100).toFixed(0):0;return(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:i<teamPls.length-1?`1px solid ${css.border}`:'none'}}>
            <PAv name={p.name} size={44}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}><span style={{fontSize:14,fontWeight:700}}>{p.name}</span><span style={{fontSize:9,background:`${roleColor(p.role||'Batsman')}22`,color:roleColor(p.role||'Batsman'),padding:'2px 8px',borderRadius:10,fontWeight:700}}>{p.role||'—'}</span></div>
              <div style={{display:'flex',gap:10,fontSize:12,color:css.sub,flexWrap:'wrap'}}><span style={{color:C.yellow,fontWeight:700}}>{p.runs}r</span><span>{p.wickets}w</span><span>SR:{sr}</span><span>{p.fours}×4</span><span>{p.sixes}×6</span></div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>openEdit(p)} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}33`,borderRadius:8,padding:8,cursor:'pointer',color:C.yellow,display:'flex',alignItems:'center'}}><Edit3 size={14}/></button>
              <button onClick={()=>delPlayer(p.id)} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}33`,borderRadius:8,padding:8,cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}}><Trash2 size={14}/></button>
            </div>
          </div>
        )})}
      </GSection>)}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {selTeam&&teamPls.length>0&&(<GSection title="📊 TEAM STATS" css={css}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:12}}>
          {[{label:'Total Runs',value:teamPls.reduce((s,p)=>s+p.runs,0),color:C.yellow},{label:'Wickets',value:teamPls.reduce((s,p)=>s+p.wickets,0),color:'#9b59b6'},{label:'Sixes',value:teamPls.reduce((s,p)=>s+p.sixes,0),color:C.success},{label:'Fours',value:teamPls.reduce((s,p)=>s+p.fours,0),color:C.info}].map(s=>(
            <div key={s.label} style={{background:isDark?C.midGray:C.offWhite,borderRadius:10,padding:'12px 10px',border:`1px solid ${css.border}`,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:10,color:css.sub,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={teamPls.slice(0,6)} margin={{top:4,right:4,bottom:4,left:-24}}>
            <CartesianGrid strokeDasharray="3 3" stroke={css.border}/>
            <XAxis dataKey="name" tick={{fontSize:9,fill:css.sub}} tickFormatter={n=>n.split(' ')[0]}/>
            <YAxis tick={{fontSize:9,fill:css.sub}}/>
            <Tooltip contentStyle={{background:css.card,border:`1px solid ${css.border}`,borderRadius:8,fontSize:11}}/>
            <Bar dataKey="runs" radius={[4,4,0,0]}>{teamPls.slice(0,6).map((_,i)=><Cell key={i} fill={COLORS_BAR[i%COLORS_BAR.length]}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </GSection>)}
      <div style={{borderRadius:16,overflow:'hidden',border:`1px solid ${premium?C.yellow:css.border}`}}>
        <div style={{background:premium?`${C.yellow}11`:css.card,padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:14,fontWeight:900,color:premium?C.yellow:css.text,marginBottom:2}}>{premium?'⭐ Premium Active':'⭐ Premium Analytics'}</div><div style={{fontSize:11,color:css.sub}}>{premium?'Full access unlocked':'AI insights & advanced stats'}</div></div>
            <button onClick={()=>{if(!premium)setShowPrem(true)}} style={{background:premium?C.yellow:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:'8px 12px',fontSize:11,fontWeight:700,color:premium?C.black:C.yellow,cursor:'pointer'}}>{premium?<Unlock size={14}/>:<Lock size={14}/>}</button>
          </div>
        </div>
      </div>
      {showPrem&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:css.card,borderRadius:20,padding:24,width:'100%',maxWidth:360,border:`2px solid ${C.yellow}`}}>
          <div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:40,marginBottom:8}}>⭐</div><div style={{fontSize:20,fontWeight:900,marginBottom:6,color:C.yellow}}>Premium Analytics</div><div style={{fontSize:13,color:css.sub}}>Unlock AI predictions & deep stats</div></div>
          {['AI Performance Predictions','Partnership Heatmaps','Phase-wise Analysis','Opposition Stats'].map(f=><div key={f} style={{display:'flex',gap:8,alignItems:'center',fontSize:13,marginBottom:8}}><CheckCircle size={14} color={C.yellow}/>{f}</div>)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:16}}>
            <button onClick={()=>setShowPrem(false)} style={{background:css.bg,border:`1px solid ${css.border}`,borderRadius:10,padding:12,fontSize:13,fontWeight:600,cursor:'pointer',color:css.text}}>Cancel</button>
            <button onClick={()=>{setPremium(true);setShowPrem(false)}} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer'}}>Unlock ⭐</button>
          </div>
        </div>
      </div>)}
      </div>
      </div>
    </div>
  )
}
