<script lang="ts">
	import MainPageNavPanel from '$lib/MainPageNavPanel.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<MainPageNavPanel />
<div class="blog-container">
	<div class="blog-topics">
		<h2 style="margin-bottom: 20px;">Blog</h2>
		<div class="blog-topic">
			<h3>6 months of coding with AI - here is what I learned.</h3>
			<div>
				<p>Stepan Kukharskiy | February 23, 2025</p>
			</div>
			<button
				class="tertiaryButton"
				onclick={() => {
					window.open('/blog/vibe-coding', '_self');
				}}
			>
				Read
			</button>
		</div>
		<div class="blog-topic">
			<h3>Image generation models are not really creative. Here is how we can fix it.</h3>
			<div>
				<p>Stepan Kukharskiy | February 1, 2025</p>
			</div>
			<button
				class="tertiaryButton"
				onclick={() => {
					window.open('/blog/iterative-image-generation', '_self');
				}}
			>
				Read
			</button>
		</div>
	</div>
	<Footer />
</div>

<style>
	.blog-container {
		padding-top: 100px;
		box-sizing: border-box;
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: scroll;
	}
	.blog-topics {
		max-width: 1200px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		text-align: left;
		text-wrap: wrap;
	}
	.blog-topic {
		margin-bottom: 10px;
		padding: 10px;
		background-color: hsl(0, 0%, 95%);
		border-radius: 10px;
		box-sizing: border-box;
	}
</style>
