<script lang="ts">

    let { label = '', text = '' } = $props()
</script>

<p style="margin: 10px 0;">{label}</p>
<div style="display: flex;">
	<p class="descriptionButton" style="margin: 0;">
		{text}
	</p>
	<button
		class="tertiaryButton"
		style="align-self: flex-end; width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
		aria-label="Copy Text"
		onclick={() => {
			// copy the textarea content to the clipboard
			navigator.clipboard
				.writeText(text)
				.then(() => {
					console.log('text copied to clipboard');
				})
				.catch((err: any) => {
					console.error('could not copy text: ', err);
				});
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
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
		</svg>
	</button>
</div>
