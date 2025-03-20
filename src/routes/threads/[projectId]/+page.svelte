<script lang="ts">
	import {
		textColor,
		bgColor,
		elements,
		filesLocalCopy,
		tutorialsPanelState,
		appsPanelState,
		width,
		user,
		isSavingThread,
		templates,
		loginPanelState
	} from '$lib/store';
	import { arrayToJSModule, generateUUID, initialCodeFiles } from '$lib/utils';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	import TextInput from '$lib/TextInput.svelte';
	import FileInput from '$lib/FileInput.svelte';
	import VideoGeneration from '$lib/VideoGeneration.svelte';
	import ImageGeneration from '$lib/ImageGeneration.svelte';
	import Sketch from '$lib/SketchPaper.svelte';
	import CodeProject from '$lib/CodeProject.svelte';
	import NavPanel from '$lib/NavPanel.svelte';
	import TutorialsPanel from '$lib/TutorialsPanel.svelte';
	import AppsPanel from '$lib/AppsPanel.svelte';
	import ChatPanel from '$lib/ChatPanel.svelte';
	import SimpleText from '$lib/SimpleText.svelte';
	import SimpleImage from '$lib/SimpleImage.svelte';
	import SimpleVideo from '$lib/SimpleVideo.svelte';
	import SimpleCodeProject from '$lib/SimpleCodeProject.svelte';
	import SimpleSketch from '$lib/SimpleSketch.svelte';
	import Simple3dViewer from '$lib/Simple3dViewer.svelte';
	import SimpleChatPanel from '$lib/SimpleChatPanel.svelte';
	import SimpleP5Sketch from '$lib/SimpleP5Sketch.svelte';
	import SimpleMap from '$lib/SimpleMap.svelte';

	let isCreateOptionsVisible = $state(false);
	let createButton: any;
	let layout = $state('container-block');

	let { data } = $props();
	let name: string = $state(data.name);
	let id: string = $state(data.id);
	let showOptions = $state(false);

	if (data.user != undefined && data.createdBy === data.user.id) {
		showOptions = true;
	}
	if (data.user != undefined) {
		$user = data.user;
	}
	if (data.data != null) {
		$elements = data.data;
	} else {
		$elements = [];
	}

	console.log(data);

	function addElement(elements: any = [], type = 'text') {
		if (type === 'code') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				files: initialCodeFiles,
				run: true
			});
		} else {
			elements.push({
				uuid: generateUUID(),
				type: type,
				systemPrompt: '',
				query: ''
			});
		}
	}

	function addSketch(elements: any = []) {
		elements.push({
			uuid: generateUUID(),
			type: 'sketch',
			imageUrl: ''
		});
	}

	function scrollToCreateButton() {
		createButton.scrollIntoView({ behavior: 'smooth' });
	}

	function setLayout() {
		layout === 'container-block' ? (layout = 'container-grid') : (layout = 'container-block');
		console.log(layout);
	}

	async function saveThread(elements: any) {
		try {
			$isSavingThread = true;
			const formData = new FormData();
			formData.append('name', name);
			formData.append('id', id);
			// formData.append('data', JSON.stringify(elements));

			// Convert elements to JSON and create a Blob
			const jsonData = JSON.stringify(elements, null, 2);
			const blob = new Blob([jsonData], { type: 'text/plain' });
			formData.append('dataFile', blob, 'data.txt');

			//console.log(`saving: ${formData}`);
			const response = await fetch('/api/threads/save', {
				method: 'POST',
				body: formData,
				signal: AbortSignal.timeout(180000)
			});
			const responseData = await response.json();
			$isSavingThread = false;
			// console.log(responseData);
		} catch (err) {
			console.log(err);
			$isSavingThread = false;
		}
	}

	let discussionWidth: any = $state('400px');
	let saveTimeout: any = $state();

	elements.subscribe(() => {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			if (browser && showOptions) {
				await saveThread($elements);
			}
		}, 10000);
	});

	$effect(() => {
		if ($width > 700) {
			if ($tutorialsPanelState || $appsPanelState) {
				discussionWidth = 'calc(100% - 400px)';
			} else {
				discussionWidth = '100%';
			}
		}
	});
</script>

