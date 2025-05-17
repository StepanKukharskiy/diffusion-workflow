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
		loginPanelState,
		manual,
		apps,
		tutorials
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
	import SimpleCritique from '$lib/SimpleCritique.svelte';
	import SimpleP5SketchWithDrag from '$lib/SimpleP5SketchWithDrag.svelte';
	import SimpleManual from '$lib/SimpleManual.svelte';
	import SimpleTemplates from '$lib/SimpleTemplates.svelte';
	import SimpleApps from '$lib/SimpleApps.svelte';
	import SimpleTutorials from '$lib/SimpleTutorials.svelte';
	import SimpleResearch from '$lib/SimpleResearch.svelte';

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

			<!-- <SimpleP5SketchWithDrag uuid={2} options={true}/> -->

			<div class={layout}>
				{#each $elements as element}
					{#if element.type === 'text'}
						<SimpleText
							query={element.query}
							answer={element.answer}
							uuid={element.uuid}
							model={element.model}
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
						<!-- <SimpleP5Sketch uuid={element.uuid} imageUrl={element.imageUrl} options={showOptions} /> -->
						<SimpleP5SketchWithDrag
							uuid={element.uuid}
							imageUrl={element.imageUrl}
							options={showOptions}
						/>
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
					{:else if element.type === 'critique'}
						<SimpleCritique
							uuid={element.uuid}
							referenceImageUrl={element.referenceImageUrl}
							answer={element.answer}
							options={showOptions}
						/>
					{:else if element.type === 'research'}
						<SimpleResearch
							uuid={element.uuid}
							query={element.query}
							model={element.model}
							answer={element.answer}
							options={showOptions}
						/>
					{/if}
				{/each}

				{#if showOptions && $elements.length < 55}
					<!-- <div style="width: 100%; max-width: 800px; display: flex; flex-wrap: wrap;">
						<div
							class="descriptionButton"
							style="width: fit-content; max-width: 800px; display: flex; align-items: center; flex-wrap: wrap; margin-right: 10px;"
						>
							<svg
								version="1.1"
								id="Layer_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								width="30px"
								height="30px"
								x="0px"
								y="0px"
								viewBox="0 0 122.88 117.9"
								style="margin-right: 10px; enable-background:new 0 0 122.88 117.9"
								xml:space="preserve"
								><style type="text/css">
									.st0 {
										fill-rule: evenodd;
										clip-rule: evenodd;
									}
								</style><g
									><path
										class="st0"
										d="M45.66,5.21C56.01,0.78,66.37-0.71,76,0.31c28.85,3.05,51.04,28.65,46.22,65.16 c-2.67,20.22-9.19,38.25-28.38,47.16c-9.97,4.63-20.72,6.24-29.39,4.71c-20.25-3.57-14.44-17.23-19.87-31.39 c-6.4-16.7-19.64-21.02-25.11,0.42c-1.38,5.42-6.29,7.08-9.26,7.41c-6.13,0.68-11.05-7.25-10.1-21.24 C2.08,43.77,18.82,16.7,45.66,5.21L45.66,5.21z M29.53,37.96c5.46,0,9.88,4.42,9.88,9.88c0,5.46-4.42,9.88-9.88,9.88 s-9.88-4.42-9.88-9.88C19.65,42.39,24.07,37.96,29.53,37.96L29.53,37.96z M94.87,61.54c3.25,0,5.89,2.64,5.89,5.89 c0,3.26-2.64,5.9-5.89,5.9c-3.25,0-5.89-2.64-5.89-5.9C88.98,64.17,91.62,61.54,94.87,61.54L94.87,61.54z M71.64,69.86 c7.47,0,13.52,6.05,13.52,13.52c0,7.47-6.05,13.52-13.52,13.52c-7.47,0-13.52-6.06-13.52-13.52 C58.13,75.91,64.18,69.86,71.64,69.86L71.64,69.86z M57.43,50.96c3.25,0,5.89,2.64,5.89,5.89c0,3.25-2.64,5.89-5.89,5.89 c-3.26,0-5.9-2.64-5.9-5.89C51.54,53.6,54.18,50.96,57.43,50.96L57.43,50.96z M86.9,22.54c7.47,0,13.52,6.05,13.52,13.52 c0,7.47-6.06,13.52-13.52,13.52c-7.47,0-13.52-6.05-13.52-13.52C73.38,28.59,79.43,22.54,86.9,22.54L86.9,22.54z M56.22,20.63 c4.59,0,8.32,3.73,8.32,8.32c0,4.59-3.72,8.32-8.32,8.32c-4.59,0-8.32-3.73-8.32-8.32C47.9,24.35,51.63,20.63,56.22,20.63 L56.22,20.63z"
									/></g
								></svg
							>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									addSketch($elements);
								}}>Add a sketch</button
							>
						</div>
						<div
							class="descriptionButton"
							style="width: fit-content; max-width: 800px; display: flex; align-items: center; flex-wrap: wrap; margin-right: 10px;"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								shape-rendering="geometricPrecision"
								text-rendering="geometricPrecision"
								image-rendering="optimizeQuality"
								fill-rule="evenodd"
								clip-rule="evenodd"
								width="30px"
								height="30px"
								style="margin-right: 10px;"
								viewBox="0 0 512 331.617"
								><path
									fill-rule="nonzero"
									d="M271.099 21.308C274.787 6.304 289.956-2.873 304.96.815c15.005 3.688 24.181 18.857 20.493 33.862l-68.491 275.632c-3.689 15.005-18.857 24.181-33.862 20.493-15.005-3.688-24.181-18.857-20.493-33.862l68.492-275.632zm-118.45 224.344c11.616 10.167 12.795 27.834 2.628 39.45-10.168 11.615-27.835 12.794-39.45 2.627L9.544 194.604C-2.071 184.437-3.25 166.77 6.918 155.155c.873-.997 1.8-1.912 2.767-2.75l106.142-93.001c11.615-10.168 29.282-8.989 39.45 2.626 10.167 11.616 8.988 29.283-2.628 39.45l-82.27 72.086 82.27 72.086zm243.524 42.077c-11.615 10.167-29.282 8.988-39.45-2.627-10.167-11.616-8.988-29.283 2.628-39.45l82.27-72.086-82.27-72.086c-11.616-10.167-12.795-27.834-2.628-39.45 10.168-11.615 27.835-12.794 39.45-2.626l106.142 93.001a28.366 28.366 0 012.767 2.75c10.168 11.615 8.989 29.282-2.626 39.449l-106.283 93.125z"
								/></svg
							>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									$templates = true;
								}}>Add a code template</button
							>
						</div>
						<div
							class="descriptionButton"
							style="width: fit-content; max-width: 800px; display: flex; align-items: center; flex-wrap: wrap; margin-right: 10px;"
						>
							<svg
								version="1.1"
								id="Layer_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								width="30px"
								height="30px"
								viewBox="0 0 122.88 122.88"
								enable-background="new 0 0 122.88 122.88"
								xml:space="preserve"
								style='margin-right: 10px;'
								><g
									><path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M61.439,0c33.928,0,61.44,27.513,61.44,61.439c0,33.929-27.513,61.44-61.44,61.44 C27.512,122.88,0,95.368,0,61.439C0,27.513,27.512,0,61.439,0L61.439,0z M78.314,6.495c20.618,6.853,36.088,24.997,39.068,47.101 l-1.953-0.209c-0.347,1.495-0.666,1.533-0.666,3.333c0,1.588,2,2.651,2,6.003c0,0.898-2.109,2.694-2.202,3.007l-3.132-3.674v4.669 l-0.476-0.018l-0.844-8.615l-1.749,0.551l-2.081-6.409l-6.855,7.155l-0.082,5.239l-2.238,1.501l-2.377-13.438l-1.422,1.039 l-3.22-4.345l-4.813,0.143l-1.844-2.107l-1.887,0.519l-3.712-4.254l-0.717,0.488l2.3,5.878h2.669v-1.334h1.333 c0.962,2.658,2.001,1.084,2.001,2.669c0,5.547-6.851,9.625-11.339,10.669c0.24,1.003,0.147,2.003,1.333,2.003 c2.513,0,1.264-0.44,4.003-0.667c-0.127,5.667-6.5,12.435-9.221,16.654l1.218,8.69c0.321,1.887-3.919,3.884-5.361,6.009 l0.692,3.329l-1.953,0.789c-0.342,3.42-3.662,7.214-7.386,7.214h-4c0-4.683-3.336-11.366-3.336-14.675 c0-2.81,1.333-3.188,1.333-6.669c0-3.216-3.333-7.828-3.333-8.67v-5.336h-2.669c-0.396-1.487-0.154-2-2-2h-0.667 c-2.914,0-2.422,1.333-5.336,1.333h-2.669c-2.406,0-6.669-7.721-6.669-8.671v-8.003c0-3.454,3.161-7.214,5.336-8.672v-3.333 l3.002-3.052l1.667-0.284c3.579,0,3.154-2,5.336-2H49.4v4.669L56,43.532l0.622-2.848c2.991,0.701,3.769,2.032,7.454,2.032h1.333 c2.531,0,2.667-3.358,2.667-6.002l-5.343,0.528l-2.324-5.064l-2.311,0.615c0.415,1.812,0.642,1.059,0.642,2.587 c0,0.9-0.741,1-1.335,1.334l-2.311-5.865l-4.969-3.549l-0.66,0.648l4.231,4.452c-0.562,1.597-0.628,6.209-2.961,2.979l2.182-1.05 l-5.438-5.699l-3.258,1.274l-3.216,3.08c-0.336,2.481-1.012,3.729-3.608,3.729c-1.728,0-0.685-0.447-3.336-0.667v-6.669h6.002 l-1.945-4.442l-0.721,0.44V24.04l9.747-4.494c-0.184-1.399-0.408-0.649-0.408-2.175c0-0.091,0.655-1.322,0.667-1.336l2.521,1.565 l-0.603-2.871l-3.889,0.8l-0.722-3.49c3.084-1.624,9.87-7.34,12.028-7.34h2.002c2.107,0,7.751,2.079,8.669,3.333L62.057,7.49 l3.971,3.271l0.381-1.395l2.964-0.812l0.036-1.855h1.336v2L78.314,6.495L78.314,6.495z M116.963,71.835 c-0.154,0.842-0.324,1.676-0.512,2.504l-0.307-2.152L116.963,71.835L116.963,71.835z M115.042,79.398 c-0.147,0.446-0.297,0.894-0.455,1.336h-0.49v-1.336H115.042L115.042,79.398z M11.758,93.18 c-3.624-5.493-6.331-11.641-7.916-18.226l10.821,5.218l0.055,3.229c0,1.186-2.025,3.71-2.667,4.669L11.758,93.18L11.758,93.18z"
									/></g
								></svg
							>
							<button
								class="tertiaryButton"
								style="text-decoration: underline; padding-left: 0;"
								onclick={() => {
									addElement($elements, 'map');
									$elements = $elements;
								}}>Add a map</button
							>
						</div>
					</div> -->
					<div
						class="descriptionButton"
						style="width: 100%; max-width: 800px; display: flex; flex-direction: column; flex-wrap: wrap;"
					>
						<p style="margin: 0;">
							Continue with a prompt, upload an image, a 3D model, or click 'Tips' for more.
						</p>
						<!-- <ul>
							<li>For images, start with 'An image of'.</li>
							<li>Use reference images to control the composition.</li>
							<li>For videos, start with 'A video of'.</li>
							<li>For 3D models, provide a reference image and type 'Make this a 3D model'.</li>
						</ul> -->
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

		{#if $manual}
			<SimpleManual />
		{/if}
		
{#if $tutorials}
	<SimpleTutorials />
{/if}

{#if $templates}
	<SimpleTemplates />
{/if}

{#if $apps}
	<SimpleApps />
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
