import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }){
    const formData = await request.formData();
    const specialCourses = '{ "specialCourses" : [] }' 
    const requests = 100
    const email = formData.get('email')
    const password = formData.get('password')
    const passwordConfirm = formData.get('passwordConfirm')
    let response = {}

    try {
        await locals.pb.collection('users').create({requests, specialCourses, email, password, passwordConfirm})
        await locals.pb.collection('users').requestVerification(email)

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