<script lang="ts">
	import { goto } from '$app/navigation';
	import P5wrapper from '$lib/P5wrapper.svelte';
	import { width, height } from '$lib/store';

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		let grid: any;
		let cellSize = 15;
		let gridSizeX = Math.round($width / cellSize);
		let gridSizeY = Math.round($height / cellSize);

		p.setup = function () {
			cellSize = 15;
			gridSizeX = Math.round($width / cellSize);
			gridSizeY = Math.round($height / cellSize);
			p.createCanvas(window.innerWidth, window.innerHeight);
			p.frameRate(10);
			grid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			// Initialize grid with random values
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					grid[i][j] = p.random(1);
				}
			}
			// Randomly select 10 cells to have a value of 1
			for (let i = 0; i < 10; i++) {
				const x = p.floor(p.random(gridSizeX));
				const y = p.floor(p.random(gridSizeY));
				grid[x][y] = 1;
			}
		};
		p.draw = function () {
			p.background(0);
			// Draw grid
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					const value = grid[i][j];
					// const valueMap = p.map(value, 0, 0.5, 0, 255)
					p.fill(value * 255);
					p.noStroke();
					p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
				}
			}
			// Calculate next generation
			const newGrid = new Array(gridSizeX).fill(0).map(() => new Array(gridSizeY).fill(0));
			for (let i = 0; i < gridSizeX; i++) {
				for (let j = 0; j < gridSizeY; j++) {
					if (grid[i][j] === 1) {
						// If the cell's value is 1, keep it as 1
						newGrid[i][j] = 1;
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
		};

		p.windowResized = function () {
			p.resizeCanvas(window.innerWidth, window.innerHeight);
			p.setup();
		};
	}
</script>

<div class="container">
	<div class="wrapper">
		<h1 class="primaryHeading">The easiest way to use AI in creative projects</h1>
		<button
			class="primaryButton"
			onclick={() => {
				goto('/threads');
			}}>Get Started</button
		>
	</div>
</div>
<!-- Use the P5wrapper component and pass the sketch function -->
<P5wrapper {sketch} />

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
	}
  button{
    margin-top: 20px;
  }
</style>
