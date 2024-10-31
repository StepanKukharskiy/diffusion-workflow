<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import { textColor, tutorialsPanelState, width } from '$lib/store';

	let tutorialsList: any,
		tutorialsListData: any = $state(''),
		tutorialState = $state(false),
		selectedTutorial = $state(''),
		tutorialData: any = $state([]);

	async function getTutorialsList() {
		tutorialsList = await fetch('api/get-tutorials-list');
		tutorialsListData = await tutorialsList.json();
		//tutorialsNames = tutorialsListData.tutorials.name;
		console.log(tutorialsListData);
	}
	onMount(() => {
		getTutorialsList();
	});

	function displayTutorial(name = '') {
		tutorialState = true;
		selectedTutorial = name;
		for (let tutorial of tutorialsListData.tutorials) {
			if (tutorial.name === name) {
				tutorialData = tutorial.steps;
			}
		}
	}
</script>

<div class="tutorialsContainer" style='width: {$width < 700 ? 'calc(100% - 20px)' : '400px'}'>
	<div class="topBar">
		<h2>Resources</h2>
		<button
			class="smallMenuButton"
			onclick={() => {
				$tutorialsPanelState = false;
			}}>close</button
		>
	</div>
	{#if selectedTutorial != ''}
		<div class="topBar">
			<h4>{selectedTutorial}</h4>
			<button
				class="smallMenuButton"
				onclick={() => {
					selectedTutorial = '';
					tutorialState = false;
				}}>back</button
			>
		</div>
	{/if}

	<div class="tutorialsDataContainer">
		{#if tutorialsListData === ''}
			<div style="display: flex; align-items: center;" transition:slide>
				<span class="warning"></span>
				<p>Loading resources</p>
				<div
					class="loader"
					style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
				></div>
			</div>
		{:else if tutorialState}
			{#each tutorialData as step, i}
				<h4 style="margin-top: 20px;">{i}. {step.step}</h4>
				<!-- {#if step.imageUrl}
				<div class="stepImageContainer">
					<img src={step.imageUrl} alt={step.imageText} class="stepImage" />
				</div>
			{/if} -->
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
			<div class="tutorialsNamesContainer">
				{#each tutorialsListData.tutorials as tutorial}
					<button class="tutorialButton" onclick={() => displayTutorial(tutorial.name)}
						>{tutorial.name}</button
					>
				{/each}
			</div>
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
		min-width: 400px;
		height: calc(100svh - 120px);
		padding: 10px;
		padding-right: 0;
		box-sizing: border-box;

		/* display: flex;
		flex-direction: column;
		align-items: center; */
		border: 1px solid #f9f9f9;
		border-radius: 20px;
		background: linear-gradient(45deg, #f9f9f9, transparent);
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		z-index: 10;
	}
	.tutorialsDataContainer {
		height: calc(100% - 80px);
		padding-right: 10px;
		overflow-y: scroll;
	}
	.tutorialsNamesContainer {
		padding-top: 20px;
	}
	.tutorialButton {
		font-weight: 300;
		padding: 10px;
		margin: 0 10px 10px 0;
		border: 1px solid #f9f9f9;
		border-radius: 20px;
		background: #f9f9f9;
	}
	.tutorialButton:hover {
		background: linear-gradient(45deg, #f9f9f9, #f9f9f990);
	}
</style>
