<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		filesLocalCopy,
		fileToOpen,
		editorState,
		width,
		height,
		leftPanelWidthSetByUser,
		bgColor,
		textColor,
		runCode
	} from '$lib/store';
	import ProjectFileCard from '$lib/ProjectFileCard.svelte';
	import CodeEditorMonaco from '$lib/CodeEditorMonaco.svelte';
	// import JSZip from 'jszip';

	let { files = [], projectName = '', panelWidth = $width * 0.2 + 'px' } = $props();

	
	function runEditor(fileName = '') {
		$editorState = !$editorState;
	}

	// let panelWidth = $state($width * 0.3 + 'px');
	let panelState = $state(true);
	let button = $state(),
		buttonText;

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
</script>


	<div
		class="panel"
		style="flex: 0 0 {panelWidth}px; height: 100%; z-index: 2; background: hsl({$bgColor}); border: 1px solid hsl({$textColor +
			', 20%'})"
	>

		<!-- <div class='handle' on:pointerdown={()=>{setUserPanelSize = true}} on:pointerup={()=>{setUserPanelSize = false}} on:pointermove={updateUserPanelSize} on:pointerleave={()=>{setUserPanelSize = false}}></div> -->
		<div class="contentContainer">
			<div>
				<h3 style="margin: 0; font-weight: 300; height: 50px;">{projectName}</h3>
			</div>
			<div class="filesAndEditorWrapper">
				{#if $editorState}
					<div style="height: calc(100% - 0px); background: none;">
						<CodeEditorMonaco fileName={$fileToOpen} readOnly={false} editorText="Some code here" />
					</div>
				{:else}
					<div class="filesContainer">
						<p style="margin-top: 0">Click files to open</p>
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
					class="generationControlsButton"
					style="display: flex; align-items: center; justify-content: center; width: 100px; height: 40px; background: hsla({$textColor}, 20%); color: hsl({$textColor}); margin-top: 10px; border: none;"
					onclick={() => {
						$runCode = !$runCode;
						console.log($filesLocalCopy);
					}}>{$runCode === false ? 'Run' : 'Stop'}</button
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
		height: calc(100% - 100px);
		overflow-y: scroll;
	}
	.filesContainer {
		width: 100%;
	}

	h3 {
		font-weight: 300;
	}

	.bottomButtonsWrapper {
		width: 100%;
		display: flex;
	}
</style>
