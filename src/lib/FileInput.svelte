<script lang="ts">
    import { textColor, bgColor, elements } from './store';
    import paper from 'paper';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    let { uuid = '' } = $props();
    let imageFile: any;
    let fileInput: any;
    let imageUrl = $state('');
    let loadingImage = $state(false);
    let canvas: HTMLCanvasElement;
    let dropArea: HTMLButtonElement;
    let isInpainting = $state(false);
    let isSavingMask = $state(false);
    let maskImageUrl:any = $state();
    let is3DModel = $state(false);
    let appCanvas: HTMLCanvasElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let lights: THREE.AmbientLight;
    let sun: THREE.DirectionalLight;
    let isSavingSceneScreenshot = $state(false);
    let sceneScreenshotUrl = $state()
    let isOptionsDisabled = $state(true)
    let noFileYet = $state(true)

    async function handleDrop(event: any) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                imageFile = file;
                await uploadFile(imageFile);
                isOptionsDisabled = false
                is3DModel = false;
            } else if (file.name.endsWith('.glb')) {
                loadGLBFile(file);
                is3DModel = true;
                isOptionsDisabled = false
                console.log(is3DModel)
            }
            noFileYet = false
        }
    }

    function handleDragOver(event: any) {
        event.preventDefault();
    }

    async function uploadFile(file: any) {
        loadingImage = true;
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('projectId', $page.params.projectId);

        try {
            const response = await fetch('/api/save-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                loadingImage = false;
                console.error('Upload failed:', response.statusText);
            } else {
                const result = await response.json();
                imageUrl = result.url;
                loadingImage = false;
                return result.url;
            }
        } catch (error) {
            loadingImage = false;
            console.error('Error during upload:', error);
        }
    }

    // Handle file input change
	async function handleFileInputChange(event: any) {
		if (event.target.files.length > 0) {
			imageFile = event.target.files[0];
			await uploadFile(imageFile);
            noFileYet = false
            isOptionsDisabled = false
		}
	}

    function loadGLBFile(file: File) {
        const loader = new GLTFLoader();
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer:any = e.target.result;
            loader.parse(arrayBuffer, '', async (gltf) => {
                scene = new THREE.Scene();
                scene.background = new THREE.Color('#1a1a1a');
                camera = new THREE.PerspectiveCamera(75, appCanvas.clientWidth / appCanvas.clientHeight, 0.1, 1000);
                renderer = new THREE.WebGLRenderer({ canvas: appCanvas, antialias: true });
                renderer.setSize(appCanvas.clientWidth, appCanvas.clientHeight);
                scene.add(gltf.scene);
                camera.position.z = 5;
                
                lights = new THREE.AmbientLight('white', 2)
                sun = new THREE.DirectionalLight('white', 1)
                sun.position.set(5, 5, 5)
                scene.add(lights, sun)

                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true; // Enable damping (inertia)
                controls.dampingFactor = 0.25; // Damping factor
                controls.maxDistance = 100; // Maximum zoom-out distance

                animate();
            });
        }; 

        
        reader.readAsArrayBuffer(file);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls
        renderer.render(scene, camera);
    }

    function addElement(elements: any = [], type = 'text', imageUrl = '', maskImageUrl = '') {
		console.log(elements);
		elements.push({
			type: type,
			systemPrompt: '',
			query: '',
			imageUrl: imageUrl,
			maskImageUrl: maskImageUrl
		});

		console.log(elements);
	}

    // function toggleInpaintingMode() {
    //     isInpainting = !isInpainting;
    //     setTimeout(() => {
    //         if (isInpainting && canvas) {
    //             paper.setup(canvas);
    //             canvas.width = dropArea.clientWidth;
    //             canvas.height = dropArea.clientHeight;
    //             canvas.style.backgroundColor = 'black';

    //             let rectangle: paper.Path.Rectangle | null = null;
    //             let startPoint: paper.Point | null = null;

    //             canvas.onpointerdown = (event: PointerEvent) => {
    //                 startPoint = new paper.Point(event.offsetX, event.offsetY);
    //                 rectangle = new paper.Path.Rectangle({
    //                     point: startPoint,
    //                     size: [0, 0],
    //                     strokeColor: 'white'
    //                 });
    //             };

    //             canvas.onpointermove = (event: PointerEvent) => {
    //                 if (rectangle && startPoint) {
    //                     const endPoint = new paper.Point(event.offsetX, event.offsetY);
    //                     rectangle.remove();
    //                     rectangle = new paper.Path.Rectangle({
    //                         from: startPoint,
    //                         to: endPoint,
    //                         strokeColor: 'white',
    //                         fillColor: 'white'
    //                     });
    //                 }
    //             };

    //             canvas.onpointerup = () => {
    //                 rectangle = null;
    //                 startPoint = null;
    //             };
    //         }
    //     }, 10);
    // }

    // async function getMaskUrl() {
    //     const canvas = document.getElementById(`${uuid}-canvas`);
    //     isSavingMask = true;
    //     const dataURL = canvas.toDataURL('image/jpeg');
    //     const blob = await fetch(dataURL).then((res) => res.blob());
    //     const formData = new FormData();
    //     formData.append('file', blob, 'canvas.jpeg');
    //     formData.append('projectId', $page.params.projectId);
    //     const response = await fetch('/api/save-image', { method: 'POST', body: formData });
    //     if (!response.ok) {
    //         isSavingMask = false;
    //         console.error('Upload failed:', response.statusText);
    //     } else {
    //         const result = await response.json();
    //         isSavingMask = false;
    //         return result.url;
    //     }
    // }

    async function get3dSceneScreenshotUrl() {
        renderer.render(scene, camera)
        const canvas = document.getElementById(`${uuid}-canvas`);
        isSavingSceneScreenshot = true;
        const dataURL = canvas.toDataURL('image/jpeg');
        const blob = await fetch(dataURL).then((res) => res.blob());
        const formData = new FormData();
        formData.append('file', blob, 'canvas.jpeg');
        formData.append('projectId', $page.params.projectId);
        const response = await fetch('/api/save-image', { method: 'POST', body: formData });
        if (!response.ok) {
            isSavingSceneScreenshot = false;
            console.error('Upload failed:', response.statusText);
        } else {
            const result = await response.json();
            isSavingSceneScreenshot = false;
            return result.url;
        }
    
        
    }
