<script lang="ts">
	import { goto } from '$app/navigation';
	import P5wrapper from '$lib/P5wrapper.svelte';
	import { width, height } from '$lib/store';
	import input from '$lib/logos/input.webp';
	import chat from '$lib/images/chat2.webp';
	import image from '$lib/images/image4.webp';
	import image2 from '$lib/images/image3.webp';
	import model from '$lib/images/model2.webp';
	import video from '$lib/images/video2.webp';
	import vector from '$lib/images/vector2.webp';
	import web from '$lib/images/web2.webp';
	import { slide, fade } from 'svelte/transition';

	let textarea: any = $state();
	let hueRotation = $state(0);

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		let grid: any;
		let cellSize = 20;
		let gridSizeX = Math.round($width / cellSize);
		let gridSizeY = Math.round(($height * 0.8) / cellSize);
		let iteration = 0; // Counter variable
		let maxIterations = 10; // Maximum number of iterations
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
				const x = p.floor(p.random(-5, 5) + gridSizeX / 2);
				const y = p.floor(p.random(-5, 5) + gridSizeY / 2);
				// const y = gridSizeY / 2
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
					p.fill(`hsl(${Math.round(value * 180 + 150)}, ${saturation}%, ${lightness}%)`);
					p.noStroke();
					p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
				}
			}
			// Calculate next generation
			const newGrid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					if (grid[i][j] === 10) {
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
</script>

<div class="start-page-container">
	<div class="start-page-wrapper">
		<div class="hero">
			<div class="hero-wrapper">
				<h1 class="primaryHeading">Your creativity supercharged with AI.</h1>
				<p>
					Brainstorm, create visuals, generate web apps, and more — all with just text. No complex
					setups and expensive hardware requirements.
				</p>
				<button class="primaryButton">Get started - it's free</button>
			</div>
			<div class="sketchWrapper" style="filter: blur(20px) hue-rotate({hueRotation}deg);">
				<!-- Use the P5wrapper component and pass the sketch function -->
				<P5wrapper {sketch} />
			</div>
		</div>

		<div class="section" style="margin-top: 20px;">
			<span style="width: 50%; border-top: 1px solid hsl(0, 0%, 90%); margin-bottom: 40px;"></span>

			<h3 class="secondaryHeading">One interface, every task you have.</h3>
			<p>Generate text, code, images, videos, and 3D assets — all from one platform.</p>

			<div class="gallery">
				<img src={gallery[galleryItem].image} alt="input" style="width: 50%;" transition:slide />
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
						onclick={() => scrollToImage(index)}
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
					The fast and easy way to create with AI.
				</h3>
				<p>
					No complex workflows or local hardware limits. Everything works in the cloud with the
					fastest GPUs.
				</p>
			</div>
			<div class="section">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="30" height="30">
					<circle cx="32" cy="32" r="30" stroke="black" stroke-width="2" fill="none"/>
					<path d="M2,32 A30,30 0 0,1 62,32" stroke="black" stroke-width="2" fill="none"/>
					<path d="M32,2 A30,30 0 0,1 32,62" stroke="black" stroke-width="2" fill="none"/>
					<path d="M12,12 A30,30 0 0,1 52,52" stroke="black" stroke-width="2" fill="none"/>
					<path d="M12,52 A30,30 0 0,1 52,12" stroke="black" stroke-width="2" fill="none"/>
					<line x1="2" y1="32" x2="62" y2="32" stroke="black" stroke-width="2"/>
					<line x1="32" y1="2" x2="32" y2="62" stroke="black" stroke-width="2"/>
				  </svg>

				<h3 class="secondaryHeading" style="margin-top: 20px;">Make it a web app.</h3>
				<p>Generate content and turn it into web apps. Host with us and share with everyone.</p>
			</div>

			<div class="section">
				<svg
					class="brain-icon"
					width="30"
					height="30"
					viewBox="0 0 64 64"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M32 2C20.954 2 12 10.954 12 22c0 4.418 1.79 8.418 4.688 11.312C14.79 36.582 13 40.582 13 45c0 11.046 8.954 20 20 20s20-8.954 20-20c0-4.418-1.79-8.418-4.688-11.312C51.21 30.418 53 26.418 53 22c0-11.046-8.954-20-20-20zm0 2c9.941 0 18 8.059 18 18 0 3.866-1.387 7.418-3.688 10.188C48.613 34.582 50 38.134 50 42c0 9.941-8.059 18-18 18s-18-8.059-18-18c0-3.866 1.387-7.418 3.688-10.188C15.387 29.418 14 25.866 14 22c0-9.941 8.059-18 18-18z"
					/>
				</svg>
				<h3 class="secondaryHeading" style="margin-top: 20px;">AI Agents</h3>
				<p>
					Specifically designed to make your creative search and iterations easier and faster.
					Coming soon.
				</p>
			</div>

			<div class="section">
				<svg
					width="30"
					height="30"
					viewBox="0 0 64 64"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M8 2h40a4 4 0 0 1 4 4v52a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
					<path d="M8 2v60M48 2v60M8 18h40" />
					<path d="M24 18v44M32 18v44" />
				</svg>
				<h3 class="secondaryHeading" style="margin-top: 20px;">Tutorials</h3>
				<p>
					Learning materials from industry experts. From building your first game to training your
					first neural network — we’ve got you covered.
				</p>
			</div>
		</div>

		<div class="section">
			<h3 class="secondaryHeading">Describe Your Task, We’ll Handle the Rest.</h3>
			<p>Create anything: graphic design, architecture, games, and more.</p>
		</div>

		<div class="section">
			<h3 class="secondaryHeading">The perfect UI to create with AI.</h3>
			<p>Stay in your creative flow with no complex setups or controls.</p>
			<button class="primaryButton">Get started - it's free</button>
		</div>

		<!-- <div class="section">
		<h2>FAQ</h2>
	</div> -->

		<div class="footer">
			<p>Contacts | Subscribe | Privacy policy | Terms of service | Social media links</p>
		</div>
	</div>
</div>

<style>
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
	.footer {
		text-align: center;
		padding: 1rem;
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
	textarea {
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
	}

	.grid .section {
		background-color: hsl(0, 0%, 95%);
		border-radius: 10px;
	}
</style>
