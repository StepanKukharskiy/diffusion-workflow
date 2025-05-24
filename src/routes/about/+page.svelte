<script lang="ts">
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';
	import Footer from '$lib/Footer.svelte';
	import { width } from '$lib/store';
	const text =
		'We see future as a friendly co-creative space, where computational power blends with artistic vision to catalyze a cultural rebirth. AI is changing the way we create, together we create new digital aesthetics that is beyond optimising workflow or generating stunning images, it’s about shaping the future. We declare independence from software that limits complex creative workflows – the future belongs to those who build their own tools. We envision ourselves as the central media community for talents who design the future and collaborate for successful projects.';
	const sketch = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"></\script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/addons/p5.sound.min.js"></\script>
    <meta charset="utf-8" />
    <style>
    body{
    margin: 0;
    overflow: hidden;
    }
    </style>
  </head>
  <body>
    <main>
    </main>
    <script>
function sketch(p) {
  let particles = []
  let font
  const fontSize = 18
  const textData = '${text}'      // your multi‐line text here
  let textArray = []

  // ——— preload the font ———
  p.preload = () => {
    font = p.loadFont(
      'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf'
    )
  }

  // ——— setup the canvas & initial layout ———
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.textFont(font)
    p.textSize(fontSize)

    textArray = textData.split('')
    layoutParticles()
  }

  // ——— main draw loop ———
  p.draw = () => {
    // semi-transparent background for trails
    p.background(252, 15)

    for (let pt of particles) {
      pt.update()
      pt.display()
    }
  }

  // ——— handle resize ———
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    layoutParticles()
  }

  // ——— helper to (re)build the particles array and layout ———
  function layoutParticles() {
    particles.length = 0
    let x = 100
    let y = 80
    const lineHeight = fontSize * 1.2
    const maxW = p.width - x

    for (let char of textArray) {
      if (char === '') {
        x = 100
        y += lineHeight
        continue
      }
      if (x > maxW) {
        x = 100
        y += lineHeight
      }
      particles.push(new Particle(x, y, char))
      x += p.textWidth(char)
    }
  }

  // ——— Particle “class” closes over p ———
  class Particle {
    constructor(x, y, char) {
      this.p = p
      this.originalPos = p.createVector(x, y)
      this.pos = this.originalPos.copy()
      this.vel = p.createVector(0, 0)
      this.acc = p.createVector(0, 0)
      this.maxSpeed = 3
      this.char = char
    }

    update() {
      const p = this.p
      // repulsion from mouse
      const mouse = p.createVector(p.mouseX, p.mouseY)
      let dir = this.pos.copy().sub(mouse)
      const d = dir.mag()
      if (d < 200) {
        dir.normalize()
        const f = p.map(d, 0, 200, 3, 0)
        dir.mult(f)
        this.acc.add(dir)
      }
      // attraction back to origin
      let targetDir = this.originalPos.copy().sub(this.pos)
      targetDir.mult(0.025)
      this.acc.add(targetDir)

      // integrate
      this.vel.add(this.acc)
      this.vel.limit(this.maxSpeed)
      this.pos.add(this.vel)
      this.acc.mult(0)
      // friction
      this.vel.mult(0.35)
    }

    display() {
      const p = this.p
      p.fill(0)
      p.noStroke()
      p.text(this.char, this.pos.x, this.pos.y)
    }
  }
}
new p5(sketch)
</\script>
  </body>
</html>`;
</script>

<MainPageNavPanel />
<div class="wrapper">
	<iframe srcdoc={sketch} title="sketch" style="height: {$width > 800 ? 400 : 850}px;"></iframe>
	<Footer />
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		overflow: auto;
		text-align: center;
	}
	iframe {
		margin-top: 100px;
		border: none;
		border-radius: 20px;
		width: 100%;
		max-width: 900px;
		height: 100%;
	}
</style>
