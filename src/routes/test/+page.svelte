<script lang='ts'>
	import { goto } from '$app/navigation';
	import P5wrapper from '$lib/P5wrapper.svelte';
	import { width, height } from '$lib/store';

	let hueRotation = $state(0)

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		let grid: any;
		let cellSize = 20;
		let gridSizeX = Math.round($width / cellSize);
		let gridSizeY = Math.round($height / cellSize);
		let iteration = 0; // Counter variable
		let maxIterations = 10; // Maximum number of iterations
		p.setup = function () {
			cellSize = 20;
		 	gridSizeX = Math.round($width / cellSize);
		 	gridSizeY = Math.round($height / cellSize);
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
			// for (let i = 0; i < 50; i++) {
			// 	const x = p.floor(p.random(gridSizeX));
			// 	const y = p.floor(p.random(-5, 5) + gridSizeY / 2);
			// 	// const y = gridSizeY / 2
			// 	grid[x][y] = 0;
			// }
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
					if(grid[i][j] < 0){
						grid[i][j] = 0;
					}
				}
			}
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					// const value = p.map(grid[i][j], minVal, maxVal, 0.1, 1);
					const value = grid[i][j]
					let saturation = value > 0.1 ? 90 : 0
					let lightness = value > 0.1 ? 75 : 98
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
</script>

<div class="start-page-container">
	<div class="hero">
		<h1 class='primaryHeading'>Your creativity supercharged with AI.</h1>
		<p>
			Brainstorm, create visuals, generate web apps, and more — all with just text. No complex
			setups and expensive hardware requirements.
		</p>
		<button class="primaryButton">Get started - it's free</button>

		<div class="sketchWrapper" style='filter: blur(20px) hue-rotate({hueRotation}deg);'>
			<!-- Use the P5wrapper component and pass the sketch function -->
			<P5wrapper {sketch} />
		</div>
	</div>

	<div class="section">
		<h3 class='secondaryHeading'>One interface, every model you need.</h3>
		<p>Generate text, code, images, videos, and 3D assets — all from one platform.</p>
	</div>
	<div class="section">
		<h3 class='secondaryHeading'>The fast and easy way to create with AI.</h3>
		<p>
			No complex workflows or local hardware limits. Everything works in the cloud with the fastest
			GPUs.
		</p>
	</div>
	<div class="section">
		<h3 class='secondaryHeading'>Make it a web app.</h3>
		<p>Generate content and turn it into web apps. Host with us and share with everyone.</p>
	</div>

	<div class="section">
		<h3 class='secondaryHeading'>AI Agents</h3>
		<p>
			Specifically designed to make your creative search and iterations easier and faster. Coming
			soon.
		</p>
	</div>

	<div class="section">
		<h3 class='secondaryHeading'>Tutorials</h3>
		<p>
			Learning materials from industry experts. From building your first game to training your first
			neural network — we’ve got you covered.
		</p>
	</div>

	<div class="section">
		<h3 class='secondaryHeading'>Describe Your Task, We’ll Handle the Rest.</h3>
		<p>
			Create anything: graphic design, architecture,
			games, and more.
		</p>
	</div>

	<div class="section">
		<h3 class='secondaryHeading'>The perfect UI to create with AI.</h3>
		<p>
			Stay in your creative flow with no complex setups or
			controls.
		</p>
		<button class="primaryButton">Get started - it's free</button>
	</div>

	<!-- <div class="section">
		<h2>FAQ</h2>
	</div> -->

	<div class="footer">
		<p>Contacts | Subscribe | Privacy policy | Terms of service | Social media links</p>
	</div>
</div>

<style>
	.start-page-container {
		overflow-y: scroll;
		height: 100vh;
		height: 100svh;
		max-width: 1200px;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.hero {
		text-align: center;
		padding: 2rem;
        display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}
	.section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
        text-align: center;
	}
	.footer {
		text-align: center;
		padding: 1rem;
	}
	.sketchWrapper{
		position: absolute;
		
		filter: blur(10px);
		-webkit-filter: blur(10px);
		transition: all 2s;
		z-index: -1;
	}
</style>
