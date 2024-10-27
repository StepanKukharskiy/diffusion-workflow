import { writable } from 'svelte/store';

// #A1C9F290 - text
// #FFD7BE - image generation
// #D6C4FF - image input
// #FFCFF6 - sketch 2D
// #7CFFFB - video generation
// #C5F9F7 - a soft, pale blue-green color that's calming and easy on the eyes.
// #F7D2C4 - a warm, beige-like color that's inviting and suggests creativity.
// #8BC34A - a muted, greenish-yellow color that's fresh and energetic.
// #6495ED - a soft, blue-purple color that's soothing and suggests innovation.

export let width = writable(1920);
export let height = writable(1080);
export let bgColor = writable('0, 0%, 98%');
export let textColor = writable('0, 0%, 10%');
export let dotsColor = writable('0, 0%, 40%');
export let elements:any = writable([])

export let consolePanelState = writable(true);
export let consoleMessages = writable([]);
export let editorState = writable(false)
export let filesLocalCopy = writable([
    {
        fileName: 'index.html',
        fileData: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Hello world!</title>

    <!-- import the webpage's stylesheet -->
    <link rel="stylesheet" href="./style.css" />

    <!-- import the webpage's javascript file -->
    <script src="./script.js" defer></script>
  </head>
  <body>
    <h2>
      We can see only a short distance ahead, but we can see plenty there that
      needs to be done.
    </h2>
    <p>Alan Turing, Computing Machinery and Intelligence</p>
  </body>
</html>
`
    },
    {
        fileName: 'style.css',
        fileData: `body{
            background: #f9f9f9;
        }`
    },
    {
        fileName: 'script.js',
        fileData: `console.log('hi')`
    }
])
export let fileToOpen = writable('index.html')
export let runCode = writable(true)

export let filesPanelState = writable(true), docsPanelState = writable(true), stepsPanelState = writable(true), resourcesPanelState = writable(true);
export let filesPanelDisplay = writable('block')

export let leftPanelWidthSetByUser = writable(0)
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