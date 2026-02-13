/* FocusPod OS UPGRADE - FULL PATCH */

const boot=document.getElementById("boot");
const device=document.getElementById("device");
const screen=document.getElementById("screen");
const wheel=document.getElementById("wheel");
const audio=document.getElementById("audio");
const fileInput=document.getElementById("fileInput");
const clockEl=document.getElementById("clock");

let state="MAIN";
let menuIndex=0;
let playlist=[];
let currentTrack=0;
let nowPlayingIndex=null;
let lastAngle=null;

const menus={
  MAIN:["Music","Upload","Spotify","Apple","Settings"],
  SETTINGS:["Theme","OS Theme","Font","Fullscreen","Back"],
  THEMES:["Classic Black","White","Retro Silver","Parlament Blue","Nintendo DS","PS Vita","Switch","iPod Classic","Aqua Blue","Custom HEX","Back"],
  OS_THEMES:["Light","Dark","iTunes Classic","Custom","Back"],
  FONTS:["Helvetica","Arial","Courier New","Roboto","Back"]
};

/* BOOT */
let load=0;
const progress=document.querySelector(".boot-progress");
const bootInt=setInterval(()=>{
  load+=3;
  progress.style.width=load+"%";
  if(load>=100){
    clearInterval(bootInt);
    setTimeout(()=>{
      boot.classList.add("hidden");
      device.classList.remove("hidden");
      renderMenu();
    },600);
  }
},80);

/* CLOCK */
function updateClock(){
  const d=new Date();
  clockEl.textContent=d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

/* MENU RENDER */
function renderMenu(){
  state="MAIN";
  screen.innerHTML="";
  menus.MAIN.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="menu-item"+(i===menuIndex?" active":"");
    div.textContent=item;
    div.onclick=()=>{ menuIndex=i; handleSelect(); };
    screen.appendChild(div);
  });
}

/* PLAYLIST */
function renderPlaylist(){
  state="MUSIC";
  screen.innerHTML="";
  if(!playlist.length){ screen.textContent="No tracks"; return; }
  playlist.forEach((t,i)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=t.name;
    div.onclick=()=>playTrack(i);
    screen.appendChild(div);
  });
}

function playTrack(index){
  if(!playlist[index]) return;
  currentTrack=index;
  nowPlayingIndex=index;
  audio.src=playlist[index].url;
  audio.play();
  renderNowPlaying();
}

function renderNowPlaying(){
  const track=playlist[nowPlayingIndex];
  if(!track) return;
  state="NOW";
  screen.innerHTML=`<div>Now Playing</div><div>${track.name}</div><div class="progress-bar"><div class="progress" id="prog"></div></div>`;
}

audio.ontimeupdate=()=>{
  if(state==="NOW" && nowPlayingIndex!==null){
    const percent=(audio.currentTime/audio.duration)*100;
    const bar=document.getElementById("prog");
    if(bar) bar.style.width=percent+"%";
  }
};

/* FILE UPLOAD */
fileInput.addEventListener("change",e=>{
  const files=[...e.target.files];
  files.forEach(f=>{
    playlist.push({name:f.name.replace(".mp3",""), url:URL.createObjectURL(f)});
  });
  e.target.value="";
  renderPlaylist();
});

/* HANDLE SELECT */
function handleSelect(){
  const choice=menus.MAIN[menuIndex];
  if(choice==="Music") renderPlaylist();
  if(choice==="Upload") fileInput.click();
  if(choice==="Spotify") handleLinkInput("Spotify");
  if(choice==="Apple") handleLinkInput("Apple");
  if(choice==="Settings") renderSettings();
}

/* LINK INPUT */
let linkBuffer="";
let linkType=null;
function handleLinkInput(type){ state="LINK_INPUT"; linkType=type; linkBuffer=""; renderLinkScreen(); }
function renderLinkScreen(){ screen.innerHTML=`<div>Paste ${linkType} link:</div><div style='margin-top:10px; word-break:break-all; font-size:12px;'>${linkBuffer||"_"}</div>`; }
document.addEventListener("keydown",e=>{
  if(state!=="LINK_INPUT") return;
  if(e.key==="Enter"){ 
    if(linkType==="Spotify") embedSpotify(linkBuffer); 
    if(linkType==="Apple") embedApple(linkBuffer); 
    return; 
  }
  if(e.key==="Backspace"){ linkBuffer=linkBuffer.slice(0,-1); renderLinkScreen(); return; }
  if(e.key.length===1){ linkBuffer+=e.key; renderLinkScreen(); }
});

