// Planets module - creates all planets with realistic procedural textures
import * as THREE from 'three';
import { PLANETS_DATA, DWARF_PLANETS_DATA } from './data/solarSystemData.js';

// ============================================
// SIMPLEX NOISE IMPLEMENTATION
// ============================================

class SimplexNoise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);

        // Initialize permutation array
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        // Shuffle based on seed
        let s = seed * 2147483647;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807) % 2147483647;
            const j = s % (i + 1);
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }

        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];

        this.F2 = 0.5 * (Math.sqrt(3) - 1);
        this.G2 = (3 - Math.sqrt(3)) / 6;
        this.F3 = 1 / 3;
        this.G3 = 1 / 6;
    }

    dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    dot3(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    noise2D(x, y) {
        const { perm, permMod12, grad3, F2, G2 } = this;
        let n0, n1, n2;

        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const gi0 = permMod12[ii + perm[jj]];
        const gi1 = permMod12[ii + i1 + perm[jj + j1]];
        const gi2 = permMod12[ii + 1 + perm[jj + 1]];

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot2(grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot2(grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot2(grad3[gi2], x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }

    noise3D(x, y, z) {
        const { perm, permMod12, grad3, F3, G3 } = this;
        let n0, n1, n2, n3;

        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);

        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;

        let i1, j1, k1, i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
            else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
            else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
            if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
            else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
            else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }

        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2 * G3;
        const y2 = y0 - j2 + 2 * G3;
        const z2 = z0 - k2 + 2 * G3;
        const x3 = x0 - 1 + 3 * G3;
        const y3 = y0 - 1 + 3 * G3;
        const z3 = z0 - 1 + 3 * G3;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = permMod12[ii + perm[jj + perm[kk]]];
        const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
        const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
        const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        if (t0 < 0) n0 = 0;
        else { t0 *= t0; n0 = t0 * t0 * this.dot3(grad3[gi0], x0, y0, z0); }

        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        if (t1 < 0) n1 = 0;
        else { t1 *= t1; n1 = t1 * t1 * this.dot3(grad3[gi1], x1, y1, z1); }

        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        if (t2 < 0) n2 = 0;
        else { t2 *= t2; n2 = t2 * t2 * this.dot3(grad3[gi2], x2, y2, z2); }

        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        if (t3 < 0) n3 = 0;
        else { t3 *= t3; n3 = t3 * t3 * this.dot3(grad3[gi3], x3, y3, z3); }

        return 32 * (n0 + n1 + n2 + n3);
    }

    // Fractal Brownian Motion - layered noise
    fbm(x, y, octaves = 6, lacunarity = 2, persistence = 0.5) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.noise2D(x * frequency, y * frequency);
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return value / maxValue;
    }

    // Turbulence - absolute value of noise
    turbulence(x, y, octaves = 6) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * Math.abs(this.noise2D(x * frequency, y * frequency));
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }

    // Ridged noise - inverted absolute value
    ridged(x, y, octaves = 6) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let weight = 1;

        for (let i = 0; i < octaves; i++) {
            let signal = 1 - Math.abs(this.noise2D(x * frequency, y * frequency));
            signal *= signal * weight;
            weight = Math.min(1, Math.max(0, signal * 2));
            value += signal * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value;
    }
}

const noise = new SimplexNoise(42);

// ============================================
// HELPER FUNCTIONS
// ============================================

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
    return {
        r: lerp(c1.r, c2.r, t),
        g: lerp(c1.g, c2.g, t),
        b: lerp(c1.b, c2.b, t)
    };
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

// ============================================
// PLANET CREATION
// ============================================

export function createPlanets() {
    return PLANETS_DATA.map(planetData => createPlanet(planetData));
}

export function createDwarfPlanets() {
    return DWARF_PLANETS_DATA.map(planetData => createPlanet(planetData));
}

