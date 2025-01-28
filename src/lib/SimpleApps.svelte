<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import {
		textColor,
		height,
		width,
		elements,
		projectsList,
		apps,
		appsPanelState
	} from '$lib/store';
	import { generateUUID } from './utils';
	import SimpleProjectCard from './SimpleProjectCard.svelte';
	import { page } from '$app/stores';

	let { textarea } = $props();

	let projectsListData: any = $state(),
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

	// async function getTemplate(name = '') {
	// 	const message = await fetch(`${$page.url.origin}/api/code-templates`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			name: name
	// 		})
	// 	});
	// 	const messageObject = await message.json();
	// 	console.log(messageObject);

	// 	return messageObject;
	// }

	// function addElement(elements: any, type = 'code', files = '') {
	// 	elements.push({
	// 		uuid: generateUUID(),
	// 		type: type,
	// 		files: files,
	// 		run: true
	// 	});
	// 	console.log(elements);
	// }
</script>

<div class="container" transition:slide style="height: calc({$height}px - {textarea} - 125px);">
	<div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
		<h2>Apps</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$apps = false;
			}}>quit</button
		>
	</div>
    <div class='wrapper'>
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

    </div>

</div>

<style>
	.container {
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
		margin-bottom: 0px;
	}
	.wrapper {
		overflow-y: auto;
		border-radius: 10px;
	}
    .item-wrapper{
        border: none;
		border-radius: 10px;
		background: hsl(0, 0%, 95%);
		color: #1a1a1a;
		padding: 10px;
		margin: 0 0 5px 0;
		font-weight: 300;
		font-family: 'Robot', sans-serif;
		display: flex;
        justify-content: space-between;
        align-items: center;
		box-sizing: border-box;
    }
    .item-wrapper:hover {
		background: hsl(0, 0%, 93%);
	}
</style>
