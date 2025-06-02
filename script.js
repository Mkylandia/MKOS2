document.addEventListener('DOMContentLoaded', () => {
  let windowZIndex = 1;

  function openApp(appName) {
    const appWindow = document.getElementById(`${appName}-window`);
    if (!appWindow) {
      console.error(`Window für App ${appName} nicht gefunden.`);
      return;
    }

    appWindow.classList.remove('hide');
    appWindow.classList.add('show');
    appWindow.style.display = 'block';
    appWindow.style.zIndex = ++windowZIndex;

    const width = Math.min(850, window.innerWidth * 0.85);
    const height = Math.min(650, window.innerHeight * 0.85);
    const leftPos = (window.innerWidth - width) / 2;
    const topPos = (window.innerHeight - height) / 2;
    appWindow.style.left = `${Math.max(leftPos, 20)}px`;
    appWindow.style.top = `${Math.max(topPos, 20)}px`;
    appWindow.style.width = `${width}px`;
    appWindow.style.height = `${height}px`;

    makeDraggable(appWindow);
  }

  function makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    element.querySelector('.window-header').addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      element.style.zIndex = ++windowZIndex;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    currentX = parseInt(element.style.left) || 0;
    currentY = parseInt(element.style.top) || 0;
  }

  document.querySelectorAll('.desktop-icon, .app-icon:not(.start-button), .start-menu-app').forEach(icon => {
    icon.addEventListener('click', () => openApp(icon.dataset.app));
  });

  const startButton = document.querySelector('.start-button');
  const startMenu = document.querySelector('.start-menu');
  startButton.addEventListener('click', () => {
    startMenu.classList.toggle('hide');
  });

  document.querySelectorAll('.window-control.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const appWindow = closeBtn.closest('.window');
      appWindow.classList.remove('show');
      appWindow.classList.add('hide');
    });
  });

  function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  updateClock();
});
