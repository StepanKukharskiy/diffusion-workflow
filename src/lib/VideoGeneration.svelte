<script lang="ts">
	import { textColor, bgColor } from './store';
	import { page } from '$app/stores';

	let { refImageUrl = '' } = $props();

	let generatedVideo: any,
		modelOption = $state('runway-gen-3'),
		isGeneratingVideo = $state(false),
		isSettingsVisible = $state(false),
		generatedVideoUrl = $state('');

	async function generateVideo(data = { refImageUrl: '', model: '' }) {
		generatedVideoUrl = '';
		const message = await fetch(`/api/video-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: data.refImageUrl,
				model: data.model,
				projectId: $page.params.projectId
			})
		});
		const messageObject = await message.json();
		generatedVideoUrl = messageObject.videoUrl;
		console.log(messageObject);
		isGeneratingVideo = false;
		return generatedVideoUrl;
	}

	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}
</script>

<div class="elementContainer">
	<div class="colorLine" style="background: #7CFFFB;">
		<h3 style='color: hsl({$textColor})'>Video Generation</h3>
	</div>
	<div class="imageAndControlsContainer">
		{#if generatedVideoUrl}
			<video controls class="generatedVideo">
				<source src={generatedVideoUrl} type="video/mp4" />
				<track kind="captions" />
			</video>
		{:else}
			<div class="generatedVideoMockup" style="border: 1px solid hsla({$textColor}, 20%);">
				<img src={refImageUrl} alt="initial data" />
			</div>
		{/if}

		{#if isGeneratingVideo}
			<div style="display: flex; align-items: center;">
				<span class="warning"></span>
				<p style='margin-right: 10px;'>Generating video</p>
                <div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>

        {:else}

		

		{#if isSettingsVisible}
			<div class="item">
				<label for="systemPrompt">Model</label>
				<select
					style="color: hsl({$textColor}); background: hsla({$textColor}, 10%);"
					bind:value={modelOption}
				>
					<option value="14_frames_with_svd">14_frames_with_svd</option>
					<option value="25_frames_with_svd_xt">25_frames_with_svd_xt</option>
					<option value="runway-gen-3">runway-gen-3</option>
				</select>
			</div>
		{/if}
		<div class="controlsMenu">
			<button
				class="generationControlsButton"
				onclick={async () => {
					isGeneratingVideo = true;
					const url = await generateVideo({
						refImageUrl: refImageUrl,
						model: modelOption
					});
				}}
			>
				{#if isGeneratingVideo}
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				{:else}
					Generate video
				{/if}
			</button>
			<button class="optionsButton" onclick={toggleSettings}>Settings</button>
		</div>
        {/if}
	</div>
</div>

<style>
	select {
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		padding: 5px;
		box-sizing: border-box;
		width: 100%;
		margin-top: 5px;
	}

	.imageAndControlsContainer {
		display: flex;
		flex-direction: column;
		margin-top: 5px;
		width: 100%;
		height: 100%;
	}
	.controlsMenu {
		display: flex;
		align-items: center;
	}
	.loader {
		width: 10px;
		height: 10px;
		margin: 0;
	}
	.generatedVideoMockup,
	.generatedVideo {
		width: 100%;
		/* height: 100%; */
		aspect-ratio: 16 / 9;
		/* margin-left: 5px; */
		box-sizing: border-box;
		border-radius: 10px;
		margin-bottom: 5px;
	}
	.generatedVideoMockup img {
		width: 100%;
		height: 100%;
		border-radius: 10px;
	}
</style>
