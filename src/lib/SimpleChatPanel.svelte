<script lang="ts">
	import { page } from '$app/stores';
	import { elements, user } from './store';
	import { generateUUID, updateCredits } from './utils';

	let textarea: any = $state(),
		isGenerating = $state(false),
		systemPrompt = $state('You are a helpful assistant'),
		query = $state(''),
		modelOption = $state('llama3.3-70b');

	function updateTextareaHeight() {
		textarea.style.height = `40px`;
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

	async function getResponse(data = { model: '', systemPrompt: '', query: '' }) {
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/ai/response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: data.model,
				systemPrompt: data.systemPrompt,
				query: data.query,
				previousAnswers: getContext($elements),
				projectId: $page.params.projectId
			})
		});
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGenerating = false;
		textarea.value = '';

		return generatedText;
	}

	function addElement(elements: any, type = 'text', query = '', answer = '', imageUrl = '') {
		if (type === 'text') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				answer: answer
			});
			elements = elements;
		}
		if (type === 'image'){
			elements.push({
			uuid: generateUUID(),
			type: type,
			query: query,
			imageUrl: imageUrl
		});
		}
		console.log(elements);
	}
</script>

<div class="chatPanelContainer">
	<textarea
		bind:this={textarea}
		oninput={(e: any) => {
			query = e.target.value;
			updateTextareaHeight();
		}}
		placeholder="Type questions or prompts for images, SVGs, videos, and 3d models."
	></textarea>
	{#if isGenerating}
		<div class="loader"></div>
	{:else}
		<button
			id="magicButton"
			class="primaryButton"
			disabled={query === '' ? true : false}
			onclick={async () => {
				const response = await getResponse({
					model: modelOption,
					systemPrompt: systemPrompt,
					query: query
				});
				addElement($elements, response.type, query, response.generatedText, response.imageUrl);
				$elements = $elements;
				updateTextareaHeight();
				$user.requests = await updateCredits('text', `${$page.url.origin}/api/user/update-credits`);
			}}
		>
			Go
		</button>
	{/if}
</div>

<style>
	.chatPanelContainer {
		width: 100%;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
	}
	textarea {
		border: none;
		border-radius: 0;
		border-bottom: 1px solid hsl(0, 0%, 90%);
		background: none;
		background-color: hsla(0, 0%, 0%, 0.05);
		color: hsl(0, 0%, 10%);
		font-size: 1rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		height: 40px;
		padding: 10px;
		margin: 0;
		margin-right: 10px;
		box-sizing: border-box;
		width: 100%;
	}
	#magicButton {
		width: 40px;
		height: 40px;
	}
</style>
