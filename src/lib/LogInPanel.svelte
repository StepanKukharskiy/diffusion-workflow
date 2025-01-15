<script lang="ts">
	import { textColor, bgColor, loginPanelState, isUserAuthenticated, user } from './store';
	import { slide } from 'svelte/transition';

	let email = '',
		password = '',
		isLoggingIn = false,
		isRegistering = false,
		isResettingPassword = false,
		login = true,
		signUp = false,
		resetPassword = false,
		confirmPassword = '',
		errorMessage = '';

	async function loginUser(email = '', password = '') {
		errorMessage = '';
		isLoggingIn = true;
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);
		const response = await fetch('/api/user/login', { method: 'POST', body: formData });
		const responseObject = await response.json();
		if (responseObject.user.verified) {
			$user = responseObject.user;
			console.log(responseObject);
			if (responseObject.message === 'Success') {
				isLoggingIn = false;
				$loginPanelState = false;
				$isUserAuthenticated = true;
				window.location.reload();
			} else {
				isLoggingIn = false;
				errorMessage = responseObject.message;
			}
		} else {
			isLoggingIn = false;
			errorMessage = 'Please, verify your email';
		}
	}

	async function registerUser(email = '', password = '') {
		errorMessage = '';
		isRegistering = true;
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);
		formData.append('passwordConfirm', confirmPassword);
		const response = await fetch('/api/user/register', { method: 'POST', body: formData });
		const responseObject = await response.json();
		console.log(responseObject);
		if (responseObject.message === 'Success') {
			isRegistering = false;
			signUp = false;
			resetPassword = false;
			login = true;
		} else {
			isRegistering = false;
			errorMessage = responseObject.message;
		}
	}

	async function resetUserPassword(email = '') {
		errorMessage = '';
		isResettingPassword = true;
		const formData = new FormData();
		formData.append('email', email);
		const response = await fetch('/api/user/reset', { method: 'POST', body: formData });
		const responseObject = await response.json();
		console.log(responseObject);
		if (responseObject.message === 'Success') {
			isResettingPassword = false;
			signUp = false;
			resetPassword = false;
			login = true;
		} else {
			isResettingPassword = false;
			errorMessage = responseObject.message;
		}
	}
</script>

<div class="loginContainer">
	{#if login}
		<div class="wrapper">
			<h2>Log In</h2>

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
					<div style="display: flex; align-items: center;">
						<button
							class="submitButton"
							onclick={() => {
								loginUser(email, password);
							}}>Log In</button
						>
					</div>
				</div>
			{:else}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Trying to log in</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{/if}

			{#if errorMessage != ''}
				<p><span class="warning"></span>{errorMessage}</p>
			{/if}

			<div style="display: flex">
				<button
							class="smallMenuButton"
							style="text-decoration: underline; padding-left: 0;"
							onclick={() => {
								resetPassword = true;
								login = false;
								signUp = false;
							}}
						>
							Reset password
						</button>
				<p style="margin: 10px 0 0 0;">or</p>
				<button
					type="button"
					style="text-decoration: underline;"
					class="smallMenuButton"
					onclick={() => {
						login = false;
						resetPassword = false;
						signUp = true;
					}}>Sign Up</button
				>
			</div>
		</div>
	{:else if signUp}
		<div class="wrapper">
			<h2>Sign Up</h2>

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
					placeholder="********"
					style="background: hsl({$bgColor}) !important; color: hsl({$textColor});"
				/>
				{#if password.length < 8}
					<p><span class="warning"></span>Password should be at least 8 characters long</p>
				{/if}
			</div>
			<div class="inputContainer">
				<label for="password" class="formLabel">
					<span class="labelSpan">confirm password</span>
				</label>
				<input
					type="password"
					bind:value={confirmPassword}
					name="password"
					class="formInput"
					placeholder="*******"
					style="background: hsl({$bgColor}) !important; color: hsl({$textColor});"
				/>
				{#if password != confirmPassword}
					<p><span class="warning"></span>Passwords do not match</p>
				{/if}
			</div>
			
			{#if !isRegistering}
				<div class="inputContainer">
					<button
						class="submitButton"
						disabled={password === confirmPassword && password.length >= 8 ? false : true}
						onclick={() => {
							if (password === confirmPassword) {
								registerUser(email, password);
							}
						}}>Sign Up</button
					>
				</div>
			{:else}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Trying to sign up</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{/if}

			{#if errorMessage != ''}
				<p>{errorMessage}</p>
			{/if}
			<p>We'll send you an email. Please click <b>Verify</b>. Don't forget to check the Spam folder.</p>

			<div style="display: flex">
				<p style="margin: 10px 0 0 0;">Already have an account?</p>
				<button
					type="button"
					style="text-decoration: underline;"
					class="smallMenuButton"
					onclick={() => {
						login = true;
						signUp = false;
						resetPassword = false;
					}}>Log In</button
				>
			</div>
		</div>
	{:else if resetPassword}
		<div class="wrapper">
			<h2>Reset Password</h2>

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
				<p>We'll send you an email with a link to reset your password.</p>
			</div>
			{#if !isResettingPassword}
				<div class="inputContainer">
					<button
						class="submitButton"
						onclick={() => {
							resetUserPassword(email);
						}}>Reset My Password</button
					>
				</div>
			{:else}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Trying to reset</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{/if}

			{#if errorMessage != ''}
				<p><span class="warning"></span>{errorMessage}</p>
			{/if}

			<div style="display: flex">
				<p style="margin: 10px 0 0 0;">Back to</p>
				<button
					type="button"
					style="text-decoration: underline;"
					class="smallMenuButton"
					onclick={() => {
						login = true;
						signUp = false;
						resetPassword = false;
					}}>Log In</button
				>
			</div>
		</div>
	{/if}
</div>

<style>
	.loginContainer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 20px;
		background: #f9f9f9;
		border: 1px solid #1a1a1a20;
		border-radius: 10px;
		box-sizing: border-box;

		display: block;

		/* display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center; */
		z-index: 100;
		overflow-y: auto;
	}
	.wrapper {
		width: 300px;
		margin: auto;
	}
	.inputContainer {
		max-width: 300px;
		display: flex;
		flex-direction: column;
		padding-top: 10px;
		box-sizing: border-box;
	}
	input {
		width: 300px;
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
		width: fit-content;
		background: #1a1a1a;
		color: #f9f9f9;
		border: none;
		border-radius: 10px;
		height: 40px;
	}
	.submitButton:disabled {
		background: #1a1a1a90;
		cursor: default;
	}
</style>
