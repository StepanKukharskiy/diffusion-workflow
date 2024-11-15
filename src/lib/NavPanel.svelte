<script>
	// import kodiia_logo_bw from '$lib/logos/kodiia_logo_bw.svg'
	import kodiia_small from '$lib/logos/kodiia_small.svg';
	import { bgColor, textColor, width, height, tutorialsPanelState, loginPanelState } from './store';
	import { page } from '$app/stores';
	import LogInPanel from './LogInPanel.svelte';

	// console.log($page)

	export let data;

	// function changeTheme(){
	//     if($theme === 'dark'){
	//         $theme = 'light';
	//         $bgColor = '0, 0%, 98%';
	//         $secondaryColor = '0, 0%, 100%'
	//         $textColor = '0, 0%, 10%'
	//         $primaryColor = '155, 70%, 45%'
	//         $accentColor = '80, 95%, 40%'
	//     } else {
	//         $theme = 'dark';
	//         $bgColor = '0, 0%, 5%';
	//         $secondaryColor = '0, 0%, 15%'
	//         $textColor = '0, 0%, 98%'
	//         $primaryColor = '155, 70%, 55%'
	//         $accentColor = '80, 95%, 60%'
	//     }
	// }

	function toggleTutorials() {
		$tutorialsPanelState = !$tutorialsPanelState;
	}

	let mobileMenuDisplay = 'none';
</script>

<nav style="color: {$textColor};">
	{#if $width > 700}
		<div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
			<a href="https://kodiia.com">
				<img src={kodiia_small} style="border-radius: 0" height="30" alt="logo" />
			</a>

			<div class="desktopMenu">
				<button class="smallMenuButton" onclick={toggleTutorials}>Resources</button>
				{#if data.user}
					<form action="/logout" method="POST">
						<button type="submit" class="smallMenuButton">Log Out</button>
					</form>
					<!-- <button class="smallMenuButton" on:click='{()=>{stylesPanelState.set(true)}}'>Set theme</button> -->
				{:else}
					<!-- <a class="smallMenuButton" href="/register">Sign Up</a> -->
					<button
						class="smallMenuButton"
						onclick={() => {
							$loginPanelState = true;
						}}>Log In</button
					>
				{/if}
				<!-- <button class='smallMenuButton' on:click={changeTheme}>◑</button> -->
			</div>
		</div>
	{:else}
		<div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
			<a href="https://kodiia.com">
				<img src={kodiia_small} style="border-radius: 0" height="30" alt="logo" />
			</a>

			<button
				class="menuButton"
				onclick={() => {
					mobileMenuDisplay === 'none'
						? (mobileMenuDisplay = 'block')
						: (mobileMenuDisplay = 'none');
				}}
			>
				{#if mobileMenuDisplay === 'none'}
					<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
						<line x1="10" y1="20" x2="40" y2="20" stroke="#1a1a1a" stroke-width="2" />
						<line x1="10" y1="30" x2="40" y2="30" stroke="#1a1a1a" stroke-width="2" />
					</svg>
				{:else}
					<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
						<line x1="15" y1="15" x2="35" y2="35" stroke="#1a1a1a" stroke-width="2" />
						<line x1="15" y1="35" x2="35" y2="15" stroke="#1a1a1a" stroke-width="2" />
					</svg>
				{/if}
			</button>
		</div>
		<hr style="display: {mobileMenuDisplay}; margin: 0; width: 100%;" />
		<div class="mobileMenu" style="display: {mobileMenuDisplay}; height: calc({$height}px - 80px);">
			<!-- {#if $page.route.id == '/projects/[projectUrl]/edit'}
                <button class="smallMenuButton" style='padding: 10px;' on:click='{()=>{$filesPanelDisplay = 'block'; mobileMenuDisplay = 'none'}}'>Files</button>
            {/if} -->

			<button
				class="smallMenuButton"
				onclick={() => {
					toggleTutorials();
					mobileMenuDisplay = 'none';
				}}>Resources</button
			>

			{#if data.user}
				<form action="/logout" method="POST">
					<button type="submit" class="smallMenuButton" style="padding: 10px;">Log Out</button>
				</form>
				<!-- <button class="smallMenuButton" style='padding: 10px;' on:click='{()=>{stylesPanelState.set(true)}}'>Set theme</button> -->
			{:else}
				<!-- <a class="smallMenuButton" style="padding: 10px;" href="/register">Sign Up</a> -->
				<button
						class="smallMenuButton"
						onclick={() => {
                            mobileMenuDisplay = 'none'
							$loginPanelState = true;
						}}>Log In</button
					>
			{/if}
		</div>
	{/if}
</nav>

{#if $loginPanelState}
	<LogInPanel />
{/if}

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		min-height: 40px;
		width: calc(100% - 20px);
		box-sizing: border-box;
		border-radius: 25px;
		background: #fdfdfd;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		padding: 0 20px;
		margin: 10px;
		box-shadow: 0 0 10px rgba(152, 152, 152, 0.3);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 25;
	}

	.desktopMenu {
		display: flex;
		align-items: center;
	}
	.mobileMenu {
		width: 100%;
		overflow-y: auto;
		margin-bottom: 10px;
		padding-bottom: 10px;
		box-sizing: border-box;
		z-index: 20;
	}

	.menuButton {
		width: 40px;
		height: 40px;
		border: none;
		transform: scale(1);
		background: none;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}
	.menuButton:hover {
		background: none;
		transform: scale(1.1);
	}
</style>
