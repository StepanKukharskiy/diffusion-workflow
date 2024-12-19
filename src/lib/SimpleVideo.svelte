<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	import { page } from '$app/stores';
	let { videoUrl = '', uuid = '' } = $props();
</script>

<div class="videoContainer">
	<video controls class="generatedVideo">
		<source src={videoUrl} type="video/mp4" />
		<track kind="captions" />
	</video>

		<div style='display: flex; flex-wrap: wrap;'>
					<button 
						onclick={()=>{window.open(`${$page.url.origin}/api/get-file/${$page.params.projectId}/${videoUrl.split('/')[7]}`, '_blank')}}
						class="tertiaryButton"
						>Download</button
					>

					<button
						class="tertiaryButton"
						onclick={async () => {
							deleteBlock($elements, uuid);
							$elements = $elements;
						}}>Delete</button
					>

		</div>

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
	details {
		border-bottom: 1px solid #1a1a1a20;
	}
	.downloadButton {
		font-weight: 300;
		color: #1a1a1a;
		text-decoration: none;
	}
</style>
