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

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		let grid: any;
		let cellSize = 20;
		let gridSizeX = Math.round($width / cellSize);
		let gridSizeY = Math.round(($height * 0.8) / cellSize);
		let iteration = 0; // Counter variable
		let maxIterations = 300; // Maximum number of iterations
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

				grid[x][y] = 20;
			}
		};
		p.draw = function () {
			p.background('hsl(0,0%,98%)');
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
					grid[i][j] -= 0.0075;
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
					// p.fill(`hsl(${Math.round(value * 100 + 150)}, ${saturation}%, ${lightness}%)`);
					// p.noStroke();
					let s = p.map(value, 0.1, 1, 1, cellSize)
					if(s > 8){
					p.rectMode(p.CENTER)
					p.rect(i * cellSize , j * cellSize, s, s, s/5)
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

	// Features for the "Why Kodiia" section
	const features = [
		{
			title: "One Workspace",
			description: "Move fluidly between 2D, 3D, videos, text, and code in one seamless browser-based environment.",
			icon: "workspace"
		},
		{
			title: "Expand Your Vision",
			description: "Discover new connections and creative directions with AI. See possibilities you might have missed.",
			icon: "vision"
		},
		{
			title: "Think Deeper",
			description: "Create beyond your limits with AI as your collaborative partner.",
			icon: "think"
		}
	];
</script>

<div class="start-page-container">
	<MainPageNavPanel />

	<div class="start-page-wrapper">
		<div class="hero">
			<div class="hero-wrapper">
				<h1>Co-Create with AI</h1>
				<h4>Kodiia: The Digital Sketchbook for Architects, Designers, and Artists</h4>
				<p>A space where you and AI work together to explore, question, and push your ideas further.</p>
				<div class="cta-buttons">
					<button
						class="primaryButton"
						onclick={() => {
							window.open('/threads', '_self');
						}}>Get started - it's free</button>
					<button 
						class="secondaryButton"
						onclick={() => {
							document.getElementById('why-kodiia').scrollIntoView({ behavior: 'smooth' });
						}}>Learn more</button>
				</div>
			</div>
			<div class="sketchWrapper" style="filter: hue-rotate({hueRotation}deg);">
				<P5wrapper {sketch} />
			</div>
		</div>

		<div class="section showcase">
			<span class="divider"></span>

			<h2 class="secondaryHeading">See Kodiia in Action</h2>
			<p class="subtitle">Type your creative vision and watch it transform across mediums</p>

			<div class="gallery">
				<img src={gallery[galleryItem].image} alt="Kodiia showcase example" transition:slide />
			</div>

			<div class="chat-panel-container">
				<textarea
					bind:this={textarea}
					placeholder={`Type "?" for manual. Type questions or prompts for images, SVGs, videos, and 3d models.`}
					>{gallery[galleryItem].text}</textarea>
				<button
					class="tertiaryButton"
					style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"
					aria-label="Upload File">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round">
						<path
							d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a4 4 0 0 1 5.66 5.66l-8.48 8.48a2 2 0 0 1-2.83-2.83l7.78-7.78" />
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
						clearInterval(intervalId);
						startInterval();
					}}>
					Go
				</button>
			</div>

			<div class="gallery-buttons">
				{#each gallery as _, index}
					<button
						class:active={index === galleryItem}
						onclick={() => {
							scrollToImage(index);
							clearInterval(intervalId);
							startInterval();
						}}
						aria-label="Gallery navigation"></button>
				{/each}
			</div>
		</div>

		<div id="why-kodiia" class="section why-section">
			<h2 class="secondaryHeading">Why Kodiia?</h2>
			<p class="subtitle">The perfect environment for creative collaboration with AI</p>
			
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">
						<svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
							<path d="M56 8H8c-2.2 0-4 1.8-4 4v40c0 2.2 1.8 4 4 4h48c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm0 44H8V16h48v36z"/>
							<path d="M16 24h8v8h-8zM28 24h8v8h-8zM40 24h8v8h-8zM16 36h8v8h-8zM28 36h8v8h-8zM40 36h8v8h-8z"/>
						</svg>
					</div>
					<h3>One Workspace. Multimodal Possibilities.</h3>
					<p>Move fluidly between 2D, 3D, videos, text, and code. One seamless browser-based environment. No more switching between disconnected tools.</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">
						<svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
							<path d="M32 4C16.6 4 4 16.6 4 32s12.6 28 28 28 28-12.6 28-28S47.4 4 32 4zm0 48c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
							<path d="M32 20c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
						</svg>
					</div>
					<h3>Expand Your Vision with AI</h3>
					<p>Discover new connections and creative directions. See possibilities you might have missed and explore beyond your usual patterns.</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">
						<svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
							<path d="M32 4c-5.5 0-10 4.5-10 10 0 2.9 1.2 5.5 3.2 7.3-3.5 2.9-5.8 7.3-5.8 12.2v2c-7.4 2.6-12 8.4-12 14.5 0 9.1 11 16 24.5 16s24.5-6.9 24.5-16c0-6.1-4.6-11.9-12-14.5v-2c0-4.9-2.3-9.3-5.8-12.2 2-1.9 3.2-4.5 3.2-7.3 0-5.5-4.5-10-10-10zm0 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 44c-9.9 0-18-4-18-9s8.1-9 18-9 18 4 18 9-8.1 9-18 9z"/>
						</svg>
					</div>
					<h3>Think Deeper. Create Beyond Limits.</h3>
					<p>With AI as your collaborative partner, push your creative boundaries and develop ideas you never thought possible.</p>
				</div>
			</div>
		</div>

		<div class="section multimodal">
			<h2 class="secondaryHeading">One Interface for Every Creative Task</h2>
			<p class="subtitle">Free yourself from complex UIs and hardware limitations</p>
			
			<div class="capabilities-grid">
				<div class="capability-card">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30">
						<path d="M40 33h-6a1 1 0 0 1-1-1v-3.1a1 1 0 0 0-.6-.9 11 11 0 1 1 9.195 0 1 1 0 0 0-.6.908V32A1 1 0 0 1 40 33zm-5-2h4v-2.1a3.015 3.015 0 0 1 1.762-2.724A9 9 0 0 0 43 11.292a9 9 0 1 0-9.759 14.887A3.014 3.014 0 0 1 35 28.9z"/>
						<path d="M38 39h-2a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3zm-3-6v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3z"/>
					</svg>
					<h3>Generate Ideas</h3>
					<p>Brainstorm concepts and get intelligent feedback to refine your vision.</p>
				</div>
				
				<div class="capability-card">
					<svg width="30" height="30" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
						<path d="M56 8H8c-2.2 0-4 1.8-4 4v40c0 2.2 1.8 4 4 4h48c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm-4 40H12V16h40v32z"/>
						<path d="M36 24c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4zM44 36l-8-8-12 12-4-4-8 8h32z"/>
					</svg>
					<h3>Create Visuals</h3>
					<p>Generate images, videos, 3D models and more with simple text prompts.</p>
				</div>
				
				<div class="capability-card">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30">
						<path d="M24 48a7 7 0 0 1-6.322-4.008A7.008 7.008 0 0 1 11 37v-.071a7.015 7.015 0 0 1-5.964-6.214 6.994 6.994 0 0 1 0-13.429A7.013 7.013 0 0 1 11 11.071V11a7.01 7.01 0 0 1 6.678-6.993A7.006 7.006 0 0 1 24 0a6.006 6.006 0 0 1 6 6h-2a4 4 0 0 0-4-4 5 5 0 0 0-4.714 3.349.976.976 0 0 1-1 .667l-.1-.007c-.06 0-.12-.009-.182-.009a5.006 5.006 0 0 0-5 5 4.9 4.9 0 0 0 .077.836 1.007 1.007 0 0 1-.227.82 1.028 1.028 0 0 1-.775.348h-.1A5 5 0 0 0 7 18a1.1 1.1 0 0 1-.831 1.076 4.993 4.993 0 0 0 0 9.849 1 1 0 0 1 .835 1v.1A5 5 0 0 0 12 35a1.093 1.093 0 0 1 .81.353 1.024 1.024 0 0 1 .267.81A4.923 4.923 0 0 0 13 37a5.006 5.006 0 0 0 5 5c.062 0 .122-.005.182-.009l.1-.007a1 1 0 0 1 1 .667A5 5 0 0 0 24 46a4 4 0 0 0 4-4 1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-2h2v2a3 3 0 0 1-3 3h-5.083A6.01 6.01 0 0 1 24 48z"/>
					</svg>
					<h3>Build Interactive Apps</h3>
					<p>Turn your ideas into functional web applications without complex coding.</p>
				</div>
				
				<div class="capability-card">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30">
						<path d="M40 6H8c-1.1 0-2 .9-2 2v32c0 1.1.9 2 2 2h32c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 32H10V10h28v28z"/>
						<path d="M16 16h16v2H16zM16 22h16v2H16zM16 28h10v2H16z"/>
					</svg>
					<h3>Cloud-Based Power</h3>
					<p>Access powerful AI capabilities from any device with no complex setup required.</p>
				</div>
			</div>
		</div>

		<div class="section project-showcase">
			<h2 class="secondaryHeading">From Concept to Creation</h2>
			<p class="subtitle">Describe your vision and watch it come to life</p>

			<div class="gallery project-gallery">
				<img src={projects[projectItem]} alt="Project example" transition:slide />
				<div class="project-description">
					<p>Whether you're designing a mountain library, exploring new game locations, or creating concept art, Kodiia helps you bring your vision to life.</p>
					<button class="secondaryButton" onclick={() => window.open('/threads', '_self')}>Start your project</button>
				</div>
			</div>
			
			<div class="gallery-buttons">
				{#each projects as _, index}
					<button
						class:active={index === projectItem}
						onclick={() => {
							scrollToProjectImage(index);
							clearInterval(projectIntervalId);
							startProjectInterval();
						}}
						aria-label="Project navigation"></button>
				{/each}
			</div>
		</div>

		<div class="section cta-section">
			<h2 class="secondaryHeading">Ready to Transform Your Creative Process?</h2>
			<p>Stay in your creative flow with no complex setups or controls.</p>
			<div class="cta-buttons">
				<button
					class="primaryButton"
					onclick={() => window.open('/threads', '_self')}>
					Get started - it's free
				</button>
				<button 
					class="secondaryButton"
					onclick={() => document.querySelector('.start-page-container').scrollTo(0, 0)}>
					Back to top
				</button>
			</div>
		</div>

		<Footer />
	</div>
</div>

<style>
	/* Base styles */
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
		font-weight: 500;
	}
	p {
		font-size: 1.1em;
		line-height: 1.6;
		margin-bottom: 1em;
	}
	.subtitle {
		font-size: 1.2em;
		color: hsl(0, 0%, 40%);
		margin-bottom: 2em;
	}
	
	/* Container and wrapper */
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
		scroll-behavior: smooth;
	}
	.start-page-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1200px;
		width: 100%;
	}
	
	/* Hero section */
	.hero {
		margin-top: 10vh;
		min-height: 80vh;
		text-align: center;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		width: 100%;
	}
	.hero-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 1;
		max-width: 800px;
	}
	.hero-wrapper p {
		max-width: 600px;
		font-size: 1.2em;
		margin-bottom: 2em;
	}
	.cta-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	
	/* Background effect */
	.sketchWrapper {
		position: absolute;
		filter: blur(10px);
		-webkit-filter: blur(10px);
		transition: all 2s;
		z-index: -1;
		opacity: 0.8;
	}
	
	/* Section styling */
	.section {
		padding: 4rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		position: relative;
		width: 100%;
		max-width: 1200px;
	}
	.section p {
		max-width: 700px;
	}
	.divider {
		width: 50%; 
		border-top: 1px solid hsl(0, 0%, 90%); 
		margin-bottom: 40px;
	}
	
	/* Feature cards */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		width: 100%;
		margin-top: 2rem;
	}
	.feature-card {
		background-color: hsl(0, 0%, 98%);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
		transition: transform 0.3s, box-shadow 0.3s;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
	}
	.feature-icon {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background-color: hsl(210, 100%, 97%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		color: hsl(210, 100%, 50%);
	}
	
	/* Capabilities grid */
	.capabilities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
		width: 100%;
		margin-top: 2rem;
	}
	.capability-card {
		background-color: hsl(0, 0%, 98%);
		border-radius: 10px;
		padding: 1.5rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.capability-card svg {
		margin-bottom: 1rem;
		color: hsl(210, 100%, 50%);
	}
	
	/* Gallery and chat panel */
	.gallery {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
		overflow: hidden;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}
	.project-gallery {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: center;
	}
	.project-description {
		padding: 0 2rem;
		text-align: left;
	}
	.chat-panel-container {
		width: calc(100% - 20px);
		max-width: 800px;
		margin: 20px auto;
		padding: 15px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 12px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
	}
	textarea {
		border: none;
		border-radius: 8px;
		background-color: hsla(0, 0%, 98%, 0.8);
		color: hsl(0, 0%, 20%);
		font-size: 1rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 400;
		height: 60px;
		padding: 15px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: background-color 0.3s;
	}
	textarea:focus {
		outline: none;
		background-color: white;
	}
	#magicButton {
		width: 50px;
		height: 50px;
		border-radius: 25px;
		margin-left: 10px;
	}
	
	/* Gallery navigation */
	.gallery-buttons {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}
	.gallery-buttons button {
		width: 40px;
		height: 5px;
		border-radius: 5px;
		background-color: hsl(0, 0%, 90%);
		margin: 0 5px;
		border: none;
		cursor: pointer;
		transition: background-color 0.3s, width 0.3s;
	}
	.gallery-buttons button.active {
		background-color: hsl(210, 100%, 50%);
		width: 50px;
	}
	
	/* CTA section */
	.cta-section {
		background-color: hsl(210, 100%, 97%);
		border-radius: 20px;
		margin: 4rem 0;
		padding: 4rem 2rem;
	}
	
	/* Responsive adjustments */
	@media screen and (min-width: 768px) {
		.project-gallery {
			grid-template-columns: 1fr 1fr;
		}
	}
	
	@media screen and (max-width: 768px) {
		h1 {
			font-size: 2.5em;
		}
		h2 {
			font-size: 1.8em;
		}
		.section {
			padding: 3rem 1.5rem;
		}
		.features-grid, .capabilities-grid {
			grid-template-columns: 1fr;
		}
		.cta-buttons {
			flex-direction: column;
			width: 100%;
			max-width: 300px;
		}
		.cta-buttons button {
			width: 100%;
			margin-bottom: 1rem;
		}
	}
	
	@media screen and (max-width: 480px) {
		h1 {
			font-size: 2em;
		}
		.hero {
			padding: 1rem;
		}
	}
</style>
