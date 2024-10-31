// import Replicate from "replicate";
// import { REPLICATE_API_TOKEN } from '$env/static/private'

import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private'

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

import { analysePrompt } from "$lib/promptAnalysis";

// const replicate = new Replicate({
//     auth: REPLICATE_API_TOKEN,
// });


export async function POST({ request, locals }) {

    try {
        const query = await request.json()
        let response

        const input = {
            image: query.imageUrl,
            prompt: `${query.query}`
        };


        const promptAnalysis = await analysePrompt(query.query)
        console.log(promptAnalysis)
        console.log(input)
        if (promptAnalysis?.toLowerCase() === 'ok') {
            console.log('analysis is ok')
        }

        //     const output = await replicate.run("yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb", { input });
        //     // const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });
        //     console.log(output.join(""))



        const output = await together.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": "You are a friendly assistant"
                },
                ...query.previousAnswers.map(answer => ({
                    "role": "assistant",
                    "content": answer
                })),
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": query.query
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": query.imageUrl
                            }
                        }
                    ]
                },
                // {
                //     "role": "assistant",
                //     "content": query.previousAnswers
                // }
            ],
            model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>", "<|eom_id|>"],
            stream: false
        });
        console.log(output.choices[0].message.content)

        response = {
            generatedText: output.choices[0].message.content
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

        console.log(finalResponse)

        return finalResponse


    } catch (err) {
        console.log(err)
    }
}