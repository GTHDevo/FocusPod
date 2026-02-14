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
SETTINGS:["Theme","Fullscreen","Back"],
THEMES:["Classic Black","White","Retro Silver","Parlament Blue","Nintendo DS","PS Vita","Switch","iPod Classic","Aqua Blue","Produced Red","Back"]
};

/* BOOT */
let load=0;
const progress=document.querySelector(".boot-progress");
const bootInt=setInterval(()=>{
load+=4;
progress.style.width=load+"%";
if(load>=100){
clearInterval(bootInt);
setTimeout(()=>{
boot.classList.add("hidden");
device.classList.remove("hidden");
renderMenu();
},500);
}
},70);

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
screen.innerHTML="";
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
screen.innerHTML="";
if(!playlist.length){screen.textContent="No tracks";return;}
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
if(!track)return;
state="NOW";
screen.innerHTML=`
<div>Now Playing</div>
<div class="cover">
<img src="https://picsum.photos/200?random=${Math.random()}">
</div>
<div>${track.name}</div>
<div class="progress-bar">
<div class="progress" id="prog"></div>
</div>`;
}

audio.ontimeupdate=()=>{
if(state==="NOW"){
const percent=(audio.currentTime/audio.duration)*100;
const bar=document.getElementById("prog");
if(bar)bar.style.width=percent+"%";
}
};

audio.onended=()=>{
if(playlist.length>0){
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
else renderPlaylist();
});

/* SELECT */
function handleSelect(){
const choice=menus.MAIN[menuIndex];
if(choice==="Music")renderPlaylist();
if(choice==="Upload")fileInput.click();
if(choice==="Spotify")loadEmbed(prompt("Spotify link"));
if(choice==="Apple")loadEmbed(prompt("Apple link"));
if(choice==="Settings")renderSettings();
}

function loadEmbed(link){
if(!link)return;
let embed=link;
if(link.includes("spotify.com"))embed=link.replace("open.","").replace("/track/","/embed/track/");
screen.innerHTML=`<iframe src="${embed}"></iframe>`;
}

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
if(choice==="Fullscreen")document.documentElement.requestFullscreen();
if(choice==="Back")renderMenu();
}

function renderThemes(){
screen.innerHTML="";
menus.THEMES.forEach(t=>{
const div=document.createElement("div");
div.className="menu-item";
div.textContent=t;
div.onclick=()=>applyTheme(t);
screen.appendChild(div);
});
}

function applyTheme(choice){
let color="";
if(choice==="Classic Black")color="#111";
if(choice==="White")color="#f4f4f4";
if(choice==="Retro Silver")color="#bfc3c9";
if(choice==="Parlament Blue")color="#1c2d5a";
if(choice==="Nintendo DS")color="#70c0f0";
if(choice==="PS Vita")color="#00aaff";
if(choice==="Switch")color="#ff4d4d";
if(choice==="iPod Classic")color="#f2e5d0";
if(choice==="Aqua Blue")color="#89c7f2";
if(choice==="Produced Red")color="#C8102E";
if(color){
document.documentElement.style.setProperty("--device",color);
localStorage.setItem("fp-theme",color);
}
}

const saved=localStorage.getItem("fp-theme");
if(saved)document.documentElement.style.setProperty("--device",saved);

/* WHEEL */
wheel.addEventListener("pointerdown",()=>{lastAngle=null;});
wheel.addEventListener("pointermove",e=>{
if(e.buttons!==1)return;
if(state!=="MAIN")return;
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
document.querySelector(".menu").onclick=()=>renderMenu();
document.querySelector(".play").onclick=()=>audio.paused?audio.play():audio.pause();
document.querySelector(".prev").onclick=()=>{if(playlist.length){currentTrack=(currentTrack-1+playlist.length)%playlist.length;playTrack(currentTrack);}};
document.querySelector(".next").onclick=()=>{if(playlist.length){currentTrack=(currentTrack+1)%playlist.length;playTrack(currentTrack);}};
document.getElementById("select").onclick=handleSelect;

renderMenu();
