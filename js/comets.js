// Comets module - creates comets with dynamic tails
import * as THREE from 'three';
import { COMETS_DATA } from './data/solarSystemData.js';

export function createComets() {
    return COMETS_DATA.map(cometData => createComet(cometData));
}

function createComet(data) {
    const group = new THREE.Group();

    // Comet nucleus (irregular shape)
    const nucleusGeometry = new THREE.IcosahedronGeometry(data.radius, 1);
    deformGeometry(nucleusGeometry, 0.3);

    const nucleusMaterial = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
    });

    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    group.add(nucleus);

    // Coma (gas cloud around nucleus)
    const comaGeometry = new THREE.SphereGeometry(data.radius * 3, 16, 16);
    const comaMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaccff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const coma = new THREE.Mesh(comaGeometry, comaMaterial);
    group.add(coma);

    // Ion tail (blue, points away from sun)
    const ionTail = createIonTail(data);
    group.add(ionTail);

    // Dust tail (yellowish, curved)
    const dustTail = createDustTail(data);
    group.add(dustTail);

    // Calculate elliptical orbit
    const semiMajorAxis = (data.perihelion + data.aphelion) / 2;
    const eccentricity = (data.aphelion - data.perihelion) / (data.aphelion + data.perihelion);

    // Orbit inclination
    group.rotation.x = THREE.MathUtils.degToRad(data.orbitInclination);

    // Create orbit line
    const orbitLine = createCometOrbitLine(data.perihelion, data.aphelion, 0);
    group.add(orbitLine);

    // Store comet state
    const comet = {
        group,
        mesh: nucleus,
        nucleus,
        coma,
        ionTail,
        dustTail,
        orbitLine,
        data,
        angle: data.currentAngle || 0,
        semiMajorAxis,
        eccentricity,
        update(delta) {
            // Calculate orbital speed (faster near perihelion - Kepler's second law)
            const distance = this.getCurrentDistance();
            const speedFactor = Math.pow(data.perihelion / distance, 1.5);
            this.angle += data.orbitSpeed * speedFactor * delta;

            // Calculate position on elliptical orbit
            const x = semiMajorAxis * (Math.cos(this.angle) - eccentricity);
            const z = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(this.angle);

            nucleus.position.set(x, 0, z);
            coma.position.copy(nucleus.position);

            // Update tails direction (always point away from sun)
            const sunDir = nucleus.position.clone().normalize();

            // Ion tail - straight away from sun
            ionTail.position.copy(nucleus.position);
            ionTail.lookAt(nucleus.position.clone().add(sunDir.multiplyScalar(100)));
            ionTail.rotateX(Math.PI / 2);

            // Dust tail - slightly curved
            dustTail.position.copy(nucleus.position);
            const dustDir = sunDir.clone();
            dustDir.y += 0.2; // Slight curve
            dustDir.normalize();
            dustTail.lookAt(nucleus.position.clone().add(dustDir.multiplyScalar(100)));
            dustTail.rotateX(Math.PI / 2);

            // Scale tails based on distance to sun (bigger near sun)
            const tailScale = Math.max(0.2, Math.min(2, data.perihelion / distance));
            ionTail.scale.setScalar(tailScale);
            dustTail.scale.setScalar(tailScale * 0.8);

            // Update coma size
            coma.scale.setScalar(0.5 + tailScale * 0.5);

            // Update tail materials
            ionTail.material.uniforms.time.value += delta;
            dustTail.material.uniforms.time.value += delta;

            // Nucleus rotation
            nucleus.rotation.x += delta * 0.5;
            nucleus.rotation.y += delta * 0.3;
        },
        getCurrentDistance() {
            return nucleus.position.length();
        },
        getWorldPosition() {
            const pos = new THREE.Vector3();
            nucleus.getWorldPosition(pos);
            return pos;
        }
    };

    return comet;
}

function deformGeometry(geometry, amount) {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const noise = 1 + (Math.random() - 0.5) * amount;
        positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geometry.computeVertexNormals();
}

function createIonTail(data) {
    const tailLength = 80;
    const tailGeometry = new THREE.ConeGeometry(2, tailLength, 16, 8, true);

    const tailMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(data.tailColor) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vY;
            void main() {
                vUv = uv;
                vY = position.y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            varying float vY;

            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                // Fade based on distance from nucleus
                float fade = 1.0 - smoothstep(0.0, 1.0, (vY + 40.0) / 80.0);
                fade = pow(fade, 0.5);

                // Add streaks
                float streak = sin(vUv.x * 30.0 + time * 5.0) * 0.5 + 0.5;
                streak = pow(streak, 3.0);

                // Flickering
                float flicker = 0.7 + 0.3 * sin(time * 10.0 + vUv.y * 20.0);

                float alpha = fade * (0.3 + streak * 0.2) * flicker;

                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    return tail;
}

function createDustTail(data) {
    const tailLength = 60;

    // Create curved tail geometry
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, tailLength * 0.3, 0),
        new THREE.Vector3(5, tailLength * 0.6, 0),
        new THREE.Vector3(10, tailLength, 0)
    ]);

    const tailGeometry = new THREE.TubeGeometry(curve, 32, 3, 8, false);

    const tailMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(data.dustTailColor) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;

            void main() {
                // Fade along length
                float fade = 1.0 - smoothstep(0.0, 1.0, vUv.x);
                fade = pow(fade, 0.7);

                // Particles effect
                float particles = sin(vUv.y * 50.0 + time * 2.0) * 0.5 + 0.5;
                particles *= sin(vUv.x * 30.0 - time * 3.0) * 0.5 + 0.5;

                float alpha = fade * (0.2 + particles * 0.15);

                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.z = 0.3; // Slight curve offset
    return tail;
}

function createCometOrbitLine(perihelion, aphelion, inclination) {
    const semiMajorAxis = (perihelion + aphelion) / 2;
    const eccentricity = (aphelion - perihelion) / (aphelion + perihelion);
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

    const points = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = semiMajorAxis * Math.cos(angle) - semiMajorAxis * eccentricity;
        const z = semiMinorAxis * Math.sin(angle);
        points.push(new THREE.Vector3(x, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: 0x446688,
        transparent: true,
        opacity: 0.3,
        dashSize: 5,
        gapSize: 3
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();

    return line;
}
