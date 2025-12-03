// Satellites module - creates artificial satellites (like Hubble)
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { SATELLITES_DATA } from './data/solarSystemData.js';

// Store labels for visibility control
let hubbleLabels = [];

export function createSatellites(planets) {
    const satellites = [];

    planets.forEach(planet => {
        const planetSatellites = SATELLITES_DATA[planet.data.name];

        if (planetSatellites) {
            planetSatellites.forEach(satData => {
                const satellite = createSatellite(satData, planet);
                satellites.push(satellite);
            });
        }
    });

    return satellites;
}

function createSatellite(data, parentPlanet) {
    // Satellite orbit container (attached to planet's pivot)
    const orbitContainer = new THREE.Group();

    // Satellite pivot for orbital movement
    const pivot = new THREE.Group();
    pivot.rotation.y = Math.random() * Math.PI * 2;

    // Create satellite mesh (realistic tiny size)
    const { mesh: satelliteMesh, labels } = createHubbleMesh(data);
    satelliteMesh.position.x = data.distance;
    // Tidal lock: aperture (-X) points to space, mirror (+X) toward Earth
    satelliteMesh.rotation.y = Math.PI;
    hubbleLabels = labels;

    // Create marker for visibility at distance
    const marker = createMarker(data);
    marker.position.x = data.distance;

    pivot.add(satelliteMesh);
    pivot.add(marker);
    orbitContainer.add(pivot);

    // Create orbit line
    const orbitLine = createOrbitLine(data.distance);
    orbitContainer.add(orbitLine);

    // Attach to parent planet's pivot so it moves with the planet
    parentPlanet.pivot.add(orbitContainer);

    // Position at planet's position
    const planetMesh = parentPlanet.mesh;
    orbitContainer.position.copy(planetMesh.position);

    const satellite = {
        group: orbitContainer,
        mesh: marker, // Use marker for raycasting (satellite is too small)
        satelliteMesh,
        marker,
        pivot,
        orbitLine,
        data,
        parentPlanet,
        angle: pivot.rotation.y,
        labels: hubbleLabels,
        update(delta, camera, isSelected = false) {
            // Orbital movement around parent planet
            this.angle += data.orbitSpeed * delta;
            pivot.rotation.y = this.angle;

            // Distance-based visibility
            if (camera) {
                const worldPos = this.getWorldPosition();
                const distance = worldPos.distanceTo(camera.position);

                // Show detailed model and hide marker when close
                const closeDistance = 2;
                this.marker.visible = distance > closeDistance;

                // Show labels and lines when camera is close AND object is selected
                const showLabels = distance < closeDistance && isSelected;
                this.labels.forEach(item => {
                    if (item.label) {
                        item.label.visible = showLabels;
                    }
                    if (item.line) {
                        item.line.visible = showLabels;
                    }
                });
            }
        },
        getWorldPosition() {
            const pos = new THREE.Vector3();
            marker.getWorldPosition(pos);
            return pos;
        }
    };

    return satellite;
}

