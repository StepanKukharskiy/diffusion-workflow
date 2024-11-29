import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }){
    const formData = await request.formData();
    const email = formData.get('email')
    let response = {}

    try {
        await locals.pb.collection('users').requestPasswordReset(email)

        response = { 
            message: 'Success',
        } 
    } catch (err) {
        console.log('Error: ', err)
        response = { 
            message: 'Something went wrong',
        }
    }

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}