<script lang="ts">
	import { page } from '$app/stores';
	import { textColor, elements, referenceImageUrl, user } from '$lib/store';
	import { slide } from 'svelte/transition';
	import { generateUUID, updateCredits} from './utils';

	let isGeneratingImage = $state(false),
		refImageUrl = '',
		maskImageUrl = '',
		isFirstGeneration = $state(true),
		systemPromptTextarea = $state(),
		systemPrompt = $state('You are a helpful assistant'),
		queryTextarea: any,
		query = $state(''),
		responseText = $state(),
		modelOption = $state('flux-schnell'),
		generatedImageUrl = $state(''),
		isSettingsVisible = $state(false);

	function updateTextareaHeight(textarea: any) {
		textarea.style.height = `auto`;
		textarea.style.height = `${textarea.scrollHeight}px`;
		if (textarea.scrollHeight > 200) {
			textarea.style.height = `200px`;
		}
	}

	function addElement(elements: any, type = 'text', query = '', generatedImageUrl = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			imageUrl: generatedImageUrl,
			referenceImageUrl: $referenceImageUrl
		});
	}

	async function generateImage() {
		isGeneratingImage = true;
		if (maskImageUrl != '') {
			modelOption = 'flux-dev-inpaint';
		}
		if ($referenceImageUrl != '') {
			modelOption = 'sdxl-controlnet-canny';
		}
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
		isGeneratingImage = false;
		// $referenceImageUrl = '';
		return generatedImageUrl;
	}

</script>

<textarea
	bind:this={queryTextarea}
	oninput={(e) => {
		query = e.target.value;
		updateTextareaHeight(queryTextarea);
	}}
	id="query"
	style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor}); margin-top: 0; margin-bottom: 5px;"
	placeholder={isFirstGeneration
		? 'Add your description here'
		: 'Ask a follow-up question, add a task or a prompt'}
></textarea>
{#if !isGeneratingImage}
	{#if query === ''}
		<div style="display: flex; align-items: center;" transition:slide>
			<span class="warning"></span>
			<p>Please, provide an image description to continue</p>
		</div>
	{/if}
	<div class="generationSetupsContainer">
		{#if $referenceImageUrl != ''}
			<button
			style='background: none;'
				onclick={() => {
					$referenceImageUrl = '';
				}}
			>
				<img src={$referenceImageUrl} alt="composition reference" height="40" style='background: none;' />
			</button>
		{/if}
		<button
			class="generationControlsButton"
			disabled={query === '' ? true : false}
			onclick={async () => {
				isGeneratingImage = true;
				const response = await generateImage();
				addElement($elements, 'image', query, generatedImageUrl);
				$elements = $elements;
				updateTextareaHeight(queryTextarea);
				$user.requests = await updateCredits('image', `${$page.url.origin}/api/user/update-credits`)
			}}>Generate</button
		>
	</div>
{:else}
	<div style="display: flex; align-items: center;">
		<span class="warning"></span>
		<p style="margin-right: 10px;">Generating image</p>
		<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
	</div>
{/if}

<style>
	.generationSetupsContainer {
		display: flex;
		height: 40px;
		margin-top: 5px;
	}
	.generationSetupsContainer button {
		border: none;
		margin-right: 10px;
	}
</style>
