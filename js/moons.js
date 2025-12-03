// Moons module - creates all planetary satellites
import * as THREE from 'three';
import { MOONS_DATA } from './data/solarSystemData.js';

export function createMoons(planets) {
    const moons = [];

    planets.forEach(planet => {
        const planetMoons = MOONS_DATA[planet.data.name];

        if (planetMoons) {
            planetMoons.forEach(moonData => {
                const moon = createMoon(moonData, planet);
                moons.push(moon);
            });
        }
    });

    return moons;
}

function createMoon(data, parentPlanet) {
    // Moon orbit container (attached to planet's pivot)
    const orbitContainer = new THREE.Group();

    // Moon pivot for orbital movement
    const pivot = new THREE.Group();
    pivot.rotation.y = Math.random() * Math.PI * 2;

    // Create moon mesh
    const geometry = data.irregular
        ? createIrregularGeometry(data.radius)
        : new THREE.SphereGeometry(data.radius, 32, 32);

    const material = createMoonMaterial(data);
    const mesh = new THREE.Mesh(geometry, material);

    // Position at orbital distance from planet
    mesh.position.x = data.distance;

    pivot.add(mesh);
    orbitContainer.add(pivot);

    // Add atmosphere for moons like Titan
    if (data.hasAtmosphere) {
        const atmosphere = createMoonAtmosphere(data);
        atmosphere.position.copy(mesh.position);
        pivot.add(atmosphere);
    }

    // Create orbit line
    const orbitLine = createMoonOrbitLine(data.distance);
    orbitContainer.add(orbitLine);

    // Find planet mesh and add moon to its position
    const planetMesh = parentPlanet.mesh;

    // We need to add moon to planet's pivot so it moves with the planet
    parentPlanet.pivot.add(orbitContainer);

    // Position moon orbit at planet's position
    orbitContainer.position.copy(planetMesh.position);

    const moon = {
        group: orbitContainer,
        mesh,
        pivot,
        orbitLine,
        data,
        parentPlanet,
        angle: pivot.rotation.y,
        update(delta) {
            // Orbital movement around parent planet
            this.angle += data.orbitSpeed * delta;
            pivot.rotation.y = this.angle;

            // Moon rotation
            mesh.rotation.y += data.rotationSpeed * delta;
        },
        getWorldPosition() {
            const pos = new THREE.Vector3();
            mesh.getWorldPosition(pos);
            return pos;
        }
    };

    return moon;
}

function createIrregularGeometry(radius) {
    const geometry = new THREE.IcosahedronGeometry(radius, 1);
    const positions = geometry.attributes.position;

    // Deform vertices for irregular shape
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        const noise = (Math.random() - 0.5) * 0.3;
        positions.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise));
    }

    geometry.computeVertexNormals();
    return geometry;
}

function createMoonMaterial(data) {
    const texture = createMoonTexture(data);

    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.1,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.4,
        emissiveMap: texture
    });
}

