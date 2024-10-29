<script lang="ts">
	import { elements, consoleMessages, textColor } from '$lib/store';

	let userSRCDoc = $state('');
	let { uuid } = $props();

	console.log(`uuid from ProjectPanel: ${uuid}`);

	$effect(() => {
		console.log('updated');
		console.log(`showing project with this: ${uuid}`);
		for (let element of $elements) {
			if (element.uuid === uuid && element.run) {
				userSRCDoc = `<html>
            <body>${getFileContents('index.html')}</body>
            <style>${getFileContents('style.css')}</style>
            <script type='module'>
                console.oldLog = console.log;
                console.log = function(value){
                    console.oldLog(value);
                    window.parent.postMessage({
                        source: 'iframe',
                        message: {text: typeof value === 'string' ? value : JSON.stringify(value), type: 'text'},
                    }, '*');
                };
                window.onerror = function (value) { 
                    window.parent.postMessage({
                        source: 'iframe',
                        message: {text: value, type: 'error'},
                    }, '*');
                }
					function renderScene() {
                        renderer.render(scene, camera);
                    }

                    // Expose the render function to the parent window
                    window.renderThreeJsScene = renderScene;
					
                ${getFileContents('script.js')}
            <\/script>
               
        </html>`;
			}
		}
	});

	function getFileContents(fileToSearch = '') {
		for (let element of $elements) {
			if (element.uuid === uuid) {
				for (let file of element.files) {
					//console.log(file);
					if (file.fileName === fileToSearch) {
						return file.fileData;
					}
				}
			}
		}
	}

	function handleMessage(response: any) {
		if (response.data && response.data.source === 'iframe') {
			$consoleMessages = [...$consoleMessages, response.data.message];
		}
	}
</script>

<svelte:window onmessage={handleMessage} />

<div style="width: 100%; height: 100%;">
	<iframe
		srcDoc={userSRCDoc}
		style="width: 100%; height: 100%; border-radius: 15px; box-sizing: border-box; border: 1px solid hsl({$textColor +
			', 20%'});"
		allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; web-share"
		sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-downloads allow-presentation"
		name="Kodiia workspace"
		loading="lazy"
		title="userDoc"
		class="userContainer"
		id="iframe-{uuid}"
	></iframe>
</div>

<style>
	.userContainer {
		background: none;
		color: #1a1a1a;
		z-index: 0;
		border: none;
		border-radius: 15px;
		/* margin: 0 17px; */
		/* box-shadow: 0px 0px 10px rgba(61, 149, 238, 0.5); */
	}
</style>
