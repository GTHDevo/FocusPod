/* ========= BOOT ========= */

const boot = document.getElementById("boot");
const device = document.getElementById("device");
const progress = document.querySelector(".boot-progress");

let load = 0;
const bootInt = setInterval(()=>{
  load+=3;
  progress.style.width = load+"%";
  if(load>=100){
    clearInterval(bootInt);
    setTimeout(()=>{
      boot.classList.add("hidden");
      device.classList.remove("hidden");
      init();
    },600);
  }
},80);

/* ========= STATE ========= */

const STATE={
  MAIN:"main",
  MUSIC:"music",
  NOW:"now",
  SETTINGS:"settings",
  THEME:"theme"
};

let state=STATE.MAIN;
let index=0;
let playlist=[];
let currentTrack=0;

/* ========= DOM ========= */

const screen=document.getElementById("screen-content");
const audio=document.getElementById("audio");

/* ========= MENUS ========= */

const menus={
  main:["Music","Upload","Spotify","Apple","Settings"],
  settings:["Theme","Fullscreen","Back"],
  themes:["Classic Black","White","Retro Silver","Parlament Blue","Custom HEX","Back"]
};

/* ========= RENDER ========= */

function renderMenu(list){
  screen.innerHTML=list.map((item,i)=>
    `<div class="menu-item ${i===index?"active":""}">${item}</div>`
  ).join("");
}

function renderNowPlaying(){
  const track=playlist[currentTrack];
  screen.innerHTML=`
    <div>${track.name}</div>
    <div>${formatTime(audio.currentTime)} / ${formatTime(audio.duration||0)}</div>
    <div class="progress-bar"><div class="progress" id="prog"></div></div>
  `;
}

/* ========= WHEEL ========= */

const wheel=document.getElementById("wheel");
let lastAngle=null;

wheel.addEventListener("pointermove",e=>{
  if(e.buttons!==1) return;

  const r=wheel.getBoundingClientRect();
  const cx=r.left+r.width/2;
  const cy=r.top+r.height/2;
  const angle=Math.atan2(e.clientY-cy,e.clientX-cx);

  if(lastAngle!==null){
    const delta=angle-lastAngle;
    if(Math.abs(delta)>0.05){
      index+=delta>0?1:-1;
      const list=getCurrentList();
      index=(index+list.length)%list.length;
      renderMenu(list);
    }
  }
  lastAngle=angle;
});

/* ========= BUTTONS ========= */

document.getElementById("menuBtn").onclick=()=>{
  state=STATE.MAIN;
  index=0;
  renderMenu(menus.main);
};

document.getElementById("selectBtn").onclick=()=>{
  handleSelect();
};

document.getElementById("prevBtn").onclick=()=>{
  if(state===STATE.NOW){
    currentTrack=(currentTrack-1+playlist.length)%playlist.length;
    playTrack();
  }
};

document.getElementById("nextBtn").onclick=()=>{
  if(state===STATE.NOW){
    currentTrack=(currentTrack+1)%playlist.length;
    playTrack();
  }
};

document.getElementById("playBtn").onclick=()=>{
  audio.paused?audio.play():audio.pause();
};

/* ========= LOGIC ========= */

function getCurrentList(){
  if(state===STATE.MAIN) return menus.main;
  if(state===STATE.SETTINGS) return menus.settings;
  if(state===STATE.THEME) return menus.themes;
  if(state===STATE.MUSIC) return playlist.map(t=>t.name);
  return [];
}

function handleSelect(){
  if(state===STATE.MAIN){
    const choice=menus.main[index];
    if(choice==="Music"){
      state=STATE.MUSIC;
      index=0;
      renderMenu(getCurrentList());
    }
    if(choice==="Upload"){
      document.getElementById("fileInput").click();
    }
    if(choice==="Settings"){
      state=STATE.SETTINGS;
      index=0;
      renderMenu(menus.settings);
    }
    if(choice==="Spotify"){
      const url=prompt("Spotify link:");
      if(url) embedSpotify(url);
    }
    if(choice==="Apple"){
      const url=prompt("Apple Music link:");
      if(url) embedApple(url);
    }
  }

  else if(state===STATE.MUSIC){
    currentTrack=index;
    playTrack();
  }

  else if(state===STATE.SETTINGS){
    const choice=menus.settings[index];
    if(choice==="Theme"){
      state=STATE.THEME;
      index=0;
      renderMenu(menus.themes);
    }
    if(choice==="Fullscreen"){
      document.documentElement.requestFullscreen();
    }
    if(choice==="Back"){
      state=STATE.MAIN;
      index=0;
      renderMenu(menus.main);
    }
  }

  else if(state===STATE.THEME){
    applyThemeChoice(menus.themes[index]);
  }
}

/* ========= AUDIO ========= */

function playTrack(){
  const track=playlist[currentTrack];
  audio.src=track.url;
  audio.play();
  state=STATE.NOW;
  renderNowPlaying();
}

audio.ontimeupdate=()=>{
  if(state===STATE.NOW){
    const percent=(audio.currentTime/audio.duration)*100;
    const bar=document.getElementById("prog");
    if(bar) bar.style.width=percent+"%";
    renderNowPlaying();
  }
};

document.getElementById("fileInput").addEventListener("change",e=>{
  const files=[...e.target.files];
  files.forEach(f=>{
    playlist.push({
      name:f.name,
      url:URL.createObjectURL(f)
    });
  });
});

/* ========= EMBED ========= */

function embedSpotify(url){
  const id=url.split("track/")[1]?.split("?")[0];
  if(!id) return;
  screen.innerHTML=
  `<iframe src="https://open.spotify.com/embed/track/${id}"
   width="100%" height="200"></iframe>`;
}

function embedApple(url){
  screen.innerHTML=
  `<iframe src="${url}" width="100%" height="200"></iframe>`;
}

/* ========= THEME ========= */

function applyThemeChoice(choice){
  if(choice==="Classic Black") setTheme("#111");
  if(choice==="White") setTheme("#f4f4f4");
  if(choice==="Retro Silver") setTheme("#bfc3c9");
  if(choice==="Parlament Blue") setTheme("#1c2d5a");
  if(choice==="Custom HEX"){
    const hex=prompt("HEX renk gir (#xxxxxx)");
    if(hex) setTheme(hex);
  }
}

function setTheme(color){
  document.documentElement.style.setProperty("--device",color);
  localStorage.setItem("fp-theme",color);
}

const saved=localStorage.getItem("fp-theme");
if(saved) setTheme(saved);

/* ========= CLOCK ========= */

function updateClock(){
  const d=new Date();
  document.getElementById("clock").textContent=
    d.getHours().toString().padStart(2,"0")+":"+
    d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

/* ========= UTILS ========= */

function formatTime(sec){
  if(!sec) return "0:00";
  const m=Math.floor(sec/60);
  const s=Math.floor(sec%60).toString().padStart(2,"0");
  return m+":"+s;
}

function init(){
  renderMenu(menus.main);
}
