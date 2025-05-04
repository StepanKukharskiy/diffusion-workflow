<script lang="ts">
	import P5wrapper from './P5wrapper.svelte';
	import { generateUUID } from './utils';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { elements } from './store';
	import { deleteBlock } from './utils';

	// --- NEW: DraggableImage class
	class DraggableImage {
		img;
		x;
		y;
		w;
		h;
		handleSize = 12;
		isDragging = false;
		isResizing = false;
		offsetX = 0;
		offsetY = 0;

		constructor(img, x, y, w, h) {
			this.img = img;
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}

		show(p) {
			p.image(this.img, this.x, this.y, this.w, this.h);
			if (this.isDragging || this.isResizing) {
				p.noStroke();
				p.fill(0, 150, 255);
				p.rect(
					this.x + this.w - this.handleSize / 2,
					this.y + this.h - this.handleSize / 2,
					this.handleSize,
					this.handleSize
				);
			}
		}

		over(mx, my) {
			return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
		}

		overHandle(mx, my) {
			const hx = this.x + this.w - this.handleSize / 2;
			const hy = this.y + this.h - this.handleSize / 2;
			return mx > hx && mx < hx + this.handleSize && my > hy && my < hy + this.handleSize;
		}

		startDragging(mx, my) {
			isInteracting = false;
			this.isDragging = true;
			this.offsetX = mx - this.x;
			this.offsetY = my - this.y;
		}

		startResizing() {
			isInteracting = false;
			this.isResizing = true;
		}

		drag(mx, my) {
			this.x = mx - this.offsetX;
			this.y = my - this.offsetY;
		}

		resize(mx, my) {
			this.w = Math.max(20, mx - this.x);
			this.h = Math.max(20, my - this.y);
		}

		stopInteraction() {
			// isInteracting = false;
			this.isDragging = this.isResizing = false;
		}
	}

	let { uuid, imageUrl = '', options = false } = $props();

	let shapes = $state([]);

	let isTakingScreenshot = $state(false);
	let sketchImageUrl = $state(''),
		maskImageUrl = $state('');
	let circleSize = $state(15);
	let myColor = $state('#FFFFFF');
	let brushType = $state('circle');
	let isMask = $state(false);
	let hiddenCanvas: any;
	let isInteracting = $state(true);

	// This is where we inject our sketch
	function sketch(p: any) {
		// --- new: draggable‐PNG state
		let images: DraggableImage[] = [];
		let fileInput: any;
		let uploadButton: any;

		// compute sizing for your background image
		let img: any,
			drawWidth,
			drawHeight,
			xOffset = 0,
			yOffset = 0;

		p.setup = () => {
			const container = document.querySelector('.sketchContainer');
			const cw = container.clientWidth;
			const ch = container.clientHeight;
			const canvasEl = p.createCanvas(cw, ch);
			canvasEl.id(`p5Canvas-${uuid}`);

			// if you already had imageUrl, load it
			if (imageUrl) {
				img = p.loadImage(imageUrl, () => {
					// compute drawWidth/drawHeight exactly as you had before…
					const arImg = img.width / img.height;
					const arCont = cw / ch;
					if (arImg > arCont) {
						drawWidth = cw;
						drawHeight = cw / arImg;
					} else {
						drawHeight = ch;
						drawWidth = ch * arImg;
					}
					p.resizeCanvas(drawWidth, drawHeight);
					// hiddenCanvas for mask logic…
					hiddenCanvas = p.createGraphics(img.width, img.height);
					hiddenCanvas.pixelDensity(1);
					hiddenCanvas.image(img, 0, 0, img.width, img.height);
				});
			}

			// --- NEW: create a file‐input in the p5 canvas
			fileInput = p.createFileInput(handleFile);
			fileInput.attribute('accept', 'image/png');
			fileInput.hide(); // hide the default input[1]

			// 2. Create a visible button
			uploadButton = p.createButton('Add Image');
			uploadButton.attribute('class', 'secondaryButton');
			uploadButton.position(10, p.height + 10);
			uploadButton.mousePressed(() => {
				// trigger the hidden file-input
				fileInput.elt.click();
			});
		};

		// p.draw = () => {
		// 	// 1. draw background or mask as you already do
		// 	if (isMask && hiddenCanvas) {
		// 		// Draw shapes on hidden canvas
		// 		if (hiddenCanvas) {
		// 			hiddenCanvas.clear();
		// 			hiddenCanvas.image(img, 0, 0, img.width, img.height);
		// 			// if (isMask === true) {
		// 			hiddenCanvas.background(0);
		// 			// } else if (img) {
		// 			// 	hiddenCanvas.clear();
		// 			// 	hiddenCanvas.image(img, 0, 0, img.width, img.height);
		// 			// }
		// 			const scaleX = img.width / drawWidth;
		// 			const scaleY = img.height / drawHeight;
		// 			for (let shape of shapes) {
		// 				hiddenCanvas.fill(shape.color);
		// 				hiddenCanvas.noStroke();
		// 				switch (shape.type) {
		// 					case 'circle':
		// 						hiddenCanvas.circle(shape.x * scaleX, shape.y * scaleY, shape.size * scaleX);
		// 						break;
		// 					case 'square':
		// 						hiddenCanvas.square(
		// 							(shape.x - shape.size / 2) * scaleX,
		// 							(shape.y - shape.size / 2) * scaleY,
		// 							shape.size * scaleX
		// 						);
		// 						break;
		// 					case 'triangle':
		// 						hiddenCanvas.triangle(
		// 							shape.x * scaleX,
		// 							(shape.y - shape.size / 2) * scaleY,
		// 							(shape.x - shape.size / 2) * scaleX,
		// 							(shape.y + shape.size / 2) * scaleY,
		// 							(shape.x + shape.size / 2) * scaleX,
		// 							(shape.y + shape.size / 2) * scaleY
		// 						);
		// 						break;
		// 				}
		// 			}
		// 		}
		// 	} else if (img) {
		// 		p.background(0);
		// 		p.image(img, xOffset, yOffset, drawWidth, drawHeight);
		// 	} else {
		// 		p.background(0);
		// 	}

		// 	// 2. draw your freehand shapes
		// 	for (let s of shapes) {
		// 		p.fill(s.color);
		// 		p.noStroke();
		// 		switch (s.type) {
		// 			case 'circle':
		// 				p.circle(s.x, s.y, s.size);
		// 				break;
		// 			case 'square':
		// 				p.square(s.x - s.size / 2, s.y - s.size / 2, s.size);
		// 				break;
		// 			case 'triangle':
		// 				p.triangle(
		// 					s.x,
		// 					s.y - s.size / 2,
		// 					s.x - s.size / 2,
		// 					s.y + s.size / 2,
		// 					s.x + s.size / 2,
		// 					s.y + s.size / 2
		// 				);
		// 				break;
		// 		}
		// 	}

		// 	// 3. --- NEW: render all draggable PNGs
		// 	for (let di of images) {
		// 		di.show(p);
		// 	}

		// 	// 4. if mouseIsPressed you already push new shapes …
		// 	if (p.mouseIsPressed && isInteracting) {
		// 		// note: p._mouseWasPressed is an internal guard so you only fire once
		// 		shapes.push({
		// 			type: brushType,
		// 			x: p.mouseX,
		// 			y: p.mouseY,
		// 			size: circleSize,
		// 			color: myColor
		// 		});
		// 	}
		// 	p._mouseWasPressed = p.mouseIsPressed;
		// };

		// --- NEW: mouse interaction

		p.draw = () => {
			// 0) Clear the _main_ canvas every frame
			p.background(0);

			// 1) If we're in mask‐mode, composite everything into hiddenCanvas and then blit it
			if (isMask && hiddenCanvas && img) {
				// 1a) Clear & redraw the source image into hiddenCanvas
				hiddenCanvas.clear();
				hiddenCanvas.image(img, 0, 0, img.width, img.height);

				// 1b) Paint a black background (our “mask background”)
				hiddenCanvas.background(0);

				// 1c) Draw every shape into hiddenCanvas, scaled up to image size
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

				// 1d) Now draw the hiddenCanvas back onto the main canvas
				p.image(hiddenCanvas, xOffset, yOffset, drawWidth, drawHeight);
			}
			// 2) Otherwise (normal mode) draw the background image
			else if (img) {
				p.image(img, xOffset, yOffset, drawWidth, drawHeight);
			}

			// 3) Draw your free-hand shapes on top in “live” (optional,
			//    you may skip this if you only ever want them in the mask)
			for (let s of shapes) {
				p.fill(s.color);
				p.noStroke();
				switch (s.type) {
					case 'circle':
						p.circle(s.x, s.y, s.size);
						break;
					case 'square':
						p.square(s.x - s.size / 2, s.y - s.size / 2, s.size);
						break;
					case 'triangle':
						p.triangle(
							s.x,
							s.y - s.size / 2,
							s.x - s.size / 2,
							s.y + s.size / 2,
							s.x + s.size / 2,
							s.y + s.size / 2
						);
						break;
				}
			}

			// 4) Render all draggable PNGs
			for (let di of images) {
				di.show(p);
			}

			// 5) If the mouse is pressed and you’re in drawing‐mode, add a new shape
			if (p.mouseIsPressed && isInteracting) {
				shapes.push({
					type: brushType,
					x: p.mouseX,
					y: p.mouseY,
					size: circleSize,
					color: myColor
				});
			}
			// internal guard so we only fire once per press
			p._mouseWasPressed = p.mouseIsPressed;
		};

		p.mousePressed = () => {
			for (let i = images.length - 1; i >= 0; i--) {
				const imgObj = images[i];
				if (imgObj.overHandle(p.mouseX, p.mouseY)) {
					imgObj.startResizing();
					return;
				}
				if (imgObj.over(p.mouseX, p.mouseY)) {
					imgObj.startDragging(p.mouseX, p.mouseY);
					return;
				}
			}
		};

		p.mouseDragged = () => {
			for (let di of images) {
				if (di.isDragging) di.drag(p.mouseX, p.mouseY);
				else if (di.isResizing) di.resize(p.mouseX, p.mouseY);
			}
		};

		p.mouseReleased = () => {
			for (let di of images) {
				di.stopInteraction();
			}
		};

		// --- NEW: handleFile callback
		function handleFile(file) {
			isInteracting = false;
			if (file.type === 'image') {
				p.loadImage(file.data, (loadedImg: any) => {
					const cw = p.width;
					const ch = p.height;
					const arImg = loadedImg.width / loadedImg.height;
					const arCont = cw / ch;
					const scale = 0.8;
					let targetW, targetH;

					if (arImg > arCont) {
						// image is wider than container – fit by width
						targetW = cw * scale;
						targetH = (cw / arImg) * scale;
					} else {
						// image is taller than container – fit by height
						targetH = ch * scale;
						targetW = ch * arImg * scale;
					}
					// resample the image to fit
					loadedImg.resize(targetW, targetH);

					// center on canvas
					const x = (cw - targetW) / 2;
					const y = (ch - targetH) / 2;

					images.push(new DraggableImage(loadedImg, x, y, targetW, targetH));
				});
			}
		}
	} // end of sketch()

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

	function addImageElement(elements: any, url = '') {
		elements.push({
			uuid: generateUUID(),
			type: 'image',
			query: 'sketch image',
			imageUrl: url,
			referenceImageUrl: ''
		});
	}
</script>

<div class="sketchContainer">
	<!-- the P5 canvas + draggable logic all lives inside this wrapper -->
	<P5wrapper {sketch} />
	{#if options}
		<div style="display: flex; align-items: center; margin-top: 10px; margin-left: 130px;">
			<button
				onclick={() => {
					isInteracting = !isInteracting;
				}}
				class={isInteracting === true ? 'primaryButton' : 'secondaryButton'}
				style="border-radius: 10px; margin-right: 10px;"
				aria-label="paint button">Paint</button
			>
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
							console.log(isMask);
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
		margin-bottom: 2rem;
		position: relative;
	}
	#brushShape {
		height: 35px;
	}
</style>
