const boot=document.getElementById("boot");
const device=document.getElementById("device");
const screen=document.getElementById("screen");
const wheel=document.getElementById("wheel");
const audio=document.getElementById("audio");
const fileInput=document.getElementById("fileInput");
const clockInline=document.getElementById("clock-inline");

let state="MAIN";
let menuIndex=0;
let playlist=[];
let currentTrack=0;
let nowPlayingIndex=null;
let lastAngle=null;

/* CLOCK inside screen */
function updateClock(){
  const d=new Date();
  clockInline.textContent=
    d.getHours().toString().padStart(2,"0")+":"+
    d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

/* AUTOPLAY mp3 */
audio.addEventListener("ended",()=>{
  if(playlist.length){
    currentTrack=(currentTrack+1)%playlist.length;
    playTrack(currentTrack);
  }
});

/* MENU with icons */
const menus={
  MAIN:[
    "Music",
    "Upload",
    "🎵 Spotify",
    "🍎 Apple",
    "Settings"
  ]
};

/* RENDER MENU */
function renderMenu(){
  state="MAIN";
  screen.innerHTML=`<div class="screen-status">
      <span>${clockInline.textContent}</span>
      <span class="battery">▰▰▰▰</span>
    </div>`;
  menus.MAIN.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="menu-item"+(i===menuIndex?" active":"");
    div.textContent=item;
    screen.appendChild(div);
  });
}

/* PLAYLIST */
function renderPlaylist(){
  state="MUSIC";
  screen.innerHTML=`<div class="screen-status">
      <span>${clockInline.textContent}</span>
      <span class="battery">▰▰▰▰</span>
    </div>`;
  if(!playlist.length){
    screen.innerHTML+="No tracks";
    return;
  }
  playlist.forEach((t,i)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=t.name;
    div.onclick=()=>playTrack(i);
    screen.appendChild(div);
  });
}

function playTrack(index){
  currentTrack=index;
  nowPlayingIndex=index;
  audio.src=playlist[index].url;
  audio.play();
  renderNowPlaying();
}

function renderNowPlaying(){
  const track=playlist[nowPlayingIndex];
  state="NOW";
  screen.innerHTML=`
  <div class="screen-status">
    <span>${clockInline.textContent}</span>
    <span class="battery">▰▰▰▰</span>
  </div>
  <div style="text-align:center;">Now Playing</div>
  <div class="disk" style="background-image:url('${track.cover || ""}')"></div>
  <div style="text-align:center;margin-top:6px;">${track.name}</div>
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

/* FILE */
fileInput.addEventListener("change",e=>{
  [...e.target.files].forEach(f=>{
    playlist.push({
      name:f.name.replace(".mp3",""),
      url:URL.createObjectURL(f),
      cover:""
    });
  });
  renderPlaylist();
});

/* SPOTIFY / APPLE CLEAN EMBED */
function handleLinkInput(type){
  const link=prompt(type+" link:");
  if(!link) return;

  let embed="";
  if(type==="Spotify"){
    const id=link.split("track/")[1]?.split("?")[0];
    embed=`https://open.spotify.com/embed/track/${id}`;
  }else{
    embed=link;
  }

  screen.innerHTML=`
  <div class="screen-status">
    <span>${clockInline.textContent}</span>
    <span class="battery">▰▰▰▰</span>
  </div>
  <div class="embed-container">
    <iframe src="${embed}" allow="autoplay"></iframe>
  </div>
  `;
}

/* SELECT */
function handleSelect(){
  const choice=menus.MAIN[menuIndex];
  if(choice==="Music") renderPlaylist();
  if(choice==="Upload") fileInput.click();
  if(choice.includes("Spotify")) handleLinkInput("Spotify");
  if(choice.includes("Apple")) handleLinkInput("Apple");
  if(choice==="Settings") alert("OS Theme aktif (body arka plan değişir)");
}

/* WHEEL */
wheel.addEventListener("pointerdown",()=>{ lastAngle=null; });

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

/* BUTTONS */
document.querySelector(".menu").onclick=renderMenu;
document.querySelector(".play").onclick=()=>{
  if(audio.paused) audio.play();
  else audio.pause();
};
document.querySelector(".prev").onclick=()=>{
  if(playlist.length){
    currentTrack=(currentTrack-1+playlist.length)%playlist.length;
    playTrack(currentTrack);
  }
};
document.querySelector(".next").onclick=()=>{
  if(playlist.length){
    currentTrack=(currentTrack+1)%playlist.length;
    playTrack(currentTrack);
  }
};
document.getElementById("select").onclick=handleSelect;

/* INIT */
renderMenu();
