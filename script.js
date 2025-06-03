/**
 * script.js
 * Enthält alle Funktionen, um Fenster zu öffnen, zu minimieren, zu maximieren,
 * Drag‐&‐Drop (Verschieben), sowie eine live‐Uhr oben rechts.
 */

const windowState = {}; // Speichert für jedes Fenster, ob es maximiert ist

/**
 * Öffnet ein App-Fenster, wenn man auf Icon oder Taskbar klickt.
 * @param {string} appId - z. B. "youtube", "telegram" etc.
 */
function openApp(appId) {
  const win = document.getElementById(`${appId}-window`);
  if (!win) return;

  // Falls bereits offen, bringe es in den Vordergrund
  if (win.classList.contains('show')) {
    // Nur in den Vordergrund, ohne es neu zu positionieren
    bringToFront(win);
    return;
  }

  // Setze Klasse "show"
  win.classList.add('show');

  // Setze z-index so, dass dieses Fenster ganz vorn ist
  bringToFront(win);

  // Setze Initialgröße zurück, falls es vorher maximiert war
  win.style.width = '';
  win.style.height = '';
  windowState[appId] = { maximized: false };

  // Zentriere das Fenster beim ersten Öffnen
  win.style.top = `${(window.innerHeight - win.offsetHeight) / 2}px`;
  win.style.left = `${(window.innerWidth - win.offsetWidth) / 2}px`;

  // Aktiviere den Taskbar-Icon-Indikator
  document.querySelectorAll(`.app-icon.${appId}`).forEach(el => el.classList.add('active'));
}

/**
 * Minimiert/versteckt ein App-Fenster.
 * @param {string} appId
 */
function minimizeApp(appId) {
  const win = document.getElementById(`${appId}-window`);
  if (!win) return;
  win.classList.remove('show');
  // Deaktiviere den Taskbar-Icon-Indikator
  document.querySelectorAll(`.app-icon.${appId}`).forEach(el => el.classList.remove('active'));
}

/**
 * Schließt ein App-Fenster, identisch wie minimize.
 * @param {string} appId
 */
function closeApp(appId) {
  minimizeApp(appId);
}

/**
 * Maximiert oder setzt ein Fenster auf Normalgröße zurück.
 * @param {string} appId
 */
function toggleMaximize(appId) {
  const win = document.getElementById(`${appId}-window`);
  if (!win) return;

  if (!windowState[appId]) windowState[appId] = { maximized: false };

  if (!windowState[appId].maximized) {
    // Fenster maximieren: fast den ganzen Viewport nutzen
    win.style.top = '20px';
    win.style.left = '20px';
    win.style.width = `${window.innerWidth - 40}px`;
    win.style.height = `${window.innerHeight - 80}px`;
    windowState[appId].maximized = true;
  } else {
    // Zurück zur Normalgröße: zentrieren und CSS‐Standardgröße (leer = auto)
    win.style.width = '';
    win.style.height = '';
    win.style.top = `${(window.innerHeight - win.offsetHeight) / 2}px`;
    win.style.left = `${(window.innerWidth - win.offsetWidth) / 2}px`;
    windowState[appId].maximized = false;
  }
}

/**
 * Bringt das gegebene DOM-Element (Fenster) in den Vordergrund.
 * @param {Element} element
 */
function bringToFront(element) {
  // Finde das aktuell höchste z-index, und setze das neue etwas darüber
  const windows = document.querySelectorAll('.window.show');
  let topZ = 500;
  windows.forEach(w => {
    const z = parseInt(getComputedStyle(w).zIndex) || 0;
    if (z > topZ) topZ = z;
  });
  element.style.zIndex = topZ + 1;
}

/**
 * Setzt alle Event-Listener, wenn DOM geladen ist.
 */
window.addEventListener('DOMContentLoaded', () => {
  // ======= Öffnen per Klick auf Desktop-Icons und Taskbar-Icons =======
  document.querySelectorAll('.desktop-icon, .app-icon').forEach(el => {
    const appId = el.getAttribute('data-app');
    if (!appId) return; // Start-Button hat kein data-app
    el.addEventListener('click', () => openApp(appId));
  });

  // ======= Fenster-Steuerung: Minimize / Maximize / Close =======
  document.querySelectorAll('.window-control').forEach(control => {
    const action = control.getAttribute('data-action');
    const appId = control.getAttribute('data-app');
    control.addEventListener('click', () => {
      if (action === 'minimize') minimizeApp(appId);
      if (action === 'close')     closeApp(appId);
      if (action === 'toggleMaximize') toggleMaximize(appId);
    });
  });

  // ======= Drag-&-Drop: Fenster-Verschieben =======
  document.querySelectorAll('.window-header').forEach(header => {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const win = header.parentElement;

    header.addEventListener('mousedown', e => {
      // Nur linken Button behandeln
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.style.transition = 'none'; // während Drag nicht animieren
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      // Optional: Begrenze das Verschieben, damit Fenster nicht komplett außerhalb landen
      const maxX = window.innerWidth - win.offsetWidth;
      const maxY = window.innerHeight - win.offsetHeight;
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        win.style.transition = ''; // Animation wieder aktivieren
      }
    });
  });

  // ======= Spinner ausblenden, sobald <iframe> geladen ist =======
  document.querySelectorAll('.window-content iframe').forEach(frame => {
    frame.addEventListener('load', () => {
      // Verstecke das vorherige .loading-Element, und zeige das iframe
      const loadingDiv = frame.previousElementSibling;
      if (loadingDiv && loadingDiv.classList.contains('loading')) {
        loadingDiv.style.display = 'none';
      }
      frame.style.display = 'block';
    });
  });

  // ======= Uhr initialisieren und jede Sekunde aktualisieren =======
  function updateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('de-DE', dateOptions);
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
  }
  updateTime();
  setInterval(updateTime, 1000);

  // ======= Start-Button: Platzhalter =======
  document.getElementById('start-button').addEventListener('click', () => {
    alert('Startmenü-Funktion ist hier nur Platzhalter.');
  });
});
