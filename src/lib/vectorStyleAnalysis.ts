import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function analyseVectorStyle(query = '') {

    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const response = await together.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze the following request. 
                    If it contains a request for an icon or a logo respond 'icon'.
                    Otherwise respond 'vector_illustration'.
                    
                    Respond with just a single word without any exclamation marks and extra symbols.`
                }, {
                    role: "user",
                    content: `${query}`
                }
            ],
            model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            // model: "Qwen/Qwen1.5-7B-Chat",
            // model: "mistralai/Mistral-7B-Instruct-v0.3",
            max_tokens: 2048,
            temperature: 0.7
        });

        return response.choices[0].message.content.toLowerCase()

    } catch (err) {
        console.log(err)
    }
}