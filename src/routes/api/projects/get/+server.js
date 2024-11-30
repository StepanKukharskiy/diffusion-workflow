import { error, redirect } from '@sveltejs/kit'
import { serializeNonPOJOs } from '$lib/utils';
import { DB_URL } from '$env/static/private';

export async function GET({ request, locals, fetch }) {
    //const formData = await request.formData();
    let response = {}

    try {
        const projects = await locals.pb.collection('userProjects').getFullList({
            filter: `createdBy = "${locals.user.id}"`,
            sort: '-created'
        });

        const projectsList = serializeNonPOJOs(projects)

        const projectsData = []
        for (let project of projectsList) {
            projectsData.push({
                name: project.name,
                id: project.id,
            })
        }

        response = {
            message: 'Success',
            projects: projectsData
        }

        //console.log(response)
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