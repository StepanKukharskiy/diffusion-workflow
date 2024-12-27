<script lang="ts">
	import { textColor, elements, referenceImageUrl, user } from '$lib/store';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { generateUUID, updateCredits } from './utils';

	let isGeneratingText = $state(false),
		isFirstGeneration = $state(true),
		systemPromptTextarea = $state(),
		systemPrompt = $state('You are a helpful assistant'),
		queryTextarea: any,
		query = $state(''),
		responseText = $state(),
		modelOption = $state('llama3.3-70b'),
		answers: any = $state([]),
		queries: any = $state([]);

	function addElement(elements: any, type = 'text', query = '', answer = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			answer: answer
		});
		elements = elements;
		console.log(elements);
	}

	function updateTextareaHeight(textarea: any) {
		textarea.style.height = `auto`;
		textarea.style.height = `${textarea.scrollHeight}px`;
		if (textarea.scrollHeight > 200) {
			textarea.style.height = `200px`;
		}
	}

	function getContext(elements: any) {
		let context = [];
		for (let element of elements) {
			if (element.type === 'text') {
				context.push(element.answer);
			}
			if (element.type === 'code') {
				for (let file of element.files) {
					context.push(
						JSON.stringify({
							name: file.fileName,
							data: file.fileData
						})
					);
				}
			}
		}
		return context;
	}

	async function generateText(data = { model: '', systemPrompt: '', query: '' }) {
		isGeneratingText = true;
		queries.push(query);
		console.log(data);
		console.log(codeProjectUuid);
		let message;
		if ($referenceImageUrl != '') {
			console.log('using vision model');
			message = await fetch(`${$page.url.origin}/api/image-vision`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: data.model,
					systemPrompt: data.systemPrompt,
					query: data.query,
					previousAnswers: getContext($elements),
					imageUrl: $referenceImageUrl
				})
			});

			console.log(message);
		} else if (codeProjectUuid != '') {
			console.log(`this is code uuid: ${codeProjectUuid}`);
			message = await fetch(`${$page.url.origin}/api/text-generation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: data.model,
					systemPrompt: data.systemPrompt,
					query: data.query,
					// query: data.query + ` Here is my code: ${getCodeProjectFilesData(codeProjectUuid)}`,
					previousAnswers: getContext($elements)
				})
			});

			console.log(message);
		} else {
			message = await fetch(`${$page.url.origin}/api/text-generation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: data.model,
					systemPrompt: data.systemPrompt,
					query: data.query,
					previousAnswers: getContext($elements),
					imageUrl: imageUrl
				})
			});
		}
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGeneratingText = false;
		// answers.push(generatedText.generatedText);
		// console.log(answers);
		isFirstGeneration = false;
		queryTextarea.value = '';

		return generatedText;
	}

	

	let imageUrl = '',
		codeProjectUuid = '';
</script>

<!-- <div class='colorLine' style='background: #A1C9F290;'></div> -->
<textarea
	bind:this={queryTextarea}
	oninput={(e) => {
		query = e.target.value;
		if (queryTextarea) {
			updateTextareaHeight(queryTextarea);
		}
	}}
	id="query"
	style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor}); margin-top: 0; margin-bottom: 5px;"
	placeholder={isFirstGeneration ? 'Add a question or a task here' : 'Ask a follow-up question'}
></textarea>
{#if !isGeneratingText}
	{#if query === ''}
		<div style="display: flex; align-items: center;" transition:slide>
			<span class="warning"></span>
			<p>Please, provide a task or a question to continue</p>
		</div>
	{/if}
	<div class="generationSetupsContainer">
		{#if $referenceImageUrl != ''}
			<button
				onclick={() => {
					$referenceImageUrl = '';
				}}
				style="background: none;"
			>
				<img src={$referenceImageUrl} alt="composition reference" height="40" />
			</button>
		{/if}
		<button
			class="generationControlsButton"
			disabled={query === '' ? true : false}
			onclick={async () => {
				isGeneratingText = true;
				const response = await generateText({
					model: modelOption,
					systemPrompt: systemPrompt,
					query: query
				});
				addElement($elements, 'text', query, response.generatedText);
				$elements = $elements;
				updateTextareaHeight(queryTextarea);
				$user.requests = await updateCredits('text', `${$page.url.origin}/api/user/update-credits`)
			}}>Send</button
		>
	</div>
{:else}
	<div style="display: flex; align-items: center;">
		<span class="warning"></span>
		<p style="margin-right: 10px;">Generating response</p>
		<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
	</div>
{/if}

<style>
	.generationSetupsContainer {
		display: flex;
		align-items: center;
		height: 40px;
		margin-top: 5px;
	}
	.generationSetupsContainer button {
		height: 40px;
		border: none;
		margin-right: 10px;
		/* background: none; */
	}
</style>
