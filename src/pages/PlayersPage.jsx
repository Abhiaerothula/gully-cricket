import{useEffect,useState}from'react'
import{Plus,X,UserPlus,Trash2,Edit3,Database,CheckCircle,Lock,Unlock,Shield,Inbox,Check,XCircle}from'lucide-react'
import{BarChart,Bar,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer}from'recharts'
import{C,ROLES,COLORS_BAR}from'../data/constants.js'
import{GSection,PAv,GIn}from'../components/Shared.jsx'

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader()
    reader.onload=()=>resolve(reader.result)
    reader.onerror=()=>reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function PlayersPage({css,isDark,teamsDB,setTeamsDB,captainsDB,setCaptainsDB,transferReqs,setTransferReqs,premium,setPremium,currentUser}){
  const[selTeam,setSelTeam]=useState(Object.keys(teamsDB)[0]||'')
  const[selectedPlayerId,setSelectedPlayerId]=useState(null)
  const[showAdd,setShowAdd]=useState(false)
  const[showAddT,setShowAddT]=useState(false)
  const[newTName,setNewTName]=useState('')
  const[editP,setEditP]=useState(null)
  const[pForm,setPForm]=useState({name:'',email:'',photo:'',role:'Batsman',runs:'0',wickets:'0',catches:'0',matches:'0',balls:'0',fours:'0',sixes:'0'})
  const[showPrem,setShowPrem]=useState(false)
  const[showTransfer,setShowTransfer]=useState(false)
  const[transferTo,setTransferTo]=useState('')
  const[showInbox,setShowInbox]=useState(false)
  const isAdmin=currentUser?.role==='admin'
  const isCaptainOf=team=>!!(currentUser?.email&&captainsDB[team]&&currentUser.email.toLowerCase()===captainsDB[team].toLowerCase())
  const isCaptain=isCaptainOf(selTeam)
  const canManageTeam=isAdmin||isCaptain
  const canEdit=p=>isAdmin||isCaptain||(currentUser?.email&&p.email&&currentUser.email.toLowerCase()===p.email.toLowerCase())
  const getCaptainName=team=>{const ce=captainsDB[team];if(!ce)return null;const pl=(teamsDB[team]||[]).find(p=>p.email&&p.email.toLowerCase()===ce.toLowerCase());return pl?pl.name:ce}
  const myInboxReqs=transferReqs.filter(r=>r.toTeam===selTeam&&(isAdmin||isCaptainOf(r.toTeam)))
  const teams=Object.keys(teamsDB)
  const teamPls=selTeam?(teamsDB[selTeam]||[]):[]
  const selectedPlayer=teamPls.find(p=>p.id===selectedPlayerId)||null
  useEffect(()=>{
    if(!teams.length){
      if(selTeam)setSelTeam('')
      return
    }
    if(!teams.includes(selTeam))setSelTeam(teams[0])
  },[teams,selTeam])
  useEffect(()=>{
    if(!selTeam)return
    const currentInTeam=teamPls.some(p=>p.id===selectedPlayerId)
    if(!currentInTeam)setSelectedPlayerId(teamPls[0]?.id??null)
  },[selTeam,teamPls,selectedPlayerId])
  const roleColor=r=>r==='Batsman'?C.yellow:r==='Bowler'?C.danger:r==='All-Rounder'?C.success:'#9b59b6'
  const resetForm=()=>setPForm({name:'',email:'',photo:'',role:'Batsman',runs:'0',wickets:'0',catches:'0',matches:'0',balls:'0',fours:'0',sixes:'0'})
  const savePlayer=()=>{
    if(!pForm.name.trim())return
    const normalizedName=pForm.name.trim().toLowerCase()
    const existingInOtherTeam=Object.entries(teamsDB).find(([team,players])=>
      team!==selTeam&&
      (players||[]).some(x=>x.id!==editP?.id&&x.name?.trim().toLowerCase()===normalizedName)
    )
    if(existingInOtherTeam){
      window.alert(`Player \"${pForm.name.trim()}\" already exists in team \"${existingInOtherTeam[0]}\".`)
      return
    }
    const p={id:editP?editP.id:Date.now(),name:pForm.name,email:pForm.email.trim().toLowerCase(),photo:pForm.photo||'',team:selTeam,role:pForm.role,runs:+pForm.runs||0,wickets:+pForm.wickets||0,catches:+pForm.catches||0,matches:+pForm.matches||0,balls:+pForm.balls||0,fours:+pForm.fours||0,sixes:+pForm.sixes||0,innings:+pForm.matches||0}
    setTeamsDB(prev=>({...prev,[selTeam]:editP?(prev[selTeam]||[]).map(x=>x.id===editP.id?p:x):[...(prev[selTeam]||[]),p]}))
    setShowAdd(false);setEditP(null);resetForm()
  }
  const delPlayer=pid=>{
    setTeamsDB(prev=>({...prev,[selTeam]:(prev[selTeam]||[]).filter(p=>p.id!==pid)}))
    if(selectedPlayerId===pid)setSelectedPlayerId(null)
  }
  const openEdit=p=>{setEditP(p);setPForm({name:p.name,email:p.email||'',photo:p.photo||'',role:p.role||'Batsman',runs:''+p.runs,wickets:''+p.wickets,catches:''+p.catches,matches:''+p.matches,balls:''+p.balls,fours:''+p.fours,sixes:''+p.sixes});setShowAdd(true)}
  const addTeam=()=>{
    const cleanName=newTName.trim()
    if(!cleanName)return
    const exists=Object.keys(teamsDB).some(t=>t.trim().toLowerCase()===cleanName.toLowerCase())
    if(exists){
      window.alert(`Team \"${cleanName}\" already exists.`)
      return
    }
    if(!isAdmin){window.alert('Only Admin can create teams.');return}
    setTeamsDB(prev=>({...prev,[cleanName]:[]}))
    setSelTeam(cleanName)
    setNewTName('')
    setShowAddT(false)
  }
  const delTeam=()=>{
    if(!isAdmin){
      window.alert('Only Admin can delete teams.')
      return
    }
    if(!selTeam)return
    const players=(teamsDB[selTeam]||[]).length
    const ok=window.confirm(`Delete team "${selTeam}" from Players DB? This will remove ${players} player(s).`)
    if(!ok)return
    setTeamsDB(prev=>{
      const next={...prev}
      delete next[selTeam]
      const keys=Object.keys(next)
      setSelTeam(keys[0]||'')
      return next
    })
  }
  return(
    <div className="page-pad" style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontWeight:900,fontSize:18,display:'flex',alignItems:'center',gap:8}}><Database size={18} color={C.yellow}/>Players DB</div><div style={{fontSize:12,color:css.sub}}>{Object.values(teamsDB).flat().length} players across {teams.length} teams</div></div>
        {isAdmin&&<button onClick={()=>setShowAddT(true)} style={{background:`${css.accent}22`,border:`1px solid ${css.accent}44`,borderRadius:8,padding:'7px 12px',fontSize:11,fontWeight:700,color:css.accent,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><Plus size={12}/>Team</button>}
      </div>
      {showAddT&&(<div style={{background:css.card,borderRadius:12,padding:14,border:`1px solid ${C.yellow}44`}}>
        <div style={{fontSize:12,color:css.accent,fontWeight:700,marginBottom:8}}>New Team</div>
        <div style={{display:'flex',gap:8}}>
          <input value={newTName} onChange={e=>setNewTName(e.target.value)} placeholder="Team name" style={{flex:1,background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 12px',fontSize:13,color:css.text,outline:'none'}}/>
          <button onClick={addTeam} style={{background:C.yellow,border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:800,color:C.black,cursor:'pointer'}}>Add</button>
          <button onClick={()=>setShowAddT(false)} style={{background:'none',border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',cursor:'pointer',color:css.sub}}><X size={14}/></button>
        </div>
      </div>)}
      <div style={{overflowX:'auto',display:'flex',gap:8,paddingBottom:4}}>
        {teams.map(t=>{const capName=getCaptainName(t);return<button key={t} onClick={()=>{setSelTeam(t);setSelectedPlayerId(null)}} style={{background:selTeam===t?C.yellow:css.card,color:selTeam===t?C.black:css.text,border:`1px solid ${selTeam===t?C.yellow:css.border}`,borderRadius:20,padding:'7px 14px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t}<span style={{fontSize:10,opacity:0.7}}>({(teamsDB[t]||[]).length})</span>{capName&&<span style={{fontSize:9,opacity:0.6,marginLeft:4}}>👑{capName.split(' ')[0]}</span>}</button>})}
      </div>
      {selTeam&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
          {canManageTeam&&<button onClick={()=>{setEditP(null);resetForm();setShowAdd(true)}} style={{background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:10,padding:12,fontSize:13,fontWeight:800,color:C.black,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 12px ${C.yellow}33`}}><UserPlus size={15}/>Add Player to {selTeam}</button>}
          {isAdmin&&<button onClick={delTeam} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:10,padding:'0 12px',fontSize:12,fontWeight:700,color:C.danger,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Trash2 size={14}/>Delete Team</button>}
        </div>
      )}
      {showAdd&&(<div style={{background:css.card,borderRadius:16,padding:16,border:`1px solid ${C.yellow}44`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:800,fontSize:14,color:css.accent}}>{editP?'Edit Player':'Add Player'}</span>
          <button onClick={()=>{setShowAdd(false);setEditP(null)}} style={{background:'none',border:'none',cursor:'pointer',color:css.sub}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <GIn label="Player Name *" value={pForm.name} onChange={v=>setPForm(f=>({...f,name:v}))} css={css}/>
          <GIn label="Player Email (for login mapping)" value={pForm.email} onChange={v=>setPForm(f=>({...f,email:v}))} css={css}/>
          <div>
            <label style={{fontSize:12,color:css.sub,display:'block',marginBottom:6}}>Player Photo (optional)</label>
            <input type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;const dataUrl=await fileToDataUrl(file);setPForm(f=>({...f,photo:dataUrl}))}} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,boxSizing:'border-box'}}/>
            {pForm.photo&&<div style={{marginTop:8,display:'flex',alignItems:'center',gap:8}}><PAv name={pForm.name||'Player'} photo={pForm.photo} size={34}/><button onClick={()=>setPForm(f=>({...f,photo:''}))} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:6,padding:'5px 8px',fontSize:10,fontWeight:700,color:C.danger,cursor:'pointer'}}>Remove Photo</button></div>}
          </div>
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
        {getCaptainName(selTeam)&&<div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,padding:'6px 10px',background:`${C.yellow}11`,border:`1px solid ${C.yellow}33`,borderRadius:8,fontSize:11,color:css.accent,fontWeight:700}}><Shield size={13} color={C.yellow}/>Captain: {getCaptainName(selTeam)}</div>}
        {myInboxReqs.length>0&&(isAdmin||isCaptain)&&(
          <div style={{marginBottom:10}}>
            <button onClick={()=>setShowInbox(v=>!v)} style={{width:'100%',background:`${C.info}11`,border:`1px solid ${C.info}33`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,color:C.info,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <Inbox size={13}/>{showInbox?'▲ Hide':'📩'} Transfer Requests ({myInboxReqs.length})
            </button>
            {showInbox&&<div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
              {myInboxReqs.map(r=>(
                <div key={r.id} style={{background:isDark?C.midGray:C.offWhite,border:`1px solid ${css.border}`,borderRadius:10,padding:10,display:'flex',alignItems:'center',gap:10}}>
                  <PAv name={r.playerName} size={32}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700}}>{r.playerName}</div>
                    <div style={{fontSize:10,color:css.sub}}>From <b>{r.fromTeam}</b> → wants to join <b>{r.toTeam}</b></div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    <button title='Approve' onClick={()=>{
                      setTeamsDB(prev=>{
                        const fromPls=prev[r.fromTeam]||[]
                        const player=fromPls.find(p=>p.id===r.playerId)
                        if(!player)return prev
                        const fromList=fromPls.filter(p=>p.id!==r.playerId)
                        const moved={...player,team:r.toTeam}
                        const toList=[...(prev[r.toTeam]||[]),moved]
                        return{...prev,[r.fromTeam]:fromList,[r.toTeam]:toList}
                      })
                      setTransferReqs(prev=>prev.filter(x=>x.id!==r.id))
                    }} style={{background:`${C.success}22`,border:`1px solid ${C.success}44`,borderRadius:8,padding:6,cursor:'pointer',color:C.success,display:'flex',alignItems:'center'}}><Check size={14}/></button>
                    <button title='Reject' onClick={()=>{
                      setTransferReqs(prev=>prev.filter(x=>x.id!==r.id))
                    }} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}44`,borderRadius:8,padding:6,cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}}><XCircle size={14}/></button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}
        {teamPls.length===0&&(<div style={{textAlign:'center',padding:24,color:css.sub}}><div style={{fontSize:32,marginBottom:8}}>👤</div><div style={{fontSize:13}}>No players yet.</div></div>)}
        {teamPls.map((p,i)=>{const sr=p.balls>0?((p.runs/p.balls)*100).toFixed(0):0;const isSel=selectedPlayerId===p.id;return(
          <div key={p.id} onClick={()=>setSelectedPlayerId(p.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 10px',borderBottom:i<teamPls.length-1?`1px solid ${css.border}`:'none',borderRadius:10,cursor:'pointer',background:isSel?`${C.yellow}11`:'transparent',border:isSel?`1px solid ${C.yellow}44`:'1px solid transparent'}}>
            <PAv name={p.name} photo={p.photo} size={44}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}><span style={{fontSize:14,fontWeight:700}}>{p.name}</span>{captainsDB[selTeam]&&p.email&&p.email.toLowerCase()===captainsDB[selTeam].toLowerCase()&&<span style={{fontSize:9,background:`${C.yellow}22`,color:C.yellow,padding:'2px 6px',borderRadius:10,fontWeight:700,display:'flex',alignItems:'center',gap:2}}><Shield size={9}/>C</span>}<span style={{fontSize:9,background:`${roleColor(p.role||'Batsman')}22`,color:roleColor(p.role||'Batsman'),padding:'2px 8px',borderRadius:10,fontWeight:700}}>{p.role||'—'}</span></div>
              <div style={{display:'flex',gap:10,fontSize:12,color:css.sub,flexWrap:'wrap'}}><span style={{color:css.accent,fontWeight:700}}>{p.runs}r</span><span>{p.wickets}w</span><span>SR:{sr}</span><span>{p.fours}×4</span><span>{p.sixes}×6</span></div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {canEdit(p)&&<button onClick={e=>{e.stopPropagation();openEdit(p)}} style={{background:`${css.accent}22`,border:`1px solid ${css.accent}33`,borderRadius:8,padding:8,cursor:'pointer',color:css.accent,display:'flex',alignItems:'center'}}><Edit3 size={14}/></button>}
              {isAdmin&&p.email&&<button title='Set as Captain' onClick={e=>{e.stopPropagation();setCaptainsDB(prev=>({...prev,[selTeam]:p.email.toLowerCase()}))}} style={{background:captainsDB[selTeam]&&p.email.toLowerCase()===captainsDB[selTeam].toLowerCase()?`${C.yellow}33`:`${C.yellow}11`,border:`1px solid ${C.yellow}33`,borderRadius:8,padding:8,cursor:'pointer',color:C.yellow,display:'flex',alignItems:'center'}}><Shield size={14}/></button>}
              {(isAdmin||isCaptain)&&<button onClick={e=>{e.stopPropagation();if(window.confirm(`Delete ${p.name} from ${selTeam}?`))delPlayer(p.id)}} style={{background:`${C.danger}22`,border:`1px solid ${C.danger}33`,borderRadius:8,padding:8,cursor:'pointer',color:C.danger,display:'flex',alignItems:'center'}}><Trash2 size={14}/></button>}
            </div>
          </div>
        )})}
      </GSection>)}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {selectedPlayer&&(()=>{
        const innings=selectedPlayer.innings||selectedPlayer.matches||0
        const sr=selectedPlayer.balls>0?((selectedPlayer.runs/selectedPlayer.balls)*100).toFixed(1):'0.0'
        const avg=innings>0?(selectedPlayer.runs/innings).toFixed(1):'0.0'
        const boundaryRuns=(selectedPlayer.fours*4)+(selectedPlayer.sixes*6)
        const boundaryPct=selectedPlayer.runs>0?((boundaryRuns/selectedPlayer.runs)*100).toFixed(1):'0.0'
        return(
        <GSection title="🧾 PLAYER FULL STATS" css={css}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <PAv name={selectedPlayer.name} photo={selectedPlayer.photo} size={46}/>
          <div>
            <div style={{fontSize:15,fontWeight:900}}>{selectedPlayer.name}</div>
            <div style={{fontSize:11,color:css.sub,display:'flex',gap:8,flexWrap:'wrap'}}>
              <span>{selTeam}</span>
              <span style={{color:roleColor(selectedPlayer.role||'Batsman'),fontWeight:700}}>{selectedPlayer.role||'—'}</span>
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {[{label:'Matches',value:selectedPlayer.matches},{label:'Innings',value:innings},{label:'Runs',value:selectedPlayer.runs},{label:'Balls',value:selectedPlayer.balls},{label:'Batting Avg',value:avg},{label:'Strike Rate',value:sr},{label:'Wickets',value:selectedPlayer.wickets},{label:'Catches',value:selectedPlayer.catches},{label:'Fours',value:selectedPlayer.fours},{label:'Sixes',value:selectedPlayer.sixes},{label:'Boundary Runs',value:boundaryRuns},{label:'Boundary %',value:`${boundaryPct}%`}].map(s=>(
            <div key={s.label} style={{background:isDark?C.midGray:C.offWhite,borderRadius:10,padding:'10px 8px',border:`1px solid ${css.border}`,textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:css.accent}}>{s.value}</div>
              <div style={{fontSize:10,color:css.sub,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {canEdit(selectedPlayer)&&<div style={{marginTop:12,borderTop:`1px solid ${css.border}`,paddingTop:8}}>
          <button onClick={()=>{setShowTransfer(v=>!v);setTransferTo('')}} style={{background:'none',border:'none',cursor:'pointer',color:css.sub,fontSize:10,fontWeight:600,padding:'4px 0',opacity:0.6}}>{showTransfer?'▲ Hide':'⋯ More options'}</button>
          {showTransfer&&(
            <div style={{marginTop:8,background:isDark?C.midGray:C.offWhite,borderRadius:10,padding:12,border:`1px solid ${css.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:css.sub,marginBottom:6}}>🔄 Transfer to another team</div>
              <select value={transferTo} onChange={e=>setTransferTo(e.target.value)} style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:'8px 10px',fontSize:12,color:css.text,cursor:'pointer',marginBottom:8}}>
                <option value="">Select team</option>
                {teams.filter(t=>t!==selTeam).map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <button disabled={!transferTo} onClick={()=>{
                if(!transferTo)return
                if(isAdmin){
                  const ok=window.confirm(`Transfer ${selectedPlayer.name} from ${selTeam} to ${transferTo}?`)
                  if(!ok)return
                  setTeamsDB(prev=>{
                    const fromList=(prev[selTeam]||[]).filter(p=>p.id!==selectedPlayer.id)
                    const moved={...selectedPlayer,team:transferTo}
                    const toList=[...(prev[transferTo]||[]),moved]
                    return{...prev,[selTeam]:fromList,[transferTo]:toList}
                  })
                  setShowTransfer(false);setTransferTo('')
                  setSelTeam(transferTo);setSelectedPlayerId(selectedPlayer.id)
                }else{
                  const already=transferReqs.some(r=>r.playerId===selectedPlayer.id&&r.toTeam===transferTo&&r.status==='pending')
                  if(already){window.alert('Transfer request already pending for this team.');return}
                  const capName=getCaptainName(transferTo)||'captain'
                  const ok=window.confirm(`Send transfer request for ${selectedPlayer.name} to ${transferTo}?\n\n${capName} (captain) will need to approve.`)
                  if(!ok)return
                  setTransferReqs(prev=>[...prev,{id:Date.now(),playerId:selectedPlayer.id,playerName:selectedPlayer.name,playerEmail:selectedPlayer.email||'',fromTeam:selTeam,toTeam:transferTo,status:'pending',requestedAt:new Date().toISOString()}])
                  setShowTransfer(false);setTransferTo('')
                  window.alert(`Transfer request sent to ${capName} of ${transferTo}. Awaiting approval.`)
                }
              }} style={{width:'100%',background:transferTo?`${C.info}22`:css.bg,border:`1px solid ${transferTo?C.info:css.border}`,borderRadius:8,padding:'8px 10px',fontSize:11,fontWeight:700,color:transferTo?C.info:css.sub,cursor:transferTo?'pointer':'not-allowed'}}>{isAdmin?'Transfer Player':'Request Transfer'}</button>
            </div>
          )}
        </div>}
      </GSection>)})()}
      {selTeam&&teamPls.length>0&&(<GSection title="📊 TEAM STATS" css={css}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:12}}>
          {[{label:'Total Runs',value:teamPls.reduce((s,p)=>s+p.runs,0),color:css.accent},{label:'Wickets',value:teamPls.reduce((s,p)=>s+p.wickets,0),color:'#9b59b6'},{label:'Sixes',value:teamPls.reduce((s,p)=>s+p.sixes,0),color:C.success},{label:'Fours',value:teamPls.reduce((s,p)=>s+p.fours,0),color:C.info}].map(s=>(
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
            <button onClick={()=>{if(!premium)setShowPrem(true)}} style={{background:premium?C.yellow:`${css.accent}22`,border:`1px solid ${css.accent}44`,borderRadius:8,padding:'8px 12px',fontSize:11,fontWeight:700,color:premium?C.black:css.accent,cursor:'pointer'}}>{premium?<Unlock size={14}/>:<Lock size={14}/>}</button>
          </div>
        </div>
      </div>
      {showPrem&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:css.card,borderRadius:20,padding:24,width:'100%',maxWidth:360,border:`2px solid ${C.yellow}`}}>
          <div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:40,marginBottom:8}}>⭐</div><div style={{fontSize:20,fontWeight:900,marginBottom:6,color:css.accent}}>Premium Analytics</div><div style={{fontSize:13,color:css.sub}}>Unlock AI predictions & deep stats</div></div>
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
