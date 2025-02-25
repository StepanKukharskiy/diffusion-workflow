<script lang="ts">
	import { slide } from 'svelte/transition';
	import SimpleTextCard from './SimpleTextCard.svelte';
	import { height, manual, apps, templates, tutorials } from './store';

	let { textarea } = $props();
</script>

<div class="hint" transition:slide style="height: calc({$height}px - {textarea} - 130px);">
	<div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
		<h2>Tips</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$manual = false;
			}}>quit</button
		>
	</div>
	<div class="hintsWrapper">
		<details>
			<summary>Chat</summary>
			<div class="hintContainer">
				<p>
					To use the <b>chat</b> feature, simply ask questions or provide text-based instructions.
					To utilize the <b>vision</b> feature, provide a reference image that you would like to discuss
					with the AI. To use any image from the thread as a reference click 'Use as a reference image'.
					Pick a different model by clicking the &#8942; button.
				</p>
				<SimpleTextCard
					label={'Chat query example'}
					text={`What is the design language of the house on the waterfall by Frank Lloyd Wright?`}
				/>
				<SimpleTextCard
					label={'Image reference chat query example'}
					text={`What is the design language of the building in this image:
                https://yourimage.com/image.jpg?`}
				/>
			</div>
		</details>
		<details>
			<summary>Create images</summary>
			<div class="hintContainer">
				<p>
					To generate images, provide a description of the desired image. If you want to maintain
					the composition of a specific image, ask the AI to use that image as a composition
					reference and provide its URL. To use any image from the thread as a reference click 'Use
					as a reference image'. Pick a different model by clicking the &#8942; button. The output
					will be in JPEG format. To get the most creative results follow <a
						href="/blog/iterative-image-generation">this steps</a
					>.
				</p>
				<SimpleTextCard
					label={'Image query example'}
					text={`An image of a private house in the woods, above the waterfall, horizontal blocks, minimal
                design, natural materials, autumn, warm light inside.`}
				/>

				<SimpleTextCard
					label={'Composition reference query example'}
					text={`An image of a private house in the woods, above the waterfall, horizontal simple block, minimal
                design, natural materials, autumn, warm light inside; composition reference:
                https://yourimage.com/image.jpg.`}
				/>
			</div>
		</details>
		<details>
			<summary>Create vector graphics</summary>
			<div class="hintContainer">
				<p>
					To generate vector graphics, provide a description of the image you want to create and
					specify that it is a vector graphic request. Vector graphics can include illustrations or
					icons. The output will be in SVG format.
				</p>
				<SimpleTextCard
					label={'Vector illustration query example'}
					text={`A vector illustration of a private house in the woods above the waterfall.`}
				/>
				<SimpleTextCard
					label={'Icon query example'}
					text={`An icon of a house, black and white, minimal design.`}
				/>
			</div>
		</details>
		<details>
			<summary>Create video</summary>
			<div class="hintContainer">
				<p>
					To create a video, provide a text description and specify that it is a video request. You
					can also include an image URL or a reference image to utilize the image-to-video feature.
					To use any image from the thread as a reference click 'Use as a reference image'. The
					output will be in MP4 format.
				</p>
				<SimpleTextCard
					label={'Video query example'}
					text={`A cinematic video of a house in the woods above the waterfall, with warm lights inside during autumn and falling leaves.`}
				/>
			</div>
		</details>
		<details>
			<summary>Create 3D models</summary>
			<div class="hintContainer">
				<p>
					To generate a 3D model, specify that you need a 3D model and provide a reference image or
					a URL. To use any image from the thread as a reference click 'Use as a reference image'.
					The output will be in GLB format based on the provided image.
				</p>
				<SimpleTextCard
					label={'3D model query example'}
					text={`Turn this image into a 3D model: https://yourimage.com/image.jpg`}
				/>
			</div>
		</details>
		<details>
			<summary>Create an inrepolation video</summary>
			<div class="hintContainer">
				<p>
					Interpolation is used to create a video from a sequence of frames. Specify that you need
					interpolation and provide a series of URLs for this feature. The output will be an MP4
					video file with transitions between frames.
				</p>
				<SimpleTextCard
					label={'Interpolation query example'}
					text={`Interpolate these images: https://yourimage.com/image1.jpg, https://yourimage.com/image2.jpg, https://yourimage.com/image3.jpg`}
				/>
			</div>
		</details>
		<details>
			<summary>Generate code</summary>
			<p>
				Add a coding template using 'templates' command for chat model to use it as a context. Ask
				questions about the code provided.
			</p>
		</details>

		<details>
			<summary>Commands</summary>
			<div class="command-wrapper">
				<button
					class="tertiaryButton"
					onclick={() => {
						$apps = true;
						$manual = false;
					}}>apps</button
				>
				<p style="margin: 0;">Type 'apps' to see a list of apps that were created by you.</p>
			</div>
			<div class="command-wrapper">
				<button
					class="tertiaryButton"
					onclick={() => {
						$templates = true;
						$manual = false;
					}}>templates</button
				>
				<p style="margin: 0;">Type 'templates' to see a list of templates for apps.</p>
			</div>
			<div class="command-wrapper">
				<button
					class="tertiaryButton"
					onclick={() => {
						$tutorials = true;
						$manual = false;
					}}>tutorials</button
				>
				<p style="margin: 0;">Type 'tutorials' to see a list of tutorials on various topics.</p>
			</div>
		</details>

		<details>
			<summary>Threads</summary>
			<p>
				Threads contain a list of things, topics or subjects that have been talked about previously.
			</p>
		</details>
		<details>
			<summary>Apps</summary>
			<p>
				Apps contain a list of apps that were created by you. Type 'apps' to open the apps list.
			</p>
		</details>
		<details>
			<summary>Tutorials</summary>
			<p>Type 'tutorials' to open the tutorials list.</p>
		</details>

		<details>
			<summary>Use Templates to build your apps</summary>
			<p>
				Templates contain templates to create your frontend apps. Start with a template and follow
				your imagination. Ask AI code related questions. Enter your app name and save your progress
				with 'Save app' button. Type 'apps' to open the apps list. Apps are hosted with us and can
				be shared online.
			</p>
		</details>
		<details>
			<summary>Upload files</summary>
			<p>To upload images or glb files to threads use the upload button with a clip icon.</p>
		</details>

		<div style="margin-top: 10px; display: flex; align-items: center;">
			<button
				class="tertiaryButton"
				onclick={() => {
					window.open('https://discord.gg/PWjgJafMkF');
				}}
			>
				<svg
					width="40"
					height="40"
					viewBox="0 -28.5 256 256"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					preserveAspectRatio="xMidYMid"
					style="margin-right: 10px;"
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
				Join our community
			</button>
		</div>
	</div>
</div>

<style>
	.hint {
		width: 100%;
		max-width: 800px;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(25px);
		border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		margin-bottom: 0px;
		z-index: 5;
	}
	.hintsWrapper {
		overflow-y: auto;
		background-color: hsl(0, 0%, 95%);
		padding: 10px;
		border-radius: 10px;
	}
	.command-wrapper {
		background-color: hsl(0, 0%, 93%);
		padding: 0 10px 10px 10px;
		margin-bottom: 10px;
		border-radius: 10px;
	}
	.command-wrapper:hover {
		background-color: hsl(0, 0%, 90%);
	}
</style>
