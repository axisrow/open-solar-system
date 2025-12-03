// Asteroids module - creates asteroid belts using InstancedMesh for performance
import * as THREE from 'three';
import { ASTEROID_BELT_CONFIG } from './data/solarSystemData.js';

export function createAsteroidBelts() {
    const belts = [];

    // Main asteroid belt
    const mainBelt = createAsteroidBelt(ASTEROID_BELT_CONFIG.main);
    belts.push(mainBelt);

    // Kuiper belt
    const kuiperBelt = createAsteroidBelt(ASTEROID_BELT_CONFIG.kuiper);
    belts.push(kuiperBelt);

    return belts;
}

function createAsteroidBelt(config) {
    const {
        innerRadius,
        outerRadius,
        count,
        minSize,
        maxSize,
        color,
        heightVariation,
        orbitSpeedRange
    } = config;

    // Create asteroid geometry - use low poly for performance
    const geometry = new THREE.IcosahedronGeometry(1, 0);

    // Slightly deform geometry for more natural look
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const noise = 0.8 + Math.random() * 0.4;
        positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geometry.computeVertexNormals();

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.2,
        flatShading: true
    });

    // Create InstancedMesh
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;

    // Store asteroid data for animation
    const asteroidData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        // Random position in belt
        const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * heightVariation;

        // Random size
        const scale = minSize + Math.random() * (maxSize - minSize);

        // Random orbit speed
        const orbitSpeed = orbitSpeedRange[0] + Math.random() * (orbitSpeedRange[1] - orbitSpeedRange[0]);

        // Random rotation
        const rotationSpeed = (Math.random() - 0.5) * 0.5;

        // Store data
        asteroidData.push({
            distance,
            angle,
            height,
            scale,
            orbitSpeed,
            rotationSpeed,
            rotationX: Math.random() * Math.PI * 2,
            rotationY: Math.random() * Math.PI * 2,
            rotationZ: Math.random() * Math.PI * 2
        });

        // Set initial position
        dummy.position.set(
            Math.cos(angle) * distance,
            height,
            Math.sin(angle) * distance
        );
        dummy.scale.setScalar(scale);
        dummy.rotation.set(
            asteroidData[i].rotationX,
            asteroidData[i].rotationY,
            asteroidData[i].rotationZ
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    return {
        mesh,
        asteroidData,
        config,
        update(delta) {
            const dummy = new THREE.Object3D();

            for (let i = 0; i < count; i++) {
                const data = asteroidData[i];

                // Update orbit angle
                data.angle += data.orbitSpeed * delta;

                // Update rotation
                data.rotationX += data.rotationSpeed * delta;
                data.rotationY += data.rotationSpeed * delta * 0.7;

                // Calculate new position
                dummy.position.set(
                    Math.cos(data.angle) * data.distance,
                    data.height,
                    Math.sin(data.angle) * data.distance
                );
                dummy.scale.setScalar(data.scale);
                dummy.rotation.set(data.rotationX, data.rotationY, data.rotationZ);
                dummy.updateMatrix();

                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;
        }
    };
}

// Create a special asteroid (like Ceres visual marker)
export function createSpecialAsteroid(radius, distance, color) {
    const geometry = new THREE.IcosahedronGeometry(radius, 1);

    // Deform for irregular shape
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const noise = 0.85 + Math.random() * 0.3;
        positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.85,
        metalness: 0.15,
        flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}
