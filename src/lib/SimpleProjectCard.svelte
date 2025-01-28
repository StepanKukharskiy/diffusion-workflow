<script lang="ts">
	import { elements, textColor, projectsList, apps } from './store';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';
	import { slide } from 'svelte/transition';
	type Project = { name: string; id: string };
	let { project = { name: '', id: '' }, action } = $props() as { project: Project; action: any };
	let isLoadingProject: any = $state(false),
		deleteProject: any = $state(false),
		isDeletingProject: any = $state(false);

	async function getProjectFiles(id = '') {
		isLoadingProject = true;
		const formData = new FormData();
		formData.append('id', id);
		const projectFiles = await fetch(`${$page.url.origin}/api/projects/get-files`, {
			method: 'POST',
			body: formData
		});
		const projectFilesData = await projectFiles.json();
		console.log(projectFilesData);
		isLoadingProject = false;
		return projectFilesData.files;
	}

	function addElement(elements: any, type = 'code', files = '', name = '', id = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			files: files,
			name: name,
			id: id,
			run: true
		});
		console.log(elements);
	}

	async function deleteProjectFiles(id = '') {
		isDeletingProject = true;
		const formData = new FormData();
		formData.append('id', id);
		await fetch(`${$page.url.origin}/api/projects/delete`, { method: 'POST', body: formData });
		isDeletingProject = false;
	}

	async function getProjectsList() {
		const projectsListData = await fetch(`${$page.url.origin}/api/projects/get`);
		$projectsList = await projectsListData.json();
	}
</script>

<div>
	<div class="projectNameContainer">
		<div style='display: flex; justify-content: space-between;'>
			<h4 class="tertiaryHeading">{project.name}</h4>
			<div class="optionsContainer">
				{#if isLoadingProject}
					<div
						class="loader"
						style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
					></div>
				{:else}
					<button
						class="tertiaryButton"
						onclick={async () => {
							const files = await getProjectFiles(project.id);
							console.log(files);
							addElement($elements, 'code', files, project.name, project.id);
							$elements = $elements;
							$apps = false;
						}}>Edit</button
					>
					<button
						class="tertiaryButton"
						onclick={async () => {
							window.open(`/app/${project.id}`);
						}}>Preview</button
					>
					<button
						class="tertiaryButton"
						onclick={() => {
							deleteProject = true;
						}}>Delete</button
					>
				{/if}
			</div>
		</div>

		{#if deleteProject}
			<div>
				<div style="background: hsla(0, 0%, 0%, 0.03); padding: 10px; border-radius: 10px; margin-top: 10px;">
					<div style="display: flex; align-items: center; justify-content: center;">
						<span class="warning"></span>
						<p style="margin: 0;">Are you sure? This action can't be undone.</p>
					</div>

					{#if isDeletingProject}
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
									deleteProject = false;
								}}>Cancel</button
							>
							<button
								class="primaryButton"
								onclick={async () => {
									await deleteProjectFiles(project.id);
									deleteProject = false;
									await getProjectsList();
									$projectsList = $projectsList;
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
	.projectNameContainer {
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
	.projectNameContainer:hover{
		background: hsl(0, 0%, 93%);
	}
	.optionsContainer {
		display: flex;
	}
</style>
