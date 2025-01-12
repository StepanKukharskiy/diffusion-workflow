<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { elements, referenceImageUrl, textColor, chatPanelMode, user } from './store';
	import { generateUUID, generateVideo, deleteBlock, generateModel, updateCredits } from './utils';
	let { imageUrl = '', query = '', uuid = '' } = $props();

	console.log($elements);
	console.log('query: ' + query);

	function addElement(
		elements: any,
		type = 'text',
		query = '',
		generatedImageUrl = '',
		generatedVideoUrl = '',
		generatedModelUrl = ''
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
		} else if (type === '3dViewer') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				refImageUrl: generatedImageUrl,
				modelUrl: generatedModelUrl
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
		if (maskImageUrl != '') {
			modelOption = 'flux-dev-inpaint';
		}
		if ($referenceImageUrl != '') {
			// modelOption = 'sdxl-controlnet-canny';
			modelOption = 'flux-dev-controlnet-depth';
		}
		console.log('query: ' + query);
		const message = await fetch(`${$page.url.origin}/api/image-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: $referenceImageUrl,
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
		<div style="display: flex; flex-wrap: wrap;">
			<div style="display: flex; flex-direction: column; width: 100%;">
				<label for="prompt-{uuid}" style="margin-top: 10px;">Description</label>
				<button
					class="descriptionButton"
					id="prompt-{uuid}"
					onclick={(e: any) => {
						// copy the textarea content to the clipboard
						navigator.clipboard
							.writeText(e.target.value)
							.then(() => {
								console.log('text copied to clipboard');
							})
							.catch((err: any) => {
								console.error('could not copy text: ', err);
							});
					}}>{query}</button
				>
				<label for="prompt-{uuid}" style="margin-top: 10px;">File url</label>
				<button
					class="descriptionButton"
					id="prompt-{uuid}"
					onclick={(e: any) => {
						// copy the textarea content to the clipboard
						navigator.clipboard
							.writeText(e.target.value)
							.then(() => {
								console.log('text copied to clipboard');
							})
							.catch((err: any) => {
								console.error('could not copy text: ', err);
							});
					}}
					>{`${$page.url.origin}/api/get-file/${$page.params.projectId}/${imageUrl.split('/')[7]}`}</button
				>
			</div>

			<!-- {#if query != 'uploaded file'}
						<button
							class="tertiaryButton"
							onclick={async () => {
								const url = await generateImage();
								imageUrl = url;
								for (let element of $elements) {
									if (element.uuid === uuid) {
										element.imageUrl = url;
									}
								}
								$user.requests = await updateCredits('image', `${$page.url.origin}/api/user/update-credits`)
							}}>Retry generation</button
						>
				{/if} -->
			<button
				class="tertiaryButton"
				onclick={async () => {
					$referenceImageUrl = imageUrl;
					$chatPanelMode = 'chat';
				}}>Use as a reference image</button
			>
			<button
				onclick={() => {
					window.open(
						`${$page.url.origin}/api/get-file/${$page.params.projectId}/${imageUrl.split('/')[7]}`,
						'_blank'
					);
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
	.descriptionButton {
		margin-top: 10px;
		border: none;
		border-radius: 10px;
		padding: 10px;
		box-sizing: border-box;
		text-align: left;
		background: hsl(0, 0%, 95%);
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
	}
</style>
