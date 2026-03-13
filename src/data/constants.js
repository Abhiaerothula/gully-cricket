export const C={
  yellow:'#FFD600',yellowDark:'#E6C000',
  black:'#0A0A0A',darkGray:'#1A1A1A',midGray:'#2A2A2A',borderDark:'#333333',
  white:'#FFFFFF',offWhite:'#F5F5F5',lightGray:'#ECECEC',midText:'#888888',
  danger:'#FF3B3B',success:'#22C55E',info:'#3B82F6',warn:'#FF9500',
}
export const THEMES={
  dark:{
    bg:C.black, card:C.darkGray, card2:C.midGray, border:C.borderDark,
    text:C.white, sub:C.midText, accent:C.yellow, accentText:C.black,
    nav:'rgba(10,10,10,0.97)',
    header:'linear-gradient(135deg,#1A1A1A,#0A0A0A)',
    scorerBg:'linear-gradient(135deg,#0A0A0A,#1A1A1A)',
    innerBg:'rgba(0,0,0,0.35)',
    cardAlt:C.midGray,
    tableHead:C.midGray,
    innCard:'rgba(255,255,255,0.06)',
    summaryBg:`linear-gradient(135deg,#1A1A1A,#2A2A2A)`,
    summaryCard:'rgba(0,0,0,0.3)',
  },
  light:{
    bg:C.offWhite, card:C.white, card2:C.lightGray, border:'#CCCCCC',
    text:'#111111', sub:'#555555', accent:'#9A7800', accentText:C.white,
    nav:'rgba(255,255,255,0.97)',
    header:'linear-gradient(135deg,#1e1e1e,#111111)',
    scorerBg:'linear-gradient(135deg,#222222,#333333)',
    innerBg:'rgba(0,0,0,0.12)',
    cardAlt:'#E8E8E8',
    tableHead:C.lightGray,
    innCard:'rgba(0,0,0,0.05)',
    summaryBg:`linear-gradient(135deg,#2a2a2a,#1a1a1a)`,
    summaryCard:'rgba(0,0,0,0.25)',
  },
}
export const FORMATS={
  T20:{overs:20,powerplay:[1,6],name:'T20'},
  ODI:{overs:50,powerplay:[1,10],name:'ODI'},
  TEST:{overs:null,powerplay:null,name:'Test'},
  QUICK:{overs:10,powerplay:null,name:'Quick'},
}
export const WICKET_TYPES=['Bowled','Caught','LBW','Run Out','Stumped','Hit Wicket','Retired','Obstructing']
export const EXTRAS_TYPES=['Wide','No Ball','Bye','Leg Bye']
export const ROLES=['Batsman','Bowler','All-Rounder','Wicket-Keeper']
export const COLORS_BAR=[C.yellow,'#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8']
