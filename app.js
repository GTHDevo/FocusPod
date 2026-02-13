// Menu Logic
const menuItems = document.querySelectorAll('.menu-item');
let currentScreen = 'music';

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        currentScreen = item.dataset.screen;
        renderScreen(currentScreen);
    });
});

function renderScreen(screen){
    const content = document.getElementById('content-screen');
    content.innerHTML = '';
    if(screen==='music'){
        content.innerHTML = '<p>Music Player</p>';
    } else if(screen==='upload'){
        content.innerHTML = '<p>Upload your MP3</p>';
    } else if(screen==='spotify'){
        content.innerHTML = '<p>Spotify Embed</p>';
    } else if(screen==='apple'){
        content.innerHTML = '<p>Apple Music Embed</p>';
    } else if(screen==='settings'){
        content.innerHTML = '<p>Settings</p>';
    }
}

// Clock
function updateClock(){
    const now = new Date();
    const clock = document.getElementById('clock');
    clock.textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}
setInterval(updateClock,1000);
updateClock();

// Wheel Buttons
document.getElementById('wheel-button-menu').addEventListener('click', ()=>{
    renderScreen('music');
    menuItems.forEach(i=>i.classList.remove('selected'));
    menuItems[0].classList.add('selected');
});

// Theme System
const pod = document.getElementById('pod-body');
const themes = ['theme-classic-white','theme-black','theme-blue','theme-pink','theme-green','theme-purple','theme-orange','theme-produced-red'];

function setTheme(name){
    pod.className = '';
    pod.classList.add(name);
}

// Embed modal
const embedModal = document.getElementById('embed-modal');
const embedInput = document.getElementById('embed-input');
const embedSave = document.getElementById('embed-save');
const embedCancel = document.getElementById('embed-cancel');

document.getElementById('menu-list').addEventListener('click', (e)=>{
    if(e.target.dataset.screen==='spotify' || e.target.dataset.screen==='apple'){
        embedModal.classList.remove('hidden');
    }
});

embedCancel.addEventListener('click', ()=>{
    embedModal.classList.add('hidden');
});
embedSave.addEventListener('click', ()=>{
    const val = embedInput.value.trim();
    if(val!==''){
        alert('Link saved: '+val); // placeholder for embed logic
    }
    embedModal.classList.add('hidden');
});
