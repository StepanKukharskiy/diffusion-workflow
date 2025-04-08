import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals }){
    const formData = await request.formData();
    const authType = formData.get('authType');
    const specialCourses = '{ "specialCourses" : [] }' 
    const requests = 100
    const email = formData.get('email')
    const password = formData.get('password')
    const passwordConfirm = formData.get('passwordConfirm')
    let response = {}

    try {
        // await locals.pb.collection('users').create({requests, specialCourses, email, password, passwordConfirm})
        // await locals.pb.collection('users').requestVerification(email)

        // response = { 
        //     message: 'Success',
        // } 
        if (authType === 'email') {
            // Handle email/password registration (your existing flow)
            const email = formData.get('email');
            const password = formData.get('password');
            const passwordConfirm = formData.get('passwordConfirm');
            
            await locals.pb.collection('users').create({
                requests, 
                specialCourses, 
                email, 
                password, 
                passwordConfirm
            });
            await locals.pb.collection('users').requestVerification(email);
            
            response = { message: 'Success' };
        } else if (authType === 'google') {
            // Handle Google OAuth flow
            const authMethods = await locals.pb.collection('users').listAuthMethods();
            const googleAuthProvider = authMethods.authProviders.find(p => p.name === 'google');
            
            if (!googleAuthProvider) {
                throw new Error('Google auth provider is not configured');
            }
            
            // Return the auth URL for redirection on the client side
            const redirectURL = `${url.origin}/auth/callback/google`;
            
            response = { 
                message: 'Redirect',
                authUrl: `${googleAuthProvider.authUrl}${redirectURL}`,
                provider: 'google'
            };
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