function createPlanet(data) {
    const group = new THREE.Group();

    const orbitContainer = new THREE.Group();
    orbitContainer.rotation.x = THREE.MathUtils.degToRad(data.orbitInclination || 0);

    const pivot = new THREE.Group();
    pivot.rotation.y = Math.random() * Math.PI * 2;

    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = createPlanetMaterial(data);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.z = THREE.MathUtils.degToRad(data.axialTilt || 0);
    mesh.position.x = data.distance;

    pivot.add(mesh);
    orbitContainer.add(pivot);
    group.add(orbitContainer);

    if (data.hasAtmosphere) {
        const atmosphere = createAtmosphere(data);
        atmosphere.position.copy(mesh.position);
        atmosphere.rotation.z = mesh.rotation.z;
        pivot.add(atmosphere);
    }

    if (data.hasClouds) {
        const clouds = createClouds(data);
        clouds.position.copy(mesh.position);
        pivot.add(clouds);
    }

    if (data.hasRings) {
        const rings = createRings(data);
        rings.position.copy(mesh.position);
        rings.rotation.x = Math.PI / 2;
        rings.rotation.z = mesh.rotation.z;
        pivot.add(rings);
    }

    const orbitLine = createOrbitLine(data.distance, data.orbitInclination);
    group.add(orbitLine);

    const planet = {
        group,
        mesh,
        pivot,
        orbitContainer,
        orbitLine,
        data,
        angle: pivot.rotation.y,
        update(delta) {
            this.angle += data.orbitSpeed * delta;
            pivot.rotation.y = this.angle;
            mesh.rotation.y += data.rotationSpeed * delta;

            if (data.hasClouds) {
                const clouds = pivot.children.find(c => c.userData.isClouds);
                if (clouds) {
                    clouds.rotation.y += data.rotationSpeed * delta * 1.1;
                }
            }
        },
        getWorldPosition() {
            const pos = new THREE.Vector3();
            mesh.getWorldPosition(pos);
            return pos;
        }
    };

    return planet;
}

function createPlanetMaterial(data) {
    const texture = createProceduralTexture(data);
    const bumpMap = createBumpMap(data);

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: bumpMap,
        bumpScale: data.nameEn === 'Earth' ? 0.02 : 0.01,
        roughness: 0.85,
        metalness: 0.05,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.5,
        emissiveMap: texture
    });

    return material;
}

// ============================================
// TEXTURE GENERATION
// ============================================

