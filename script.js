let windowZIndex = 1000;
const originalSizes = {};
let activeApp = null;
let contextApp = null;

function openApp(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  appWindow.classList.remove('hide');
  appWindow.classList.add('show');
  appWindow.style.display = 'block';
  appWindow.style.zIndex = ++windowZIndex;
  activeApp = appName;

  const width = Math.min(850, window.innerWidth * 0.85);
  const height = Math.min(650, window.innerHeight * 0.85);
  const leftPos = (window.innerWidth - width) / 2;
  const topPos = (window.innerHeight - height) / 2;
  appWindow.style.left = `${Math.max(leftPos, 20)}px`;
  appWindow.style.top = `${Math.max(topPos, 20)}px`;
  appWindow.style.width = `${width}px`;
  appWindow.style.height = `${height}px`;

  appWindow.dataset.maximized = "false";
  appWindow.dataset.minimized = "false";
  makeDraggable(appWindow);
  updateTaskbar();
}

function closeApp(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  appWindow.classList.remove('show');
  appWindow.classList.add('hide');
  setTimeout(() => {
    appWindow.classList.remove('hide');
    appWindow.style.display = 'none';
    if (activeApp === appName) activeApp = null;
    updateTaskbar();
  }, 300);
}

function minimizeApp(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  appWindow.classList.add('hide');
  setTimeout(() => {
    appWindow.style.display = 'none';
    appWindow.dataset.minimized = "true";
    if (activeApp === appName) activeApp = null;
    updateTaskbar();
  }, 300);
}

function toggleMaximize(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  if (appWindow.dataset.maximized === "true") {
    const original = JSON.parse(originalSizes[appName]);
    appWindow.style.left = original.left;
    appWindow.style.top = original.top;
    appWindow.style.width = original.width;
    appWindow.style.height = original.height;
    appWindow.dataset.maximized = "false";
    appWindow.style.borderRadius = "20px";
  } else {
    originalSizes[appName] = JSON.stringify({
      left: appWindow.style.left,
      top: appWindow.style.top,
      width: appWindow.style.width,
      height: appWindow.style.height
    });
    appWindow.style.left = "2vw";
    appWindow.style.top = "2vh";
    appWindow.style.width = "96vw";
    appWindow.style.height = "96vh";
    appWindow.dataset.maximized = "true";
    appWindow.style.borderRadius = "10px";
  }
  updateTaskbar();
}

function makeDraggable(element) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
  const header = element.querySelector('.window-header');
  element.style.display = 'block';
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (element.dataset.maximized === "true") return;
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    element.style.zIndex = ++windowZIndex;
    activeApp = element.id.replace('-window', '');
    updateTaskbar();
  }

  function elementDrag(e) {
    e.preventDefault();
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    let newLeft = element.offsetLeft - posX;
    let newTop = element.offsetTop - posY;

    // Window snapping
    const snapThreshold = 20;
    if (newLeft < snapThreshold) newLeft = 0;
    if (newTop < snapThreshold) newTop = 0;
    if (window.innerWidth - newLeft - element.offsetWidth < snapThreshold) {
      newLeft = window.innerWidth - element.offsetWidth;
    }
    if (window.innerHeight - newTop - element.offsetHeight < snapThreshold) {
      newTop = window.innerHeight - element.offsetHeight;
    }

    element.style.left = newLeft + "px";
    element.style.top = newTop + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function openURL(url) {
  window.open(url, "_blank");
}

function searchYouTube() {
  const query = document.getElementById("youtube-search").value.trim();
  if (!query) {
    openURL('https://www.youtube.com');
    return;
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(query)) {
    const embedUrl = `https://www.youtube.com/embed/${query}`;
    document.getElementById("video-container").innerHTML =
      `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
  }
}

function connectNextcloud() {
  const url = document.getElementById("nextcloud-url").value.trim();
  if (!url) {
    document.getElementById("nextcloud-files").innerHTML = "Bitte gib eine Nextcloud-URL ein.";
    return;
  }
  document.getElementById("nextcloud-files").innerHTML = `<iframe src="${url}" title="Nextcloud"></iframe>`;
}

function changeTheme() {
  const theme = document.getElementById("theme-selector").value;
  document.body.classList.toggle('dark', theme === 'dark');
}

function changeWallpaper() {
  const url = document.getElementById("wallpaper-url").value.trim();
  if (url) {
    document.querySelector('.desktop').style.background = `url('${url}') no-repeat center center/cover`;
  }
}

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const dateString = now.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  document.getElementById("current-time").textContent = timeString;
  document.getElementById("current-date").textContent = dateString;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.window').forEach(win => makeDraggable(win));
  document.querySelectorAll('.desktop-icon, .app-icon:not(.start-button), .start-menu-app').forEach(icon => {
    icon.addEventListener('click', () => openApp(icon.dataset.app));
  });
  document.querySelectorAll('.window-control.close').forEach(btn => {
    btn.addEventListener('click', () => closeApp(btn.dataset.app));
  });
  document.querySelectorAll('.window-control.maximize').forEach(btn => {
    btn.addEventListener('click', () => toggleMaximize(btn.dataset.app));
  });
  document.querySelectorAll('.window-control.minimize').forEach(btn => {
    btn.addEventListener('click', () => minimizeApp(btn.dataset.app));
  });
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      contextApp = icon.dataset.app;
      const menu = document.getElementById('context-menu');
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      menu.classList.add('show');
    });
  });
  document.addEventListener('click', () => {
    document.getElementById('context-menu').classList.remove('show');
    document.getElementById('start-menu').classList.remove('show');
  });

  updateTime();
  setInterval(updateTime, 1000);
});
