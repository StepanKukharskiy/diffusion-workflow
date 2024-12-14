<script lang="ts">
	import { textColor } from '$lib/store';
	import { generateUUID } from '$lib/utils';
	let uuid = generateUUID();
	let { data } = $props();

	function getFileContents(fileToSearch = '') {
		for (let file of data.files) {
			//console.log(file);
			if (file.fileName === fileToSearch) {
				return file.fileData;
			}
		}
	}

	const userSRCDoc = `<html>
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
</script>

{#if data}
	<div style="width: 100%; height: 100%; min-height: 100vh;">
		<iframe
			srcDoc={userSRCDoc}
			style="width: 100%; height: 100%; border: none;"
			allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; web-share"
			sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-downloads allow-presentation"
			name="Kodiia workspace"
			loading="lazy"
			title="userDoc"
			class="userContainer"
			id="iframe-{uuid}"
		></iframe>
	</div>
{:else}
	<div
		class="loader"
		style="margin-left:: 10px; border-color: hsl({$textColor}) transparent;"
	></div>
{/if}
