<script lang="ts">
	import { goto } from '$app/navigation';
	import P5wrapper from '$lib/P5wrapper.svelte';
	import Footer from '$lib/Footer.svelte';
	import { width, height } from '$lib/store';
	import kodiia_small from '$lib/logos/kodiia_small.svg';
	import input from '$lib/logos/input.webp';
	import chat from '$lib/images/chat2.webp';
	import image from '$lib/images/image4.webp';
	import image2 from '$lib/images/image3.webp';
	import model from '$lib/images/model2.webp';
	import video from '$lib/images/video2.webp';
	import vector from '$lib/images/vector2.webp';
	import web from '$lib/images/web2.webp';
	import ca1 from '$lib/images/ca_1.webp';
	import ca2 from '$lib/images/ca_8.webp';
	import ca3 from '$lib/images/ca_3.webp';
	import game2 from '$lib/images/ca_4.webp';
	import ca5 from '$lib/images/ca_5.webp';
	import ca6 from '$lib/images/ca_6.webp';
	import ca7 from '$lib/images/ca_7.webp';
	import ca8 from '$lib/images/ca_10.webp';
	import vector1 from '$lib/images/vector_1.webp';
	import vector2 from '$lib/images/vector_2.webp';
	import vector3 from '$lib/images/vector_3.webp';
	import game1 from '$lib/images/game_1.webp';
	import game3 from '$lib/images/game_3.webp';
	import library from '$lib/images/library2.webp';
	import fortnite from '$lib/images/fortnite2.webp';
	import { slide, fade } from 'svelte/transition';
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';

	let textarea: any = $state();
	let hueRotation = $state(0);
	// let email: any = $state(''),
	// 	isSubscribing = $state(false);

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		let grid: any;
		let cellSize = 20;
		let gridSizeX = Math.round($width / cellSize);
		let gridSizeY = Math.round(($height * 0.8) / cellSize);
		let iteration = 0; // Counter variable
		let maxIterations = 20; // Maximum number of iterations
		p.setup = function () {
			cellSize = 20;
			gridSizeX = Math.round($width / cellSize);
			gridSizeY = Math.round(($height * 0.8) / cellSize);
			iteration = 0; // Counter variable
			maxIterations = 20; // Maximum number of iterations
			p.createCanvas(gridSizeX * cellSize, gridSizeY * cellSize);
			p.frameRate(20);
			grid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			// Initialize grid with random values
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					grid[i][j] = 0;
				}
			}
			// Randomly select 10 cells to have a value of 1
			for (let i = 0; i < 10; i++) {
				const x = p.floor(p.random(-10, 10) + gridSizeX / 2);

				const y = p.floor(p.random(-5, 5) + gridSizeY / 2);

				// let y
				// if(Math.random() > 0.5){
				// 	y = 0
				// } else {
				// 	y = gridSizeY - 3
				// }
				grid[x][y] = 20;
			}
			// grid[gridSizeX/2][gridSizeY/2] = 1;
		};
		p.draw = function () {
			p.background(0);
			// Draw grid
			let minVal = Infinity;
			let maxVal = -Infinity;
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					const value = grid[i][j];
					if (value < minVal) {
						minVal = value;
					}
					if (value > maxVal) {
						maxVal = value;
					}
				}
			}
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					grid[i][j] -= 0.005;
					if (grid[i][j] < 0) {
						grid[i][j] = 0;
					}
				}
			}
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					// const value = p.map(grid[i][j], minVal, maxVal, 0.1, 1);
					const value = grid[i][j];
					let saturation = value > 0.1 ? 90 : 0;
					let lightness = value > 0.1 ? 75 : 98;
					p.fill(`hsl(${Math.round(value * 100 + 150)}, ${saturation}%, ${lightness}%)`);
					p.noStroke();
					p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
				}
			}
			// Calculate next generation
			const newGrid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					if (grid[i][j] === 5) {
						// If the cell's value is 1, keep it as 1
						//newGrid[i][j] = 1;
					} else {
						let sum = 0;
						let count = 0;
						for (let x = -1; x <= 1; x++) {
							for (let y = -1; y <= 1; y++) {
								const ii = i + x;
								const jj = j + y;
								if (ii >= 0 && ii < gridSizeX && jj >= 0 && jj < gridSizeY) {
									sum += grid[ii][jj];
									count++;
								}
							}
						}
						newGrid[i][j] = sum / count;
					}
				}
			}
			// Update grid
			grid = newGrid;
			iteration++; // Increment counter
			if (iteration >= maxIterations) {
				p.noLoop(); // Stop the simulation
			}
		};
		p.mouseMoved = function () {
			const x = p.floor(p.mouseX / cellSize);
			const y = p.floor(p.mouseY / cellSize);
			if (x >= 0 && x < gridSizeX && y >= 0 && y < gridSizeY) {
				grid[x][y] = 5;
				iteration = 0; // Reset counter
				maxIterations = 20; // Reset max iterations
				p.loop(); // Restart the simulation
			}
		};

		p.windowResized = function () {
			p.resizeCanvas(window.innerWidth, window.innerHeight);
			p.setup();
			p.loop();
		};
	}

	let galleryItem = $state(0);
	const gallery = [
		{
			image: chat,
			text: `Do you know a design technique when a building design is inspired by a crumpled piece of paper?`
		},
		{
			image: image,
			text: `Create an image of a crumpled piece of paper`
		},
		{
			image: image2,
			text: `Create an image of a modern opera building based on the composition reference image.`
		},
		{ image: model, text: `Turn this image in a 3D model.` },
		{ image: video, text: `Turn this image in a video.` },
		{
			image: vector,
			text: `Create a fun vector illustration of a modern opera building inspired by Frank Gehry style.`
		},
		{
			image: web,
			text: `I want to create a game where a player has to run a modern opera building. Can you help me with this?`
		}
	];
	const totalImages = gallery.length;
	let intervalId: any;

	function scrollToImage(index: number) {
		galleryItem = index;
	}

	// Automatically change images every 3 seconds
	function startInterval() {
		intervalId = setInterval(() => {
			scrollToImage((galleryItem + 1) % totalImages);
		}, 3000);
	}
	startInterval();

	const projects = [library, fortnite, game3];
	let projectItem = $state(0);
	const totalProjectImages = projects.length;
	let projectIntervalId: any;

	function scrollToProjectImage(index: number) {
		projectItem = index;
	}
	function startProjectInterval() {
		projectIntervalId = setInterval(() => {
			scrollToProjectImage((projectItem + 1) % totalProjectImages);
		}, 3000);
	}
	startProjectInterval();

