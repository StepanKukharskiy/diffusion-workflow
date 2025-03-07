import Replicate from "replicate";
import { REPLICATE_API_TOKEN, RUNWAY_API_TOKEN } from '$env/static/private'
import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
    apiKey: RUNWAY_API_TOKEN
});

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function POST({ request, locals }) {


    try {
        const query = await request.json()
        console.log(query)

        let response

        if (query.model === '14_frames_with_svd' || query.model === '25_frames_with_svd_xt') {
            const input = {
                // seed: 18457,
                input_image: query.refImageUrl,
                video_length: query.model,
                frames_per_second: 6,
            };

            console.log(input);
            const output = await replicate.run("sunfjun/stable-video-diffusion:d68b6e09eedbac7a49e3d8644999d93579c386a083768235cabca88796d70d82", { input: input });

            const videoUrl = output.url().href;
            const videoResponse = await fetch(videoUrl);
            const arrayBuffer = await videoResponse.arrayBuffer();
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
                videoUrl: generatedVideoFileUrl
            }



        } else if (query.model === 'runway-gen-3') {
            const imageToVideo = await client.imageToVideo.create({
                model: 'gen3a_turbo',
                promptImage: query.refImageUrl,
                promptText: 'fly',
            });

            console.log(imageToVideo);

            const taskId = imageToVideo.id;

            // Poll the task until it's complete
            //   let task: Awaited<ReturnType<typeof client.tasks.retrieve>>;
            let task
            do {
                // Wait for ten seconds before polling
                await new Promise(resolve => setTimeout(resolve, 10000));

                // task = await client.imageToVideo.retrieve(taskId);
                task = await client.tasks.retrieve(taskId)
            } while (!['SUCCEEDED', 'FAILED'].includes(task.status));

            console.log('Task complete:', task);

            const videoUrl = task.output[0]
            const videoResponse = await fetch(videoUrl);
            const arrayBuffer = await videoResponse.arrayBuffer();
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
                videoUrl: generatedVideoFileUrl
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