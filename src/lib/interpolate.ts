import { FAL_API_TOKEN } from '$env/static/private'
import { fal } from "@fal-ai/client";

fal.config({
    credentials: FAL_API_TOKEN,
});

export async function interpolationResponse(frames: any = []) {
    let response
    const framesData = JSON.parse(frames)
    try {
        const result = await fal.subscribe("fal-ai/amt-interpolation/frame-interpolation", {
            input: {
                frames: framesData,
                output_fps: 24,
                recursive_interpolation_passes: 4
            },

        });
        console.log(result.data);
        console.log(result.requestId);
        response = {
            videoUrl: result.data.video.url
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
