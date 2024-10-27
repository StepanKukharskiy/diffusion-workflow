<script lang="ts">
	import { width, height, textColor, bgColor, filesLocalCopy } from './store';
	import FilesPanel from './FilesPanel.svelte';
	import ProjectPanel from './ProjectPanel.svelte';
	import { page } from '$app/stores';

	let {
		files = [
			{
				fileName: 'index.html',
				fileData: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Hello world!</title>

    <!-- import the webpage's stylesheet -->
    <link rel="stylesheet" href="./style.css" />

    <!-- import the webpage's javascript file -->
    <script src="./script.js" defer></\script>
  </head>
  <body>
    <h2>
      We can see only a short distance ahead, but we can see plenty there that
      needs to be done.
    </h2>
    <p>Alan Turing, Computing Machinery and Intelligence</p>
  </body>
</html>
`
			},
			{
				fileName: 'style.css',
				fileData: `body{
            background: red;
        }`
			},
			{
				fileName: 'script.js',
				fileData: `console.log('hi')`
			}
		]
	} = $props();

	let container: any = $state(),
		fullScreenMode = $state(false),
		isSettingsVisible = $state(false),
		resizeHandle = $state(),
		resizeState = $state(false),
		filesPanelWidth = $state(200),
		resizeCoverDiv: any = $state();

	let filesPanelButton: any = $state();
	let filesPanelDisplay = $state('block');

	function resize(event: any) {
		resizeCoverDiv.style.display = 'block';
		// console.log(event.offsetX);
		// filesPanelWidth = event.clientX;
		const containerRect = container.getBoundingClientRect();
    filesPanelWidth = event.clientX - containerRect.left - 10;
		if (filesPanelWidth < 200) {
			filesPanelWidth = 200;
			resizeState = false;
		}
	}

	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}

	function toggleFullScreen() {
		fullScreenMode = !fullScreenMode;
		console.log($width);
		console.log($height);
		if (fullScreenMode) {
			container.style.position = 'absolute';
			container.style.top = 0;
			container.style.left = 0;
			container.style.zIndex = 99;
			container.style.width = `${$width}px`;
			container.style.maxWidth = '8000px';
			container.style.height = `${$height}px`;
		} else {
			container.style.position = 'relative';
			container.style.width = `100%`;
			container.style.maxWidth = '800px';
			container.style.height = `fit-content`;
		}
	}

	function togglePanelState() {
		console.log(filesPanelDisplay);
		filesPanelDisplay === 'block' ? (filesPanelDisplay = 'none') : (filesPanelDisplay = 'block');
	}
</script>

<svelte:window
	onpointermove={(e) => {
		if (resizeState) {
			resize(e);
		}
	}}
	onpointerup={() => {
		resizeState = false;
		// resizeCoverDiv.style.display = 'none';
	}}
/>

<div class="elementContainer" bind:this={container}>
	<details open style="height: 100%;">
		<summary>
			<div class="colorLine" style="background: #F7D2C4"></div>
			<h3 style="color: hsl({$textColor})">Code</h3>
		</summary>
		<div style="display: flex; margin: 10px 0; height: calc(100% - 90px); min-height: {fullScreenMode ? 'auto' : '400px'};">
			{#if filesPanelDisplay === 'block'}
			<div
				style="width: {filesPanelWidth}px; padding-right: 5px; box-sizing: border-box; position: relative; z-index: 2;"
			>
				<button
					bind:this={filesPanelButton}
					class="panelButton"
					style="border: 1px solid hsla({$textColor}, 20%); background: hsl({$bgColor});"
					onclick={togglePanelState}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
						><title>icon_quit</title><line
							x1="0.5"
							y1="0.5"
							x2="18.52"
							y2="18.52"
							style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
						/><line
							x1="0.5"
							y1="18.52"
							x2="18.52"
							y2="0.5"
							style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
						/></svg
					>
				</button>
				
					<FilesPanel {files} projectName="My App" panelWidth={filesPanelWidth} />
				
			</div>
			{:else}
			<div style='position: absolute; height: 100%; z-index:2;'>
			<button
					bind:this={filesPanelButton}
					class="panelButton"
					style="border: 1px solid hsla({$textColor}, 20%); background: hsl({$bgColor}); left: -10px;"
					onclick={togglePanelState}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 19.02 19.02"
						><title>icon_quit</title><line
							x1="0.5"
							y1="0.5"
							x2="18.52"
							y2="9.52"
							style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
						/><line
							x1="18.52"
							y1="9.52"
							x2="0.5"
							y2="18.52"
							style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"
						/></svg
					>
				</button>
				</div>
			{/if}
			{#if $width > 700 && filesPanelDisplay === 'block'}
				<div
					class="resizeHandle"
					style="background: hsl({$textColor + ', 5%'});"
					bind:this={resizeHandle}
					onpointerdown={() => {
						resizeState = true;
					}}
				></div>
			{/if}

			<div
				style="flex: 1; padding-left: 5px; box-sizing: border-box; margin-left: 0px; background: none; position: relative;"
			>
				{#if resizeState}
					<div
						bind:this={resizeCoverDiv}
						style="position: absolute; z-index: 2; top: 5; left: 5; background: #00000005; border-radius: 15px; width: calc(100% - 10px); height: calc(100% - 0px);"
					></div>
				{/if}
				<ProjectPanel />
			</div>
		</div>
		<div class="controlsMenu">
			<button class="optionsButton" onclick={toggleFullScreen}> Full Screen </button>
		</div>
	</details>
</div>

<style>
	.controlsMenu {
		display: flex;
		align-items: center;
	}
	.resizeHandle {
		width: 10px;
		height: auto;
		background: #4233fb;
		border-radius: 5px;
		touch-action: none;
		pointer-events: auto;
		text-align: initial;
		cursor: ew-resize;
	}
	.panelButton {
		position: absolute;
		top: 15px;
		right: -15px;

		display: flex;
		align-items: center;
		justify-content: center;
		/* justify-content: space-between; */

		width: 20px;
		height: 30px;
		border-radius: 0 10px 10px 0;
		border: none;
		background: #1a1a1a50;
		/* background: radial-gradient(#ca94ff, #4233fb); */
		color: white;
		box-sizing: border-box;
		padding: 0;

		cursor: pointer;
	}
</style>
