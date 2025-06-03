// Diese JavaScript-Datei enthält alle Funktionen, um die Fenster zu öffnen, zu minimieren, zu maximieren und die Uhr zu aktualisieren.

// Variable, um den Zustand (normal/größe verändert) jedes Fensters zu speichern
const windowState = {};

/**
 * Öffnet ein App-Fenster: setzt die Klasse "show" und zentriert das Fenster.
 * @param {string} id - Die ID des Fensters (z. B. "youtube", ohne "-window").
 */
function openApp(id) {
  const win = document.getElementById(`${id}-window`);
  if (!win) return;

  // Fenster sichtbar machen
  win.classList.add('show');

  // Standardgröße zurücksetzen
  win.style.width = '';
  win.style.height = '';

  // Positionierung in die Mitte des Bildschirms
  win.style.top = `${(window.innerHeight - win.offsetHeight) / 2}px`;
  win.style.left = `${(window.innerWidth - win.offsetWidth) / 2}px`;

  // Aktiv-Status in der Taskbar markieren
  document.querySelectorAll(`.app-icon.${id}`).forEach(icon => {
    icon.classList.add('active');
  });

  // Zustand speichern
  windowState[id] = { maximized: false };
}

/**
 * Minimiert das App-Fenster (versteckt es).
 * @param {string} id
 */
function minimizeApp(id) {
  const win = document.getElementById(`${id}-window`);
  if (!win) return;
  win.classList.remove('show');
  document.querySelectorAll(`.app-icon.${id}`).forEach(icon => {
    icon.classList.remove('active');
  });
}

/**
 * Schließt das App-Fenster (identisch mit Minimieren).
 * @param {string} id
 */
function closeApp(id) {
  minimizeApp(id);
}

/**
 * Maximiert oder setzt das App-Fenster in seine Normalgröße zurück.
 * @param {string} id
 */
function toggleMaximize(id) {
  const win = document.getElementById(`${id}-window`);
  if (!win) return;

  if (!windowState[id]) windowState[id] = { maximized: false };

  if (!windowState[id].maximized) {
    // Fenster maximieren
    win.style.top = '20px';
    win.style.left = '20px';
    win.style.width = `${window.innerWidth - 40}px`;
    win.style.height = `${window.innerHeight - 80}px`;
    windowState[id].maximized = true;
  } else {
    // Zurück zur Normalgröße: zentrieren und Standardmaße
    win.style.width = '';
    win.style.height = '';
    win.style.top = `${(window.innerHeight - win.offsetHeight) / 2}px`;
    win.style.left = `${(window.innerWidth - win.offsetWidth) / 2}px`;
    windowState[id].maximized = false;
  }
}

/**
 * Zeigt das Startmenü (hier als Platzhalterfunktion; du kannst an dieser Stelle 
 * dein eigenes Startmenü ergänzen).
 */
function showStartMenu() {
  alert('Startmenü-Funktion momentan nicht implementiert.');
}

/**
 * Zieht das Fenster bei gedrückter Maustaste.
 * Problemstellung: Hier müsste noch ein Drag-&-Drop-Handling implementiert werden. 
 * (Ist als Platzhalter gedacht; eine vollwertige Drag-Funktion kann komplexer sein.)
 */
document.querySelectorAll('.window-header').forEach(header => {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const win = header.parentElement;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      win.style.transition = '';
    }
  });
});

/**
 * Aktualisiert die Uhr (Zeit und Datum) jede Sekunde.
 */
function updateTime() {
  const now = new Date();
  // Optionen für die Datumsanzeige
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('de-DE', dateOptions);

  document.getElementById('current-time').textContent = timeString;
  document.getElementById('current-date').textContent = dateString;
}

// Beim Laden der Seite die Uhr starten und sofort aktualisieren
window.addEventListener('DOMContentLoaded', () => {
  updateTime();
  setInterval(updateTime, 1000);
});
