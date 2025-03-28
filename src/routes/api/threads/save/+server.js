import { redirect } from '@sveltejs/kit';

export async function POST({ request, locals, fetch }) {
    const formData = await request.formData();
    // console.log(formData)
    const files = formData.getAll('files');
    const name = formData.get('name')
    const id = formData.get('id')
    const data = formData.get('data')
    const dataFile = formData.get('dataFile')

    let response = {}
    let record

    try {
        const pbFormData = new FormData();
        pbFormData.append('name', name);
        pbFormData.append('createdBy', locals.user.id);
        // pbFormData.append('data', data)
        pbFormData.append('dataFile', dataFile)


        await locals.pb.collection('nodeEditorProjects').update(id, {
            'dataFile': null,
        });

        record = await locals.pb.collection('nodeEditorProjects').update(id, pbFormData)

        response = {
            message: 'Success',
            //id: record.id
        }

    } catch (err) {
        response = {
            message: `Something went wrong: ${err}`,
        }

        throw redirect(300, '/threads')
    }

    console.log(response)

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}