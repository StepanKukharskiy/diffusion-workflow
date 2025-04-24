<script lang="ts">
	import { page } from '$app/stores';
	import { elements, textColor, user } from './store';
	import StyledModelAnswer from './StyledModelAnswer.svelte';
	import { deleteBlock, generateUUID, updateCredits } from './utils';
	import SimpleTextCard from './SimpleTextCard.svelte';

	let {
		referenceImageUrl = '',
		answer = { thoughtProcess: '', text: '', conceptualRefs: '', prompt: '', imageOptionUrl: '' },
		uuid = '',
		options = false
	} = $props();

	function addElement(elements: any, type = 'critique', query = '', generatedImageUrl = '') {
		elements.push({
			uuid: generateUUID(),
			type: type,
			referenceImageUrl: referenceImageUrl,
			query: query,
			imageUrl: generatedImageUrl
		});
	}

	let isGeneratingImage = $state(false),
		modelOption = $state('flux-schnell'),
		refImageUrl = $state(''),
		maskImageUrl = $state(''),
		generatedImageUrl = $state('');

	// const conceptualRefsArray = JSON.parse(answer.conceptualRefs);
	let linksToSearch = [];
	// for (let link of conceptualRefsArray) {
	// 	const encodedString = encodeURIComponent(link);
	// 	const googleUrl = `https://www.google.com/search?q=${encodedString}`;
	// 	linksToSearch.push({ text: link, url: googleUrl });
	// }
	let prompt;
	if (answer.prompt) {
		prompt = answer.prompt.trim().replace(/^"(.*)"$/, '$1');
		console.log(prompt);
	}

	async function generateImage() {
		isGeneratingImage = true;
		// if (maskImageUrl != '') {
		// 	modelOption = 'flux-dev-inpaint';
		// }
		// const message = await fetch(`${$page.url.origin}/api/image-generation`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify({
		// 		refImageUrl: referenceImageUrl,
		// 		maskUrl: '',
		// 		prompt: prompt,
		// 		model: 'flux-depth-pro',
		// 		projectId: $page.params.projectId
		// 	})
		// });
		const message = await fetch(`${$page.url.origin}/api/ai/response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: '',
				imageModel: '',
				imageCompositionReferenceModel: 'flux-depth-pro',
				systemPrompt: '',
				query: `${prompt}`,
				previousAnswers: '',
				projectId: $page.params.projectId,
				referenceImage: referenceImageUrl,
				maskImage: ''
			})
		});
		const messageObject = await message.json();
		generatedImageUrl = messageObject.url;
		isGeneratingImage = false;
		return generatedImageUrl;
	}
</script>

<div class="textContainer">
	<h4 class="query">Design Insights</h4>
	<div class="image-wrapper">
		<img src={referenceImageUrl} alt="critique data" />
	</div>
	<details>
		<summary>Thought process</summary>
		{#if answer.thoughtProcess}
			<StyledModelAnswer htmlContent={answer.thoughtProcess} />
		{/if}
	</details>
	{#if answer.text}
		<StyledModelAnswer htmlContent={answer.text} />
	{/if}
	<div class="links-wrapper">
		<h4 class="query" style="text-align: start;">Read more:</h4>
		{#if answer.conceptualRefs}
			{#each answer.conceptualRefs as ref}
				<details>
					{#if ref.request}
						<summary>{ref.request}</summary>
					{/if}
					{#if ref.response}
						<StyledModelAnswer htmlContent={ref.response.choices[0].message.content} />
						{#each ref.response.images as image, index}
							<div class="option-image-wrapper">
								<img src={image.image_url} alt="relevant visual" />
							</div>
						{/each}
						{#each ref.response.citations as link, index}
							<div style="display: flex; align-items: center;">
								<b>{index}</b>&nbsp;<a href={link} target="_blank">{link}</a>
							</div>
						{/each}
					{/if}
				</details>
			{/each}
		{/if}
	</div>
	<h4>Design Options</h4>
	<div class="option-image-wrapper">
		{#if answer.prompt}
			<div style="display: flex; flex-direction: column; width: 100%;">
				<SimpleTextCard label={'Description'} text={answer.prompt} />
			</div>
		{/if}
		{#if answer.imageOptionUrl}
			<img src={answer.imageOptionUrl} alt="design option" />
		{/if}
		{#if answer.imageOptionUrl2}
			<img src={answer.imageOptionUrl2} alt="second design option" />
		{/if}
		{#if answer.imageOptionUrl3}
			<img src={answer.imageOptionUrl3} alt="third design option" />
		{/if}
	</div>

	{#if options}
		{#if !isGeneratingImage}
			<div style="display: flex; flex-wrap: wrap;">
				<!-- <button
					class="tertiaryButton"
					onclick={async () => {
						console.log(answer.prompt)
						console.log(prompt)
						const url = await generateImage();
						
						addElement($elements, 'image', prompt, url);
						$elements = $elements;
						$user.requests = await updateCredits(
							'image',
							`${$page.url.origin}/api/user/update-credits`
						);
					}}>Create another design option</button
				> -->
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
				<p style="margin-right: 10px;">Generating image</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.textContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	.query {
		/* background: #1a1a1a20; */
		padding: 10px 0;
		box-sizing: border-box;
		border-radius: 10px;
		text-align: center;
	}
	details {
		border-bottom: 1px solid #1a1a1a20;
	}
	.image-wrapper {
		width: 100%;
		display: flex;
		margin-bottom: 20px;
		justify-content: flex-end;
	}
	.image-wrapper img {
		width: 50%;
		max-width: 400px;
	}
	.links-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-bottom: 20px;
	}
	.links-wrapper a {
		display: block;
		width: fit-content;
		padding: 10px;
		background-color: hsl(0, 0%, 93%);
		border-radius: 10px;
		margin: 5px 0;
	}
	.option-image-wrapper {
		width: 100%;
		max-width: 800px;
		display: flex;
		flex-direction: column;
		margin: 20px 0;
		/* justify-content: flex-end; */
	}
	.option-image-wrapper img {
		width: 100%;
		max-width: 800px;
		margin: 20px 0 0 0;
	}
</style>
