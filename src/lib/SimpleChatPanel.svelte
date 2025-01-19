<script lang="ts">
	import { page } from '$app/stores';
	import SimpleTextCard from './SimpleTextCard.svelte';
	import { elements, user, referenceImageUrl } from './store';
	import { generateUUID, updateCredits } from './utils';
	import { slide } from 'svelte/transition';

	let textarea: any = $state(),
		isGenerating = $state(false),
		systemPrompt = $state('You are a helpful assistant'),
		query = $state(''),
		modelOption = $state('llama3.3-70b'),
		fileInput: any = $state(),
		uploadingFile = $state(false);

	function updateTextareaHeight() {
		textarea.style.height = `40px`;
		textarea.style.height = `${textarea.scrollHeight}px`;
		if (textarea.scrollHeight > 200) {
			textarea.style.height = `200px`;
		}
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

	async function getResponse(data = { model: '', systemPrompt: '', query: '' }) {
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/ai/response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: data.model,
				systemPrompt: data.systemPrompt,
				query: data.query,
				previousAnswers: getContext($elements),
				projectId: $page.params.projectId,
				referenceImage: $referenceImageUrl
			})
		});
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGenerating = false;
		textarea.value = '';

		return generatedText;
	}

	async function uploadFile(file: any) {
		uploadingFile = true;
		const formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('projectId', $page.params.projectId);

		try {
			const response = await fetch(`${$page.url.origin}/api/save-image`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				uploadingFile = false;
				console.error('Upload failed:', response.statusText);
			} else {
				const result = await response.json();
				const fileUrl = result.url;
				uploadingFile = false;
				return result.url;
			}
		} catch (error) {
			uploadingFile = false;
			console.error('Error during upload:', error);
		}
	}

	// Handle file input change
	async function handleFileInputChange(event: any) {
		if (event.target.files.length > 0) {
			const fileToUpload = event.target.files[0];
			const fileUrl = await uploadFile(fileToUpload);
			const query = 'uploaded file';
			addElement($elements, 'image', query, '', fileUrl);
			$elements = $elements;
		}
	}

	function addElement(elements: any, type = 'text', query = '', answer = '', url = '') {
		if (type === 'text') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				answer: answer
			});
			elements = elements;
		}
		if (type === 'image') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				imageUrl: url,
				referenceImageUrl: $referenceImageUrl
			});
		}
		if (type === 'video') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				videoUrl: url
			});
		}
		if (type === 'model') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				query: query,
				modelUrl: url
			});
		}
		console.log(elements);
	}
</script>

