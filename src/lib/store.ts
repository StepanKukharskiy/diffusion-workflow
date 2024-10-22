import { writable } from 'svelte/store';

export let width = writable(1920);
export let height = writable(1080);
export let bgColor = writable('0, 0%, 98%');
export let textColor = writable('0, 0%, 10%');
export let dotsColor = writable('0, 0%, 40%');
export let elements:any = writable([])
// export let canvasScale = writable(1.0);
// export let canvasNodesMenuState = writable(false);
// export let selectedNode = writable('');
// export let isAddingNode = writable(false);
// export let isAddingConnection = writable(false);

// export let tempConnection = writable({
//     nodeStartId: 0,
//     nodeStartUUID: '',
//     nodeStartOutputId: 0,
//     nodeEndId: 0,
//     nodeEndUUID: '',
//     nodeEndInputId: 0,
//     data: null
// })

// export let nodes: any = writable(new Map());
// export let connections: any = writable(new Map());