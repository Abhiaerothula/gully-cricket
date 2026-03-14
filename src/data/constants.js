export const C={
  yellow:'#FFD600',yellowDark:'#E6C000',
  black:'#0A0A0A',darkGray:'#1A1A1A',midGray:'#2A2A2A',borderDark:'#333333',
  white:'#FFFFFF',offWhite:'#F5F5F5',lightGray:'#ECECEC',midText:'#888888',
  danger:'#FF3B3B',success:'#22C55E',info:'#3B82F6',warn:'#FF9500',
}
export const THEMES={
  dark:{bg:C.black,card:C.darkGray,card2:C.midGray,border:C.borderDark,text:C.white,sub:C.midText,accent:C.yellow,accentText:C.black,nav:'rgba(10,10,10,0.97)'},
  light:{bg:C.offWhite,card:C.white,card2:C.lightGray,border:'#CCCCCC',text:C.black,sub:'#444444',accent:'#9E8400',accentText:C.black,nav:'rgba(255,255,255,0.97)'},
}
export const FORMATS={
  T20:{overs:20,balls:null,powerplay:[1,6],name:'T20'},
  ODI:{overs:50,balls:null,powerplay:[1,10],name:'ODI'},
  TEST:{overs:null,balls:null,powerplay:null,name:'Test'},
  QUICK:{overs:10,balls:null,powerplay:null,name:'Quick'},
  HUNDRED:{overs:null,balls:100,powerplay:null,name:'The 100'},
  CUSTOM:{overs:null,balls:null,powerplay:null,name:'Custom'},
}
export const WICKET_TYPES=['Bowled','Caught','LBW','Run Out','Stumped','Hit Wicket','Retired','Obstructing']
export const EXTRAS_TYPES=['Wide','No Ball','Bye','Leg Bye']
export const ROLES=['Batsman','Bowler','All-Rounder','Wicket-Keeper']
export const COLORS_BAR=[C.yellow,'#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8']
