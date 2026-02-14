const screen=document.getElementById("screen");
const audio=document.getElementById("audio");
const fileInput=document.getElementById("fileInput");
const wheel=document.getElementById("wheel");

let state="MAIN";
let menuIndex=0;
let playlist=[];
let currentTrack=0;
let lastAngle=null;

const menus={
  MAIN:[
    "Music",
    "Upload",
    "🎵 Spotify",
    "🍎 Apple",
    "Settings"
  ],
  SETTINGS:["Theme","OS Theme","Back"]
};

/* CLOCK inside screen */
function getStatusBar(){
  const d=new Date();
  const time=d.getHours().toString().padStart(2,"0")+":"+
             d.getMinutes().toString().padStart(2,"0");
  return `<div class="status-bar">
            <span>${time}</span>
            <span>▰▰▰▰</span>
          </div>`;
}

/* MENU */
function renderMenu(){
  state="MAIN";
  screen.innerHTML=getStatusBar();
  menus.MAIN.forEach((item,i)=>{
    screen.innerHTML+=
      `<div class="menu-item ${i===menuIndex?"active":""}">
        ${item}
       </div>`;
  });
}

/* PLAYLIST */
function renderPlaylist(){
  state="MUSIC";
  screen.innerHTML=getStatusBar();
  if(!playlist.length){
    screen.innerHTML+="No tracks";
    return;
  }
  playlist.forEach((t,i)=>{
    screen.innerHTML+=
      `<div class="menu-item" onclick="playTrack(${i})">
        ${t.name}
       </div>`;
  });
}

function playTrack(i){
  currentTrack=i;
  audio.src=playlist[i].url;
  audio.play(); // autoplay ✅
  renderNowPlaying();
}

/* NOW PLAYING */
function renderNowPlaying(){
  const track=playlist[currentTrack];
  state="NOW";
  screen.innerHTML=getStatusBar()+`
    <div style="text-align:center">Now Playing</div>
    <div class="cover" style="background-image:url('${track.cover||""}')"></div>
    <div style="text-align:center;margin-top:6px">${track.name}</div>
    <div class="progress-bar">
      <div class="progress" id="prog"></div>
    </div>
  `;
}

audio.ontimeupdate=()=>{
  const bar=document.getElementById("prog");
  if(bar){
    bar.style.width=(audio.currentTime/audio.duration)*100+"%";
  }
};

/* FILE UPLOAD + cover extraction */
fileInput.addEventListener("change",e=>{
  [...e.target.files].forEach(file=>{
    const url=URL.createObjectURL(file);
    playlist.push({
      name:file.name.replace(".mp3",""),
      url:url,
      cover:""
    });
  });
  renderPlaylist();
});

/* Spotify & Apple embed düzgün sığan */
function embedPlayer(url){
  screen.innerHTML=getStatusBar()+
  `<iframe src="${url}"
   width="100%"
   height="150"
   frameborder="0"
   style="border-radius:10px;">
  </iframe>`;
}

/* SELECT */
function handleSelect(){
  const choice=menus.MAIN[menuIndex];

  if(choice==="Music") renderPlaylist();
  if(choice==="Upload") fileInput.click();
  if(choice.includes("Spotify")){
    const link=prompt("Spotify link:");
    if(link){
      const id=link.split("track/")[1]?.split("?")[0];
      embedPlayer(`https://open.spotify.com/embed/track/${id}`);
    }
  }
  if(choice.includes("Apple")){
    const link=prompt("Apple Music link:");
    if(link){
      embedPlayer(link);
    }
  }
  if(choice==="Settings") renderSettings();
}

/* SETTINGS */
function renderSettings(){
  state="SETTINGS";
  screen.innerHTML=getStatusBar();
  menus.SETTINGS.forEach((item,i)=>{
    screen.innerHTML+=
      `<div class="menu-item ${i===menuIndex?"active":""}">
        ${item}
       </div>`;
  });
}

/* OS Theme (body değişir pod değişmez) */
function applyOS(theme){
  if(theme==="Dark") document.body.style.background="#111";
  if(theme==="Light") document.body.style.background="#e5e5e5";
}

/* WHEEL */
wheel.addEventListener("pointerdown",()=>lastAngle=null);

wheel.addEventListener("pointermove",e=>{
  if(e.buttons!==1) return;

  const r=wheel.getBoundingClientRect();
  const cx=r.left+r.width/2;
  const cy=r.top+r.height/2;
  const angle=Math.atan2(e.clientY-cy,e.clientX-cx);

  if(lastAngle!==null){
    const delta=angle-lastAngle;
    if(Math.abs(delta)>0.1){
      menuIndex+=delta>0?1:-1;
      menuIndex=(menuIndex+menus.MAIN.length)%menus.MAIN.length;
      renderMenu();
    }
  }
  lastAngle=angle;
});

document.querySelector(".center").onclick=handleSelect;
document.querySelector(".menu").onclick=renderMenu;
document.querySelector(".play").onclick=()=>{
  if(audio.paused) audio.play();
  else audio.pause();
};

renderMenu();
