<script lang="ts">
	import LogInPanel from '$lib/LogInPanel.svelte';
	import NavPanel from '$lib/NavPanel.svelte';
	import { user, loginPanelState } from '$lib/store';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let threadsList: any = $state({}),
		isLoadingThreads: any = $state(),
		createNewThread: any = $state(false),
		isCreatingNewThread: any = $state(false),
		name: string = $state('');

	onMount(async () => {
		if (data.user != undefined) {
			isLoadingThreads = true;
			$user = data.user;
			threadsList = await getThreadsList();
		} else {
			$loginPanelState = true;
		}
		console.log(threadsList);
	});

	if (data.user != undefined) {
		$user = data.user;
	} else {
		$loginPanelState = true;
	}
	console.log(data);

	async function getThreadsList() {
		let threadsListData = await fetch('api/threads/list');
		let threadsList = await threadsListData.json();
		isLoadingThreads = false;
		return threadsList.threads;
	}

	async function createThread() {
		isCreatingNewThread = true;
		const formData = new FormData();
		formData.append('name', name);
		const response = await fetch('api/threads/create', { method: 'POST', body: formData });
		const responseData = await response.json();
		if (response.ok) {
			goto(`/threads/${responseData.id}`);
			isCreatingNewThread = false;
		}
	}

	$effect(async function () {
		if ($user) {
			isLoadingThreads = true;
			threadsList = await getThreadsList();
		}
	});
</script>

{#if $loginPanelState}
	<LogInPanel />
{:else}
	<NavPanel />

	<div class="threadsListContainer">
		<div class="threadsDataContainer">
			<h2 class="secondaryHeading">Projects</h2>

				<div class="createThreadFormContainer">
					{#if isCreatingNewThread}
						<div style="display: flex; align-items: center;" transition:slide>
							<span class="warning"></span>
							<p style="margin-right: 10px;">Creating a project</p>
							<div class="loader"></div>
						</div>
					{:else}
						<input bind:value={name} placeholder="What would you like to create?" />

						<div style="display: flex; align-items: center;" transition:slide>
							<span class="warning"></span>
							<p style="margin-right: 10px;">Please, enter a project name to create one</p>
						</div>
						<button
							class="primaryButton"
							disabled={name === '' ? true : false}
							onclick={() => {
								createThread();
							}}>Create</button
						>
					{/if}
				</div>
			{#if isLoadingThreads}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Loading projects</p>
					<div class="loader"></div>
				</div>
			{:else if threadsList != undefined && threadsList.length > 0}
				

				<h4 class="tertiaryHeading" style="margin-top: 20px;">Your projects:</h4>
				<ul>
					{#each threadsList as thread}
						<li>
							<div class="threadContainer">
								<button
									class="tertiaryButton"
									style="padding-left: 0;"
									onclick={() => {
										goto(`/threads/${thread.id}`);
									}}>{thread.name}</button
								>
								<!-- <p>{thread.updated}</p> -->
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<style>
	.threadsListContainer {
		width: 100%;
		height: 100vh;
		padding: 10px;
		box-sizing: border-box;
		overflow-y: scroll;
	}
	.threadsDataContainer {
		margin: auto;
		margin-top: 60px;
		max-width: 300px;
		overflow-y: auto;
	}
	.threadContainer {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	input {
		width: 100%;
		min-width: 200px;
		padding: 10px;
		box-sizing: border-box;
		border: 1px solid hsl(0, 0%, 90%);
		border-radius: 10px;
		background-color: hsl(0, 0%, 90%);
		font-family: 'Source Code Pro', sans-serif;
		font-size: 1rem;
		font-weight: 300;
	}
	.createThreadFormContainer {
		margin-top: 10px;
	}
	.createThreadMenuContainer {
		display: flex;
		margin-top: 10px;
	}
</style>
