const menuItems = document.querySelectorAll('.menu-item');
let selectedIndex = 0;

function updateMenu() {
    menuItems.forEach((li,i) => li.classList.toggle('selected', i===selectedIndex));
}
updateMenu();

document.querySelector('#wheel-button-right').addEventListener('click', ()=>{
    selectedIndex = (selectedIndex+1) % menuItems.length;
    updateMenu();
});
document.querySelector('#wheel-button-prev').addEventListener('click', ()=>{
    selectedIndex = (selectedIndex-1+menuItems.length) % menuItems.length;
    updateMenu();
});
document.querySelector('#wheel-button-select').addEventListener('click', ()=>{
    const selected = menuItems[selectedIndex].dataset.screen;
    if(selected==='spotify' || selected==='apple'){
        document.getElementById('embed-modal').classList.add('visible');
    }
});

document.getElementById('embed-cancel').addEventListener('click', ()=>{
    document.getElementById('embed-modal').classList.remove('visible');
});
document.getElementById('embed-save').addEventListener('click', ()=>{
    const val = document.getElementById('embed-input').value.trim();
    if(val!==''){
        alert('Link saved: '+val);
    }
    document.getElementById('embed-modal').classList.remove('visible');
});

// Clock
function updateClock(){
    const now = new Date();
    document.getElementById('clock').textContent = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
}
setInterval(updateClock,1000);
updateClock();

// Theme switch example
const pod = document.getElementById('pod-body');
function setTheme(name){
    pod.className = '';
    pod.classList.add(name);
}
