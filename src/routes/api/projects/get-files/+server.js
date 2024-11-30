import { error, redirect } from '@sveltejs/kit'
import { serializeNonPOJOs } from '$lib/utils';
import { DB_URL } from '$env/static/private';

export async function POST({ request, locals, fetch }) {
    const formData = await request.formData();
    const id = formData.get('id')
    let response = {}
    console.log('loading project data')

    const fetchFile = async (url = '') => {
        const res = await fetch(url)
        const data = res.text()
        return data
    }

    try {
        const project = await locals.pb.collection('userProjects').getOne(id);

        const projectFilesData = []
        for (let file of project.files) {
            const url = `${DB_URL}/api/files/userProjects/${project.id}/${file}`
            const fileData = await fetchFile(url)
            projectFilesData.push({
                fileName: file.split('_')[0] + '.' + file.split('.')[1],
                fileData: fileData
            })
        }
        // projectData.push({
        //     files: projectFilesData
        // })


        response = {
            message: 'Success',
            files: projectFilesData
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