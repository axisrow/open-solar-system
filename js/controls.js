// Camera controller module - handles camera movements, following objects, etc.
import * as THREE from 'three';

export class CameraController {
    constructor(camera, orbitControls) {
        this.camera = camera;
        this.controls = orbitControls;

        // Follow mode
        this.followTarget = null;
        this.followOffset = new THREE.Vector3(0, 20, 50);
        this.isFollowing = false;

        // Transition
        this.isTransitioning = false;
        this.transitionStart = new THREE.Vector3();
        this.transitionEnd = new THREE.Vector3();
        this.transitionTargetStart = new THREE.Vector3();
        this.transitionTargetEnd = new THREE.Vector3();
        this.transitionProgress = 0;
        this.transitionDuration = 2; // seconds
        this.transitionCallback = null;

        // Free flight mode
        this.isFreeFlightMode = false;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 100;
        this.keys = {};

        // Setup keyboard controls
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Toggle free flight mode with F key
            if (e.code === 'KeyF') {
                this.toggleFreeFlightMode();
            }

            // Escape to exit follow mode
            if (e.code === 'Escape') {
                if (this.isFollowing) {
                    this.stopFollowing();
                }
                if (this.isFreeFlightMode) {
                    this.toggleFreeFlightMode();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    toggleFreeFlightMode() {
        this.isFreeFlightMode = !this.isFreeFlightMode;
        this.controls.enabled = !this.isFreeFlightMode;

        if (this.isFreeFlightMode) {
            // Stop following when entering free flight
            this.stopFollowing();
            document.body.style.cursor = 'crosshair';
        } else {
            document.body.style.cursor = 'grab';
        }
    }

    flyTo(target, callback) {
        if (!target) return;

        this.isTransitioning = true;
        this.transitionProgress = 0;

        // Get target position
        const targetPos = target.getWorldPosition ? target.getWorldPosition() : target.position.clone();

        // Calculate camera end position
        let offset;

        // For satellites (Hubble) - camera perpendicular to Earth's surface
        if (target.data && target.data.type === 'satellite' && target.parentPlanet) {
            const earthPos = target.parentPlanet.getWorldPosition();
            const hubblePos = targetPos.clone();

            // Radial direction from Earth to Hubble
            const radialDir = hubblePos.clone().sub(earthPos).normalize();
            const distance = 0.3;  // Very close to telescope

            // Тангенциальное направление (вдоль орбиты)
            const worldUp = new THREE.Vector3(0, 1, 0);
            const tangentDir = new THREE.Vector3().crossVectors(worldUp, radialDir).normalize();
            // Направление "вверх" относительно орбиты
            const elevatedDir = new THREE.Vector3().crossVectors(radialDir, tangentDir).normalize();

            // Угол 45° сверху-сбоку: радиальный + тангенциальный + возвышенный
            offset = new THREE.Vector3()
                .addScaledVector(radialDir, distance * 0.707)   // 45° от поверхности
                .addScaledVector(tangentDir, distance * 0.35)   // сбоку
                .addScaledVector(elevatedDir, distance * 0.35); // сверху

            // Save offset for follow mode
            this.followOffset = offset.clone();
        } else {
            // Standard behavior for planets
            const distance = target.data ? target.data.radius * 5 + 20 : 50;
            offset = new THREE.Vector3(distance, distance * 0.5, distance);
        }

        this.transitionStart.copy(this.camera.position);
        this.transitionEnd.copy(targetPos).add(offset);

        this.transitionTargetStart.copy(this.controls.target);
        this.transitionTargetEnd.copy(targetPos);

        this.transitionCallback = callback;

        // Start following after transition
        this.followTarget = target;
    }

    followObject(target) {
        if (!target) return;

        this.flyTo(target, () => {
            this.isFollowing = true;
            this.followTarget = target;

            // Calculate offset based on object size
            const radius = target.data ? target.data.radius : 10;
            this.followOffset.set(radius * 3, radius * 1.5, radius * 3);
        });
    }

    stopFollowing() {
        this.isFollowing = false;
        this.followTarget = null;
    }

    resetCamera() {
        this.stopFollowing();
        this.isTransitioning = true;
        this.transitionProgress = 0;

        this.transitionStart.copy(this.camera.position);
        this.transitionEnd.set(200, 150, 300);

        this.transitionTargetStart.copy(this.controls.target);
        this.transitionTargetEnd.set(0, 0, 0);
    }

    update(delta) {
        // Handle transition
        if (this.isTransitioning) {
            this.transitionProgress += delta / this.transitionDuration;

            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.isTransitioning = false;

                if (this.transitionCallback) {
                    this.transitionCallback();
                    this.transitionCallback = null;
                }
            }

            // Smooth easing
            const t = this.easeInOutCubic(this.transitionProgress);

            // Interpolate camera position
            this.camera.position.lerpVectors(
                this.transitionStart,
                this.transitionEnd,
                t
            );

            // Interpolate look target
            this.controls.target.lerpVectors(
                this.transitionTargetStart,
                this.transitionTargetEnd,
                t
            );
        }

        // Handle following
        if (this.isFollowing && this.followTarget && !this.isTransitioning) {
            const targetPos = this.followTarget.getWorldPosition
                ? this.followTarget.getWorldPosition()
                : this.followTarget.position.clone();

            // For satellites - update offset as it moves in orbit (45° сверху-сбоку)
            if (this.followTarget.data && this.followTarget.data.type === 'satellite' && this.followTarget.parentPlanet) {
                const earthPos = this.followTarget.parentPlanet.getWorldPosition();
                const radialDir = targetPos.clone().sub(earthPos).normalize();
                const worldUp = new THREE.Vector3(0, 1, 0);
                const tangentDir = new THREE.Vector3().crossVectors(worldUp, radialDir).normalize();
                const elevatedDir = new THREE.Vector3().crossVectors(radialDir, tangentDir).normalize();
                const distance = 0.3;

                this.followOffset = new THREE.Vector3()
                    .addScaledVector(radialDir, distance * 0.707)
                    .addScaledVector(tangentDir, distance * 0.35)
                    .addScaledVector(elevatedDir, distance * 0.35);
            }

            // Keep camera at offset from target
            const desiredPos = targetPos.clone().add(this.followOffset);

            // For satellites - smooth but tight following
            if (this.followTarget.data && this.followTarget.data.type === 'satellite') {
                this.controls.target.lerp(targetPos, delta * 20);
                this.camera.position.lerp(desiredPos, delta * 20);
            } else {
                // For planets - smooth following
                this.controls.target.lerp(targetPos, delta * 5);
                this.camera.position.lerp(desiredPos, delta * 3);
            }
        }

        // Handle free flight mode
        if (this.isFreeFlightMode) {
            this.updateFreeFlight(delta);
        }
    }

    updateFreeFlight(delta) {
        const moveVector = new THREE.Vector3();

        // WASD movement
        if (this.keys['KeyW']) moveVector.z -= 1;
        if (this.keys['KeyS']) moveVector.z += 1;
        if (this.keys['KeyA']) moveVector.x -= 1;
        if (this.keys['KeyD']) moveVector.x += 1;
        if (this.keys['KeyQ'] || this.keys['Space']) moveVector.y += 1;
        if (this.keys['KeyE'] || this.keys['ShiftLeft']) moveVector.y -= 1;

        // Shift for speed boost
        const speed = this.keys['ShiftLeft'] ? this.moveSpeed * 3 : this.moveSpeed;

        // Apply movement in camera space
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.applyQuaternion(this.camera.quaternion);
            moveVector.multiplyScalar(speed * delta);
            this.camera.position.add(moveVector);
        }
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Get camera info for UI
    getCameraInfo() {
        return {
            position: this.camera.position.clone(),
            target: this.controls.target.clone(),
            isFollowing: this.isFollowing,
            isFreeFlightMode: this.isFreeFlightMode,
            followTarget: this.followTarget ? this.followTarget.data.name : null
        };
    }
}
