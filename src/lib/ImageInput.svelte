<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import paper from 'paper';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	let {uuid = ''} = $props()
	let imageFile: any;
	let fileInput: any;
	let imageUrl = $state('');
	let loadingImage = $state(false);
	let canvas: any = $state();
	let dropArea: any = $state();
	let isInpainting: any = $state(false);
	let isSavingMask = $state(false)
	let maskImageUrl = $state()

	async function handleDrop(event: any) {
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			imageFile = files[0];
			// You can add additional logic to display the image or handle it further
			await uploadFile(imageFile);
		}
	}

	function handleDragOver(event: any) {
		event.preventDefault(); // Prevent default to allow drop
	}

	async function uploadFile(file: any) {
		loadingImage = true;
		const formData = new FormData();
		formData.append('file', file, file.name); // Use the original file name
		// Add any additional data you need
		formData.append('projectId', $page.params.projectId);
		console.log('Uploading file:', file);

		try {
			const response = await fetch('/api/save-image', {
				method: 'POST',
				body: formData
			});

			console.log(response);

			if (!response.ok) {
				loadingImage = false;
				console.error('Upload failed:', response.statusText);
			} else {
				const result = await response.json();
				console.log('Upload successful:', result);
				imageUrl = result.url;
				loadingImage = false;
				return result.url; // Ensure this is the expected response structure
			}
		} catch (error) {
			loadingImage = false;
			console.error('Error during upload:', error);
		}
	}

	// Handle file input change
	function handleFileInputChange(event: any) {
		if (event.target.files.length > 0) {
			imageFile = event.target.files[0];
			uploadFile(imageFile);
		}
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

	function toggleInpaintingMode() {
		isInpainting = !isInpainting;
		setTimeout(() => {
			if (isInpainting && canvas) {
				console.log(dropArea.offsetWidth)
				paper.setup(canvas);
				console.log(canvas)
				canvas.width = dropArea.clientWidth;
				canvas.height = dropArea.clientHeight;
				canvas.style.backgroundColor = 'black';

				let rectangle: paper.Path.Rectangle | null = null;
				let startPoint: paper.Point | null = null;

				canvas.onpointerdown = (event: PointerEvent) => {
					startPoint = new paper.Point(event.offsetX, event.offsetY);
					rectangle = new paper.Path.Rectangle({
						point: startPoint,
						size: [0, 0],
						strokeColor: 'white'
					});
				};

				canvas.onpointermove = (event: PointerEvent) => {
					if (rectangle && startPoint) {
						const endPoint = new paper.Point(event.offsetX, event.offsetY);
						rectangle.remove(); // Remove the previous rectangle
						rectangle = new paper.Path.Rectangle({
							from: startPoint,
							to: endPoint,
							strokeColor: 'white',
							fillColor: 'white'
						});
					}
				};

				canvas.onpointerup = () => {
					rectangle = null;
					startPoint = null;
				};
			}
		}, 10);
	}

	async function getMaskUrl() {
		const canvas = document.getElementById(`${uuid}-canvas`);
		isSavingMask = true;
		const dataURL = canvas.toDataURL('image/jpeg');
		const blob = await fetch(dataURL).then((res) => res.blob());
		const formData = new FormData();
		formData.append('file', blob, 'canvas.jpeg');
		formData.append('projectId', $page.params.projectId);
		console.log($page.params.projectId);
		console.log(formData);
		const response = await fetch('/api/save-image', { method: 'POST', body: formData });
		if (!response.ok) {
			isSavingMask = false;
			console.error('Upload failed:', response.statusText);
		} else {
			const result = await response.json();
			console.log('Upload successful:', result);
			isSavingMask = false;
			return result.url;
		}
	}

</script>

<div class="elementContainer">
	<details open>
		<summary>
			<div class="colorLine" style="background: #D6C4FF;"></div>
			<h3 style="color: hsl({$textColor})">Image Input</h3>
		</summary>
		{#if isInpainting}
			<canvas bind:this={canvas} id='{uuid}-canvas' style='margin-top: 10px; border-radius: 10px; width: {dropArea.clientWidth}px; height: {dropArea.clientHeight}px;'
			></canvas>
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
		<!-- You can add an input for file selection if needed -->
		<input
			type="file"
			accept="image/*"
			bind:this={fileInput}
			onchange={handleFileInputChange}
			style="display: none;"
		/>

		{#if imageUrl === ''}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p>Please, provide an image to continue</p>
				<!-- <div class="loader" style="border-color: hsl({$textColor}) transparent;"></div> -->
			</div>
		{/if}

		{#if isSavingMask}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p>Saving mask for inpainting</p>
			</div>
		{:else}
		<div class="controlsMenu">
			<button
				class="optionsButton"
				disabled={imageUrl === '' ? true : false}
				onclick={() => {
					addElement($elements, 'text', imageUrl);
					$elements = $elements;
				}}
			>
				Discuss
			</button>
			<button
				class="optionsButton"
				disabled={imageUrl === '' ? true : false}
				onclick={() => {
					toggleInpaintingMode();
				}}
			>
				Inpaint
			</button>
			<button
				class="optionsButton"
				disabled={imageUrl === '' ? true : false}
				onclick={async () => {
					if(isInpainting){
						maskImageUrl = await getMaskUrl()
						isInpainting = false
					}
					addElement($elements, 'imageGeneration', imageUrl, maskImageUrl);
					$elements = $elements;
				}}>New Image</button
			>
			<button
				class="optionsButton"
				disabled={imageUrl === '' ? true : false}
				onclick={() => {
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
		 /* min-height: 300px; */
		/* aspect-ratio: 16 / 9; */
		resize: none;
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
		position:absolute;
		top: 50;
		z-index: 10;
		opacity: 0.5;
	}
</style>
