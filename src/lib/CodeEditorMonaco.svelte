<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	import ConsolePanel from '$lib/ConsolePanel.svelte';
	import * as prettier from 'prettier';
	import parserBabel from 'prettier/plugins/babel';
	import parserHTML from 'prettier/plugins/html';
	import parserEstree from 'prettier/plugins/estree';
	import parserCSS from 'prettier/plugins/postcss';
	import parserMarkdown from 'prettier/plugins/markdown';

	import { consolePanelState, bgColor, textColor, elements, runCode, user, editorState } from '$lib/store';
	import { getFileLogoURL } from '$lib/utils';

	let editorContainer: any;
	let editor: any;
	let Monaco: any;
	let editorCreated = $state(false);

	// for(let file of $filesLocalCopy){
	//     console.log(file.fileData)
	// }

	let { uuid, fileName = 'index.html', readOnly = false, editorText = 'Some code here' } = $props();

	// export let fileName = 'index.html'
	let mode = $state(fileName.split('.')[1]);
	let parserMode = $state();
	let formatOptions: any;

	// console.log(fileName);

	console.log(`uuid from CodeEditorPanel - ${uuid}`);

	let logoPath = getFileLogoURL(fileName.split('.')[1]);

	for (let element of $elements) {
		// console.log(element);
		if (element.uuid === uuid) {
			for (let file of element.files) {
				if (fileName === file.fileName) {
					editorText = file.fileData;
				}
			}
		}
	}

	async function formatText(text = '') {
		if (mode === 'md' || mode === 'ino' || mode === 'svg') {
			mode = 'text';
		}

		if (mode === 'js') {
			mode = 'javascript'; // This may not be necessary
			parserMode = 'babel'; // Ensure this is correct
		} else {
			parserMode = mode; // Ensure mode is a valid parser name
		}

		// console.log('Mode:', mode);
		// console.log('Parser Mode:', parserMode);

		formatOptions = {
			parser: parserMode,
			plugins: [parserBabel, parserHTML, parserEstree, parserCSS]
		};
		let formattedEditorText = await prettier.format(text, formatOptions);
		return formattedEditorText;
	}

	// runCode.subscribe(async (value) => {
	// 	if (value === true) {
	// 		const formattedCode = await prettier.format(editor.getValue(), formatOptions);
	// 		updateFileData(formattedCode);
	// 		consoleMessages.set([]);
	// 	}
	// });

	// @ts-ignore
	onMount(async () => {
		resetEditor();

		self.MonacoEnvironment = {
			getWorker: function (_moduleId, label) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		let editorTheme = 'vs-light';
		// $theme === 'dark' ? editorTheme = 'vs-dark' : editorTheme = 'vs-light'

		// console.log('initial mode: ' + mode)
		if (mode === 'md' || mode === 'ino' || mode === 'svg') {
			mode = 'text';
		}
		if (mode === 'js') {
			mode = 'javascript'; // This may not be necessary
			parserMode = 'babel'; // Ensure this is correct
		} else {
			parserMode = mode; // Ensure mode is a valid parser name
		}

		// @ts-ignore
		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(editorContainer, {
			value: editorText,
			language: mode,
			fontSize: 14,
			theme: editorTheme,
			scrollbar: {
				verticalScrollbarSize: 5,
				horizontalScrollbarSize: 5
			},
			automaticLayout: true
		});
		editorCreated = true;

		let saveTimeout: any = $state();
		editor.onDidChangeModelContent(async function () {
			// $runCode = false;

			if (mode === 'md' || mode === 'ino' || mode === 'svg') {
				mode = 'text';
			}
			// console.log(mode);
			if (mode === 'js' || mode === 'javascript') {
				mode = 'javascript'; // This may not be necessary
				parserMode = 'babel'; // Ensure this is correct
			} else {
				parserMode = mode; // Ensure mode is a valid parser name
			}

			// console.log(mode);
			// console.log(parserMode);

			formatOptions = {
				parser: parserMode,
				plugins: [parserBabel, parserHTML, parserEstree, parserCSS]
			};

			for (let element of $elements) {
				if (element.uuid === uuid) {
					element.run = false;
				}
			}

			const formattedCode = await prettier.format(editor.getValue(), formatOptions);
			// updateFileData(formattedCode);
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(async () => {
				console.log($user);
				updateFileData(formattedCode);
			}, 1000);
			$elements = $elements;
			// console.log(formattedCode)
			// console.log($elements);
		});

		formatText(editorText).then((result) => {
			editor.setValue(result);
		});

		return () => {
			editor.dispose();
		};
	});

	// Reset editor when opening a new project
	function resetEditor() {
		if (editor) {
			editor.dispose();
			editor = null;
		}
	}

	// Call resetEditor when the component is destroyed
	onDestroy(() => {
		resetEditor();
	});

	let button;

	function updateFileData(value = '') {
		console.log(`updating files for this ${uuid}`);
		for (let element of $elements) {
			if (element.uuid === uuid) {
				for (let file of element.files) {
					// console.log(file);
					if (fileName === file.fileName) {
						file.fileData = value;
					}
				}
			}
		}
	}

	async function paste() {
		let text = await navigator.clipboard.readText();
		var selection = editor.getSelection();
		var id = { major: 1, minor: 1 };
		var op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
		editor.executeEdits('my-source', [op]);
	}

	let copyButtonText = $state('copy');
	function copy() {
		let textToCopy = editor.getValue();
		navigator.clipboard.writeText(textToCopy);
		copyButtonText = 'copied';
		setTimeout(function () {
			copyButtonText = 'copy';
		}, 1500);
	}

	function undo() {
		editor.trigger('aaaa', 'undo', 'aaaa');
		editor.focus();
	}

	function redo() {
		editor.trigger('aaaa', 'redo', 'aaaa');
		editor.focus();
	}
</script>

<div class="container" style="height: 100%;">
	<div
		class="editorContainer"
		style="height: {$consolePanelState && mode === 'javascript' && !readOnly
			? 'calc(100% - 130px)'
			: 'calc(100% - 0px)'}; background: hsl({$bgColor}); color: hsl({$textColor}); border: 1px solid hsl({$textColor +
			', 20%'}); box-sizing: border-box;"
	>
		<div
			class="editorMenu"
			style="background: hsl({$bgColor}); color: hsl({$textColor}); border-bottom:  1px solid hsl({$textColor +
				', 20%'})"
		>
			<!-- {#if !readOnly}
                <button bind:this={button} class="panelButton" on:click={()=>{editorState.set(false);}} >
                    <svg xmlns="http://www.w3.org/2000/svg" width='10' height='10' viewBox="0 0 19.02 19.02"><title>icon_quit</title><line x1="0.5" y1="0.5" x2="18.52" y2="18.52" style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"/><line x1="0.5" y1="18.52" x2="18.52" y2="0.5" style="fill:none;stroke: hsl({$textColor});stroke-linecap:round;stroke-linejoin:round; stroke-width: 3;"/></svg>
                </button>
            {/if} -->
			<div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding-top: 10px;">
				<div style="display: flex; justify-content: center; align-items: center;">
					<img src={logoPath} width="20" height="20" style="margin-right: 0px;" alt="file logo" />
					<h5 style='margin: 0;'>{fileName}</h5>
				</div>
				<button class='tertiaryButton' style='padding: 0;' onclick={()=>{
					for(let element of $elements){
						if(element.uuid === uuid){
							element.editorState = false
							console.log(element)
						}
					}
					$elements = $elements
				}}>close</button>
			</div>
			{#if readOnly}
				<div style="display: flex; align-items: center;">
					<button class="tertiaryButton" style="color: hsl({$textColor});" onclick={copy}
						>{copyButtonText}</button
					>
				</div>
			{:else}
				<div style="display: flex; align-items: center; padding-top: 5px;">
					<button
						class="tertiaryButton"
						type="button"
						style="color: hsl({$textColor}); padding: 0 10px; padding-left: 0px;"
						onclick={paste}>paste</button
					>
					<button
						class="tertiaryButton"
						type="button"
						style="color: hsl({$textColor}); padding: 0 10px;"
						onclick={() => {
							undo();
						}}>undo</button
					>
					<button
						class="tertiaryButton"
						type="button"
						style="color: hsl({$textColor}); padding: 0 10px;"
						onclick={() => {
							redo();
						}}>redo</button
					>
					<button
						class="tertiaryButton"
						type="button"
						style="color: hsl({$textColor}); padding: 0 10px;"
						onclick={async () => {
							formatText(editor.getValue()).then((result) => {
								editor.setValue(result);
							});
						}}>prettify</button
					>
					{#if mode === 'javascript'}
						<button
							class="tertiaryButton"
							type="button"
							style="color: hsl({$textColor}); padding: 0 10px;"
							onclick={() => {
								consolePanelState.set(true);
							}}>console</button
						>
					{/if}
					<!-- <button class="smallMenuButton" on:click={max}>{maxButtonText}</button> -->
				</div>
			{/if}
		</div>

		<div
			class="editor"
			bind:this={editorContainer}
			style="height: {$consolePanelState && mode === 'javascript' && !readOnly
				? 'calc(100% - 80px)'
				: 'calc(100% - 80px)'}"
		>
			{#if !editorCreated}
				<div
					class="editorLoaderContainer"
					style="background: hsl({$bgColor}); color: hsl({$textColor});"
				>
					<div class="editorLoader" style="border-color: hsl({$textColor}) transparent"></div>
					<p class="editorLoadingText">loading editor...</p>
				</div>
			{/if}
		</div>

		<div
			class="editorBottom"
			style="background: hsl({$bgColor}); color: hsl({$textColor}); border-top: 1px solid hsl({$textColor +
				', 20%'});"
		></div>
	</div>

	{#if $consolePanelState && mode === 'javascript' && !readOnly}
		<div style="width: 100%; margin-top: 10px;">
			<ConsolePanel />
		</div>
	{/if}
</div>

<style>
	.editorContainer {
		height: 100%;
		border-radius: 15px;
		position: relative;
	}
	.editor {
		width: calc(100% - 1px);
		height: 100%;
		border-radius: 0 0 15px 15px;
		/* background: #fdfdfd; */
	}
	.editorBottom {
		/* height: 15px; */
		background: #fdfdfd;
		border-top: 1px solid #1a1a1a20;
		border-radius: 0 0 15px 15px;
	}
	.editorLoaderContainer {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.editorLoadingText {
		margin: 0;
	}
	.editorLoader {
		width: 10px;
		height: 10px;
		border: 2px solid;
		border-radius: 50%;
		border-color: #1a1a1a transparent;
		animation: rotation 1s linear infinite;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* .panelButton{
      position: absolute;
      top: 5px;
      right: 0px;
      margin-right: 5px;
            
      display: flex;
      align-items: center;
      justify-content: center;
            
      width: 20px;
      height: 20px;
      border-radius: 10px;
      border: none;
      background: #4233fb00;
      color: white;
      box-sizing: content-box;
      padding: 0;
            
      cursor: pointer;
    }
    .panelButton:hover{
      background: #4233fb20;
    } */

	.editorMenu {
		position: relative;
		background: #fdfdfd;
		border-radius: 15px 15px 0 0;
		border-bottom: 1px solid #dfdfdf;
		display: flex;
		flex-direction: column;
		align-items: start;
		height: 65px;
		padding: 0 10px 0 10px;
	}
	.editorMenu h5 {
		margin: 5px;
		/* font-family: Montserrat, sans-serif; */
		font-size: 1.2rem;
		font-weight: 300;
	}

</style>
