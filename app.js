const menuItems = document.querySelectorAll('#menu li');
let selectedIndex = 0;

function updateMenu() {
  menuItems.forEach((li,i) => {
    li.classList.toggle('selected', i===selectedIndex);
  });
}

updateMenu();

// Wheel click simulation
document.querySelector('#wheel-right').addEventListener('click', () => {
  selectedIndex = (selectedIndex+1) % menuItems.length;
  updateMenu();
});
document.querySelector('#wheel-left').addEventListener('click', () => {
  selectedIndex = (selectedIndex-1 + menuItems.length) % menuItems.length;
  updateMenu();
});
document.querySelector('#wheel-select').addEventListener('click', () => {
  const selected = menuItems[selectedIndex].textContent;
  if(selected === 'Spotify' || selected === 'Apple') {
    document.querySelector('#music-modal').classList.remove('hidden');
  }
});
document.querySelector('#save-link').addEventListener('click', () => {
  document.querySelector('#music-modal').classList.add('hidden');
});
document.querySelector('#cancel-link').addEventListener('click', () => {
  document.querySelector('#music-modal').classList.add('hidden');
});
