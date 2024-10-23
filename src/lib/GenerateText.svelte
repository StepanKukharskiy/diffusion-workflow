<script lang="ts">
	import { textColor, bgColor, elements } from '$lib/store';
	import { updateConnections, getOutputsPosition, getInputsPosition } from './utils';

	let isGeneratingText = false,
		systemPromptTextarea: any,
		systemPrompt = 'You are a helpful assistant',
		queryTextarea: any,
		query = '',
		responseText: any,
		modelOption: any;
	let isSettingsVisible = $state(false);

	function updateTextareaHeight(textarea: any) {
		textarea.style.height = `auto`;
		textarea.style.height = `${textarea.scrollHeight}px`;
		if (textarea.scrollHeight > 200) {
			textarea.style.height = `200px`;
		}
	}

	async function generateText(data = { model: '', systemPrompt: '', query: '' }) {
		console.log(data);
		const message = await fetch(`/api/text-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: data.model,
				systemPrompt: data.systemPrompt,
				query: data.query
			})
		});
		const messageObject = await message.json();
		const generatedText = messageObject;
		console.log(messageObject);
		isGeneratingText = false;
		return generatedText;
	}

	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}
</script>

<div class="elementContainer">
	<h3>Text</h3>
	<div class="textAndControlsContainer">
		<div class="generationControls">
			<div class="item">
				<label for="query">Query</label>
				<textarea
					bind:this={queryTextarea}
					on:input={(e) => {
						query = e.target.value;
						updateTextareaHeight(queryTextarea);
					}}
					id="query"
					style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor})"
				></textarea>
			</div>
			{#if isSettingsVisible === true}
				<div class="item">
					<label for="model">Model</label>
					<select
						id="model"
						name="model"
						style="color: hsl({$textColor}); background: hsla({$textColor}, 10%);"
						bind:value={modelOption}
						on:change={() => {
							console.log(modelOption);
						}}
					>
						<option value="llama3.1-8b">llama3.1-8b</option>
						<option value="llama3.1-70b">llama3.1-70b</option>
						<option value="llama3.1-405b">llama3.1-405b</option>
						<option value="mistral-7B-Instruct-v0.1">mistral-7B-Instruct-v0.1</option>
						<option value="mixtral-8x22B-Instruct-v0.1">mixtral-8x22B-Instruct-v0.1</option>
						<option value="Qwen2-72B-Instruct">Qwen2-72B-Instruct</option>
					</select>
				</div>
				<div class="item">
					<label for="systemPrompt">System prompt</label>
					<textarea
						bind:this={systemPromptTextarea}
						on:input={(e) => {
							systemPrompt = e.target.value;
							updateTextareaHeight(systemPromptTextarea);
						}}
						id="systemPrompt"
						style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor})"
						>{systemPrompt}</textarea
					>
				</div>
			{/if}
			<div class="controlsMenu">
				<button
					class="generationControlsButton"
					on:click={async () => {
						isGeneratingText = true;
						const response = await generateText({
							model: modelOption,
							systemPrompt: systemPrompt,
							query: query
						});
						console.log(response);
						responseText = response.generatedText;
						updateTextareaHeight(responseText);
					}}
				>
					{#if isGeneratingText}
						<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
					{:else}
						Generate text
					{/if}
				</button>
				<button
					class="optionsButton"
					on:click={
						toggleSettings
					}>Options</button
				>
				<button
					class="removeButton"
					on:click={() => {}}
				>
					Remove
				</button>
			</div>

			<div class="item">
				<!-- <label for="response">Response</label> -->
				<!-- <textarea
					readonly
					bind:this={responseTextarea}
					id="response"
					style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 20%); color: hsl({$textColor})"
				></textarea> -->
				{#if !isGeneratingText}
					<p>{responseText}</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	h3 {
		margin: 0;
		font-weight: 300;
	}
	.elementContainer {
		max-width: 800px;
		/* min-width: 150px;
		min-height: 150px; */
		/* border-radius: 10px; */
		/* position: absolute; */
		box-sizing: border-box;
		/* background: linear-gradient(45deg, #f9f9f910, #f9f9f930); */
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		padding: 0px;
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
		border-bottom: 1px solid #1a1a1a;
		/* align-items: center; */
	}
	
	.textAndControlsContainer {
		display: flex;
		margin-top: 5px;
		width: 100%;
		height: 100%;
	}
	.generationControls {
		width: 100%;
	}
	.item {
		height: fit-content;
		margin: 5px 0;
	}
	label {
		display: block;
		height: 20px;
	}
	select {
		width: 100%;
		border: none;
		border-radius: 10px;
		font-size: 1.2rem;
		padding: 5px;
		box-sizing: border-box;
	}
	textarea {
		width: 100%;
		height: fit-content;
		resize: none;
		border-radius: 10px;
		padding: 5px;
		box-sizing: border-box;
	}
	.controlsMenu {
		display: flex;
		align-items: center;
	}
	.generationControlsButton {
		align-self: center;
		max-width: 300px;
		width: 120px;
		height: 40px;
		background: #1a1a1a10;
		color: #1a1a1a;
		border: none;
		border-radius: 10px;
		padding: 10px;
		margin: 5px 0;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.generationControlsButton:hover {
		background: #1a1a1a20;
	}
	.optionsButton {
		height: 40px;
		/* padding: 10px; */
		border: none;
		border-radius: 10px;
		background: none;
		box-sizing: border-box;
	}
	.removeButton {
		background: none;
		border: none;
		box-sizing: border-box;
		border-radius: 10px;
		cursor: pointer;
	}
	/* .optionsButton:hover{
		background: #1a1a1a10;
	} */
	.loader {
		width: 10px;
		height: 10px;
		margin: 0;
	}
</style>