{#if $width > 0 && data}
	{#if showOptions}
		<NavPanel />
	{/if}

	<div class="conversationAndTutorialsContainer">
		<div class="container" style="width: {discussionWidth}">
			<h1 style="margin-top: 80px;">{name}</h1>

			<div class={layout}>
				{#each $elements as element}
					{#if element.type === 'text'}
						<SimpleText
							query={element.query}
							answer={element.answer}
							uuid={element.uuid}
							options={showOptions}
						/>
					{:else if element.type === 'file'}
						<FileInput uuid={element.uuid} />
					{:else if element.type === 'video' || element.type === 'video-interpolation'}
						<SimpleVideo videoUrl={element.videoUrl} uuid={element.uuid} options={showOptions} />
					{:else if element.type === 'imageGeneration'}
						<SimpleImage
							imageUrl={element.imageUrl}
							query={element.query}
							uuid={element.uuid}
							options={showOptions}
						/>
					{:else if element.type === 'image'}
						<SimpleImage
							imageUrl={element.imageUrl}
							query={element.query}
							uuid={element.uuid}
							options={showOptions}
						/>
					{:else if element.type === 'sketch'}
						<SimpleP5Sketch uuid={element.uuid} imageUrl={element.imageUrl} options={showOptions} />
					{:else if element.type === 'code'}
						<SimpleCodeProject
							files={element.files}
							uuid={element.uuid}
							name={element.name}
							id={element.id}
							options={showOptions}
						/>
					{:else if element.type === '3dViewer' || element.type === 'model'}
						<Simple3dViewer modelUrl={element.modelUrl} uuid={element.uuid} options={showOptions} />
					{:else if element.type === 'map'}
						<SimpleMap uuid={element.uuid} options={showOptions} />
						{/if}
				{/each}

				{#if showOptions && $elements.length < 55}
					<div
						class="descriptionButton"
						style="width: 100%; max-width: 800px; display: flex; flex-direction: column; flex-wrap: wrap;"
					>
						<p style="margin: 0;">
							Continue with a prompt, upload an image or .glb file, click 'Tips' for more.
						</p>
						<ul>
							<li>For images, start with 'An image of'.</li>
							<li>Use reference images to control the composition.</li>
							<li>For videos, start with 'A video of'.</li>
							<li>For 3D models, provide a reference image and type 'Make this a 3D model'.</li>
						</ul>
						<p style="margin-top: 0;">Or:</p>
						<div
							style="width: 100%; max-width: 800px; display: flex; align-items: center; flex-wrap: wrap;"
						>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									addSketch($elements);
								}}>Add a sketch</button
							>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									$templates = true;
								}}>Add a code template</button
							>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									addElement($elements, 'map');
									$elements = $elements
								}}>Add a map</button
							>
						</div>
					</div>
				{/if}

				{#if showOptions && $elements.length >= 55}
					<div
						class="descriptionButton"
						style="width: 100%; max-width: 800px; display: flex; align-items: center; flex-wrap: wrap;"
					>
						<span class="warning"></span>Thread gets too long. Consider starting a new one.
					</div>
				{/if}
			</div>

			{#if showOptions && $elements.length < 55}
				<div
					style="width: calc({discussionWidth} - 20px); position: fixed; bottom: 0px; display: flex; justify-content: center; align-items: center; flex-direction: column;"
				>
					<SimpleChatPanel />
				</div>
			{/if}
		</div>

		{#if $tutorialsPanelState}
			<div>
				<TutorialsPanel />
			</div>
		{/if}

		{#if $appsPanelState}
			<div>
				<AppsPanel />
			</div>
		{/if}
	</div>
{:else}
	<div
		style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;"
	>
		<div class="loader"></div>
	</div>
{/if}

<style>
	.conversationAndTutorialsContainer {
		display: flex;
	}
	.container-block {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}
	.container {
		width: 100%;
		max-height: calc(100vh - 20px);
		padding: 15px;
		/* padding-right: 20px; */
		padding-bottom: 250px;
		box-sizing: border-box;
		overflow-y: scroll;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.container-grid {
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;

		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.createButton {
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-radius: 10px;
	}
	.createOptionsContainer {
		width: 100%;
	}
	.createOptionsMenu {
		background: none;
		border: none;
	}
	.discussionNav {
		position: fixed;
		bottom: 0px;
		left: 0px;
		min-height: 40px;
		width: calc(100% - 20px);
		box-sizing: border-box;
		border: 1px solid #f9f9f9;
		border-radius: 25px;
		background: #fdfdfd;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		padding: 0 20px;
		margin: 10px;
		box-shadow: 0 0 10px rgba(152, 152, 152, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5;
	}
</style>
