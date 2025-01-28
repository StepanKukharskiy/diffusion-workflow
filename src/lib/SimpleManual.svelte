<script lang="ts">
	import { slide } from 'svelte/transition';
	import SimpleTextCard from './SimpleTextCard.svelte';
	import { height, manual } from './store';

	let { textarea } = $props();
</script>

<div class="hint" transition:slide style="height: calc({$height}px - {textarea} - 120px);">
	<div
		style="display: flex; width: 100%; justify-content: space-between; align-items: center;"
	>
		<h2>Manual</h2>
		<button
			class="tertiaryButton"
			onclick={() => {
				$manual = false;
			}}>quit</button
		>
	</div>
	<div class="hintsWrapper">
		<details>
			<summary>AI features</summary>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Chat</h3>
				<p>
					To use the <b>chat</b> feature, simply ask questions or provide text-based instructions.
					To utilize the <b>vision</b> feature, provide a reference image URL that you would like to
					discuss with the AI.
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
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Images</h3>
				<p>
					To generate images, provide a description of the desired image. If you want to maintain
					the composition of a specific image, ask the AI to use that image as a composition
					reference and provide its URL. The output will be in JPEG format.
				</p>
				<SimpleTextCard
					label={'Image query example'}
					text={`A private house in the woods, above the waterfall, horizontal blocks, minimal
                design, natural materials, autumn, warm light inside.`}
				/>

				<SimpleTextCard
					label={'Composition reference query example'}
					text={`A private house in the woods, above the waterfall, horizontal simple block, minimal
                design, natural materials, autumn, warm light inside; composition reference:
                https://yourimage.com/image.jpg.`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Vector graphics</h3>
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
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Videos</h3>
				<p>
					To create a video, provide a text description and specify that it is a video request. You
					can also include an image URL to utilize the image-to-video feature. The output will be in
					MP4 format.
				</p>
				<SimpleTextCard
					label={'Video query example'}
					text={`A cinematic shot of a house in the woods above the waterfall, with warm lights inside during autumn and falling leaves.`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">3D models</h3>
				<p>
					To generate a 3D model, specify that you need a 3D model and provide a reference image
					URL. The output will be in GLB format based on the provided image.
				</p>
				<SimpleTextCard
					label={'3D model query example'}
					text={`Turn this image into a 3D model: https://yourimage.com/image.jpg`}
				/>
			</div>
			<div class="hintContainer">
				<h3 class="tertiaryHeading">Interpolation</h3>
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
			<summary>Threads</summary>
			<p>
				Threads contain a list of things, topics or subjects that have been talked about previously.
			</p>
		</details>
		<details>
			<summary>Resources</summary>
			<p>Resources contain a list of tutorials. Type 'tutorials' to open the tutorials list.</p>
		</details>
		<details>
			<summary>Apps</summary>
			<p>
				Apps contain a list of apps that were created by you. Type 'apps' to open the apps list.
			</p>
		</details>
		<details>
			<summary>Templates</summary>
			<p>
				Templates contain templates to create your frontend apps. Type 'apps' to open the apps list.
			</p>
		</details>
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
	}
	.hintsWrapper {
		overflow-y: auto;
		background-color: hsl(0, 0%, 95%);
		padding: 10px;
		border-radius: 10px;
	}
</style>
