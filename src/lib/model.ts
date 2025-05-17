import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function modelResponse(model = '', query = '', imagesUrls = []) {
    try {
        let response
        let analysePromptResult = await analysePrompt(query)
        if (analysePromptResult?.trim() === 'ok') {
            if (model === 'trellis') {
                let input = {
                    images: imagesUrls,
                    seed: 0,
                    texture_size: 1024,
                    mesh_simplify: 0.95,
                    generate_color: true,
                    generate_model: true,
                    randomize_seed: true,
                    generate_normal: true,
                    ss_sampling_steps: 12,
                    slat_sampling_steps: 12,
                    ss_guidance_strength: 7.5,
                    slat_guidance_strength: 3
                }



                const output = await replicate.run("firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c", { input });
                console.log(output.model_file.url().href)
                response = {
                    modelUrl: output.model_file.url().href
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