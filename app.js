const boot=document.getElementById("boot");
const device=document.getElementById("device");
const screen=document.getElementById("screen");
const wheel=document.getElementById("wheel");
const audio=document.getElementById("audio");
const fileInput=document.getElementById("fileInput");
const clockEl=document.getElementById("clock");
const batteryEl=document.getElementById("battery");

let state="MAIN";
let menuIndex=0;
let playlist=[];
let currentTrack=0;
let nowPlayingIndex=null;
let touchStartY=null;

const menus={
MAIN:["Music","Upload","Spotify","Apple","Settings"],
SETTINGS:["Theme","Fullscreen","Back"],
THEMES:["Classic Black","White","Retro Silver","Parlament Blue","Nintendo DS","PS Vita","Switch","iPod Classic","Aqua Blue","Produced Red","Back"]
};

/* BOOT (Hızlandırıldı) */
setTimeout(()=>{
boot.classList.add("hidden");
device.classList.remove("hidden");
renderMenu();
},1000);

/* CLOCK + BATTERY */
function updateClock(){
const d=new Date();
clockEl.textContent=d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

if(navigator.getBattery){
navigator.getBattery().then(b=>{
function updateBattery(){
batteryEl.textContent=Math.floor(b.level*100)+"%";
}
updateBattery();
b.addEventListener("levelchange",updateBattery);
});
}

/* MENU */
function renderMenu(){
state="MAIN";
screen.innerHTML="";
menus.MAIN.forEach((item,i)=>{
const div=document.createElement("div");
div.className="menu-item"+(i===menuIndex?" active":"");
div.innerHTML=item;
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
<div class="now-ui">
<div>Now Playing</div>
<div class="cover">
<img src="https://picsum.photos/300?random=${Math.random()}">
</div>
<div class="song-title">${track.name}</div>
<div class="progress-bar">
<div class="progress" id="prog"></div>
</div>
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
if(link.includes("spotify")){
link=link.replace("open.spotify.com","open.spotify.com/embed");
}
if(link.includes("music.apple.com")){
link=link.replace("music.apple.com","embed.music.apple.com");
}
screen.innerHTML=`<iframe src="${link}" allow="autoplay"></iframe>`;
}

/* SELECT */
function handleSelect(){
const choice=menus.MAIN[menuIndex];
if(choice==="Music")renderPlaylist();
if(choice==="Upload")fileInput.click();
if(choice==="Spotify")screen.innerHTML=`<input id="embedInput" placeholder="Spotify link"><button onclick="loadEmbed(document.getElementById('embedInput').value)">OK</button>`;
if(choice==="Apple")screen.innerHTML=`<input id="embedInput" placeholder="Apple link"><button onclick="loadEmbed(document.getElementById('embedInput').value)">OK</button>`;
if(choice==="Settings")renderSettings();
}

/* SETTINGS */
function renderSettings(){
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

/* TOUCH SCROLL */
screen.addEventListener("touchstart",e=>{
touchStartY=e.touches[0].clientY;
});
screen.addEventListener("touchmove",e=>{
if(state!=="MAIN")return;
let diff=e.touches[0].clientY-touchStartY;
if(Math.abs(diff)>30){
menuIndex+=diff>0?-1:1;
menuIndex=(menuIndex+menus.MAIN.length)%menus.MAIN.length;
renderMenu();
touchStartY=e.touches[0].clientY;
}
});

document.querySelector(".menu").onclick=()=>renderMenu();
document.querySelector(".play").onclick=()=>audio.paused?audio.play():audio.pause();
document.querySelector(".prev").onclick=()=>{if(playlist.length){currentTrack=(currentTrack-1+playlist.length)%playlist.length;playTrack(currentTrack);}};
document.querySelector(".next").onclick=()=>{if(playlist.length){currentTrack=(currentTrack+1)%playlist.length;playTrack(currentTrack);}};
document.getElementById("select").onclick=handleSelect;

renderMenu();
