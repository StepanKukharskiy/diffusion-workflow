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
            console.log(output)

            response = {
                videoUrl: output
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


            response = {
                videoUrl: task.output[0]
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