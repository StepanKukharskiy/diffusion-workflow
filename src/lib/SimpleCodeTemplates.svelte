<script lang="ts">
	import { elements, textColor } from './store';
	import { generateUUID } from './utils';
	import { slide } from 'svelte/transition';
	let isLoadingTemplate = $state(false);
	let isTemplateSelected = $state(false);
	let templatesList = [
		{ name: 'static', description: 'static' },
		{ name: 'p5.js', description: 'p5.js' },
		{ name: 'three.js', description: 'three.js' },
		{ name: 'brain.js', description: 'brain.js' },
		{ name: 'CA3D', description: 'Cellular Automata 3D' },
		{ name: 'GLB', description: 'GLB viewer' },
		{ name: 'FF2D', description: 'Flow Field 2D' },
		{ name: 'FF3D', description: 'Flow Field 3D' },
		{ name: 'flock2D', description: 'Flock 2D' }
	];

	async function getTemplate(name = '') {
		const message = await fetch(`/api/code-templates`, {
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

<div class="templatesContainer">
	{#if !isLoadingTemplate}
		<div>
			{#each templatesList as template}
				<button
					class="templatesButton"
					onclick={async () => {
						isTemplateSelected = true;
						isLoadingTemplate = true;
						const templateData = await getTemplate(template.name);
						addElement($elements, 'code', templateData.files);
						$elements = $elements;
						isLoadingTemplate = false;
						isTemplateSelected = false;
					}}
				>
					{template.description}
				</button>
			{/each}
		</div>
		{#if !isTemplateSelected}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p style="margin-right: 10px;">Please, select a template to continue</p>
			</div>
		{/if}
	{:else}
		<div style="display: flex; align-items: center;" transition:slide>
			<span class="warning"></span>
			<p style="margin-right: 10px;">Loading template</p>
			<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
		</div>
	{/if}
</div>

<style>
	.templatesContainer{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.templatesButton {
		border: none;
		border-radius: 10px;
		background: #f9f9f9;
		padding: 10px;
		margin: 0 5px 5px 0;
		font-weight: 300;
		font-family: 'Robot', sans-serif;
	}
</style>