{#if query === '?'}
	<div class="hint" transition:slide>
		<div
			style="display: flex; width: 100%; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(0, 0%, 95%);"
		>
			<h2>Manual</h2>
			<button
				class="tertiaryButton"
				onclick={() => {
					query = '';
					textarea.value = '';
				}}>quit</button
			>
		</div>
		<div class="hintsWrapper" style='max-height: calc(100vh - {textarea.style.height} - 160px);'>
			<h3>AI features</h3>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Chat</h3>
				<p>
					To use the <b>chat</b> feature, simply ask questions or provide text-based instructions.
					To utilize the <b>vision</b> feature, provide a reference image URL that you would like to
					discuss with the AI.
				</p>
				<SimpleTextCard
					label={'Chat query example'}
					text={`What is the design language of the house on the waterfall by Frank Lloyd Wright?`}
				/>
				<SimpleTextCard
					label={'Image reference chat query example'}
					text={`What is the design language of the building in this image:
					https://yourimage.com/image.jpg?`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Images</h3>
				<p>
					To generate images, provide a description of the desired image. If you want to maintain
					the composition of a specific image, ask the AI to use that image as a composition
					reference and provide its URL. The output will be in JPEG format.
				</p>
				<SimpleTextCard
					label={'Image query example'}
					text={`A private house in the woods, above the waterfall, horizontal blocks, minimal
					design, natural materials, autumn, warm light inside.`}
				/>

				<SimpleTextCard
					label={'Composition reference query example'}
					text={`A private house in the woods, above the waterfall, horizontal simple block, minimal
					design, natural materials, autumn, warm light inside; composition reference:
					https://yourimage.com/image.jpg.`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Vector graphics</h3>
				<p>
					To generate vector graphics, provide a description of the image you want to create and
					specify that it is a vector graphic request. Vector graphics can include illustrations or
					icons. The output will be in SVG format.
				</p>
				<SimpleTextCard
					label={'Vector illustration query example'}
					text={`A vector illustration of a private house in the woods above the waterfall.`}
				/>
				<SimpleTextCard
					label={'Icon query example'}
					text={`An icon of a house, black and white, minimal design.`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Videos</h3>
				<p>
					To create a video, provide a text description and specify that it is a video request. You
					can also include an image URL to utilize the image-to-video feature. The output will be in
					MP4 format.
				</p>
				<SimpleTextCard
					label={'Video query example'}
					text={`A cinematic shot of a house in the woods above the waterfall, with warm lights inside during autumn and falling leaves.`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">3D models</h3>
				<p>
					To generate a 3D model, specify that you need a 3D model and provide a reference image
					URL. The output will be in GLB format based on the provided image.
				</p>
				<SimpleTextCard
					label={'3D model query example'}
					text={`Turn this image into a 3D model: https://yourimage.com/image.jpg`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Interpolation</h3>
				<p>
					Interpolation is used to create a video from a sequence of frames. Specify that you need
					interpolation and provide a series of URLs for this feature. The output will be an MP4
					video file with transitions between frames.
				</p>
				<SimpleTextCard
					label={'Interpolation query example'}
					text={`Interpolate these images: https://yourimage.com/image1.jpg, https://yourimage.com/image2.jpg, https://yourimage.com/image3.jpg`}
				/>
			</div>
			<h3 style='margin-top: 20px;'>Projects</h3>
			<p>Projects contain a list of projects created by you.</p>
			<h3>Resources</h3>
			<p>Resources contain a list of tutorials.</p>
			<h3>Apps</h3>
			<p>Apps contain templates to create your frontend apps as well as apps that were already created by you.</p>
		</div>
	</div>
{/if}

<div class="chatPanelContainer">
	{#if $referenceImageUrl}
		<button
			onclick={() => {
				$referenceImageUrl = '';
			}}
			style="border: none; padding: 0; margin: 0 10px 0 0; width: 40px; height: 40px; background: none;"
		>
			<img
				src={$referenceImageUrl}
				alt="reference"
				style="width: 40px; height: 40px; border-radius: 10px; margin-right: 10px;"
			/>
		</button>
	{/if}
	<textarea
		bind:this={textarea}
		oninput={(e: any) => {
			query = e.target.value;
			updateTextareaHeight();
		}}
		placeholder={$referenceImageUrl
			? 'Type questions or prompts for images, videos, and 3d models using the reference image.'
			: `Type "?" for manual. Type questions or prompts for images, SVGs, videos, and 3d models.`}
	></textarea>
	{#if isGenerating || uploadingFile}
		<div
			style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
		>
			<div class="loader"></div>
		</div>
	{:else}
		<button
			class="tertiaryButton"
			style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
			aria-label="Upload File"
			onclick={() => {
				fileInput.click();
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a4 4 0 0 1 5.66 5.66l-8.48 8.48a2 2 0 0 1-2.83-2.83l7.78-7.78"
				/>
			</svg>
		</button>
		<input
			type="file"
			accept="image/*"
			bind:this={fileInput}
			onchange={handleFileInputChange}
			style="display: none;"
		/>
		<button
			id="magicButton"
			class="primaryButton"
			disabled={query === '' ? true : false}
			onclick={async () => {
				const response = await getResponse({
					model: modelOption,
					systemPrompt: systemPrompt,
					query: query
				});
				addElement($elements, response.type, query, response.generatedText, response.url);
				$elements = $elements;
				updateTextareaHeight();
				$user.requests = await updateCredits(
					response.type,
					`${$page.url.origin}/api/user/update-credits`
				);
			}}
		>
			Go
		</button>
	{/if}
</div>

<style>
	.hint {
		width: 100%;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		margin-bottom: 10px;
	}
	.hintsWrapper {
		max-height: 200px;
		overflow-y: auto;
	}
	.chatPanelContainer {
		width: 100%;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
	}
	textarea {
		border: none;
		border-radius: 0;
		border-bottom: 1px solid hsl(0, 0%, 90%);
		background: none;
		background-color: hsla(0, 0%, 0%, 0.05);
		color: hsl(0, 0%, 10%);
		font-size: 1rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		height: 40px;
		padding: 10px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
	}
	#magicButton {
		width: 40px;
		height: 40px;
	}
</style>
