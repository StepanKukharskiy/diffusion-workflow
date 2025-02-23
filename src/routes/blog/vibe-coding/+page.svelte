<script lang="ts">
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';
	import Footer from '$lib/Footer.svelte';
	import vibecoding from '$lib/images/blog/vibe-coding/vibe-coding.png';
	import pavilion from '$lib/images/blog/vibe-coding/pavilion.jpg';
</script>

<MainPageNavPanel />
<div class="blog-container">
	<div class="blog-data">
		<h3>6 months of coding with AI - here is what I learned</h3>
		<img src={pavilion} alt="vibe-coding" style='margin-top: 20px;'/>
		<p style='font-size: 1rem'>
			AI-driven pavilion design exploration with vibe-coding and three.js using Kodiia.
		</p>

		<p>
			Vibe-coding is an up-and-coming trend. I’ve been doing it for 6 months, and here are some tips
			I’ve learned along the way:
		</p>

		

		<h4 style="margin-top: 20px;">Start Simple</h4>
		<p>
			If you need to create a project from scratch, don’t try to do everything at once. Begin with
			something basic and gradually make it more complex. Break the project into modules or
			components and work on them one at a time.
		</p>

		<h4 style="margin-top: 20px;">One Query – One Question</h4>
		<p>
			Ask specific questions about a single issue or feature you want to address or implement. Break
			down complex or large tasks into smaller subtasks, or ask the AI to do this for you. Overly
			broad questions can lead to incorrect results from the AI or code that doesn’t function
			properly.
		</p>

		<h4 style="margin-top: 20px;">Remove Unnecessary Messages from the Chat</h4>
		<p>
			All information from the thread/chat and all code in the project is sent to the AI with each
			query. Before making a new request, it’s better to remove resolved questions and topics that
			are no longer relevant to the project.
		</p>

		<h4 style="margin-top: 20px;">Stuck on Code? Ask the AI</h4>
		<p>
			The logic of your program should be clear to you. If there are unclear parts in the code, ask
			the AI to explain them. You can also ask the AI to suggest an alternative, simpler version of
			the code.
		</p>

		<h4 style="margin-top: 20px;">Save Iterations of Your Project</h4>
		<p>
			It’s better to save different versions of your project. For example, you can save your project
			using the current date and version number, like `my-project-250215-points-001`. Different
			versions will help you roll back changes or continue developing the project from a specific
			point in a new direction. In Kodiia, you can do this by clicking the Duplicate button under
			the code editor, giving your project copy a new name, and then clicking Save App.
		</p>

		<img src={vibecoding} alt="vibe-coding" />
		<p style='font-size: 1rem'>
			Vibe-coding a pavilion geometry using three.js in Kodiia.
		</p>

		<h4 style="margin-top: 20px;">80/20 Rule</h4>
		<p>
			AI is great for getting 80% of the work done—but the remaining 20% is still up to you. It may
			not know all the nuances of libraries like three.js and might use its concepts incorrectly.
			So, it’s on you to fix those issues. Get ready!
		</p>

		<h4 style="margin-top: 20px;">Bonus: Examples of Good and Bad Queries</h4>
		<p>
			Imagine you are working on a game.
			<br />Good Queries:
			<br />- How do I create a 10x10 grid in my game?
			<br />- How does scoring work in my game?
			<br />- How can I make residential buildings in my game earn 20 points if they’re near a
			shopping center?
			<br />- I want to add a new feature type—playgrounds—to my game. How can I do this?
			<br />- How do I replace images in my game’s code with others?
			<br />- What color palette would work best for my game? How can I apply it in the code?
			<br />
			<br />Bad Query Example:
			<br />- Hey! Make me a game where rhinos run around, and houses along the road turn into ice
			cream if two players approach them. Go ahead, bro, get it done. Oh, and wake me up in an hour.
		</p>

		<p>
			By following these tips, you’ll be able to work more effectively with AI tools and achieve
			better results for your projects!
		</p>
		<span style="display: inline-block; width: 50%; border-top: 1px solid hsl(0, 0%, 90%);"></span>
		<p>Stepan Kukharskiy | February 23, 2025</p>
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
