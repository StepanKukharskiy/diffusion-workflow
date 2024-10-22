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
                content: query.systemPrompt
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
        console.log(output)

        const response = {
            generatedText: output.choices[0].message.content
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