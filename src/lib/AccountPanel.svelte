<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import CodeSnippetMonaco from './CodeSnippetMonaco.svelte';
	import {
		textColor,
		height,
		width,
		elements,
		projectsList,
		templates,
		account,
		isUserAuthenticated,
		loginPanelState,
		user,
		chatModel,
		visionModel,
		imageModel,
		appsPanelState
	} from '$lib/store';
	import { generateUUID } from './utils';
	import SimpleProjectCard from './SimpleProjectCard.svelte';
	import { page } from '$app/stores';

	let projectsListData: any = $state(),
		createdByUser: any = $state(false);

	async function getTemplate(name = '') {
		const message = await fetch(`${$page.url.origin}/api/code-templates`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: name
			})
		});
		const messageObject = await message.json();
		console.log(messageObject);

		return messageObject;
	}

	// function addElement(elements: any, type = 'code', files = '') {
	// 	elements.push({
	// 		uuid: generateUUID(),
	// 		type: type,
	// 		files: files,
	// 		run: true
	// 	});
	// 	console.log(elements);
	// }

	let isLoggingOut = $state(false),
		addCredits = $state(false);

	async function logout() {
		isLoggingOut = true;
		const formData = new FormData();
		const response = await fetch(`${$page.url.origin}/api/user/logout`, {
			method: 'POST',
			body: formData
		});
		const responseObject = await response.json();
		if (responseObject.message === 'Logged out') {
			$isUserAuthenticated = false;
			$user = undefined;
			isLoggingOut = false;
			$loginPanelState = true;
		}
	}
</script>

<div class="container" transition:slide style="height: calc({$height}px - 20px);">
	<div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
		<h2>Account</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$account = false;
			}}>quit</button
		>
	</div>
	
	<div class="wrapper">
		<div class="item-wrapper">
			<h3 class="tertiaryHeading">Email</h3>
			<p>{$user.email}</p>
		</div>
		<div class="item-wrapper" style='display: flex; flex-direction: column;'>
			<div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
				<h3 class="tertiaryHeading">Credits</h3>
				<div style="display: flex; align-items: center;">
					<p style='margin-right: 20px;'>{$user.requests}</p>
					<button
						class="tertiaryButton"
						onclick={() => {
							addCredits = !addCredits;
						}}>Add credits</button
					>
				</div>
			</div>
			{#if addCredits}
					<div transition:slide style='display: flex; align-items: center;'>
						<span class="warning"></span>
						<p>Please, reach out via Discord</p>
					</div>
				{/if}
		</div>

		
		<div class="item-wrapper" style='display: flex; flex-direction: column; align-items: start;'>
			<h3 class="tertiaryHeading" style='margin-bottom: 10px;'>Chat models</h3>
			<button class={$chatModel === 'llama3.3-70b' ? 'secondaryButton' : 'tertiaryButton'} onclick={(e:any)=>{
				$chatModel = e.target.innerText;
				}}>llama3.3-70b</button>
			<button class={$chatModel === 'mixtral-8x22B-Instruct-v0.1' ? 'secondaryButton' : 'tertiaryButton'} onclick={(e:any)=>{
				$chatModel = e.target.innerText;
				}}>
				mixtral-8x22B-Instruct-v0.1
			</button>
			<button class={$chatModel === 'deepseek-V3' ? 'secondaryButton' : 'tertiaryButton'} onclick={(e:any)=>{
				$chatModel = e.target.innerText;
				}}>
				deepseek-V3
			</button>
		</div>

		<div class="item-wrapper" style='display: flex; flex-direction: column; align-items: start;'>
			<h3 class="tertiaryHeading" style='margin-bottom: 10px;'>Vision models</h3>
			<button class={$visionModel === 'llama3.2-90b' ? 'secondaryButton' : 'tertiaryButton'} onclick={(e:any)=>{
				$visionModel = e.target.innerText;
				}}>llama3.2-90b</button>
		</div>
		<div class="item-wrapper" style='display: flex; flex-direction: column; align-items: start;'>
			<h3 class="tertiaryHeading" style='margin-bottom: 10px;'>Image models</h3>
			<button class={$imageModel === 'flux-schnell' ? 'secondaryButton' : 'tertiaryButton'} onclick={(e:any)=>{
				$imageModel = e.target.innerText;
				}}>flux-schnell</button>
		</div>
		<button type="submit" class="tertiaryButton" onclick={logout}>Log Out</button>
	</div>
</div>

<style>
	.container {
		width: calc(100% - 20px);
		margin: 10px;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
	}
	.wrapper {
		overflow-y: auto;
		border-radius: 0px;
	}
	.item-wrapper {
		border: none;
		border-radius: 10px;
		background: hsl(0, 0%, 95%);
		color: #1a1a1a;
		padding: 10px;
		margin: 0 0 5px 0;
		font-weight: 300;
		font-family: 'Robot', sans-serif;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
	}
	.item-wrapper:hover {
		background: hsl(0, 0%, 93%);
	}
</style>
