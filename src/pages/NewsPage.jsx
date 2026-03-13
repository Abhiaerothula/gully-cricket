import{useState}from'react'
import{C}from'../data/constants.js'
import{MOCK_NEWS}from'../data/seedData.js'
import{PAv}from'../components/Shared.jsx'
export default function NewsPage({css,isDark,notices,noticeInput,setNoticeInput,postNotice}){
  const[nTab,setNTab]=useState('news')
  return(
    <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:8}}>
        {[{id:'news',label:'📰 News'},{id:'board',label:'📌 Noticeboard'}].map(t=>(
          <button key={t.id} onClick={()=>setNTab(t.id)} style={{background:nTab===t.id?C.yellow:css.card,color:nTab===t.id?C.black:css.text,border:`1px solid ${nTab===t.id?C.yellow:css.border}`,borderRadius:20,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>{t.label}</button>
        ))}
      </div>
      {nTab==='news'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {MOCK_NEWS.map(n=>(
            <div key={n.id} style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`,borderLeft:n.hot?`3px solid ${C.yellow}`:`1px solid ${css.border}`}}>
              <div style={{display:'inline-block',background:n.hot?`${C.yellow}22`:css.border,color:n.hot?C.yellow:css.sub,fontSize:9,fontWeight:700,letterSpacing:1,padding:'2px 6px',borderRadius:4,marginBottom:6}}>{n.tag}{n.hot&&' 🔥'}</div>
              <div style={{fontSize:13,fontWeight:600,lineHeight:1.4,marginBottom:4}}>{n.title}</div>
              <div style={{fontSize:11,color:css.sub}}>{n.time}</div>
            </div>
          ))}
        </div>
      )}
      {nTab==='board'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`}}>
            <div style={{fontSize:12,color:css.sub,marginBottom:8}}>Post an update</div>
            <textarea value={noticeInput} onChange={e=>setNoticeInput(e.target.value)} placeholder="Share a match update, venue change, or announcement..." style={{width:'100%',background:css.bg,border:`1px solid ${css.border}`,borderRadius:8,padding:10,fontSize:13,color:css.text,resize:'none',minHeight:70,boxSizing:'border-box',outline:'none'}}/>
            <button onClick={postNotice} style={{marginTop:8,background:`linear-gradient(135deg,${C.yellow},${C.yellowDark})`,border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:800,color:C.black,cursor:'pointer'}}>📌 Post Notice</button>
          </div>
          {notices.map(n=>(
            <div key={n.id} style={{background:css.card,borderRadius:14,padding:14,border:`1px solid ${css.border}`,borderLeft:n.urgent?`3px solid ${C.danger}`:`1px solid ${css.border}`}}>
              <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <PAv name={n.author} size={36}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <div><span style={{fontSize:13,fontWeight:700}}>{n.author}</span><span style={{fontSize:10,color:css.sub,marginLeft:6}}>{n.role}</span></div>
                    <span style={{fontSize:10,color:css.sub}}>{n.time}</span>
                  </div>
                  {n.urgent&&<div style={{display:'inline-block',background:`${C.danger}22`,color:C.danger,fontSize:9,fontWeight:700,letterSpacing:1,padding:'2px 6px',borderRadius:4,marginBottom:6}}>⚠️ URGENT</div>}
                  <div style={{fontSize:13,lineHeight:1.5}}>{n.msg}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