</script>

<div class="elementContainer">
    <details open>
        <summary>
            <div class="colorLine" style="background: #D6C4FF;"></div>
            <h3 style="color: hsl({$textColor})">File Input</h3>
        </summary>
        {#if isInpainting}
            <canvas bind:this={canvas} id='{uuid}-canvas' style='margin-top: 10px; border-radius: 10px; width: {dropArea.clientWidth}px; height: {dropArea.clientHeight}px; opacity: 0.5;'></canvas>
        {/if}
        {#if is3DModel}
            <canvas bind:this={appCanvas} id='{uuid}-canvas' style='margin-top: 10px; border-radius: 10px; width: {dropArea.clientWidth}px; height: {dropArea.clientHeight}px;'></canvas>
        {/if}
        <button
            class="dropArea"
            bind:this={dropArea}
            style="border: 1px solid hsla({$textColor}, 20%); color: hsl({$textColor}); min-height: {imageUrl != '' ? 'auto' : '300px'}"
            aria-label="Image upload area"
            ondrop={handleDrop}
            ondragover={handleDragOver}
            onclick={() => {
                fileInput.click();
            }}
        >
            {#if loadingImage}
                <div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
            {:else if imageUrl === ''}
                Drag and drop an image here or click to upload
            {:else}
                <img src={imageUrl} alt="uploaded file" />
            {/if}
        </button>
        <input
            type="file"
            accept="image/*"
            bind:this={fileInput}
            onchange={handleFileInputChange}
            style="display: none;"
        />

        {#if noFileYet }
            <div style="display: flex; align-items: center;" transition:slide>
                <span class="warning"></span>
                <p>Please, provide an image or a 3d model to continue</p>
            </div>
        {/if}

        {#if isSavingMask}
            <div style="display: flex; align-items: center;" transition:slide>
                <span class="warning"></span>
                <p>Saving mask for inpainting</p>
                <div class="loader" style="margin-left: 10px; border-color: hsl({$textColor}) transparent;"></div>
            </div>
        {:else if isSavingSceneScreenshot}
            <div style="display: flex; align-items: center;" transition:slide>
                <span class="warning"></span>
                <p>Saving scene screenshot</p>
                <div class="loader" style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"></div>
            </div>
        {:else}
        <div class="controlsMenu">
            <button
                class="optionsButton"
                disabled={isOptionsDisabled}
                onclick={async () => {
                    if(is3DModel){
                        if(imageUrl === ''){
                            imageUrl = await get3dSceneScreenshotUrl()
                        }
                        console.log(imageUrl)
                    }
                    addElement($elements, 'text', imageUrl);
                    $elements = $elements;
                }}
            >
                Discuss
            </button>
            <!-- {#if !is3DModel}
            <button
                class="optionsButton"
                disabled={isOptionsDisabled}
                onclick={() => {
                    toggleInpaintingMode();
                }}
            >
                Inpaint
            </button>
            {/if} -->
            <button
                class="optionsButton"
                disabled={isOptionsDisabled}
                onclick={async () => {
                    console.log(isInpainting)
                    if(isInpainting === true){
                        maskImageUrl = await getMaskUrl();
                        isInpainting = false;
                    }
                    if(is3DModel){
                        imageUrl = await get3dSceneScreenshotUrl()
                        console.log(imageUrl)
                    }
                    addElement($elements, 'imageGeneration', imageUrl, maskImageUrl);
                    $elements = $elements;
                }}>New Image</button
            >
            <button
                class="optionsButton"
                disabled={isOptionsDisabled}
                onclick={async () => {
                    if(is3DModel){
                        if(imageUrl === ''){
                            imageUrl = await get3dSceneScreenshotUrl()
                        }
                        console.log(imageUrl)
                    }
                    addElement($elements, 'video', imageUrl);
                    $elements = $elements;
                }}>New Video</button
            >
        </div>
        {/if}
    </details>
</div>

<style>
    .dropArea {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        margin-top: 10px;
        padding: 0;
        box-sizing: border-box;
        background: none;
        cursor: pointer;
        font-weight: 300;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        margin-bottom: 10px;
    }

    .dropArea img {
        width: 100%;
    }
    canvas {
        position: absolute;
        top: 50;
        z-index: 10;
    }
    .loader {
        width: 10px;
        height: 10px;
        margin: 0;
    }
</style>