function createProceduralTexture(data) {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Use canvas drawing directly for better performance and reliability
    switch (data.nameEn) {
        case 'Mercury':
            generateMercuryTexture(ctx, width, height);
            break;
        case 'Venus':
            generateVenusTexture(ctx, width, height);
            break;
        case 'Earth':
            generateEarthTexture(ctx, width, height);
            break;
        case 'Mars':
            generateMarsTexture(ctx, width, height);
            break;
        case 'Jupiter':
            generateJupiterTexture(ctx, width, height);
            break;
        case 'Saturn':
            generateSaturnTexture(ctx, width, height);
            break;
        case 'Uranus':
            generateUranusTexture(ctx, width, height);
            break;
        case 'Neptune':
            generateNeptuneTexture(ctx, width, height);
            break;
        case 'Pluto':
            generatePlutoTexture(ctx, width, height);
            break;
        case 'Ceres':
            generateCeresTexture(ctx, width, height);
            break;
        default:
            generateGenericTexture(ctx, width, height, data.color);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 16;

    return texture;
}

function createBumpMap(data) {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const u = x / width;
            const v = y / height;
            const idx = (y * width + x) * 4;

            let bump = noise.fbm(u * 10, v * 10, 4) * 0.5 + 0.5;

            // Add craters for rocky planets
            if (['Mercury', 'Mars', 'Ceres'].includes(data.nameEn)) {
                bump += noise.turbulence(u * 20, v * 20, 3) * 0.3;
            }

            bump = clamp(bump, 0, 1);
            const c = Math.floor(bump * 255);
            pixels[idx] = c;
            pixels[idx + 1] = c;
            pixels[idx + 2] = c;
            pixels[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
}

// ============================================
// INDIVIDUAL PLANET TEXTURES
// ============================================

function generateMercuryTexture(ctx, width, height) {
    // Mercury: Gray-brown with many craters
    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#8a8078');
    gradient.addColorStop(0.3, '#9a9088');
    gradient.addColorStop(0.6, '#7a7068');
    gradient.addColorStop(1, '#8a8078');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise texture
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        const brightness = 100 + Math.floor(Math.random() * 80);
        ctx.fillStyle = `rgb(${brightness}, ${brightness - 10}, ${brightness - 20})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add craters
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 20 + 5;

        // Dark crater interior
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60, 55, 50, ${0.3 + Math.random() * 0.3})`;
        ctx.fill();

        // Light rim
        ctx.beginPath();
        ctx.arc(x - radius * 0.15, y - radius * 0.15, radius * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(160, 150, 140, ${0.3 + Math.random() * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Add dark maria-like regions
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 80 + 40,
            Math.random() * 50 + 25,
            Math.random() * Math.PI,
            0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(70, 65, 60, ${0.2 + Math.random() * 0.15})`;
        ctx.fill();
    }
}

function generateVenusTexture(ctx, width, height) {
    // Venus: Yellow-orange swirling clouds
    // Base color
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e8c880');
    gradient.addColorStop(0.5, '#d4a860');
    gradient.addColorStop(1, '#e8c880');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add horizontal bands
    for (let y = 0; y < height; y += 20) {
        const brightness = 180 + Math.sin(y * 0.1) * 40;
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 40}, ${brightness - 80}, 0.3)`;
        ctx.fillRect(0, y, width, 15 + Math.random() * 10);
    }

    // Add swirling cloud patterns
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 10; j++) {
            const nx = x + j * 30 + Math.sin(y * 0.05 + j) * 20;
            const ny = y + Math.sin(j * 0.5) * 10;
            ctx.lineTo(nx % width, ny);
        }
        ctx.strokeStyle = `rgba(255, 230, 180, ${0.1 + Math.random() * 0.15})`;
        ctx.lineWidth = 5 + Math.random() * 10;
        ctx.stroke();
    }

    // Add texture variation
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 200 + Math.floor(Math.random() * 55);
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 30}, ${brightness - 80}, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateEarthTexture(ctx, width, height) {
    // Earth: Blue oceans, green/brown continents, white ice caps

    // Ocean base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, '#a0d0e8');  // Light at poles
    oceanGradient.addColorStop(0.15, '#1a5090');
    oceanGradient.addColorStop(0.5, '#0a3060');
    oceanGradient.addColorStop(0.85, '#1a5090');
    oceanGradient.addColorStop(1, '#a0d0e8');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw continents
    ctx.fillStyle = '#3a7a3a';

    // North America
    ctx.beginPath();
    ctx.moveTo(width * 0.12, height * 0.2);
    ctx.bezierCurveTo(width * 0.08, height * 0.25, width * 0.1, height * 0.35, width * 0.15, height * 0.4);
    ctx.bezierCurveTo(width * 0.18, height * 0.45, width * 0.25, height * 0.42, width * 0.28, height * 0.35);
    ctx.bezierCurveTo(width * 0.3, height * 0.28, width * 0.25, height * 0.2, width * 0.2, height * 0.18);
    ctx.closePath();
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.52);
    ctx.bezierCurveTo(width * 0.25, height * 0.55, width * 0.27, height * 0.65, width * 0.24, height * 0.75);
    ctx.bezierCurveTo(width * 0.22, height * 0.8, width * 0.2, height * 0.75, width * 0.19, height * 0.65);
    ctx.bezierCurveTo(width * 0.18, height * 0.55, width * 0.2, height * 0.5, width * 0.22, height * 0.52);
    ctx.fill();

    // Europe & Africa
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.35, width * 0.05, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.55, width * 0.06, height * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.3, width * 0.15, height * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.82, height * 0.62, width * 0.05, height * 0.07, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Add land texture and color variation
    const landColors = ['#2d6a2d', '#4a8a4a', '#5a7a3a', '#8a7a50'];
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = landColors[Math.floor(Math.random() * landColors.length)];
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 5 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ice caps
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, width, height * 0.08);
    ctx.fillRect(0, height * 0.92, width, height * 0.08);

    // Blend ice edges
    const iceGradient1 = ctx.createLinearGradient(0, 0, 0, height * 0.12);
    iceGradient1.addColorStop(0, 'rgba(240, 248, 255, 1)');
    iceGradient1.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = iceGradient1;
    ctx.fillRect(0, 0, width, height * 0.12);

    const iceGradient2 = ctx.createLinearGradient(0, height * 0.88, 0, height);
    iceGradient2.addColorStop(0, 'rgba(240, 248, 255, 0)');
    iceGradient2.addColorStop(1, 'rgba(240, 248, 255, 1)');
    ctx.fillStyle = iceGradient2;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);
}

