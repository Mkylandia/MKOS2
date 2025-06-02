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

  const width = Math.min(800, window.innerWidth * 0.8);
  const height = Math.min(600, window.innerHeight * 0.8);
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
  }, 200);
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
  }, 200);
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
    appWindow.style.borderRadius = "12px";
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
    appWindow.style.borderRadius = "8px";
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
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - element.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - element.offsetHeight));
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

function googleSearch(event) {
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    if (query) {
      openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      event.target.value = '';
    }
  }
}

function toggleStartMenu() {
  const startMenu = document.getElementById('start-menu');
  startMenu.classList.toggle('show');
}

function loadWikipediaArticle() {
  const endpoint = "https://de.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=Deutschland&format=json&origin=*";
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      const page = Object.values(data.query.pages)[0];
      document.getElementById("wiki-content").innerHTML = page.extract;
    })
    .catch(() => {
      document.getElementById("wiki-content").textContent = "Fehler beim Laden des Artikels.";
    });
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

function appendCalc(value) {
  const display = document.getElementById("calc-display");
  display.value += value;
}

function calculateResult() {
  const display = document.getElementById("calc-display");
  try {
    display.value = eval(display.value) ?? "";
  } catch {
    display.value = "Fehler";
  }
}

function clearCalc() {
  document.getElementById("calc-display").value = "";
}

function backspaceCalc() {
  const display = document.getElementById("calc-display");
  display.value = display.value.slice(0, -1);
}

function downloadNotes() {
  const content = document.getElementById("notes-area").value;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notizen.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function previewCode() {
  const code = document.getElementById("code-editor").value;
  const preview = document.getElementById("code-preview");
  try {
    preview.innerHTML = code;
  } catch {
    preview.innerHTML = "<p>Fehler in der Vorschau</p>";
  }
}

function updateTaskbar() {
  document.querySelectorAll('.app-icon:not(.start-button)').forEach(icon => {
    const appName = icon.dataset.app;
    const appWindow = document.getElementById(`${appName}-window`);
    if (appWindow && appWindow.style.display === 'block') {
      icon.classList.add('active');
    } else {
      icon.classList.remove('active');
    }
  });
}

function openAppFromContext() {
  if (contextApp) openApp(contextApp);
}

function openURLFromContext() {
  if (contextApp) {
    const urls = {
      youtube: 'https://www.youtube.com',
      telegram: 'https://web.telegram.org',
      instagram: 'https://www.instagram.com',
      crazygames: 'https://www.crazygames.com',
      films: 'https://mkylandia.github.io/Films/',
      films2: 'https://mkylandia.github.io/Films2/',
      google: 'https://www.google.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
      stackoverflow: 'https://stackoverflow.com',
      wikipedia: 'https://de.wikipedia.org',
      spotify: 'https://open.spotify.com'
    };
    if (urls[contextApp]) openURL(urls[contextApp]);
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
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      const shortcuts = {
        'y': 'youtube',
        't': 'telegram',
        'i': 'instagram',
        'c': 'crazygames',
        'f': 'films',
        'g': 'google',
        'w': 'twitter',
        'h': 'github',
        's': 'stackoverflow',
        'k': 'wikipedia',
        'r': 'calculator',
        'n': 'notes',
        'p': 'spotify',
        'e': 'notepad',
        'd': 'filemanager'
      };
      if (shortcuts[e.key]) openApp(shortcuts[e.key]);
    }
  });

  updateTime();
  setInterval(updateTime, 1000);
  loadWikipediaArticle();
});
