<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	let { videoUrl = '', uuid = '' } = $props();
</script>

<div class="videoContainer">
	<video controls class="generatedVideo">
		<source src={videoUrl} type="video/mp4" />
		<track kind="captions" />
	</video>
	<details>
		<summary>Options</summary>
		<div class="optionsContainer">
			<ul>
				<li>
					<a
						href={videoUrl}
						download="video.mp4"
						target="_blank"
						class="downloadButton"
						style="padding: 2px 10px; color: #1a1a1a; text-decoration: none; margin: 10px 0; display: block;"
						>Download</a
					>
				</li>
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							deleteBlock($elements, uuid);
							$elements = $elements;
						}}>Delete</button
					>
				</li>
			</ul>
		</div>
	</details>
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
