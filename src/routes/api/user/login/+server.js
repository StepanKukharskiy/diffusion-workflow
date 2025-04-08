import { error, redirect } from '@sveltejs/kit'

export async function POST({ request, locals, cookies }) {
    const formData = await request.formData();
    const authType = formData.get('authType'); // 'email' or 'google'
    const email = formData.get('email')
    const password = formData.get('password')
    let response = {}

    console.log(request.headers.get('origin'))

    try {
        // // Authenticate the user
        // await locals.pb.collection('users').authWithPassword(email, password);

        // // Check if the authentication was successful
        // if (locals.pb.authStore.isValid) {
        //     const currentTime = new Date().toISOString();
        //     // Update the last login time for the authenticated user
        //     await locals.pb.collection("users").update(locals.pb.authStore.model.id, { lastLogin: currentTime }); 
        //     response = { 
        //         message: 'Success',
        //         user: {
        //             email: locals.pb.authStore.model.email,
        //             id: locals.pb.authStore.model.id,
        //             requests: locals.pb.authStore.model.requests,
        //             verified: locals.pb.authStore.model.verified
        //         }
        //     }               
        // }else{
        //     locals.pb.authStore.clear()
        //     response = { 
        //         message: 'Something went wrong',
        //     } 
        // }

        // return new Response(JSON.stringify(response), {
        //     status: 200,
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        if (authType === 'email') {
            // Handle email/password login (your existing flow)
            const email = formData.get('email');
            const password = formData.get('password');

            await locals.pb.collection('users').authWithPassword(email, password);

            // Check if the authentication was successful
            if (locals.pb.authStore.isValid) {
                const currentTime = new Date().toISOString();
                // Update the last login time for the authenticated user
                await locals.pb.collection("users").update(locals.pb.authStore.model.id, { lastLogin: currentTime });
                response = {
                    message: 'Success',
                    user: {
                        email: locals.pb.authStore.model.email,
                        id: locals.pb.authStore.model.id,
                        requests: locals.pb.authStore.model.requests,
                        verified: locals.pb.authStore.model.verified
                    }
                };
            } else {
                locals.pb.authStore.clear();
                response = {
                    message: 'Something went wrong',
                };
            }
        } else if (authType === 'google') {
            // Get auth methods
            const authMethods = await locals.pb.collection('users').listAuthMethods();
            const googleAuthProvider = authMethods.authProviders.find(p => p.name === 'google');

            if (!googleAuthProvider) {
                throw new Error('Google auth provider is not configured');
            }

            // Create the redirect URL
            const redirectURL = `${request.headers.get('origin')}/api/user/callback/google/login`;

            // Store the necessary OAuth2 data in cookies
            // cookies.set('oauth2_state', googleAuthProvider.state, {
            //     path: '/',
            //     httpOnly: true,
            //     sameSite: 'none',
            //     secure: request.headers.get('origin').startsWith('https'),
            //     maxAge: 60 * 10 // 10 minutes
            // });

            // cookies.set('oauth2_code_verifier', googleAuthProvider.codeVerifier, {
            //     path: '/',
            //     httpOnly: true,
            //     sameSite: 'none',
            //     secure: request.headers.get('origin').startsWith('https'),
            //     maxAge: 60 * 10 // 10 minutes
            // });

            // Get the current hostname from origin
            // const originUrl = new URL(request.headers.get('origin'));

            // const isGitpod = originUrl.hostname.includes('.gitpod.io');

            // // Set cookies with proper domain handling
            // cookies.set('oauth2_code_verifier', googleAuthProvider.codeVerifier, {
            //     path: '/',
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax', // Use 'lax' instead of 'none' for Gitpod compatibility
            //     domain: isGitpod ? '.gitpod.io' : originUrl.hostname,
            //     maxAge: 60 * 10
            // });

            // cookies.set('oauth2_state', googleAuthProvider.state, {
            //     path: '/',
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     domain: isGitpod ? '.gitpod.io' : originUrl.hostname,
            //     maxAge: 60 * 10
            // });

            // // Add fallback cookies for Gitpod's dynamic subdomains
            // cookies.set('gitpod_oauth2_code_verifier', googleAuthProvider.codeVerifier, {
            //     path: '/',
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     domain: '.gitpod.io',
            //     maxAge: 60 * 10
            // });

            // cookies.set('gitpod_oauth2_state', googleAuthProvider.state, {
            //     path: '/',
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     domain: '.gitpod.io',
            //     maxAge: 60 * 10
            // });

            // console.log(`cookies set:`)
            // console.log(cookies.getAll())
            

            // locals.pb.authStore.save(googleAuthProvider.state, {
            //     provider: googleAuthProvider
            // });

            // locals.pb.myState = googleAuthProvider.state
            // console.log(locals.pb)

            // console.log(locals.pb)

            // Construct the auth URL correctly
            // const authUrl = `${googleAuthProvider.authUrl}&redirect_uri=${encodeURIComponent(redirectURL)}&state=${encodeURIComponent(googleAuthProvider.state)}`;
            // console.log(authUrl)
            // Parse the existing URL to avoid duplicate parameters
            const authUrlObj = new URL(googleAuthProvider.authUrl);

            // Remove any existing redirect_uri and state parameters
            authUrlObj.searchParams.delete('redirect_uri');
            authUrlObj.searchParams.delete('state');

            // Add the parameters with the correct values
            authUrlObj.searchParams.set('redirect_uri', redirectURL);
            authUrlObj.searchParams.set('state', googleAuthProvider.state);

            const authUrl = authUrlObj.toString()
            // console.log(authUrl)

            response = {
                message: 'Redirect',
                authUrl: authUrl,
                provider: 'google'
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