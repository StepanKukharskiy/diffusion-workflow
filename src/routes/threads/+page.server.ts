import { serializeNonPOJOs } from '$lib/utils';
export async function load ({ locals }) {

  try{
  const threads = await locals.pb.collection('nodeEditorProjects').getFullList({
              filter: `createdBy = "${locals.user.id}"`,
              sort: '-created'
          });
  
  
  
          const threadsList = serializeNonPOJOs(threads)
          // console.log(threads)
          const threadsData = []
          for (let thread of threadsList) {
              threadsData.push({
                  name: thread.name,
                  id: thread.id,
                  updated: thread.updated
              })
          }

          return {
            user: locals.user,
            threads: threadsData
          }
        }
        catch (err){
          console.log(err)
        }
   
}