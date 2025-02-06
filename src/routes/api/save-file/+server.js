export async function POST({ request, locals, params }) {
    try {
        const formData = await request.formData();
        console.log(formData)
        const file = formData.get('file');
        const id = formData.get('projectId')

        const response = await locals.pb.collection('nodeEditorProjects').update(id, {
            'uploadedFiles' : file
        })

        console.log(response); // Log the response for debugging

        const record = await locals.pb.collection('nodeEditorProjects').getOne(id);
        const fileName = record.uploadedFiles[record.uploadedFiles.length-1];
        const fileUrl = await locals.pb.files.getUrl(record, fileName, {
            //'thumb': '100x250'
        });
        console.log(fileUrl)

        return new Response(JSON.stringify({ 
            message: 'File metadata saved successfully',
            url: fileUrl, 
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