</script>

<div class="start-page-container">
	<MainPageNavPanel />

	<div class="start-page-wrapper">
		<div class="hero">
			<div class="hero-wrapper">
				<!-- <h1 class="primaryHeading">Your creativity supercharged with AI</h1>
				<p>
					Brainstorm, create visuals, generate web apps, and more — all with just text. No complex
					setups and expensive hardware requirements.
				</p> -->
				<!-- <h1 class="primaryHeading" style="font-weight: 300; max-width: 600px;">
					Bring <span style="font-weight: 700;"><i>creativity</i></span> back to your creative
					workflows <span style="font-weight: 700;"><i>with AI</i></span>
				</h1>
				<p style="max-width: 500px;">
					Creative software requires months of practice and top-tier hardware to truly get
					'creative' with it. So do AI tools. <br />But we believe there’s a better way.
				</p> -->
				<h1>Creative Solutions with Ease</h1>
					<p>Great ideas need many iterations. Creative software is complex and hard to start with.
					We make it simple. Grasp ideas instantly. Explore new directions. Iterate on any device. No barriers, just creativity.</p>
				<!-- Figure Out Perfect Solutions with Ease
Finding the ideal concept can be a lengthy process that requires multiple iterations. Complex creative software often slows you down when you need to move quickly.
With our workspace, grasp your ideas instantly, explore multiple directions, and iterate on any device—no barriers, just creativity. -->
				<button
					class="primaryButton"
					style='margin-top: 10px;'
					onclick={() => {
						window.open('/threads', '_self');
					}}>Get started - it's free</button
				>
			</div>
			<div class="sketchWrapper" style="filter: blur(20px) hue-rotate({hueRotation}deg);">
				<!-- Use the P5wrapper component and pass the sketch function -->
				<P5wrapper {sketch} />
			</div>
		</div>

		<div class="section" style="margin-top: 20px;">
			<span style="width: 50%; border-top: 1px solid hsl(0, 0%, 90%); margin-bottom: 40px;"></span>

			<h2 class="secondaryHeading">One interface for every task</h2>
			<p>Free yourself from complex UIs and hardware limitations. Just type your task: generate ideas, create visuals, build apps. 
				Cloud-based, it runs on any device with no complex setup required.</p>

			<div class="gallery">
				<img src={gallery[galleryItem].image} alt="input" style="width: 70%;" transition:slide />
			</div>

			<div class="chat-panel-container">
				<textarea
					bind:this={textarea}
					placeholder={`Type "?" for manual. Type questions or prompts for images, SVGs, videos, and 3d models.`}
					>{gallery[galleryItem].text}</textarea
				>
				<button
					class="tertiaryButton"
					style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
					aria-label="Upload File"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a4 4 0 0 1 5.66 5.66l-8.48 8.48a2 2 0 0 1-2.83-2.83l7.78-7.78"
						/>
					</svg>
				</button>
				<button
					id="magicButton"
					class="primaryButton"
					onclick={() => {
						galleryItem++;
						if (galleryItem >= totalImages) {
							galleryItem = 0;
						}
						clearInterval(intervalId); // Clear the existing interval
						startInterval();
					}}
				>
					Go
				</button>
			</div>

			<div class="gallery-buttons">
				{#each gallery as _, index}
					<button
						class:active={index === galleryItem}
						onclick={() => {
							scrollToImage(index);
							clearInterval(intervalId); // Clear the existing interval
							startInterval();
						}}
						aria-label="Next Image"
					></button>
				{/each}
			</div>
		</div>

		<div class="grid">
			<div class="section">
				<svg
					width="30"
					height="30"
					viewBox="0 0 64 64"
					xmlns="http://www.w3.org/2000/svg"
					fill="black"
				>
					<path d="M32 0L12 36h16l-8 28L52 28H36l8-28z" />
				</svg>

				<h3 class="secondaryHeading" style="margin-top: 20px;">
					The fast and easy way to create with AI
				</h3>
				<p>
					No complex workflows or local hardware limits. Everything works in the cloud with the
					fastest GPUs.
				</p>
			</div>
			<div class="section">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30"
					><defs
						><style>
							.cls-1 {
								fill: #201602;
							}
						</style></defs
					><g id="Layer_2" data-name="Layer 2"
						><g id="layer_1-2" data-name="layer 1"
							><path
								class="cls-1"
								d="M24 48a24 24 0 1 1 24-24 24 24 0 0 1-24 24zm0-46a22 22 0 1 0 22 22A22 22 0 0 0 24 2z"
							/><path
								class="cls-1"
								d="M24 48c-7.85 0-14-10.54-14-24S16.15 0 24 0s14 10.54 14 24-6.15 24-14 24zm0-46c-6.62 0-12 9.87-12 22s5.38 22 12 22 12-9.87 12-22S30.62 2 24 2z"
							/><path class="cls-1" d="M23 4h2v43h-2z" /><path
								class="cls-1"
								d="M1 23h33v2H1zM37 23h10v2H37zM7 12h37v2H7zM4 34h8v2H4zM16 34h28v2H16z"
							/></g
						></g
					></svg
				>

				<h3 class="secondaryHeading" style="margin-top: 20px;">Make it a web app</h3>
				<p>Generate content and turn it into web apps. Host with us and share with everyone.</p>
			</div>

			<div class="section">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30"
					><g data-name="15-idea"
						><path
							d="M40 33h-6a1 1 0 0 1-1-1v-3.1a1 1 0 0 0-.6-.9 11 11 0 1 1 9.195 0 1 1 0 0 0-.6.908V32A1 1 0 0 1 40 33zm-5-2h4v-2.1a3.015 3.015 0 0 1 1.762-2.724A9 9 0 0 0 43 11.292a9 9 0 1 0-9.759 14.887A3.014 3.014 0 0 1 35 28.9z"
						/><path
							d="M38 39h-2a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3zm-3-6v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3z"
						/><path d="M34 34h6v2h-6z" /><path
							d="M24 48a7 7 0 0 1-6.322-4.008A7.008 7.008 0 0 1 11 37v-.071a7.015 7.015 0 0 1-5.964-6.214 6.994 6.994 0 0 1 0-13.429A7.013 7.013 0 0 1 11 11.071V11a7.01 7.01 0 0 1 6.678-6.993A7.006 7.006 0 0 1 24 0a6.006 6.006 0 0 1 6 6h-2a4 4 0 0 0-4-4 5 5 0 0 0-4.714 3.349.976.976 0 0 1-1 .667l-.1-.007c-.06 0-.12-.009-.182-.009a5.006 5.006 0 0 0-5 5 4.9 4.9 0 0 0 .077.836 1.007 1.007 0 0 1-.227.82 1.028 1.028 0 0 1-.775.348h-.1A5 5 0 0 0 7 18a1.1 1.1 0 0 1-.831 1.076 4.993 4.993 0 0 0 0 9.849 1 1 0 0 1 .835 1v.1A5 5 0 0 0 12 35a1.093 1.093 0 0 1 .81.353 1.024 1.024 0 0 1 .267.81A4.923 4.923 0 0 0 13 37a5.006 5.006 0 0 0 5 5c.062 0 .122-.005.182-.009l.1-.007a1 1 0 0 1 1 .667A5 5 0 0 0 24 46a4 4 0 0 0 4-4 1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-2h2v2a3 3 0 0 1-3 3h-5.083A6.01 6.01 0 0 1 24 48z"
						/><path
							d="M12 25a7.008 7.008 0 0 1-7-7h2a5.006 5.006 0 0 0 5 5zM18 44a7.008 7.008 0 0 1-7-7h2a5 5 0 1 0 5-5v-2a7 7 0 0 1 0 14zM18 18v-2a5 5 0 1 0-5-5h-2a7 7 0 1 1 7 7zM38 32h-2V19a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-1h2v1a3 3 0 0 1-3 3h-2z"
						/><path
							d="M37 20h-3a3 3 0 0 1-3-3v-1h2v1a1 1 0 0 0 1 1h3zM18 35h2v2h-2zM16 37h2v2h-2zM13 16h2v2h-2zM11 18h2v2h-2zM23 23h2v2h-2zM21 25h2v2h-2z"
						/></g
					></svg
				>
				<h3 class="secondaryHeading" style="margin-top: 20px;">Iterate with AI Agents</h3>
				<p>
					Specifically designed to make your creative search and iterations easier and faster.
					Coming soon.
				</p>
			</div>

			<div class="section">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 128 98"
					width="50"
					height="30"
					style="enable-background:new 0 0 128 128"
					xml:space="preserve"
					><path
						d="M110.6 38.3H106v-3.5c0-1-.8-1.7-1.7-1.8H70.8c-2.7 0-5.2 1.2-6.8 3.3-1.6-2.1-4.1-3.3-6.8-3.3H23.7c-1 0-1.7.8-1.7 1.8v3.5h-4.6c-1 0-1.8.8-1.8 1.8v57c0 1 .8 1.7 1.8 1.8h93.1c1 0 1.7-.8 1.8-1.8V40c0-.9-.8-1.7-1.7-1.7zm-39.8-1.8h31.7v51.9H70.8c-2.9 0-4.6 1.4-5 1.6V41.6c0-.4 0-.7-.1-1.1.5-2.2 2.6-4 5.1-4zm-45.3 0h31.7c2.6 0 4.7 1.9 5 4.1 0 .4-.1.7-.1 1.1V90c-.3-.1-2.1-1.6-5-1.6H25.5V36.5zm-6.3 5.3H22v48.3c0 1 .8 1.8 1.8 1.8h33.5c2 0 3.9 1.1 4.8 3.4H19.2V41.8zm89.6 53.5H66c.8-2.2 2.8-3.4 4.8-3.4h33.5c1 0 1.8-.8 1.8-1.8V41.8h2.8l-.1 53.5z"
					/><path
						d="M32.7 50h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H32.7c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8zM32.7 59.3h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H32.7c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8zM32.7 68.7h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H32.7c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8zM32.7 78h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H32.7c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8zM72.8 50h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H72.8c-1 0-1.8.8-1.8 1.8s.9 1.8 1.8 1.8zM72.8 59.3h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H72.8c-1 0-1.8.8-1.8 1.8s.9 1.8 1.8 1.8zM72.8 68.7h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H72.8c-1 0-1.8.8-1.8 1.8s.9 1.8 1.8 1.8zM72.8 78h22.5c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H72.8c-1 0-1.8.8-1.8 1.8s.9 1.8 1.8 1.8z"
					/></svg
				>
				<h3 class="secondaryHeading" style="margin-top: 20px;">Learn with industry experts</h3>
				<p>
					Our tutorials are curated by world-class experts. From building your first game to
					training your first neural network — we’ve got you covered.
				</p>
			</div>
		</div>

		<div class="section">
			<h2 class="secondaryHeading" style="margin-top: 5em;">
				Describe Your Task, We’ll Handle the Rest
			</h2>
			<p>
				No matter what creative adventure you’re on — whether it’s designing a stunning library in
				the mountains, exploring options for an epic new location in Fortnite, or dreaming up a wild
				poster for a game that blends Star Wars with Pac-Man (how cool is that?)—we’ve got your
				back!
			</p>

			<div class="gallery">
				<img src={projects[projectItem]} alt="input" style="width: 70%;" transition:slide />
			</div>
			<div class="gallery-buttons" style="margin-top: 20px;">
				{#each projects as _, index}
					<button
						class:active={index === projectItem}
						onclick={() => scrollToProjectImage(index)}
						aria-label="Next Image"
					></button>
				{/each}
			</div>
		</div>

		<div class="section" style="min-height: 50vh; justify-content: center;">
			<h2 class="secondaryHeading">The perfect UI to create with AI</h2>
			<p>Stay in your creative flow with no complex setups or controls.</p>
			<button
				class="primaryButton"
				onclick={() => {
					window.open('/threads', '_self');
				}}>Get started - it's free</button
			>
		</div>

		<!-- <div class="section">
		<h2>FAQ</h2>
	</div> -->
		<Footer />
	</div>
</div>

<style>
	h1 {
		font-size: 2em;
	}
	h2 {
		font-size: 1.5em;
	}
	h3 {
		font-size: 1.2em;
	}
	.start-page-container {
		overflow-y: scroll;
		overflow-x: hidden;
		height: 100vh;
		height: 100svh;
		width: 100%;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.start-page-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1200px;
	}
	.hero {
		margin-top: 10vh;
		flex: 0 0 70vh;
		text-align: center;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}
	.hero-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.hero-wrapper p {
		max-width: 600px;
	}
	.section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		position: relative;
	}
	.section p {
		max-width: 600px;
	}
	.sketchWrapper {
		position: absolute;

		filter: blur(10px);
		-webkit-filter: blur(10px);
		transition: all 2s;
		z-index: -1;
	}
	.chat-panel-container {
		width: calc(100% - 20px);
		max-width: 800px;
		margin: 20px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		/* position: absolute;
		bottom: 30px; */
	}
	textarea{
		border: none;
		border-radius: 0;
		border-bottom: 1px solid hsl(0, 0%, 90%);
		background: none;
		background-color: hsla(0, 0%, 0%, 0.05);
		color: hsl(0, 0%, 10%);
		font-size: 1rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		height: 60px;
		padding: 10px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
	}
	#magicButton {
		width: 40px;
		height: 40px;
	}

	.gallery-buttons {
		display: flex;
		justify-content: center;
		margin-top: 0px;
	}

	.gallery-buttons button {
		width: 40px;
		height: 5px;
		border-radius: 5px;
		background-color: hsl(0, 0%, 90%);
		margin: 0 5px;
		border: none;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.gallery-buttons button.active {
		background-color: hsl(0, 0%, 2%);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		padding: 10px;
		box-sizing: border-box;
		margin-top: 5em;
	}

	.grid .section {
		background-color: hsl(0, 0%, 95%);
		border-radius: 10px;
	}

	

	@media screen and (max-width: 700px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
