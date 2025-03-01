<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	import P5wrapper from './P5wrapper.svelte';
	import { page } from '$app/stores';
    import { generateUUID } from './utils';

	let { uuid, imageUrl = '', options = false } = $props();
	let isTakingScreenshot = $state(false);
    let sketchImageUrl = $state('')
    let circleSize = $state(15);
    let myColor = $state('#FFFFFF')
	let brushType = $state('circle')

    function addImageElement(elements: any, url = '') {
			elements.push({
				uuid: generateUUID(),
				type: 'image',
				query: 'sketch image',
				imageUrl: url,
				referenceImageUrl: ''
			});
    }

	function sketch(p: any, appCanvas: any) {
		let img: any;
		let container: any;
        

		p.setup = function () {
			container = document.querySelector('.sketchContainer');
			let containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;

			const canvas = p.createCanvas(containerWidth, containerHeight);
			canvas.id(`p5Canvas-${uuid}`);
			p.background('black');

			if (imageUrl != '') {
				img = p.loadImage(imageUrl, () => {
					// Calculate aspect ratio
					const imgAspectRatio = img.width / img.height;
					const containerAspectRatio = containerWidth / containerHeight;

					let drawWidth, drawHeight;
					if (imgAspectRatio > containerAspectRatio) {
						// Image is wider relative to container
						drawWidth = containerWidth;
						drawHeight = containerWidth / imgAspectRatio;
					} else {
						// Image is taller relative to container
						drawHeight = containerHeight;
						drawWidth = containerHeight * imgAspectRatio;
					}

					// Center the image
					const xOffset = (containerWidth - drawWidth) / 2;
					const yOffset = (containerHeight - drawHeight) / 2;

					p.image(img, xOffset, yOffset, drawWidth, drawHeight);
				});
			}
		};

		p.draw = function () {
			if (p.mouseIsPressed) {
				p.fill(myColor);
				p.noStroke();
				switch (brushType) {
					case 'circle':
						p.circle(p.mouseX, p.mouseY, circleSize);
						break;
					case 'square':
						p.square(p.mouseX - circleSize / 2, p.mouseY - circleSize / 2, circleSize);
						break;
					case 'triangle':
						p.triangle(
							p.mouseX, p.mouseY - circleSize / 2,
							p.mouseX - circleSize / 2, p.mouseY + circleSize / 2,
							p.mouseX + circleSize / 2, p.mouseY + circleSize / 2
						);
						break;
				}
			}
		};

		p.windowResized = function () {
			container = document.querySelector('.sketchContainer');
			console.log(container);
			let containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;
			p.resizeCanvas(container.clientWidth, container.clientHeight);
			p.setup();
		};
	}

	async function getCanvas() {
		const canvas = document.getElementById(`p5Canvas-${uuid}`); // Select the canvas element

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
</script>

<div class="sketchContainer">
	<P5wrapper {sketch} />
	{#if options}
    <div style="display: flex; align-items: center; margin-top: 10px;">
        <!-- Circle size buttons -->
        <button onclick={() => {circleSize = 15}} class={circleSize === 15 ? 'primaryButton' : 'secondaryButton'} style="width: 15px; height: 15px; border-radius: 50%; margin-right: 10px;" aria-label='circle small size'></button>
        <button onclick={() => {circleSize = 25}} class={circleSize === 25 ? 'primaryButton' : 'secondaryButton'} style="width: 25px; height: 25px; border-radius: 50%; margin-right: 10px;" aria-label='circle small size'></button>
        <button onclick={() => {circleSize = 35}} class={circleSize === 35 ? 'primaryButton' : 'secondaryButton'} style="width: 35px; height: 35px; border-radius: 50%; margin-right: 10px;" aria-label='circle small size'></button>
        <input type='color' bind:value={myColor} class='secondaryButton' style='height: 35px; cursor: pointer;'/>
		<div style="margin-left: 10px;">
			<!-- <label for="brushShape">Brush Shape:</label> -->
			<select id="brushShape" bind:value={brushType} class='secondaryButton' style='padding: 0;'>
				<option value="circle">&nbsp;●</option>
				<option value="square">&nbsp;■</option>
				<option value="triangle">&nbsp;▲</option>
			</select>
		</div>
    </div>
		<div style="display: flex; flex-wrap: wrap;">
			<button class="tertiaryButton" onclick={async () => {
                sketchImageUrl = await getCanvas()
                addImageElement($elements, sketchImageUrl)
                }}>Save as image to use as a reference</button>
			<button
				class="tertiaryButton"
				onclick={async () => {
					deleteBlock($elements, uuid);
					$elements = $elements;
				}}>Delete</button
			>
		</div>
	{/if}
</div>

<style>
	.sketchContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	#brushShape{
		height: 35px;
	}
</style>
