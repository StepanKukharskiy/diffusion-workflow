<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import { deleteBlock } from './utils';
	import paper from 'paper';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // Import OBJLoader
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { generateUUID } from './utils';

	let { uuid = '', modelUrl = '', options = false } = $props(); // Added textureUrl prop
	let appCanvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;
	let lights: THREE.HemisphereLight;
	let sun: THREE.DirectionalLight;
	let is3DModel = $state(false);
	let isTakingScreenshot = $state(false);
	console.log(
		`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
	);

	onMount(() => {
		if (modelUrl) {
			setTimeout(() => {
				console.log(appCanvas);
				loadModel(
					`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
				);
			}, 1000);
		}
	});

	function loadModel(url: string) {
		const extension = url.split('.').pop()?.toLowerCase(); // Get the file extension
		console.log(extension);
		console.log(url);
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

		// // Ensure appCanvas is defined before accessing its properties
		// if (appCanvas) {
		camera = new THREE.PerspectiveCamera(
			75,
			appCanvas.clientWidth / appCanvas.clientHeight,
			0.1,
			1000
		);
		renderer = new THREE.WebGLRenderer({ canvas: appCanvas, antialias: true, alpha: true });
		renderer.setSize(appCanvas.clientWidth, appCanvas.clientHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		// renderer.shadowMap.enabled = true;
		// renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.LinearToneMapping;
		renderer.toneMappingExposure = 1;
		// renderer.outputEncoding = THREE.sRGBEncoding;
		// object.rotation.x = -Math.PI/2
		if (object.children[0].children[0] != undefined) {
			object.children[0].children[0].material.metalness = 0;
		} else {
			object.children[0].material.metalness = 0;
		}
		console.log(object);
		scene.add(object);
		camera.position.z = 1;

		lights = new THREE.HemisphereLight('white', 'grey', 5);
		sun = new THREE.DirectionalLight('white', 1);
		sun.position.set(5, 5, 5);
		sun.castShadow = true;

		// Set up shadow properties
		sun.shadow.camera.near = 0.005;
		sun.shadow.camera.far = 200;
		sun.shadow.camera.left = -150;
		sun.shadow.camera.right = 150;
		sun.shadow.camera.top = 150;
		sun.shadow.camera.bottom = -150;
		sun.shadow.mapSize.width = 2048;
		sun.shadow.mapSize.height = 2048;

		sun.shadow.bias = -0.0025;

		// scene.add(lights, sun);
		scene.add(lights);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true; // Enable damping (inertia)
		controls.dampingFactor = 0.25; // Damping factor
		controls.maxDistance = 100; // Maximum zoom-out distance

		animate();
		// } else {
		// 	console.error('Canvas element is not defined');
		// }
	}

	function animate() {
		requestAnimationFrame(animate);
		controls.update(); // Update controls
		renderer.render(scene, camera);
	}

	let lightIntensity = $state(5); // Default light intensity

	function updateLightIntensity(value: number) {
		lightIntensity = value;
		if (lights) {
			lights.intensity = lightIntensity;
		}
	}

	async function getCanvasScreenshotUrl(canvas: any) {
		isTakingScreenshot = true
		if (canvas) {
			renderer.render(scene, camera);
			const dataURL = canvas.toDataURL('image/jpeg'); // Convert canvas to image
			const blob = await fetch(dataURL).then((res) => res.blob());

			const formData = new FormData();
			formData.append('file', blob, 'canvas.jpeg');
			formData.append('projectId', $page.params.projectId);
			console.log($page.params.projectId);
			console.log(formData);

			const response = await fetch(`${$page.url.origin}/api/save-image`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				isTakingScreenshot = false;
				console.error('Upload failed:', response.statusText);
			} else {
				const result = await response.json();
				console.log('Upload successful:', result);
				isTakingScreenshot = false;
				return result.url;
			}
		} else {
			isTakingScreenshot = false;
			console.error(`No canvas found`);
		}
	}

	function addElement(elements: any, type = 'text', query = '', url = '') {
		if (type === 'image') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				imageUrl: url
			});
		}
	}
</script>

<div class="canvasContainer">
	<canvas
		bind:this={appCanvas}
		id="{uuid}-canvas"
		style="margin-top: 10px; border-radius: 10px; width: 100%; height: 100%;"
	></canvas>
	<div class="canvasMenuContainer">
		<label for="{uuid}-lightIntencity">Light Intencity</label>
		<input
			type="number"
			id="{uuid}-lightIntencity"
			min="0"
			max="20"
			step="1"
			value={lightIntensity}
			oninput={(e: any) => updateLightIntensity(parseFloat(e.target.value))}
		/>
	</div>
	{#if options}
		{#if !isTakingScreenshot}
			<div style="display: flex; flex-wrap: wrap;">
				<button
					onclick={() => {
						navigator.clipboard.writeText(
							`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
						);
					}}
					class="tertiaryButton">Copy URL</button
				>
				<button
					onclick={async () => {
						const screenshotUrl = await getCanvasScreenshotUrl(appCanvas);
						console.log(screenshotUrl);
						addElement($elements, 'image', 'screenshot', screenshotUrl);
						$elements = $elements;
					}}
					class="tertiaryButton">Get screenshot</button
				>
				<button
					onclick={() => {
						window.open(
							`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`,
							'_blank'
						);
					}}
					class="tertiaryButton">Download</button
				>

				<button
					class="tertiaryButton"
					onclick={async () => {
						deleteBlock($elements, uuid);
						$elements = $elements;
					}}>Delete</button
				>
			</div>
		{:else}
			<div style="display: flex; align-items: center;">
				<span class="warning"></span>
				<p style="margin-right: 10px;">Loading</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.canvasContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
		position: relative;
	}
	canvas {
		z-index: 10;
		/* border: 1px solid #1a1a1a30; */
		border-radius: 10px;
		background-color: hsl(0, 0%, 95%);
	}
	.canvasMenuContainer {
		position: absolute;
		top: 20px;
		left: 10px;
		z-index: 2;
		margin-right: 10px;
	}
</style>
