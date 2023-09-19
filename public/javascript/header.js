const toggleBtn = document.querySelector('.nav-button')
const menu = document.querySelector('.nav-toggle-button')

toggleBtn.addEventListener('click', () => {
  menu.classList.toggle('active');
});