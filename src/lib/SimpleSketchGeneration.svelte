<script lang="ts">
	import { textColor, elements, referenceImageUrl } from '$lib/store';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { generateUUID } from './utils';

	let isGeneratingSketch = $state(false),
		systemPromptTextarea = $state(),
		systemPrompt = $state('You are a helpful assistant'),
		queryTextarea: any,
		query = $state(''),
		responseText = $state(),
		modelOption = $state('llama3.1-70b'),
		answers: any = $state([]),
		queries: any = $state([]);

	function addElement(elements: any, type = 'text', query = '', shapes = []) {
		elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			shapes: shapes
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

	async function generateShapes(data = { model: '', systemPrompt: '', query: '' }) {
		isGeneratingSketch = true;
		queries.push(query);
		console.log(data);
		console.log(codeProjectUuid);
		let message;

		message = await fetch(`${$page.url.origin}/api/sketch-generation`, {
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

		const messageObject = await message.json();
		
		// const startIndex = messageObject.indexOf('[');
		// const endIndex = messageObject.indexOf(']');
		// const trimmedData = messageObject.substring(startIndex, endIndex + 1);
		console.log(messageObject.shapes);
		const generatedText = JSON.parse(messageObject.shapes);
		console.log(generatedText)
		isGeneratingSketch = false;
		// answers.push(generatedText.generatedText);
		//console.log(answers);
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
		updateTextareaHeight(queryTextarea);
	}}
	id="query"
	style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor}); margin-top: 0; margin-bottom: 5px;"
	placeholder={'Describe your sketch here'}
></textarea>
{#if !isGeneratingSketch}
	{#if query === ''}
		<div style="display: flex; align-items: center;" transition:slide>
			<span class="warning"></span>
			<p>Please, provide a sketch description or click 'Create' to continue</p>
		</div>
	{/if}
	<div class="generationSetupsContainer">
		<button
			class="generationControlsButton"
			onclick={async () => {
				if(query != ''){
				isGeneratingSketch = true;
				const response = await generateShapes({
					model: modelOption,
					systemPrompt: systemPrompt,
					query: query
				});
				addElement($elements, 'sketch', query, response);}
				else{
					addElement($elements, 'sketch', query, []);
				}
				$elements = $elements;
				updateTextareaHeight(queryTextarea);
			}}>Create</button
		>
	</div>
{:else}
	<div style="display: flex; align-items: center;">
		<span class="warning"></span>
		<p style="margin-right: 10px;">Generating sketch</p>
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
