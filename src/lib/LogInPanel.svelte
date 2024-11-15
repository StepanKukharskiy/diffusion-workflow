<script lang="ts">
	import { textColor, bgColor, loginPanelState } from './store';
	import { slide } from 'svelte/transition';

	let email = '',
		password = '',
		isLoggingIn = false,
		errorMessage = '';

	async function loginUser(email = '', password = '') {
        errorMessage = ''
		isLoggingIn = true;
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);
		const response = await fetch('/api/login', { method: 'POST', body: formData });
		const responseObject = await response.json();
		console.log(responseObject);
		if (responseObject.message === 'Success') {
			isLoggingIn = false;
			$loginPanelState = false;
		} else {
            isLoggingIn = false;
			errorMessage = responseObject.message;
		}
	}
</script>

<div class="loginContainer">
	<h2>Log In</h2>
    <p style="margin: 10px 0 0 0;">or</p>
	<p style="margin: 10px 0 0 0;">
		<a href="/register" style="color: hsl({$textColor});">sing up</a> if you don't have an account.
	</p>

	<div class="inputContainer">
		<label for="email" class="formLabel">
			<span class="labelSpan">email</span>
		</label>
		<input
			type="email"
			bind:value={email}
			name="email"
			class="formInput"
			placeholder="your@email.com"
			style="background: hsl({$bgColor}) !important; color: hsl({$textColor}) !important; "
		/>
	</div>
	<div class="inputContainer">
		<label for="password" class="formLabel">
			<span class="labelSpan">password</span>
		</label>
		<input
			type="password"
			bind:value={password}
			name="password"
			class="formInput"
			placeholder="*******"
			style="background: hsl({$bgColor}) !important; color: hsl({$textColor});"
		/>
	</div>
	<!-- <a href='/reset-password' style='color: hsl({$textColor});'>I forgot my password</a> -->
	{#if !isLoggingIn}
		<div class="inputContainer">
			<button
				class="submitButton"
				onclick={() => {
					loginUser(email, password);
				}}>Log In</button
			>
		</div>
	{:else}
		<div style="display: flex; align-items: center;" transition:slide>
			<span class="warning"></span>
			<p style="margin-right: 10px;">Trying to log in</p>
			<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
		</div>
	{/if}

	{#if errorMessage != ''}
		<p>{errorMessage}</p>
	{/if}

	<!-- {#if form?.notVerified}
        <div class='alertContainer'>
            <p>Please, verify your email before logging in.</p>
        </div>
    {/if} -->
</div>

<style>
	.loginContainer {
		position: absolute;
		top: 60px;
		left: 10px;
		width: calc(100% - 20px);
		height: calc(100% - 70px);
		padding: 10px;
		background: #f9f9f9;
		border: 1px solid #1a1a1a20;
		border-radius: 10px;
		box-sizing: border-box;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}
	.inputContainer {
		display: flex;
		flex-direction: column;
		padding-top: 10px;
		box-sizing: border-box;
	}
	input {
		min-width: 200px;
		appearance: none;
		font-family:
			Source Code Pro,
			sans-serif;
		font-size: 1rem;
		border: 1px solid #1a1a1a30;
		border-radius: 10px;
		padding: 10px;
		box-sizing: border-box;
		margin-top: 10px;
	}
	.submitButton {
		background: #1a1a1a;
		color: #f9f9f9;
		border: none;
		border-radius: 10px;
		height: 40px;
	}
</style>
