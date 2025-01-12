import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function analyseRequest(query = '') {

    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const response = await together.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze the following request. 
                    If it contains a question respond 'chat'.

                    If it starts with 'an image', 'I need an image', or similar words respond 'image'.
                    If it describes an image respond 'image'.
                    
                    If it starts with 'a video', 'I need a video', or similar words respond 'video'.
                    If it describes a video respond 'video'.
                    
                    Otherwise respond 'chat'.
                    
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