<script lang="ts">
	import LogInPanel from '$lib/LogInPanel.svelte';
	import NavPanel from '$lib/NavPanel.svelte';
	import { user, loginPanelState, threadsList } from '$lib/store';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SimpleThreadCard from '$lib/SimpleThreadCard.svelte';

	let { data } = $props();
	let isLoadingThreads: any = $state(),
		createNewThread: any = $state(false),
		isCreatingNewThread: any = $state(false),
		isDeletingThread: any = $state(),
		name: string = $state('');

	onMount(async () => {
		if (data.user != undefined) {
			isLoadingThreads = true;
			$user = data.user;
			$threadsList = await getThreadsList();
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

	async function deleteThreadData(id = '') {
		isDeletingThread = true;
		const formData = new FormData();
		formData.append('id', id);
		await fetch(`${$page.url.origin}/api/threads/delete`, { method: 'POST', body: formData });
		isDeletingThread = false;
	}

	$effect(async function () {
		if ($user) {
			isLoadingThreads = true;
			$threadsList = await getThreadsList();
		}
	});
</script>

{#if $loginPanelState}
	<LogInPanel />
{:else}
	<NavPanel />

	<div class="threadsListContainer">
		<div class="threadsDataContainer">
			<h2 class="secondaryHeading">Threads</h2>

			<div class="createThreadFormContainer">
				{#if isCreatingNewThread}
					<div style="display: flex; align-items: center;" transition:slide>
						<span class="warning"></span>
						<p style="margin-right: 10px;">Creating</p>
						<div class="loader"></div>
					</div>
				{:else}
					<input
						bind:value={name}
						placeholder="What are you working on?"
						style="margin-bottom: 10px;"
					/>
					{#if name.length < 1}
						<div style="display: flex; align-items: center; padding: 0 0 10px 0;" transition:slide>
							<span class="warning"></span>
							<p style="margin: 0px;">Please, enter a thread name to create one</p>
						</div>
					{/if}
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
					<p style="margin-right: 10px;">Loading threads</p>
					<div class="loader"></div>
				</div>
			{:else if $threadsList != undefined && $threadsList.length > 0}
				<p style="margin: 20px 0;">Things you've discussed before:</p>
				<!-- <ul>
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
								
							</div>
						</li>
					{/each}
				</ul> -->
				{#each $threadsList as thread}
					<SimpleThreadCard thread={{ name: thread.name, id: thread.id, updated: thread.updated }} />
				{/each}
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
		margin-top: 80px;
		max-width: 600px;
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
