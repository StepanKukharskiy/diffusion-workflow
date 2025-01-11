import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private'
import { analyseRequest } from "$lib/requestAnalysis";
import { chatResponse } from "$lib/chat";
import { imageResponse } from "$lib/image";

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

export async function POST({ request, locals }) {
    const query = await request.json()
    console.log(query)
    
    try {
        let response
        const requestType = await analyseRequest(query.query)
        console.log(requestType)

        if (requestType?.trim() === 'chat'){
            console.log('getting chat agent response')
            const chatResponseData = await chatResponse('llama3.3-70b', query.query, query.systemPrompt, query.previousAnswers)
            console.log(chatResponseData)

            response = {
                type: 'text',
                generatedText: chatResponseData
            }
        }

        if (requestType?.trim() === 'image'){
            console.log('getting image agent response')
            const model = 'flux-schnell'
            const imageResponseData = await imageResponse(model, query.query, query.referenceImage)
            const imageResponseDataUrl = await imageResponseData?.json()

            const imageForDb = await fetch(imageResponseDataUrl.imageUrl);
            const imageBuffer = await imageForDb.arrayBuffer();
            console.log(imageBuffer)
            const imageBlob = new Blob([imageBuffer], { type: 'image/webp' });

            const formData = new FormData();
            formData.append("generatedImages", imageBlob, `${query.query}.webp`);
            console.log(formData)
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedImageFileName = record.generatedImages[record.generatedImages.length - 1];
            const generatedImageFileUrl = await locals.pb.files.getUrl(record, generatedImageFileName, {
                //'thumb': '100x250'
            });

            response = {
                type: 'image',
                imageUrl: generatedImageFileUrl
            }
            console.log(response)
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