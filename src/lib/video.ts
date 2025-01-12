import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function videoResponse(model = '', query = '', firstFrameImageUrl = '') {
    try {
        let response
        let analysePromptResult = await analysePrompt(query)
        if (analysePromptResult?.trim() === 'ok') {
            if (model === 'video-01') {
                let input = {}
                if (firstFrameImageUrl != '') {
                    input = {
                        prompt: query,
                        prompt_optimizer: true,
                        first_frame_image: firstFrameImageUrl
                    }
                } else {
                    input = {
                        prompt: query,
                        prompt_optimizer: true,
                    }
                }
            

            const output = await replicate.run("minimax/video-01", { input });
            console.log(output)
            const videoUrl = output.url().href;

            response = {
                videoUrl: videoUrl
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
    }
    }
    catch (err) {
    console.log(err)
}
}