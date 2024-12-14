<script lang="ts">
	import { elements, textColor, projectsList } from './store';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';
	type Project = { name: string; id: string };
	let { project = { name: '', id: '' }, action } = $props() as { project: Project; action: any };
	let isLoadingProject: any = $state(false),
		deleteProject: any = $state(false),
		isDeletingProject: any = $state(false);

	async function getProjectFiles(id = '') {
		isLoadingProject = true;
		const formData = new FormData();
		formData.append('id', id);
		const projectFiles = await fetch(`${$page.url.origin}/api/projects/get-files`, { method: 'POST', body: formData });
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

<div class="projectNameContainer">
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
				}}>Edit</button
			>
			<button
				class="tertiaryButton"
				onclick={async () => {
					window.open(`/projects/${project.id}`);
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
		{#if isDeletingProject}
			<div
				class="loader"
				style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
			></div>
		{:else}
			<div style="display: flex;">
				<span class="warning"></span>
				<p>Are you sure? This action can't be undone.</p>
			</div>
			<div style="display: flex;">
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
{/if}

<style>
	.projectNameContainer {
		padding: 0px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.optionsContainer {
		display: flex;
	}
</style>
