import{C}from'./constants.js'
function mkP(id,name,team,role,runs,wkts,catches,matches,balls,fours,sixes){
  return{id,name,team,role,runs,wickets:wkts,catches,matches,balls,fours,sixes,innings:matches}
}
export const DEFAULT_TEAMS_DB={
  'Street Kings':[
    mkP(101,'Arjun Mehta','Street Kings','Batsman',480,4,7,10,360,52,18),
    mkP(102,'Rahul Verma','Street Kings','Bowler',55,22,4,10,120,5,2),
    mkP(103,'Priya Sharma','Street Kings','All-Rounder',310,14,9,10,290,32,12),
    mkP(104,'Dev Patel','Street Kings','Batsman',390,2,6,9,310,40,16),
    mkP(105,'Kiran Nair','Street Kings','Wicket-Keeper',280,0,18,10,240,28,8),
  ],
  'Park Blasters':[
    mkP(201,'Suresh Kumar','Park Blasters','Batsman',520,1,5,10,400,58,24),
    mkP(202,'Amit Singh','Park Blasters','Bowler',48,28,3,10,140,4,1),
    mkP(203,'Neha Gupta','Park Blasters','All-Rounder',290,12,7,9,260,28,10),
    mkP(204,'Raj Khanna','Park Blasters','Batsman',370,3,8,10,320,36,14),
    mkP(205,'Vikram Iyer','Park Blasters','Wicket-Keeper',250,0,20,10,210,24,6),
  ],
  'Colony XI':[
    mkP(301,'Ankit Tiwari','Colony XI','Batsman',440,2,6,9,340,46,20),
    mkP(302,'Sanjay Rawat','Colony XI','Bowler',60,25,5,9,130,6,3),
    mkP(303,'Pooja Mishra','Colony XI','All-Rounder',320,16,8,9,270,30,14),
    mkP(304,'Deepak Rao','Colony XI','Batsman',360,1,4,8,300,38,12),
    mkP(305,'Ravi Chandra','Colony XI','Wicket-Keeper',240,0,15,9,200,22,4),
  ],
  'Night Riders':[
    mkP(401,'Mohit Sharma','Night Riders','Batsman',410,3,7,9,330,44,16),
    mkP(402,'Vikas Bajaj','Night Riders','Bowler',70,20,4,9,150,7,2),
    mkP(403,'Sunita Yadav','Night Riders','All-Rounder',280,11,6,8,255,26,9),
    mkP(404,'Ashish Pandey','Night Riders','Batsman',350,4,5,9,290,34,18),
    mkP(405,'Lalit Singh','Night Riders','Wicket-Keeper',220,0,16,9,185,20,5),
  ],
}

// ── Generate 100 realistic cricket balls ──────────────────────────────────────
function gen100Balls(){
  const balls=[]
  for(let i=0;i<100;i++){
    const r=Math.random()
    if(r<0.26)balls.push('0')
    else if(r<0.46)balls.push('1')
    else if(r<0.58)balls.push('2')
    else if(r<0.63)balls.push('3')
    else if(r<0.76)balls.push('4')
    else if(r<0.87)balls.push('6')
    else if(r<0.91)balls.push('W')
    else if(r<0.95)balls.push('Wd')
    else balls.push('NB')
  }
  return balls
}
function calcInnings(balls,maxOvers=20){
  let score=0,wickets=0,legal=0,extras=0
  balls.forEach(b=>{
    if(b==='W'){wickets++;legal++}
    else if(b==='Wd'||b==='NB'){score+=1;extras++}
    else if(b==='4'){score+=4;legal++}
    else if(b==='6'){score+=6;legal++}
    else{score+=parseInt(b)||0;legal++}
  })
  wickets=Math.min(wickets,10)
  const overs=Math.floor(legal/6),rem=legal%6
  return{score,wickets,balls:legal,overs,oversDisplay:`${overs}.${rem}`,extras,ballLog:balls,maxOvers,snapshots:[]}
}
function mkInn(batting,maxOvers=20){
  return{batting,...calcInnings(gen100Balls(),maxOvers)}
}

