export async function load({ locals, params }) {

  const id = params.projectId
  const project = await locals.pb.collection('nodeEditorProjects').getOne(id);
  // console.log(project)
  return {
    name: project.name,
    id: project.id,
    data: project.data,
    user: locals.user
  }
}