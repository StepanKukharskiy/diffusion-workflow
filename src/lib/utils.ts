import htmlSVG from '$lib/logos/html.svg'
import cssSVG from '$lib/logos/css.svg'
import jsSVG from '$lib/logos/js.svg'
// import mdSVG from '$lib/logos/md.svg'
import txtSVG from '$lib/logos/txt.svg'
// import svelteSVG from '$lib/logos/svelte.svg'
// import threejsSVG from '$lib/logos/threejs.svg'
// import p5jsSVG from '$lib/logos/p5js.svg'
// import brainjsSVG from '$lib/logos/brainjs.svg'
// import glbSVG from '$lib/logos/glb.svg'
// import arduinoSVG from '$lib/logos/arduino.svg'

export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  export const serializeNonPOJOs = (obj:any) => {
      return JSON.parse(JSON.stringify(obj))
      // return structuredClone(obj)
  };
  
  export function getPointerPosition(event: any, canvasScale = 1) {
    return {
      x: event.clientX / canvasScale + window.scrollX / canvasScale,
      y: event.clientY / canvasScale + window.scrollY / canvasScale
    }
  }
  
  export function updateConnections(connections = new Map(), nodes = new Map()) {
    connections = new Map();
    for (const [uuid, node] of nodes) {
      for (let nodeOutput of node.outputs) {
        if (nodeOutput.isConnected) {
          
          for (const [connectedUuid, input] of nodeOutput.connectionMap) {
            console.log('connections: ' + connectedUuid + ', ' + input)
            const newConnection = {
              startNodeId: uuid,
              startNodeOutputId: nodeOutput.id,
              startNodeOutputConnectionMapUuid: input.connectedOutputConnectionMapId,
              startPosition: { x: nodeOutput.position.absoluteX, y: nodeOutput.position.absoluteY },
              endNodeId: input.connectedNodeId,
              endNodeInputId: input.input,
              endPosition: {
                x: nodes.get(input.connectedNodeId).inputs[input.input].position.absoluteX,
                y: nodes.get(input.connectedNodeId).inputs[input.input].position.absoluteY
              },
              data: nodeOutput.data
            };
            const connectionUuid = `${uuid}-${connectedUuid}-${input.input}`;
            connections.set(connectionUuid, newConnection);
          }
        }
      }
    }
  
    return connections
  }
  
  export function removeNodefromCanvas(nodes = new Map(), uuid: string) {
    for (let input of nodes.get(uuid).inputs) {
      if (input.isConnected) {
        input.isConnected = false;
  
        for (const [key, value] of input.connectionMap) {
          if (nodes.get(key).outputs[value.output].connectionMap.size < 2) {
            nodes.get(key).outputs[value.output].isConnected = false;
            // nodes.get(key).outputs[value.output].data = '';
          }
          // console.log(input.connectionMap)
          // console.log(input)
          // console.log(key)
          // console.log(value)
          // console.log('connected output data: ' + nodes.get(key).outputs[value.output].connectionMap + ', ' + nodes.get(key).outputs[value.output].id)
          // console.log( nodes.get(key).outputs[value.output].connectionMap )
          nodes.get(key).outputs[value.output].connectionMap.delete(`${uuid}-${input.id}`);
          // console.log( nodes.get(key).outputs[value.output].connectionMap )
        }
      }
    }
  
    for (let output of nodes.get(uuid).outputs) {
      if (output.isConnected) {
        output.isConnected = false;
  
        for (const [key, value] of output.connectionMap) {
          console.log(value.connectedNodeId)
          if (nodes.get(value.connectedNodeId).inputs[value.input].connectionMap.size < 2) {
            nodes.get(value.connectedNodeId).inputs[value.input].isConnected = false;
          }
          nodes.get(value.connectedNodeId).inputs[value.input].connectionMap.delete(uuid);
          nodes.get(value.connectedNodeId).inputs[value.input].data = '';
        }
      }
    }
  
    console.log('deleting node: ' + nodes.get(uuid));
    
    nodes.delete(uuid);
    console.log(nodes) 
  
    return nodes
  }
  
  export function resizeNode(nodes = new Map(), uuid: string, pointerPosition: { x: number, y: number }) {
    nodes.get(uuid).width = pointerPosition.x - nodes.get(uuid).position.x + 20;
    nodes.get(uuid).height = pointerPosition.y - nodes.get(uuid).position.y + 20;
    if (nodes.get(uuid).width < nodes.get(uuid).initialWidth) {
      nodes.get(uuid).width = nodes.get(uuid).initialWidth;
    }
    if (nodes.get(uuid).height < nodes.get(uuid).initialHeight) {
      nodes.get(uuid).height = nodes.get(uuid).initialHeight;
    }
  }
  
  export function updateNodesData(nodes = new Map(), uuid: string, updatedData: any, outputId = 0) {
    nodes.get(uuid).outputs[outputId].data = updatedData;
  
    if (nodes.get(uuid).outputs[outputId].isConnected) {
      for (const [key, value] of nodes.get(uuid).outputs[outputId].connectionMap) {
        nodes.get(value.connectedNodeId).inputs[value.input].data =
          nodes.get(uuid).outputs[outputId].data;
      }
    }
    return nodes;
  }
  
  export function startTempConnection(isAddingConnection = false, tempConnection = {
    nodeStartId: 0,
    nodeStartUUID: '',
    nodeStartOutputId: 0,
    nodeEndId: 0,
    nodeEndUUID: '',
    nodeEndInputId: 0,
    data: null
  }, nodeStartUUID = '', nodeStartOutputId = 0, data: any) {
    isAddingConnection = true;
    tempConnection.nodeStartUUID = nodeStartUUID;
    tempConnection.nodeStartOutputId = nodeStartOutputId;
    tempConnection.data = data;
  
    console.log('starting connection with this data: ' + data);
    console.log(isAddingConnection);
  }
  
  export function completeTempConnection(nodes = new Map(), isAddingConnection = false, tempConnection = {
    nodeStartId: 0,
    nodeStartUUID: '',
    nodeStartOutputId: 0,
    nodeEndId: 0,
    nodeEndUUID: '',
    nodeEndInputId: 0,
    data: null
  }, uuid: string, nodeEndUUID = '', nodeEndInputId = 0) {
    if (isAddingConnection) {
      const nodeStartUUID = tempConnection.nodeStartUUID;
      const nodeStartOutputId = tempConnection.nodeStartOutputId;
      tempConnection.nodeEndUUID = nodeEndUUID;
      tempConnection.nodeEndInputId = nodeEndInputId;
  
      console.log(
        'before connecting: ' +
        nodes.get(nodeStartUUID).outputs[nodeStartOutputId].connectionMap.size
      );
  
      nodes.get(uuid).inputs[nodeEndInputId].isConnected = true;
      // nodes.get(uuid).inputs[nodeEndInputId].data = tempConnection.data;
      nodes
        .get(uuid)
        .inputs[nodeEndInputId].connectionMap.set(nodeStartUUID, { output: nodeStartOutputId });
      
      nodes.get(nodeStartUUID).outputs[nodeStartOutputId].isConnected = true;
      const outputConnectionMapConnectionId = `${uuid}-${nodeEndInputId}`;
      nodes
        .get(nodeStartUUID)
        .outputs[
        nodeStartOutputId
      ].connectionMap.set(outputConnectionMapConnectionId, { connectedNodeId: uuid, connectedOutputId: nodeStartOutputId, connectedOutputConnectionMapId: outputConnectionMapConnectionId, input: nodeEndInputId });
  
      console.log(
        'after connecting: ' +
        nodes.get(nodeStartUUID).outputs[nodeStartOutputId].connectionMap.size
      );
  
      const connections = nodes.get(uuid).inputs[nodeEndInputId].connectionMap
      nodes.get(uuid).inputs[nodeEndInputId].data = ''
      for (const [connectedNodeUuid, connectedNodeOutputIndex] of connections) {
        const data = nodes.get(connectedNodeUuid).outputs[connectedNodeOutputIndex.output].data
        nodes.get(uuid).inputs[nodeEndInputId].data += data
      }
  
      isAddingConnection = false;
  
      console.log(nodes)
  
      
    }
    return nodes;
  }
  
  export function getOutputsPosition(nodes = new Map(), uuid: string) {
    for (let i = 0; i < nodes.get(uuid).outputs.length; i++) {
      nodes.get(uuid).outputs[i].position = {
        x: nodes.get(uuid).width + 5,
        y: nodes.get(uuid).height - nodes.get(uuid).outputs.length * 30 + 30 * i - 30,
        absoluteX: nodes.get(uuid).position.x + nodes.get(uuid).width + 25,
        absoluteY: nodes.get(uuid).position.y + nodes.get(uuid).height - nodes.get(uuid).outputs.length * 30 + 30 * i - 20
      };
    }
  }
  
  export function getInputsPosition(nodes = new Map(), uuid: string) {
    for (let i = 0; i < nodes.get(uuid).inputs.length; i++) {
      nodes.get(uuid).inputs[i].position = {
        x: -25,
        y: nodes.get(uuid).height - nodes.get(uuid).inputs.length * 30 + 30 * i - 30,
        absoluteX: nodes.get(uuid).position.x - 25,
        absoluteY: nodes.get(uuid).position.y + nodes.get(uuid).height - nodes.get(uuid).inputs.length * 30 + 30 * i - 18
      };
    }
  }
  
  export function getNodePositionAndPointerPositionDelta(pointerPosition:any, nodes = new Map(), uuid: string){
  const delta = {x : pointerPosition.x - nodes.get(uuid).position.x, 
    y: pointerPosition.y - nodes.get(uuid).position.y
  }
  return delta
  }

  export function addElement(elements: any = [], type = 'text', imageUrl = '') {
		elements.push({
			type: type,
			systemPrompt: '',
			query: '',
      imageUrl: ''
		});
    // if(type === 'imageGeneration'){
    // elements.push({
		// 	type: type,
		// 	systemPrompt: '',
		// 	query: '',
		// 	imageUrl: imageUrl
		// });
    // }
	}

  export const getFileLogoURL = (fileType:any) => {
    let logoPath = htmlSVG
    switch (fileType) {
          case 'html':
          logoPath = htmlSVG
          break;
  
          case 'css':
          logoPath = cssSVG
          break;
  
          case 'js':
          logoPath = jsSVG
          break;
  
          case 'javascript':
          logoPath = jsSVG
          break;
  
          // case 'md':
          // logoPath = mdSVG
          // break;
  
          // case 'txt':
          // logoPath = txtSVG
          // break;
  
          // case 'svelte':
          // logoPath = svelteSVG
          // break;
  
          // case 'threejs':
          // logoPath = threejsSVG
          // break;
  
          // case 'p5js':
          // logoPath = p5jsSVG
          // break;
  
          // case 'brainjs':
          // logoPath = brainjsSVG
          // break;
  
          // case 'glb':
          // logoPath = glbSVG
          // break;
  
          // case 'ino':
          // logoPath = arduinoSVG
          // break;

          default:
          logoPath = txtSVG
          break;
      }
    return logoPath
  }

  export const getImageUrl = (collectionName='', recordId='', fileName='') => {
    try {
        const url = `api/files/${collectionName}/${recordId}/${fileName}`
        return url
    } catch (err) {
        console.log(err)
        throw error(err.status, err.message);
    }
}
  

  export let initialCodeFiles = [
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
          height: 95vh;
          background: linear-gradient(45deg, pink, beige);
      }`
    },
    {
      fileName: 'script.js',
      fileData: `console.log('hi')`
    },
    {
      fileName: 'readme.md',
      fileData: `console.log('hi')`
    }
  ]

  export async function generateVideo(data = { refImageUrl: '', model: '', projectId: '' }) {
		let generatedVideoUrl = '';
		const message = await fetch(`/api/video-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: data.refImageUrl,
				model: data.model,
				projectId: data.projectId
			})
		});
		const messageObject = await message.json();
		generatedVideoUrl = messageObject.videoUrl;
		console.log(messageObject);
		return generatedVideoUrl;
	}

  export function deleteBlock(elements:any, uuid:any){
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].uuid === uuid) {
        elements.splice(i, 1);
      }
    }
  }