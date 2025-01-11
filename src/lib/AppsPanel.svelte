<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import {
		textColor,
		width,
		elements,
		projectsList,
		appsPanelState
	} from '$lib/store';
	import { generateUUID } from './utils';
	import SimpleProjectCard from './SimpleProjectCard.svelte';
	import { page } from '$app/stores';

	let projectsListData: any = $state(),
		templates: any = $state(true),
		createdByUser: any = $state(false);

	let isLoadingTemplate = $state(false);
	let templatesList = [
		{ name: 'static', description: 'static' },
		{ name: 'p5.js', description: 'p5.js' },
		{ name: 'three.js', description: 'three.js' },
		{ name: 'brain.js', description: 'brain.js' },
		{ name: 'CA3D', description: 'Cellular Automata 3D' },
		{ name: 'GLB', description: 'GLB viewer' },
		{ name: 'FF2D', description: 'Flow Field 2D' },
		{ name: 'FF3D', description: 'Flow Field 3D' },
		{ name: 'flock2D', description: 'Flock 2D' },
		{ name: 'Voxel Editor', description: 'Voxel Editor' },
		{ name: 'pixelart', description: 'Pixel Art Editor' },
		{ name: 'truchet', description: 'Truchet tiles' },
		{ name: 'CAdiffusion3d', description: 'Diffusion Cellular Automata 3D' },
		{ name: 'ca diffusion game', description: 'Diffusion Cellular Automata Game' }
	];

	async function getAppsList() {
		$projectsList = '';
		projectsListData = await fetch(`${$page.url.origin}/api/projects/get`);
		$projectsList = await projectsListData.json();
	}

	onMount(() => {
		getAppsList();
	});

	function toggleTemplates() {
		templates = true;
		createdByUser = false;
	}

	function toggleCreatedByUser() {
		createdByUser = true;
		templates = false;
	}

	async function getTemplate(name = '') {
		const message = await fetch(`${$page.url.origin}/api/code-templates`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: name
			})
		});
		const messageObject = await message.json();
		console.log(messageObject);

		return messageObject;
	}

	function addElement(elements: any, type = 'code', files = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			files: files,
			run: true
		});
		console.log(elements);
	}
</script>

<div class="tutorialsContainer" style="width: {$width < 700 ? 'calc(100% - 20px)' : '400px'}">
	<div class="topBar">
		<h2 class="primaryHeading">Apps</h2>
		<button
			class="smallMenuButton"
			onclick={() => {
				$appsPanelState = false;
			}}>close</button
		>
	</div>
	<div style="height: 40px; display: flex; margin-bottom: 10px;">
		<button class="tertiaryButton" style='background: {templates ? 'hsl(0, 0%, 93%)' : 'none'}' onclick={toggleTemplates}>Templates</button>
		<button class="tertiaryButton" style='background: {createdByUser ? 'hsl(0, 0%, 93%)' : 'none'}' onclick={toggleCreatedByUser}>Created by you</button>
	</div>

	<div class="tutorialsDataContainer">
		{#if createdByUser}
			{#if $projectsList === ''}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p>Loading apps</p>
					<div
						class="loader"
						style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
					></div>
				</div>
			{:else}
				<div class="tutorialsNamesContainer" style="padding-top: 0;">
					{#each $projectsList.projects as project}
						<SimpleProjectCard {project} action={$projectsList} />
					{/each}
				</div>
			{/if}
		{:else if templates}
			{#if !isLoadingTemplate}
				<p style="margin-right: 10px;">Frontend app templates for your projects. Click on a template to import it.</p>
				<div>
					{#each templatesList as template}
						<button
							class="templatesButton"
							onclick={async () => {
								isLoadingTemplate = true;
								const templateData = await getTemplate(template.name);
								addElement($elements, 'code', templateData.files);
								$elements = $elements;
								isLoadingTemplate = false;
							}}
						>
							<h4 class='tertiaryHeading'>{template.description}</h4>
						</button>
					{/each}
				</div>
			{:else}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Loading template</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.topBar {
		height: 40px;
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
	}

	.tutorialsContainer {
		position: fixed;
		right: 10px;
		top: 60px;
		box-sizing: border-box;
		width: 400px;
		/* min-width: 400px; */
		height: calc(100vh - 70px);
		height: calc(100svh - 70px);
		padding: 10px;
		padding-right: 0;
		box-sizing: border-box;
		box-shadow: 0 0 10px rgba(152, 152, 152, 0.3);

		/* display: flex;
		flex-direction: column;
		align-items: center; */
		border: 1px solid #f9f9f9;
		border-radius: 20px;
		background: linear-gradient(45deg, #f9f9f950, #f9f9f990);
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		z-index: 10;
	}
	.tutorialsDataContainer {
		height: calc(100% - 90px);
		padding-right: 10px;
		overflow-y: scroll;
	}
	.tutorialsNamesContainer {
		padding-top: 20px;
	}
	.templatesButton {
		border: none;
		border-radius: 10px;
		background: hsl(0, 0%, 95%);
		color: #1a1a1a;
		padding: 10px;
		margin: 0 5px 5px 0;
		font-weight: 300;
		font-family: 'Robot', sans-serif;
	}
	.templatesButton:hover {
		background: #1a1a1a10;
	}
</style>
