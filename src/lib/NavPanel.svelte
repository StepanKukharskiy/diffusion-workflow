<script>
	import kodiia_small from '$lib/logos/kodiia_small.svg';
	import { slide } from 'svelte/transition';
	import {
		bgColor,
		textColor,
		width,
		height,
		tutorialsPanelState,
		appsPanelState,
		loginPanelState,
		isUserAuthenticated,
		user,
		isSavingThread,
		account
	} from './store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import LogInPanel from './LogInPanel.svelte';
	import AccountPanel from './AccountPanel.svelte';

	let isLoggingOut = false;
	console.log($user);

	$effect(() => {
		if ($user === undefined) {
			$loginPanelState = true;
		}
	});
</script>

{#if $account}
	<div
		style="width: 100%; position: absolute; top: 0; left: 0; z-index: 99; display: flex; justify-content: center;"
	>
		<AccountPanel />
	</div>
{:else}
	<div class="nav-container">
		<nav style="color: {$textColor};">
			<div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
				<a href="https://kodiia.com">
					<img src={kodiia_small} style="border-radius: 0" height="30" alt="logo" />
				</a>

				<div class="desktopMenu">
					<button
						class="tertiaryButton"
						onclick={() => {
							window.open('/threads', '_self');
						}}>Threads</button
					>
					{#if $user}
						{#if !isLoggingOut}
							<button
								class="primaryButton"
								onclick={() => {
									$account = true;
								}}
							>
								{$user.requests}
								{#if $isSavingThread}
									<div class="loader" style="border-color: transparent white;"></div>
								{:else}
									<div
										style="padding: 0 0 0 10px; box-sizing: border-box; display: flex; align-items: center; justify-content: center;"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<circle cx="10" cy="4" r="2" fill="white" />
											<circle cx="10" cy="10" r="2" fill="white" />
											<circle cx="10" cy="16" r="2" fill="white" />
										</svg>
									</div>
								{/if}
							</button>
						{:else}
							<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
						{/if}
					{:else}
						<button
							class="tertiaryButton"
							onclick={() => {
								$loginPanelState = true;
							}}>Log In</button
						>
					{/if}
				</div>
			</div>
		</nav>
	</div>
{/if}

{#if $loginPanelState}
	<LogInPanel />
{/if}

<style>
	.nav-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99;
	}
	nav {
		min-height: 40px;
		width: 100%;
		max-width: 1200px;
		box-sizing: border-box;
		border-radius: 10px;
		background: #fdfdfd;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		padding: 10px;
		margin: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 99;
	}

	.desktopMenu {
		display: flex;
		align-items: center;
	}
</style>
