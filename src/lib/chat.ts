import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function chatResponse(model = '', query = '', systemPrompt = '', context = '', image = '') {
    console.log(`chat: ${model}, ${query}, ${systemPrompt}`)
    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        let selectedModel = ''
        switch (model) {
            case 'llama3.1-8b':
                selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
                break;
            case 'llama3.1-70b':
                selectedModel = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
                break;
            case 'llama3.3-70b':
                selectedModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
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

        if (image != '') {
            selectedModel = "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo"

            const response = await together.chat.completions.create({
                messages: [
                    {
                        "role": "system",
                        "content": `${systemPrompt} Here is the context: ${context}`
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": query
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image
                                }
                            }
                        ]
                    },
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
            console.log(image)

            return response.choices[0].message.content
        } else {
            const response = await together.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `${systemPrompt} Here is the context: ${context}`
                    }, {
                        role: "user",
                        content: `${query}`
                    }
                ],
                model: selectedModel,
                max_tokens: 4096,
                temperature: 0.7
            });

            return response.choices[0].message.content
        }

    } catch (err) {
        console.log(err)
    }
}