<script lang="ts">
	import { width, height, textColor, bgColor, elements } from './store';
	import FilesPanel from './FilesPanel.svelte';
	import ProjectPanel from './ProjectPanel.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { generateUUID } from './utils';
	import { slide } from 'svelte/transition';
	import bg_image from '$lib/images/bg.webp';

	let { files, uuid = '' } = $props();

	console.log(files)

	let container: any = $state(),
		fullScreenMode = $state(false),
		isSettingsVisible = $state(false),
		resizeHandle = $state(),
		resizeState = $state(false),
		filesPanelWidth = $state(200),
		resizeCoverDiv: any = $state();

	let filesPanelButton: any = $state();
	let filesPanelDisplay = $state('block');
	let isTakingScreenshot = $state(false);
	let controlsMenu: any = $state();
	let controlsMenuHeight = $state(100);

	onMount(() => {
		controlsMenuHeight = controlsMenu.offsetHeight;
	});

	function resize(event: any) {
		resizeCoverDiv.style.display = 'block';
		// console.log(event.offsetX);
		// filesPanelWidth = event.clientX;
		const containerRect = container.getBoundingClientRect();
		filesPanelWidth = event.clientX - containerRect.left - 10;
		if (filesPanelWidth < 200) {
			filesPanelWidth = 200;
			resizeState = false;
		}
		controlsMenuHeight = controlsMenu.offsetHeight;
	}

	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}

	function toggleFullScreen() {
		fullScreenMode = !fullScreenMode;
		console.log($width);
		console.log($height);
		if (fullScreenMode) {
			container.style.position = 'fixed';
			container.style.top = 0;
			container.style.left = 0;
			container.style.zIndex = 99;
			container.style.width = `${$width}px`;
			container.style.maxWidth = '8000px';
			container.style.height = `${$height}px`;
		} else {
			container.style.position = 'relative';
			container.style.width = `100%`;
			container.style.maxWidth = '800px';
			container.style.height = `fit-content`;
		}
	}

	function togglePanelState() {
		console.log(filesPanelDisplay);
		filesPanelDisplay === 'block' ? (filesPanelDisplay = 'none') : (filesPanelDisplay = 'block');
	}
	function addElement(elements: any = [], type = 'text', imageUrl = '', codeProjectUuid = '') {
		console.log(elements);
		if (type === 'imageGeneration') {
			elements.push({
				type: type,
				systemPrompt: '',
				query: '',
				imageUrl: imageUrl
			});
		} else if (type === 'text') {
			elements.push({
				type: type,
				systemPrompt: '',
				query: '',
				codeProjectUuid: codeProjectUuid
			});
		}

		console.log(elements);
	}

	function duplicate(elements: any) {
		console.log(elements);
		const currentFiles = getCurrentCodeProjectFiles();
		const newFiles = currentFiles.map((file) => ({ ...file })); // Create a deep copy of the files

		elements.push({
			uuid: generateUUID(),
			type: 'code',
			files: newFiles,
			run: true
		});

		console.log(elements);
	}
	function getCurrentCodeProjectFiles() {
		for (let element of $elements) {
			if (element.uuid === uuid) {
				return element.files;
			}
		}
	}

	let isTemplatesPanelVisible = $state(false);
	let isLoadingTemplate = $state(false);
	let templatesList = [
			'static',
			'p5.js',
			'three.js',
			'brain.js',
			'CAcraft',
			'GLB',
			'FF2D',
			'FF3D',
			'flock2D'
		],
		isThereCanvasInIframe: any = $state(false);

	function toggleTemplates() {
		isTemplatesPanelVisible = !isTemplatesPanelVisible;
	}

	async function getTemplate(name = '') {
		const message = await fetch(`/api/code-templates`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: name
			})
		});
		const messageObject = await message.json();
		console.log(messageObject);

		return messageObject;
	}

	async function setTemplate(name = '') {
		isLoadingTemplate = true;
		isTemplatesPanelVisible = false;
		const template = await getTemplate(name)
		for (let element of $elements) {
			if (element.uuid === uuid) {
				element.files = template.files;
				isThereCanvasInIframe = template.files.some(
					(file) => typeof file.fileData === 'string' && file.fileData.includes('canvas') || file.fileData.includes('p5.js') || file.fileData.includes('THREE')
				);
			}
		}
		$elements = $elements;
		// isThereCanvasInIframe = getCanvasInIframe(`iframe-${uuid}`);
		isLoadingTemplate = false;
	}

	function getCanvasInIframe(iframeId = '') {
		const iframe = document.getElementById(iframeId); // Get the iframe by ID
		if (iframe) {
			const iframeWindow = iframe.contentWindow; // Get the iframe's window
			const iframeDocument = iframeWindow.document;
			if (iframeDocument.querySelector('canvas') != undefined) {
				return true;
			}
		}
	}

	async function getCanvasScreenshotUrl(iframeId = '') {
		isTakingScreenshot = true;
		const iframe = document.getElementById(iframeId); // Get the iframe by ID
		if (iframe) {
			const iframeWindow = iframe.contentWindow; // Get the iframe's window
			const iframeDocument = iframeWindow.document;
			// Check if THREE is defined in the iframe
			if (iframeWindow.__THREE__) {
				iframeWindow.renderThreeJsScene();
			}
			const canvas = iframeDocument.querySelector('canvas'); // Select the canvas element
			if (canvas) {
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
				console.error(`No canvas found in the iframe with ID: ${iframeId}`);
			}
		} else {
			isTakingScreenshot = false;
			console.error(`No iframe found with ID: ${iframeId}`);
		}
	}
