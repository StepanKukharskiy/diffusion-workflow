import Replicate from "replicate";
import { fal } from "@fal-ai/client";
import { REPLICATE_API_TOKEN, FAL_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});


export async function imageResponse(model = '', query = '', referenceCompositionImageUrl = '', maskImageUrl = '') {
    console.log(`model: ${model}`)
    console.log(`query: ${query}`)
    console.log(`ref: ${referenceCompositionImageUrl}`)
    try {
        let response
        let analysePromptResult = await analysePrompt(query)
        if (analysePromptResult?.trim() === 'ok') {
            if (referenceCompositionImageUrl === '') {
                if (model === 'flux-schnell') {
                    const input = {
                        prompt: query,
                        go_fast: true,
                        megapixels: "1",
                        num_outputs: 1,
                        aspect_ratio: "1:1",
                        output_format: "jpg",
                        output_quality: 80,
                        num_inference_steps: 4
                    };

                    const [output] = await replicate.run("black-forest-labs/flux-schnell", { input });
                    const imageUrl = output.url().href;

                    response = {
                        imageUrl: imageUrl
                    }
                } else if (model === 'flux-graphic-city') {
                    console.log('using graphic city model')
                    const input = {
                        steps: 50,
                        prompt: query,
                        guidance: 45,
                        output_format: "jpg",
                        safety_tolerance: 2,
                        prompt_upsampling: false
                    }
                    const [output] = await replicate.run("stepankukharskiy/flux-graphic-city:626d3796172949c1b429fdb81171f0ee0fcd5172cf1a940ccfe0caaac7b5a690", { input });
                    const imageUrl = output.url().href;
                    response = {
                        imageUrl: imageUrl
                    }
                } else if (model === 'brick-style') {
                    console.log('using brick-style model')
                    const input = {
                        steps: 50,
                        prompt: `BRCK ${query}`,
                        guidance: 45,
                        output_format: "jpg",
                        safety_tolerance: 2,
                        prompt_upsampling: false
                    }
                    const [output] = await replicate.run("stepankukharskiy/crtd-brck-1:11eca3a95e509b451f17df3a57ab815374df7a734653466d5e3213cc7b2dac0e", { input });
                    const imageUrl = output.url().href;
                    response = {
                        imageUrl: imageUrl
                    }
                } else if (model === 'flux-crmcs') {
                    console.log('using crmcs model')
                    const input = {
                        steps: 50,
                        prompt: query,
                        guidance: 45,
                        output_format: "jpg",
                        safety_tolerance: 2,
                        prompt_upsampling: false
                    }
                    const [output] = await replicate.run("stepankukharskiy/flux-crmcs:4c34c922877647dd13753e65b2774fc78c817c33a700eacb817dedd60d696fad", { input });
                    const imageUrl = output.url().href;
                    response = {
                        imageUrl: imageUrl
                    }
                }
            } else if (referenceCompositionImageUrl != '' && maskImageUrl === '' && model === 'brick-style') {
                console.log('using brick-canny model')
                const result = await fal.subscribe("fal-ai/flux-lora-canny", {
                    input: {
                      prompt: query,
                      num_inference_steps: 28,
                      guidance_scale: 30,
                      num_images: 1,
                      enable_safety_checker: true,
                      output_format: "jpeg",
                      image_url: referenceCompositionImageUrl,
                      loras: [{
                        path: "https://v3.fal.media/files/tiger/Pry2wwQHggjBSEKj64D-C_pytorch_lora_weights.safetensors",
                        scale: 1.5
                      }]
                    },
                    logs: true,
                    onQueueUpdate: (update) => {
                      if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                      }
                    },
                  });
                  console.log(result.data);
                  const imageUrl = result.data.images[0].url
                // const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            } else if (referenceCompositionImageUrl != '' && maskImageUrl === '' && model === 'flux-canny-pro') {
                console.log('using canny model')
                const input = {
                    steps: 50,
                    prompt: query,
                    guidance: 45,
                    control_image: referenceCompositionImageUrl,
                    output_format: "jpg",
                    safety_tolerance: 2,
                    prompt_upsampling: false
                }
                const output = await replicate.run("black-forest-labs/flux-canny-pro", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            } else if (referenceCompositionImageUrl != '' && maskImageUrl === '' && model === 'flux-depth-pro') {
                console.log('using depth model')
                const input = {
                    steps: 50,
                    prompt: query,
                    guidance: 45,
                    control_image: referenceCompositionImageUrl,
                    output_format: "jpg",
                    safety_tolerance: 2,
                    prompt_upsampling: false
                }
                const output = await replicate.run("black-forest-labs/flux-depth-pro", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            } else if (referenceCompositionImageUrl != '' && maskImageUrl === '' && model === 'recraft-crisp-upscale') {
                console.log('using upscale model')
                const input = {
                    image: referenceCompositionImageUrl,
                }
                const output = await replicate.run("recraft-ai/recraft-crisp-upscale", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            } else if (referenceCompositionImageUrl != '' && maskImageUrl != '') {
                console.log('using inpainting model')
                const input = {
                    mask: maskImageUrl,
                    image: referenceCompositionImageUrl,
                    steps: 50,
                    prompt: query,
                    guidance: 60,
                    outpaint: "None",
                    output_format: "jpg",
                    safety_tolerance: 2,
                    prompt_upsampling: false
                }
                const output = await replicate.run("black-forest-labs/flux-fill-pro", { input });
                const imageUrl = output.url().href;
                response = {
                    imageUrl: imageUrl
                }
            }

            const finalResponse = new Response(JSON.stringify(response), {
                status: 200,
                headers: {
                    // 'Access-Control-Allow-Origin': 'https://kodiia.me',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
            )
            console.log(finalResponse)
            return finalResponse
        }
    }
    catch (err) {
        console.log(err)
    }
}