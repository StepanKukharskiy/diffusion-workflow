<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import { textColor, tutorialsPanelState, width, elements, projectsList } from '$lib/store';
	import { page } from '$app/stores';

	
	let tutorialsList: any,
		tutorialsListData: any = $state(''),
		tutorialState = $state(false),
		selectedTutorial = $state(''),
		tutorialData: any = $state([]),
		projectsListData: any = $state(),
		tutorials: any = $state(true),
		projects: any = $state(false);


	async function getTutorialsList() {
		tutorialsList = await fetch(`${$page.url.origin}/api/get-tutorials-list`);
		tutorialsListData = await tutorialsList.json();
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

<div class="tutorialsContainer" style="width: {$width < 700 ? 'calc(100% - 20px)' : '400px'}">
	<div class="topBar">
		<h2 class="primaryHeading">Resources</h2>
		<button
			class="smallMenuButton"
			onclick={() => {
				$tutorialsPanelState = false;
			}}>close</button
		>
	</div>
	{#if tutorials}
		{#if selectedTutorial != ''}
			<div class="topBar">
				<h4 class="tertiaryHeading">{selectedTutorial}</h4>
				<button
					class="smallMenuButton"
					onclick={() => {
						selectedTutorial = '';
						tutorialState = false;
					}}>back</button
				>
			</div>
		{/if}

		<div
			class="tutorialsDataContainer"
			style="height: {selectedTutorial === '' ? 'calc(100% - 40px)' : 'calc(100% - 80px)'};"
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
			{:else if tutorialState}
			
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
				<div class="tutorialsNamesContainer">
					<h3 class='secondaryHeading' style='margin-top: 0; margin-bottom: 10px;'>Tutorials</h3>
					{#each tutorialsListData.tutorials as tutorial}
						<button class="tutorialButton" onclick={() => displayTutorial(tutorial.name)}
							>{tutorial.name}</button
						>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
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
		margin: 0 5px 5px 0;
		border: 1px solid #f9f9f9;
		border: 1px solid #1a1a1a30;
		border-radius: 10px;
		color: #1a1a1a;
		background: #f9f9f9;
	}
	.tutorialButton:hover {
		background: #1a1a1a10;
	}
	/* .projectNameContainer {
		padding: 0px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	} */
</style>
