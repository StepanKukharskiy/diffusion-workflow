
export async function POST({ request, locals, fetch }) {
    const formData = await request.formData();
    // console.log(formData)
    const files = formData.getAll('files');
    const name = formData.get('name')
    const id = formData.get('id')

    let response = {}
    let record

    try {
        const pbFormData = new FormData();
        pbFormData.append('name', name);
        pbFormData.append('createdBy', locals.user.id);

        // Append each file to the new FormData
        files.forEach((file) => {
            pbFormData.append('files', file);
        });

        if(id === ''){
            record = await locals.pb.collection('userProjects').create(pbFormData)
        } else {
            await locals.pb.collection('userProjects').update(id, {
                'files': null,
              });
      
            record = await locals.pb.collection('userProjects').update(id, formData)
        }
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