function generateMarsTexture(ctx, width, height) {
    // Mars: Red-orange with dark regions and white polar caps

    // Base red-orange color
    const baseGradient = ctx.createLinearGradient(0, 0, width, height);
    baseGradient.addColorStop(0, '#c06030');
    baseGradient.addColorStop(0.3, '#d07040');
    baseGradient.addColorStop(0.7, '#b05535');
    baseGradient.addColorStop(1, '#c06030');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    // Add texture variation
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 150 + Math.floor(Math.random() * 80);
        const g = 60 + Math.floor(Math.random() * 50);
        const b = 30 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dark regions (ancient sea beds)
    ctx.fillStyle = 'rgba(80, 40, 30, 0.4)';
    ctx.beginPath();
    ctx.ellipse(width * 0.6, height * 0.4, width * 0.15, height * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.55, width * 0.12, height * 0.08, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.75, height * 0.6, width * 0.1, height * 0.12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Valles Marineris (canyon system)
    ctx.strokeStyle = 'rgba(70, 35, 25, 0.5)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.48);
    ctx.bezierCurveTo(width * 0.35, height * 0.5, width * 0.5, height * 0.48, width * 0.6, height * 0.5);
    ctx.stroke();

    // Olympus Mons
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.35, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 120, 80, 0.6)';
    ctx.fill();

    // Polar ice caps
    ctx.fillStyle = '#fff8f5';
    ctx.fillRect(0, 0, width, height * 0.08);
    ctx.fillRect(0, height * 0.92, width, height * 0.08);

    // Blend ice edges
    const iceGradient1 = ctx.createLinearGradient(0, 0, 0, height * 0.12);
    iceGradient1.addColorStop(0, 'rgba(255, 248, 245, 1)');
    iceGradient1.addColorStop(1, 'rgba(255, 248, 245, 0)');
    ctx.fillStyle = iceGradient1;
    ctx.fillRect(0, 0, width, height * 0.12);

    const iceGradient2 = ctx.createLinearGradient(0, height * 0.88, 0, height);
    iceGradient2.addColorStop(0, 'rgba(255, 248, 245, 0)');
    iceGradient2.addColorStop(1, 'rgba(255, 248, 245, 1)');
    ctx.fillStyle = iceGradient2;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);
}

