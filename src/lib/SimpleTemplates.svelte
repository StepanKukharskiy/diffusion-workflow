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
		templates,
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
		{
			name: 'static',
			description: 'Basic static website starter kit.',
			type: 'basic',
			heading: 'Static Website'
		},
		{
			name: 'p5.js',
			description: 'p5.js starter kit for creative coding.',
			type: 'basic',
			heading: 'p5.js Starter'
		},
		{
			name: 'three.js',
			description: 'three.js starter kit for 3D web graphics.',
			type: 'basic',
			heading: 'Three.js Starter'
		},
		{
			name: 'brain.js',
			description: 'brain.js starter kit for neural networks.',
			type: 'basic',
			heading: 'Brain.js Starter'
		},
		{
			name: 'GLB',
			description: 'GLB viewer to display your 3D scenes in a browser.',
			type: 'basic',
			heading: 'GLB Viewer'
		},
		{
			name: 'OSM',
			description: 'Create maps with OSM data. Geospatial data integration in p5.js.',
			type: 'basic',
			heading: 'OpenStreetMap Integration'
		},
		{
			name: 'FF2D',
			description: 'Flow Field 2D. Fluid dynamics visualization.',
			type: 'simulation',
			heading: '2D Flow Field'
		},
		{
			name: 'FF3D',
			description: 'Flow Field 3D. Fluid dynamics visualization.',
			type: 'simulation',
			heading: '3D Flow Field'
		},
		{
			name: 'flock2D',
			description: 'Flock 2D. Behavioral animation system.',
			type: 'simulation',
			heading: '2D Flocking Simulation'
		},
		{
			name: 'Voxel Editor',
			description: 'Voxel Editor for 3D model crafting in games and architecture visualization.',
			type: 'art',
			heading: 'Voxel Modeling Tool'
		},
		{
			name: 'pixelart',
			description: 'Pixel Art Editor for retro-styled digital asset creation.',
			type: 'art',
			heading: 'Pixel Art Creator'
		},
		{
			name: 'truchet',
			description: 'Truchet tiles generator for decorative and architectural pattern concepts.',
			type: 'art',
			heading: 'Truchet Pattern Generator'
		},
		{
			name: 'CAdiffusion3d',
			description: 'Diffusion Cellular Automata 3D for environment generation.',
			type: 'art',
			heading: '3D Diffusion CA'
		},
		{
			name: 'CA3d',
			description: 'Cellular Automata 3D.',
			type: 'art',
			heading: '3D CA'
		},
		{
			name: 'differential growth',
			description: 'Differential Growth sketch tool made with p5.js',
			type: 'art',
			heading: 'Differential Growth 2D'
		},
		{
			name: 'city grid game',
			description: 'A grid-based city building game with vanilla JavaScript.',
			type: 'game',
			heading: 'City Builder Game'
		}
	];

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

<div class="container" transition:slide style="height: calc({$height}px - {textarea} - 125px);">
	<div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
		<h2>Templates</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$templates = false;
			}}>quit</button
		>
	</div>
	<div class="wrapper">
		{#if !isLoadingTemplate}
			<p style="margin-right: 10px;">Coding templates for your projects.</p>
			<div style="width: 100%">
				<h3 class="tertiaryHeading" style='margin-bottom: 20px'>Art</h3>
				<div class="grid">
					{#each templatesList as template}
						{#if template.type === 'art'}
							<div class="item-wrapper">
								<h3 class="tertiaryHeading">{template.heading}</h3>
								<p>{template.description}</p>

								<button
									style="width: fit-content;"
									class="tertiaryButton"
									onclick={async () => {
										isLoadingTemplate = true;
										const templateData = await getTemplate(template.name);
										addElement($elements, 'code', templateData.files);
										$elements = $elements;
										isLoadingTemplate = false;
										$templates = false;
									}}
								>
									Add
								</button>
							</div>
						{/if}
					{/each}
				</div>

				<h3 class="tertiaryHeading" style='margin: 20px 0;'>Simulations</h3>
				<div class="grid">
					{#each templatesList as template}
						{#if template.type === 'simulation'}
							<div class="item-wrapper">
								<h3 class="tertiaryHeading">{template.heading}</h3>
								<p>{template.description}</p>

								<button
									style="width: fit-content;"
									class="tertiaryButton"
									onclick={async () => {
										isLoadingTemplate = true;
										const templateData = await getTemplate(template.name);
										addElement($elements, 'code', templateData.files);
										$elements = $elements;
										isLoadingTemplate = false;
										$templates = false;
									}}
								>
									Add
								</button>
							</div>
						{/if}
					{/each}
				</div>

				<h3 class="tertiaryHeading" style='margin: 20px 0;'>Game Design</h3>
				<div class="grid">
					{#each templatesList as template}
						{#if template.type === 'game'}
							<div class="item-wrapper">
								<h3 class="tertiaryHeading">{template.heading}</h3>
								<p>{template.description}</p>

								<button
									style="width: fit-content;"
									class="tertiaryButton"
									onclick={async () => {
										isLoadingTemplate = true;
										const templateData = await getTemplate(template.name);
										addElement($elements, 'code', templateData.files);
										$elements = $elements;
										isLoadingTemplate = false;
										$templates = false;
									}}
								>
									Add
								</button>
							</div>
						{/if}
					{/each}
				</div>

				<h3 class="tertiaryHeading" style='margin: 20px 0;'>Basic</h3>
				<div class="grid">
					{#each templatesList as template}
						{#if template.type === 'basic'}
							<div class="item-wrapper">
								<h3 class="tertiaryHeading">{template.heading}</h3>
								<p>{template.description}</p>

								<button
									style="width: fit-content;"
									class="tertiaryButton"
									onclick={async () => {
										isLoadingTemplate = true;
										const templateData = await getTemplate(template.name);
										addElement($elements, 'code', templateData.files);
										$elements = $elements;
										isLoadingTemplate = false;
										$templates = false;
									}}
								>
									Add
								</button>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p style="margin-right: 10px;">Loading template</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
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
		-webkit-backdrop-filter: blur(40px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		margin-bottom: 0px;
	}
	.wrapper {
		overflow-y: auto;
		border-radius: 10px;
	}
	.grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 10px;
	}
	.item-wrapper {
		border: none;
		border-radius: 10px;
		background: hsl(0, 0%, 95%);
		color: #1a1a1a;
		padding: 10px;
		margin: 0 0 5px 0;
		font-weight: 300;
		font-family: 'Robot', sans-serif;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* align-items: center; */
		box-sizing: border-box;
	}
	.item-wrapper:hover {
		background: hsl(0, 0%, 93%);
	}

	@media screen and (max-width: 700px){
		.grid{
			grid-template-columns: 1fr;
		}
	}
</style>