</script>

<svelte:window
	onpointermove={(e) => {
		if (resizeState) {
			resize(e);
		}
		console.log(controlsMenu.offsetHeight);
	}}
	onpointerup={() => {
		resizeState = false;
		// resizeCoverDiv.style.display = 'none';
	}}
	onresize={() => {
		controlsMenuHeight = controlsMenu.offsetHeight;
	}}
/>

<div class="elementContainer" bind:this={container}>
	<details open style="height: 100%;">
		<summary>
			<div class="colorLine" style="background: #F7D2C4"></div>
			<h3 style="color: hsl({$textColor})">Code</h3>
			<!-- <p style='font-size: 0.5rem;'>{uuid}</p> -->
		</summary>
		{#if isTemplatesPanelVisible}
			<div
				class="templatesContainer"
				style="height: {fullScreenMode ? 'calc(100% - 90px)' : '400px'}; 
					border: 1px solid hsla({$textColor}, 20%); 
					background: hsl({$bgColor});"
			>
				{#each templatesList as template}
					<button
						style="background-image: url({bg_image});  background-repeat: no-repeat; background-position: {Math.floor(
							Math.random() * 100
						)}% {Math.floor(Math.random() * 100)}%"
						class="templatesButton"
						onclick={() => {
							setTemplate(template);
						}}
					>
						{template}
					</button>
				{/each}
			</div>
		{/if}
		<div
			class="projectContainer"
			style="margin: 10px 0; height: {fullScreenMode ? 'calc(100% - 90px)' : '400px'}"
		>
			{#if filesPanelDisplay === 'block'}
				<div
					id="filesPanelContainer"
					style="width: {$width > 700
						? `${filesPanelWidth}px`
						: 'calc(100% - 15px)'}; height: {$width > 700
						? ''
						: `calc(100% - ${controlsMenuHeight}px - 70px)`}; 
						padding-right: 5px; box-sizing: border-box; position: {$width > 700
						? 'relative'
						: 'absolute'}; z-index: 2;"
				>
					<button
						bind:this={filesPanelButton}
						class="panelButton"
						style="border: 1px solid hsla({$textColor}, 20%); background: hsl({$bgColor});"
						onclick={togglePanelState}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
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
						>
					</button>

					<FilesPanel {uuid} {files} panelWidth={filesPanelWidth} />
				</div>
			{:else}
				<div style="position: absolute; height: 100%; z-index:2;">
					<button
						bind:this={filesPanelButton}
						class="panelButton"
						style="border: 1px solid hsla({$textColor}, 20%); background: hsl({$bgColor}); left: -10px;"
						onclick={togglePanelState}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
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
						>
					</button>
				</div>
			{/if}
			{#if $width > 700 && filesPanelDisplay === 'block'}
				<div
					class="resizeHandle"
					style="background: hsl({$textColor + ', 5%'});"
					bind:this={resizeHandle}
					onpointerdown={() => {
						resizeState = true;
					}}
				></div>
			{/if}

			<div
				class="projectDataContainer"
				style="flex: 1; padding-left: 5px; box-sizing: border-box; margin-left: 0px; background: none; position: relative;"
			>
				{#if resizeState}
					<div
						bind:this={resizeCoverDiv}
						style="position: absolute; z-index: 2; top: 5; left: 5; background: #00000005; border-radius: 15px; width: calc(100% - 10px); height: calc(100% - 0px);"
					></div>
				{/if}
				<ProjectPanel {uuid} />
			</div>
		</div>
		{#if isLoadingTemplate}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p style="margin-right: 10px;">Loading template</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{:else if isTakingScreenshot}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p style="margin-right: 10px;">Taking screenshot</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{:else}
			<div class="controlsMenu" bind:this={controlsMenu}>
				<button class="optionsButton" onclick={toggleFullScreen}> Full Screen </button>
				<button class="optionsButton" onclick={toggleTemplates}> Templates </button>
				<button
					class="optionsButton"
					onclick={() => {
						duplicate($elements);
					}}
				>
					Duplicate
				</button>

				<button
					class="optionsButton"
					onclick={async () => {
						addElement($elements, 'text', '', uuid);
						$elements = $elements;
					}}
				>
					Discuss
				</button>
				<button
					class="optionsButton"
					disabled={!isThereCanvasInIframe}
					onclick={async () => {
						const screenshotUrl = await getCanvasScreenshotUrl(`iframe-${uuid}`);
						addElement($elements, 'imageGeneration', screenshotUrl);
						$elements = $elements;
					}}
				>
					New Image
				</button>
			</div>
		{/if}
	</details>
</div>

<style>
	.templatesContainer {
		position: absolute;
		z-index: 10;
		width: calc(100% - 20px);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 10px;
		align-items: center;
		justify-items: center;
		overflow-y: auto;
		margin-top: 10px;
		padding: 10px;
		box-sizing: border-box;
		border-radius: 10px;
	}
	.templatesButton {
		width: 100px;
		height: 100px;
		position: relative;
		align-self: center;
		max-width: 300px;

		background: #1a1a1a20;
		color: #1a1a1a;
		border: none;
		border-radius: 10px;
		padding: 10px;
		margin-right: 10px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 300;
		box-sizing: border-box;
	}
	.templatesButton:hover {
		background-color: #1a1a1a30;
	}

	.projectContainer {
		display: flex;
	}
	.resizeHandle {
		width: 10px;
		height: auto;
		background: #4233fb;
		border-radius: 5px;
		touch-action: none;
		pointer-events: auto;
		text-align: initial;
		cursor: ew-resize;
	}
	.panelButton {
		position: absolute;
		top: 15px;
		right: -15px;

		display: flex;
		align-items: center;
		justify-content: center;
		/* justify-content: space-between; */

		width: 20px;
		height: 30px;
		border-radius: 0 10px 10px 0;
		border: none;
		background: #1a1a1a50;
		/* background: radial-gradient(#ca94ff, #4233fb); */
		color: white;
		box-sizing: border-box;
		padding: 0;

		cursor: pointer;
	}

	/* @media (max-width: 400px) {
		.projectContainer{
			display: block;
		}
	} */
</style>
