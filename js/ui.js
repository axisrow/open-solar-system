// UI module - handles all UI interactions and updates
import * as THREE from 'three';

let state = null;

export function setupUI(appState) {
    state = appState;

    setupTimeControls();
    setupNavigationControls();
    setupSettingsControls();
    setupPanelToggle();
    setupKeyboardShortcuts();
}

function setupTimeControls() {
    const btnPause = document.getElementById('btn-pause');
    const btnFaster = document.getElementById('btn-faster');
    const btnSlower = document.getElementById('btn-slower');
    const btnReverse = document.getElementById('btn-reverse');
    const btnRealtime = document.getElementById('btn-realtime');

    btnPause.addEventListener('click', () => {
        state.timeController.togglePause();
    });

    btnFaster.addEventListener('click', () => {
        state.timeController.faster();
    });

    btnSlower.addEventListener('click', () => {
        state.timeController.slower();
    });

    btnReverse.addEventListener('click', () => {
        state.timeController.reverse();
    });

    btnRealtime.addEventListener('click', () => {
        state.timeController.realtime();
    });
}

function setupNavigationControls() {
    const planetSelect = document.getElementById('planet-select');
    const btnFollow = document.getElementById('btn-follow');
    const btnResetCamera = document.getElementById('btn-reset-camera');

    planetSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (!value) return;

        let target = null;

        if (value === 'sun') {
            target = state.sun;
        } else {
            // Find planet by English name
            target = state.planets.find(p =>
                p.data.nameEn.toLowerCase() === value.toLowerCase()
            );

            // If not found, search in satellites
            if (!target && state.satellites) {
                target = state.satellites.find(s =>
                    s.data.nameEn.toLowerCase() === value.toLowerCase()
                );
            }
        }

        if (target) {
            state.cameraController.flyTo(target);
            if (state.selectedObject !== target) {
                // Import selectObject dynamically to avoid circular dependency
                import('./main.js').then(main => {
                    main.selectObject(target);
                });
            }
        }
    });

    btnFollow.addEventListener('click', () => {
        if (state.selectedObject) {
            state.cameraController.followObject(state.selectedObject);
        }
    });

    btnResetCamera.addEventListener('click', () => {
        state.cameraController.resetCamera();
    });
}

function setupSettingsControls() {
    const showOrbits = document.getElementById('show-orbits');
    const showLabels = document.getElementById('show-labels');
    const showAsteroids = document.getElementById('show-asteroids');
    const showComets = document.getElementById('show-comets');
    const realisticSizes = document.getElementById('realistic-sizes');
    const qualitySelect = document.getElementById('quality-select');

    showOrbits.addEventListener('change', (e) => {
        state.settings.showOrbits = e.target.checked;
        toggleOrbits(e.target.checked);
    });

    showLabels.addEventListener('change', (e) => {
        state.settings.showLabels = e.target.checked;
        document.getElementById('labels-container').style.display =
            e.target.checked ? 'block' : 'none';
    });

    showAsteroids.addEventListener('change', (e) => {
        state.settings.showAsteroids = e.target.checked;
        state.asteroids.forEach(belt => {
            belt.mesh.visible = e.target.checked;
        });
    });

    showComets.addEventListener('change', (e) => {
        state.settings.showComets = e.target.checked;
        state.comets.forEach(comet => {
            comet.group.visible = e.target.checked;
        });
    });

    realisticSizes.addEventListener('change', (e) => {
        state.settings.realisticSizes = e.target.checked;
        updatePlanetSizes(e.target.checked);
    });

    qualitySelect.addEventListener('change', (e) => {
        state.settings.quality = e.target.value;
        updateQuality(e.target.value);
    });
}

function toggleOrbits(show) {
    state.planets.forEach(planet => {
        if (planet.orbitLine) {
            planet.orbitLine.visible = show;
        }
    });

    state.moons.forEach(moon => {
        if (moon.orbitLine) {
            moon.orbitLine.visible = show;
        }
    });

    state.comets.forEach(comet => {
        if (comet.orbitLine) {
            comet.orbitLine.visible = show;
        }
    });
}

function updatePlanetSizes(realistic) {
    // In realistic mode, planets would be nearly invisible
    // So we just reduce their size slightly for a more accurate feel
    const scaleFactor = realistic ? 0.3 : 1;

    state.planets.forEach(planet => {
        if (planet.mesh) {
            planet.mesh.scale.setScalar(scaleFactor);
        }
    });
}

function updateQuality(quality) {
    // Update renderer settings based on quality
    const pixelRatio = {
        'low': 1,
        'medium': Math.min(window.devicePixelRatio, 2),
        'high': window.devicePixelRatio
    };

    state.renderer.setPixelRatio(pixelRatio[quality]);
}

function setupPanelToggle() {
    const toggleBtn = document.getElementById('toggle-settings');
    const settingsContent = document.querySelector('#settings-panel .settings-content');

    let isCollapsed = false;

    toggleBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        settingsContent.style.display = isCollapsed ? 'none' : 'block';
        toggleBtn.textContent = isCollapsed ? '+' : '−';
    });
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                state.timeController.togglePause();
                break;
            case 'ArrowUp':
                state.timeController.faster();
                break;
            case 'ArrowDown':
                state.timeController.slower();
                break;
            case 'ArrowLeft':
                state.timeController.reverse();
                break;
            case 'KeyO':
                document.getElementById('show-orbits').click();
                break;
            case 'KeyL':
                document.getElementById('show-labels').click();
                break;
            case 'KeyH':
                // Show help
                showHelp();
                break;
            case 'Digit1':
                navigateTo('mercury');
                break;
            case 'Digit2':
                navigateTo('venus');
                break;
            case 'Digit3':
                navigateTo('earth');
                break;
            case 'Digit4':
                navigateTo('mars');
                break;
            case 'Digit5':
                navigateTo('jupiter');
                break;
            case 'Digit6':
                navigateTo('saturn');
                break;
            case 'Digit7':
                navigateTo('uranus');
                break;
            case 'Digit8':
                navigateTo('neptune');
                break;
            case 'Digit0':
                navigateTo('sun');
                break;
        }
    });
}

