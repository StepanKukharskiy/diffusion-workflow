import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }){
    const formData = await request.formData();
    const email = formData.get('email')
    const password = formData.get('password')
    let response = {}

try {
    // Authenticate the user
    await locals.pb.collection('users').authWithPassword(email, password);
    
    // Check if the authentication was successful
    if (locals.pb.authStore.isValid) {
        const currentTime = new Date().toISOString();
        // Update the last login time for the authenticated user
        await locals.pb.collection("users").update(locals.pb.authStore.model.id, { lastLogin: currentTime }); 
        response = { 
            message: 'Success',
            //user: locals.user
        }               
    }else{
        locals.pb.authStore.clear()
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

} catch (err) {
    console.log('Error: ', err)
    throw error(500, 'Something went wrong while logging in')
}
}