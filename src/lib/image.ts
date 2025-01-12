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
            if (model === 'flux-schnell') {
                const input = {
                    prompt: query
                };

                const [output] = await replicate.run("black-forest-labs/flux-schnell", { input });
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