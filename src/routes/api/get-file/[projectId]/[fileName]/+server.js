export async function GET({ request, locals, params }) {
    try {
        // const query = await request.json()

        // console.log(query)

        const url = `${locals.pb.baseUrl}api/files/nodeEditorProjects/${params.projectId}/${params.fileName}`
        console.log(url)

        const response = await fetch(url)
    const blob = await response.blob()
        return new Response(blob, {
            status: 200,
            headers: {
                // 'Access-Control-Allow-Origin': 'https://kodiia.me',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        }
        )
        // const record = await locals.pb.collection('nodeEditorProjects').getOne(query.projectId);
    } catch (err) {
        console.log(err)
    }
}