import { redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
  console.log('loading data')
  console.log(locals)
  try {
    if (locals.user !== undefined) {
      const id = params.projectId
      const project = await locals.pb.collection('nodeEditorProjects').getOne(id);

      return {
        name: project.name,
        id: project.id,
        data: project.data,
        user: locals.user
      }
    } else {
      throw redirect(302, '/')
    }
  } catch (err) {
    console.log(`error message from load function:`)
    console.log(err)
  }
}