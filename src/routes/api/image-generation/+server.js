import Replicate from "replicate";
import { REPLICATE_API_TOKEN } from '$env/static/private'
import { analysePrompt } from "$lib/promptAnalysis";
import fs from "node:fs";

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});

function dataURItoFile(dataURI = '', filename = '') {
    // Split the data URI into parts
    const splitIndex = dataURI.indexOf(',');
    const mimeString = dataURI.substring(5, splitIndex); // Get the MIME type
    const byteString = atob(dataURI.substring(splitIndex + 1)); // Decode base64 string

    // Create an array buffer and fill it with the binary data
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // Create and return a new File object
    return new File([ab], filename, { type: mimeString });
}

export async function POST({ request, locals, params }) {

    try {
        const query = await request.json()
        console.log(query)

        // const imageFile = new File([query.image], "image.png");

        // const record = await locals.pb.collection('editorProjects').getOne(query.id);
        // const screenshotName = record.screenshots[0];
        // const screenshotUrl = await locals.pb.files.getUrl(record, screenshotName, {
        //     //'thumb': '100x250'
        // });
        // console.log(screenshotUrl)

        let response, output

        const promptAnalysis = await analysePrompt(query.prompt)
        console.log(typeof promptAnalysis)
        if (promptAnalysis?.trim() === 'ok') {
            if (query.model === 'sdxl-controlnet-canny') {
                const input = {
                    //seed: 18457,
                    image: query.refImageUrl,
                    prompt: query.prompt,
                    condition_scale: 0.5,
                    negative_prompt: "low quality, bad quality, sketches",
                    num_inference_steps: 50
                };

                console.log(input)
                output = await replicate.run("lucataco/sdxl-controlnet:06d6fae3b75ab68a28cd2900afa6033166910dd09fd9751047043a5bbb4c184b", { input });
                // const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });
                console.log(output)
                response = {
                    imageUrl: output
                }
            } else if (query.model === 'sdxl-controlnet-depth') {
                const input = {
                    //seed: 18457,
                    image: query.refImageUrl,
                    prompt: query.prompt,
                    condition_scale: 0.5,
                    negative_prompt: "low quality, bad quality, sketches",
                    num_inference_steps: 50
                };

                console.log(input)
                output = await replicate.run("lucataco/sdxl-controlnet-depth:465fb41789dc2203a9d7158be11d1d2570606a039c65e0e236fd329b5eecb10c", { input });
                // const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });
                console.log(output)
                response = {
                    imageUrl: output
                }
            }
            else if (query.model === 'sdxl-controlnet-seg') {
                const input = {
                    //seed: 18457,
                    image: query.refImageUrl,
                    prompt: query.prompt,
                    image_resolution: '512',
                    detect_resolution: 1024
                };

                console.log(input)
                output = await replicate.run("jagilley/controlnet-seg:f967b165f4cd2e151d11e7450a8214e5d22ad2007f042f2f891ca3981dbfba0d", { input });
                // const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });

                console.log(output)
                response = {
                    imageUrl: output[1]
                }
            }
            else if (query.model === 'flux-dev-controlnet-depth') {
                const input = {
                    prompt: query.prompt,
                    control_image: query.refImageUrl,
                    control_type: 'depth',
                    guidance_scale: 2.5,
                    output_quality: 100,
                    negative_prompt: "low quality, ugly, distorted, artefacts",
                    control_strength: 0.75
                };

                console.log(input)
                const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });
                console.log(output)
                response = {
                    imageUrl: output[0]
                }
            } else if (query.model === 'flux-dev-controlnet-canny') {
                const input = {
                    prompt: query.prompt,
                    control_image: query.refImageUrl,
                    control_type: 'canny',
                    guidance_scale: 2.5,
                    output_quality: 100,
                    negative_prompt: "low quality, ugly, distorted, artefacts",
                    control_strength: 0.5
                };

                console.log(input)
                const output = await replicate.run("xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2", { input });
                console.log(output)
                response = {
                    imageUrl: output[0]
                }
            } else if (query.model === 'flux-dev-inpaint') {
                const input = {
                    mask: query.maskUrl,
                    image: query.refImageUrl,
                    width: 1024,
                    height: 1024,
                    prompt: query.prompt,
                };

                console.log(input)
                const output = await replicate.run("zsxkib/flux-dev-inpainting:ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008", { input });
                console.log(output)
                response = {
                    imageUrl: output[0]
                }
            } else if (query.model === 'stable-diffusion-3') {
                const input = {
                    prompt: query.prompt,
                    // aspect_ratio: "3:2"
                };

                const [output] = await replicate.run("stability-ai/stable-diffusion-3", { input });

                response = {
                    imageUrl: output.url()
                }
            } else if (query.model === 'flux-schnell') {
                const input = {
                    prompt: query.prompt
                };

                const [output] = await replicate.run("black-forest-labs/flux-schnell", { input });
                // const file = output.url();
                const dataUri = output.url().href; // Assuming output is the data URI
                const base64Data = dataUri.split(',')[1];
                const imageBuffer = Buffer.from(base64Data, 'base64');
                console.log(imageBuffer)
                const imageBlob = new Blob([imageBuffer], { type: 'image/webp' });

                const formData = new FormData();
                formData.append("generatedImages", imageBlob, `${query.model}.webp`);
                console.log(formData)
                const responseDb = await locals.pb.collection('nodeEditorProjects').update(query.projectId, formData)

                const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
                const generatedImageFileName = record.generatedImages[record.generatedImages.length - 1];
                const generatedImageFileUrl = await locals.pb.files.getUrl(record, generatedImageFileName, {
                    //'thumb': '100x250'
                });
                //console.log(imageBuffer)

                console.log(response); // Log the response for debugging
                response = {
                    imageUrl: generatedImageFileUrl
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

            console.log(output)

            return finalResponse
        }

    } catch (err) {
        console.log(err)
    }
}