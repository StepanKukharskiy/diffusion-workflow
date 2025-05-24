<script lang="ts">
	import P5wrapper from '$lib/P5wrapper.svelte';
	import Footer from '$lib/Footer.svelte';
	import { width, height } from '$lib/store';
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';

	let hueRotation = $state(0);

	

	// Define your sketch function
	function sketch(p: any, appCanvas: any) {
		class Particle {
			constructor(p, x, y, char) {
				this.p = p;
				this.originalPos = p.createVector(x, y);
				this.pos = p.createVector(x, y);
				this.vel = p.createVector(0, 0);
				this.acc = p.createVector(0, 0);
				this.maxSpeed = 3.0;
				this.maxForce = 0.1;
				this.char = char;
			}

			update() {
				// Calculate distance to cursor
				let mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
				let dir = this.pos.copy().sub(mouse);
				let d = dir.mag();

				// If cursor is close, repel particle
				if (d < 200) {
					dir.normalize();
					let force = this.p.map(d, 0, 200, 3, 0);
					dir.mult(force);
					this.acc.add(dir);
				}

				// Attract particle to original position
				let target = this.originalPos.copy();
				let targetDir = target.copy().sub(this.pos)
				targetDir.mult(0.025); // Return speed
				this.acc.add(targetDir);

				// Update position
				this.vel.add(this.acc);
				this.vel.limit(this.maxSpeed);
				this.pos.add(this.vel);
				this.acc.mult(0);

				// Add some friction
				this.vel.mult(0.35);
			}

			display() {
				this.p.fill(0);
				this.p.noStroke();
				this.p.text(this.char, this.pos.x, this.pos.y);
			}
		}

		let particles:any = [];
		let font:any;
		let textData = `0/ We see future as a friendly co-creative space, where computational power blends with artistic vision to catalyze a cultural rebirth. 
		
1/ AI is changing the way we create, together we create new digital aesthetics that is beyond optimising workflow or generating stunning images, it's about shaping the future. 

2/ We declare independence from software that limits complex creative workflows – the future belongs to those who build their own tools. 

3/ We envision ourselves as the central media community for talents who design the future and collaborate for successful projects. `;
		let fontSize = 18;
		let textArray:any = [];
		p.preload = () => {
			font = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
		};
		p.setup = () => {
			// p.createCanvas(800, 400);
			p.createCanvas(p.windowWidth > 800 ? 800 : p.windowWidth - 20, p.windowWidth > 800 ? 400 : 570);
			p.textFont(font);
			p.textSize(fontSize);

			// Convert the text into an array of characters
			textArray = textData.split('');

			// Create a layout for the text
			let x = 20;
			let y = 40;
			let lineHeight = fontSize * 1.2;
			let maxWidth = p.width - 40;

			// Create particles for each character
			for (let i = 0; i < textArray.length; i++) {
				let char = textArray[i];

				// Handle line breaks
				if (char === '\n') {
					x = 20;
					y += lineHeight;
					continue;
				}

				// Check if we need to wrap to next line
				if (x > maxWidth) {
					x = 20;
					y += lineHeight;
				}

				// Create a particle for this character
				let particle = new Particle(p, x, y, char);
				particles.push(particle);

				// Move position for next character
				x += p.textWidth(char);
			}
		};
		p.draw = () => {
			p.background(249);

			// Update and display all particles
			for (let i = 0; i < particles.length; i++) {
				particles[i].update();
				particles[i].display();
			}
		};
		
		p.windowResized = () => {
			p.resizeCanvas(p.windowWidth > 800 ? 800 : p.windowWidth - 20, 400);

			// Recalculate positions when window size changes
			particles = [];

			// Recreate layout
			let x = 20;
			let y = 30;
			let lineHeight = fontSize * 1.2;
			let maxWidth = p.width - 40;

			for (let i = 0; i < textArray.length; i++) {
				let char = textArray[i];

				// Handle line breaks
				if (char === '\n') {
					x = 20;
					y += lineHeight;
					continue;
				}

				// Check if we need to wrap to next line
				if (x > maxWidth) {
					x = 20;
					y += lineHeight;
				}

				// Create a particle for this character
				let particle = new Particle(p, x, y, char);
				particles.push(particle);

				// Move position for next character
				x += p.textWidth(char);
			}
		};
	}
</script>

<div class="start-page-container">
	<MainPageNavPanel />

	<div class="start-page-wrapper">
		<div class="hero">
			<div class="sketchWrapper" style="hue-rotate({hueRotation}deg);">
				<!-- Use the P5wrapper component and pass the sketch function -->
				<P5wrapper {sketch} />
			</div>
		</div>

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
	min-width: min(90%, 400px);
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