function generateJupiterTexture(ctx, width, height) {
    // Jupiter: Prominent horizontal bands with Great Red Spot

    // Band colors
    const bandColors = [
        '#e8d8c0', // Light cream
        '#c8a878', // Tan
        '#e0d0b8', // Cream
        '#a07850', // Brown
        '#f0e8d8', // Very light
        '#b89060', // Medium brown
        '#d8c8a8', // Light tan
        '#906840', // Dark brown
    ];

    // Draw bands
    const bandHeight = height / 16;
    for (let i = 0; i < 16; i++) {
        const y = i * bandHeight;
        const colorIndex = i % bandColors.length;
        ctx.fillStyle = bandColors[colorIndex];
        ctx.fillRect(0, y, width, bandHeight + 1);
    }

    // Add turbulent edges between bands
    for (let y = 0; y < height; y += bandHeight) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 10) {
            ctx.lineTo(x, y + Math.sin(x * 0.03 + y * 0.01) * 5);
        }
        ctx.stroke();
    }

    // Add swirling patterns
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
            const nx = x + j * 15 + Math.sin(y * 0.02 + j) * 10;
            const ny = y + Math.cos(j * 0.3) * 5;
            ctx.lineTo(nx % width, ny);
        }
        const brightness = 150 + Math.floor(Math.random() * 100);
        ctx.strokeStyle = `rgba(${brightness}, ${brightness - 30}, ${brightness - 60}, 0.2)`;
        ctx.lineWidth = 2 + Math.random() * 4;
        ctx.stroke();
    }

    // Great Red Spot
    const grsX = width * 0.6;
    const grsY = height * 0.55;
    const grsW = 80;
    const grsH = 50;

    // Outer ring
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, grsW, grsH, 0, 0, Math.PI * 2);
    const grsGradient = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, grsW);
    grsGradient.addColorStop(0, '#c86040');
    grsGradient.addColorStop(0.5, '#b85535');
    grsGradient.addColorStop(1, '#a04830');
    ctx.fillStyle = grsGradient;
    ctx.fill();

    // Inner swirl
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, grsW * 0.6, grsH * 0.6, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 90, 60, 0.6)';
    ctx.fill();

    // Add texture detail
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 150 + Math.floor(Math.random() * 100);
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 20}, ${brightness - 50}, 0.15)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateSaturnTexture(ctx, width, height) {
    // Saturn: Subtle pale yellow bands
    const bandColors = [
        'rgb(235, 220, 180)', // Pale yellow
        'rgb(220, 200, 160)', // Slightly darker
        'rgb(245, 235, 200)', // Very light
        'rgb(210, 190, 150)', // Darker band
        'rgb(240, 225, 190)', // Light
    ];

    // Draw horizontal bands
    const bandCount = 20;
    const bandHeight = height / bandCount;

    for (let i = 0; i < bandCount; i++) {
        const colorIndex = i % bandColors.length;
        ctx.fillStyle = bandColors[colorIndex];
        ctx.fillRect(0, i * bandHeight, width, bandHeight + 1);
    }

    // Add gradient overlay for poles
    const poleGradient = ctx.createLinearGradient(0, 0, 0, height);
    poleGradient.addColorStop(0, 'rgba(180, 160, 120, 0.4)');
    poleGradient.addColorStop(0.15, 'rgba(180, 160, 120, 0)');
    poleGradient.addColorStop(0.85, 'rgba(180, 160, 120, 0)');
    poleGradient.addColorStop(1, 'rgba(180, 160, 120, 0.4)');
    ctx.fillStyle = poleGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle noise texture
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 200 + Math.floor(Math.random() * 55);
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 10}, ${brightness - 30}, 0.08)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateUranusTexture(ctx, width, height) {
    // Uranus: Uniform cyan-blue with very subtle banding

    // Base gradient - cyan/teal color
    const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
    baseGradient.addColorStop(0, 'rgb(160, 210, 220)');
    baseGradient.addColorStop(0.3, 'rgb(180, 225, 235)');
    baseGradient.addColorStop(0.5, 'rgb(190, 230, 240)');
    baseGradient.addColorStop(0.7, 'rgb(180, 225, 235)');
    baseGradient.addColorStop(1, 'rgb(160, 210, 220)');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    // Very subtle horizontal bands
    for (let i = 0; i < 8; i++) {
        const y = (height / 8) * i;
        const bandHeight = height / 16;
        ctx.fillStyle = `rgba(150, 200, 215, ${0.1 + (i % 2) * 0.1})`;
        ctx.fillRect(0, y, width, bandHeight);
    }

    // Polar brightening
    const poleGradient = ctx.createLinearGradient(0, 0, 0, height);
    poleGradient.addColorStop(0, 'rgba(220, 245, 255, 0.3)');
    poleGradient.addColorStop(0.2, 'rgba(220, 245, 255, 0)');
    poleGradient.addColorStop(0.8, 'rgba(220, 245, 255, 0)');
    poleGradient.addColorStop(1, 'rgba(220, 245, 255, 0.3)');
    ctx.fillStyle = poleGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 180 + Math.floor(Math.random() * 60);
        ctx.fillStyle = `rgba(${brightness}, ${brightness + 20}, ${brightness + 30}, 0.05)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateNeptuneTexture(ctx, width, height) {
    // Neptune: Deep blue with dark spots and white clouds

    // Base deep blue gradient
    const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
    baseGradient.addColorStop(0, 'rgb(50, 80, 180)');
    baseGradient.addColorStop(0.3, 'rgb(60, 100, 200)');
    baseGradient.addColorStop(0.5, 'rgb(70, 110, 210)');
    baseGradient.addColorStop(0.7, 'rgb(60, 100, 200)');
    baseGradient.addColorStop(1, 'rgb(50, 80, 180)');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    // Horizontal bands
    for (let i = 0; i < 12; i++) {
        const y = (height / 12) * i;
        const bandHeight = height / 24;
        const alpha = 0.15 + (i % 3) * 0.05;
        ctx.fillStyle = `rgba(40, 70, 160, ${alpha})`;
        ctx.fillRect(0, y, width, bandHeight);
    }

    // Great Dark Spot
    const gdsX = width * 0.35;
    const gdsY = height * 0.45;
    const gdsGradient = ctx.createRadialGradient(gdsX, gdsY, 0, gdsX, gdsY, width * 0.08);
    gdsGradient.addColorStop(0, 'rgba(30, 50, 120, 0.8)');
    gdsGradient.addColorStop(0.5, 'rgba(40, 60, 140, 0.5)');
    gdsGradient.addColorStop(1, 'rgba(60, 100, 200, 0)');
    ctx.fillStyle = gdsGradient;
    ctx.beginPath();
    ctx.ellipse(gdsX, gdsY, width * 0.06, height * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // White cloud streaks
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * width;
        const y = height * 0.3 + Math.random() * height * 0.4;
        const cloudWidth = 30 + Math.random() * 60;
        const cloudHeight = 3 + Math.random() * 8;
        ctx.fillStyle = `rgba(220, 230, 255, ${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(x, y, cloudWidth, cloudHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Blue noise texture
    for (let i = 0; i < 2500; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 60 + Math.floor(Math.random() * 80);
        ctx.fillStyle = `rgba(${brightness}, ${brightness + 30}, ${brightness + 120}, 0.08)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generatePlutoTexture(ctx, width, height) {
    // Pluto: Tan/brown with distinctive heart-shaped region

    // Base tan/brown surface
    ctx.fillStyle = 'rgb(180, 160, 130)';
    ctx.fillRect(0, 0, width, height);

    // Add terrain variation with gradients
    const terrainGradient = ctx.createLinearGradient(0, 0, width, height);
    terrainGradient.addColorStop(0, 'rgba(120, 100, 80, 0.4)');
    terrainGradient.addColorStop(0.3, 'rgba(180, 160, 130, 0)');
    terrainGradient.addColorStop(0.6, 'rgba(200, 180, 150, 0.3)');
    terrainGradient.addColorStop(1, 'rgba(140, 120, 90, 0.4)');
    ctx.fillStyle = terrainGradient;
    ctx.fillRect(0, 0, width, height);

    // Tombaugh Regio (heart-shaped nitrogen ice)
    const heartX = width * 0.5;
    const heartY = height * 0.5;
    const lobeRadius = width * 0.08;

    // Create heart shape with two circles and a triangle
    ctx.fillStyle = 'rgb(230, 220, 200)';
    ctx.beginPath();
    // Left lobe
    ctx.arc(heartX - lobeRadius * 0.7, heartY - lobeRadius * 0.3, lobeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    // Right lobe
    ctx.arc(heartX + lobeRadius * 0.7, heartY - lobeRadius * 0.3, lobeRadius, 0, Math.PI * 2);
    ctx.fill();
    // Bottom triangle part
    ctx.beginPath();
    ctx.moveTo(heartX - lobeRadius * 1.5, heartY);
    ctx.lineTo(heartX + lobeRadius * 1.5, heartY);
    ctx.lineTo(heartX, heartY + lobeRadius * 1.2);
    ctx.closePath();
    ctx.fill();

    // Add some texture to the heart
    for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * lobeRadius * 1.2;
        const x = heartX + Math.cos(angle) * dist;
        const y = heartY + Math.sin(angle) * dist * 0.8;
        ctx.fillStyle = `rgba(240, 230, 210, ${0.1 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add crater-like dark features
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        // Skip if inside heart region
        const dx = x - heartX;
        const dy = y - heartY;
        if (Math.sqrt(dx * dx + dy * dy) < lobeRadius * 1.5) continue;

        const size = 3 + Math.random() * 10;
        ctx.fillStyle = `rgba(100, 80, 60, ${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Surface noise
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 140 + Math.floor(Math.random() * 80);
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 20}, ${brightness - 40}, 0.08)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateCeresTexture(ctx, width, height) {
    // Ceres: Gray with bright spots (like Occator crater)

    // Base gray surface
    ctx.fillStyle = 'rgb(130, 130, 130)';
    ctx.fillRect(0, 0, width, height);

    // Terrain variation
    const terrainGradient = ctx.createRadialGradient(
        width * 0.3, height * 0.3, 0,
        width * 0.3, height * 0.3, width * 0.6
    );
    terrainGradient.addColorStop(0, 'rgba(160, 160, 160, 0.3)');
    terrainGradient.addColorStop(0.5, 'rgba(130, 130, 130, 0)');
    terrainGradient.addColorStop(1, 'rgba(90, 90, 90, 0.3)');
    ctx.fillStyle = terrainGradient;
    ctx.fillRect(0, 0, width, height);

    // Craters
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 5 + Math.random() * 20;

        // Crater rim (lighter)
        ctx.fillStyle = `rgba(160, 160, 160, ${0.3 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Crater floor (darker)
        ctx.fillStyle = `rgba(90, 90, 90, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    // Bright spots (Occator crater) - main spot
    const spot1X = width * 0.4;
    const spot1Y = height * 0.35;
    const spot1Gradient = ctx.createRadialGradient(spot1X, spot1Y, 0, spot1X, spot1Y, width * 0.04);
    spot1Gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    spot1Gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    spot1Gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
    ctx.fillStyle = spot1Gradient;
    ctx.beginPath();
    ctx.arc(spot1X, spot1Y, width * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Smaller bright spot nearby
    const spot2X = width * 0.42;
    const spot2Y = height * 0.37;
    const spot2Gradient = ctx.createRadialGradient(spot2X, spot2Y, 0, spot2X, spot2Y, width * 0.02);
    spot2Gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    spot2Gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
    spot2Gradient.addColorStop(1, 'rgba(180, 180, 180, 0)');
    ctx.fillStyle = spot2Gradient;
    ctx.beginPath();
    ctx.arc(spot2X, spot2Y, width * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Surface noise
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 100 + Math.floor(Math.random() * 80);
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.1)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function generateGenericTexture(ctx, width, height, baseColorHex) {
    const color = new THREE.Color(baseColorHex);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    // Base color fill
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);

    // Add some variation
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)}, 0.3)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0)`);
    gradient.addColorStop(1, `rgba(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)}, 0.3)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Surface noise
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const variation = Math.floor(Math.random() * 40 - 20);
        ctx.fillStyle = `rgba(${clamp(r + variation, 0, 255)}, ${clamp(g + variation, 0, 255)}, ${clamp(b + variation, 0, 255)}, 0.1)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// ATMOSPHERE, CLOUDS, RINGS
// ============================================

function createAtmosphere(data) {
    const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.05, 32, 32);
    const atmosphereColor = new THREE.Color(data.atmosphereColor || 0x88ccff);

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
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(color, intensity * 0.5);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    return new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
}

function createClouds(data) {
    const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);

    // Generate cloud texture procedurally
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size / 2);
    const pixels = imageData.data;

    for (let y = 0; y < size / 2; y++) {
        for (let x = 0; x < size; x++) {
            const u = x / size;
            const v = y / (size / 2);
            const idx = (y * size + x) * 4;

            // Cloud patterns
            let cloud = noise.fbm(u * 8, v * 8, 5);
            cloud = smoothstep(-0.2, 0.4, cloud);

            // Reduce clouds at poles
            const lat = Math.abs((v - 0.5) * 2);
            cloud *= (1 - lat * 0.5);

            pixels[idx] = 255;
            pixels[idx + 1] = 255;
            pixels[idx + 2] = 255;
            pixels[idx + 3] = cloud * 200;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const cloudTexture = new THREE.CanvasTexture(canvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;

    const cloudMaterial = new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    });

    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.userData.isClouds = true;
    return clouds;
}

function createRings(data) {
    const innerRadius = data.ringInnerRadius || data.radius * 1.4;
    const outerRadius = data.ringOuterRadius || data.radius * 2.5;

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    // Generate ring texture
    const width = 512;
    const height = 64;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let x = 0; x < width; x++) {
        const t = x / width;

        // Ring structure with gaps
        let density = 0;

        if (data.nameEn === 'Saturn') {
            // Saturn's complex ring structure
            // C Ring (inner, faint)
            if (t > 0.05 && t < 0.25) {
                density = 0.3 + noise.noise2D(t * 50, 0) * 0.1;
            }
            // B Ring (brightest)
            if (t > 0.28 && t < 0.55) {
                density = 0.8 + noise.noise2D(t * 100, 0) * 0.15;
            }
            // Cassini Division (gap)
            if (t > 0.55 && t < 0.60) {
                density = 0.05;
            }
            // A Ring
            if (t > 0.60 && t < 0.85) {
                density = 0.6 + noise.noise2D(t * 80, 0) * 0.1;
                // Encke Gap
                if (t > 0.77 && t < 0.78) density = 0.05;
            }
            // F Ring (outer, thin)
            if (t > 0.90 && t < 0.92) {
                density = 0.4;
            }
        } else {
            // Simple rings for other planets
            density = (1 - Math.abs(t - 0.5) * 2) * 0.5;
            density += noise.noise2D(t * 30, 0) * 0.1;
            density = Math.max(0, density);
        }

        // Ring color
        const baseColor = data.ringColors ?
            new THREE.Color(data.ringColors[Math.floor(t * data.ringColors.length) % data.ringColors.length]) :
            new THREE.Color(data.ringColor || 0xccbbaa);

        for (let y = 0; y < height; y++) {
            const idx = (y * width + x) * 4;
            const variation = noise.noise2D(t * 200, y * 0.5) * 0.1;

            pixels[idx] = clamp(baseColor.r * 255 + variation * 30, 0, 255);
            pixels[idx + 1] = clamp(baseColor.g * 255 + variation * 25, 0, 255);
            pixels[idx + 2] = clamp(baseColor.b * 255 + variation * 20, 0, 255);
            pixels[idx + 3] = clamp(density * 255, 0, 255);
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const ringTexture = new THREE.CanvasTexture(canvas);
    ringTexture.rotation = Math.PI / 2;

    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false
    });

    // Adjust UVs
    const pos = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    const v3 = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        const dist = v3.length();
        const t = (dist - innerRadius) / (outerRadius - innerRadius);
        uv.setXY(i, t, 0.5);
    }

    return new THREE.Mesh(ringGeometry, ringMaterial);
}

function createOrbitLine(distance, inclination = 0) {
    const points = [];
    const segments = 128;

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
        color: 0x334466,
        transparent: true,
        opacity: 0.3
    });

    const line = new THREE.Line(geometry, material);
    line.rotation.x = THREE.MathUtils.degToRad(inclination);

    return line;
}
