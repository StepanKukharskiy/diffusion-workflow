<script lang="ts">
	import { elements, textColor, threadsList } from './store';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';
	import { slide } from 'svelte/transition';
	type Thread = { name: string; id: string, updated: string };
	let { thread = { name: '', id: '', updated: '' }, action } = $props() as {
		thread: Thread;
		action: any;
	};
	let isLoadingThread: any = $state(false),
		deleteThread: any = $state(false),
		isDeletingThread: any = $state(false);

	// async function getProjectFiles(id = '') {
	// 	isLoadingProject = true;
	// 	const formData = new FormData();
	// 	formData.append('id', id);
	// 	const projectFiles = await fetch(`${$page.url.origin}/api/projects/get-files`, {
	// 		method: 'POST',
	// 		body: formData
	// 	});
	// 	const projectFilesData = await projectFiles.json();
	// 	console.log(projectFilesData);
	// 	isLoadingProject = false;
	// 	return projectFilesData.files;
	// }

	// function addElement(elements: any, type = 'code', files = '', name = '', id = '') {
	// 	elements.push({
	// 		uuid: generateUUID(),
	// 		type: type,
	// 		files: files,
	// 		name: name,
	// 		id: id,
	// 		run: true
	// 	});
	// 	console.log(elements);
	// }

	async function deleteThreadData(id = '') {
		isDeletingThread = true;
		const formData = new FormData();
		formData.append('id', id);
		await fetch(`${$page.url.origin}/api/threads/delete`, { method: 'POST', body: formData });
		isDeletingThread = false;
	}

	async function getThreadsList() {
		const threadsListData = await fetch(`${$page.url.origin}/api/threads/list`);
		const threadsData = await threadsListData.json();
		return threadsData;
	}
</script>

<div>
	<div class="threadNameContainer">
		<div style="display: flex; justify-content: space-between;">
			<div>
				<h4 class="tertiaryHeading">{thread.name}</h4>
				<p style="font-size: 1rem; margin: 10px 0 0 0;">{thread.updated.split(' ')[0]}</p>
			</div>
			<div class="optionsContainer">
				{#if isLoadingThread}
					<div
						class="loader"
						style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
					></div>
				{:else}
					<button
						class="tertiaryButton"
						onclick={() => {
							window.open(`/threads/${thread.id}`, '_self');
						}}>Continue</button
					>
					<button
						class="tertiaryButton"
						onclick={() => {
							deleteThread = true;
						}}>Delete</button
					>
				{/if}
			</div>
		</div>

		{#if deleteThread}
			<div>
				<div
					style="background: hsla(0, 0%, 0%, 0.03); padding: 10px; border-radius: 10px; margin-top: 10px; "
				>
					<div style="display: flex; align-items: center; justify-content: center;">
						<span class="warning"></span>
						<p style="margin: 0;">Are you sure? This action can't be undone.</p>
					</div>

					{#if isDeletingThread}
						<div style="display: flex; justify-content: center; margin-top: 10px;">
							<div
								class="loader"
								style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
							></div>
						</div>
					{:else}
						<div style="display: flex; justify-content: center; margin-top: 10px;">
							<button
								class="tertiaryButton"
								onclick={() => {
									deleteThread = false;
								}}>Cancel</button
							>
							<button
								class="primaryButton"
								onclick={async () => {
									await deleteThreadData(thread.id);
									deleteThread = false;
									const newThreadsList = await getThreadsList();
									$threadsList = newThreadsList.threads;
									console.log(newThreadsList);
								}}>Delete</button
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.threadNameContainer {
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
		box-sizing: border-box;
	}
	.threadNameContainer:hover {
		background: hsl(0, 0%, 93%);
	}
	.optionsContainer {
		display: flex;
	}
</style>
