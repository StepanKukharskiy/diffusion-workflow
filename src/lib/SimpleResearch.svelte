<script lang="ts">
	import { page } from '$app/stores';
	import { elements, textColor, user } from './store';
	import StyledModelAnswer from './StyledModelAnswer.svelte';
	import { deleteBlock, generateUUID, updateCredits } from './utils';
	import SimpleTextCard from './SimpleTextCard.svelte';

	let {
        query = '',
        model = '',
		answer = { query: 'research task', text: 'research output'},
		uuid = '',
		options = false
	} = $props();

    console.log(answer.choices[0].message.content)

	let isGeneratingImage = $state(false),
		modelOption = $state('flux-schnell'),
		refImageUrl = $state(''),
		maskImageUrl = $state(''),
		generatedImageUrl = $state(''),
        text = answer.choices[0].message.content,
        links = answer.citations,
        images = answer.images

	// const conceptualRefsArray = JSON.parse(answer.conceptualRefs);
	let linksToSearch = [];
	// for (let link of conceptualRefsArray) {
	// 	const encodedString = encodeURIComponent(link);
	// 	const googleUrl = `https://www.google.com/search?q=${encodedString}`;
	// 	linksToSearch.push({ text: link, url: googleUrl });
	// }
	// let prompt;
	// if (answer.prompt) {
	// 	prompt = answer.prompt.trim().replace(/^"(.*)"$/, '$1');
	// 	console.log(prompt);
	// }

	// async function generateImage() {
	// 	isGeneratingImage = true;
	// 	// if (maskImageUrl != '') {
	// 	// 	modelOption = 'flux-dev-inpaint';
	// 	// }
	// 	// const message = await fetch(`${$page.url.origin}/api/image-generation`, {
	// 	// 	method: 'POST',
	// 	// 	headers: {
	// 	// 		'Content-Type': 'application/json'
	// 	// 	},
	// 	// 	body: JSON.stringify({
	// 	// 		refImageUrl: referenceImageUrl,
	// 	// 		maskUrl: '',
	// 	// 		prompt: prompt,
	// 	// 		model: 'flux-depth-pro',
	// 	// 		projectId: $page.params.projectId
	// 	// 	})
	// 	// });
	// 	const message = await fetch(`${$page.url.origin}/api/ai/response`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			model: '',
	// 			imageModel: '',
	// 			imageCompositionReferenceModel: 'flux-depth-pro',
	// 			systemPrompt: '',
	// 			query: `${prompt}`,
	// 			previousAnswers: '',
	// 			projectId: $page.params.projectId,
	// 			referenceImage: referenceImageUrl,
	// 			maskImage: ''
	// 		})
	// 	});
	// 	const messageObject = await message.json();
	// 	generatedImageUrl = messageObject.url;
	// 	isGeneratingImage = false;
	// 	return generatedImageUrl;
	// }
</script>

<div class="textContainer">
	<h4 class="query">{query}</h4>
	{#if text}
		<StyledModelAnswer htmlContent={text} />
	{/if}
    <div class="option-image-wrapper">
		{#if images}
        <div class='images-grid'>
			{#each images as image}
            <button class='tertiaryButton' onclick={()=>{
                window.open(`${image.image_url}`, '_blank')
            }
            }>
			<img src={image.image_url} alt="research visual option" />
        </button>
            {/each}
        </div>
		{/if}
	</div>
	<div class="links-wrapper">
		<h4 class="query" style="text-align: start;">Resources:</h4>
		{#if links}
        <div style='display: flex;'>
        {#each links as link, i}
        <a href='{link}' target = '_blank'>{i+1}</a>
        {/each}
    </div>
		{/if}
	</div>

	{#if options}
		{#if !isGeneratingImage}
			<div style="display: flex; flex-wrap: wrap;">
                {#if model}
				<span>{model}</span>
				{/if}
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
		/* text-align: center; */
	}
    .images-grid{
        width: 100%;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
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
        margin-right: 10px;
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
    span{
		font-size: 1rem;
		padding: 10px;
		border-radius: 10px;
		background-color: hsl(0, 0%, 93%);
	}
</style>