function createMoonTexture(data) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d');

    const baseColor = new THREE.Color(data.color);
    ctx.fillStyle = `rgb(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add specific features based on moon
    switch (data.nameEn) {
        case 'Moon':
            addMoonCraters(ctx, canvas.width, canvas.height);
            addMaria(ctx, canvas.width, canvas.height);
            break;
        case 'Io':
            addIoFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Europa':
            addEuropaFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Ganymede':
            addGanymedeFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Callisto':
            addCallistoFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Titan':
            addTitanFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Enceladus':
            addEnceladusFeatures(ctx, canvas.width, canvas.height);
            break;
        case 'Triton':
            addTritonFeatures(ctx, canvas.width, canvas.height);
            break;
        default:
            // Generic moon with craters
            addGenericCraters(ctx, canvas.width, canvas.height);
            break;
    }

    // Add noise
    addNoise(ctx, canvas.width, canvas.height, 0.03);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
}

function addMoonCraters(ctx, width, height) {
    // Larger craters
    const craterColors = ['#707070', '#606060', '#808080'];

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 20 + 5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = craterColors[Math.floor(Math.random() * craterColors.length)];
        ctx.fill();

        // Crater rim
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#909090';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function addMaria(ctx, width, height) {
    // Dark lunar maria (seas)
    ctx.fillStyle = '#505050';

    // Mare Tranquillitatis area
    ctx.beginPath();
    ctx.ellipse(width * 0.6, height * 0.4, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mare Serenitatis
    ctx.beginPath();
    ctx.ellipse(width * 0.55, height * 0.25, 25, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mare Imbrium
    ctx.beginPath();
    ctx.ellipse(width * 0.35, height * 0.3, 35, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();
}

function addIoFeatures(ctx, width, height) {
    // Volcanic features - sulfur deposits
    const colors = ['#ffff00', '#ff8800', '#ff4400', '#ffffff'];

    for (let i = 0; i < 60; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 15 + 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fill();
    }

    // Active volcanic plumes
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function addEuropaFeatures(ctx, width, height) {
    // Ice cracks - lineae
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1;

    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        ctx.moveTo(startX, startY);

        let x = startX;
        let y = startY;
        for (let j = 0; j < 10; j++) {
            x += (Math.random() - 0.5) * 30;
            y += (Math.random() - 0.5) * 10;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function addGanymedeFeatures(ctx, width, height) {
    // Grooved terrain
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 2;

    for (let i = 0; i < 30; i++) {
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 20) {
            ctx.lineTo(x, y + Math.sin(x * 0.1) * 3);
        }
        ctx.stroke();
    }

    // Dark regions
    ctx.fillStyle = '#606060';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * width, Math.random() * height, 30, 20, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
}

function addCallistoFeatures(ctx, width, height) {
    // Heavily cratered surface
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 10 + 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${80 + Math.random() * 40}, ${80 + Math.random() * 40}, ${80 + Math.random() * 40})`;
        ctx.fill();
    }

    // Valhalla multi-ring structure
    ctx.beginPath();
    ctx.arc(width * 0.4, height * 0.5, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.4, height * 0.5, 45, 0, Math.PI * 2);
    ctx.stroke();
}

function addTitanFeatures(ctx, width, height) {
    // Orange haze
    ctx.fillStyle = '#cc8800';
    ctx.fillRect(0, 0, width, height);

    // Darker regions (hydrocarbon lakes)
    ctx.fillStyle = '#804000';
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * width, Math.random() * height, Math.random() * 20 + 10, Math.random() * 15 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Polar lakes
    ctx.fillStyle = '#402000';
    ctx.fillRect(0, 0, width, height * 0.15);
    ctx.fillRect(0, height * 0.85, width, height * 0.15);
}

function addEnceladusFeatures(ctx, width, height) {
    // Bright icy surface
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(0, 0, width, height);

    // Tiger stripes at south pole
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 3;

    const stripeY = height * 0.85;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(width * 0.2 + i * 20, stripeY);
        ctx.lineTo(width * 0.8 - i * 20, height);
        ctx.stroke();
    }

    // Subtle craters
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height * 0.8, Math.random() * 5 + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();
    }
}

function addTritonFeatures(ctx, width, height) {
    // Cantaloupe terrain
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        ctx.beginPath();
        ctx.ellipse(x, y, 8, 6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fillStyle = '#d8a0a0';
        ctx.fill();
        ctx.strokeStyle = '#c08080';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // South polar cap
    ctx.fillStyle = '#ffe0e0';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
}

function addGenericCraters(ctx, width, height) {
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 8 + 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#707070';
        ctx.fill();
    }
}

function addNoise(ctx, width, height, intensity) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
}

function createMoonAtmosphere(data) {
    const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.15, 32, 32);
    const atmosphereColor = new THREE.Color(data.atmosphereColor || 0xffaa00);

    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: atmosphereColor }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(color, intensity * 0.6);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    return new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
}

function createMoonOrbitLine(distance) {
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
        color: 0x445566,
        transparent: true,
        opacity: 0.2
    });

    return new THREE.Line(geometry, material);
}
