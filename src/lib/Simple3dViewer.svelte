<script lang="ts">
    import { textColor, bgColor, elements } from './store';
    import paper from 'paper';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // Import OBJLoader
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    let { uuid = '', modelUrl = ''} = $props(); // Added textureUrl prop
    let appCanvas: HTMLCanvasElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let lights: THREE.AmbientLight;
    let sun: THREE.DirectionalLight;
    let is3DModel = $state(false);

    onMount(() => {
        if (modelUrl) {
            setTimeout(() => {
                loadModel(modelUrl);
            }, 1000);
        }
    });

    function loadModel(url: string) {
        const extension = url.split('.').pop()?.toLowerCase(); // Get the file extension
        if (extension === 'glb' || extension === 'gltf') {
            loadGLBFile(url); // Load GLB file
        } else if (extension === 'obj') {
            loadOBJFile(url); // Load OBJ file
        } else {
            console.error('Unsupported file format');
        }
    }

    function loadGLBFile(url: string) {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            // applyTexture(gltf.scene); // Apply texture to the GLB model
            setupScene(gltf.scene);
            is3DModel = true; // Set the state to indicate a 3D model is loaded
        });
    }

    function loadOBJFile(url: string) {
        const loader = new OBJLoader();
        loader.load(url, (object) => {
            // applyTexture(object); // Apply texture to the OBJ model
            setupScene(object);
            is3DModel = true; // Set the state to indicate a 3D model is loaded
        });
    }

    // function applyTexture(object: THREE.Object3D) {
    //     if (textureUrl) {
    //         const textureLoader = new THREE.TextureLoader();
    //         textureLoader.load(textureUrl, (texture) => {
    //             object.traverse((child) => {
    //                 if (child.isMesh) {
    //                     child.material.map = texture; // Assign the texture to the material
    //                     child.material.needsUpdate = true; // Notify Three.js to update the material
    //                 }
    //             });
    //         });
    //     }
    // }

    function setupScene(object: THREE.Object3D) {
        scene = new THREE.Scene();
        scene.background = null;

        // Ensure appCanvas is defined before accessing its properties
        if (appCanvas) {
            camera = new THREE.PerspectiveCamera(
                75,
                appCanvas.clientWidth / appCanvas.clientHeight,
                0.1,
                1000
            );
            renderer = new THREE.WebGLRenderer({ canvas: appCanvas, antialias: true, alpha: true });
            renderer.setSize(appCanvas.clientWidth, appCanvas.clientHeight);
			// object.rotation.x = -Math.PI/2
            scene.add(object);
            camera.position.z = 5;

            lights = new THREE.AmbientLight('white', 5);
            sun = new THREE.DirectionalLight('white', 10);
            sun.position.set(5, 5, 5);
            scene.add(lights, sun);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // Enable damping (inertia)
            controls.dampingFactor = 0.25; // Damping factor
            controls.maxDistance = 100; // Maximum zoom-out distance

            animate();
        } else {
            console.error('Canvas element is not defined');
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls
        renderer.render(scene, camera);
    }
</script>

<div class="canvasContainer">
    <canvas
        bind:this={appCanvas}
        id="{uuid}-canvas"
        style="margin-top: 10px; border-radius: 10px; width: 100%; height: 100%;"
    ></canvas>
</div>

<style>
    .canvasContainer {
        width: 100%;
        max-width: 800px;
        margin-bottom: 50px;
		border: 1px solid #1a1a1a30;
		border-radius: 10px;
    }
    canvas {
        z-index: 10;

    }
</style>