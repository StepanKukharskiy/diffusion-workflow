<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { generateUUID } from './utils';
	import { textColor, elements } from './store';
	import { page } from '$app/stores';
	import paper from 'paper';
	import { slide } from 'svelte/transition';

	let canvas: HTMLCanvasElement;
	let selectedShape = $state('rectangle'); // Default shape
	let tool: paper.Tool;
	let path: paper.Path | null = null;
	let color = $state('#ffffff'); // Default color

	// Define a type for shapes
	type Shape =
		| { type: 'rectangle'; bounds: paper.Rectangle; color: string }
		| { type: 'circle'; center: paper.Point; radius: number; color: string }
		| { type: 'path'; segments: paper.Segment[]; color: string };

	let shapes: Shape[] = []; // Array to store shapes
	let isMakingScreenshot = $state(false),
		isEmptySketch = $state(true),
		sketchUrl = $state(''),
		isSettingsVisible = $state(false),
		uuid = generateUUID();

	function resizeCanvas(width: number, height: number) {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
			paper.view.viewSize = new paper.Size(canvas.width, canvas.height);

			// Redraw the background
			new paper.Path.Rectangle({
				point: [0, 0],
				size: [canvas.width, canvas.height],
				fillColor: 'black'
			});

			// Redraw all shapes from the array
			shapes.forEach((shape) => {
				if (shape.type === 'rectangle') {
					new paper.Path.Rectangle({
						point: shape.bounds.topLeft,
						size: shape.bounds.size,
						strokeColor: shape.color,
						fillColor: shape.color
					});
				} else if (shape.type === 'circle') {
					new paper.Path.Circle({
						center: shape.center,
						radius: shape.radius,
						strokeColor: shape.color,
						fillColor: shape.color
					});
				} else if (shape.type === 'path') {
					const newPath = new paper.Path({
						strokeColor: shape.color
					});
					shape.segments.forEach((segment) => {
						newPath.add(segment.point);
					});
				}
			});
		}
	}

	function setShape(shape: string) {
		selectedShape = shape;
		console.log('Selected shape:', selectedShape);
	}

	function setAspectRatio(ratio: '1:1' | '16:9') {
		if (ratio === '1:1') {
			resizeCanvas(canvas.parentElement.clientWidth, canvas.parentElement.clientWidth); // Square
		} else if (ratio === '16:9') {
			resizeCanvas(canvas.parentElement.clientWidth, (canvas.parentElement.clientWidth * 9) / 16); // 16:9
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			paper.setup(canvas);
			setAspectRatio('16:9'); // Default to 16:9

			// Set the background to black
			const background = new paper.Path.Rectangle({
				point: [0, 0],
				size: [canvas.width, canvas.height],
				fillColor: 'black'
			});

			tool = new paper.Tool();

			tool.onMouseDown = (event) => {
				console.log('Mouse down on shape:', selectedShape);
				if (selectedShape === 'rectangle') {
					path = new paper.Path.Rectangle({
						point: event.point,
						size: [0, 0],
						strokeColor: color,
						fillColor: color
					});
				} else if (selectedShape === 'circle') {
					path = new paper.Path.Circle({
						center: event.point,
						radius: 0,
						strokeColor: color,
						fillColor: color
					});
				} else if (selectedShape === 'path') {
					path = new paper.Path({
						strokeColor: color
					});
					path.add(event.point);
				}
			};

			tool.onMouseDrag = (event) => {
				if (path) {
					if (selectedShape === 'rectangle') {
						const rect = path as paper.Path.Rectangle;
						rect.remove();
						path = new paper.Path.Rectangle({
							from: rect.bounds.topLeft,
							to: event.point,
							strokeColor: color,
							fillColor: color
						});
					} else if (selectedShape === 'circle') {
						const circle = path as paper.Path.Circle;
						circle.remove();
						path = new paper.Path.Circle({
							center: circle.bounds.center,
							radius: Math.floor(event.point.subtract(circle.bounds.center).length),
							strokeColor: color,
							fillColor: color
						});
					} else if (selectedShape === 'path') {
						path.add(event.point);
					}
				}
			};

			tool.onMouseUp = () => {
				if (path) {
					// Add the drawn shape to the shapes array
					if (selectedShape === 'rectangle') {
						shapes.push({ type: 'rectangle', bounds: path.bounds, color });
					} else if (selectedShape === 'circle') {
						const circle = path as paper.Path.Circle;
						shapes.push({
							type: 'circle',
							center: circle.bounds.center,
							radius: circle.bounds.width / 2,
							color
						});
					} else if (selectedShape === 'path') {
						shapes.push({ type: 'path', segments: path.segments, color });
					}
					path = null; // Reset path after drawing
				}

				if (shapes.length > 0) {
					isEmptySketch = false;
				}
			};

			// Resize canvas on window resize
			window.addEventListener('resize', () => setAspectRatio('16:9'));
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', () => setAspectRatio('16:9'));
		}
	});

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
		const response = await fetch(`${$page.url.origin}/api/save-image`, { method: 'POST', body: formData });
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
		elements.push({ type: type, query: '', imageUrl: imageUrl });
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
			<h3 style="color: hsl({$textColor})">Sketch</h3>
		</summary>
		<canvas bind:this={canvas} height="600" id='{uuid}-canvas'></canvas>
		{#if sketchUrl === '' && !isMakingScreenshot && isEmptySketch}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p>Sketch something to continue</p>
			</div>
		{/if}
		{#if isSettingsVisible}
			<div class="controlsMenu" style="margin-bottom: 10px;" transition:slide>
				<input type='color' class="optionsButton" bind:value={color} />
				<button
					class="optionsButton"
					style="border: {selectedShape === 'rectangle' ? '2px' : '0px'} solid hsl({$textColor})"
					onclick={() => setShape('rectangle')}
					aria-label='rectangle'
				>
					<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<rect x="2" y="2" width="20" height="20" fill="black" stroke="black" stroke-width="2" />
					</svg>
				</button>
				<button
					class="optionsButton"
					style="border: {selectedShape === 'circle' ? '2px' : '0px'} solid hsl({$textColor})"
					onclick={() => setShape('circle')}
					aria-label='circle'
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="black" />
					</svg>
				</button>
				<button
					class="optionsButton"
					style="border: {selectedShape === 'path' ? '2px' : '0px'} solid hsl({$textColor})"
					onclick={() => setShape('path')}
					aria-label='path'
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="black"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
					</svg>
				</button>
				<!-- Buttons to set canvas size -->
				<button class="optionsButton" onclick={() => setAspectRatio('1:1')}>1:1</button>
				<button class="optionsButton" onclick={() => setAspectRatio('16:9')}>16:9</button>
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
				}}>Discuss</button>
			<button
				class="optionsButton"
				disabled={isEmptySketch === true ? true : false}
				onclick={async () => {
					sketchUrl = await getScreenshotUrl();
					addElement($elements, 'imageGeneration', sketchUrl);
					$elements = $elements;
				}}>New Image</button>
			<button class="settingsButton" onclick={toggleSettings}>Settings</button>
		</div>
	</details>
</div>

<style>
	canvas {
		display: block;
		margin: 10px auto;
		width: 100%;
		border-radius: 10px;
	}
	input {
		width: 100%;
		height: 40px;
		padding: 5px;
	}
</style>