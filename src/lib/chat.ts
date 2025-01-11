import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function chatResponse(model = '', query = '', systemPrompt = '', context = '') {
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

        return response.choices[0].message.content.toLowerCase()

    } catch (err) {
        console.log(err)
    }
}