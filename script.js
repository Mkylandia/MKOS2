// Zähler, um die Z-Index-Werte nach Bedarf zu erhöhen
let windowZIndex = 1000;
const originalSizes = {}; // speichert ursprüngliche Größe/Position für Maximieren

/**
 * Öffnet das entsprechende Fenster (<appName>-window) mittig im Viewport.
 * @param {string} appName - Der Präfix für die Fenster-ID (z.B. "youtube").
 */
function openApp(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  appWindow.classList.remove('hide');
  appWindow.classList.add('show');
  appWindow.style.display = 'block';
  appWindow.style.zIndex = ++windowZIndex;

  // Standardgröße
  const width = Math.min(800, window.innerWidth - 100);
  const height = Math.min(600, window.innerHeight - 100);

  // Zentriere das Fenster
  const leftPos = (window.innerWidth - width) / 2;
  const topPos = (window.innerHeight - height) / 2;
  appWindow.style.left = `${Math.max(leftPos, 20)}px`;
  appWindow.style.top  = `${Math.max(topPos, 20)}px`;
  appWindow.style.width  = `${width}px`;
  appWindow.style.height = `${height}px`;

  // Stelle sicher, dass maximize zurückgesetzt ist
  appWindow.dataset.maximized = "false";
  makeDraggable(appWindow);
}

/**
 * Schließt ein Fenster (<appName>-window) mit Fade-out-Effekt.
 * @param {string} appName - Der Präfix für die Fenster-ID.
 */
function closeApp(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  appWindow.classList.remove('show');
  appWindow.classList.add('hide');
  setTimeout(() => {
    appWindow.classList.remove('hide');
    appWindow.style.display = 'none';
  }, 200);
}

/**
 * Öffnet eine externe URL in einem neuen Tab.
 * @param {string} url - Vollständige URL, die geöffnet werden soll.
 */
function openURL(url) {
  window.open(url, "_blank");
}

/**
 * Ermöglicht Drag & Drop für das gegebene Fenster-Element.
 * Drag-Handle ist die .window-header.
 * @param {HTMLElement} element
 */
function makeDraggable(element) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
  const header = element.querySelector('.window-header');

  // Stellen sicher, dass element block-display hat, damit offsetWidth/Height korrekt sind
  element.style.display = 'block';

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (element.dataset.maximized === "true") return; // nicht draggable, wenn maximiert
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    element.style.top  = (element.offsetTop - posY) + "px";
    element.style.left = (element.offsetLeft - posX) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Öffnet bei Enter im Suchfeld eine Google-Suche in einem neuen Tab.
 * @param {KeyboardEvent} event
 */
function googleSearch(event) {
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    if (query) {
      openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      event.target.value = '';
    }
  }
}

/**
 * Zeigt eine Willkommensnachricht, wenn der Start-Button geklickt wird.
 */
function showStartMenu() {
  alert("MKOS V2 – Willkommen im erweiterten Desktop-Erlebnis! 🚀");
}

/**
 * Lädt den Wikipedia-Artikel „Deutschland“ per API ins Fenster.
 */
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

/**
 * Sucht auf YouTube nach einer Video-ID oder öffnet die Hauptseite.
 * Validiert 11-stellige IDs, sonst öffnet YouTube-Suchergebnisse.
 */
function searchYouTube() {
  const query = document.getElementById("youtube-search").value.trim();
  if (!query) {
    openURL('https://www.youtube.com');
    return;
  }
  // Wenn es aussieht wie Video-ID (11 alphanumerische Zeichen), direkt einbetten
  if (/^[A-Za-z0-9_-]{11}$/.test(query)) {
    const embedUrl = `https://www.youtube.com/embed/${query}`;
    document.getElementById("video-container").innerHTML =
      `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    // Ansonsten YouTube-Suchergebnisse öffnen
    openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
  }
}

/**
 * Rechnerfunktionen: Zeichen anhängen, Ergebnis berechnen, löschen.
 */
function appendCalc(value) {
  const display = document.getElementById("calc-display");
  display.value += value;
}

function calculateResult() {
  const display = document.getElementById("calc-display");
  try {
    // eslint-disable-next-line no-eval
    display.value = eval(display.value) ?? "";
  } catch {
    display.value = "Fehler";
  }
}

function clearCalc() {
  document.getElementById("calc-display").value = "";
}

/**
 * Notizen herunterladen als Textdatei.
 */
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

/**
 * Maximiert ein Fenster auf fast Vollbild und merkt sich Originalgröße/Position.
 * Zweiter Aufruf stellt zurück.
 */
function toggleMaximize(appName) {
  const appWindow = document.getElementById(`${appName}-window`);
  if (!appWindow) return;

  if (appWindow.dataset.maximized === "true") {
    // Wiederherstellen
    const original = JSON.parse(originalSizes[appName]);
    appWindow.style.left = original.left;
    appWindow.style.top = original.top;
    appWindow.style.width = original.width;
    appWindow.style.height = original.height;
    appWindow.dataset.maximized = "false";
    appWindow.style.borderRadius = "12px";
  } else {
    // Speichere aktuelle Größe/Position
    originalSizes[appName] = JSON.stringify({
      left: appWindow.style.left,
      top: appWindow.style.top,
      width: appWindow.style.width,
      height: appWindow.style.height
    });
    // Vollbild (fast)
    appWindow.style.left = "5vw";
    appWindow.style.top = "5vh";
    appWindow.style.width = "90vw";
    appWindow.style.height = "90vh";
    appWindow.dataset.maximized = "true";
    appWindow.style.borderRadius = "6px";
  }
}

// Initialisierung: Uhrzeit-Update alle Sekunde
updateTime();
setInterval(updateTime, 1000);

// Wikipedia-Artikel sofort laden, damit beim Öffnen schon Inhalt steht
loadWikipediaArticle();

/**
 * Aktualisiert die aktuelle Uhrzeit und das Datum im Widget.
 */
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
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
  document.querySelectorAll('.window').forEach(win => {
    makeDraggable(win);
  });
});
