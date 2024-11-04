import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private'

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

export async function POST({ request, locals }) {
    const query = await request.json()
    console.log(query)
    try {
        let selectedModel = ''
        switch (query.model) {
            case 'llama3.1-8b':
                selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
                break;
            case 'llama3.1-70b':
                selectedModel = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
                break;
            case 'llama3.1-405b':
                selectedModel = 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
                break;
            case 'mistral-7B-Instruct-v0.1':
                selectedModel = 'mistralai/Mistral-7B-Instruct-v0.1'
                break;
            case 'mixtral-8x22B-Instruct-v0.1':
                selectedModel = 'mistralai/Mixtral-8x22B-Instruct-v0.1'
                break;
            case 'Qwen2-72B-Instruct':
                selectedModel = 'Qwen/Qwen2-72B-Instruct'
                break;
            default:
                selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
                break;
        }
        const output = await together.chat.completions.create({
            messages: [{
                role: "system",
                content: `You are a sketch generation agent. Your goal is to generate a sketch out of primitive forms like rectangle and circle. 

                Here is an example of user query - a multi-story structure, a mix of rectangular and square shapes, which are arranged in a staggered pattern
                And the output is like this: 

                [
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [200, 100], 
                    "size": [180, 100]
                    },
                "color": "white"
                }, 
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [220, 200], 
                    "size": [200, 100]
                    },
                "color": "white"
                },
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [180, 300], 
                    "size": [220, 100]
                    },
                "color": "white"
                },
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [200, 400], 
                    "size": [250, 100]
                    },
                "color": "white"
                },
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [150, 500], 
                    "size": [100, 300]
                    },
                "color": "white"
                }
                ]

                Carefully examine user query and decide what is the best way to depict it with primitives.
                Output your answer as an array of objects describing forms. The canvas size is 16:9 and 600 pixels wide. 

                For rectangle structure your output this way: 
                { 
                "type": "rectangle",
                "bounds": { 
                    "topLeft": [your number, your number], 
                    "size": [your numebr, your number]
                    },
                "color": "white"
                }

                For circle structure your output this way: 
                { 
                "type": "circle",
                "center": [ your number, your number ], 
                "radius": your number,
                "color": "white"
                }

                Answer with just an array of objects. 
                Start your answer with [.
                Here is the user query: `
            }, {
                role: "user",
                content: query.query
            }],
            model: selectedModel,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>"],
            stream: false
        });
        console.log(output.choices[0].message.content)

        const response = {
            shapes: output.choices[0].message.content
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