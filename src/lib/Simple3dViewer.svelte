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
	import { generateUUID } from './utils';

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
	let currentMaterialIndex: any = $state(0);
	let viewType: any = $state(0);
	let originalMesh: any = $state();
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
	let angleThreshold = $state(20)

	let showMenu = $state(true);

	// console.log(
	// 	`${$page.url.origin}/api/get-file/${$page.params.projectId}/${modelUrl.split('/')[7]}`
	// );

	onMount(() => {
		console.log('hi');
		// Canvas is guaranteed to be available here
		setTimeout(() => {
			console.log(appCanvas);
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
		renderer.shadowMap.enabled = true;
		// renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.LinearToneMapping;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = THREE.sRGBEncoding;
		// object.rotation.x = -Math.PI/2
		if (object.children[0].children[0] != undefined) {
			originalMesh = object.children[0].children[0];
		} else {
			originalMesh = object.children[0];
		}
		originalMesh.material.metalness = 0;
		createSegmentedMesh(originalMesh);
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
			originalMaterials.push(originalMesh.material.clone());
			if (value === 0) {
				originalMesh.material = originalMaterials[0];
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
			} else if (value === 1) {
				const newMaterial = new THREE.MeshStandardMaterial({
					color: 'lightgrey'
				});

				originalMesh.material = newMaterial;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
			} else if (value === 2) {
				const newMaterial = new THREE.MeshNormalMaterial({});

				originalMesh.material = newMaterial;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
			} else if (value === 3) {
				const newMaterial = new THREE.MeshStandardMaterial({
					color: 'black',
					wireframe: true
				});

				originalMesh.material = newMaterial;
				originalMesh.visible = true;
				for (let mesh of segmentedMeshes) {
					mesh.visible = false;
				}
			} else if (value === 4) {
				originalMesh.visible = false;
				clearSegmentedMeshes();
				createSegmentedMesh(originalMesh);
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
			} else if (value === 5) {
				// Voronoi segmentation
				originalMesh.visible = false;
				clearSegmentedMeshes();
				createVoronoiSegmentation(originalMesh);
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
			} else if (value === 6) {
				// Hexagonal segmentation
				originalMesh.visible = false;
				clearSegmentedMeshes();
				createHexagonalSegmentation(originalMesh);
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
			} else if (value === 7) {
				// Strip segmentation
				originalMesh.visible = false;
				clearSegmentedMeshes();
				createStripedSegmentation(originalMesh);
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
			}  else if (value === 8) {
				// Strip segmentation
				originalMesh.visible = false;
				clearSegmentedMeshes();
				createNormalBasedSegmentation(originalMesh, angleThreshold);
				for (let mesh of segmentedMeshes) {
					mesh.visible = true;
				}
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

	function createSegmentedMesh(mesh: any) {
		isProcessingMesh = true;
		const geometry = mesh.geometry;
		console.log(geometry);

		// Get the number of triangles (polygons)
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;

		totalTrianglesAmount = triangleCount;

		// const polygonsPerMesh = polygonsPerMesh;

		// Compute bounding box
		const boundingBox = new THREE.Box3().setFromObject(mesh);
		const size = new THREE.Vector3();
		boundingBox.getSize(size);

		// Determine how many divisions we need in each axis to get roughly the amount of polygons per mesh
		const totalVolume = size.x * size.y * size.z;
		const volumePerMesh = totalVolume / (triangleCount / polygonsPerMesh);
		const divisionLength = Math.pow(volumePerMesh, 1 / 3);

		const divisionsX = gridDivisionsX;
		const divisionsY = gridDivisionsY;
		const divisionsZ = gridDivisionsZ;

		// Create an array to hold polygons for each cell
		const cells = Array(divisionsX * divisionsY * divisionsZ)
			.fill()
			.map(() => []);

		// Assign each polygon to a cell based on its centroid
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;

		for (let i = 0; i < triangleCount; i++) {
			// Get the three vertices of this triangle
			let v1, v2, v3;

			if (indices) {
				const idx1 = indices[i * 3] * 3;
				const idx2 = indices[i * 3 + 1] * 3;
				const idx3 = indices[i * 3 + 2] * 3;

				v1 = new THREE.Vector3(
					positionAttr.array[idx1],
					positionAttr.array[idx1 + 1],
					positionAttr.array[idx1 + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx2],
					positionAttr.array[idx2 + 1],
					positionAttr.array[idx2 + 2]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx3],
					positionAttr.array[idx3 + 1],
					positionAttr.array[idx3 + 2]
				);
			} else {
				const idx = i * 9;

				v1 = new THREE.Vector3(
					positionAttr.array[idx],
					positionAttr.array[idx + 1],
					positionAttr.array[idx + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx + 3],
					positionAttr.array[idx + 4],
					positionAttr.array[idx + 5]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx + 6],
					positionAttr.array[idx + 7],
					positionAttr.array[idx + 8]
				);
			}

			// Apply mesh transformation
			v1.applyMatrix4(mesh.matrixWorld);
			v2.applyMatrix4(mesh.matrixWorld);
			v3.applyMatrix4(mesh.matrixWorld);

			// Calculate centroid
			const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

			// Determine which cell this triangle belongs to
			const cellX = Math.min(
				divisionsX - 1,
				Math.max(0, Math.floor(((centroid.x - boundingBox.min.x) / size.x) * divisionsX))
			);
			const cellY = Math.min(
				divisionsY - 1,
				Math.max(0, Math.floor(((centroid.y - boundingBox.min.y) / size.y) * divisionsY))
			);
			const cellZ = Math.min(
				divisionsZ - 1,
				Math.max(0, Math.floor(((centroid.z - boundingBox.min.z) / size.z) * divisionsZ))
			);

			const cellIndex = cellX + cellY * divisionsX + cellZ * divisionsX * divisionsY;
			cells[cellIndex].push(i);
		}

		//smoothSegmentEdges(cells, geometry, 3);

		// Create meshes for each non-empty cell
		const smallMeshes = [];

		for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
			const triangles = cells[cellIndex];

			if (triangles.length === 0) continue;

			// Create a new geometry for this cell
			const cellGeometry = new THREE.BufferGeometry();

			if (indices) {
				// For indexed geometries
				const newIndices = [];
				const vertexMap = new Map();
				let nextIndex = 0;

				for (const triangleIndex of triangles) {
					for (let j = 0; j < 3; j++) {
						const originalIndex = indices[triangleIndex * 3 + j];

						if (!vertexMap.has(originalIndex)) {
							vertexMap.set(originalIndex, nextIndex++);
						}

						newIndices.push(vertexMap.get(originalIndex));
					}
				}

				// Create new attribute arrays
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					const attribute = geometry.attributes[name];
					const itemSize = attribute.itemSize;
					const array = attribute.array;
					const newArray = new Float32Array(vertexMap.size * itemSize);

					for (const [originalIndex, newIndex] of vertexMap.entries()) {
						for (let k = 0; k < itemSize; k++) {
							newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
						}
					}

					newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
				}

				// Set attributes and indices
				for (const name in newAttributes) {
					cellGeometry.setAttribute(name, newAttributes[name]);
				}

				cellGeometry.setIndex(newIndices);
			} else {
				// For non-indexed geometries
				const newPositions = [];

				// Copy other attribute arrays if needed
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					newAttributes[name] = [];
				}

				for (const triangleIndex of triangles) {
					const baseIndex = triangleIndex * 9;

					// Copy position data for this triangle
					for (let j = 0; j < 9; j++) {
						newPositions.push(positionAttr.array[baseIndex + j]);
					}

					// Copy other attribute data
					for (const name in geometry.attributes) {
						if (name === 'position') continue;

						const attribute = geometry.attributes[name];
						const itemSize = attribute.itemSize;
						const vertexBaseIndex = triangleIndex * 3 * itemSize;

						for (let j = 0; j < 3 * itemSize; j++) {
							newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
						}
					}
				}

				// Set position attribute
				cellGeometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(newPositions), 3)
				);

				// Set other attributes
				for (const name in newAttributes) {
					if (name === 'position') continue;

					const attribute = geometry.attributes[name];
					cellGeometry.setAttribute(
						name,
						new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
					);
				}
			}

			// Create a color based on the cell index using HSL
			const hue = (cellIndex * 137.5) % 360; // Golden angle approximation for good distribution
			const saturation = 0.85;
			const lightness = 0.5;
			const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

			const cellMaterial = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.1,
				roughness: 0.7
			});

			// Create a new mesh
			const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
			cellMesh.geometry.computeVertexNormals();
			cellMesh.material.needsUpdate = true;

			if (viewType != 4) {
				cellMesh.visible = false;
			}
			smallMeshes.push(cellMesh);
			segmentedMeshes.push(cellMesh);
			scene.add(cellMesh);
		}
		// console.log(scene);
		isProcessingMesh = false;
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

	function generateRandomPointsInBoundingBox(boundingBox, numPoints) {
		const points = [];
		const min = boundingBox.min;
		const max = boundingBox.max;

		for (let i = 0; i < numPoints; i++) {
			const point = new THREE.Vector3(
				min.x + Math.random() * (max.x - min.x),
				min.y + Math.random() * (max.y - min.y),
				min.z + Math.random() * (max.z - min.z)
			);
			points.push(point);
		}

		return points;
	}

	function createVoronoiSegmentation(mesh: any) {
		// Clear previous segmented meshes
		clearSegmentedMeshes();
		isProcessingMesh = true;

		const geometry = mesh.geometry;
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;

		// Get the bounding box
		const boundingBox = new THREE.Box3().setFromObject(mesh);

		// Generate random points for Voronoi cells
		const voronoiPoints = generateRandomPointsInBoundingBox(boundingBox, voronoiPointCount);

		// Create cells for each Voronoi point
		const cells = Array(voronoiPoints.length)
			.fill()
			.map(() => []);

		// Get triangle count
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;

		totalTrianglesAmount = triangleCount;

		// Assign each triangle to the closest Voronoi point
		for (let i = 0; i < triangleCount; i++) {
			// Get the three vertices of this triangle
			let v1, v2, v3;

			if (indices) {
				const idx1 = indices[i * 3] * 3;
				const idx2 = indices[i * 3 + 1] * 3;
				const idx3 = indices[i * 3 + 2] * 3;

				v1 = new THREE.Vector3(
					positionAttr.array[idx1],
					positionAttr.array[idx1 + 1],
					positionAttr.array[idx1 + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx2],
					positionAttr.array[idx2 + 1],
					positionAttr.array[idx2 + 2]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx3],
					positionAttr.array[idx3 + 1],
					positionAttr.array[idx3 + 2]
				);
			} else {
				const idx = i * 9;

				v1 = new THREE.Vector3(
					positionAttr.array[idx],
					positionAttr.array[idx + 1],
					positionAttr.array[idx + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx + 3],
					positionAttr.array[idx + 4],
					positionAttr.array[idx + 5]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx + 6],
					positionAttr.array[idx + 7],
					positionAttr.array[idx + 8]
				);
			}

			// Apply mesh transformation
			v1.applyMatrix4(mesh.matrixWorld);
			v2.applyMatrix4(mesh.matrixWorld);
			v3.applyMatrix4(mesh.matrixWorld);

			// Calculate centroid
			const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

			// Find closest Voronoi point
			let minDist = Infinity;
			let closestPointIndex = 0;

			for (let j = 0; j < voronoiPoints.length; j++) {
				const dist = centroid.distanceTo(voronoiPoints[j]);
				if (dist < minDist) {
					minDist = dist;
					closestPointIndex = j;
				}
			}

			// Assign triangle to the cell of the closest point
			cells[closestPointIndex].push(i);
		}

		// Create meshes for each non-empty cell (reusing your existing code)
		// This is where we reuse the existing mesh creation logic
		const smallMeshes = [];

		for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
			const triangles = cells[cellIndex];

			if (triangles.length === 0) continue;

			// Create a new geometry for this cell
			const cellGeometry = new THREE.BufferGeometry();

			if (indices) {
				// For indexed geometries
				const newIndices = [];
				const vertexMap = new Map();
				let nextIndex = 0;

				for (const triangleIndex of triangles) {
					for (let j = 0; j < 3; j++) {
						const originalIndex = indices[triangleIndex * 3 + j];

						if (!vertexMap.has(originalIndex)) {
							vertexMap.set(originalIndex, nextIndex++);
						}

						newIndices.push(vertexMap.get(originalIndex));
					}
				}

				// Create new attribute arrays
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					const attribute = geometry.attributes[name];
					const itemSize = attribute.itemSize;
					const array = attribute.array;
					const newArray = new Float32Array(vertexMap.size * itemSize);

					for (const [originalIndex, newIndex] of vertexMap.entries()) {
						for (let k = 0; k < itemSize; k++) {
							newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
						}
					}

					newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
				}

				// Set attributes and indices
				for (const name in newAttributes) {
					cellGeometry.setAttribute(name, newAttributes[name]);
				}

				cellGeometry.setIndex(newIndices);
			} else {
				// For non-indexed geometries
				const newPositions = [];

				// Copy other attribute arrays if needed
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					newAttributes[name] = [];
				}

				for (const triangleIndex of triangles) {
					const baseIndex = triangleIndex * 9;

					// Copy position data for this triangle
					for (let j = 0; j < 9; j++) {
						newPositions.push(positionAttr.array[baseIndex + j]);
					}

					// Copy other attribute data
					for (const name in geometry.attributes) {
						if (name === 'position') continue;

						const attribute = geometry.attributes[name];
						const itemSize = attribute.itemSize;
						const vertexBaseIndex = triangleIndex * 3 * itemSize;

						for (let j = 0; j < 3 * itemSize; j++) {
							newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
						}
					}
				}

				// Set position attribute
				cellGeometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(newPositions), 3)
				);

				// Set other attributes
				for (const name in newAttributes) {
					if (name === 'position') continue;

					const attribute = geometry.attributes[name];
					cellGeometry.setAttribute(
						name,
						new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
					);
				}
			}

			// Create a color based on the cell index using HSL
			const hue = (cellIndex * 137.5) % 360; // Golden angle approximation for good distribution
			const saturation = 0.85;
			const lightness = 0.5;
			const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

			const cellMaterial = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.1,
				roughness: 0.7
			});

			// Create a new mesh
			const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
			cellMesh.geometry.computeVertexNormals();
			cellMesh.material.needsUpdate = true;

			if (viewType != 5) {
				cellMesh.visible = false;
			}

			smallMeshes.push(cellMesh);
			segmentedMeshes.push(cellMesh);
			scene.add(cellMesh);
		}

		isProcessingMesh = false;
	}

	function createHexagonalSegmentation(mesh: any) {
		clearSegmentedMeshes();
		isProcessingMesh = true;

		const geometry = mesh.geometry;
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;

		// Get triangle count
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;

		totalTrianglesAmount = triangleCount;

		// Build adjacency information
		const adjacencyList = buildAdjacencyList(geometry);

		// Calculate triangle centroids for distance calculations
		const triangleCentroids = [];
		for (let i = 0; i < triangleCount; i++) {
			let v1, v2, v3;

			if (indices) {
				const idx1 = indices[i * 3] * 3;
				const idx2 = indices[i * 3 + 1] * 3;
				const idx3 = indices[i * 3 + 2] * 3;

				v1 = new THREE.Vector3(
					positionAttr.array[idx1],
					positionAttr.array[idx1 + 1],
					positionAttr.array[idx1 + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx2],
					positionAttr.array[idx2 + 1],
					positionAttr.array[idx2 + 2]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx3],
					positionAttr.array[idx3 + 1],
					positionAttr.array[idx3 + 2]
				);
			} else {
				const idx = i * 9;

				v1 = new THREE.Vector3(
					positionAttr.array[idx],
					positionAttr.array[idx + 1],
					positionAttr.array[idx + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx + 3],
					positionAttr.array[idx + 4],
					positionAttr.array[idx + 5]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx + 6],
					positionAttr.array[idx + 7],
					positionAttr.array[idx + 8]
				);
			}

			// Apply mesh transformation
			v1.applyMatrix4(mesh.matrixWorld);
			v2.applyMatrix4(mesh.matrixWorld);
			v3.applyMatrix4(mesh.matrixWorld);

			// Calculate centroid
			const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
			triangleCentroids.push(centroid);
		}

		// Keep track of which triangles have been processed
		const processedTriangles = new Set();

		// Create hexagonal groups
		const hexGroups = [];

		// Calculate the target number of segments based on total triangles and hexPolygonCount
		const targetSegmentCount = Math.max(1, Math.ceil(triangleCount / hexPolygonCount));
		console.log(
			`Target segment count: ${targetSegmentCount}, Total triangles: ${triangleCount}, Polygons per segment: ${hexPolygonCount}`
		);

		// Process triangles to form hexagons by selecting random starting points
		while (processedTriangles.size < triangleCount) {
			// Get all unprocessed triangles
			const unprocessedTriangles = [];
			for (let i = 0; i < triangleCount; i++) {
				if (!processedTriangles.has(i)) {
					unprocessedTriangles.push(i);
				}
			}

			if (unprocessedTriangles.length === 0) break;

			// Select a random unprocessed triangle as the starting point
			const randomIndex = Math.floor(Math.random() * unprocessedTriangles.length);
			const startTriangle = unprocessedTriangles[randomIndex];

			// Start a new hexagon with this triangle
			const hexGroup = [startTriangle];
			processedTriangles.add(startTriangle);

			// Use an enhanced breadth-first search to add adjacent triangles
			const queue = [...adjacencyList[startTriangle]];
			const visited = new Set([startTriangle]);

			// Create a distance map to prioritize triangles closer to the start
			const distanceMap = new Map();
			adjacencyList[startTriangle].forEach((neighbor) => {
				distanceMap.set(neighbor, 1);
			});

			// Continue adding triangles until we reach the desired size or run out of connected triangles
			while (hexGroup.length < hexPolygonCount && queue.length > 0) {
				// Sort queue by distance to prioritize closer triangles
				queue.sort((a, b) => (distanceMap.get(a) || Infinity) - (distanceMap.get(b) || Infinity));

				const nextTriangle = queue.shift();

				// Skip if already processed or visited
				if (processedTriangles.has(nextTriangle) || visited.has(nextTriangle)) continue;

				visited.add(nextTriangle);
				hexGroup.push(nextTriangle);
				processedTriangles.add(nextTriangle);

				// Add neighbors to the queue with updated distances
				for (const neighbor of adjacencyList[nextTriangle]) {
					if (!visited.has(neighbor) && !processedTriangles.has(neighbor)) {
						const currentDist = distanceMap.get(nextTriangle) || 0;
						distanceMap.set(neighbor, currentDist + 1);

						// Only add to queue if not already there
						if (!queue.includes(neighbor)) {
							queue.push(neighbor);
						}
					}
				}
			}

			// If we couldn't find enough connected triangles, try to add more from unprocessed triangles
			if (hexGroup.length < hexPolygonCount) {
				// Find unprocessed triangles that are closest to any triangle in the current group
				const remainingNeeded = hexPolygonCount - hexGroup.length;
				const candidates = [];

				for (let i = 0; i < triangleCount; i++) {
					if (!processedTriangles.has(i)) {
						// Find minimum distance to any triangle in the current group
						let minDist = Infinity;
						for (const groupTriangle of hexGroup) {
							const dist = triangleCentroids[i].distanceTo(triangleCentroids[groupTriangle]);
							minDist = Math.min(minDist, dist);
						}
						candidates.push({ triangle: i, distance: minDist });
					}
				}

				// Sort candidates by distance and add the closest ones
				candidates.sort((a, b) => a.distance - b.distance);
				for (let i = 0; i < Math.min(remainingNeeded, candidates.length); i++) {
					hexGroup.push(candidates[i].triangle);
					processedTriangles.add(candidates[i].triangle);
				}
			}

			// Only add non-empty groups
			if (hexGroup.length > 0) {
				hexGroups.push(hexGroup);
			}

			// If we've created enough segments, break out of the loop
			if (
				hexGroups.length >= targetSegmentCount &&
				processedTriangles.size >= triangleCount * 0.95
			) {
				break;
			}
		}

		console.log(
			`Created ${hexGroups.length} segments with an average of ${processedTriangles.size / hexGroups.length} triangles per segment`
		);

		// Create meshes for each hexagon group
		for (let groupIndex = 0; groupIndex < hexGroups.length; groupIndex++) {
			const triangles = hexGroups[groupIndex];

			if (triangles.length === 0) continue;

			// Create a new geometry for this hexagon
			const hexGeometry = new THREE.BufferGeometry();

			if (indices) {
				// For indexed geometries
				const newIndices = [];
				const vertexMap = new Map();
				let nextIndex = 0;

				for (const triangleIndex of triangles) {
					for (let j = 0; j < 3; j++) {
						const originalIndex = indices[triangleIndex * 3 + j];

						if (!vertexMap.has(originalIndex)) {
							vertexMap.set(originalIndex, nextIndex++);
						}

						newIndices.push(vertexMap.get(originalIndex));
					}
				}

				// Create new attribute arrays
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					const attribute = geometry.attributes[name];
					const itemSize = attribute.itemSize;
					const array = attribute.array;
					const newArray = new Float32Array(vertexMap.size * itemSize);

					for (const [originalIndex, newIndex] of vertexMap.entries()) {
						for (let k = 0; k < itemSize; k++) {
							newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
						}
					}

					newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
				}

				// Set attributes and indices
				for (const name in newAttributes) {
					hexGeometry.setAttribute(name, newAttributes[name]);
				}

				hexGeometry.setIndex(newIndices);
			} else {
				// For non-indexed geometries
				const newPositions = [];

				// Copy other attribute arrays if needed
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					newAttributes[name] = [];
				}

				for (const triangleIndex of triangles) {
					const baseIndex = triangleIndex * 9;

					// Copy position data for this triangle
					for (let j = 0; j < 9; j++) {
						newPositions.push(positionAttr.array[baseIndex + j]);
					}

					// Copy other attribute data
					for (const name in geometry.attributes) {
						if (name === 'position') continue;

						const attribute = geometry.attributes[name];
						const itemSize = attribute.itemSize;
						const vertexBaseIndex = triangleIndex * 3 * itemSize;

						for (let j = 0; j < 3 * itemSize; j++) {
							newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
						}
					}
				}

				// Set position attribute
				hexGeometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(newPositions), 3)
				);

				// Set other attributes
				for (const name in newAttributes) {
					if (name === 'position') continue;

					const attribute = geometry.attributes[name];
					hexGeometry.setAttribute(
						name,
						new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
					);
				}
			}

			// Create a color based on the group index
			const hue = (groupIndex * 137.5) % 360; // Golden angle for good distribution
			const saturation = 0.85;
			const lightness = 0.5;
			const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

			const hexMaterial = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.1,
				roughness: 0.7
			});

			// Create a new mesh
			const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
			hexMesh.geometry.computeVertexNormals();
			hexMesh.material.needsUpdate = true;

			if (viewType != 6) {
				hexMesh.visible = false;
			}

			segmentedMeshes.push(hexMesh);
			scene.add(hexMesh);
		}

		isProcessingMesh = false;
	}

	function createStripedSegmentation(mesh: any) {
		clearSegmentedMeshes();
		isProcessingMesh = true;

		const geometry = mesh.geometry;
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;

		// Get triangle count
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;

		totalTrianglesAmount = triangleCount;

		// Build adjacency information
		const adjacencyList = buildAdjacencyList(geometry);

		// Calculate triangle centroids for distance calculations
		const triangleCentroids = [];
		for (let i = 0; i < triangleCount; i++) {
			let v1, v2, v3;

			if (indices) {
				const idx1 = indices[i * 3] * 3;
				const idx2 = indices[i * 3 + 1] * 3;
				const idx3 = indices[i * 3 + 2] * 3;

				v1 = new THREE.Vector3(
					positionAttr.array[idx1],
					positionAttr.array[idx1 + 1],
					positionAttr.array[idx1 + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx2],
					positionAttr.array[idx2 + 1],
					positionAttr.array[idx2 + 2]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx3],
					positionAttr.array[idx3 + 1],
					positionAttr.array[idx3 + 2]
				);
			} else {
				const idx = i * 9;

				v1 = new THREE.Vector3(
					positionAttr.array[idx],
					positionAttr.array[idx + 1],
					positionAttr.array[idx + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx + 3],
					positionAttr.array[idx + 4],
					positionAttr.array[idx + 5]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx + 6],
					positionAttr.array[idx + 7],
					positionAttr.array[idx + 8]
				);
			}

			// Apply mesh transformation
			v1.applyMatrix4(mesh.matrixWorld);
			v2.applyMatrix4(mesh.matrixWorld);
			v3.applyMatrix4(mesh.matrixWorld);

			// Calculate centroid
			const centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
			triangleCentroids.push(centroid);
		}

		// Keep track of which triangles have been processed
		const processedTriangles = new Set();

		// Create hexagonal groups
		const hexGroups = [];

		// Calculate the target number of segments based on total triangles and hexPolygonCount
		const targetSegmentCount = Math.max(1, Math.ceil(triangleCount / stripePolygonCount));
		console.log(
			`Target segment count: ${targetSegmentCount}, Total triangles: ${triangleCount}, Polygons per segment: ${stripePolygonCount}`
		);

		// Sort triangles by height (y-coordinate) to start from the top
		const trianglesByHeight = [];
		for (let i = 0; i < triangleCount; i++) {
			trianglesByHeight.push({
				index: i,
				y: triangleCentroids[i].y
			});
		}
		trianglesByHeight.sort((a, b) => b.y - a.y); // Sort in descending order (highest first)

		// Process triangles to form segments in a top-to-bottom flow
		while (processedTriangles.size < triangleCount) {
			// Find the highest unprocessed triangle
			let startTriangle = -1;
			for (const triangle of trianglesByHeight) {
				if (!processedTriangles.has(triangle.index)) {
					startTriangle = triangle.index;
					break;
				}
			}

			if (startTriangle === -1) break; // No more unprocessed triangles

			// Start a new segment with this triangle
			const hexGroup = [startTriangle];
			processedTriangles.add(startTriangle);

			// Keep track of the current triangle
			let currentTriangle = startTriangle;
			let currentY = triangleCentroids[currentTriangle].y;

			// Continue adding triangles until we reach the desired size
			while (hexGroup.length < stripePolygonCount) {
				// Find adjacent triangles that are lower than the current one
				const lowerNeighbors = [];
				for (const neighbor of adjacencyList[currentTriangle]) {
					if (!processedTriangles.has(neighbor)) {
						const neighborY = triangleCentroids[neighbor].y;
						if (neighborY < currentY) {
							lowerNeighbors.push({
								index: neighbor,
								y: neighborY,
								distance: triangleCentroids[currentTriangle].distanceTo(triangleCentroids[neighbor])
							});
						}
					}
				}

				// If no lower neighbors, try any unprocessed adjacent neighbors
				if (lowerNeighbors.length === 0) {
					for (const neighbor of adjacencyList[currentTriangle]) {
						if (!processedTriangles.has(neighbor)) {
							lowerNeighbors.push({
								index: neighbor,
								y: triangleCentroids[neighbor].y,
								distance: triangleCentroids[currentTriangle].distanceTo(triangleCentroids[neighbor])
							});
						}
					}
				}

				// If still no neighbors, find the closest unprocessed triangle
				if (lowerNeighbors.length === 0) {
					let closestUnprocessed = null;
					let minDistance = Infinity;

					for (let i = 0; i < triangleCount; i++) {
						if (!processedTriangles.has(i)) {
							const dist = triangleCentroids[currentTriangle].distanceTo(triangleCentroids[i]);
							if (dist < minDistance) {
								minDistance = dist;
								closestUnprocessed = i;
							}
						}
					}

					if (closestUnprocessed !== null) {
						lowerNeighbors.push({
							index: closestUnprocessed,
							y: triangleCentroids[closestUnprocessed].y,
							distance: minDistance
						});
					} else {
						// No more triangles to process
						break;
					}
				}

				// Sort neighbors by y-coordinate (lowest first) and then by distance (closest first)
				lowerNeighbors.sort((a, b) => {
					// Prioritize lower triangles
					if (a.y !== b.y) {
						return a.y - b.y;
					}
					// If same height, prioritize closest
					return a.distance - b.distance;
				});

				// Add the best neighbor to our group
				const nextTriangle = lowerNeighbors[0].index;
				hexGroup.push(nextTriangle);
				processedTriangles.add(nextTriangle);

				// Update current triangle and its y-coordinate
				currentTriangle = nextTriangle;
				currentY = triangleCentroids[currentTriangle].y;

				// If we've reached the target size, break out
				if (hexGroup.length >= stripePolygonCount) {
					break;
				}
			}

			// Only add non-empty groups
			if (hexGroup.length > 0) {
				hexGroups.push(hexGroup);
			}

			// If we've created enough segments, continue but don't break out
			// This ensures we process all triangles
		}

		// If there are still unprocessed triangles, add them to the last group or create new groups
		if (processedTriangles.size < triangleCount) {
			const remainingTriangles = [];
			for (let i = 0; i < triangleCount; i++) {
				if (!processedTriangles.has(i)) {
					remainingTriangles.push(i);
				}
			}

			// Create new groups with the remaining triangles
			while (remainingTriangles.length > 0) {
				const newGroup = [];
				const groupSize = Math.min(stripePolygonCount, remainingTriangles.length);

				for (let i = 0; i < groupSize; i++) {
					newGroup.push(remainingTriangles.shift());
				}

				hexGroups.push(newGroup);
			}
		}

		console.log(
			`Created ${hexGroups.length} segments with an average of ${processedTriangles.size / hexGroups.length} triangles per segment`
		);

		// Create meshes for each hexagon group
		for (let groupIndex = 0; groupIndex < hexGroups.length; groupIndex++) {
			const triangles = hexGroups[groupIndex];

			if (triangles.length === 0) continue;

			// Create a new geometry for this hexagon
			const hexGeometry = new THREE.BufferGeometry();

			if (indices) {
				// For indexed geometries
				const newIndices = [];
				const vertexMap = new Map();
				let nextIndex = 0;

				for (const triangleIndex of triangles) {
					for (let j = 0; j < 3; j++) {
						const originalIndex = indices[triangleIndex * 3 + j];

						if (!vertexMap.has(originalIndex)) {
							vertexMap.set(originalIndex, nextIndex++);
						}

						newIndices.push(vertexMap.get(originalIndex));
					}
				}

				// Create new attribute arrays
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					const attribute = geometry.attributes[name];
					const itemSize = attribute.itemSize;
					const array = attribute.array;
					const newArray = new Float32Array(vertexMap.size * itemSize);

					for (const [originalIndex, newIndex] of vertexMap.entries()) {
						for (let k = 0; k < itemSize; k++) {
							newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
						}
					}

					newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
				}

				// Set attributes and indices
				for (const name in newAttributes) {
					hexGeometry.setAttribute(name, newAttributes[name]);
				}

				hexGeometry.setIndex(newIndices);
			} else {
				// For non-indexed geometries
				const newPositions = [];

				// Copy other attribute arrays if needed
				const newAttributes: any = {};
				for (const name in geometry.attributes) {
					newAttributes[name] = [];
				}

				for (const triangleIndex of triangles) {
					const baseIndex = triangleIndex * 9;

					// Copy position data for this triangle
					for (let j = 0; j < 9; j++) {
						newPositions.push(positionAttr.array[baseIndex + j]);
					}

					// Copy other attribute data
					for (const name in geometry.attributes) {
						if (name === 'position') continue;

						const attribute = geometry.attributes[name];
						const itemSize = attribute.itemSize;
						const vertexBaseIndex = triangleIndex * 3 * itemSize;

						for (let j = 0; j < 3 * itemSize; j++) {
							newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
						}
					}
				}

				// Set position attribute
				hexGeometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(newPositions), 3)
				);

				// Set other attributes
				for (const name in newAttributes) {
					if (name === 'position') continue;

					const attribute = geometry.attributes[name];
					hexGeometry.setAttribute(
						name,
						new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
					);
				}
			}

			// Create a color based on the group index
			const hue = (groupIndex * 137.5) % 360; // Golden angle for good distribution
			const saturation = 0.85;
			const lightness = 0.5;
			const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

			const hexMaterial = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.1,
				roughness: 0.7
			});

			// Create a new mesh
			const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
			hexMesh.geometry.computeVertexNormals();
			hexMesh.material.needsUpdate = true;

			if (viewType != 7) {
				hexMesh.visible = false;
			}

			segmentedMeshes.push(hexMesh);
			scene.add(hexMesh);
		}

		isProcessingMesh = false;
	}

	function buildAdjacencyList(geometry) {
		const indices = geometry.index ? geometry.index.array : null;
		const triangleCount = indices
			? Math.floor(indices.length / 3)
			: Math.floor(geometry.attributes.position.count / 3);

		// Validate triangleCount
		if (triangleCount <= 0 || !Number.isInteger(triangleCount)) {
			console.error('Invalid triangle count:', triangleCount);
			return [];
		}

		// Create adjacency list
		const adjacencyList = Array(triangleCount)
			.fill()
			.map(() => []);

		// Build edge to triangle map
		const edgeToTriangle = new Map();

		for (let i = 0; i < triangleCount; i++) {
			// Get the three vertices of this triangle
			let v1, v2, v3;

			if (indices) {
				v1 = indices[i * 3];
				v2 = indices[i * 3 + 1];
				v3 = indices[i * 3 + 2];
			} else {
				v1 = i * 3;
				v2 = i * 3 + 1;
				v3 = i * 3 + 2;
			}

			// Create the three edges (ensure consistent ordering)
			const edge1 = [Math.min(v1, v2), Math.max(v1, v2)].toString();
			const edge2 = [Math.min(v2, v3), Math.max(v2, v3)].toString();
			const edge3 = [Math.min(v3, v1), Math.max(v3, v1)].toString();

			// For each edge, find triangles that share it
			for (const edge of [edge1, edge2, edge3]) {
				if (edgeToTriangle.has(edge)) {
					const otherTriangle = edgeToTriangle.get(edge);
					// Add bidirectional adjacency
					adjacencyList[i].push(otherTriangle);
					adjacencyList[otherTriangle].push(i);
				} else {
					edgeToTriangle.set(edge, i);
				}
			}
		}

		return adjacencyList;
	}

	function createNormalBasedSegmentation(mesh, angleThreshold = 20) {
		isProcessingMesh = true;
		const geometry = mesh.geometry;

		// Get the number of triangles
		const triangleCount = geometry.index
			? geometry.index.count / 3
			: geometry.attributes.position.count / 3;

		totalTrianglesAmount = triangleCount;

		// Build adjacency list
		const adjacencyList = buildAdjacencyList(geometry);

		// Calculate normals for each triangle
		const triangleNormals = calculateTriangleNormals(geometry);

		// Convert angle threshold to radians
		const thresholdRadians = (angleThreshold * Math.PI) / 180;

		// Create regions by merging triangles with similar normals
		const regions = [];
		const assignedTriangles = new Set();

		// Iterative triangle merging
		for (let i = 0; i < triangleCount; i++) {
			if (assignedTriangles.has(i)) continue;

			// Start a new region with this triangle
			const region = [i];
			assignedTriangles.add(i);

			// Use a queue for region growing
			const queue = [i];

			while (queue.length > 0) {
				const currentTriangle = queue.shift();
				const currentNormal = triangleNormals[currentTriangle];

				// Check all adjacent triangles
				for (const adjacentTriangle of adjacencyList[currentTriangle]) {
					if (assignedTriangles.has(adjacentTriangle)) continue;

					const adjacentNormal = triangleNormals[adjacentTriangle];

					// Calculate angle between normals
					const angle = Math.acos(Math.min(1, Math.max(-1, currentNormal.dot(adjacentNormal))));

					// If angle is below threshold, add to region
					if (angle < thresholdRadians) {
						region.push(adjacentTriangle);
						assignedTriangles.add(adjacentTriangle);
						queue.push(adjacentTriangle);
					}
				}
			}

			regions.push(region);
		}

		// Merge regions to prevent over-segmentation
		// const mergedRegions = mergeRegions(regions, triangleNormals, angleThreshold, adjacencyList);

		if (viewType === 8) {
			// Create meshes for each region
			segmentedMeshes = createMeshesFromRegions(mesh, geometry, regions);
		}

		isProcessingMesh = false;
		return regions;
	}

	// Helper function to calculate triangle normals
	function calculateTriangleNormals(geometry) {
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;
		const triangleCount = indices ? indices.length / 3 : positionAttr.count / 3;

		const normals = [];

		for (let i = 0; i < triangleCount; i++) {
			let v1, v2, v3;

			if (indices) {
				const idx1 = indices[i * 3] * 3;
				const idx2 = indices[i * 3 + 1] * 3;
				const idx3 = indices[i * 3 + 2] * 3;

				v1 = new THREE.Vector3(
					positionAttr.array[idx1],
					positionAttr.array[idx1 + 1],
					positionAttr.array[idx1 + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx2],
					positionAttr.array[idx2 + 1],
					positionAttr.array[idx2 + 2]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx3],
					positionAttr.array[idx3 + 1],
					positionAttr.array[idx3 + 2]
				);
			} else {
				const idx = i * 9;

				v1 = new THREE.Vector3(
					positionAttr.array[idx],
					positionAttr.array[idx + 1],
					positionAttr.array[idx + 2]
				);

				v2 = new THREE.Vector3(
					positionAttr.array[idx + 3],
					positionAttr.array[idx + 4],
					positionAttr.array[idx + 5]
				);

				v3 = new THREE.Vector3(
					positionAttr.array[idx + 6],
					positionAttr.array[idx + 7],
					positionAttr.array[idx + 8]
				);
			}

			// Calculate triangle normal
			const edge1 = new THREE.Vector3().subVectors(v2, v1);
			const edge2 = new THREE.Vector3().subVectors(v3, v1);
			const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

			normals.push(normal);
		}

		return normals;
	}

	// Function to create meshes from regions
	function createMeshesFromRegions(mesh, geometry, regions) {
		const segmentedMeshes = [];
		const positionAttr = geometry.attributes.position;
		const indices = geometry.index ? geometry.index.array : null;

		regions.forEach((triangles, regionIndex) => {
			// Create a new geometry for this region
			const regionGeometry = new THREE.BufferGeometry();

			if (indices) {
				// For indexed geometries
				const newIndices = [];
				const vertexMap = new Map();
				let nextIndex = 0;

				for (const triangleIndex of triangles) {
					for (let j = 0; j < 3; j++) {
						const originalIndex = indices[triangleIndex * 3 + j];

						if (!vertexMap.has(originalIndex)) {
							vertexMap.set(originalIndex, nextIndex++);
						}

						newIndices.push(vertexMap.get(originalIndex));
					}
				}

				// Create new attribute arrays
				const newAttributes = {};
				for (const name in geometry.attributes) {
					const attribute = geometry.attributes[name];
					const itemSize = attribute.itemSize;
					const array = attribute.array;
					const newArray = new Float32Array(vertexMap.size * itemSize);

					for (const [originalIndex, newIndex] of vertexMap.entries()) {
						for (let k = 0; k < itemSize; k++) {
							newArray[newIndex * itemSize + k] = array[originalIndex * itemSize + k];
						}
					}

					newAttributes[name] = new THREE.BufferAttribute(newArray, itemSize);
				}

				// Set attributes and indices
				for (const name in newAttributes) {
					regionGeometry.setAttribute(name, newAttributes[name]);
				}

				regionGeometry.setIndex(newIndices);
			} else {
				// For non-indexed geometries
				const newPositions = [];

				// Copy other attribute arrays if needed
				const newAttributes = {};
				for (const name in geometry.attributes) {
					newAttributes[name] = [];
				}

				for (const triangleIndex of triangles) {
					const baseIndex = triangleIndex * 9;

					// Copy position data for this triangle
					for (let j = 0; j < 9; j++) {
						newPositions.push(positionAttr.array[baseIndex + j]);
					}

					// Copy other attribute data
					for (const name in geometry.attributes) {
						if (name === 'position') continue;

						const attribute = geometry.attributes[name];
						const itemSize = attribute.itemSize;
						const vertexBaseIndex = triangleIndex * 3 * itemSize;

						for (let j = 0; j < 3 * itemSize; j++) {
							newAttributes[name].push(attribute.array[vertexBaseIndex + j]);
						}
					}
				}

				// Set position attribute
				regionGeometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(newPositions), 3)
				);

				// Set other attributes
				for (const name in newAttributes) {
					if (name === 'position') continue;

					const attribute = geometry.attributes[name];
					regionGeometry.setAttribute(
						name,
						new THREE.BufferAttribute(new Float32Array(newAttributes[name]), attribute.itemSize)
					);
				}
			}

			// Create a color based on the region index using HSL
			const hue = (regionIndex * 137.5) % 360; // Golden angle for good distribution
			const saturation = 0.85;
			const lightness = 0.5;
			const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

			const regionMaterial = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.1,
				roughness: 0.7
			});

			// Create a new mesh
			const regionMesh = new THREE.Mesh(regionGeometry, regionMaterial);
			regionMesh.geometry.computeVertexNormals();
			regionMesh.material.needsUpdate = true;

			segmentedMeshes.push(regionMesh);
			scene.add(regionMesh);
		});

		return segmentedMeshes;
	}

	function mergeRegions(regions, triangleNormals, angleThreshold, adjacencyList) {
		const mergedRegions = [...regions];
		let changed = true;
		const thresholdRadians = (angleThreshold * Math.PI) / 180;

		// Calculate average normal for each region
		const regionNormals = mergedRegions.map((region) => {
			const avgNormal = new THREE.Vector3();
			region.forEach((triangleIndex) => {
				avgNormal.add(triangleNormals[triangleIndex]);
			});
			return avgNormal.normalize();
		});

		// Iteratively merge regions
		while (changed) {
			changed = false;

			// Find adjacent regions
			for (let i = 0; i < mergedRegions.length; i++) {
				if (!mergedRegions[i] || mergedRegions[i].length === 0) continue;

				for (let j = i + 1; j < mergedRegions.length; j++) {
					if (!mergedRegions[j] || mergedRegions[j].length === 0) continue;

					// Check if regions are adjacent
					const areAdjacent = checkRegionsAdjacency(
						mergedRegions[i],
						mergedRegions[j],
						adjacencyList
					);

					if (areAdjacent) {
						// Calculate angle between region normals
						const angle = Math.acos(
							Math.min(1, Math.max(-1, regionNormals[i].dot(regionNormals[j])))
						);

						// If angle is below threshold, merge regions
						if (angle < thresholdRadians) {
							// Merge j into i
							mergedRegions[i] = [...mergedRegions[i], ...mergedRegions[j]];
							mergedRegions[j] = [];

							// Recalculate normal for region i
							const avgNormal = new THREE.Vector3();
							mergedRegions[i].forEach((triangleIndex) => {
								avgNormal.add(triangleNormals[triangleIndex]);
							});
							regionNormals[i] = avgNormal.normalize();

							changed = true;
						}
					}
				}
			}
		}

		// Filter out empty regions
		return mergedRegions.filter((region) => region.length > 0);
	}

	function checkRegionsAdjacency(region1, region2, adjacencyList) {
		for (const triangle1 of region1) {
			for (const triangle2 of region2) {
				if (adjacencyList[triangle1].includes(triangle2)) {
					return true;
				}
			}
		}
		return false;
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
					<option value="4">Grid Segmentation</option>
					<option value="5">Voronoi Segmentation</option>
					<option value="6">Abstract Segmentation</option>
					<option value="7">Strip Segmentation</option>
					<option value="8">Normal Segmentation</option>
				</select>
			</div>
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
									createSegmentedMesh(originalMesh);
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
									createSegmentedMesh(originalMesh);
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
									createSegmentedMesh(originalMesh);
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
								createVoronoiSegmentation(originalMesh);
								// createNormalBasedSegmentation(originalMesh);
							}
						}}
					/>
					<button
						onclick={() => {
							if (originalMesh) {
								clearSegmentedMeshes();
								createVoronoiSegmentation(originalMesh);
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
								createHexagonalSegmentation(originalMesh);
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
							createHexagonalSegmentation(originalMesh);
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
								createStripedSegmentation(originalMesh);
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
						angleThreshold = parseInt(e.target.value)
						if (originalMesh) {
							clearSegmentedMeshes();
							createNormalBasedSegmentation(originalMesh, angleThreshold);
						}
					}}
				/>
			</div>
			{/if}

			{#if viewType === 4 || viewType === 5 || viewType === 6 || viewType === 7 || viewType === 8}
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
				><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
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
			><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
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
</style>
