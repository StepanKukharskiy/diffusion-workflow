import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";
import { analyseVectorStyle } from "$lib/vectorStyleAnalysis";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function vectorResponse(model = '', query = '') {
    try {
        let response
        let analysePromptResult = await analysePrompt(query)
        let style = await analyseVectorStyle(query)
        if (analysePromptResult?.trim() === 'ok') {
            if (model === 'recraft-20b-svg') {
                const input = {
                    prompt: query,
                    size: "1024x1024",
                    style: style,
                };

                const output = await replicate.run("recraft-ai/recraft-20b-svg", { input });
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