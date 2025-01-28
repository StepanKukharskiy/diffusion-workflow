<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import {
		height,
		textColor,
		tutorials,
		tutorialsPanelState,
		width,
		elements,
		projectsList
	} from '$lib/store';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';

	let { textarea } = $props();

	let tutorialsList: any,
		tutorialsListData: any = $state(''),
		tutorialState = $state(false),
		selectedTutorial = $state(''),
		tutorialData: any = $state([]),
		projectsListData: any = $state(),
		projects: any = $state(false);

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
	}
	async function getTutorialsList() {
		tutorialsList = await fetch(`${$page.url.origin}/api/get-tutorials-list`);
		tutorialsListData = await tutorialsList.json();
	}

	onMount(() => {
		getTutorialsList();
	});

	function displayTutorial(name = '') {
		// tutorialState = true;
		// selectedTutorial = name;
		let stepData = [];
		for (let tutorial of tutorialsListData.tutorials) {
			if (tutorial.name === name) {
				tutorialData = tutorial.steps;

				for (let step of tutorial.steps) {
					console.log(tutorial);
					let mode;
					if (step.code != 'false') {
						if (step.mode === '.js') {
							mode = 'javascript';
						}
						if (step.mode === '.css') {
							mode = 'css';
						}
						if (step.mode === '.html') {
							mode = 'html';
						}

						stepData.push(`

#### ${step.step}
${step.text} 
\`\`\`${mode} 
${step.code}
\`\`\`
`);
					} else {
stepData.push(`

#### ${step.step}
${step.text}
`);
					}
				}
			}
		}
		addElement($elements, 'text', name, stepData.join('\n\n'));
	}
</script>

<div class="container" transition:slide style="height: calc({$height}px - {textarea} - 125px);">
	<div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
		<h2>Tutorials</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$tutorials = false;
			}}>quit</button
		>
	</div>
	{#if tutorials}
		<div
			class="wrapper"
		>
			{#if tutorialsListData === ''}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p>Loading resources</p>
					<div
						class="loader"
						style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
					></div>
				</div>

				{#each tutorialData as step, i}
					<h4 style="margin-top: 20px;">{i}. {step.step}</h4>
					<p>{@html step.text}</p>
					{#if step.link ? step.link : step.linkUrl}
						<a
							href={step.link ? step.link : step.linkUrl}
							target="_blank"
							class="link"
							style="margin-bottom: 10px; color: hsl({$textColor});">{step.linkText}</a
						>
					{/if}

					{#if step.code != 'false'}
						<CodeSnippetMonaco fileName={step.mode.replace('.', '')} code={step.code} />
					{/if}
				{/each}
			{:else}
				<div>
					{#each tutorialsListData.tutorials as tutorial}
						<div class='item-wrapper'>
							<h3 class="tertiaryHeading">{tutorial.name}</h3>
							<button class="tertiaryButton" onclick={() => {$tutorials = false; displayTutorial(tutorial.name)}}
								>Start</button
							>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
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
