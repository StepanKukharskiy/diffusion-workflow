import Together from "together-ai";
import { TOGETHER_API_TOKEN } from '$env/static/private';
import OpenAI from "openai";
import { OPENAI_API_TOKEN } from '$env/static/private';

export async function chatResponse(model = '', query = '', systemPrompt = '', context = '', image = '') {
    console.log(`chat: ${model}, ${query}, ${systemPrompt}, ${image}`)
    try {

        const together = new Together({
            apiKey: TOGETHER_API_TOKEN,
        });

        const openai = new OpenAI({
            apiKey: OPENAI_API_TOKEN,
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
            case 'deepseek-V3':
                selectedModel = 'deepseek-ai/DeepSeek-V3'
                break;
            case 'mixtral-8x22B-Instruct-v0.1':
                selectedModel = 'mistralai/Mixtral-8x22B-Instruct-v0.1'
                break;
            case 'Qwen2-72B-Instruct':
                selectedModel = 'Qwen/Qwen2-72B-Instruct'
                break;
            case 'gpt-4o':
                selectedModel = 'gpt-4o'
                break;
            default:
                selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
                break;
        }

        if (image != '') {
            selectedModel = "gpt-4o"



            const response = await openai.responses.create({
                model: "gpt-4o",
                input: [
                    {
                        "role": "system",
                        "content": [
                            {
                                "type": "input_text",
                                "text": `${systemPrompt}  Here is the context: ${context}`
                            }
                        ]
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": `${query}`
                            },
                            {
                                "type": "input_image",
                                "image_url": `${image}`
                            }
                        ]
                    },
                ],
                text: {
                    "format": {
                        "type": "text"
                    }
                },
                reasoning: {},
                tools: [
                    {
                        "type": "web_search_preview",
                        "user_location": {
                            "type": "approximate",
                            "country": "US"
                        },
                        "search_context_size": "medium"
                    }
                ],
                temperature: 1,
                max_output_tokens: 16384,
                top_p: 1,
                store: true
            });
            //console.log(response.output[0].content[0].text)
            return response.output_text

        } else {
            if (selectedModel != 'gpt-4o') {
                const response = await together.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `${systemPrompt} Here is the context: ${context}`
                        },
                        {
                            role: "user",
                            content: `${query}`
                        }
                    ],
                    model: selectedModel,
                    max_tokens: 4096,
                    temperature: 0.7
                });

                console.log(`going with ${selectedModel}`)

                return response.choices[0].message.content
            } else {
                const response = await openai.responses.create({
                    model: "gpt-4o",
                    input: [
                        {
                            "role": "system",
                            "content": [
                                {
                                    "type": "input_text",
                                    "text": `${systemPrompt}  Here is the context: ${context}`
                                }
                            ]
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "input_text",
                                    "text": `${query}`
                                }
                            ]
                        },
                    ],
                    text: {
                        "format": {
                            "type": "text"
                        }
                    },
                    reasoning: {},
                    tools: [
                        {
                            "type": "web_search_preview",
                            "user_location": {
                                "type": "approximate",
                                "country": "US"
                            },
                            "search_context_size": "medium"
                        }
                    ],
                    temperature: 1,
                    max_output_tokens: 16384,
                    top_p: 1,
                    store: true
                });
                console.log(response.output_text)
                //console.log(response.output[0].content[0].text)
                return response.output_text
            }
        }

    } catch (err) {
        console.log(err)
    }
}