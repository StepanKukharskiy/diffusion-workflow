import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";
import fs from "node:fs";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});

// function dataURItoFile(dataURI = '', filename = '') {
//     // Split the data URI into parts
//     const splitIndex = dataURI.indexOf(',');
//     const mimeString = dataURI.substring(5, splitIndex); // Get the MIME type
//     const byteString = atob(dataURI.substring(splitIndex + 1)); // Decode base64 string

//     // Create an array buffer and fill it with the binary data
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }

//     // Create and return a new File object
//     return new File([ab], filename, { type: mimeString });
// }

export async function POST({ request, locals, params }) {

    try {
        
        const query = await request.json()
        console.log(query)

        let response, output

        const input = {
            image_path: query.refImageUrl,
            // export_texmap: true
            do_remove_background: true
        };
        if(locals.pb.authStore.model.requests > 0){
        output = await replicate.run("camenduru/tripo-sr:e0d3fe8abce3ba86497ea3530d9eae59af7b2231b6c82bedfc32b0732d35ec3a", { input });

        const modelUrl = output.url().href;
        const modelResponse = await fetch(modelUrl);
        const arrayBuffer = await modelResponse.arrayBuffer();
        const modelBlob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
        console.log(modelBlob)

        const formData = new FormData();
            formData.append("generatedModels", modelBlob, `model.glb`);
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedModelFileName = record.generatedModels[record.generatedModels.length - 1];
            const generatedModelFileUrl = await locals.pb.files.getUrl(record, generatedModelFileName, {
                //'thumb': '100x250'
            });

            console.log(generatedModelFileName)
            console.log(generatedModelFileUrl)

            response = {
                modelUrl: generatedModelFileUrl
            }

        }


        const finalResponse = new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                // 'Access-Control-Allow-Origin': 'https://kodiia.me',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        }
        )

        return finalResponse

    } catch (err) {
    console.log(err)
}
}