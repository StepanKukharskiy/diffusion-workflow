import { analyseRequest } from "$lib/requestAnalysis";
import { imageResponse } from "$lib/image";


export async function POST({ request, locals }) {
    const query = await request.json()
    console.log(query)

    try {
        if (query.query.includes('CRMCS')) {
            let response

            console.log('getting image agent response')
            let model = 'flux-crmcs'

            console.log(model)
            const finalQuery = `${query.query}, complex forms, soft lighting`
            const imageResponseData = await imageResponse(model, finalQuery, '')
            const imageResponseDataUrl = await imageResponseData?.json()

            response = {
                type: 'image',
                url: imageResponseDataUrl.imageUrl
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
        }

    } catch (err) {
        console.log(err)
    }
}