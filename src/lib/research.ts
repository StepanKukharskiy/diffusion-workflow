import { PPLX_API_TOKEN } from "$env/static/private";

export async function getResearchData(query = '') {

            try {
                    const options = {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${PPLX_API_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: `{
                        "temperature":0.2,
                        "top_p":0.9,
                        "return_images":true,
                        "return_related_questions":false,
                        "top_k":0,
                        "stream":false,
                        "presence_penalty":0,
                        "frequency_penalty":1,
                        "web_search_options":{"search_context_size":"medium"},
                        "model":"sonar",
                        "messages":[
                        {
                        "content":"You are a researcher for Kodiia design platform. Your task is to provide concise information for user research queries finding relevant architectur, design, or art examples. If applicable: identify its creator, year/period, 1-2 key principles, and relevance to design in under 100 words. Format with bullet points, ensure accuracy, and focus on visual characteristics when relevant. Present information clearly with proper headings.",
                        "role":"system"
                        },
                        {
                        "content":"Here is the query: ${query}.",
                        "role":"user"
                        }
                        ]}`
                    };

                    const pplxMessage = await fetch('https://api.perplexity.ai/chat/completions', options)
                    const pplxMessageObject = await pplxMessage.json()
                    

                return pplxMessageObject
            } catch (err) {
                console.log(err)
            }
        }