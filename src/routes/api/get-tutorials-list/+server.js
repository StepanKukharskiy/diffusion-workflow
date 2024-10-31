import { error } from '@sveltejs/kit';
import { serializeNonPOJOs } from '$lib/utils';

export async function GET({locals}){
        try{
            const tutorials = await locals.pb.collection('tutorials').getList(1, 100, { '$autoCancel': false, sort: '-created' }
            );
            const tutorialsObject = serializeNonPOJOs(tutorials)
            console.log(tutorialsObject.items[0].courseSpecialName)

            let availableTutorials = []
            for(let tutorial of tutorialsObject.items){
                if(tutorial.courseType === 'special' && locals.user){
                    for(let specialCourse of locals.user.specialCourses.specialCourses){
                        if(specialCourse === tutorial.courseSpecialName){
                            availableTutorials.push(tutorial)
                        } 
                    }
                } else if(tutorial.courseType === 'open'){
                    availableTutorials.push(tutorial)
                }
            }

            let tutorialsNamesList = []
            for (let tutorial of availableTutorials){
                tutorialsNamesList.push({
                    name: tutorial.heading,
                    steps: tutorial.stepsJSON.steps
                })
            }

            return new Response(JSON.stringify({
                message: 'Tutorials read successfully',
                tutorials: tutorialsNamesList
              }), {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              });

        } catch (err){
            console.log(err)
            throw error(err.status, err.message);
        }
    }
