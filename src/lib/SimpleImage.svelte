<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { elements, referenceImageUrl, textColor, chatPanelMode, user, maskImageUrl } from './store';
	import { generateUUID, generateVideo, deleteBlock, generateModel, updateCredits, addElement } from './utils';
	import SimpleTextCard from './SimpleTextCard.svelte';
	let { imageUrl = '', query = '', uuid = '', options = false } = $props();

	// function addElement(
	// 	elements: any,
	// 	type = 'text',
	// 	query = '',
	// 	generatedImageUrl = '',
	// 	generatedVideoUrl = '',
	// 	generatedModelUrl = ''
	// ) {
	// 	if (type === 'image') {
	// 		elements.push({
	// 			uuid: generateUUID(),
	// 			type: type,
	// 			query: query,
	// 			imageUrl: generatedImageUrl
	// 		});
	// 	} else if (type === 'video') {
	// 		elements.push({
	// 			uuid: generateUUID(),
	// 			type: type,
	// 			query: query,
	// 			refImageUrl: generatedImageUrl,
	// 			videoUrl: generatedVideoUrl
	// 		});
	// 	} else if (type === '3dViewer') {
	// 		elements.push({
	// 			uuid: generateUUID(),
	// 			type: type,
	// 			query: query,
	// 			refImageUrl: generatedImageUrl,
	// 			modelUrl: generatedModelUrl
	// 		});
	// 	} else if ((type = 'sketch')) {
	// 		elements.push({
	// 			uuid: generateUUID(),
	// 			type: type,
	// 			imageUrl: imageUrl
	// 		});
	// 	}
	// }

	function addSketchElement(elements:any) {
		elements.push({
			uuid: generateUUID(),
			type: 'sketch',
			imageUrl: imageUrl
		});
	}

	function addImageElement(elements:any, newImageUrl:any) {
		console.log(newImageUrl)
		elements.push({
			uuid: generateUUID(),
			type: 'image',
			query: 'Upscaled image',
			imageUrl: newImageUrl
		});
	}

	function addCritiqueElement(elements:any, referenceImageUrl:any, critiqueData: any) {
		elements.push({
			uuid: generateUUID(),
			type: 'critique',
			referenceImageUrl: referenceImageUrl,
			answer: critiqueData
		});
		console.log(elements)
	}

	let isGenerating = $state(false),
		modelOption = $state('flux-schnell'),
		refImageUrl = $state(''),
		generatedImageUrl = $state('');

	// async function generateImage() {
	// 	isGenerating = true;
	// 	// if (maskImageUrl != '') {
	// 	// 	modelOption = 'flux-dev-inpaint';
	// 	// }
	// 	if (maskImageUrl != '') {
	// 		modelOption = 'flux-dev-inpaint';
	// 	}
	// 	if ($referenceImageUrl != '') {
	// 		// modelOption = 'sdxl-controlnet-canny';
	// 		modelOption = 'flux-dev-controlnet-depth';
	// 	}
	// 	console.log('query: ' + query);
	// 	const message = await fetch(`${$page.url.origin}/api/image-generation`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			refImageUrl: $referenceImageUrl,
	// 			maskUrl: maskImageUrl,
	// 			prompt: query,
	// 			model: modelOption,
	// 			projectId: $page.params.projectId
	// 		})
	// 	});
	// 	console.log(message);
	// 	const messageObject = await message.json();
	// 	generatedImageUrl = messageObject.imageUrl;
	// 	console.log(`api response: ${messageObject}`);
	// 	isGenerating = false;
	// 	return generatedImageUrl;
	// }

	async function upscaleImage(){
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/ai/response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				referenceImage: imageUrl,
				query: 'An image I need to UPSCALE',
				imageModel: 'recraft-crisp-upscale',
				projectId: $page.params.projectId
			})
		});
		const messageObject = await message.json();
		generatedImageUrl = messageObject.url;
		console.log(`api response: ${messageObject}`);
		console.log(`api response image: ${generatedImageUrl}`);
		isGenerating = false;
		return generatedImageUrl;
	}

	async function critiqueImage(){
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/ai/critique`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				referenceImage: imageUrl,
				query: query,
				projectId: $page.params.projectId,
				previousAnswers: getContext($elements),
			})
		});
		const messageObject = await message.json();
		// generatedImageUrl = messageObject.url;
		console.log(`api response: ${messageObject.generatedText}`);
		// console.log(`api response image: ${generatedImageUrl}`);
		isGenerating = false;
		return { thoughtProcess: messageObject.thoughtProcess, text: messageObject.generatedText, conceptualRefs: messageObject.conceptualRefs, prompt: messageObject.prompt } ;
	}

	function getContext(elements: any) {
		let context = [];
		for (let element of elements) {
			if (element.type === 'text') {
				context.push(element.answer);
			}
			if (element.type === 'code') {
				for (let file of element.files) {
					context.push(
						JSON.stringify({
							name: file.fileName,
							data: file.fileData
						})
					);
				}
			}
		}
		return context;
	}
</script>

<div class="imageContainer">
	<img src={imageUrl} alt="generated file" />
	{#if options}
		{#if !isGenerating}
			<div style="display: flex; flex-wrap: wrap;">
				<div style="display: flex; flex-direction: column; width: 100%;">
					<SimpleTextCard label={'Description'} text={query} />
				</div>
				<button
					class="tertiaryButton"
					onclick={async () => {
						const critiqueData = await critiqueImage()
						console.log(critiqueData)
						addCritiqueElement($elements, imageUrl, critiqueData)
						$elements = $elements
						$user.requests = await updateCredits(
							'critique',
							`${$page.url.origin}/api/user/update-credits`
						);
					}}>Critique</button
				>
				<button
					class="tertiaryButton"
					onclick={async () => {
						$referenceImageUrl = imageUrl;
						$chatPanelMode = 'chat';
					}}>Use as a reference image</button
				>
				<button
					class="tertiaryButton"
					onclick={async () => {
						$maskImageUrl = imageUrl;
						$chatPanelMode = 'chat';
					}}>Use as a mask</button
				>
				<button
					class="tertiaryButton"
					onclick={async () => {
						const imageUrl = await upscaleImage()
						console.log(imageUrl)
						addImageElement($elements, imageUrl)
						$elements = $elements
						$user.requests = await updateCredits(
							'image',
							`${$page.url.origin}/api/user/update-credits`
						);
					}}>Upscale</button
				>

				<button
					class="tertiaryButton"
					onclick={async () => {
						addSketchElement($elements);
						$elements = $elements
					}}>Sketch</button
				>
				<button
					onclick={() => {
						navigator.clipboard.writeText(
							`${$page.url.origin}/api/get-file/${$page.params.projectId}/${imageUrl.split('/')[7]}`
						);
					}}
					class="tertiaryButton">Copy URL</button
				>
				<button
					onclick={() => {
						// window.open(
						// 	`${$page.url.origin}/api/get-file/${$page.params.projectId}/${videoUrl.split('/')[7]}`,
						// 	'_blank'
						// );
						const link = document.createElement('a');
						link.href = `${$page.url.origin}/api/get-file/${$page.params.projectId}/${imageUrl.split('/')[7]}`;
						link.download = `${imageUrl.split('/').pop()}`; // Set the filename for download
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}}
					class="tertiaryButton">Download</button
				>
				<button
					class="tertiaryButton"
					onclick={async () => {
						deleteBlock($elements, uuid);
						$elements = $elements;
					}}>Delete</button
				>
			</div>
		{:else}
			<div style="display: flex; align-items: center;">
				<span class="warning"></span>
				<p style="margin-right: 10px;">Generating</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.imageContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	img {
		display: block;
		width: 100%;
		max-width: 600px;
		margin: auto;
	}
</style>
