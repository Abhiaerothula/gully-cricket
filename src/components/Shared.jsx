import { C } from '../data/constants.js'
import { ballStyle, ballGlow } from '../utils/ballUtils.js'

export function PAv({ name, size = 36 }) {
  const pal = [C.yellow,'#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#9b59b6','#FF9500','#22C55E']
  const idx  = name ? name.charCodeAt(0) % pal.length : 0
  const init = name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(135deg,${pal[idx]},${pal[(idx+3)%pal.length]})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.32, fontWeight:900, color:C.black }}>{init}</div>
  )
}

export function BallDot({ b, size = 28 }) {
  const { bg, col } = ballStyle(b)
  const shadow = ballGlow(b)
  const isNB = b?.startsWith('NB')
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color:col,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:size*0.3, fontWeight:700, boxShadow:shadow }}>{b}</div>
      {isNB && <div style={{ position:'absolute', top:-5, right:-5, background:C.yellow, color:C.black,
        fontSize:6, fontWeight:900, borderRadius:3, padding:'1px 3px' }}>FH</div>}
    </div>
  )
}

export function GSection({ title, css, children, onMore }) {
  return (
    <div style={{ background:css.card, borderRadius:16, padding:14, border:`1px solid ${css.border}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:10, fontWeight:800, letterSpacing:1.2, color:C.yellow, textTransform:'uppercase' }}>{title}</span>
        {onMore && <button onClick={onMore} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:C.yellow, fontWeight:700, padding:0 }}>See all →</button>}
      </div>
      {children}
    </div>
  )
}

export function MatchCard({ match, css, isDark, onClick, onDelete }) {
  const i0 = match.innings?.[0], i1 = match.innings?.[1]
  return (
    <div style={{ background:css.cardAlt, borderRadius:12, padding:12, marginBottom:8,
      border:`1px solid ${match.status==='live'?C.yellow+'55':css.border}`,
      cursor:onClick?'pointer':'default', position:'relative' }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:1,
          color:match.status==='live'?C.yellow:css.sub,
          background:match.status==='live'?`${C.yellow}22`:css.border, padding:'2px 6px', borderRadius:4 }}>
          {match.status==='live'?'● LIVE':match.status.toUpperCase()} · {match.format}
        </span>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:10, color:css.sub }}>{new Date(match.created).toLocaleDateString()}</span>
          {onDelete && <button onClick={e=>{e.stopPropagation();onDelete(match.id)}}
            style={{ background:`${C.danger}22`, border:`1px solid ${C.danger}33`, borderRadius:6,
              padding:'2px 7px', cursor:'pointer', color:C.danger, fontSize:11 }}>✕</button>}
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700 }}>{match.team1}</div>
          <div style={{ fontSize:11, color:css.sub }}>{i0?`${i0.score}/${i0.wickets} (${i0.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
        <div style={{ fontSize:11, color:css.sub, fontWeight:600 }}>vs</div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:13, fontWeight:700 }}>{match.team2}</div>
          <div style={{ fontSize:11, color:css.sub }}>{i1&&i1.score>0?`${i1.score}/${i1.wickets} (${i1.oversDisplay||'0.0'})`:'Yet to bat'}</div>
        </div>
      </div>
    </div>
  )
}

export function GIn({ label, value, onChange, css, ph='', type='text' }) {
  return (
    <div>
      <label style={{ fontSize:12, color:css.sub, display:'block', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph||label}
        style={{ width:'100%', background:css.bg, border:`1px solid ${css.border}`, borderRadius:8,
          padding:'10px 12px', fontSize:13, color:css.text, boxSizing:'border-box', outline:'none' }}/>
    </div>
  )
}

export function Modal({ children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200,
      display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ width:'100%', maxWidth:480, margin:'0 auto' }}>{children}</div>
    </div>
  )
}

export function Empty({ icon='🏏', text='Nothing here yet' }) {
  return (
    <div style={{ textAlign:'center', padding:30, color:'#666' }}>
      <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:13 }}>{text}</div>
    </div>
  )
}
