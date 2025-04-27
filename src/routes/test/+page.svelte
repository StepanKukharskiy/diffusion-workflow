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
	import art from '$lib/images/landing-art.webp';
	import arch from '$lib/images/landing-arch.webp';
	import graphic from '$lib/images/landing-graphic.webp';
	import game from '$lib/images/landing-game.webp';
	import search from '$lib/images/landing-search.webp';
	import multi from '$lib/images/landing-multi.webp';
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
		let maxIterations = 300; // Maximum number of iterations
		const symbols = ['.', '-', 'c', 'o', '(', 'r', '3', 'a', '+', '0'];
		const phrase = ' Co-create with AI';

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
			p.background('hsl(0,0%,98%)');
			// p.background(250);
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
					grid[i][j] -= 0.0025;
					if (grid[i][j] < 0) {
						grid[i][j] = 0;
					}
				}
			}
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					const value = p.map(grid[i][j], minVal, maxVal, 0.1, 1);
					// const value = grid[i][j];
					let saturation = value > 0.1 ? 90 : 0;
					let lightness = value > 0.1 ? 75 : 98;
					p.fill(`hsl(${Math.round(value * 100 + 150)}, ${saturation}%, ${lightness}%)`);
					p.noStroke();
					// p.fill(0, value*100)
					// p.stroke(0, 80)
					//p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
					let s = p.map(value, 0.1, 1, 1, cellSize);
					let item = Math.round(p.map(value, 0.1, 1, 0, phrase.length));
					p.textFont('Courier');
					p.textSize(cellSize * 0.65);
					p.text(phrase.charAt(item), i * cellSize, j * cellSize);
					if (s > 8) {
						// p.circle(i * cellSize + cellSize/2, j * cellSize + cellSize/2, s)
						// p.rectMode(p.CENTER)
						// p.rect(i * cellSize , j * cellSize, s, s, s/5)
					}
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
				//p.noLoop(); // Stop the simulation
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
				<h1>Co-create with AI</h1>
				<h4>Kodiia: The Digital Sketchbook for Architects, Designers, and Artists</h4>
				<p>
					A space where you and AI work together to explore, question, and push your ideas further.
				</p>
				<button
					class="primaryButton"
					style="margin-top: 10px;"
					onclick={() => {
						window.open('/threads', '_self');
					}}>Get started - it's free</button
				>
			</div>
			<div class="sketchWrapper" style="filter: hue-rotate({hueRotation}deg);">
				<!-- Use the P5wrapper component and pass the sketch function -->
				<P5wrapper {sketch} />
			</div>
		</div>

		<div class="section" style="margin-top: 20px;">
			<span style="width: 50%; border-top: 1px solid hsl(0, 0%, 90%); margin-bottom: 40px;"></span>

			<h2 class="secondaryHeading">One interface for every task</h2>
			<p>
				Free yourself from complex UIs and hardware limitations. Just type your task: generate
				ideas, create visuals, build apps. Cloud-based, it runs on any device with no complex setup
				required.
			</p>

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

		<h2 style="margin-top: 40px; margin-bottom: 0px;">Why Kodiia?</h2>
			<div class="grid">
				<div class='section' style='top-margin: 0; aspect-ratio: 4/3;'>
					<svg
						width="40"
						height="40"
						viewBox="0 0 64 64"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
					>
						<path
							d="M32 4C16.6 4 4 16.6 4 32s12.6 28 28 28 28-12.6 28-28S47.4 4 32 4zm0 48c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"
						/>
						<path
							d="M32 20c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
						/>
					</svg>

					<h3 class="secondaryHeading" style="margin-top: 20px;">
						Your Vision. <br />Deeper Exploration.
					</h3>
					<p>
						Discover new connections and creative directions with AI. See possibilities you might
						have missed.
					</p>
				</div>
				<div class='section' style="width: 100%; background-image: url({search}); background-size: cover; background-position: center; aspect-ratio: 4/3;"></div>

		</div>
		<div class='grid'>
			<div class="section" style='aspect-ratio: 4/3;'>
				<svg
					width="40"
					height="40"
					viewBox="0 0 64 64"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
				>
					<path
						d="M56 8H8c-2.2 0-4 1.8-4 4v40c0 2.2 1.8 4 4 4h48c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm0 44H8V16h48v36z"
					/>
					<path
						d="M16 24h8v8h-8zM28 24h8v8h-8zM40 24h8v8h-8zM16 36h8v8h-8zM28 36h8v8h-8zM40 36h8v8h-8z"
					/>
				</svg>

				<h3 class="secondaryHeading" style="margin-top: 20px;">
					One Workspace. <br />Multimodal Possibilities.
				</h3>
				<p>
					Move fluidly between 2D, 3D, videos, text, and code. One seamless environment. No more
					switching between disconnected tools.
				</p>
			</div>
			<div class='section' style="width: 100%; background-image: url({multi}); background-size: cover; background-position: center; aspect-ratio: 4/3;"></div>
		</div>

		<div class="section" >
			<h2 class="secondaryHeading" style="margin-top: 5em;">
				Think deeper. <br />Create beyond your limits. <br />With AI.
			</h2>
			<p>Projects done with Kodiia.</p>
		</div>

		<div class="grid" style="width: 100%; margin-top: 0;">
			<div class="section" style="aspect-ratio: 4/3; background: none;">
				<h3 class="secondaryHeading" style='width: 100%;'>Art</h3>
				<div
					class="section"
					style="width: 100%; background-image: url({art}); background-size: cover; background-position: center; aspect-ratio: 4/3; "
				></div>
			</div>
			<div class="section" style="aspect-ratio: 4/3; background: none;">
				<h3 class="secondaryHeading">Architecture</h3>
				<div
					class="section"
					style="width: 100%; background-image: url({arch}); background-size: cover; background-position: center; aspect-ratio: 4/3; "
				></div>
			</div>
			<div class="section" style="aspect-ratio: 4/3; background:none;">
				<h3 class="secondaryHeading" style="margin-top: 20px;">Games</h3>
				<div
					class="section"
					style="width: 100%; background-image: url({game}); background-size: cover; background-position: center; aspect-ratio: 4/3; "
				></div>
			</div>
			<div class="section" style="aspect-ratio: 4/3; background: none;">
				<h3 class="secondaryHeading" style="margin-top: 20px;">Graphics</h3>
				<div
					class="section"
					style="width: 100%; background-image: url({graphic}); background-size: cover; background-position: center; aspect-ratio: 4/3; "
				></div>
			</div>
		</div>

		<div class="section" style="min-height: 50vh; justify-content: center;">
			<h2 class="secondaryHeading">Ready to Transform Your Creative Process?</h2>
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
		font-size: 3em;
		margin-bottom: 0.5em;
		font-weight: 700;
	}
	h2 {
		font-size: 2.2em;
		margin-bottom: 0.5em;
	}
	h3 {
		font-size: 1.5em;
		margin-bottom: 0.5em;
	}
	h4 {
		font-size: 1.3em;
		margin-bottom: 0.5em;
		font-weight: 700;
	}
	p {
		font-size: 1.1em;
		line-height: 1.6;
		margin-bottom: 1em;
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
		box-sizing: border-box;
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
		gap: 0px;
		padding: 10px;
		box-sizing: border-box;
		margin: 10px;
		margin-top: 5em;
		background-color: hsl(0, 0%, 95%);
		border-radius: 10px;
		box-sizing: border-box;
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
