<script lang="ts">
    let email: any = $state(''),
    isSubscribing = $state(false);

    async function subscribe() {
		console.log(email);
		isSubscribing = true;
		const formData = new FormData();
		formData.append('email', email);
		const response = await fetch('api/newsletter/subscribe', { method: 'POST', body: formData });
		const responseData = await response.json();
		if (response.ok) {
			isSubscribing = false;
		}
	}
</script>

<span style="width: 100%; border-top: 1px solid hsl(0, 0%, 90%); margin-bottom: 10px;"></span>
<div class="footer">
	<div style="display: flex; flex-direction: column;">
		<p>Copyright © 2025 Kodiia</p>
		<p>Made with 💜 across the globe</p>
		<p>info@kodiia.com</p>
	</div>
	<div style="display: flex; flex-direction: column;">
		<p>Privacy policy</p>
		<p>Terms of service</p>
	</div>
	<div class="subscribeContainer">
		<label for="emailInput">Subscribe to our newsletter</label>
		<div style="display: flex; margin-top: 10px;">
			<input
				bind:value={email}
				id="emailInput"
				type="email"
				placeholder="ada@lovelace.com"
				style="margin-right: 10px;"
			/>
			{#if !isSubscribing}
				<button class="secondaryButton" onclick={subscribe}>Subscribe</button>
			{:else}
				<div style="display: flex;">
					<div class="loader"></div>
				</div>
			{/if}
		</div>
		<div style="margin: 10px 0;">
			<a href="https://discord.gg/PWjgJafMkF" target="_blank" aria-label="Discord link">
				<svg
					width="40"
					height="40"
					viewBox="0 -28.5 256 256"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					preserveAspectRatio="xMidYMid"
				>
					<g>
						<path
							d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
							fill="hsl(0, 0%, 10%)"
							fill-rule="nonzero"
						>
						</path>
					</g>
				</svg>
			</a>
		</div>
	</div>
</div>

<style>
    .footer {
		text-align: left;
		padding: 1rem;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
	}
	.footer p {
		margin: 5px 0;
	}
    input {
		border: none;
		border-radius: 0;
		border-bottom: 1px solid hsl(0, 0%, 90%);
		background: none;
		background-color: hsla(0, 0%, 0%, 0.05);
		color: hsl(0, 0%, 10%);
		font-size: 1rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		height: 60px;
		padding: 10px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
		height: auto;
		width: fit-content;
		max-width: 300px;
		border-radius: 10px;
	}

    .subscribeContainer {
		display: flex;
		flex-direction: column;
		text-align: left;
		padding: 10px 0;
		box-sizing: border-box;
	}

	@media screen and (max-width: 700px) {
		.footer {
			flex-direction: column;
		}
	}
</style>
