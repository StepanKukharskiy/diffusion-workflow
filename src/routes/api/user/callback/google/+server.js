// src/routes/auth/callback/google/+server.js
export async function GET({ url, locals }) {
    const code = url.searchParams.get('code');
    
    if (!code) {
        return new Response(JSON.stringify({ error: 'No code provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const redirectURL = `${url.origin}/auth/callback/google`;
        
        // Complete the OAuth flow
        const authData = await locals.pb.collection('users').authWithOAuth2({
            provider: 'google',
            code,
            redirectUrl: redirectURL,
            createData: {
                requests: 100,
                specialCourses: '{ "specialCourses" : [] }'
            }
        });
        
        // Redirect to a success page or dashboard
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/threads'
            }
        });
    } catch (err) {
        console.error('OAuth error:', err);
        return new Response(JSON.stringify({ error: 'OAuth authentication failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
