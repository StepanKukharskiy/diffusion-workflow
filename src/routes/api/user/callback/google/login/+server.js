
export async function GET({ url, locals, cookies }) {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const codeVerifier = url.searchParams.get('code_verifier');
    // const pbState = url.searchParams.get('pb_state');
    console.log('this is the url:')
    console.log(url)
    // const codeVerifier = cookies.get('oauth2_code_verifier');
    // const savedState = cookies.get('oauth2_state');

    // const codeVerifier = cookies.get('oauth2_code_verifier') 
    //                     || cookies.get('gitpod_oauth2_code_verifier');
    
    // const savedState = cookies.get('oauth2_state') 
    //                   || cookies.get('gitpod_oauth2_state');

    // console.log(cookies.getAll())
    // console.log(`code verifier: ${codeVerifier}`)

    // console.log(locals.pb)
    // // Retrieve the saved provider that contains the original codeVerifier
    // const { provider } = locals.pb.authStore.model || {};
    // console.log(provider)
    
    if (!code) {
        return new Response(JSON.stringify({ error: 'No code provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (!codeVerifier) {
        console.error('Missing code verifier cookie');
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/threads?error=MissingCodeVerifier'
            }
        });
    }
    
    if (state !== savedState) {
        console.error('State mismatch', { state, savedState });
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/threads?error=StateMismatch'
            }
        });
    }
    
    try {
        const redirectURL = `${url.origin}/api/user/callback/google/login`;
        
        // Use the authWithOAuth2Code method with the saved code verifier
        const authData = await locals.pb.collection('users').authWithOAuth2Code(
            'google',
            code,
            codeVerifier,
            redirectURL
        );
        
        // Clear the OAuth cookies as they're no longer needed
        cookies.delete('oauth2_state', { path: '/' });
        cookies.delete('oauth2_code_verifier', { path: '/' });
        
        // Update last login time
        if (locals.pb.authStore.isValid) {
            const currentTime = new Date().toISOString();
            await locals.pb.collection("users").update(locals.pb.authStore.model.id, { lastLogin: currentTime });
        }
        
        // Redirect to a success page or dashboard
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/threads'
            }
        });
    } catch (err) {
        console.error('OAuth error:', err);
        // Clear the OAuth cookies on error too
        cookies.delete('oauth2_state', { path: '/' });
        cookies.delete('oauth2_code_verifier', { path: '/' });
        
        return new Response(null, {
            status: 302,
            headers: {
                'Location': `/login?error=GoogleAuthFailed&details=${encodeURIComponent(err.message)}`
            }
        });
    }
}
