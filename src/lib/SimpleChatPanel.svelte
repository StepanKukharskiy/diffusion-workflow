<script lang="ts">
	import { page } from '$app/stores';
	import SimpleManual from './SimpleManual.svelte';
	import SimpleTextCard from './SimpleTextCard.svelte';
	import {
		width,
		elements,
		user,
		referenceImageUrl,
		maskImageUrl,
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

	let textarea: HTMLTextAreaElement,
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
				referenceImage: $referenceImageUrl,
				maskImage: $maskImageUrl
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
				answer: answer,
				model: $chatModel
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
		} else if (query.toLowerCase() === 'tutorials') {
			$tutorials = true;
		} else if (query.toLowerCase() === 'templates') {
			$templates = true;
		} else if (query.toLowerCase() === 'apps') {
			$apps = true;
		} else {
			$manual = false;
			$apps = false;
			$templates = false;
			$tutorials = false;
		}
	}

	onMount(() => {
		textarea = document.getElementById('textarea');
		console.log(textarea.style.height);
		textarea.style.height = '40px';
		//updateTextareaHeight();
	});

	async function handleSubmit() {
    if (!query.trim()) return;
    const response = await getResponse({
      model: $chatModel,
      systemPrompt: systemPrompt,
      query
    });
    addElement($elements, response.type, query, response.generatedText, response.url);
    // force Svelte reactivity on elements:
    $elements = $elements;
    updateTextareaHeight();
    user.requests = await updateCredits(
      response.type,
      `${$page.url.origin}/api/user/update-credits`
    );
  }

  // Intercept Enter in the textarea:
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // don’t insert newline
      handleSubmit();
    }
    // if Shift+Enter, we do nothing special → newline is inserted
  }

  // Keep your on:input logic the same but extracted:
  function handleInput(e: InputEvent) {
    query = (e.target as HTMLTextAreaElement).value;

    triggerCommands();

    if (query.length > 0) {
      suggestions = commands.filter(cmd =>
        cmd.startsWith(query.toLowerCase())
      );
      showHintPanel = suggestions.length > 0;
    } else {
      showHintPanel = false;
    }

    updateTextareaHeight();
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
	<div class='inputArea'>
	<button
		id="tipsButton"
		class="secondaryButton"
		onclick={() => {
			if (textarea === undefined) {
				textarea = document.getElementById('textarea');
			}
			$manual = true;
		}}
		>Tips &nbsp;<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 17 16"
			fill="none"
			stroke="currentColor"
		>
			<path
				d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z"
			/>
		</svg></button
	>
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
	{#if $maskImageUrl}
		<button
			onclick={() => {
				$maskImageUrl = '';
			}}
			style="border: none; padding: 0; margin: 0 10px 0 0; width: 40px; height: 40px; background: none;"
		>
			<img
				src={$maskImageUrl}
				alt="reference"
				style="width: 40px; height: 40px; border-radius: 10px; margin-right: 10px;"
			/>
		</button>
	{/if}
	<textarea
		id="textarea"
		onkeydown={handleKeydown}
		oninput={(e: any) => {
			handleInput(e)
		}}
		placeholder={$referenceImageUrl
			? 'Type questions or prompts for images, videos, and 3d models using the reference image.'
			: `Type "?" for manual. Type questions or prompts for images, SVGs, videos, and 3d models.`}
	></textarea>
	<!-- <textarea
    id="textarea"
    bind:this={textarea}
    oninput={handleInput}
    onkeydown={handleKeydown}
    placeholder={$referenceImageUrl
      ? 'Type questions or prompts for images…'
      : `Type "?" for manual…`}
  ></textarea> -->
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
			onclick={handleSubmit}
		>
			Go
		</button>
	{/if}
</div>

<!-- <div class="suggestions">
	<p style='margin: 0;'>Start with:</p>
	<button class="tertiaryButton" style='padding-bottom: 0;' onclick={()=>{textarea.value = query = 'How do I'}}>How do I...</button>
	<button class="tertiaryButton" style='padding-bottom: 0;' onclick={()=>{textarea.value = query = 'An image of'}}>An image of...</button>
	<button class="tertiaryButton" style='padding-bottom: 0;' onclick={()=>{textarea.value = query = 'A video of'}}>A video of...</button>
	{#if $referenceImageUrl === ''}
		<button class="tertiaryButton" style='padding-bottom: 0;' onclick={()=>{textarea.value = query = 'An icon for'}}>An icon for...</button>
	{:else}
		<button class="tertiaryButton" style='padding-bottom: 0;' onclick={()=>{textarea.value = query = 'Make it a 3D model'}}>Make it a 3D model</button>
	{/if}
</div> -->
{#if $width > 700}
<div class='hint'><p>Use <span>Enter</span> to submit, <span>Shift + Enter</span> for a new line</p></div>
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
		flex-direction: column;
		
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
	}
	.inputArea {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: flex-end;
	}
	.hint{
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: end;
		align-items: flex-end;
		flex-wrap: wrap;
		padding: 10px 0 0 0;
		box-sizing: border-box;
	}
	.hint p{
		align-self: end;
		font-size: 0.9rem;
		margin: 0;
		box-sizing: border-box;
	}
	.hint span{
		font-weight: bold;
		box-sizing: border-box;
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
	#tipsButton {
		padding: 5px;
		position: absolute;
		border-radius: 10px 10px 0 0;
		border-bottom: none;
		right: 10px;
		top: -34px;
		box-sizing: border-box;
		z-index: -1;
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