/* EMBED */
function embedSpotify(url){
  const id=url.split("track/")[1]?.split("?")[0];
  if(!id) return;
  nowPlayingIndex=null;
  screen.innerHTML=`<iframe src="https://open.spotify.com/embed/track/${id}" width="100%" height="200"></iframe>`;
}
function embedApple(url){
  nowPlayingIndex=null;
  screen.innerHTML=`<iframe src="${url}" width="100%" height="200"></iframe>`;
}

/* SETTINGS */
function renderSettings(){
  state="SETTINGS";
  screen.innerHTML="";
  menus.SETTINGS.forEach((item)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=item;
    div.onclick=()=>handleSettings(item);
    screen.appendChild(div);
  });
}

function handleSettings(choice){
  if(choice==="Theme") renderThemes();
  if(choice==="OS Theme") renderOSThemes();
  if(choice==="Font") renderFonts();
  if(choice==="Fullscreen") document.documentElement.requestFullscreen();
  if(choice==="Back") renderMenu();
}

function renderThemes(){
  state="THEME";
  screen.innerHTML="";
  menus.THEMES.forEach((t)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=t;
    div.onclick=()=>applyTheme(t);
    screen.appendChild(div);
  });
}

function applyTheme(choice){
  let color="";
  if(choice==="Classic Black") color="#111";
  if(choice==="White") color="#f4f4f4";
  if(choice==="Retro Silver") color="#bfc3c9";
  if(choice==="Parlament Blue") color="#1c2d5a";
  if(choice==="Nintendo DS") color="#70c0f0";
  if(choice==="PS Vita") color="#00aaff";
  if(choice==="Switch") color="#ff4d4d";
  if(choice==="iPod Classic") color="#f2e5d0";
  if(choice==="Aqua Blue") color="#89c7f2";
  if(choice==="Custom HEX"){ const hex=prompt("HEX renk gir (#xxxxxx)"); if(hex) color=hex; }
  if(color){ document.documentElement.style.setProperty("--device",color); localStorage.setItem("fp-theme",color); }
}

const saved=localStorage.getItem("fp-theme"); if(saved) document.documentElement.style.setProperty("--device",saved);

/* OS Theme */
function renderOSThemes(){
  state="OS_THEME";
  screen.innerHTML="";
  menus.OS_THEMES.forEach((t)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=t;
    div.onclick=()=>applyOSTheme(t);
    screen.appendChild(div);
  });
}
function applyOSTheme(choice){
  if(choice==="Light"){ document.body.style.background="#eee"; screen.style.background="#000"; }
  if(choice==="Dark"){ document.body.style.background="#111"; screen.style.background="#000"; }
  if(choice==="iTunes Classic"){ document.body.style.background="#c0c0c0"; screen.style.background="#000"; }
  if(choice==="Custom"){ const hex=prompt("HEX arka plan gir (#xxxxxx)"); if(hex) document.body.style.background=hex; }
}

/* Fonts */
function renderFonts(){
  state="FONT";
  screen.innerHTML="";
  menus.FONTS.forEach(f=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=f;
    div.onclick=()=>applyFont(f);
    screen.appendChild(div);
  });
}
function applyFont(f){
  if(f==="Back") renderSettings();
  else document.documentElement.style.setProperty("--font-family",f);
}

/* WHEEL NAV */
wheel.addEventListener("pointermove",e=>{
  if(e.buttons!==1) return;
  const r=wheel.getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const angle=Math.atan2(e.clientY-cy,e.clientX-cx);
  if(lastAngle!==null){
    const delta=angle-lastAngle;
    if(Math.abs(delta)>0.05){ menuIndex+=delta>0?1:-1; menuIndex=(menuIndex+menus.MAIN.length)%menus.MAIN.length; renderMenu(); }
  }
  lastAngle=angle;
});

/* BUTTONS */
document.querySelector(".menu").onclick=()=>{
  if(state==="MAIN") state==="NOW"?renderNowPlaying():renderNowPlaying();
  else if(state==="NOW") renderMenu();
  else renderMenu();
};
document.querySelector(".play").onclick=()=>{ if(audio.paused) audio.play(); else audio.pause(); };
document.querySelector(".prev").onclick=()=>{ if(nowPlayingIndex!==null){ currentTrack=(currentTrack-1+playlist.length)%playlist.length; playTrack(currentTrack); } };
document.querySelector(".next").onclick=()=>{ if(nowPlayingIndex!==null){ currentTrack=(currentTrack+1)%playlist.length; playTrack(currentTrack); } };
document.getElementById("select").onclick=handleSelect;

/* TOUCH */
screen.addEventListener("click",e=>{
  if(!e.target.classList.contains("menu-item")) return;
  const items=[...document.querySelectorAll(".menu-item")];
  menuIndex=items.indexOf(e.target);
  handleSelect();
});

/* INITIAL */
renderMenu();
