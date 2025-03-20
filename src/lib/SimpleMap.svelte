<script lang="ts">
	import { elements } from './store';
	import { deleteBlock } from './utils';
	import { page } from '$app/stores';
	import { generateUUID } from './utils';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import OSM from 'ol/source/OSM';
	import { onMount } from 'svelte';
	import { useGeographic } from 'ol/proj.js';
	import 'ol/ol.css';

	let { uuid, options = false } = $props();
	let isTakingScreenshot = $state(false);
	let mapImageUrl = $state('');
	let mapWrapper: any = $state();
	let mapId = 'map';

	function addImageElement(elements: any, url = '') {
		elements.push({
			uuid: generateUUID(),
			type: 'image',
			query: 'map',
			imageUrl: url,
			referenceImageUrl: ''
		});
	}

	async function getCanvas() {
		isTakingScreenshot = true;
		const canvas = document.getElementById(`mapCanvas-${uuid}`); // Select the canvas element
		console.log(canvas);

		if (canvas) {
			const dataURL = canvas.toDataURL('image/jpeg'); // Convert canvas to image
			const blob = await fetch(dataURL).then((res) => res.blob());

			const formData = new FormData();
			formData.append('file', blob, 'canvas.jpeg');
			formData.append('projectId', $page.params.projectId);
			console.log($page.params.projectId);
			console.log(formData);

			const response = await fetch(`${$page.url.origin}/api/save-image`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				isTakingScreenshot = false;
				console.error('Upload failed:', response.statusText);
			} else {
				const result = await response.json();
				console.log('Upload successful:', result);
				isTakingScreenshot = false;
				return result.url;
			}
		} else {
			isTakingScreenshot = false;
			console.error(`No canvas found`);
		}
	}

    const coordinates = [
    {'name': 'Eiffel Tower', 'latitude': 48.858222, 'longitude': 2.2945},
    {'name': 'Grand Canyon', 'latitude': 36.106965, 'longitude': -112.112997},
    {'name': 'Great Wall of China', 'latitude': 36.3400, 'longitude': 116.6252},
    {'name': 'Taj Mahal', 'latitude': 27.17500, 'longitude': 78.04194},
    {'name': 'Sydney Opera House', 'latitude': -33.85681, 'longitude': 151.21514},
    {'name': 'Mount Everest', 'latitude': 27.986065, 'longitude': 86.922623},
    {'name': 'Statue of Liberty', 'latitude': 40.689247, 'longitude': -74.044502},
    {'name': 'Machu Picchu', 'latitude': -13.163141, 'longitude': -72.544963},
    {'name': 'Christ the Redeemer', 'latitude': -22.951916, 'longitude': -43.210487},
    {'name': 'Colosseum', 'latitude': 41.890251, 'longitude': 12.492373}
];

	onMount(() => {
		useGeographic();

        const randomIndex = Math.floor(Math.random() * coordinates.length);
    const selectedLocation = coordinates[randomIndex];

		let map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new OSM()
				})
			],
			view: new View({
				center: [selectedLocation.longitude, selectedLocation.latitude],
				zoom: 15
			})
		});

		// Get the canvas element created by OpenLayers and set an ID
		setTimeout(() => {
			const mapElement = document.getElementById(mapId);
			if (mapElement) {
				const canvas = mapElement.querySelector('canvas');
				if (canvas) {
					canvas.id = `mapCanvas-${uuid}`;
					canvas.style.borderRadius = '20px';
					console.log('Canvas ID set:', canvas.id);
				}
			}
		}, 100); // Small delay to ensure the map is rendered
	});
</script>

<div class="mapContainer">
	<div id={mapId}></div>
	{#if options}
		{#if !isTakingScreenshot}
			<div style="display: flex; flex-wrap: wrap;">
				<button
					class="tertiaryButton"
					onclick={async () => {
						mapImageUrl = await getCanvas();
						addImageElement($elements, mapImageUrl);
					}}>Save map as an image</button
				>

				<button
					class="tertiaryButton"
					onclick={async () => {
						deleteBlock($elements, uuid);
						$elements = $elements;
					}}>Delete</button
				>
			</div>
		{:else}
			<div
				style="width: 40px; height: 40px; disply: flex; justify-content: center; align-items: center;"
			>
				<div class="loader"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.mapContainer {
		width: 100%;
		max-width: 800px;
		margin-bottom: 50px;
	}
	#map {
		height: 400px;
		min-height: 400px;
	}
</style>
