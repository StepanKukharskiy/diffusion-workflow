<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	import P5wrapper from './P5wrapper.svelte';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';

	let { uuid, imageUrl = '', options = false } = $props();
	let isTakingScreenshot = $state(false);
	let sketchImageUrl = $state(''),
		maskImageUrl = $state('');
	let circleSize = $state(15);
	let myColor = $state('#FFFFFF');
	let brushType = $state('circle');
	let isMask = $state(false);
	let hiddenCanvas: any;

	function addImageElement(elements: any, url = '') {
		elements.push({
			uuid: generateUUID(),
			type: 'image',
			query: 'sketch image',
			imageUrl: url,
			referenceImageUrl: ''
		});
	}

	let shapes: { type: string; x: number; y: number; size: number; color: string }[] = [];

	function sketch(p: any, appCanvas: any) {
		let img: any;
		let container: any;

		let drawWidth: any,
			drawHeight: any,
			xOffset = 0,
			yOffset = 0;

		p.setup = function () {
			container = document.querySelector('.sketchContainer');
			let containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;

			if (imageUrl != '') {
				img = p.loadImage(imageUrl, () => {
					// Calculate aspect ratio
					const imgAspectRatio = img.width / img.height;
					const containerAspectRatio = containerWidth / containerHeight;

					if (imgAspectRatio > containerAspectRatio) {
						// Image is wider relative to container
						drawWidth = containerWidth;
						drawHeight = containerWidth / imgAspectRatio;
					} else {
						// Image is taller relative to container
						drawHeight = containerHeight;
						drawWidth = containerHeight * imgAspectRatio;
					}

					// Resize canvas to match the image's aspect ratio
					const canvas = p.createCanvas(containerWidth, containerHeight);
					canvas.id(`p5Canvas-${uuid}`);
					p.resizeCanvas(drawWidth, drawHeight);
					p.background('black');

					// Create hidden canvas with original image size
					hiddenCanvas = p.createGraphics(img.width, img.height);
					hiddenCanvas.pixelDensity(1);
					hiddenCanvas.image(img, 0, 0, img.width, img.height);
				});
			} else {
				// Default canvas size if no image is loaded
				const canvas = p.createCanvas(containerWidth, containerHeight);
				canvas.id(`p5Canvas-${uuid}`);
				p.background('black');
			}
		};

		p.draw = function () {
			if (isMask === true) {
				// Draw shapes on hidden canvas
				if (hiddenCanvas) {
					hiddenCanvas.clear();
					hiddenCanvas.image(img, 0, 0, img.width, img.height);
					// if (isMask === true) {
					hiddenCanvas.background(0);
					// } else if (img) {
					// 	hiddenCanvas.clear();
					// 	hiddenCanvas.image(img, 0, 0, img.width, img.height);
					// }
					const scaleX = img.width / drawWidth;
					const scaleY = img.height / drawHeight;
					for (let shape of shapes) {
						hiddenCanvas.fill(shape.color);
						hiddenCanvas.noStroke();
						switch (shape.type) {
							case 'circle':
								hiddenCanvas.circle(shape.x * scaleX, shape.y * scaleY, shape.size * scaleX);
								break;
							case 'square':
								hiddenCanvas.square(
									(shape.x - shape.size / 2) * scaleX,
									(shape.y - shape.size / 2) * scaleY,
									shape.size * scaleX
								);
								break;
							case 'triangle':
								hiddenCanvas.triangle(
									shape.x * scaleX,
									(shape.y - shape.size / 2) * scaleY,
									(shape.x - shape.size / 2) * scaleX,
									(shape.y + shape.size / 2) * scaleY,
									(shape.x + shape.size / 2) * scaleX,
									(shape.y + shape.size / 2) * scaleY
								);
								break;
						}
					}
				}
			}

			if (isMask === true) {
				p.background(0);
			} else if (img) {
				p.image(img, xOffset, yOffset, drawWidth, drawHeight);
			}
			// Draw shapes from the array
			for (let shape of shapes) {
				p.fill(shape.color); // Use the color from the shape data
				p.noStroke();
				switch (shape.type) {
					case 'circle':
						p.circle(shape.x, shape.y, shape.size); // Use size from shape data
						break;
					case 'square':
						p.square(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size); // Use size from shape data
						break;
					case 'triangle':
						p.triangle(
							shape.x,
							shape.y - shape.size / 2,
							shape.x - shape.size / 2,
							shape.y + shape.size / 2,
							shape.x + shape.size / 2,
							shape.y + shape.size / 2
						); // Use size from shape data
						break;
				}
			}

			// Update the array when mouse is pressed
			if (p.mouseIsPressed) {
				shapes.push({
					type: brushType,
					x: p.mouseX,
					y: p.mouseY,
					size: circleSize, // Store the current size
					color: myColor // Store the current color
				});
			}
		};

		p.windowResized = function () {
			container = document.querySelector('.sketchContainer');
			let containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;

			if (img) {
				const imgAspectRatio = img.width / img.height;
				const containerAspectRatio = containerWidth / containerHeight;

				if (imgAspectRatio > containerAspectRatio) {
					drawWidth = containerWidth;
					drawHeight = containerWidth / imgAspectRatio;
				} else {
					drawHeight = containerHeight;
					drawWidth = containerHeight * imgAspectRatio;
				}

				p.resizeCanvas(drawWidth, drawHeight);
				// p.resizeCanvas(img.width, img.height)
			} else {
				p.resizeCanvas(containerWidth, containerHeight);
			}
			p.setup();
		};
	}

	async function getCanvas() {
		isTakingScreenshot = true;
		const canvas = document.getElementById(`p5Canvas-${uuid}`); // Select the canvas element
		console.log(canvas);

		if (isMask) {
			if (hiddenCanvas) {
				const dataURL = hiddenCanvas.canvas.toDataURL('image/jpeg'); // Use hidden canvas for screenshot
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
		} else {
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
				console.error(`No canvas found`);
			}
		}
	}
