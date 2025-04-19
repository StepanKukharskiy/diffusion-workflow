import Together from "together-ai";
import { chatResponse } from "$lib/chat";
import { imageResponse } from "$lib/image";
import { TOGETHER_API_TOKEN } from '$env/static/private'

const together = new Together({ apiKey: TOGETHER_API_TOKEN });

export async function POST({ request, locals }) {
    const query = await request.json()
    // console.log(query)
    try {
        let selectedModel = 'deepseek-ai/DeepSeek-R1'
        let visionResponse
        // switch (query.model) {
        //     case 'llama3.1-8b':
        //         selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
        //         break;
        //     case 'llama3.1-70b':
        //         selectedModel = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
        //         break;
        //     case 'llama3.3-70b':
        //         selectedModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
        //         break;
        //     case 'llama3.1-405b':
        //         selectedModel = 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
        //         break;
        //     case 'mistral-7B-Instruct-v0.1':
        //         selectedModel = 'mistralai/Mistral-7B-Instruct-v0.1'
        //         break;
        //     case 'mixtral-8x22B-Instruct-v0.1':
        //         selectedModel = 'mistralai/Mixtral-8x22B-Instruct-v0.1'
        //         break;
        //     case 'Qwen2-72B-Instruct':
        //         selectedModel = 'Qwen/Qwen2-72B-Instruct'
        //         break;
        //     default:
        //         selectedModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
        //         break;
    
    
        const visionOutput = await together.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": `You are a specialized visual analysis assistant powered by Llama 4 Maverick. Your purpose is to analyze design images uploaded to Kodiia, an AI-first sketchbook for architects, artists, and designers.

When presented with an image:

1. OBSERVE VISUAL ELEMENTS: Identify and describe key materials, colors, textures, spatial relationships, and focal points visible in the image. Be precise and detailed in your observations.

2. RECOGNIZE STYLE & REFERENCES: Note any recognizable design styles, cultural references, or similar precedents that this design appears to draw inspiration from.

3. EXTRACT CONCEPTUAL ELEMENTS: Identify the underlying concepts, themes, or narratives that appear to be expressed through the visual elements.

4. TECHNICAL CONSIDERATIONS: Note any visible technical aspects related to implementation, materials, or construction that might be relevant to the designer.

5. CONTEXTUAL UNDERSTANDING: Consider how the design might interact with its intended environment or audience based on visual cues.

6. VIEW POINT: Specify the view point 

Present your analysis in clear, structured language without making assumptions about aspects not visible in the image. Your observations will serve as the foundation for deeper critique and feedback.

Format your response as a structured JSON object with these categories to enable seamless integration with the R1 critique module.
`
                },
                ...query.previousAnswers.map(answer => ({
                    "role": "assistant",
                    "content": answer
                })),
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": query.query
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": query.referenceImage
                            }
                        }
                    ]
                },
                // {
                //     "role": "assistant",
                //     "content": query.previousAnswers
                // }
            ],
            model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>", "<|eom_id|>"],
            stream: false
        });
        console.log(visionOutput.choices[0].message.content)

        visionResponse = {
            generatedText: visionOutput.choices[0].message.content
        }    // }


        const output = await together.chat.completions.create({
            messages: [{
                role: "system",
                content: `You are a design insights specialist powered by DeepSeek R1, working within Kodiia - an AI-first sketchbook for architects, artists, and designers. You receive visual analysis data from the Llama 4 vision module and transform it into thoughtful questions and constructive feedback to explore unobvious further design directions.

Your role is not to make definitive judgments but to stimulate reflection through insightful questions and observations that help designers refine their work.

When processing visual analysis data:

1. FORMULATE REFLECTIVE QUESTIONS: Create 3-5 thought-provoking questions that encourage the designer to reflect on their choices, intentions, and potential alternatives. Focus on areas like:
   - Conceptual clarity and communication
   - Material and color relationships
   - Spatial organization and hierarchy
   - Contextual appropriateness
   - Technical implementation considerations

2. SUGGEST EXPLORATION PATHS: Offer 2-3 potential directions the designer might explore to develop their concept further, presented as open-ended suggestions rather than prescriptive advice.

3. HIGHLIGHT STRENGTHS: Identify 2-3 aspects of the design that appear particularly successful or compelling, explaining their potential impact.

4. REFERENCE CONNECTIONS: Suggest relevant precedents, references, or theoretical frameworks that might enrich the designer's thinking about their work.

5. IMPLEMENTATION CONSIDERATIONS: If applicable, note technical aspects that might affect the realization of the design.

Your feedback should be domain-adaptive, adjusting naturally whether the design is architectural, product-based, or game-related. Maintain a tone that is analytical, constructive, and encouraging rather than judgmental.

Before presenting the response review your feedback, make it deeper and more profound.

Present your response in a conversational format that invites further dialogue and iteration.

Here is the visual analysis data: ${visionResponse.generatedText}

Here is the whole user chat context: ${query.previousAnswers}`
            }, {
                role: "user",
                content: query.query
            }],
            model: 'deepseek-ai/DeepSeek-R1',
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>"],
            stream: false
        });
        console.log(output.choices[0].message.content)

        const answer = output.choices[0].message.content

        function splitMarkdown(markdown = '') {
            // Define the regex pattern to match content between <think> and </think> tags
            const thinkPattern = /<think>([\s\S]*?)<\/think>/;
    
            // Find the match
            const match = markdown.match(thinkPattern);
    
            // Extract the think content if there's a match
            const thinkContent = match ? match[1].trim() : '';
    
            // Remove the think content from the original markdown to get the rest
            const restContent = markdown.replace(thinkPattern, '').trim();
    
            return {
                thinkContent,
                restContent
            };
        }

        const updatedAnswer = splitMarkdown(answer).restContent;
        const thinkContent = splitMarkdown(answer).thinkContent;

        const conceptualRefsPrompt = `
            Given this text, extract a list of Conceptual Connections provided. 
            - Extract references mentioned in critique
            - Use format like this: ["Zaha Hadid's parametric designs", "Bauhaus color theory", "Open world game environmental storytelling"]
            - Answer with just an array. Here is the text: ${thinkContent}`

        const promptDesignPromt = `
        You are a prompt engineer specialist powered by DeepSeek V3, working within Kodiia - an AI-first sketchbook for architects, artists, and designers. You receive critique analysis data from the DEEPSEEK R1 module and transform it into a detailed image description for Flux model to best present the design concept.
        - Combine key elements from critique. Pay close attention to Conceptual References and Potential Exploration Vectors.
        - Come up with a super detailed prompt.
        - Use best propmt design practices corresponding to the project field.
        - Start your prompt with 'An image of'.
        - If applicable specify detailed geometry and design language description.
        - Specify view point.
        - Specify best lighting conditions to present the design idea. Use soft lighting with soft shadows unless it is necessary to do the opposite.
        - Make the prompt short and coherent. Remove unnecesary details.
        - Answer with just a prompt.
        Here is the critique: ${thinkContent}`

        const finalPrompt = await chatResponse('deepseek-V3', thinkContent, promptDesignPromt)

        const imageResponseData = await imageResponse('flux-canny-pro', finalPrompt, query.referenceImage)
        const imageResponseDataUrl = await imageResponseData?.json()

            const imageForDb = await fetch(imageResponseDataUrl.imageUrl);
            const imageBuffer = await imageForDb.arrayBuffer();
            console.log(imageBuffer)
            const imageBlob = new Blob([imageBuffer], { type: 'image/webp' });

            const formData = new FormData();
            formData.append("generatedImages", imageBlob, `${query.query}.webp`);
            console.log(formData)
            const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

            const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
            const generatedImageFileName = record.generatedImages[record.generatedImages.length - 1];
            const generatedImageFileUrl = await locals.pb.files.getUrl(record, generatedImageFileName, {
                //'thumb': '100x250'
            });

        const response = {
            thoughtProcess: thinkContent,
            generatedText: updatedAnswer,
            conceptualRefs: await chatResponse('deepseek-V3', thinkContent, conceptualRefsPrompt),
            prompt: await chatResponse('deepseek-V3', thinkContent, promptDesignPromt),
            imageOptionUrl: generatedImageFileUrl
        }
        console.log(response)
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