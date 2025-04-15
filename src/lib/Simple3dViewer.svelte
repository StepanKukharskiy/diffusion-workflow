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
	import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
	import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
	import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
	import { generateUUID } from './utils';
	import {
		createSegmentedMeshByUVIslands,
		segmentMeshByTextureColor,
		drawMeshTextureToCanvas,
		createSegmentedMesh,
		createHexagonalSegmentation,
		buildAdjacencyList,
		createStripedSegmentation,
		createNormalBasedSegmentation,
		createMeshesFromRegions,
		calculateTriangleNormals,
		generateRandomPointsInBoundingBox,
		createVoronoiSegmentation
	} from './segmentation';
	import { simplifyMesh, retopologizeMesh } from './simplifyMeshes';

	let { uuid = '', modelUrl = '', options = false } = $props(); // Added textureUrl prop
	let appCanvas: any = $state();
	let scene: any = $state();
	let camera: any = $state();
	let renderer: any = $state();
	let controls: any = $state();
	let lights: any = $state();
	let sun: any = $state();
	let is3DModel = $state(false);
	let isTakingScreenshot = $state(false);
	let showTexture: any = $state(true);
	let originalMaterials: any = $state([]);
	let originalMaterialTexture: any = $state();
	let currentMaterialIndex: any = $state(0);
	let viewType: any = $state(0);
	let originalMesh: any = $state();
	let simplifiedMesh: any = $state();
	let simplifiedMeshWireframe: any = $state(false);
	let targetMeshReduction: any = $state(0.5);
	let segmentedMeshes: any = $state([]);
	let polygonsPerMesh = $state(300);
	let isProcessingMesh = $state(false);
	let totalTrianglesAmount = $state(0);
	let gridDivisionsX = $state(4);
	let gridDivisionsY = $state(4);
	let gridDivisionsZ = $state(4);
	let voronoiPointCount = $state(5);
	let hexPolygonCount = $state(1000); // Default to 1000 polygons per hexagon
	let stripePolygonCount = $state(1000);
	let angleThreshold = $state(20);
	let textureCanvas: any = $state();
	let textureCanvasHeight: any = $state(400);
	let showMeshTexture: boolean = $state(true);
	let showMeshPolygonsOnTexture: boolean = $state(true);
	let isShowingTexture: any = $state('none');
	let textureUrl: any = $state();
	let colorThreshold: any = $state(0.2);

	let showMenu = $state(true);

	// console.log(
	// 	`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
	// );

	onMount(() => {
		console.log('hi');
		// Canvas is guaranteed to be available here
		setTimeout(() => {
			console.log(appCanvas);
			textureCanvasHeight = appCanvas.clientHeight;
			console.log(textureCanvasHeight);
			loadModel(
				`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
			);
		}, 1000);
	});

	function loadModel(url: string) {
		const extension = url.split('.').pop()?.toLowerCase(); // Get the file extension
		// console.log(extension);
		// console.log(url);
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
		renderer.shadowMap.enabled = true;
		// renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.LinearToneMapping;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		// object.rotation.x = -Math.PI/2
		if (object.children[0].children[0] != undefined) {
			originalMesh = object.children[0].children[0];
		} else {
			originalMesh = object.children[0];
		}
		originalMesh.material.metalness = 0;
		originalMesh.material.roughness = 1;
		originalMaterials.push(originalMesh.material.clone());
		originalMaterialTexture = originalMesh.material.map.clone();
		// Store both material and its texture separately
		// originalMaterials.push({
		// 	material: originalMesh.material.clone(),
		// 	texture: originalMesh.material.map ? originalMesh.material.map.clone() : null
		// });

		totalTrianglesAmount = getTrianglesNumber(originalMesh);

		// console.log(object);
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

		const ambientLight = new THREE.AmbientLight(0x404040, 2);
		scene.add(ambientLight);

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

	function switchMaterials(value: any) {
		if (scene) {
			// originalMaterials.push(originalMesh.material.clone());
			if (value === 0) {
				isShowingTexture = 'none';
				originalMesh.material = originalMaterials[0];
				originalMesh.material.wireframe = false;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 1) {
				isShowingTexture = 'none';
				const newMaterial = new THREE.MeshStandardMaterial({
					color: 'lightgrey'
				});

				originalMesh.material = newMaterial;
				originalMesh.material.wireframe = false;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 2) {
				isShowingTexture = 'none';
				const newMaterial = new THREE.MeshNormalMaterial({});

				originalMesh.material = newMaterial;
				originalMesh.material.wireframe = false;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 3) {
				isShowingTexture = 'none';
				// const newMaterial = new THREE.MeshStandardMaterial({
				// 	color: 'black',
				// 	wireframe: true
				// });

				originalMesh.material.wireframe = true;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 4) {
				isShowingTexture = 'none';
				originalMesh.visible = false;
				clearSegmentedMeshes();
				segmentedMeshes = createSegmentedMesh(originalMesh, {
					scene: scene,
					viewType: 4,
					polygonsPerMesh: polygonsPerMesh,
					gridDivisionsX: gridDivisionsX,
					gridDivisionsY: gridDivisionsY,
					gridDivisionsZ: gridDivisionsZ,
					onProgress: ({ totalTriangles }) => {
						console.log(`Processing ${totalTriangles} triangles`);
					}
				});
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 5) {
				// Voronoi segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				clearSegmentedMeshes();
				segmentedMeshes = createVoronoiSegmentation(originalMesh, {
					scene: scene,
					voronoiPointCount: voronoiPointCount,
					onProgress: (progress) => {
						console.log(`Processing ${progress.totalTriangles} triangles...`);
					}
				});
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 6) {
				// Hexagonal segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				clearSegmentedMeshes();
				// createHexagonalSegmentation(originalMesh);
				segmentedMeshes = createHexagonalSegmentation(originalMesh, {
					scene: scene,
					viewType: 6,
					hexPolygonCount: hexPolygonCount,
					onProgress: ({ totalTriangles }) => {
						console.log(`Processing ${totalTriangles} triangles`);
					}
				});
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 7) {
				// Strip segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				clearSegmentedMeshes();
				segmentedMeshes = createStripedSegmentation(originalMesh, {
					scene: scene,
					viewType: 7,
					stripePolygonCount: stripePolygonCount,
					onProgress: ({ totalTriangles }) => {
						console.log(`Processing ${totalTriangles} triangles`);
					}
				});
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 8) {
				// Strip segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				clearSegmentedMeshes();
				segmentedMeshes = createNormalBasedSegmentation(originalMesh, {
					scene: scene,
					angleThreshold: angleThreshold,
					onProgress: (progress) => {
						console.log(`Processing ${progress.totalTriangles} triangles...`);
					}
				});
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 9) {
				isShowingTexture = 'block';
				// originalMesh.material = originalMaterials[0];
				// originalMesh.material.map = originalMaterialTexture.clone()
				// originalMesh.material.needsUpdate = true;

				drawMeshTextureToCanvas(originalMesh, textureCanvas, {
					resolution: 2048,
					wireframe: true,
					fillColor: 'rgba(220, 220, 220, 0.3)',
					wireframeColor: 'rgba(30, 30, 30, 0.7)',
					wireframeWidth: 0.5,
					background: 'white',
					showTexture: true
				});
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 10) {
				// UV segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				// originalMesh.material = originalMaterials[0];
				// originalMesh.material.map = originalMaterialTexture.clone()
				// originalMesh.material.needsUpdate = true;
				clearSegmentedMeshes();
				segmentedMeshes = createSegmentedMeshByUVIslands(originalMesh);
				for (let mesh of segmentedMeshes) {
					scene.add(mesh);
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 11) {
				// UV segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				//originalMesh.material = originalMaterials[0];
				clearSegmentedMeshes();
				segmentedMeshes = segmentMeshByTextureColor(originalMesh, {
					resolution: 1024,
					colorThreshold: colorThreshold,
					minSegmentSize: 10,
					simplifySegments: true
				});
				console.log(segmentedMeshes);
				for (let mesh of segmentedMeshes) {
					scene.add(mesh);
					mesh.visible = true;
				}
				if (simplifiedMesh) {
					simplifiedMesh.visible = false;
				}
			} else if (value === 12) {
				// UV segmentation
				isShowingTexture = 'none';
				originalMesh.visible = false;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
				//originalMesh.material = originalMaterials[0];
				if (simplifiedMesh) {
					scene.remove(simplifiedMesh);
				}
				// simplifiedMesh = simplifyMesh(originalMesh, {
				// 	targetReduction: targetMeshReduction,
				// 	aggressiveness: 2,
				// 	preserveGeometryBorders: true,
				// 	preserveUVs: true,
				// 	preserveNormals: true
				// });
				simplifiedMesh = retopologizeMesh(originalMesh, {
					targetFaces: 10000,
					subdivisions: 1,
					relaxationIterations: 5,
					projectToOriginal: true
				});
				scene.add(simplifiedMesh);
				totalTrianglesAmount = getTrianglesNumber(simplifiedMesh);

				scene.add(simplifiedMesh);
			}

			if (value != 12) {
				totalTrianglesAmount = getTrianglesNumber(originalMesh);
			} else {
				totalTrianglesAmount = getTrianglesNumber(simplifiedMesh);
			}

			originalMesh.geometry.computeVertexNormals();
			originalMesh.material.needsUpdate = true;
		}
	}

	async function getCanvasScreenshotUrl(canvas: any) {
		isTakingScreenshot = true;
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

	function getTrianglesNumber(mesh: any) {
		const geometry = mesh.geometry;
		// Get the number of triangles (polygons)
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;
		return triangleCount;
	}

	function clearSegmentedMeshes() {
		// Loop through all segmented meshes
		for (let mesh of segmentedMeshes) {
			// Remove from scene
			scene.remove(mesh);

			// Dispose of geometry
			if (mesh.geometry) {
				mesh.geometry.dispose();
			}

			// Dispose of material
			if (mesh.material) {
				// Handle array of materials
				if (Array.isArray(mesh.material)) {
					for (let material of mesh.material) {
						material.dispose();
					}
				} else {
					// Handle single material
					mesh.material.dispose();
				}
			}
		}

		// Clear the array
		segmentedMeshes = [];
	}

	function applyTexture(mesh: any) {
		let errorMessage = '';
		if (!textureUrl) {
			errorMessage = 'Please enter a texture URL';
			return;
		}

		isProcessingMesh = true;
		errorMessage = '';

		// Create a texture loader
		const textureLoader = new THREE.TextureLoader();

		// Set cross-origin if loading from external domain
		textureLoader.crossOrigin = 'anonymous';

		// Load the texture
		textureLoader.load(
			textureUrl,
			(texture) => {
				// Set flipY to false to maintain UV alignment
				texture.flipY = false;
				texture.encoding = THREE.sRGBEncoding;
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.generateMipmaps = false;
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;

				// Successfully loaded texture
				if (mesh) {
					// Handle array of materials
					if (Array.isArray(mesh.material)) {
						mesh.material.forEach((mat) => {
							mat.map = texture;
							mat.needsUpdate = true;
						});
					} else {
						mesh.material.map = texture;
						mesh.material.needsUpdate = true;
					}
				}
				isProcessingMesh = false;
			},
			// Progress callback (optional)
			undefined,
			// Error callback
			(error) => {
				console.error('Error loading texture:', error);
				errorMessage = 'Failed to load texture. Please check the URL.';
				isProcessingMesh = false;
			}
		);
	}

	function exportSegmentedMeshes() {
		// Create a new scene containing only the segmented meshes
		const exportScene = new THREE.Scene();

		// Add all segmented meshes to the export scene
		for (let mesh of segmentedMeshes) {
			// Create a clone to avoid modifying the original
			const clonedMesh = mesh.clone();
			// Make sure it's visible for export
			clonedMesh.visible = true;
			exportScene.add(clonedMesh);
		}

		// Create a new exporter
		const exporter = new GLTFExporter();

		// Parse the scene to generate the GLB file
		exporter.parse(
			exportScene,
			function (result) {
				// Create a blob from the result
				const blob = new Blob([result], { type: 'application/octet-stream' });

				// Create a download link
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = 'segmented-model.glb';

				// Trigger the download
				document.body.appendChild(link);
				link.click();

				// Clean up
				document.body.removeChild(link);
				setTimeout(() => URL.revokeObjectURL(link.href), 100);
			},
			function (error) {
				console.error('An error occurred during export:', error);
			},
			{ binary: true } // Set to true for GLB format, false for GLTF
		);
	}
</script>

<div class="canvasContainer">
	<canvas
		bind:this={appCanvas}
		id="{uuid}-canvas"
		style="margin-top: 10px; border-radius: 10px; width: 100%; height: 100%;"
	></canvas>
	<div
		style="display: {isShowingTexture}; position: absolute; top: 10px; left: 0; max-height: {textureCanvasHeight}px; overflow: scroll;"
	>
		<canvas bind:this={textureCanvas} id="{uuid}-texture-canvas" style="width: 100%; height: 100%;"
		></canvas>
	</div>
	{#if showMenu}
		<div class="canvasMenuContainer">
			<div style="display: flex; align-items: center;">
				{#if isProcessingMesh}
					<div class="loader" style="margin: 0 10px;"></div>
					<p style="margin: 0;">Processing mesh...</p>
				{:else}
					<p style="margin: 0;">Total triangles: {totalTrianglesAmount}</p>
				{/if}
			</div>
			<div style="margin-top: 10px;">
				<label for="{uuid}-lightIntencity">Light intensity: </label>
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
			<div style="margin-top: 10px;">
				<label for="{uuid}-materialType">View: </label>
				<select
					id="{uuid}-materialType"
					onchange={(e: any) => {
						viewType = parseInt(e.target.value);
						switchMaterials(parseInt(e.target.value));
					}}
				>
					<option value="0">Textured</option>
					<option value="1">White</option>
					<option value="2">Normal</option>
					<option value="3">Wireframe</option>
					<option value="9">UV</option>
					<option value="4">Grid Segmentation</option>
					<option value="5">Voronoi Segmentation</option>
					<option value="6">Abstract Segmentation</option>
					<option value="7">Strip Segmentation</option>
					<option value="8">Normal Segmentation</option>
					<option value="10">UV Segmentation</option>
					<option value="11">Texture Colors Segmentation</option>
					<option value="12">Simplified Mesh</option>
				</select>
			</div>
			{#if viewType === 0}
				<div style="margin-top: 10px;">
					<label for="{uuid}-textureInput">Update texture: </label>
					<input id="{uuid}-textureInput" bind:value={textureUrl} placeholder="Enter URL" />
					<button
						class="tertiaryButton"
						style="padding-left: 0;"
						onclick={() => {
							applyTexture(originalMesh);
						}}>Update</button
					>
					<button
						class="tertiaryButton"
						style="padding-left: 0; padding-top: 0;"
						onclick={() => {
							// Create a new material based on the original
							const originalMaterial = originalMaterials[0].clone();
							originalMaterial.map = originalMaterialTexture.clone();
							// // Explicitly set the texture from our saved original
							// if (originalMaterials[0].texture) {
							// 	originalMaterial.map = originalMaterials[0].texture.clone();
							// }

							// // Apply to the mesh
							// if (Array.isArray(originalMesh.material)) {
							// 	originalMesh.material.forEach((mat, index) => {
							// 		originalMesh.material[index] = originalMaterial.clone();
							// 	});
							// } else {
							// 	originalMesh.material = originalMaterial;
							// }
							originalMesh.material = originalMaterial;
							originalMesh.material.needsUpdate = true;
						}}>Restore original texture</button
					>
				</div>
			{/if}
			{#if viewType === 4}
				<div style="margin-top: 10px;">
					<label for="{uuid}-gridDivisions">Grid divisions: </label>
					<div style="display: flex; gap: 5px; align-items: center; margin-top: 5px;">
						<label for="{uuid}-gridX">X:</label>
						<input
							type="number"
							id="{uuid}-gridX"
							min="1"
							max="20"
							step="1"
							value={gridDivisionsX}
							oninput={(e: any) => {
								gridDivisionsX = parseInt(e.target.value);
								if (originalMesh) {
									clearSegmentedMeshes();
									segmentedMeshes = createSegmentedMesh(originalMesh, {
										scene: scene,
										viewType: 4,
										polygonsPerMesh: polygonsPerMesh,
										gridDivisionsX: gridDivisionsX,
										gridDivisionsY: gridDivisionsY,
										gridDivisionsZ: gridDivisionsZ,
										onProgress: ({ totalTriangles }) => {
											console.log(`Processing ${totalTriangles} triangles`);
										}
									});
								}
							}}
							style="width: 50px;"
						/>

						<label for="{uuid}-gridY">Y:</label>
						<input
							type="number"
							id="{uuid}-gridY"
							min="1"
							max="20"
							step="1"
							value={gridDivisionsY}
							oninput={(e: any) => {
								gridDivisionsY = parseInt(e.target.value);
								if (originalMesh) {
									clearSegmentedMeshes();
									segmentedMeshes = createSegmentedMesh(originalMesh, {
										scene: scene,
										viewType: 4,
										polygonsPerMesh: polygonsPerMesh,
										gridDivisionsX: gridDivisionsX,
										gridDivisionsY: gridDivisionsY,
										gridDivisionsZ: gridDivisionsZ,
										onProgress: ({ totalTriangles }) => {
											console.log(`Processing ${totalTriangles} triangles`);
										}
									});
								}
							}}
							style="width: 50px;"
						/>

						<label for="{uuid}-gridZ">Z:</label>
						<input
							type="number"
							id="{uuid}-gridZ"
							min="1"
							max="20"
							step="1"
							value={gridDivisionsZ}
							oninput={(e: any) => {
								gridDivisionsZ = parseInt(e.target.value);
								if (originalMesh) {
									clearSegmentedMeshes();
									segmentedMeshes = createSegmentedMesh(originalMesh, {
										scene: scene,
										viewType: 4,
										polygonsPerMesh: polygonsPerMesh,
										gridDivisionsX: gridDivisionsX,
										gridDivisionsY: gridDivisionsY,
										gridDivisionsZ: gridDivisionsZ,
										onProgress: ({ totalTriangles }) => {
											console.log(`Processing ${totalTriangles} triangles`);
										}
									});
									// segmentByNormals(originalMesh)
								}
							}}
							style="width: 50px;"
						/>
					</div>
				</div>
			{/if}
			{#if viewType === 5}
				<div style="margin-top: 10px;">
					<label for="{uuid}-voronoiPoints">Number of Voronoi points: </label>
					<input
						type="number"
						id="{uuid}-voronoiPoints"
						min="2"
						max="20"
						step="1"
						value={voronoiPointCount}
						oninput={(e: any) => {
							voronoiPointCount = parseInt(e.target.value);
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = createVoronoiSegmentation(originalMesh, {
									scene: scene,
									voronoiPointCount: voronoiPointCount,
									onProgress: (progress) => {
										console.log(`Processing ${progress.totalTriangles} triangles...`);
									}
								});
							}
						}}
					/>
					<button
						onclick={() => {
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = createVoronoiSegmentation(originalMesh, {
									scene: scene,
									voronoiPointCount: voronoiPointCount,
									onProgress: (progress) => {
										console.log(`Processing ${progress.totalTriangles} triangles...`);
									}
								});
							}
						}}
						class="tertiaryButton"
						style="padding: 0; margin-top: 10px;"
					>
						Regenerate Points
					</button>
				</div>
			{/if}
			{#if viewType === 6}
				<div style="margin-top: 10px;">
					<label for="{uuid}-hexPolygonCount">Polygons per segment: </label>
					<input
						type="number"
						id="{uuid}-hexPolygonCount"
						min="10"
						max="5000"
						step="10"
						value={hexPolygonCount}
						oninput={(e: any) => {
							hexPolygonCount = parseInt(e.target.value) < 100 ? 100 : parseInt(e.target.value);
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = createHexagonalSegmentation(originalMesh, {
									scene: scene,
									viewType: 6,
									hexPolygonCount: hexPolygonCount,
									onProgress: ({ totalTriangles }) => {
										console.log(`Processing ${totalTriangles} triangles`);
									}
								});
							}
						}}
					/>
				</div>
				<div style="margin-top: 10px;">
					<button
						class="tertiaryButton"
						style="padding: 0;"
						onclick={(e: any) => {
							// hexPolygonCount = parseInt(e.target.value) < 100 ? 100 : parseInt(e.target.value);

							clearSegmentedMeshes();
							segmentedMeshes = createHexagonalSegmentation(originalMesh, {
								scene: scene,
								viewType: 6,
								hexPolygonCount: hexPolygonCount,
								onProgress: ({ totalTriangles }) => {
									console.log(`Processing ${totalTriangles} triangles`);
								}
							});
						}}>Retry</button
					>
				</div>
			{/if}
			{#if viewType === 7}
				<div style="margin-top: 10px;">
					<label for="{uuid}-hexPolygonCount">Polygons per segment: </label>
					<input
						type="number"
						id="{uuid}-hexPolygonCount"
						min="10"
						max="5000"
						step="10"
						value={stripePolygonCount}
						oninput={(e: any) => {
							stripePolygonCount = parseInt(e.target.value) < 100 ? 100 : parseInt(e.target.value);
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = createStripedSegmentation(originalMesh, {
									scene: scene,
									viewType: 7,
									stripePolygonCount: stripePolygonCount,
									onProgress: ({ totalTriangles }) => {
										console.log(`Processing ${totalTriangles} triangles`);
									}
								});
							}
						}}
					/>
				</div>
			{/if}
			{#if viewType === 8}
				<div style="margin-top: 10px;">
					<label for="{uuid}-angleThreshold">Angle threshold: </label>
					<input
						type="number"
						id="{uuid}-angleTheshold"
						min="1"
						max="180"
						step="1"
						value={angleThreshold}
						oninput={(e: any) => {
							angleThreshold = parseInt(e.target.value);
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = createNormalBasedSegmentation(originalMesh, {
									scene: scene,
									angleThreshold: angleThreshold,
									onProgress: (progress) => {
										console.log(`Processing ${progress.totalTriangles} triangles...`);
									}
								});
							}
						}}
					/>
				</div>
			{/if}
			{#if viewType === 9}
				<div style="margin-top: 10px;">
					<button
						class="tertiaryButton"
						style="padding-left: 0;"
						onclick={async () => {
							showMeshTexture = !showMeshTexture;
							drawMeshTextureToCanvas(originalMesh, textureCanvas, {
								resolution: 2048,
								wireframe: true,
								fillColor: showMeshPolygonsOnTexture
									? 'rgba(220, 220, 220, 0.3)'
									: 'rgba(220, 220, 220, 0)',
								wireframeColor: showMeshPolygonsOnTexture
									? 'rgba(30, 30, 30, 0.7)'
									: 'rgba(30, 30, 30, 0)',
								wireframeWidth: 0.5,
								background: 'white',
								showTexture: showMeshTexture
							});
						}}>{showMeshTexture === true ? 'Hide texture' : 'Show texture'}</button
					>
					<button
						class="tertiaryButton"
						style="padding-left: 0;"
						onclick={async () => {
							showMeshPolygonsOnTexture = !showMeshPolygonsOnTexture;
							drawMeshTextureToCanvas(originalMesh, textureCanvas, {
								resolution: 2048,
								wireframe: true,
								fillColor: showMeshPolygonsOnTexture
									? 'rgba(220, 220, 220, 0.3)'
									: 'rgba(220, 220, 220, 0)',
								wireframeColor: showMeshPolygonsOnTexture
									? 'rgba(30, 30, 30, 0.7)'
									: 'rgba(30, 30, 30, 0)',
								wireframeWidth: 0.5,
								background: 'white',
								showTexture: showMeshTexture
							});
						}}>{showMeshPolygonsOnTexture === true ? 'Hide polygons' : 'Show polygons'}</button
					>
					<button
						class="tertiaryButton"
						style="padding-left: 0;"
						onclick={async () => {
							const screenshotUrl = await getCanvasScreenshotUrl(textureCanvas);
							addElement($elements, 'image', 'screenshot', screenshotUrl);
							$elements = $elements;
						}}>Export texture</button
					>
				</div>
			{/if}
			{#if viewType === 11}
				<div style="margin-top: 10px;">
					<label for="{uuid}-colorThreshold">Color threshold: </label>
					<input
						type="number"
						id="{uuid}-colorTheshold"
						min="5"
						max="100"
						step="5"
						value={colorThreshold * 100}
						oninput={(e: any) => {
							colorThreshold = parseInt(e.target.value) / 100;
							if (originalMesh) {
								clearSegmentedMeshes();
								segmentedMeshes = segmentMeshByTextureColor(originalMesh, {
									resolution: 1024,
									colorThreshold: colorThreshold,
									minSegmentSize: 10,
									simplifySegments: true
								});
								for (let mesh of segmentedMeshes) {
									scene.add(mesh);
								}
							}
						}}
					/>
				</div>
			{/if}
			{#if viewType === 12}
				<div style="margin-top: 10px;">
					<label for="{uuid}-colorThreshold">Target reduction: </label>
					<input
						type="number"
						id="{uuid}-targetReduction"
						min="1"
						max="10"
						step="1"
						value={targetMeshReduction * 10}
						oninput={(e: any) => {
							targetMeshReduction = parseInt(e.target.value) / 10;
							if (simplifiedMesh) {
								scene.remove(simplifiedMesh);
								simplifiedMesh = simplifyMesh(originalMesh, {
									targetReduction: targetMeshReduction,
									aggressiveness: 2,
									preserveGeometryBorders: true,
									preserveUVs: true,
									preserveNormals: true
								});
								scene.add(simplifiedMesh);
								totalTrianglesAmount = getTrianglesNumber(simplifiedMesh);
							}
						}}
					/>
				</div>
				<button
					class="tertiaryButton"
					style="padding-left: 0;"
					onclick={() => {
						simplifiedMeshWireframe = !simplifiedMeshWireframe;
						if (simplifiedMeshWireframe) {
							simplifiedMesh.material.wireframe = true;
						} else {
							simplifiedMesh.material.wireframe = false;
						}
					}}>Toggle Wireframe</button
				>
			{/if}

			{#if viewType === 4 || viewType === 5 || viewType === 6 || viewType === 7 || viewType === 8 || viewType === 10 || viewType === 11}
				<div style="margin-top: 10px; display: flex; align-items: center;">
					<label for="{uuid}-segmentsAmount">Number of segments: </label>
					<p id="{uuid}-segmentsAmount" style="margin: 0;">&nbsp;{segmentedMeshes.length}</p>
				</div>
				<div style="margin-top: 10px;">
					<button onclick={exportSegmentedMeshes} class="tertiaryButton" style="padding: 0;"
						>Export Segments</button
					>
				</div>
			{/if}
			<button
				class="controlsMenuButton"
				onclick={() => {
					showMenu = !showMenu;
				}}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					style="width: 10px;"
					width="10"
					height="10"
					viewBox="0 0 19.02 19.02"
					><title>icon_quit</title><line
						x1="0.5"
						y1="0.5"
						x2="18.52"
						y2="18.52"
						style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
					/><line
						x1="0.5"
						y1="18.52"
						x2="18.52"
						y2="0.5"
						style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
					/></svg
				></button
			>
		</div>
	{:else}
		<button
			class="controlsMenuButton"
			style="position: absolute; top: 30px; left: 0;"
			onclick={() => {
				showMenu = !showMenu;
			}}
			><svg
				xmlns="http://www.w3.org/2000/svg"
				style="width: 10px;"
				width="10"
				height="10"
				viewBox="0 0 19.02 19.02"
				><title>icon_quit</title><line
					x1="0.5"
					y1="0.5"
					x2="18.52"
					y2="9.52"
					style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
				/><line
					x1="18.52"
					y1="9.52"
					x2="0.5"
					y2="18.52"
					style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
				/></svg
			></button
		>
	{/if}
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
		margin-right: 10px;
		padding: 10px;
		border-radius: 10px;
		box-shadow: 0 0 10px hsla(0, 0%, 5%, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		background: linear-gradient(45deg, hsla(0, 0%, 95%, 0%), hsla(0, 0%, 95%, 70%));
	}
	.controlsMenuButton {
		width: 30px;
		height: 30px;
		position: absolute;
		top: 10px;
		right: -30px;
		background-color: hsl(0, 0%, 95%);
		border: 1px solid hsla(0, 0%, 5%, 20%);
		border-radius: 0 10px 10px 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	label {
		color: hsl(0, 0%, 5%);
	}
	input,
	select {
		padding: 5px;
		font-size: 1.2rem;
		border-radius: 10px;
		border: 1px solid hsl(0, 0%, 80%);
		background: hsl(0, 0%, 95%);
		color: hsl(0, 0%, 5%);
	}
</style>
