<script lang="ts">
	import { page } from '$app/stores';
	import SimpleManual from './SimpleManual.svelte';
	import SimpleTextCard from './SimpleTextCard.svelte';
	import {
		elements,
		user,
		referenceImageUrl,
		manual,
		tutorials,
		templates,
		apps,
		tutorialsPanelState,
		appsPanelState,
		chatModel,
		imageModel,
		imageCompositionReferenceModel
	} from './store';
	import { generateUUID, updateCredits } from './utils';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SimpleTutorials from './SimpleTutorials.svelte';
	import SimpleTemplates from './SimpleTemplates.svelte';
	import SimpleApps from './SimpleApps.svelte';

	let textarea: any = $state(),
		isGenerating = $state(false),
		systemPrompt = $state('You are a helpful assistant'),
		query = $state(''),
		modelOption = $state('llama3.3-70b'),
		fileInput: any = $state(),
		uploadingFile = $state(false);

	let showHintPanel = $state(false);
	let suggestions: string[] = $state([]); // New state variable for suggestions
	const commands: string[] = ['templates', 'tutorials', 'apps']; // List of commands

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
		console.log(`model: ${data.model}, ${$chatModel}`);
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/ai/response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: data.model,
				imageModel: $imageModel,
				imageCompositionReferenceModel: $imageCompositionReferenceModel,
				systemPrompt: data.systemPrompt,
				query: data.query,
				previousAnswers: getContext($elements),
				projectId: $page.params.projectId,
				referenceImage: $referenceImageUrl
			})
		});
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGenerating = false;
		textarea.value = '';

		return generatedText;
	}

	async function uploadFile(file: any, type: any) {
		uploadingFile = true;
		const formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('projectId', $page.params.projectId);

		try {
			let response;
			if (type === 'image') {
				response = await fetch(`${$page.url.origin}/api/save-image`, {
					method: 'POST',
					body: formData
				});
			} else {
				response = await fetch(`${$page.url.origin}/api/save-file`, {
					method: 'POST',
					body: formData
				});
			}

			if (!response.ok) {
				uploadingFile = false;
				console.error('Upload failed:', response.statusText);
			} else {
				const result = await response.json();
				const fileUrl = result.url;
				uploadingFile = false;
				return fileUrl;
			}
		} catch (error) {
			uploadingFile = false;
			console.error('Error during upload:', error);
		}
	}

	// Handle file input change
	async function handleFileInputChange(event: any) {
		if (event.target.files.length > 0) {
			const fileToUpload = event.target.files[0];
			const fileFormat = fileToUpload.name.split('.')[1];
			console.log(fileToUpload);
			console.log(fileFormat);
			let type = 'image';
			if (fileFormat === 'glb') {
				type = 'model';
			}
			const fileUrl = await uploadFile(fileToUpload, type);
			const query = 'uploaded file';
			if (type === 'image') {
				addElement($elements, 'image', query, '', fileUrl);
			} else {
				addElement($elements, 'model', query, '', fileUrl);
			}
			$elements = $elements;
		}
	}

	function addElement(elements: any, type = 'text', query = '', answer = '', url = '') {
		if (type === 'text') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				answer: answer
			});
			elements = elements;
		}
		if (type === 'image') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				imageUrl: url,
				referenceImageUrl: $referenceImageUrl
			});
		}
		if (type === 'video' || type === 'video-interpolation') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				videoUrl: url
			});
		}
		if (type === 'model') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				modelUrl: url
			});
		}
		console.log(elements);
	}

	function triggerCommands() {
		if (query === '?') {
			$manual = true;
		} else if (query === 'tutorials') {
			$tutorials = true;
		} else if (query === 'templates') {
			$templates = true;
		} else if (query === 'apps') {
			$apps = true;
		} else {
			$manual = false;
			$apps = false;
			$templates = false;
			$tutorials = false;
		}
	}
</script>

{#if $manual}
	<SimpleManual textarea={textarea.style.height} />
{/if}

{#if $tutorials}
	<SimpleTutorials textarea={textarea.style.height} />
{/if}

{#if $templates}
	<SimpleTemplates textarea={textarea.style.height} />
{/if}

{#if $apps}
	<SimpleApps textarea={textarea.style.height} />
{/if}

<div class="chatPanelContainer">
	{#if $referenceImageUrl}
		<button
			onclick={() => {
				$referenceImageUrl = '';
			}}
			style="border: none; padding: 0; margin: 0 10px 0 0; width: 40px; height: 40px; background: none;"
		>
			<img
				src={$referenceImageUrl}
				alt="reference"
				style="width: 40px; height: 40px; border-radius: 10px; margin-right: 10px;"
			/>
		</button>
	{/if}
	<textarea
		id="textarea"
		oninput={(e: any) => {
			query = e.target.value;
			if (textarea === undefined) {
				textarea = document.getElementById('textarea');
			}
			triggerCommands();
			// Filter commands based on the current query
			if (query.length > 0) {
				suggestions = commands.filter((command) => command.startsWith(query));
				showHintPanel = suggestions.length > 0;
			} else {
				showHintPanel = false;
			}
			updateTextareaHeight();
		}}
		placeholder={$referenceImageUrl
			? 'Type questions or prompts for images, videos, and 3d models using the reference image.'
			: `Type "?" for manual. Type questions or prompts for images, SVGs, videos, and 3d models.`}
	></textarea>
	{#if isGenerating || uploadingFile}
		<div
			style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
		>
			<div class="loader"></div>
		</div>
	{:else}
		<button
			class="tertiaryButton"
			style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
			aria-label="Upload File"
			disabled={false}
			onclick={() => {
				fileInput.click();
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a4 4 0 0 1 5.66 5.66l-8.48 8.48a2 2 0 0 1-2.83-2.83l7.78-7.78"
				/>
			</svg>
		</button>
		<input
			type="file"
			accept="image/*, model/gltf-binary, .glb, application/octet-stream"
			bind:this={fileInput}
			onchange={handleFileInputChange}
			style="display: none;"
		/>
		<button
			id="magicButton"
			class="primaryButton"
			disabled={query === '' ? true : false}
			onclick={async () => {
				console.log($chatModel);
				const response = await getResponse({
					model: $chatModel,
					systemPrompt: systemPrompt,
					query: query
				});
				addElement($elements, response.type, query, response.generatedText, response.url);
				$elements = $elements;
				updateTextareaHeight();
				$user.requests = await updateCredits(
					response.type,
					`${$page.url.origin}/api/user/update-credits`
				);
			}}
		>
			Go
		</button>
	{/if}
</div>

{#if showHintPanel}
	<div class="hintPanel" style="bottom: calc({textarea.style.height} + 40px);" transition:slide>
		<div class="hintsWrapper">
			{#each suggestions as suggestion}
				<button
					class="tertiaryButton"
					onclick={() => {
						query = suggestion;
						textarea.value = suggestion;
						showHintPanel = false;
						triggerCommands();
					}}
				>
					{suggestion}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.chatPanelContainer {
		width: 100%;
		max-width: 800px;
		margin: 10px;
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
		font-size: 1.2rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		height: 40px;
		padding: 10px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
	}
	#magicButton {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.hintPanel {
		position: absolute;
		width: 100%;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		z-index: 10;
	}
	.hintsWrapper {
		background-color: hsl(0, 0%, 95%);
	}
</style>
