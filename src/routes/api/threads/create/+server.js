
export async function POST({ request, locals, fetch }) {
    const formData = await request.formData();
    console.log(formData)
    const name = formData.get('name')

    let response = {}
    let record

    try {
        const pbFormData = new FormData();
        pbFormData.append('name', name);
        pbFormData.append('createdBy', locals.user.id);

        record = await locals.pb.collection('nodeEditorProjects').create(pbFormData)

        response = {
            message: 'Success',
            id: record.id
        }

    } catch (err) {
        response = {
            message: `Something went wrong: ${err}`,
        }
    }

    console.log(response)

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}