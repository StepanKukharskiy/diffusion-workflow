import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private'
import { chatResponse } from "$lib/chat";
import { imageResponse } from "$lib/image";
import { modelResponse } from "$lib/model";

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

export async function agentResponse(query = '') {
    console.log(query)

    try {

        let response
        const systemPrompt = `You are given a project description. 
        Provide a prompt to generate an image for this project. 
        Specify materials and geometry description. Prefer complex fluid geometry if not specified otherwise.
        Add features like weather and lighting conditions. Prefer soft lighting and clear sky if not specified otherwise.
        Specify the point of view. Prefer pedestrian point of views if not specified otherwise.  
        Answer with just a prompt.
        Start with 'An image of '`
        const chatResponseData:any = await chatResponse('llama3.3-70b', query, systemPrompt, '', '')
        console.log(chatResponseData)

        // response = {
        //     type: 'text',
        //     generatedText: chatResponseData
        // }


        console.log('getting image agent response')
        let model = 'flux-depth-pro'
        const referenceImageUrl = 'https://kodiia.me/api/get-file/6inrnf0rwxli65d/img_6756_D0zBaQvdFf.jpeg'
        const imageResponseData = await imageResponse(model, chatResponseData, referenceImageUrl)
        // const imageResponseDataUrl = await imageResponseData?.json()

        // const imageForDb = await fetch(imageResponseDataUrl.imageUrl);
        // const imageBuffer = await imageForDb.arrayBuffer();
        // console.log(imageBuffer)
        // const imageBlob = new Blob([imageBuffer], { type: 'image/webp' });

        // const formData = new FormData();
        // formData.append("generatedImages", imageBlob, `${query.query}.webp`);
        // console.log(formData)
        // const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

        // const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
        // const generatedImageFileName = record.generatedImages[record.generatedImages.length - 1];
        // const generatedImageFileUrl = await locals.pb.files.getUrl(record, generatedImageFileName, {
            //'thumb': '100x250'
        // });

        // if (requestType?.trim() === 'model') {
        //     console.log('getting modelling agent response')
        //     const model = 'trellis'
        //     const images = [query.referenceImage]
        //     const modelResponseData = await modelResponse(model, query.query, images)
        //     const modelResponseDataUrl = await modelResponseData?.json()

        //     const modelForDb = await fetch(modelResponseDataUrl.modelUrl);
        //     const modelBuffer = await modelForDb.arrayBuffer();
        //     console.log(modelBuffer)
        //     const modelBlob = new Blob([modelBuffer], { type: 'model/gltf-binary' });

        //     const formData = new FormData();
        //     formData.append("generatedModels", modelBlob, `model.glb`);
        //     const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

        //     const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
        //     const generatedModelFileName = record.generatedModels[record.generatedModels.length - 1];
        //     const generatedModelFileUrl = await locals.pb.files.getUrl(record, generatedModelFileName, {
        //         //'thumb': '100x250'
        //     });

        //     response = {
        //         type: 'model',
        //         url: generatedModelFileUrl
        //     }
        //     console.log(response)
        // }

        response = {
            text: chatResponseData,
            image: imageResponseData
        }


        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                // 'Access-Control-Allow-Origin': 'https://kodiia.me',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        }
        )

    } catch (err) {
        console.log(err)
    }
}