function createHubbleMesh(data) {
    const group = new THREE.Group();
    const labels = [];

    // Scale factor - Hubble is 13.2m long, use this as base unit
    // data.radius represents ~6.6m (half length), so scale = data.radius
    const s = data.radius; // Base scale

    // ============================================
    // MATERIALS
    // ============================================

    // Silver metallic body (MLI insulation)
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.95,
        roughness: 0.15,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
    });

    // Gold thermal insulation
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xdaa520,
        metalness: 0.9,
        roughness: 0.2,
        emissive: new THREE.Color(0xdaa520),
        emissiveIntensity: 0.2
    });

    // Mirror material (highly reflective)
    const mirrorMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.0,
        emissive: new THREE.Color(0x4488ff),
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
    });

    // Black interior (absorbs stray light)
    const blackMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    });

    // Solar panel - blue cells
    const solarCellMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a237e,
        metalness: 0.4,
        roughness: 0.3,
        emissive: new THREE.Color(0x0d47a1),
        emissiveIntensity: 0.2
    });

    // Solar panel frame - gold
    const panelFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        metalness: 0.8,
        roughness: 0.3
    });

    // White antenna material
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.5,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.2
    });

    // Black strut material
    const strutMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.5,
        roughness: 0.6
    });

    // ============================================
    // MAIN TUBE (Optical Telescope Assembly)
    // ============================================

    // Main cylindrical body - length ~13m, diameter ~4.2m
    const tubeLength = s * 2;      // Full length
    const tubeRadius = s * 0.32;   // ~4.2m diameter / 13m length ratio

    const tubeGeometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeLength, 32);
    const mainTube = new THREE.Mesh(tubeGeometry, bodyMaterial);
    mainTube.rotation.z = Math.PI / 2; // Horizontal orientation
    group.add(mainTube);

    // Add label for main tube
    // Главный тубус - сверху справа
    labels.push(createLabelWithLine('Главный тубус', mainTube, tubeLength * 0.8, tubeRadius * 5, 0));

    // ============================================
    // FRONT APERTURE (Light Shield / Baffle)
    // ============================================

    // Aperture ring at front
    const apertureRingGeometry = new THREE.RingGeometry(tubeRadius * 0.7, tubeRadius * 1.05, 32);
    const apertureRing = new THREE.Mesh(apertureRingGeometry, bodyMaterial);
    apertureRing.rotation.y = Math.PI / 2;
    apertureRing.position.x = -tubeLength / 2 - s * 0.02;
    group.add(apertureRing);

    // Black interior of aperture
    const apertureInteriorGeometry = new THREE.CircleGeometry(tubeRadius * 0.7, 32);
    const apertureInterior = new THREE.Mesh(apertureInteriorGeometry, blackMaterial);
    apertureInterior.rotation.y = Math.PI / 2;
    apertureInterior.position.x = -tubeLength / 2 + s * 0.01;
    group.add(apertureInterior);

    // Light shield extension (forward baffle)
    const baffleGeometry = new THREE.CylinderGeometry(tubeRadius * 1.02, tubeRadius, s * 0.2, 32, 1, true);
    const baffle = new THREE.Mesh(baffleGeometry, bodyMaterial);
    baffle.rotation.z = Math.PI / 2;
    baffle.position.x = -tubeLength / 2 - s * 0.1;
    group.add(baffle);

    // Апертура - слева
    labels.push(createLabelWithLine('Апертура', apertureRing, -tubeLength * 0.8, tubeRadius * 4, 0));

    // ============================================
    // LENS CAP (защитная крышка объектива, откинута)
    // ============================================

    // Защитная крышка объектива - круглая
    const capRadius = tubeRadius * 1.05;
    const capGeometry = new THREE.CircleGeometry(capRadius, 32);
    const lensCap = new THREE.Mesh(capGeometry, bodyMaterial);

    // Откинута наверх в рабочем положении
    lensCap.position.x = -tubeLength / 2 - s * 0.1;
    lensCap.position.y = tubeRadius + capRadius * 0.9;
    lensCap.rotation.x = -Math.PI / 2 + 0.15;
    lensCap.rotation.y = Math.PI / 2;
    group.add(lensCap);

    // Крышка объектива - слева сверху
    labels.push(createLabelWithLine('Крышка объектива', lensCap, -tubeLength * 0.6, tubeRadius * 6, 0));

    // ============================================
    // SECONDARY MIRROR (on spider vanes)
    // ============================================

    // Secondary mirror - 0.3m diameter
    const secondaryRadius = tubeRadius * 0.12; // ~0.3m relative to tube
    const secondaryGeometry = new THREE.CircleGeometry(secondaryRadius, 16);
    const secondaryMirror = new THREE.Mesh(secondaryGeometry, mirrorMaterial);
    secondaryMirror.rotation.y = -Math.PI / 2;
    secondaryMirror.position.x = -tubeLength / 2 + s * 0.3; // Inside tube, near front
    group.add(secondaryMirror);

    // Secondary mirror housing
    const secondaryHousingGeometry = new THREE.CylinderGeometry(secondaryRadius * 1.3, secondaryRadius * 1.5, s * 0.08, 16);
    const secondaryHousing = new THREE.Mesh(secondaryHousingGeometry, strutMaterial);
    secondaryHousing.rotation.z = Math.PI / 2;
    secondaryHousing.position.x = -tubeLength / 2 + s * 0.32;
    group.add(secondaryHousing);

    // Spider vanes (4 struts holding secondary mirror)
    const vaneLength = tubeRadius * 0.85;
    const vaneGeometry = new THREE.BoxGeometry(s * 0.01, vaneLength, s * 0.002);

    for (let i = 0; i < 4; i++) {
        const vane = new THREE.Mesh(vaneGeometry, strutMaterial);
        vane.position.x = -tubeLength / 2 + s * 0.3;
        vane.rotation.x = (i * Math.PI) / 2;
        vane.position.y = Math.cos(i * Math.PI / 2) * vaneLength / 2;
        vane.position.z = Math.sin(i * Math.PI / 2) * vaneLength / 2;
        group.add(vane);
    }

    // Вторичное зеркало - слева снизу
    labels.push(createLabelWithLine('Вторичное зеркало (0.3м)', secondaryMirror, -tubeLength * 0.6, -tubeRadius * 5, 0));

    // ============================================
    // PRIMARY MIRROR (at back of tube)
    // ============================================

    // Primary mirror - 2.4m diameter (the main optical element!)
    const primaryRadius = tubeRadius * 0.9; // ~2.4m, nearly fills the tube
    const primaryGeometry = new THREE.CircleGeometry(primaryRadius, 32);
    const primaryMirror = new THREE.Mesh(primaryGeometry, mirrorMaterial);
    primaryMirror.rotation.y = Math.PI / 2;
    primaryMirror.position.x = tubeLength / 2 - s * 0.15; // At back of tube
    group.add(primaryMirror);

    // Mirror cell (structure holding primary mirror)
    const mirrorCellGeometry = new THREE.TorusGeometry(primaryRadius * 0.95, s * 0.03, 8, 32);
    const mirrorCell = new THREE.Mesh(mirrorCellGeometry, strutMaterial);
    mirrorCell.rotation.y = Math.PI / 2;
    mirrorCell.position.x = tubeLength / 2 - s * 0.12;
    group.add(mirrorCell);

    // Главное зеркало - справа снизу
    labels.push(createLabelWithLine('Главное зеркало (2.4м)', primaryMirror, tubeLength * 0.8, -tubeRadius * 4, 0));

    // ============================================
    // EQUIPMENT SECTION (aft shroud)
    // ============================================

    // Larger diameter section at the back containing instruments
    const equipmentRadius = tubeRadius * 1.15;
    const equipmentLength = s * 0.5;
    const equipmentGeometry = new THREE.CylinderGeometry(equipmentRadius, tubeRadius, equipmentLength, 32);
    const equipmentSection = new THREE.Mesh(equipmentGeometry, bodyMaterial);
    equipmentSection.rotation.z = Math.PI / 2;
    equipmentSection.position.x = tubeLength / 2 + equipmentLength / 2 - s * 0.05;
    group.add(equipmentSection);

    // Equipment bay doors (gold colored)
    for (let i = 0; i < 4; i++) {
        const doorGeometry = new THREE.BoxGeometry(equipmentLength * 0.6, equipmentRadius * 0.5, s * 0.01);
        const door = new THREE.Mesh(doorGeometry, goldMaterial);
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        door.position.x = tubeLength / 2 + equipmentLength / 2 - s * 0.05;
        door.position.y = Math.cos(angle) * equipmentRadius * 0.9;
        door.position.z = Math.sin(angle) * equipmentRadius * 0.9;
        door.rotation.x = angle;
        group.add(door);
    }

    // Отсек оборудования - справа
    labels.push(createLabelWithLine('Отсек оборудования', equipmentSection, tubeLength * 1.0, -tubeRadius * 2, 0));

    // ============================================
    // SOLAR ARRAYS
    // ============================================

    // Solar panel dimensions - roughly 12m x 2.5m each
    const panelWidth = s * 1.8;
    const panelHeight = s * 0.4;
    const panelThickness = s * 0.01;

    // Panel support booms
    const boomLength = s * 0.3;
    const boomGeometry = new THREE.CylinderGeometry(s * 0.015, s * 0.015, boomLength, 8);

    [-1, 1].forEach(side => {
        // Support boom
        const boom = new THREE.Mesh(boomGeometry, panelFrameMaterial);
        boom.position.set(0, side * (tubeRadius + boomLength / 2), 0);
        group.add(boom);

        // Main solar panel
        const panelGroup = new THREE.Group();

        // Panel frame
        const frameGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness);
        const frame = new THREE.Mesh(frameGeometry, panelFrameMaterial);
        panelGroup.add(frame);

        // Solar cells (blue rectangles)
        const cellRows = 8;
        const cellCols = 20;
        const cellWidth = (panelWidth * 0.9) / cellCols;
        const cellHeight = (panelHeight * 0.85) / cellRows;

        for (let row = 0; row < cellRows; row++) {
            for (let col = 0; col < cellCols; col++) {
                const cellGeometry = new THREE.BoxGeometry(cellWidth * 0.9, cellHeight * 0.9, panelThickness * 1.1);
                const cell = new THREE.Mesh(cellGeometry, solarCellMaterial);
                cell.position.x = -panelWidth * 0.45 + cellWidth * (col + 0.5);
                cell.position.y = -panelHeight * 0.425 + cellHeight * (row + 0.5);
                cell.position.z = panelThickness * 0.1;
                panelGroup.add(cell);
            }
        }

        panelGroup.position.set(0, side * (tubeRadius + boomLength + panelHeight / 2), 0);
        group.add(panelGroup);

        if (side === 1) {
            // Солнечная панель - сверху
            labels.push(createLabelWithLine('Солнечная панель', panelGroup, 0, panelHeight * 4, 0));
        }
    });

    // ============================================
    // HIGH GAIN ANTENNAS (HGA)
    // ============================================

    // Two dish antennas for communication with Earth
    const antennaRadius = s * 0.12;
    const antennaBoomLength = s * 0.25;

    [-1, 1].forEach((side, index) => {
        // Antenna boom
        const antennaBoomGeometry = new THREE.CylinderGeometry(s * 0.01, s * 0.01, antennaBoomLength, 8);
        const antennaBoom = new THREE.Mesh(antennaBoomGeometry, strutMaterial);
        antennaBoom.position.set(s * 0.3, 0, side * (tubeRadius + antennaBoomLength / 2));
        antennaBoom.rotation.x = Math.PI / 2;
        group.add(antennaBoom);

        // Parabolic dish
        const dishGeometry = new THREE.SphereGeometry(antennaRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dish = new THREE.Mesh(dishGeometry, antennaMaterial);
        dish.position.set(s * 0.3, 0, side * (tubeRadius + antennaBoomLength + antennaRadius * 0.3));
        dish.rotation.x = side * Math.PI / 2;
        group.add(dish);

        // Feed horn at center of dish
        const feedGeometry = new THREE.ConeGeometry(antennaRadius * 0.15, antennaRadius * 0.4, 8);
        const feed = new THREE.Mesh(feedGeometry, strutMaterial);
        feed.position.set(s * 0.3, 0, side * (tubeRadius + antennaBoomLength + antennaRadius * 0.5));
        feed.rotation.x = -side * Math.PI / 2;
        group.add(feed);

        if (index === 0) {
            // Антенна HGA - справа снизу
            labels.push(createLabelWithLine('Антенна HGA', dish, tubeLength * 0.5, -tubeRadius * 6, 0));
        }
    });

    // ============================================
    // THERMAL STRIPES (decorative detail)
    // ============================================

    // Gold thermal blanket stripes along the tube
    const stripeCount = 5;
    for (let i = 0; i < stripeCount; i++) {
        const stripeGeometry = new THREE.TorusGeometry(tubeRadius * 1.01, s * 0.008, 8, 32);
        const stripe = new THREE.Mesh(stripeGeometry, goldMaterial);
        stripe.rotation.y = Math.PI / 2;
        stripe.position.x = -tubeLength / 3 + (i / (stripeCount - 1)) * tubeLength * 0.6;
        group.add(stripe);
    }

    // ============================================
    // HANDRAILS (for astronaut servicing)
    // ============================================

    const handrailRadius = tubeRadius * 1.08;
    const handrailGeometry = new THREE.TorusGeometry(handrailRadius, s * 0.005, 8, 32, Math.PI);

    [-1, 1].forEach(side => {
        const handrail = new THREE.Mesh(handrailGeometry, strutMaterial);
        handrail.rotation.y = Math.PI / 2;
        handrail.rotation.z = side * Math.PI / 2;
        handrail.position.x = 0;
        group.add(handrail);
    });

    return { mesh: group, labels };
}

function createLabelWithLine(text, parent, offsetX, offsetY, offsetZ) {
    // Create label
    const div = document.createElement('div');
    div.className = 'hubble-label';
    div.textContent = text;
    div.style.cssText = `
        color: #00ffff;
        font-family: 'Arial', 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 500;
        padding: 4px 10px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #00ffff;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        display: none;
        letter-spacing: 0.5px;
        box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
    `;

    const label = new CSS2DObject(div);
    label.visible = false;  // Hidden by default, shown only when selected + close
    label.position.set(offsetX, offsetY, offsetZ);
    parent.add(label);

    // Create leader line from component (0,0,0) to label position
    const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(offsetX, offsetY, offsetZ)
    ];
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.visible = false;  // Hidden by default
    parent.add(line);

    return { label, line };
}

function createMarker(data) {
    // Create a visible marker point for finding the satellite at distance
    // This is larger than the satellite itself for visibility
    const markerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });

    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    // Add a glow effect
    const glowGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    marker.add(glow);

    return marker;
}

function createOrbitLine(distance) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });

    return new THREE.Line(geometry, material);
}

// Export for setting up CSS2D renderer
export function setupCSS2DRenderer(container) {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    return labelRenderer;
}