function navigateTo(objectName) {
    let target = null;

    if (objectName === 'sun') {
        target = state.sun;
    } else {
        target = state.planets.find(p =>
            p.data.nameEn.toLowerCase() === objectName.toLowerCase()
        );

        // If not found, search in satellites
        if (!target && state.satellites) {
            target = state.satellites.find(s =>
                s.data.nameEn.toLowerCase() === objectName.toLowerCase()
            );
        }
    }

    if (target) {
        state.cameraController.flyTo(target);
        import('./main.js').then(main => {
            main.selectObject(target);
        });
    }
}

function showHelp() {
    // Create help overlay if not exists
    let helpOverlay = document.querySelector('.help-overlay');

    if (!helpOverlay) {
        helpOverlay = document.createElement('div');
        helpOverlay.className = 'help-overlay';
        helpOverlay.innerHTML = `
            <div class="help-content">
                <h2>Управление</h2>
                <ul>
                    <li><kbd>Мышь</kbd> Вращение и масштабирование</li>
                    <li><kbd>Клик</kbd> Выбор объекта</li>
                    <li><kbd>Двойной клик</kbd> Полёт к объекту</li>
                    <li><kbd>Пробел</kbd> Пауза/Воспроизведение</li>
                    <li><kbd>↑/↓</kbd> Изменение скорости</li>
                    <li><kbd>←</kbd> Обратное время</li>
                    <li><kbd>F</kbd> Режим свободного полёта</li>
                    <li><kbd>WASD</kbd> Движение в свободном полёте</li>
                    <li><kbd>O</kbd> Показать/скрыть орбиты</li>
                    <li><kbd>L</kbd> Показать/скрыть названия</li>
                    <li><kbd>1-8</kbd> Быстрый переход к планетам</li>
                    <li><kbd>0</kbd> Перейти к Солнцу</li>
                    <li><kbd>Esc</kbd> Выход из режима следования</li>
                    <li><kbd>H</kbd> Эта справка</li>
                </ul>
                <p style="margin-top: 20px; text-align: center; color: #888;">
                    Нажмите любую клавишу чтобы закрыть
                </p>
            </div>
        `;
        document.body.appendChild(helpOverlay);
    }

    helpOverlay.classList.add('visible');

    // Close on any key or click
    const closeHelp = () => {
        helpOverlay.classList.remove('visible');
        window.removeEventListener('keydown', closeHelp);
        window.removeEventListener('click', closeHelp);
    };

    setTimeout(() => {
        window.addEventListener('keydown', closeHelp);
        window.addEventListener('click', closeHelp);
    }, 100);
}

// Update labels to follow objects on screen
export function updateLabels(celestialBodies, camera) {
    const container = document.getElementById('labels-container');
    if (!container) return;

    // Create labels if they don't exist
    celestialBodies.forEach(body => {
        if (!body.data) return;

        let label = container.querySelector(`[data-name="${body.data.name}"]`);

        if (!label) {
            label = document.createElement('div');
            label.className = 'object-label';
            if (body.data.type === 'planet') label.classList.add('planet');
            if (body.data.type === 'star') label.classList.add('sun');
            label.dataset.name = body.data.name;
            label.textContent = body.data.name;

            // Click handler for label
            label.addEventListener('click', () => {
                import('./main.js').then(main => {
                    main.selectObject(body);
                    main.state.cameraController.flyTo(body);
                });
            });

            container.appendChild(label);
        }

        // Get world position
        const worldPos = body.getWorldPosition
            ? body.getWorldPosition()
            : (body.mesh ? body.mesh.position.clone() : new THREE.Vector3());

        // Project to screen
        const screenPos = worldPos.clone().project(camera);

        // Check if behind camera
        if (screenPos.z > 1) {
            label.style.display = 'none';
            return;
        }

        // Convert to screen coordinates
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPos.y * -0.5 + 0.5) * window.innerHeight;

        // Check if on screen
        if (x < -100 || x > window.innerWidth + 100 || y < -50 || y > window.innerHeight + 50) {
            label.style.display = 'none';
            return;
        }

        // Check distance for visibility (hide labels of distant small objects)
        const distance = worldPos.distanceTo(camera.position);
        const radius = body.data.radius || 1;
        const apparentSize = radius / distance * 1000;

        if (apparentSize < 0.5 && body.data.type === 'moon') {
            label.style.display = 'none';
            return;
        }

        label.style.display = 'block';
        label.style.left = x + 'px';

        // Calculate label offset
        let labelOffset = (body.data.radius || 5) * 2 + 10;

        // For satellites - move label higher when close (as a title)
        if (body.data.type === 'satellite' && distance < 3) {
            labelOffset = 150;
        }

        label.style.top = (y - labelOffset) + 'px';

        // Scale based on distance
        const scale = Math.min(1, Math.max(0.5, 50 / distance));
        label.style.transform = `translate(-50%, -100%) scale(${scale})`;
    });
}
