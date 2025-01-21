import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function extractFrames(query = '') {

    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const response = await together.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze the following request. 
                    Find all urls provided in the request. Combine all the urls in an array of objects in JSON format following this pattern:
                    [
                    {
                    "url": "provided url1"
                    },
                    {
                    "url": "provided url2"
                    },
                    {
                    "url": "provided url3"
                    }
                    ]                    
                    Respond with just a complete array without any extra words and symbols.`
                }, {
                    role: "user",
                    content: `${query}`
                }
            ],
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            // model: "Qwen/Qwen1.5-7B-Chat",
            // model: "mistralai/Mistral-7B-Instruct-v0.3",
            max_tokens: 2048,
            temperature: 0.7
        });

        return response.choices[0].message.content

    } catch (err) {
        console.log(err)
    }
}