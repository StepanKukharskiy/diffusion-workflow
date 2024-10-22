export async function POST({ request, locals, params }) {
    try {
        const formData = await request.formData();
        console.log(formData)
        const file = formData.get('file');
        const id = formData.get('projectId')

        // Insert the record into your PocketBase collection
        // await locals.pb.collection('nodeEditorProjects').update(id, {
        //     'screenshots' : null
        // })
        const response = await locals.pb.collection('nodeEditorProjects').update(id, {
            'screenshots' : file
        })

        console.log(response); // Log the response for debugging

        const record = await locals.pb.collection('nodeEditorProjects').getOne(id);
        const screenshotName = record.screenshots[record.screenshots.length-1];
        const screenshotUrl = await locals.pb.files.getUrl(record, screenshotName, {
            //'thumb': '100x250'
        });
        console.log(screenshotUrl)

        return new Response(JSON.stringify({ 
            message: 'File metadata saved successfully',
            url: screenshotUrl, 
            //id: response.id 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Failed to save file metadata' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}