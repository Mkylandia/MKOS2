document.addEventListener('DOMContentLoaded', () => {
    const appGrid = document.getElementById('app-grid');
    const startMenuApps = document.getElementById('start-menu-apps');
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date-display');
    const startMenuButton = document.getElementById('start-menu-button');
    const startMenu = document.getElementById('start-menu');
    const searchBar = document.getElementById('search-bar');
    const windowContainer = document.getElementById('window-container');

    // App Definitionen
    const apps = [
        { name: 'YouTube', icon: '📺', url: 'https://www.youtube.com', type: 'link' },
        { name: 'Telegram', icon: '✈️', url: 'https://web.telegram.org/', type: 'link' },
        { name: 'Instagram', icon: '📷', url: 'https://www.instagram.com/', type: 'link' },
        { name: 'CrazyGames', icon: '🎮', url: 'https://www.crazygames.com/', type: 'link' },
        { name: 'Films', icon: '🎬', url: 'https://mkylandia.github.io/Films/', type: 'link' },
        { name: 'Films 2', icon: '🎥', url: 'https://mkylandia.github.io/Films2/', type: 'link' },
        { name: 'Google', icon: '🔍', url: 'https://www.google.com', type: 'link' },
        { name: 'Twitter', icon: '🐦', url: 'https://www.twitter.com', type: 'link' },
        { name: 'GitHub', icon: '🐙', url: 'https://www.github.com', type: 'link' },
        { name: 'StackOverflow', icon: '🧱', url: 'https://stackoverflow.com', type: 'link' },
        { name: 'Wikipedia', icon: '📚', url: 'https://www.wikipedia.org', type: 'link' },
        { name: 'Spotify', icon: '🎵', url: 'https://open.spotify.com', type: 'link' },
        { name: 'Notepad++', icon: '📜', url: 'https://notepad-plus-plus.org/', type: 'link' }, // Externer Link
        { name: 'Rechner', icon: '🧮', id: 'calculator-app-window', type: 'internal' },
        { name: 'Notizen', icon: '📝', id: 'notes-app-window', type: 'internal' }
    ];

    // Apps laden
    function loadApps(container, appList, isStartMenu = false) {
        container.innerHTML = ''; // Container leeren
        appList.forEach(app => {
            const appElement = document.createElement(app.type === 'link' ? 'a' : 'div');
            appElement.className = isStartMenu ? 'start-menu-app-item' : 'app';
            if (app.type === 'link') {
                appElement.href = app.url;
                appElement.target = '_blank'; // In neuem Tab öffnen
            } else if (app.type === 'internal') {
                appElement.dataset.appId = app.id;
            }

            const iconClass = isStartMenu ? 'app-icon-sm' : 'app-icon';
            appElement.innerHTML = `
                <div class="${iconClass}">${app.icon}</div>
                <div class="app-name">${app.name}</div>
            `;

            if (app.type === 'internal') {
                appElement.addEventListener('click', () => openInternalApp(app.id));
            }
            container.appendChild(appElement);
        });
    }

    // Initiale App-Ladung
    loadApps(appGrid, apps);
    loadApps(startMenuApps, apps, true);


    // Uhrzeit und Datum aktualisieren
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        clockElement.textContent = timeString;
        dateElement.textContent = dateString;
    }
    updateTime();
    setInterval(updateTime, 1000); // Jede Sekunde aktualisieren

    // Startmenü Funktionalität
    startMenuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Verhindert, dass Klick auf Desktop weitergegeben wird
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
            searchBar.focus();
        }
    });

    // Startmenü schließen, wenn außerhalb geklickt wird
    document.addEventListener('click', (event) => {
        if (!startMenu.contains(event.target) && event.target !== startMenuButton && !startMenu.classList.contains('hidden')) {
            startMenu.classList.add('hidden');
        }
    });

    // App-Suche im Startmenü
    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchTerm));
        loadApps(startMenuApps, filteredApps, true);
    });


    // Interne Apps öffnen/schließen und Fenster-Handling
    function openInternalApp(appId) {
        const appWindow = document.getElementById(appId);
        if (appWindow) {
            appWindow.classList.remove('hidden');
            // Bring window to front (rudimentary)
            const windows = document.querySelectorAll('.app-window');
            windows.forEach(win => win.style.zIndex = '100'); // Reset z-index
            appWindow.style.zIndex = '101'; // Bring active to front
            makeDraggable(appWindow);
            if (startMenu) startMenu.classList.add('hidden'); // Startmenü schließen
        }
    }

    document.querySelectorAll('.window-close-button').forEach(button => {
        button.addEventListener('click', () => {
            const windowId = button.dataset.window;
            document.getElementById(windowId).classList.add('hidden');
        });
    });

    // Fenster verschiebbar machen (Draggable)
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.window-header');

        if (header) {
            header.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown; // Fallback, wenn kein Header
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Mausposition beim Start holen
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            // Bring window to front on drag
            const windows = document.querySelectorAll('.app-window');
            windows.forEach(win => win.style.zIndex = '100');
            element.style.zIndex = '101';
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Neue Position berechnen
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Neue Position des Elements setzen
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            // Grenzen für das Verschieben (innerhalb des Desktops)
            const desktopRect = desktop.getBoundingClientRect();
            const taskbarHeight = document.getElementById('taskbar').offsetHeight;

            if (newTop < 0) newTop = 0;
            if (newLeft < 0) newLeft = 0;
            if (newTop + element.offsetHeight > desktopRect.height - taskbarHeight) {
                newTop = desktopRect.height - taskbarHeight - element.offsetHeight;
            }
            if (newLeft + element.offsetWidth > desktopRect.width) {
                newLeft = desktopRect.width - element.offsetWidth;
            }


            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

        function closeDragElement() {
            // Stoppen, wenn Maustaste losgelassen wird
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Rechner Funktionalität
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.getElementById('calc-buttons');
    let currentInput = '';
    let operator = '';
    let previousInput = '';

    if (calcButtons) {
        calcButtons.addEventListener('click', (event) => {
            const target = event.target;
            if (!target.matches('button')) return;

            const value = target.textContent;

            if (target.id === 'calc-clear') {
                currentInput = '';
                previousInput = '';
                operator = '';
                calcDisplay.textContent = '0';
                return;
            }

            if (target.id === 'calc-equals') {
                if (currentInput && previousInput && operator) {
                    try {
                        const result = eval(`${previousInput} ${operator} ${currentInput}`);
                        calcDisplay.textContent = result;
                        previousInput = result.toString();
                        currentInput = '';
                        operator = '';
                    } catch (e) {
                        calcDisplay.textContent = 'Error';
                        previousInput = ''; currentInput = ''; operator = '';
                    }
                }
                return;
            }

            if (target.classList.contains('op') && value !== '=') {
                 if (currentInput === '' && previousInput === '') return; // Nichts tun, wenn keine Zahl da ist
                if (currentInput !== '' && previousInput !== '' && operator !== '') { // Bereits eine Operation vorhanden, erst berechnen
                     try {
                        const result = eval(`${previousInput} ${operator} ${currentInput}`);
                        previousInput = result.toString();
                        operator = value;
                        currentInput = '';
                        calcDisplay.textContent = previousInput + operator;
                    } catch (e) {
                        calcDisplay.textContent = 'Error';
                        previousInput = ''; currentInput = ''; operator = '';
                    }
                } else if (currentInput !== '') { // Erste Operation
                    operator = value;
                    previousInput = currentInput;
                    currentInput = '';
                    calcDisplay.textContent = previousInput + operator;
                } else if (previousInput !== '') { // Operator ändern
                    operator = value;
                    calcDisplay.textContent = previousInput + operator;
                }
                return;
            }

            // Zahlen und Punkt
            if (value === '.' && currentInput.includes('.')) return; // Nur ein Punkt erlaubt
            currentInput += value;
            calcDisplay.textContent = previousInput + operator + currentInput;
        });
    }

    // Notizen speichern (sehr einfach, nur im localStorage)
    const notesTextarea = document.getElementById('notes-textarea');
    if (notesTextarea) {
        notesTextarea.value = localStorage.getItem('webos-notes') || '';
        notesTextarea.addEventListener('input', () => {
            localStorage.setItem('webos-notes', notesTextarea.value);
        });
    }

    // Fenster beim Klick nach vorne bringen
    windowContainer.addEventListener('mousedown', (event) => {
        const clickedWindow = event.target.closest('.app-window');
        if (clickedWindow) {
            const windows = document.querySelectorAll('.app-window');
            windows.forEach(win => win.style.zIndex = '100'); // Reset z-index
            clickedWindow.style.zIndex = '101'; // Bring active to front
        }
    }, true); // Capture phase to ensure this runs before drag's mousedown

});
