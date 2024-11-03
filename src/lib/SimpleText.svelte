<script lang="ts">
	import { page } from '$app/stores';
	import { elements, textColor } from './store';
	import StyledModelAnswer from './StyledModelAnswer.svelte';
	import { deleteBlock, generateUUID } from './utils';

	let { query = '', answer = '', uuid = '' } = $props();
	console.log(query);

	function addElement(elements: any, type = 'text', query = '', generatedImageUrl = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			imageUrl: generatedImageUrl
		});
		console.log(elements);
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
		const message = await fetch(`/api/image-generation`, {
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
		console.log(message);
		const messageObject = await message.json();
		generatedImageUrl = messageObject.imageUrl;
		console.log(`api response: ${messageObject}`);
		isGeneratingImage = false;
		return generatedImageUrl;
	}
</script>

<div class="textContainer">
	<h4 class="query">{query}</h4>
	<StyledModelAnswer htmlContent={answer} />
	{#if !isGeneratingImage}
		<details>
			<summary>Options</summary>
			<ul>
				<li>
					<button
						class="settingsButton"
						onclick={async () => {
							const url = await generateImage();
							addElement($elements, 'image', answer, url);
							$elements = $elements;
						}}>Create an image with this text</button
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
			<p style="margin-right: 10px;">Generating image</p>
			<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
		</div>
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
</style>