</script>

<div class="sketchContainer">
	<P5wrapper {sketch} />
	{#if options}
		<div style="display: flex; align-items: center; margin-top: 10px;">
			<!-- Circle size buttons -->
			<button
				onclick={() => {
					circleSize = 15;
				}}
				class={circleSize === 15 ? 'primaryButton' : 'secondaryButton'}
				style="width: 15px; height: 15px; border-radius: 50%; margin-right: 10px;"
				aria-label="circle small size"
			></button>
			<button
				onclick={() => {
					circleSize = 25;
				}}
				class={circleSize === 25 ? 'primaryButton' : 'secondaryButton'}
				style="width: 25px; height: 25px; border-radius: 50%; margin-right: 10px;"
				aria-label="circle small size"
			></button>
			<button
				onclick={() => {
					circleSize = 35;
				}}
				class={circleSize === 35 ? 'primaryButton' : 'secondaryButton'}
				style="width: 35px; height: 35px; border-radius: 50%; margin-right: 10px;"
				aria-label="circle small size"
			></button>
			<input
				type="color"
				bind:value={myColor}
				class="secondaryButton"
				style="height: 35px; cursor: pointer;"
			/>
			<div style="margin-left: 10px;">
				<!-- <label for="brushShape">Brush Shape:</label> -->
				<select id="brushShape" bind:value={brushType} class="secondaryButton" style="padding: 0;">
					<option value="circle">&nbsp;●</option>
					<option value="square">&nbsp;■</option>
					<option value="triangle">&nbsp;▲</option>
				</select>
			</div>
		</div>
		{#if !isTakingScreenshot}
			<div style="display: flex; flex-wrap: wrap;">
				<button
					class="tertiaryButton"
					onclick={async () => {
						sketchImageUrl = await getCanvas();
						addImageElement($elements, sketchImageUrl);
					}}>Save sketch as an image</button
				>

				{#if imageUrl != ''}
					<button
						class="tertiaryButton"
						onclick={async () => {
							isMask = !isMask;
							// maskImageUrl = await getCanvas();
							// isMask = false;
							// addImageElement($elements, maskImageUrl);
						}}>Toggle image view</button
					>
				{/if}
				<button
					class="tertiaryButton"
					onclick={async () => {
						shapes = [];
					}}>Clear sketch</button
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
			<div
				style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
			>
				<div class="loader"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.sketchContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	#brushShape {
		height: 35px;
	}
</style>
