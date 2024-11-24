import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }){
    //const formData = await request.formData();

    locals.pb.authStore.clear()
    locals.user = undefined

    const response = { 
        message: 'Logged out',
    } 

    console.log(response)

return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
        'Content-Type': 'application/json',
    },
});
}