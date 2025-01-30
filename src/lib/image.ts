import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function imageResponse(model = '', query = '', referenceCompositionImageUrl = '') {
    try {
        let response
        let analysePromptResult = await analysePrompt(query)
        if (analysePromptResult?.trim() === 'ok') {
            if (referenceCompositionImageUrl === '') {
                if (model === 'flux-schnell') {
                    const input = {
                        prompt: query,
                        go_fast: true,
                        megapixels: "1",
                        num_outputs: 1,
                        aspect_ratio: "1:1",
                        output_format: "jpg",
                        output_quality: 80,
                        num_inference_steps: 4
                    };

                    const [output] = await replicate.run("black-forest-labs/flux-schnell", { input });
                    const imageUrl = output.url().href;

                    response = {
                        imageUrl: imageUrl
                    }
                }
            } else if (model === 'flux-canny-pro'){
                console.log('using canny model')
                const input = {
                    steps: 50,
                    prompt: query,
                    guidance: 45,
                    control_image: referenceCompositionImageUrl,
                    output_format: "jpg",
                    safety_tolerance: 2,
                    prompt_upsampling: false
                }
                const output = await replicate.run("black-forest-labs/flux-canny-pro", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            }  else if (model === 'flux-depth-pro'){
                console.log('using depth model')
                const input = {
                    steps: 50,
                    prompt: query,
                    guidance: 45,
                    control_image: referenceCompositionImageUrl,
                    output_format: "jpg",
                    safety_tolerance: 2,
                    prompt_upsampling: false
                }
                const output = await replicate.run("black-forest-labs/flux-depth-pro", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
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