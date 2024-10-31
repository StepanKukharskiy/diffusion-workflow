import { error } from '@sveltejs/kit';
import { getImageUrl } from '$lib/utils'

export async function GET({locals, params}){
    console.log(params)
    const url = locals.pb.baseUrl + '/' + getImageUrl(params.collectionName, params.recordId, params.fileName)

    const response = await fetch(url)
    const blob = await response.blob()

    return new Response( blob )
}