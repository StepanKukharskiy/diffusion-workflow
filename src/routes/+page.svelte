<script lang="ts">
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
			maxIterations = 10; // Maximum number of iterations
			p.createCanvas(gridSizeX * cellSize, gridSizeY * cellSize);
			p.frameRate(20);
			grid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			// Initialize grid with random values
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					grid[i][j] = 0.5;
				}
			}
			// Randomly select 10 cells to have a value of 1
			for (let i = 0; i < 50; i++) {
				const x = p.floor(p.random(gridSizeX));
				const y = p.floor(p.random(-5, 5) + gridSizeY / 2);
				// const y = gridSizeY / 2
				grid[x][y] = 0;
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
					if(grid[i][j] < 0){
						grid[i][j] = 0;
					}
				}
			}
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					// const value = p.map(grid[i][j], minVal, maxVal, 0.1, 1);
					const value = grid[i][j]
					p.fill(`hsl(${Math.round(value * 180 + 150)}, 70%, 70%)`);
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
				grid[x][y] = 3;
				iteration = 0; // Reset counter
				maxIterations = 10; // Reset max iterations
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

<div class="container">
	<div class="wrapper">
		<h1 class="primaryHeading">The AI-powered Workspace for Your Creative Projects</h1>
		<button
			class="primaryButton"
			onpointerover={()=>{hueRotation = -90; console.log(hueRotation)}}
			onpointerleave={()=>{hueRotation = 0}}
			onclick={() => {
				goto('/threads');
			}}>Get Started - It's Free</button
		>
	</div>
</div>

<div class="sketchWrapper" style='filter: blur(10px) hue-rotate({hueRotation}deg);'>
	<!-- Use the P5wrapper component and pass the sketch function -->
	<P5wrapper {sketch} />
</div>

<style>
	.wrapper {
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px;
		box-sizing: border-box;
		text-align: center;
	}
	.container {
		width: 100%;
		min-height: 100vh;
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
	}
	button {
		margin-top: 20px;
	}
	.sketchWrapper{
		filter: blur(10px);
		-webkit-filter: blur(10px);
		transition: all 2s;
	}
</style>
