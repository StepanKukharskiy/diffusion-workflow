import { error, redirect } from '@sveltejs/kit'
import { serializeNonPOJOs } from '$lib/utils';
import { DB_URL } from '$env/static/private';

export async function GET({ request, locals, fetch }) {
    //const formData = await request.formData();
    let response = {}

    try {
        const threads = await locals.pb.collection('nodeEditorProjects').getFullList({
            filter: `createdBy = "${locals.user.id}"`,
            sort: '-created'
        });



        const threadsList = serializeNonPOJOs(threads)
        console.log(threads)
        const threadsData = []
        for (let thread of threadsList) {
            threadsData.push({
                name: thread.name,
                id: thread.id,
                updated: thread.updated
            })
        }

        response = {
            message: 'Success',
            threads: threadsData
        }

        console.log(response)
    } catch (err) {
        response = {
            message: `Something went wrong: ${err}`,
        }
    }

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}