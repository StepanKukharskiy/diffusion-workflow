<script lang='ts'>
    import { elements, textColor } from "./store";
    import { generateUUID } from "./utils";
    type Project = { name: string; id: string };
    let { project = {name: '', id: ''} } = $props() as {project: Project}
    let isLoadingProject: any = $state(false)

    async function getProjectFiles(id = '') {
		isLoadingProject = true;
		const formData = new FormData();
		formData.append('id', id);
		const projectFiles = await fetch('/api/projects/get-files', { method: 'POST', body: formData });
		const projectFilesData = await projectFiles.json();
		console.log(projectFilesData)
		isLoadingProject = false;
		return projectFilesData.files;
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

<div class="projectNameContainer">
    <h4 class="tertiaryHeading">{project.name}</h4>
    <div class='optionsContainer'>
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
                    console.log(files)
                    addElement($elements, 'code', files);
                    $elements = $elements
                }}>Edit</button
            >
            <button
                class="tertiaryButton"
                onclick={async () => {
                    window.open(`/projects/${project.id}`)
                }}>Share</button
            >
        {/if}
    </div>
</div>

<style>
    .projectNameContainer {
		padding: 0px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
    .optionsContainer{
        display: flex;
    }
</style>