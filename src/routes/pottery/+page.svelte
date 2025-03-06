<script lang="ts">
	import { page } from '$app/stores';
	import { LoadingManager } from 'three';
	let isGenerating: any, textarea: any;

	async function getResponse(data = { query: '' }) {
		isGenerating = true;
		const message = await fetch(`${$page.url.origin}/api/pottery-test`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: data.query
			})
		});
		const messageObject = await message.json();
		const result = messageObject;
		console.log(messageObject);
		isGenerating = false;
		textarea.value = '';

		const link = document.createElement('a');
		link.href = `${result.url}`;
		link.download = `image`; // Set the filename for download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
        
		// return generatedText;
	}
</script>

<textarea bind:this={textarea} placeholder="Описание"></textarea>
{#if !isGenerating}
<button
	onclick={() => {
		const query = { query: textarea.value };
		getResponse(query);
	}}>Go</button
>
{:else}
Loading...
{/if}
