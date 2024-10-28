import { error, redirect } from '@sveltejs/kit'
import { DB_URL } from '$env/static/private';

export async function POST({ request, locals, params }) {

  const fetchFile = async (url='') => {
    const res = await fetch(url)
    const data = res.text()
    return data
}

  try {
    console.log(request)
    const query = await request.json();
    console.log(query)
    const templateName = query.name
    const template = await locals.pb.collection('projects').getFirstListItem(`name="${templateName}"`);

    console.log(template)

    const files = []
    for (let file of template.files){
      let url = `${DB_URL}/api/files/projects/${template.id}/${file}`
      await fetchFile(url).then(result => {files.push(
        {
          fileName: file.split('_')[0] + '.' + file.split('.')[1],
          fileData: result
        }
        )
      }
      )
    }
    return new Response(JSON.stringify({
      message: 'Templates read successfully',
      files: files
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

