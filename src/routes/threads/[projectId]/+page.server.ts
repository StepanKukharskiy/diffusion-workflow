import { DB_URL } from '$env/static/private';
import { serializeNonPOJOs } from '$lib/utils.js';

export async function load({ locals, params }) {
  const fetchFile = async (url = '') => {
    const res = await fetch(url);
    const data = await res.text(); // Ensure you await the text() method
    return data;
  };

  const id = params.projectId;
  const project = await locals.pb.collection('nodeEditorProjects').getOne(id);
  
  let projectData;

  if (project.dataFile) {
    const url = `${DB_URL}/api/files/nodeEditorProjects/${params.projectId}/${project.dataFile}`;
    const result = await fetchFile(url);
    projectData = JSON.parse(result)
  } else {
    projectData = project.data;
  }

  return {
    name: project.name,
    id: project.id,
    data: projectData,
    createdBy: project.createdBy,
    user: locals.user
  };
}