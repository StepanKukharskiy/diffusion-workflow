<script lang="ts">
	import { textColor, bgColor, elements } from './store';

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import P5wrapper from './P5wrapper.svelte';

	let isMakingScreenshot = $state(false);

	let generateButton, exportButton, visualiseButton;
	let canvasWidth = 400,
		canvasHeight = 400;
	let isDrawing = $state(false);
	let points: { x: number; y: number; pointColor: string; size: number }[] = $state([]);
	let img: any;
	let isImageLoaded = $state(false);
	let pInstance: any;
	let brushSize = $state(10),
		// backgroundColor = '#21dbe7',
		backgroundColor = 'black',
		buildingColor = '#b77f8a',
		personColor = '#820b33',
		waterColor = '#54cdde',
		grassColor = '#0cf80f',
		treeColor = '#15ac00',
		isDrawingBuilding = $state(false),
		isDrawingPerson = $state(false),
		isDrawingWater = $state(false),
		isDrawingGrass = $state(false),
		isDrawingTree = $state(false),
		sketchUrl = $state(''),
		isSettingsVisible = $state(false),
		isEmptySketch = $state(true);

	let uuid = Math.floor(Math.random() * 100);

	let sketch = (p: any, appCanvas: HTMLElement) => {
		pInstance = p;

		p.setup = () => {
			const parentElement = appCanvas;
			if (parentElement) {
				canvasWidth = parentElement.offsetWidth;
				canvasHeight = parentElement.offsetHeight;
			}
			let cnv = p.createCanvas(canvasWidth, canvasHeight);
			cnv.id(`${uuid}-canvas`);
		};

		p.draw = () => {
			// Clear the canvas and redraw background
			p.background(backgroundColor);

			// Draw the image if it has been loaded
			if (img && isImageLoaded) {
				p.image(img, 0, 0, canvasWidth, canvasHeight);
			}

			// Drawing logic
			if (isDrawing) {
				points.push({
					x: p.mouseX,
					y: p.mouseY,
					pointColor: 'white',
					size: brushSize
				});
			}

			p.fill('grey');
			p.ellipse(p.mouseX, p.mouseY, brushSize);

			for (let point of points) {
				p.fill(point.pointColor);
				p.noStroke();
				p.ellipse(point.x, point.y, point.size);
			}

			if (points.length > 0) {
				isEmptySketch = false;
			}
		};

		// p.resizeCanvas(canvasWidth, canvasHeight);

		p.mousePressed = () => {
			isDrawing = true;
		};

		p.mouseReleased = () => {
			isDrawing = false;
		};

		p.windowResized = () => {
			const parentElement = appCanvas;
			if (parentElement) {
				canvasWidth = parentElement.offsetWidth;
				canvasHeight = parentElement.offsetHeight;
				p.resizeCanvas(canvasWidth, canvasHeight);
			}
		};
	};

	onDestroy(() => {});

	const link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link);

	function save(blob: any, filename = '') {
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	}

	function saveString(text = '', filename = '') {
		save(new Blob([text], { type: 'text/plain' }), filename);
	}

	async function getScreenshotUrl() {
		const canvas = document.getElementById(`${uuid}-canvas`);

		isMakingScreenshot = true;
		const dataURL = canvas.toDataURL('image/jpeg');

		const blob = await fetch(dataURL).then((res) => res.blob());

		const formData = new FormData();
		formData.append('file', blob, 'canvas.jpeg');
		formData.append('projectId', $page.params.projectId);
		console.log($page.params.projectId);
		console.log(formData);

		const response = await fetch('/api/save-image', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			isMakingScreenshot = false;
			console.error('Upload failed:', response.statusText);
		} else {
			const result = await response.json();
			console.log('Upload successful:', result);
			isMakingScreenshot = false;
			return result.url;
		}
	}

	function addElement(elements: any = [], type = 'text', imageUrl = '') {
		console.log(elements);
		elements.push({
			type: type,
			query: '',
			imageUrl: imageUrl
		});

		console.log(elements);
	}

	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}
</script>

<div class="elementContainer">
	<details open>
		<summary>
	<div class="colorLine" style="background: #FFCFF6;"></div>
		<h3 style='color: hsl({$textColor})'>Sketch</h3>
	
	</summary>
	<div class="canvasAndControlsContainer" style='margin-top: 10px'>
		<div class="canvasContainer" style="border: 1px solid hsla({$textColor}, 20%);">
			<P5wrapper {sketch} />
		</div>
		<div class="generationControls">
			{#if sketchUrl === '' && !isMakingScreenshot && isEmptySketch}
				<div style="display: flex; align-items: center;">
					<span class="warning"></span>
					<p>Sketch something to continue</p>
				</div>
			{/if}
			{#if isMakingScreenshot}
				<div style="display: flex; align-items: center;">
					<span class="warning"></span>
					<p style="margin-right: 10px;">Saving sketch</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{/if}
			{#if isSettingsVisible === true}
				<div class="item">
					<label for="background">Brush size</label>
					<input id="brushSize" name="brushSize" bind:value={brushSize} type="number" step="1" />
				</div>
			{/if}
			<div class="controlsMenu">
				<button
					class="optionsButton"
					disabled={isEmptySketch === true ? true : false}
					onclick={async () => {
						sketchUrl = await getScreenshotUrl();
						addElement($elements, 'text', sketchUrl);
						$elements = $elements;
					}}
				>
					Discuss
				</button>
				<button
					class="optionsButton"
					disabled={isEmptySketch === true ? true : false}
					onclick={async () => {
						sketchUrl = await getScreenshotUrl();
						addElement($elements, 'imageGeneration', sketchUrl);
						$elements = $elements;
					}}>New Image</button
				>
				<button class="settingsButton" onclick={toggleSettings}>Settings</button>
			</div>
		</div>
	</div>
	</details>
</div>

<style>
	.canvasAndControlsContainer {
		width: 100%;
		
	}
	.generationControls {
		flex: 0 0 150px;
		display: flex;
		flex-direction: column;
	}
	.canvasContainer {
		width: 100%;
		border-radius: 10px;
		margin-bottom: 10px;
		/* aspect-ratio: 1 / 1; */
	}
	.item {
		width: 100%;
		max-width: 150px;
		display: flex;
		flex-direction: column;
		margin: 5px 0;
	}
	label {
		margin-bottom: 5px;
		font-size: 0.9rem;
	}
	input {
		max-width: 300px;
		border: none;
		background-color: #1a1a1a20;
		border-radius: 10px;
		padding: 5px;
		font-size: 1rem;
		box-sizing: border-box;
	}
</style>
