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
		imageCompositionReferenceModel,
		videoModel,
		modelModel,
		frameInterpolationModel,
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

<div
	class="container"
	transition:slide
	style="height: calc({$height}px - 20px); overflow-y: scroll;"
>
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
		<div class="item-wrapper" style="display: flex; flex-direction: column;">
			<div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
				<h3 class="tertiaryHeading">Credits</h3>
				<div style="display: flex; align-items: center;">
					<p style="margin-right: 20px;">{$user.requests}</p>
					<button
						class="tertiaryButton"
						onclick={() => {
							addCredits = !addCredits;
						}}>Add credits</button
					>
				</div>
			</div>
			{#if addCredits}
				<div transition:slide style="display: flex; align-items: center;">
					<span class="warning"></span>
					<p>Please, reach out via <a href="https://discord.gg/PWjgJafMkF">Discord</a></p>
				</div>
			{/if}
		</div>

		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">Chat models</h3>
			<button
				class="tertiaryButton"
				onclick={(e: any) => {
					$chatModel = e.target.innerText;
				}}
			>
				<span class={$chatModel === 'llama3.3-70b' ? 'black-dot' : 'transparent-dot'}></span>
				llama3.3-70b</button
			>
			<button
				class="tertiaryButton"
				onclick={(e: any) => {
					$chatModel = e.target.innerText;
				}}
			>
				<span class={$chatModel === 'mixtral-8x22B-Instruct-v0.1' ? 'black-dot' : 'transparent-dot'}
				></span>
				mixtral-8x22B-Instruct-v0.1
			</button>
			<button
				class="tertiaryButton"
				onclick={(e: any) => {
					$chatModel = e.target.innerText;
				}}
				><span class={$chatModel === 'deepseek-V3' ? 'black-dot' : 'transparent-dot'}></span>
				deepseek-V3
			</button>
		</div>

		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">Vision models</h3>
			<button
				class="tertiaryButton"
				onclick={(e: any) => {
					$visionModel = e.target.innerText;
				}}
			>
				<span class={$visionModel === 'llama3.2-90b' ? 'black-dot' : 'transparent-dot'}></span>
				llama3.2-90b</button
			>
		</div>
		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">Image models</h3>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$imageModel = e.target.innerText;
				}}>
				<span class={$imageModel === 'flux-schnell' ? 'black-dot' : 'transparent-dot'}></span>
				flux-schnell</button
			>
		</div>
		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">
				Image composition reference models
			</h3>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$imageCompositionReferenceModel = e.target.innerText;
				}}>
				<span class={$imageCompositionReferenceModel === 'flux-canny-pro' ? 'black-dot' : 'transparent-dot'}></span>
				flux-canny-pro</button
			>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$imageCompositionReferenceModel = e.target.innerText;
				}}><span class={$imageCompositionReferenceModel === 'flux-depth-pro' ? 'black-dot' : 'transparent-dot'}></span>
				flux-depth-pro</button
			>
		</div>
		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">Video models</h3>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$videoModel = e.target.innerText;
				}}>
				<span class={$videoModel === 'video-01' ? 'black-dot' : 'transparent-dot'}></span>
				video-01</button
			>
		</div>
		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">3D models</h3>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$modelModel = e.target.innerText;
				}}>
				<span class={$modelModel === 'trellis' ? 'black-dot' : 'transparent-dot'}></span>
				trellis</button
			>
		</div>
		<div class="item-wrapper" style="display: flex; flex-direction: column; align-items: start;">
			<h3 class="tertiaryHeading" style="margin-bottom: 10px;">Frame interpolation models</h3>
			<button
				class='tertiaryButton'
				onclick={(e: any) => {
					$frameInterpolationModel = e.target.innerText;
				}}>
				<span class={$frameInterpolationModel === 'amt-interpolation' ? 'black-dot' : 'transparent-dot'}></span>
				amt-interpolation</button
			>
		</div>
		<button class="tertiaryButton" onclick={logout}>Log Out</button>
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
