// Main entry point for Solar System Simulator
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { createScene, createCamera, createRenderer, createLights } from './scene.js';
import { createStarField } from './effects.js';
import { createSun } from './sun.js';
import { createPlanets, createDwarfPlanets } from './planets.js';
import { createMoons } from './moons.js';
import { createSatellites } from './satellites.js';
import { createAsteroidBelts } from './asteroids.js';
import { createComets } from './comets.js';
import { setupUI, updateLabels } from './ui.js';
import { TimeController } from './time.js';
import { CameraController } from './controls.js';

// Global state
const state = {
    scene: null,
    camera: null,
    renderer: null,
    labelRenderer: null,
    composer: null,
    controls: null,
    cameraController: null,
    timeController: null,
    celestialBodies: [],
    planets: [],
    moons: [],
    satellites: [],
    asteroids: null,
    comets: [],
    sun: null,
    selectedObject: null,
    hoveredObject: null,
    clock: new THREE.Clock(),
    settings: {
        showOrbits: true,
        showLabels: true,
        showAsteroids: true,
        showComets: true,
        realisticSizes: false,
        quality: 'medium'
    }
};

// Initialize the application
async function init() {
    // Create scene
    state.scene = createScene();

    // Create camera
    state.camera = createCamera();

    // Create renderer
    state.renderer = createRenderer();
    document.getElementById('container').appendChild(state.renderer.domElement);

    // Create lights
    createLights(state.scene);

    // Setup post-processing
    setupPostProcessing();

    // Create OrbitControls
    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;
    state.controls.minDistance = 0.00001; // Allow extreme close-up for Hubble
    state.controls.maxDistance = 2000;
    state.controls.enablePan = true;
    state.controls.panSpeed = 0.5;
    state.controls.rotateSpeed = 0.5;

    // Setup CSS2D renderer for Hubble labels
    state.labelRenderer = new CSS2DRenderer();
    state.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    state.labelRenderer.domElement.style.position = 'absolute';
    state.labelRenderer.domElement.style.top = '0px';
    state.labelRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('container').appendChild(state.labelRenderer.domElement);

    // Create camera controller
    state.cameraController = new CameraController(state.camera, state.controls);

    // Create time controller
    state.timeController = new TimeController();

    // Create star field
    const starField = createStarField();
    state.scene.add(starField);

    // Create Sun
    state.sun = createSun();
    state.scene.add(state.sun.group);
    state.celestialBodies.push(state.sun);

    // Create planets
    state.planets = createPlanets();
    state.planets.forEach(planet => {
        state.scene.add(planet.group);
        state.celestialBodies.push(planet);
    });

    // Create dwarf planets
    const dwarfPlanets = createDwarfPlanets();
    dwarfPlanets.forEach(dp => {
        state.scene.add(dp.group);
        state.celestialBodies.push(dp);
        state.planets.push(dp);
    });

    // Create moons
    state.moons = createMoons(state.planets);
    state.moons.forEach(moon => {
        state.celestialBodies.push(moon);
    });

    // Create satellites (like Hubble)
    state.satellites = createSatellites(state.planets);
    state.satellites.forEach(satellite => {
        state.celestialBodies.push(satellite);
    });

    // Create asteroid belts
    state.asteroids = createAsteroidBelts();
    state.asteroids.forEach(belt => {
        state.scene.add(belt.mesh);
    });

    // Create comets
    state.comets = createComets();
    state.comets.forEach(comet => {
        state.scene.add(comet.group);
        state.celestialBodies.push(comet);
    });

    // Setup UI
    setupUI(state);

    // Setup raycaster for interaction
    setupInteraction();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1000);

    // Start animation loop
    animate();
}

function setupPostProcessing() {
    state.composer = new EffectComposer(state.renderer);

    const renderPass = new RenderPass(state.scene, state.camera);
    state.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    state.composer.addPass(bloomPass);
}

function setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Get all clickable meshes
    function getClickableMeshes() {
        const meshes = [];
        state.celestialBodies.forEach(body => {
            if (body.mesh) {
                meshes.push(body.mesh);
            }
        });
        return meshes;
    }

    // Mouse move for hover
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, state.camera);
        const intersects = raycaster.intersectObjects(getClickableMeshes());

        const tooltip = document.getElementById('tooltip');

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const body = state.celestialBodies.find(b => b.mesh === object);

            if (body && body !== state.hoveredObject) {
                state.hoveredObject = body;
                document.body.style.cursor = 'pointer';

                // Show tooltip
                tooltip.innerHTML = `
                    <div class="tooltip-name">${body.data.name}</div>
                    <div class="tooltip-type">${getTypeLabel(body.data.type)}</div>
                `;
                tooltip.classList.add('visible');
            }

            // Update tooltip position
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        } else {
            if (state.hoveredObject) {
                state.hoveredObject = null;
                document.body.style.cursor = 'grab';
                tooltip.classList.remove('visible');
            }
        }
    });

    // Click for selection
    window.addEventListener('click', (event) => {
        // Ignore clicks on UI elements
        if (event.target.closest('.panel') || event.target.closest('.control-btn')) {
            return;
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, state.camera);
        const intersects = raycaster.intersectObjects(getClickableMeshes());

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const body = state.celestialBodies.find(b => b.mesh === object);

            if (body) {
                selectObject(body);
            }
        }
    });

    // Double click to focus
    window.addEventListener('dblclick', (event) => {
        if (event.target.closest('.panel')) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, state.camera);
        const intersects = raycaster.intersectObjects(getClickableMeshes());

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const body = state.celestialBodies.find(b => b.mesh === object);

            if (body) {
                state.cameraController.flyTo(body);
            }
        }
    });
}

function selectObject(body) {
    state.selectedObject = body;

    // Update UI
    const nameEl = document.getElementById('object-name');
    const typeEl = document.getElementById('object-type');
    const infoEl = document.getElementById('object-info');
    const detailsEl = document.getElementById('object-details');

    nameEl.textContent = body.data.name;
    typeEl.textContent = getTypeLabel(body.data.type);

    infoEl.style.display = 'none';
    detailsEl.style.display = 'block';

    // Fill details
    if (body.data.info) {
        document.getElementById('detail-diameter').textContent = body.data.info.diameter || '-';
        document.getElementById('detail-mass').textContent = body.data.info.mass || '-';
        document.getElementById('detail-day').textContent = body.data.info.dayLength || '-';
        document.getElementById('detail-year').textContent = body.data.info.yearLength || body.data.info.orbitalPeriod || '-';
        document.getElementById('detail-moons').textContent = body.data.info.moons !== undefined ? body.data.info.moons : '-';

        // Facts
        const factsList = document.getElementById('facts-list');
        factsList.innerHTML = '';
        if (body.data.info.facts) {
            body.data.info.facts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                factsList.appendChild(li);
            });
        }
    }

    // Highlight in labels
    document.querySelectorAll('.object-label').forEach(label => {
        label.classList.remove('selected');
        if (label.dataset.name === body.data.name) {
            label.classList.add('selected');
        }
    });
}

function getTypeLabel(type) {
    const labels = {
        'star': 'Звезда',
        'planet': 'Планета',
        'dwarf_planet': 'Карликовая планета',
        'moon': 'Спутник',
        'satellite': 'Искусственный спутник',
        'comet': 'Комета',
        'asteroid': 'Астероид'
    };
    return labels[type] || type;
}

function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.composer.setSize(window.innerWidth, window.innerHeight);
    state.labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = state.clock.getDelta();
    const timeScale = state.timeController.getTimeScale();
    const scaledDelta = delta * timeScale;

    // Update controls
    state.controls.update();

    // Update camera controller
    state.cameraController.update(delta);

    // Update Sun
    if (state.sun && state.sun.update) {
        state.sun.update(delta, state.camera);
    }

    // Update planets
    state.planets.forEach(planet => {
        if (planet.update) {
            planet.update(scaledDelta);
        }
    });

    // Update moons
    state.moons.forEach(moon => {
        if (moon.update) {
            moon.update(scaledDelta);
        }
    });

    // Update satellites
    state.satellites.forEach(satellite => {
        if (satellite.update) {
            satellite.update(scaledDelta, state.camera, state.selectedObject === satellite);
        }
    });

    // Update asteroids
    if (state.settings.showAsteroids) {
        state.asteroids.forEach(belt => {
            if (belt.update) {
                belt.update(scaledDelta);
            }
        });
    }

    // Update comets
    if (state.settings.showComets) {
        state.comets.forEach(comet => {
            if (comet.update) {
                comet.update(scaledDelta);
            }
        });
    }

    // Update camera matrix after controller modifies position
    state.camera.updateMatrixWorld();

    // Update labels
    if (state.settings.showLabels) {
        updateLabels(state.celestialBodies, state.camera);
    }

    // Update time display
    state.timeController.update(scaledDelta);

    // Render
    state.composer.render();

    // Render CSS2D labels (for Hubble component labels)
    state.labelRenderer.render(state.scene, state.camera);
}

// Export state for other modules
export { state, selectObject };

// Start the application
init();
