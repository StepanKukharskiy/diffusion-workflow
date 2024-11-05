<script lang="ts">
	import { page } from '$app/stores';
	import { elements, referenceImageUrl, textColor, chatPanelMode } from './store';
	import { generateUUID, generateVideo, deleteBlock } from './utils';
	let { imageUrl = '', query = '', uuid = '' } = $props();

	console.log($elements);
	console.log('query: ' + query);

	function addElement(
		elements: any,
		type = 'text',
		query = '',
		generatedImageUrl = '',
		generatedVideoUrl = ''
	) {
		if (type === 'image') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				imageUrl: generatedImageUrl
			});
		} else if (type === 'video') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				refImageUrl: generatedImageUrl,
				videoUrl: generatedVideoUrl
			});
		}
		console.log(elements);
	}

	let isGenerating = $state(false),
		modelOption = $state('flux-schnell'),
		refImageUrl = $state(''),
		maskImageUrl = $state(''),
		generatedImageUrl = $state('');

	async function generateImage() {
		isGenerating = true;
		// if (maskImageUrl != '') {
		// 	modelOption = 'flux-dev-inpaint';
		// }
		console.log('query: ' + query);
		const message = await fetch(`/api/image-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: refImageUrl,
				maskUrl: maskImageUrl,
				prompt: query,
				model: modelOption,
				projectId: $page.params.projectId
			})
		});
		console.log(message);
		const messageObject = await message.json();
		generatedImageUrl = messageObject.imageUrl;
		console.log(`api response: ${messageObject}`);
		isGenerating = false;
		return generatedImageUrl;
	}
</script>

<div class="imageContainer">
	<img src={imageUrl} alt="generated file" />
	{#if !isGenerating}
		<details>
			<summary>Options</summary>
			<ul>
				{#if query != 'uploaded file'}
					<li>
						<button
							class="settingsButton"
							onclick={async () => {
								const url = await generateImage();
								imageUrl = url;
								// addElement($elements, 'image', query, url)
							}}>Retry generation</button
						>
					</li>
				{/if}
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							$referenceImageUrl = imageUrl
							$chatPanelMode = 'chat'
						}}>Discuss</button
					>
				</li>
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							$referenceImageUrl = imageUrl
							$chatPanelMode = 'image'
						}}>Create new image</button
					>
				</li>
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							isGenerating = true;
							const url = await generateVideo({
								refImageUrl: imageUrl,
								model: '25_frames_with_svd_xt',
								projectId: $page.params.projectId
							});
							isGenerating = false;
							addElement($elements, 'video', query, imageUrl, url);
							$elements = $elements;
						}}>Turn to video</button
					>
				</li>
				<li>
					<a href={imageUrl} download="image.png" target="_blank" class="settingsButton" style='padding: 2px 10px; color: #1a1a1a; text-decoration: none; display: block;'
						>Download</a
					>
				</li>
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							deleteBlock($elements, uuid)
							$elements = $elements;
						}}>Delete</button
					>
				</li>
			</ul>
		</details>
	{:else}
		<div style="display: flex; align-items: center;">
			<span class="warning"></span>
			<p style="margin-right: 10px;">Generating</p>
			<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
		</div>
	{/if}
</div>

<style>
	.imageContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	img {
		display: block;
		width: 100%;
		max-width: 600px;
		margin: auto;
	}
	details {
		border-bottom: 1px solid #1a1a1a20;
	}
</style>
