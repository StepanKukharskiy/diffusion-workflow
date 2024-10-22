import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function analysePrompt(query = '') {

    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const response = await together.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze the following image generation prompt for explicit content. 
                    Evaluate the following image generation prompt for explicit content. 
                    Respond with 'OK' if the prompt is safe for image generation, 
                    or 'NOT OK' if it contains elements that may lead to explicit content.
                    Respond with just a single word without any exclamation marks and extra symbols.`
                }, {
                    role: "user",
                    content: `${query}`
                }
            ],
            // model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            // model: "Qwen/Qwen1.5-7B-Chat",
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            max_tokens: 128,
            temperature: 0.7
        });
        console.log(response.choices[0].message.content.toLowerCase())

        return response.choices[0].message.content.toLowerCase()

    } catch (err) {
        console.log(err)
    }
}