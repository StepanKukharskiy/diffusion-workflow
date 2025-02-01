<script lang="ts">
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';
	import Footer from '$lib/Footer.svelte';
	import img01 from '$lib/images/blog/iterative-image-generation/01.jpeg';
	import img02 from '$lib/images/blog/iterative-image-generation/02.jpeg';
	import img03 from '$lib/images/blog/iterative-image-generation/03.jpeg';
	import img04 from '$lib/images/blog/iterative-image-generation/04.jpeg';
</script>

<MainPageNavPanel />
<div class="blog-container">
	<div class="blog-data">
		<h3>Image generation models are not really creative. Here is how we can fix it.</h3>
		<p>
			The results of image generation models are often not that great when you give them one shot.
			Alina and I have come up with a method that helps overcome the creative blocks of these
			models. This method for architectural design exploration doesn’t rely on fine-tuned models or
			LORAs. It’s a simple, flexible process that uses basic image generation and iterative
			refinement to develop unique architectural concepts.
		</p>

		<h4 style="margin-top: 20px;">Step 1: Generate a Basic Image</h4>
		<p>
			<span class="black-dot"></span> Start with an inspiration: a natural formation (e.g., a rock)
			or an everyday object (e.g., a Game Boy).
			<br /><span class="black-dot"></span> Generate a series of images based on this inspiration.
			<br /><span class="black-dot"></span> Select the most interesting image as the foundation for further
			exploration.
		</p>
		<img src={img01} alt="rocks" />
		<p>
			Model: Flux Schnell
			<br />Prompt: A close up view of rocks formation, high res, no blur
		</p>

		<h4 style="margin-top: 20px;">Step 2: Refine with ControlNet</h4>
		<p>
			<span class="black-dot"></span> Use the selected image as a reference for composition in
			ControlNet.
			<br /><span class="black-dot"></span> Add prompts tailored to visualize architectural elements
			(e.g., buildings, pavilions).
			<br /><span class="black-dot"></span> Generate another series of images based on these prompts.
		</p>
		<img src={img02} alt="rocks" />
		<p>
			Model: Flux Canny Pro
			<br />Prompt: An image of a library building made of concrete shards, street view, clear sky,
			photo
		</p>

		<h4 style="margin-top: 20px;">Step 3: Iterate</h4>
		<p>
			<span class="black-dot"></span> Choose the most compelling image from the new series.
			<br /><span class="black-dot"></span> Use it as a reference for the next iteration, adjusting prompts
			as needed.
		</p>
		<img src={img03} alt="rocks" />
		<p>
			Model: Flux Canny Pro
			<br />Prompt: An image of a library building made of concrete and metal, warm light inside,
			busy street view, clear sky, photo
		</p>
		<h4 style="margin-top: 20px;">Step 4: Evolve</h4>
		<p>
			<br /><span class="black-dot"></span> Repeat this process for 3–4 iterations to refine the design
			further, exploring new ideas or enhancing specific features each time.
		</p>
		<img src={img04} alt="rocks" />
		<p>
			Model: Flux Canny Pro
			<br />Prompt: An image of a library building made of concrete and giant rocks, complex
			geometry, warm light inside, busy street view, clear sky, photo
		</p>
		<h4 style="margin-top: 20px;">Why This Method Works</h4>
		<p>
			<span class="black-dot"></span>No LORAs or Fine-Tuned Models:
			<br />The process relies entirely on standard tools and creative prompts, making it accessible
			and flexible.
			<br /><span class="black-dot"></span>Infinite Possibilities:
			<br />While 3–4 iterations are usually enough, you can repeat this process indefinitely for
			deeper exploration.
			<br /><span class="black-dot"></span>Adaptable and Creative:
			<br />Each step builds on the last, often leading to surprising and innovative results.
		</p>
		<p>
			This approach blends AI with artistic intuition, offering an interesting way to explore
			architectural design directions.
		</p>
		<span style="display: inline-block; width: 50%; border-top: 1px solid hsl(0, 0%, 90%);"></span>
		<p>Stepan Kukharskiy | February 1, 2025</p>
	</div>
	<Footer />
</div>

<style>
	.blog-container {
		padding-top: 100px;
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: scroll;
	}
	.blog-data {
		max-width: 600px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: left;
		text-wrap: wrap;
	}
	.blog-data img {
		width: 100%;
		max-width: 400px;
	}
</style>
