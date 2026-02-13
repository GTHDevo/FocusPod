const state={
screen:"menu",
selected:0,
menu:["Music","Upload","Spotify","Apple","Settings"],
playlist:[],
current:0,
audio:null
}

const content=document.getElementById("content")
const fileInput=document.getElementById("fileInput")

/* BOOT */
setTimeout(()=>{
document.getElementById("boot").classList.add("hidden")
document.getElementById("stage").classList.remove("hidden")
renderMenu()
},2600)

/* CLOCK */
function updateClock(){
const d=new Date()
document.getElementById("clock").textContent=
d.getHours().toString().padStart(2,"0")+":"+
d.getMinutes().toString().padStart(2,"0")
}
setInterval(updateClock,1000)
updateClock()

/* MENU */
function renderMenu(){
content.innerHTML=""
state.menu.forEach((m,i)=>{
const div=document.createElement("div")
div.className="item"+(i===state.selected?" selected":"")
div.textContent=m
content.appendChild(div)
})
}

function navigate(d){
state.selected=(state.selected+d+state.menu.length)%state.menu.length
renderMenu()
}

/* OPEN */
function openItem(){
const choice=state.menu[state.selected]

if(choice==="Upload") fileInput.click()

if(choice==="Music"){
if(state.playlist.length===0){
content.innerHTML="<div>No Music</div>"
}else{
playTrack(state.current)
}
}

if(choice==="Spotify"){
const link=prompt("Spotify link:")
if(link){
const id=link.split("/track/")[1]?.split("?")[0]
if(id){
content.innerHTML=
`<iframe style="width:100%;height:100%" 
src="https://open.spotify.com/embed/track/${id}" frameborder="0"></iframe>`
}
}
}

if(choice==="Apple"){
const link=prompt("Apple Music embed link:")
if(link){
content.innerHTML=
`<iframe style="width:100%;height:100%" 
src="${link}" frameborder="0"></iframe>`
}
}

if(choice==="Settings") showSettings()
}

/* MUSIC */
fileInput.onchange=(e)=>{
const file=e.target.files[0]
if(!file)return
const url=URL.createObjectURL(file)
state.playlist.push({name:file.name,url})
}

function playTrack(i){
state.current=i
if(state.audio) state.audio.pause()
state.audio=new Audio(state.playlist[i].url)
state.audio.play()

content.innerHTML=
`<div>${state.playlist[i].name}</div>
<div class="progress"><div class="progress-bar" id="prog"></div></div>`

state.audio.ontimeupdate=()=>{
const percent=(state.audio.currentTime/state.audio.duration)*100
document.getElementById("prog").style.width=percent+"%"
}
}

/* SETTINGS */
function showSettings(){
content.innerHTML=
`<div class="item">Classic Black</div>
<div class="item">White</div>
<div class="item">Parlament Blue</div>
<div class="item">Custom HEX</div>
<div class="item">Fullscreen</div>`
}

/* BUTTONS */
document.getElementById("menuBtn").onclick=renderMenu
document.getElementById("centerBtn").onclick=openItem
document.getElementById("prevBtn").onclick=()=>navigate(-1)
document.getElementById("nextBtn").onclick=()=>navigate(1)
document.getElementById("playBtn").onclick=()=>{
if(state.audio)
state.audio.paused?state.audio.play():state.audio.pause()
}

/* REAL WHEEL */
let startAngle=null
const wheel=document.getElementById("wheel")

wheel.addEventListener("pointerdown",e=>{
startAngle=getAngle(e)
wheel.setPointerCapture(e.pointerId)
})

wheel.addEventListener("pointermove",e=>{
if(startAngle===null)return
let current=getAngle(e)
let diff=current-startAngle
if(Math.abs(diff)>15){
navigate(diff>0?1:-1)
startAngle=current
}
})

wheel.addEventListener("pointerup",()=>startAngle=null)

function getAngle(e){
const rect=wheel.getBoundingClientRect()
const cx=rect.left+rect.width/2
const cy=rect.top+rect.height/2
return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI
}
