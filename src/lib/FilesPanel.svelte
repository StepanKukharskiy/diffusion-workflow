<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		filesLocalCopy,
		width,
		height,
		leftPanelWidthSetByUser,
		bgColor,
		textColor,
		elements
		// editorState
	} from '$lib/store';
	import ProjectFileCard from '$lib/ProjectFileCard.svelte';
	import CodeEditorMonaco from '$lib/CodeEditorMonaco.svelte';

	// import JSZip from 'jszip';

	let { uuid, files = [], panelWidth = $width * 0.2 + 'px' } = $props();
	let fileToOpen = $state('');
	let runCode = $state(false);
	let editorState = $state(false);

	function runEditor(fileName = '') {
		// editorState = !editorState;
		fileToOpen = fileName;
		for (let element of $elements) {
			if (element.uuid === uuid) {
				element.editorState = true;
				editorState = element.editorState;
			}
		}
	}

	let panelState = $state(true);
	let button = $state(),
		buttonText = $state('Run');

	for (let element of $elements) {
		if (element.uuid === uuid) {
			element.editorState = false;
			editorState = element.editorState;
			element.run = false;
			runCode = element.run;
		}
	}

	$effect(() => {
		if ($leftPanelWidthSetByUser > $width * 0.3) {
			panelWidth = $leftPanelWidthSetByUser + 'px';
			if ($leftPanelWidthSetByUser > $width * 0.45) {
				$leftPanelWidthSetByUser = $width * 0.45;
			}
		} else {
			if (panelState) {
				panelWidth = $width * 0.3 + 'px';
				if ($width * 0.3 < 400) {
					panelWidth = '400px';
				}
			}
		}
	});

	function toggleRunCode() {
		console.log(runCode);
		for (let element of $elements) {
			if (element.uuid === uuid) {
				element.run = !element.run;
				runCode = element.run;
				runCode === false ? (buttonText = 'Run') : (buttonText = 'Stop');
			}
		}
	}

	// var zip = new JSZip()

	async function downloadFiles() {
		// const zipFileName = projectName.replace(/\s/g, '');
		// let folder = zip.folder(zipFileName)
		// for(let file of $filesLocalCopy){
		//     folder.file(file.fileName, file.fileData)
		// }
		// let zipFile = await zip.generateAsync({type:"blob"})
		// const hiddenElement = document.createElement('a');
		// hiddenElement.download = zipFileName + '.zip';
		// const url = URL.createObjectURL(zipFile);
		// hiddenElement.href = url
		// hiddenElement.click();
		// hiddenElement.remove()
	}

	$effect(() => {
		for (let element of $elements) {
			if (element.uuid === uuid) {
				editorState = element.editorState;
				runCode = element.run;
				runCode === false ? (buttonText = 'Run') : (buttonText = 'Stop');
			}
		}
	});
</script>

<div
	class="panel"
	style="flex: 0 0 {panelWidth}px; height: 100%; z-index: 2; background: hsl({$bgColor}); border: 1px solid hsl({$textColor +
		', 20%'})"
>
	<!-- <div class='handle' on:pointerdown={()=>{setUserPanelSize = true}} on:pointerup={()=>{setUserPanelSize = false}} on:pointermove={updateUserPanelSize} on:pointerleave={()=>{setUserPanelSize = false}}></div> -->
	<div class="contentContainer">
		<div>
			<!-- <h3 style="margin: 0; font-weight: 300; height: 30px;">{projectName}</h3> -->
			<!-- {#if editorState}
				<button
					class="smallMenuButton"
					onclick={() => {
						editorState = false;
					}}>files</button
				>
			{/if} -->
		</div>
		<div
			class="filesAndEditorWrapper"
			style="height: {editorState ? 'calc(100% - 40px)' : 'calc(100% - 47px)'}"
		>
			{#if editorState}
				<div style="height: 100%; background: none;">
					<CodeEditorMonaco
						{uuid}
						fileName={fileToOpen}
						readOnly={false}
						editorText="Some code here"
					/>
				</div>
			{:else}
				<div class="filesContainer">
					<!-- <p style="margin-top: 0">Click files to open</p> -->
					{#each files as file, index}
						<ProjectFileCard
							name={file.fileName}
							action={() => {
								runEditor(file.fileName);
							}}
						/>
					{/each}
					<!-- <button class='downloadButton' on:click={downloadFiles} style='color: hsl({$textColor});'>Download files as .zip</button> -->
				</div>
			{/if}
		</div>
		<div class="bottomButtonsWrapper">
			<!-- <div class='buttonWrapper' style='background: linear-gradient(hsl({$primaryColor}), hsl({$accentColor}))'>
                    <button on:click={downloadFiles} style='background: hsl({$bgColor}); color: hsl({$textColor});'>Download</button>
                </div> -->
			<button
				class="tertiaryButton"
				bind:this={button}
				onclick={() => {
					toggleRunCode();
					$elements = $elements;
				}}>{buttonText}</button
			>
		</div>
	</div>
</div>

<style>
	.panel {
		box-sizing: border-box;
		width: 100%;
		position: relative;
		background: #fdfdfd;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 15px;
		padding: 10px;
		box-sizing: border-box;
		/* margin: 10px; */
		/* transition: all 0.25s; */
	}

	.contentContainer {
		width: 100%;
		height: 100%;
	}
	.filesAndEditorWrapper {
		height: calc(100% - 40px);
		overflow-y: scroll;
	}
	.filesContainer {
		width: 100%;
		height: calc(100% - 55px);
	}

	.bottomButtonsWrapper {
		width: 100%;
		display: flex;
	}
</style>