export const DEFAULT_TOURNAMENTS=[
  {
    id:1,name:'Gully Premier League 2025',shortName:'GPL',
    format:'T20',status:'ongoing',emoji:'🏆',color:C.yellow,
    teams:['Street Kings','Park Blasters','Colony XI','Night Riders','Downtown CC','Riverside Boys'],
    startDate:'Mar 1, 2025',endDate:'Apr 15, 2025',matches:18,played:11,prize:'₹50,000',
    recentMatches:[
      {id:1001,team1:'Street Kings',team2:'Park Blasters',format:'T20',status:'completed',created:Date.now()-86400000*2,
        innings:[mkInn('Street Kings'),mkInn('Park Blasters')]},
      {id:1002,team1:'Colony XI',team2:'Night Riders',format:'T20',status:'completed',created:Date.now()-86400000*4,
        innings:[mkInn('Colony XI'),mkInn('Night Riders')]},
      {id:1003,team1:'Riverside Boys',team2:'Downtown CC',format:'T20',status:'completed',created:Date.now()-86400000*6,
        innings:[mkInn('Riverside Boys'),mkInn('Downtown CC')]},
    ],
    table:[
      {team:'Street Kings',p:11,w:8,l:3,pts:16,nrr:'+1.24'},
      {team:'Park Blasters',p:11,w:7,l:4,pts:14,nrr:'+0.87'},
      {team:'Colony XI',p:10,w:6,l:4,pts:12,nrr:'+0.34'},
      {team:'Night Riders',p:10,w:5,l:5,pts:10,nrr:'-0.12'},
      {team:'Downtown CC',p:10,w:3,l:7,pts:6,nrr:'-0.98'},
      {team:'Riverside Boys',p:10,w:2,l:8,pts:4,nrr:'-1.45'},
    ],
  },
  {
    id:2,name:'Monsoon Cup 2025',shortName:'MC',
    format:'ODI',status:'upcoming',emoji:'🌧️',color:'#3B82F6',
    teams:['Thunder Hawks','Silver Bullets','Red Warriors','Blue Sharks'],
    startDate:'Jun 10, 2025',endDate:'Jun 25, 2025',matches:8,played:0,prize:'₹25,000',
    recentMatches:[],
    table:[
      {team:'Thunder Hawks',p:0,w:0,l:0,pts:0,nrr:'—'},
      {team:'Silver Bullets',p:0,w:0,l:0,pts:0,nrr:'—'},
      {team:'Red Warriors',p:0,w:0,l:0,pts:0,nrr:'—'},
      {team:'Blue Sharks',p:0,w:0,l:0,pts:0,nrr:'—'},
    ],
  },
  {
    id:3,name:'Night Cricket League',shortName:'NCL',
    format:'T20',status:'completed',emoji:'🌙',color:'#9b59b6',
    winner:'Midnight XI',
    teams:['Midnight XI','Neon Strikers','Dark Horses','Phantom FC'],
    startDate:'Dec 1, 2024',endDate:'Dec 31, 2024',matches:12,played:12,prize:'₹30,000',
    recentMatches:[
      {id:1004,team1:'Midnight XI',team2:'Neon Strikers',format:'T20',status:'completed',created:Date.now()-86400000*30,
        innings:[mkInn('Midnight XI'),mkInn('Neon Strikers')]},
    ],
    table:[
      {team:'Midnight XI',p:12,w:9,l:3,pts:18,nrr:'+1.56'},
      {team:'Neon Strikers',p:12,w:7,l:5,pts:14,nrr:'+0.42'},
      {team:'Dark Horses',p:12,w:5,l:7,pts:10,nrr:'-0.34'},
      {team:'Phantom FC',p:12,w:3,l:9,pts:6,nrr:'-1.67'},
    ],
  },
  {
    id:4,name:'Corporate T10 Blast',shortName:'CTB',
    format:'QUICK',status:'ongoing',emoji:'💼',color:'#FF9500',
    teams:['TechCorp XI','FinanceFC','HR Hitters','Sales Smasherz','Ops Aces','Marketing Marvels'],
    startDate:'Mar 5, 2025',endDate:'Mar 30, 2025',matches:15,played:7,prize:'Trophy + Dinner',
    recentMatches:[
      {id:1005,team1:'TechCorp XI',team2:'HR Hitters',format:'QUICK',status:'completed',created:Date.now()-86400000,
        innings:[mkInn('TechCorp XI',10),mkInn('HR Hitters',10)]},
    ],
    table:[
      {team:'TechCorp XI',p:7,w:5,l:2,pts:10,nrr:'+1.12'},
      {team:'HR Hitters',p:7,w:5,l:2,pts:10,nrr:'+0.78'},
      {team:'Marketing Marvels',p:6,w:4,l:2,pts:8,nrr:'+0.22'},
      {team:'FinanceFC',p:7,w:3,l:4,pts:6,nrr:'-0.45'},
      {team:'Sales Smasherz',p:6,w:2,l:4,pts:4,nrr:'-0.89'},
      {team:'Ops Aces',p:7,w:0,l:7,pts:0,nrr:'-2.10'},
    ],
  },
]
export const MOCK_NEWS=[
  {id:1,title:'Rohit Sharma leads India to series victory with stunning century',time:'2h ago',tag:'International',hot:true},
  {id:2,title:'IPL 2025 auction: Mumbai Indians bag three key players',time:'4h ago',tag:'IPL',hot:true},
  {id:3,title:'England announce squad for upcoming Ashes series',time:'6h ago',tag:'Ashes',hot:false},
  {id:4,title:"Local club cricket: St. Mary's beat Central CC in thriller",time:'1d ago',tag:'Local',hot:false},
  {id:5,title:"Women's T20 World Cup schedule announced for 2025",time:'2d ago',tag:"Women's",hot:false},
]
export const MOCK_NOTICES=[
  {id:1,author:'Raj Patel',role:'Tournament Director',msg:'Finals rescheduled to Sunday 3PM due to rain. Ground: Oval Park, Pitch 2.',time:'30m ago',urgent:true},
  {id:2,author:'Manish Kumar',role:'Umpire',msg:'All captains: match balls must be presented 15 mins before start.',time:'2h ago',urgent:false},
  {id:3,author:"Sarah O'Brien",role:'Club Secretary',msg:'Team sheets due by Friday. Late submissions result in point deduction.',time:'1d ago',urgent:false},
]
