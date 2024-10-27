<script lang="ts">
	import { textColor, bgColor, elements } from '$lib/store';
	import StyledModelAnswer from './StyledModelAnswer.svelte';
	import { slide } from 'svelte/transition';

	let { imageUrl = '' } = $props();

	let isGeneratingText = $state(false),
		isFirstGeneration = $state(true),
		systemPromptTextarea = $state(),
		systemPrompt = $state('You are a helpful assistant'),
		queryTextarea: any,
		query = $state(''),
		responseText = $state(),
		modelOption = $state('llama3.1-70b'),
		answers: any = $state([]),
		queries: any = $state([]);
	let isSettingsVisible = $state(false);

	function updateTextareaHeight(textarea: any) {
		textarea.style.height = `auto`;
		textarea.style.height = `${textarea.scrollHeight}px`;
		if (textarea.scrollHeight > 200) {
			textarea.style.height = `200px`;
		}
	}

	async function generateText(data = { model: '', systemPrompt: '', query: '' }) {
		queries.push(query);
		console.log(data);
		let message;
		console.log(imageUrl);
		if (imageUrl === '') {
			message = await fetch(`/api/text-generation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: data.model,
					systemPrompt: data.systemPrompt,
					query: data.query,
					previousAnswers: answers.join(' '),
					imageUrl: imageUrl
				})
			});

			console.log(message);
		} else {
			message = await fetch(`/api/image-vision`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: data.model,
					systemPrompt: data.systemPrompt,
					query: data.query,
					previousAnswers: answers.join(' '),
					imageUrl: imageUrl
				})
			});
		}
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGeneratingText = false;
		answers.push(generatedText.generatedText);
		console.log(answers);
		isFirstGeneration = false;
		queryTextarea.value = '';

		return generatedText;
	}

	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}

	function addElement(
		elements: any = [],
		type = 'text',
		imageUrl = '',
		maskImageUrl = '',
		prompt = ''
	) {
		console.log(elements);
		console.log(prompt);
		elements.push({
			type: type,
			systemPrompt: '',
			query: '',
			imageUrl: imageUrl,
			maskImageUrl: maskImageUrl,
			prompt: prompt
		});

		console.log(elements);
	}
</script>

<div class="elementContainer">
	<details open>
		<summary>
			<div class="colorLine" style="background: #A1C9F290;"></div>
			{#if imageUrl != ''}
				<h3 style="margin-right: 10px; color: hsl({$textColor})">Image Discussion</h3>
				<img src={imageUrl} alt="data for vision model" width="30" />
			{:else}
				<h3 style="color: hsl({$textColor})">Chat</h3>
			{/if}
		</summary>
		<div class="textAndControlsContainer">
			<div class="generationControls">
				<div class="item">
					{#each answers as answer, i}
						<!-- <p>Q:</p> -->
						<p
							style="background: hsla({$textColor}, 10%); padding: 10px; border-radius: 10px; box-sizing: border-box;"
						>
							{queries[i]}
						</p>
						<!-- <p>A:</p> -->
						<StyledModelAnswer htmlContent={answer} />
					{/each}
				</div>

				<div class="item">
					<!-- <label for="query">Task, question, or prompt</label> -->
					<textarea
						bind:this={queryTextarea}
						oninput={(e) => {
							query = e.target.value;
							updateTextareaHeight(queryTextarea);
						}}
						id="query"
						style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor})"
						placeholder={isFirstGeneration
							? 'Add your task, question, or prompt here'
							: 'Ask a follow-up question, add a task or a prompt'}
					></textarea>
					{#if query === ''}
						<div style="display: flex; align-items: center;" transition:slide>
							<span class="warning"></span>
							<p>Please, provide a task, a question, or a prompt to continue</p>
						</div>
					{/if}
				</div>
				{#if isSettingsVisible === true}
					<div class="item">
						<label for="model">Model</label>
						<select
							id="model"
							name="model"
							style="color: hsl({$textColor}); background: hsla({$textColor}, 10%);"
							bind:value={modelOption}
							onchange={() => {
								console.log(modelOption);
							}}
						>
							<option value="llama3.1-8b">llama3.1-8b</option>
							<option value="llama3.1-70b">llama3.1-70b</option>
							<option value="llama3.1-405b">llama3.1-405b</option>
							<option value="mistral-7B-Instruct-v0.1">mistral-7B-Instruct-v0.1</option>
							<option value="mixtral-8x22B-Instruct-v0.1">mixtral-8x22B-Instruct-v0.1</option>
							<option value="Qwen2-72B-Instruct">Qwen2-72B-Instruct</option>
						</select>
					</div>
					<div class="item">
						<label for="systemPrompt">System prompt</label>
						<textarea
							bind:this={systemPromptTextarea}
							oninput={(e) => {
								systemPrompt = e.target.value;
								updateTextareaHeight(systemPromptTextarea);
							}}
							id="systemPrompt"
							style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor})"
							>{systemPrompt}</textarea
						>
					</div>
				{/if}
				{#if isGeneratingText}
					<div style="display: flex; align-items: center;">
						<span class="warning"></span>
						<p style="margin-right: 10px;">Generating response</p>
						<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
					</div>
				{:else}
					<div class="controlsMenu">
						<button
							class="generationControlsButton"
							onclick={async () => {
								isGeneratingText = true;
								const response = await generateText({
									model: modelOption,
									systemPrompt: systemPrompt,
									query: query
								});
								updateTextareaHeight(queryTextarea);
								// console.log(response);
								// responseText = response.generatedText;
								// updateTextareaHeight(responseText);
							}}
						>
							{#if isGeneratingText}
								<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
									<path
										d="M2 2 l0 10 10 0 M2 2 l20 10 -20 10 0 -7"
										stroke="hsl({$textColor})"
										stroke-width="2"
										fill="none"
										stroke-linecap="round"
									/>
								</svg>
							{/if}
						</button>
						<button
							class="optionsButton"
							disabled = {query === '' ? true : false}
							onclick={() => {
								addElement(
									$elements,
									'imageGeneration',
									imageUrl,
									'',
									answers.length > 0 ? answers[answers.length - 1] : query
								);
								$elements = $elements;
							}}>New Image</button
						>
						<button class="settingsButton" onclick={toggleSettings}>Settings</button>
						<!-- <button
					class="removeButton"
					onclick={() => {}}
				>
					Remove
				</button> -->
					</div>
				{/if}
			</div>
		</div>
	</details>
</div>

<style>
	/* h3 {
		margin: 0;
		font-weight: 300;
	} */

	.textAndControlsContainer {
		display: flex;
		margin-top: 5px;
		width: 100%;
		height: 100%;
	}
	.generationControls {
		width: 100%;
	}
	.item {
		height: fit-content;
		margin: 5px 0;
	}
	label {
		display: block;
		height: 20px;
	}
	select {
		width: 100%;
		max-width: 300px;
		border: none;
		border-radius: 10px;
		font-size: 1.2rem;
		padding: 5px;
		box-sizing: border-box;
	}

	.controlsMenu {
		display: flex;
		align-items: center;
	}

	/* .optionsButton {
		height: 40px;
		border: none;
		border-radius: 10px;
		background: none;
		box-sizing: border-box;
	} */
	/* .removeButton {
		background: none;
		border: none;
		box-sizing: border-box;
		border-radius: 10px;
		cursor: pointer;
	} */
	/* .optionsButton:hover{
		background: #1a1a1a10;
	} */
	.loader {
		width: 15px;
		height: 15px;
		margin: 0;
		border: 2px solid black;
		border-radius: 8px;
		box-sizing: border-box;
	}
</style>
