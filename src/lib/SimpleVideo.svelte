<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	import { page } from '$app/stores';
	let { videoUrl = '', uuid = '', options = false } = $props();
</script>

<div class="videoContainer">
	<video controls class="generatedVideo">
		<source src={videoUrl} type="video/mp4" />
		<track kind="captions" />
	</video>
	{#if options}
		<div style="display: flex; flex-wrap: wrap;">
			<button
				onclick={() => {
					// window.open(
					// 	`${$page.url.origin}/api/get-file/${$page.params.projectId}/${videoUrl.split('/')[7]}`,
					// 	'_blank'
					// );
					const link = document.createElement('a');
					link.href = `${$page.url.origin}/api/get-file/${$page.params.projectId}/${videoUrl.split('/')[7]}`;
					link.download = `${videoUrl.split('/').pop()}`; // Set the filename for download
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}}
				class="tertiaryButton">Download</button
			>

			<button
				class="tertiaryButton"
				onclick={async () => {
					deleteBlock($elements, uuid);
					$elements = $elements;
				}}>Delete</button
			>
		</div>
	{/if}
</div>

<style>
	.videoContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	video {
		display: block;
		width: 100%;
		max-width: 600px;
		margin: auto;
	}
</style>
