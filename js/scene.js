// Scene setup module
import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    return scene;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(200, 150, 300);
    camera.lookAt(0, 0, 0);
    return camera;
}

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    return renderer;
}

export function createLights(scene) {
    // Ambient light for minimal visibility of dark sides
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Point light at the sun's position - high intensity for physically correct rendering
    const sunLight = new THREE.PointLight(0xffffff, 100, 0, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // Additional subtle fill light
    const fillLight = new THREE.DirectionalLight(0x335577, 0.1);
    fillLight.position.set(-100, 50, -100);
    scene.add(fillLight);

    return { ambientLight, sunLight, fillLight };
}
