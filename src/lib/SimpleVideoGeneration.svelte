<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { generateUUID, generateVideo } from './utils';

	const { uuid = '' } = $props();
	let imageFile: any;
	let fileInput: any;
	let imageUrl = $state('');
	let loadingImage = $state(false);
	let canvas: any = $state();
	let dropArea: any = $state();
	let isInpainting = $state(false);
	let isSavingMask = $state(false);
    let generatingVideo = $state(false)

	let isOptionsDisabled = $state(true);
	let noFileYet = $state(true);

	async function handleDrop(event: any) {
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				imageFile = file;
				await uploadFile(imageFile);
				isOptionsDisabled = false;
				// is3DModel = false; // Removed
			}
			// Removed 3D model handling
			noFileYet = false;
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
			const response = await fetch(`${$page.url.origin}/api/save-image`, {
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
            generatingVideo = true
			const generatedVideoUrl = await generateVideo({
				refImageUrl: imageUrl,
				model: '25_frames_with_svd_xt',
				projectId: $page.params.projectId
			});
			addElement($elements, 'video', '', imageUrl, generatedVideoUrl);
            generatingVideo = false
			noFileYet = false;
			isOptionsDisabled = false;
			$elements = $elements;
		}
	}

	function addElement(
		elements: any,
		type = 'text',
		query = '',
		generatedImageUrl = '',
		generatedVideoUrl = ''
	) {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			refImageUrl: generatedImageUrl,
			videoUrl: generatedVideoUrl
		});
		console.log(elements);
	}
</script>

<button
	class="dropArea"
	disabled={loadingImage ? true : false}
	bind:this={dropArea}
	style="border: 1px solid hsla({$textColor}, 20%); color: hsl({$textColor}); min-height: 50px;"
	aria-label="Image upload area"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	onclick={() => {
		fileInput.click();
	}}
>
	<!-- {#if loadingImage}
                <div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
            {:else if imageUrl === ''}
                Drag and drop an image here or click to upload
            {:else}
                <img src={imageUrl} alt="uploaded file" />
            {/if} -->
	Drag and drop an image here or click to upload
</button>
<input
	type="file"
	accept="image/*"
	bind:this={fileInput}
	onchange={handleFileInputChange}
	style="display: none;"
/>

{#if noFileYet && !loadingImage && !generatingVideo}
	<div style="display: flex; align-items: center;" transition:slide>
		<span class="warning"></span>
		<p>Please, provide an image to continue</p>
	</div>
{:else if loadingImage}
	<div style="display: flex; align-items: center;" transition:slide>
		<span class="warning"></span>
		<p style="margin-right: 10px;">Uploading file</p>
		<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
	</div>
    {:else if generatingVideo}
	<div style="display: flex; align-items: center;" transition:slide>
		<span class="warning"></span>
		<p style="margin-right: 10px;">Generating video</p>
		<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
	</div>
{/if}

<style>
	.dropArea {
		width: 100%;
		border-radius: 10px;
		margin-top: 0px;
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

	.dropArea:disabled {
		opacity: 0.5;
		cursor: default;
	}

	/* .dropArea img {
        width: 100%;
    }
    canvas {
        position: absolute;
        top: 50;
        z-index: 10;
    } */
	.loader {
		width: 10px;
		height: 10px;
		margin: 0;
	}
</style>
