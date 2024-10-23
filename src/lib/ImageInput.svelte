<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import { page } from '$app/stores';

	let imageFile: any;
	let fileInput: any;
	let imageUrl = $state('');
	let loadingImage = $state(false);

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

	function addElement(elements: any = [], type = 'text', imageUrl = '') {
		console.log(elements);
		elements.push({
			type: type,
			systemPrompt: '',
			query: '',
			imageUrl: imageUrl
		});

		console.log(elements);
	}
</script>

<div class="elementContainer">
	<button
		class="dropArea"
		style="border: 1px solid hsla({$textColor}, 20%); color: hsl({$textColor});"
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

	<div class="controlsMenu">
		<button
			class="optionsButton"
			onclick={() => {
				addElement($elements, 'text', imageUrl);
                $elements = $elements
			}}>Chat</button
		>
	</div>
</div>

<style>
	.dropArea {
		width: 100%;
		height: 100%;
		min-height: 300px;
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
	}
	.optionsButton {
		align-self: center;
		max-width: 300px;
		/* width: 120px; */
		height: 40px;
		background: #1a1a1a20;
		color: #1a1a1a;
		border: none;
		border-radius: 10px;
		padding: 10px;
		margin: 5px 0;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.optionsButton:hover {
		background: #1a1a1a30;
	}
	button {
		padding: 0;
	}
	.dropArea img {
		width: 100%;
	}
	.loader {
		width: 10px;
		height: 10px;
		margin: 0;
	}
</style>
