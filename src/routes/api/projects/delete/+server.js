
export async function POST({ request, locals, fetch }) {
    const formData = await request.formData();
    const id = formData.get('id')
    let response = {}

    try {
        await locals.pb.collection('userProjects').delete(id);

        response = {
            message: 'Success'
        }

    } catch (err) {
        response = {
            message: `Something went wrong: ${err}`,
        }
    }

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}