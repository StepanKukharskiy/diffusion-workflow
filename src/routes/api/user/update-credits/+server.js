import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }) {
    const formData = await request.json();
    const type = formData.type
    let response = {}

    try {
        // Update user credits number
        if (locals.pb.authStore.isValid) {
            console.log(locals.pb.authStore.model.requests)
            console.log(type)
            const currentCredits = locals.pb.authStore.model.requests
            let updatedCredits = 0
            switch (type) {
                case 'text':
                    updatedCredits = Math.round((currentCredits - 0.1) * 10) / 10;
                    break;
                case 'image':
                    updatedCredits = Math.round((currentCredits - 1) * 10) / 10;
                    break
                case '3Dmodel':
                    updatedCredits = Math.round((currentCredits - 10) * 10) / 10;
                    break
                case 'video':
                    updatedCredits = Math.round((currentCredits - 20) * 10) / 10;
                    break
                case 'video-interpolation':
                    updatedCredits = Math.round((currentCredits - 10) * 10) / 10;
                    break
                default:
                    updatedCredits = Math.round((currentCredits - 0.1) * 10) / 10;
                    break
            }
            await locals.pb.collection("users").update(locals.pb.authStore.model.id, { requests: updatedCredits });

            response = {
                message: 'Credites updated',
                credits: updatedCredits
            }

        } else {
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