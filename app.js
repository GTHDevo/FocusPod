const screen=document.getElementById("screen-content");
const audio=document.getElementById("audio");
const fileInput=document.getElementById("fileInput");
const clockEl=document.getElementById("clock");
const batteryEl=document.getElementById("battery");

let playlist=[];
let current=0;
let state="MENU";

const menus=["Music","Upload","Spotify 🎵","Apple 🍎","OS Theme"];

function renderMenu(){
  state="MENU";
  screen.innerHTML="";
  menus.forEach((m,i)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=m;
    div.onclick=()=>selectMenu(i);
    screen.appendChild(div);
  });
}

function selectMenu(i){
  if(i===0) renderPlaylist();
  if(i===1) fileInput.click();
  if(i===2) pasteLink("spotify");
  if(i===3) pasteLink("apple");
  if(i===4) changeTheme();
}

function renderPlaylist(){
  state="PLAYLIST";
  screen.innerHTML="";
  if(!playlist.length){screen.innerHTML="No tracks";return;}
  playlist.forEach((t,i)=>{
    const div=document.createElement("div");
    div.className="menu-item";
    div.textContent=t.name;
    div.onclick=()=>play(i);
    screen.appendChild(div);
  });
}

function play(i){
  current=i;
  audio.src=playlist[i].url;
  audio.play();
  renderNow();
}

function renderNow(){
  state="NOW";
  const track=playlist[current];
  screen.innerHTML=`
    <div>Now Playing</div>
    <img src="${track.cover||'https://via.placeholder.com/150'}" class="album">
    <div>${track.name}</div>
    <div class="progress-bar"><div class="progress" id="prog"></div></div>
  `;
}

audio.ontimeupdate=()=>{
  const bar=document.getElementById("prog");
  if(bar){
    bar.style.width=(audio.currentTime/audio.duration*100)+"%";
  }
};

fileInput.addEventListener("change",e=>{
  const files=[...e.target.files];
  files.forEach(f=>{
    playlist.push({
      name:f.name.replace(".mp3",""),
      url:URL.createObjectURL(f),
      cover:null
    });
  });
  renderPlaylist();
});

audio.onended=()=>{
  if(current<playlist.length-1){
    current++;
    play(current);
  }
};

function pasteLink(type){
  const url=prompt("Link yapıştır");
  if(!url)return;
  if(type==="spotify"){
    const id=url.split("track/")[1]?.split("?")[0];
    screen.innerHTML=`
      <iframe style="border-radius:12px"
      src="https://open.spotify.com/embed/track/${id}"
      width="100%" height="152" frameborder="0"
      allow="autoplay"></iframe>`;
  }
  if(type==="apple"){
    screen.innerHTML=`
      <iframe allow="autoplay *; encrypted-media *;"
      frameborder="0" height="152"
      style="width:100%;border-radius:12px;"
      src="${url}"></iframe>`;
  }
}

function changeTheme(){
  document.documentElement.style.setProperty("--device","#1c2d5a");
}

function updateClock(){
  const d=new Date();
  clockEl.textContent=d.getHours().toString().padStart(2,"0")+":"+
                      d.getMinutes().toString().padStart(2,"0");
}
setInterval(updateClock,1000);
updateClock();

renderMenu();
