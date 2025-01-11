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
		isSavingThread
	} from '$lib/store';
	import { generateUUID, initialCodeFiles } from '$lib/utils';
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
	import ChatPanel from '$lib/ChatPanel.svelte';
	import SimpleText from '$lib/SimpleText.svelte';
	import SimpleImage from '$lib/SimpleImage.svelte';
	import SimpleVideo from '$lib/SimpleVideo.svelte';
	import SimpleCodeProject from '$lib/SimpleCodeProject.svelte';
	import SimpleSketch from '$lib/SimpleSketch.svelte';
	import Simple3dViewer from '$lib/Simple3dViewer.svelte';
	import AppsPanel from '$lib/AppsPanel.svelte';
	import SimpleChatPanel from '$lib/SimpleChatPanel.svelte';

	let isCreateOptionsVisible = $state(false);
	let createButton: any;
	let layout = $state('container-block');

	// async function test(fileName = ''){
	// 	await fetch(`/api/get-file`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			projectId: $page.params.projectId,
	// 			fileName: fileName
	// 		})
	// 	})
	// }
	// test('flux_schnell_vFph2bakxl.webp')

	let { data } = $props();
	let name: string = $state(data.name);
	let id: string = $state(data.id);
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
			formData.append('data', JSON.stringify(elements));
			console.log(`saving: name - ${name}, id - ${id}`);
			const response = await fetch('/api/threads/save', { method: 'POST', body: formData });
			const responseData = await response.json();
			console.log(responseData);
			$isSavingThread = false;
		} catch (err) {
			console.log(err);
		}
	}

	let discussionWidth: any = $state('100%');
	let saveTimeout: any = $state();

	elements.subscribe(() => {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			if (browser) {
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

<NavPanel />

{#if $width > 0 && data}
	<div class="conversationAndTutorialsContainer">
		<div class="container" style="width: {discussionWidth}">
			<h1 style="margin-top: 50px;">{name}</h1>

			<!-- <Simple3dViewer modelUrl={'https://kodiia-db.pockethost.io/api/files/u2gxg2hnw25d8mw/0xjag4dn7c30f4d/model_w68J61XGn4.glb'} uuid={''} /> -->
			<!-- <CodeProject /> -->
			<!-- <button onclick={setLayout}>display grid</button> -->
			<!-- {#if data.data != ''}
				{#each data.data as element}
					{#if element.type === 'text'}
						<SimpleText query={element.query} answer={element.answer} uuid={element.uuid} />
					{/if}
				{/each}
			{/if} -->

			<div class={layout}>
				<!-- <TextInput imageUrl={'https://media.istockphoto.com/id/1443562748/photo/cute-ginger-cat.jpg?s=612x612&w=0&k=20&c=vvM97wWz-hMj7DLzfpYRmY2VswTqcFEKkC437hxm3Cg='} /> -->
				{#each $elements as element}
					{#if element.type === 'text'}
						<!-- <TextInput imageUrl={element.imageUrl} codeProjectUuid={element.codeProjectUuid} /> -->
						<SimpleText query={element.query} answer={element.answer} uuid={element.uuid} />
					{:else if element.type === 'file'}
						<FileInput uuid={element.uuid} />
					{:else if element.type === 'video'}
						<!-- <VideoGeneration refImageUrl={element.imageUrl} /> -->
						<SimpleVideo videoUrl={element.videoUrl} uuid={element.uuid} />
					{:else if element.type === 'imageGeneration'}
						<!-- <ImageGeneration
						refImageUrl={element.imageUrl}
						maskImageUrl={element.maskImageUrl}
						prompt={element.prompt}
					/> -->
						<SimpleImage imageUrl={element.imageUrl} query={element.query} uuid={element.uuid} />
					{:else if element.type === 'image'}
						<SimpleImage imageUrl={element.imageUrl} query={element.query} uuid={element.uuid} />
					{:else if element.type === 'sketch'}
						<!-- <Sketch /> -->
						<SimpleSketch shapes={element.shapes} uuid={element.uuid} />
						<!-- <SketchTest shapes={element.shapes} uuid={element.uuid} /> -->
					{:else if element.type === 'code'}
						<!-- <CodeProject files={element.files} uuid={element.uuid} /> -->
						<SimpleCodeProject
							files={element.files}
							uuid={element.uuid}
							name={element.name}
							id={element.id}
						/>
					{:else if element.type === '3dViewer'}
						<Simple3dViewer modelUrl={element.modelUrl} uuid={element.uuid} />
					{/if}
				{/each}
			</div>

			<!-- {#if isCreateOptionsVisible}
	<div class='optionsContainer'>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'text');
				$elements = $elements;
				scrollToCreateButton();
			}}>chat</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'imageGeneration');
				$elements = $elements;
				scrollToCreateButton();
			}}>image</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'file');
				$elements = $elements;
				scrollToCreateButton();
			}}>file</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'sketch');
				$elements = $elements;
				scrollToCreateButton();
			}}>sketch</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'code');
				$elements = $elements;
				scrollToCreateButton();
			}}>code</button
		>
	</div>
	{:else}
		<button
			bind:this={createButton}
			style="background: hsl({$textColor}); color: hsl({$bgColor});"
			class="createButton"
			onclick={() => {
				isCreateOptionsVisible = !isCreateOptionsVisible;
				setTimeout(()=>{isCreateOptionsVisible = false;}, 10000)
			}}>Add</button
		>
	{/if} -->

			<div
				style="width: calc({discussionWidth} - 20px); position: fixed; bottom: 0px; display: flex; justify-content: center; align-items: center; flex-direction: column;"
			>
				<ChatPanel />
				<!-- <SimpleChatPanel /> -->
			</div>
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
{/if}

<!-- <div class="discussionNav">
	<button
		class="smallMenuButton"
		style="color: hsl({$textColor});"
		onclick={() => {
			isCreateOptionsVisible = false;
			addElement($elements, 'text');
			$elements = $elements;
			scrollToCreateButton();
		}}>Start Chat</button
	>
	<button
		class="smallMenuButton"
		style="color: hsl({$textColor});"
		onclick={() => {
			isCreateOptionsVisible = false;
			addElement($elements, 'imageGeneration');
			$elements = $elements;
			scrollToCreateButton();
		}}>Generate Image</button
	>
	<button
		class="smallMenuButton"
		style="color: hsl({$textColor});"
		onclick={() => {
			isCreateOptionsVisible = false;
			addElement($elements, 'file');
			$elements = $elements;
			scrollToCreateButton();
		}}>Upload File</button
	>
	<button
		class="smallMenuButton"
		style="color: hsl({$textColor});"
		onclick={() => {
			isCreateOptionsVisible = false;
			addElement($elements, 'sketch');
			$elements = $elements;
			scrollToCreateButton();
		}}>Create Sketch</button
	>
	<button
		class="smallMenuButton"
		style="color: hsl({$textColor});"
		onclick={() => {
			isCreateOptionsVisible = false;
			addElement($elements, 'code');
			$elements = $elements;
			scrollToCreateButton();
		}}>Start Coding</button
	>
</div> -->

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
