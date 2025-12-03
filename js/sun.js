// Sun module with glowing effects
import * as THREE from 'three';
import { SUN_DATA } from './data/solarSystemData.js';

export function createSun() {
    const group = new THREE.Group();
    const data = SUN_DATA;

    // Main sun sphere
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);

    // Custom shader material for animated sun surface
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0xffdd00) },
            color2: { value: new THREE.Color(0xff6600) },
            color3: { value: new THREE.Color(0xff3300) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 color3;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {
                vec3 pos = vPosition * 0.05;

                // Multiple layers of noise for turbulent effect
                float n1 = snoise(pos + time * 0.1) * 0.5 + 0.5;
                float n2 = snoise(pos * 2.0 - time * 0.15) * 0.5 + 0.5;
                float n3 = snoise(pos * 4.0 + time * 0.2) * 0.5 + 0.5;

                float noise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

                // Create solar flare patterns
                float flare = pow(noise, 2.0);

                // Mix colors based on noise
                vec3 color = mix(color1, color2, noise);
                color = mix(color, color3, flare * 0.5);

                // Add brightness variation
                float brightness = 0.8 + noise * 0.4;
                color *= brightness;

                // Edge darkening (limb darkening effect)
                float limb = 1.0 - pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.3);
                color *= 0.7 + limb * 0.3;

                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const sunMesh = new THREE.Mesh(geometry, sunMaterial);
    group.add(sunMesh);

    // Glow effect using sprite
    const glowMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(),
        color: 0xff8800,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(data.radius * 2.5, data.radius * 2.5, 1);
    group.add(glowSprite);

    // Corona effect
    const coronaGeometry = new THREE.SphereGeometry(data.radius * 1.2, 32, 32);
    const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xff6600) }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec3 vNormal;

            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                float pulse = 0.9 + 0.1 * sin(time * 1.5);
                gl_FragColor = vec4(color, intensity * 0.2 * pulse);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    group.add(corona);

    // Solar prominences (протуберанцы)
    const prominenceManager = new ProminenceManager(data.radius, 5);
    group.add(prominenceManager.group);

    return {
        group,
        mesh: sunMesh,
        data,
        corona,
        glowSprite,
        prominenceManager,
        update(delta, camera) {
            sunMaterial.uniforms.time.value += delta;
            coronaMaterial.uniforms.time.value += delta;

            // Update prominences with camera for limb visibility
            prominenceManager.update(delta, camera);

            // Subtle rotation
            sunMesh.rotation.y += delta * 0.02;
        }
    };
}

function createGlowTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
    gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Simplex noise for prominences (same as sun surface shader)
const SIMPLEX_NOISE_GLSL = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
`;

// Generate a bezier arc path for prominence
function createProminenceArcPath(sunRadius, height, arcAngle, tiltAngle) {
    const baseRadius = sunRadius * 1.02; // Slightly above surface

    const startAngle = -arcAngle / 2;
    const endAngle = arcAngle / 2;

    const start = new THREE.Vector3(
        Math.cos(startAngle) * baseRadius,
        0,
        Math.sin(startAngle) * baseRadius
    );

    const end = new THREE.Vector3(
        Math.cos(endAngle) * baseRadius,
        0,
        Math.sin(endAngle) * baseRadius
    );

    // Control point at apex - creates the arc
    const midRadius = baseRadius + height;
    const control = new THREE.Vector3(
        0,
        height * 0.8, // Vertical component for 3D arc
        midRadius * 0.3
    );

    return new THREE.QuadraticBezierCurve3(start, control, end);
}

// Create tube geometry with custom arcProgress attribute
function createProminenceTubeGeometry(curve, tubeRadius, segments) {
    const geometry = new THREE.TubeGeometry(curve, segments, tubeRadius, 8, false);

    // Add arcProgress attribute (0 at base, 1 at tip, back to 0)
    const positions = geometry.attributes.position;
    const arcProgress = new Float32Array(positions.count);

    const radialSegments = 8;
    for (let i = 0; i <= segments; i++) {
        // Progress goes 0 -> 1 -> 0 (from start through apex to end)
        let progress = i / segments;
        progress = 1.0 - Math.abs(progress * 2.0 - 1.0); // Peak at 0.5

        for (let j = 0; j <= radialSegments; j++) {
            const index = i * (radialSegments + 1) + j;
            arcProgress[index] = progress;
        }
    }

    geometry.setAttribute('arcProgress', new THREE.BufferAttribute(arcProgress, 1));

    return geometry;
}

// Create prominence shader material
function createProminenceMaterial(phaseOffset) {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            phaseOffset: { value: phaseOffset },
            color1: { value: new THREE.Color(0xff6600) }, // Orange
            color2: { value: new THREE.Color(0xffdd00) }, // Yellow
            color3: { value: new THREE.Color(0xff3300) }, // Red
            opacity: { value: 1.0 },
            cameraPosition: { value: new THREE.Vector3() },
            sunCenter: { value: new THREE.Vector3(0, 0, 0) }
        },
        vertexShader: `
            uniform float time;
            uniform float phaseOffset;

            attribute float arcProgress;

            varying float vArcProgress;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            ${SIMPLEX_NOISE_GLSL}

            void main() {
                vArcProgress = arcProgress;
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;

                vec3 pos = position;

                // Wave animation along the arc
                float wave = sin(arcProgress * 6.28 + time * 2.5 + phaseOffset) * 2.0;
                wave *= arcProgress; // Stronger at peak

                // Turbulent noise displacement
                float noise = snoise(vec3(pos.x * 0.08, pos.y * 0.08, time * 0.3 + phaseOffset)) * 3.0;
                noise *= arcProgress; // More turbulent at peak

                // Apply displacement perpendicular to surface
                pos += normal * (wave + noise) * 0.5;

                // Breathing/pulsing effect
                float pulse = 1.0 + 0.08 * sin(time * 1.8 + phaseOffset);
                pos *= pulse;

                vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float phaseOffset;
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 color3;
            uniform float opacity;
            uniform vec3 cameraPosition;
            uniform vec3 sunCenter;

            varying float vArcProgress;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                // Limb visibility - only show on edge of sun relative to camera
                vec3 toCamera = normalize(cameraPosition - sunCenter);
                vec3 surfaceDir = normalize(vWorldPosition - sunCenter);
                float limbFactor = 1.0 - abs(dot(toCamera, surfaceDir));
                limbFactor = pow(limbFactor, 0.4);

                // Fade if not on limb
                if (limbFactor < 0.25) discard;
                float limbAlpha = smoothstep(0.25, 0.55, limbFactor);

                // Fade toward ends of arc (base points)
                float arcFade = pow(vArcProgress, 0.5);

                // Core brightness (center of tube brighter)
                float coreIntensity = 0.7 + 0.3 * (1.0 - abs(vUv.x - 0.5) * 2.0);

                // Color mixing - more yellow at peak, more red at edges
                vec3 color = mix(color1, color2, vArcProgress * 0.6);
                color = mix(color, color3, (1.0 - vArcProgress) * 0.4);

                // Flowing plasma streaks
                float streak = sin(vArcProgress * 25.0 - time * 5.0 + phaseOffset) * 0.5 + 0.5;
                streak = pow(streak, 4.0);
                color += color2 * streak * 0.25;

                // Flickering
                float flicker = 0.85 + 0.15 * sin(time * 10.0 + vArcProgress * 8.0 + phaseOffset);

                // Final alpha
                float alpha = arcFade * limbAlpha * flicker * coreIntensity * opacity * 0.75;

                // HDR output for bloom (values > 1.0)
                gl_FragColor = vec4(color * (1.2 + coreIntensity * 0.3), alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });
}

