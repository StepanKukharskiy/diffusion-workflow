<script lang="ts">
	import { textColor, bgColor, elements } from '$lib/store';

    import GenerateText from '$lib/GenerateText.svelte';

	let isCreateOptionsVisible = false;
    let createButton:any;

    function addElement(elements:any = [], type = 'text'){
        elements.push({
            type: type,
            systemPrompt: '',
            query: ''
        })
    }

    function scrollToCreateButton(){
        createButton.scrollIntoView({ behavior: 'smooth' });
    }
</script>

<h1>Diffusion Workflow</h1>

{#each $elements as element}
{#if element.type === 'text'}
<GenerateText />
{/if}
{/each}

<button
bind:this = {createButton}
style="background: hsl({$textColor}); color: hsl({$bgColor});"
class='createButton'
	on:click={() => {
		isCreateOptionsVisible = !isCreateOptionsVisible;
	}}>Create</button
>

{#if isCreateOptionsVisible}
	<button
		class="createOptionsMenu"
		style="color: hsl({$textColor});"
		on:click={() => {
			isCreateOptionsVisible = false;
            addElement($elements, 'text')
            $elements = $elements
            scrollToCreateButton();
		}}>text</button
	>
	<button
		class="createOptionsMenu"
		style="color: hsl({$textColor});"
		on:click={() => {
			isCreateOptionsVisible = false;
            addElement($elements, 'image')
            $elements = $elements
            scrollToCreateButton();
		}}>image</button
	>
	<button
		class="createOptionsMenu"
		style="color: hsl({$textColor});"
		on:click={() => {
			isCreateOptionsVisible = false;
            addElement($elements, 'video')
            $elements = $elements
            scrollToCreateButton();
		}}>video</button
	>
{/if}



<style>
    .createButton{
        padding: 10px;
        box-sizing: border-box;
        border: none;
        border-radius: 10px;
    }
	.createOptionsMenu {
		background: none;
		border: none;
	}
</style>
