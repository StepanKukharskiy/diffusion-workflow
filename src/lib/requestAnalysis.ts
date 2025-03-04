import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';

export async function analyseRequest(query = '') {

    console.log(query)
    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const response = await together.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze the following request. 
                    It may contain URLs. Ignore them.

                    If it is a question or requires a text output respond 'chat'.

                    If it starts with 'an image', 'I need an image', or similar words respond 'image'.
                    
                    If it starts with 'a video', 'I need a video', or similar words respond 'video'.

                    If it starts with 'an icon', 'I need an icon', 'a vector illustration', 'I need a vector illustration', or similar words respond 'vector'.

                    If it starts with 'a model', 'I need a 3d model', or similar words respond 'model'.

                    If it starts with 'interpolate', 'I need to interpolate', or similar words respond 'interpolation'.
                    
                    Otherwise respond 'chat'.
                    
                    Important: Respond with just a SINGLE WORD without any exclamation marks and extra symbols. 
                    
                    Here is the request: `
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

        const responseOutcome = response.choices[0].message.content.toLowerCase()
        if(responseOutcome.trim() === 'chat' || responseOutcome.trim() === 'image' || responseOutcome.trim() === 'video' || responseOutcome.trim() === 'vector' || responseOutcome.trim() === 'model' || responseOutcome.trim() === 'interpolation'){
          return responseOutcome   
        } else {
            console.log('trying again')
            console.log(responseOutcome)
            const response = await together.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are givivng the wrong reponse. ANSWER WITH A SINGLE WORD! Analyze the following request one more time. 
                        It may contain URLs. Ignore them.
    
                        If it is a question or requires a text output respond 'chat'.
    
                        If it starts with 'an image', 'I need an image', or similar words respond 'image'.
                        
                        If it starts with 'a video', 'I need a video', or similar words respond 'video'.
    
                        If it starts with 'an icon', 'I need an icon', 'a vector illustration', 'I need a vector illustration', or similar words respond 'vector'.
    
                        If it starts with 'a model', 'I need a 3d model', or similar words respond 'model'.
    
                        If it starts with 'interpolate', 'I need to interpolate', or similar words respond 'interpolation'.
                        
                        Otherwise respond 'chat'.
                        
                        Important: Respond with just a SINGLE WORD without any exclamation marks and extra symbols. 
                        
                        Here is thre request: `
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

            console.log(response)
            console.log(response.choices[0].message.content.toLowerCase())

            return response.choices[0].message.content.toLowerCase()
        }

        

    } catch (err) {
        console.log(err)
    }
}