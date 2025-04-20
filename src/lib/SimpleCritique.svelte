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
	console.log(answer);
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

	const conceptualRefsArray = JSON.parse(answer.conceptualRefs);
	let linksToSearch = [];
	for (let link of conceptualRefsArray) {
		const encodedString = encodeURIComponent(link);
		const googleUrl = `https://www.google.com/search?q=${encodedString}`;
		linksToSearch.push({ text: link, url: googleUrl });
	}

	const prompt = answer.prompt.trim().replace(/^"(.*)"$/, '$1');
	console.log(prompt);

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
		<StyledModelAnswer htmlContent={answer.thoughtProcess} />
	</details>
	<StyledModelAnswer htmlContent={answer.text} />
	<div class="links-wrapper">
		<h4 class="query" style="text-align: start;">Read more:</h4>
		{#each linksToSearch as link}
			<a href={link.url} target="_blank"><span class="black-dot"></span>{link.text}</a>
		{/each}
	</div>
	<h4>Design Options</h4>
	<div class="option-image-wrapper">
		<div style="display: flex; flex-direction: column; width: 100%;">
			<SimpleTextCard label={'Description'} text={answer.prompt} />
		</div>
		<img src={answer.imageOptionUrl} alt="design option" />
		<img src={answer.imageOptionUrl2} alt="second design option" />
		<img src={answer.imageOptionUrl3} alt="third design option" />
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
	.image-wrapper img{
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
		width: fit-content;
		padding: 10px;
		background-color: hsl(0, 0%, 93%);
		border-radius: 10px;
		margin: 5px 0;
	}
	.option-image-wrapper{
		width: 100%;
		max-width: 800px;
		display: flex;
		flex-direction: column;
		margin: 20px 0;
		/* justify-content: flex-end; */
	}
	.option-image-wrapper img{
		width: 100%;
		max-width: 800px;
		margin: 20px 0 0 0;
	}
</style>