// Prominence Manager class
class ProminenceManager {
    constructor(sunRadius, prominenceCount = 5) {
        this.sunRadius = sunRadius;
        this.group = new THREE.Group();
        this.prominences = [];
        this.sunCenter = new THREE.Vector3(0, 0, 0);

        // Create initial prominences
        for (let i = 0; i < prominenceCount; i++) {
            this.createProminence(i, prominenceCount);
        }
    }

    createProminence(index, totalCount) {
        // Distribute around the sun
        const baseAngle = (index / totalCount) * Math.PI * 2;
        // Add some randomness to position
        const angle = baseAngle + (Math.random() - 0.5) * 0.5;

        // Random height (20% to 70% of sun radius)
        const height = this.sunRadius * (0.2 + Math.random() * 0.5);

        // Arc span (how wide the arc is)
        const arcAngle = 0.25 + Math.random() * 0.35; // 0.25 to 0.6 radians

        // Tilt angle for 3D variation
        const tiltAngle = (Math.random() - 0.5) * Math.PI * 0.3;

        // Create arc path
        const curve = createProminenceArcPath(this.sunRadius, height, arcAngle, tiltAngle);

        // Tube radius (thinner = more realistic)
        const tubeRadius = 1.5 + Math.random() * 1.5; // 1.5 to 3.0 units

        // Create geometry and material
        const geometry = createProminenceTubeGeometry(curve, tubeRadius, 40);
        const material = createProminenceMaterial(Math.random() * Math.PI * 2);

        const mesh = new THREE.Mesh(geometry, material);

        // Position and rotate around sun
        mesh.rotation.y = angle;
        mesh.rotation.x = tiltAngle;

        const prominence = {
            mesh,
            baseAngle: angle,
            height,
            lifetime: 15 + Math.random() * 25, // 15-40 seconds
            age: Math.random() * 10, // Start at random age for variety
            phase: Math.random() * Math.PI * 2,
            index
        };

        this.prominences.push(prominence);
        this.group.add(mesh);

        return prominence;
    }

    respawnProminence(index) {
        const old = this.prominences[index];

        // Remove old mesh
        this.group.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.dispose();

        // Remove from array
        this.prominences.splice(index, 1);

        // Create new prominence
        this.createProminence(index, 5);
    }

    update(delta, camera) {
        this.prominences.forEach((prominence, index) => {
            const material = prominence.mesh.material;

            // Update shader uniforms
            material.uniforms.time.value += delta;

            if (camera) {
                material.uniforms.cameraPosition.value.copy(camera.position);
            }

            // Age and lifecycle
            prominence.age += delta;

            // Fade in/out based on lifecycle
            const fadeInDuration = 3.0;
            const fadeOutStart = prominence.lifetime - 3.0;

            let opacity = 1.0;
            if (prominence.age < fadeInDuration) {
                opacity = prominence.age / fadeInDuration;
            } else if (prominence.age > fadeOutStart) {
                opacity = Math.max(0, 1.0 - (prominence.age - fadeOutStart) / 3.0);
            }

            material.uniforms.opacity.value = opacity;

            // Respawn if lifetime exceeded
            if (prominence.age > prominence.lifetime) {
                this.respawnProminence(index);
            }
        });
    }
}
