import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private'
import { analyseRequest } from "$lib/requestAnalysis";
import { chatResponse } from "$lib/chat";
import { imageResponse } from "$lib/image";
import { videoResponse } from "$lib/video";
import { vectorResponse } from "$lib/vector";
import { modelResponse } from "$lib/model";
import { interpolationResponse } from "$lib/interpolate";
import { extractFrames } from "$lib/framesExtractor";

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

export async function POST({ request, locals }) {
    const query = await request.json()
    console.log(query)

    try {
        let response
        const requestType = await analyseRequest(query.query)
        console.log(requestType)

        if (requestType?.trim() === 'chat') {
            console.log('getting chat agent response')
            const chatResponseData = await chatResponse('llama3.3-70b', query.query, query.systemPrompt, query.previousAnswers, query.referenceImage)
            console.log(query.referenceImage)
            console.log(chatResponseData)

            response = {
                type: 'text',
                generatedText: chatResponseData
            }
        }

        if (requestType?.trim() === 'image') {
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
                url: generatedImageFileUrl
            }
            console.log(response)
        }

        if (requestType?.trim() === 'video') {
            console.log('getting video agent response')
            const model = 'video-01'
            const videoResponseData = await videoResponse(model, query.query, query.referenceImage)
            const videoResponseDataUrl = await videoResponseData?.json()

            console.log(videoResponseDataUrl)
            const videoForDb = await fetch(videoResponseDataUrl.videoUrl);
            const arrayBuffer = await videoForDb.arrayBuffer();
            const videoBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
            const formData = new FormData();
            formData.append("generatedVideos", videoBlob, `${query.model}.mp4`);
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedVideoFileName = record.generatedVideos[record.generatedVideos.length - 1];
            const generatedVideoFileUrl = await locals.pb.files.getUrl(record, generatedVideoFileName, {
                //'thumb': '100x250'
            });

            response = {
                type: 'video',
                url: generatedVideoFileUrl
            }
            console.log(response)
        }

        if (requestType?.trim() === 'vector') {
            console.log('getting vector agent response')
            const model = 'recraft-20b-svg'
            const vectorResponseData = await vectorResponse(model, query.query)
            const vectorResponseDataUrl = await vectorResponseData?.json()

            const vectorForDb = await fetch(vectorResponseDataUrl.imageUrl);
            const vectorBuffer = await vectorForDb.arrayBuffer();
            console.log(vectorBuffer)
            const vectorBlob = new Blob([vectorBuffer], { type: 'image/svg+xml' });

            const formData = new FormData();
            formData.append("generatedImages", vectorBlob, `${query.query}.svg`);
            console.log(formData)
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedImageFileName = record.generatedImages[record.generatedImages.length - 1];
            const generatedImageFileUrl = await locals.pb.files.getUrl(record, generatedImageFileName, {
                //'thumb': '100x250'
            });

            response = {
                type: 'image',
                url: generatedImageFileUrl
            }
            console.log(response)
        }

        if (requestType?.trim() === 'model') {
            console.log('getting modelling agent response')
            const model = 'trellis'
            const images = [query.referenceImage]
            const modelResponseData = await modelResponse(model, query.query, images)
            const modelResponseDataUrl = await modelResponseData?.json()

            const modelForDb = await fetch(modelResponseDataUrl.modelUrl);
            const modelBuffer = await modelForDb.arrayBuffer();
            console.log(modelBuffer)
            const modelBlob = new Blob([modelBuffer], { type: 'model/gltf-binary' });

            const formData = new FormData();
            formData.append("generatedModels", modelBlob, `model.glb`);
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedModelFileName = record.generatedModels[record.generatedModels.length - 1];
            const generatedModelFileUrl = await locals.pb.files.getUrl(record, generatedModelFileName, {
                //'thumb': '100x250'
            });

            response = {
                type: 'model',
                url: generatedModelFileUrl
            }
            console.log(response)
        }

        if (requestType?.trim() === 'interpolation') {
            console.log('getting interpolation agent response')
            const frames = await extractFrames(query.query)
            const videoResponseData = await interpolationResponse(frames)
            const videoResponseDataUrl = await videoResponseData?.json()
            const videoForDb = await fetch(videoResponseDataUrl.videoUrl);
            const arrayBuffer = await videoForDb.arrayBuffer();
            const videoBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
            const formData = new FormData();
            formData.append("generatedVideos", videoBlob, `${query.model}.mp4`);
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedVideoFileName = record.generatedVideos[record.generatedVideos.length - 1];
            const generatedVideoFileUrl = await locals.pb.files.getUrl(record, generatedVideoFileName, {
                //'thumb': '100x250'
            });

            response = {
                type: 'video',
                url: generatedVideoFileUrl
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