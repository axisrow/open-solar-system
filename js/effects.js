// Visual effects module - star field, nebulae, etc.
import * as THREE from 'three';
import { STAR_FIELD_CONFIG } from './data/solarSystemData.js';

export function createStarField() {
    const { count, radius, minSize, maxSize, colors } = STAR_FIELD_CONFIG;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colorsArray = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        // Random position on sphere
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;

        const r = radius * (0.8 + Math.random() * 0.4); // Slight variation

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Random color from palette
        const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
        colorsArray[i * 3] = color.r;
        colorsArray[i * 3 + 1] = color.g;
        colorsArray[i * 3 + 2] = color.b;

        // Random size with bias toward smaller stars
        sizes[i] = minSize + Math.pow(Math.random(), 2) * (maxSize - minSize);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader for better looking stars
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            varying float vSize;

            void main() {
                vColor = color;
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vSize;

            void main() {
                // Create circular star with glow
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // Core
                float core = 1.0 - smoothstep(0.0, 0.2, dist);

                // Glow
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                glow = pow(glow, 2.0);

                float alpha = core + glow * 0.5;
                if (alpha < 0.01) discard;

                vec3 color = vColor * (core + glow * 0.3);
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const stars = new THREE.Points(geometry, material);

    // Add some brighter "constellation" stars
    const brightStars = createBrightStars(50, radius * 0.9);
    stars.add(brightStars);

    // Add distant galaxies
    const galaxies = createDistantGalaxies(20, radius * 0.95);
    stars.add(galaxies);

    return stars;
}

function createBrightStars(count, radius) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        sizes[i] = 3 + Math.random() * 4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            varying float vSize;

            void main() {
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                // Twinkle effect
                float twinkle = 0.8 + 0.2 * sin(time * 2.0 + position.x * 10.0);

                gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vSize;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // Star shape with rays
                float angle = atan(center.y, center.x);
                float rays = 0.5 + 0.5 * cos(angle * 4.0);

                float core = 1.0 - smoothstep(0.0, 0.15, dist);
                float glow = (1.0 - smoothstep(0.0, 0.5, dist)) * rays;

                float alpha = core + glow * 0.3;
                if (alpha < 0.01) discard;

                vec3 color = vec3(1.0, 0.95, 0.9);
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
}

function createDistantGalaxies(count, radius) {
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        const galaxy = createGalaxySprite();
        galaxy.position.set(x, y, z);
        galaxy.lookAt(0, 0, 0);

        group.add(galaxy);
    }

    return group;
}

function createGalaxySprite() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create spiral galaxy texture
    const centerX = size / 2;
    const centerY = size / 2;

    // Random galaxy type
    const type = Math.random();

    if (type < 0.5) {
        // Spiral galaxy
        ctx.fillStyle = 'rgba(100, 120, 180, 0.8)';
        for (let arm = 0; arm < 2; arm++) {
            for (let i = 0; i < 100; i++) {
                const angle = arm * Math.PI + i * 0.15;
                const r = i * 0.4;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                const dotSize = Math.max(0.5, 2 - i * 0.02);

                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Core
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
        gradient.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 150, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 120, 180, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
    } else {
        // Elliptical galaxy
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 3);
        gradient.addColorStop(0, 'rgba(255, 220, 180, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 180, 120, 0.4)');
        gradient.addColorStop(0.7, 'rgba(200, 150, 100, 0.1)');
        gradient.addColorStop(1, 'rgba(100, 80, 60, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size / 3, size / 4, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(material);
    const scale = 30 + Math.random() * 50;
    sprite.scale.set(scale, scale * (0.5 + Math.random() * 0.5), 1);

    return sprite;
}

// Create meteor shower effect
export function createMeteorShower() {
    const group = new THREE.Group();
    const meteors = [];

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // Line with 2 points

    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = -3;
    positions[4] = -1;
    positions[5] = 0;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0xffffcc,
        transparent: true,
        opacity: 0.8
    });

    // Create pool of meteors
    for (let i = 0; i < 10; i++) {
        const meteor = new THREE.Line(geometry.clone(), material.clone());
        meteor.visible = false;
        meteor.userData = {
            active: false,
            velocity: new THREE.Vector3(),
            life: 0
        };
        meteors.push(meteor);
        group.add(meteor);
    }

    group.userData = {
        meteors,
        spawnTimer: 0,
        update(delta) {
            this.spawnTimer += delta;

            // Randomly spawn new meteors
            if (this.spawnTimer > 2 + Math.random() * 5) {
                this.spawnTimer = 0;
                const meteor = this.meteors.find(m => !m.userData.active);
                if (meteor) {
                    // Spawn at random position
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 500 + Math.random() * 200;
                    meteor.position.set(
                        Math.cos(angle) * distance,
                        100 + Math.random() * 200,
                        Math.sin(angle) * distance
                    );

                    // Random velocity toward center-ish
                    meteor.userData.velocity.set(
                        -Math.cos(angle) * (50 + Math.random() * 50),
                        -30 - Math.random() * 20,
                        -Math.sin(angle) * (50 + Math.random() * 50)
                    );

                    meteor.userData.active = true;
                    meteor.userData.life = 2 + Math.random() * 2;
                    meteor.visible = true;
                    meteor.material.opacity = 0.8;
                }
            }

            // Update active meteors
            this.meteors.forEach(meteor => {
                if (meteor.userData.active) {
                    meteor.position.add(meteor.userData.velocity.clone().multiplyScalar(delta));
                    meteor.userData.life -= delta;

                    // Fade out
                    if (meteor.userData.life < 0.5) {
                        meteor.material.opacity = meteor.userData.life * 2;
                    }

                    // Deactivate when life ends
                    if (meteor.userData.life <= 0) {
                        meteor.userData.active = false;
                        meteor.visible = false;
                    }

                    // Update line direction based on velocity
                    const direction = meteor.userData.velocity.clone().normalize();
                    const positions = meteor.geometry.attributes.position.array;
                    positions[3] = -direction.x * 5;
                    positions[4] = -direction.y * 5;
                    positions[5] = -direction.z * 5;
                    meteor.geometry.attributes.position.needsUpdate = true;
                }
            });
        }
    };

    return group;
}
