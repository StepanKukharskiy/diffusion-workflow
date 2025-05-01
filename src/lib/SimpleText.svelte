<script lang="ts">
	import { page } from '$app/stores';
	import { elements, textColor, user } from './store';
	import StyledModelAnswer from './StyledModelAnswer.svelte';
	import { deleteBlock, generateUUID, updateCredits } from './utils';

	let { query = '', answer = '', model = '', uuid = '', options = false } = $props();

	function addElement(elements: any, type = 'text', query = '', generatedImageUrl = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			imageUrl: generatedImageUrl
		});
	}

	let isGeneratingImage = $state(false),
		modelOption = $state('flux-schnell'),
		refImageUrl = $state(''),
		maskImageUrl = $state(''),
		generatedImageUrl = $state('');

	async function generateImage() {
		isGeneratingImage = true;
		// if (maskImageUrl != '') {
		// 	modelOption = 'flux-dev-inpaint';
		// }
		const message = await fetch(`${$page.url.origin}/api/image-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: refImageUrl,
				maskUrl: maskImageUrl,
				prompt: answer,
				model: modelOption,
				projectId: $page.params.projectId
			})
		});
		const messageObject = await message.json();
		generatedImageUrl = messageObject.imageUrl;
		isGeneratingImage = false;
		return generatedImageUrl;
	}
</script>

<div class="textContainer">
	<h4 class="query">{query}</h4>
	
	<StyledModelAnswer htmlContent={answer} />
	
	{#if options}
		{#if !isGeneratingImage}
			<div style="display: flex; flex-wrap: wrap;">
				{#if model}
				<span>{model}</span>
				{/if}
				<!-- <button
					class="tertiaryButton"
					onclick={async () => {
						const url = await generateImage();
						addElement($elements, 'image', answer, url);
						$elements = $elements;
						$user.requests = await updateCredits(
							'image',
							`${$page.url.origin}/api/user/update-credits`
						);
					}}>Create an image with this text</button
				> -->
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
				<p style="margin-right: 10px;">Generating image</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.textContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	.query {
		/* background: #1a1a1a20; */
		padding: 10px 0;
		box-sizing: border-box;
		border-radius: 10px;
	}
	details {
		border-bottom: 1px solid #1a1a1a20;
	}
	span{
		font-size: 1rem;
		padding: 10px;
		border-radius: 10px;
		background-color: hsl(0, 0%, 93%);
	}
</style>
