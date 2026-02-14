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
SETTINGS:["Theme","OS Theme","Fullscreen","Back"],
THEMES:["Classic Black","White","Retro Silver","Parlament Blue","Produced Red","Back"]
};

/* FAST BOOT */
setTimeout(()=>{
boot.classList.add("hidden");
device.classList.remove("hidden");
renderMenu();
},900);

/* CLOCK */
function updateClock(){
const d=new Date();
clockEl.textContent=d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

/* MENU */
function renderMenu(){
state="MAIN";
screen.innerHTML+=``;
screen.innerHTML="";
menus.MAIN.forEach((item,i)=>{
const div=document.createElement("div");
div.className="menu-item"+(i===menuIndex?" active":"");
div.textContent=item;
screen.appendChild(div);
});
}

/* NOW PLAYING – iPod 5th style */
function renderNowPlaying(){
const track=playlist[nowPlayingIndex];
if(!track)return;
state="NOW";
screen.innerHTML=`
<div class="screen-top">
<div>${clockEl.textContent}</div>
<div>100%</div>
</div>
<div class="now-ui">
<div style="font-size:11px;">Now Playing</div>
<div class="cover">
<img src="https://picsum.photos/300?random=${currentTrack}">
</div>
<div class="now-title">${track.name}</div>
<div class="progress-bar">
<div class="progress" id="prog"></div>
</div>
</div>
`;
}

/* PLAY */
function playTrack(index){
currentTrack=index;
nowPlayingIndex=index;
audio.src=playlist[index].url;
audio.play();
renderNowPlaying();
}

audio.ontimeupdate=()=>{
if(state==="NOW"){
const percent=(audio.currentTime/audio.duration)*100;
const bar=document.getElementById("prog");
if(bar)bar.style.width=percent+"%";
}
};

audio.onended=()=>{
if(playlist.length){
currentTrack=(currentTrack+1)%playlist.length;
playTrack(currentTrack);
}
};

/* FILE */
fileInput.addEventListener("change",e=>{
[...e.target.files].forEach(f=>{
playlist.push({name:f.name.replace(".mp3",""),url:URL.createObjectURL(f)});
});
if(playlist.length===1)playTrack(0);
});

/* EMBED FIX */
function loadEmbed(link){
if(!link)return;

let embed=link;

if(link.includes("spotify.com")){
embed=link.replace("open.","")
.replace("/track/","/embed/track/");
}

if(link.includes("music.apple.com")){
embed=link.replace("music.apple.com","embed.music.apple.com");
}

screen.innerHTML=`
<div class="screen-top">
<div>${clockEl.textContent}</div>
<div>100%</div>
</div>
<iframe src="${embed}" allow="autoplay"></iframe>
`;
}

/* TOUCH CONTROL */
let touchStartY=null;
screen.addEventListener("touchstart",e=>{
touchStartY=e.touches[0].clientY;
});
screen.addEventListener("touchmove",e=>{
if(state!=="MAIN")return;
let y=e.touches[0].clientY;
if(Math.abs(y-touchStartY)>20){
menuIndex+=y>touchStartY?1:-1;
menuIndex=(menuIndex+menus.MAIN.length)%menus.MAIN.length;
renderMenu();
touchStartY=y;
}
});

/* SETTINGS */
function renderSettings(){
state="SETTINGS";
screen.innerHTML="";
menus.SETTINGS.forEach(item=>{
const div=document.createElement("div");
div.className="menu-item";
div.textContent=item;
div.onclick=()=>handleSettings(item);
screen.appendChild(div);
});
}

function handleSettings(choice){
if(choice==="Theme")renderThemes();
if(choice==="OS Theme")renderOSThemes();
if(choice==="Fullscreen")document.documentElement.requestFullscreen();
if(choice==="Back")renderMenu();
}

function renderThemes(){
screen.innerHTML="";
menus.THEMES.forEach(t=>{
const div=document.createElement("div");
div.className="menu-item";
div.textContent=t;
div.onclick=()=>document.documentElement.style.setProperty("--device",
t==="Produced Red"?"#C8102E":
t==="Parlament Blue"?"#1c2d5a":
t==="Retro Silver"?"#bfc3c9":
t==="White"?"#f4f4f4":"#111");
screen.appendChild(div);
});
}

function renderOSThemes(){
screen.innerHTML="";
["Dark","Light","Blue"].forEach(t=>{
const div=document.createElement("div");
div.className="menu-item";
div.textContent=t;
div.onclick=()=>{
document.documentElement.style.setProperty("--os-bg",
t==="Light"?"#ffffff":
t==="Blue"?"#0d1b3a":"#000");
};
screen.appendChild(div);
});
}

/* BUTTONS */
document.querySelector(".menu").onclick=()=>renderMenu();
document.querySelector(".play").onclick=()=>audio.paused?audio.play():audio.pause();
document.querySelector(".prev").onclick=()=>{if(playlist.length){currentTrack=(currentTrack-1+playlist.length)%playlist.length;playTrack(currentTrack);}};
document.querySelector(".next").onclick=()=>{if(playlist.length){currentTrack=(currentTrack+1)%playlist.length;playTrack(currentTrack);}};
document.getElementById("select").onclick=()=>renderMenu();

renderMenu();
