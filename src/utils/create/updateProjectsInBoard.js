import db from 'bc/config/db.js';

const BoardProject = db.boardProject;

export const updateProjectsInBoard = async (
  project_id,
  projectname,
  projecttype,
  projectsubtype,
  transaction
) => {
  let projectToUpdate = await BoardProject.findAll({
    where: {
      project_id: project_id,
    },
    transaction: transaction
  });
  if (projectToUpdate.length) {
    for (let i = 0; i < projectToUpdate.length; ++i) {
      let currentProj = projectToUpdate[i];
      await currentProj.update({
        projectname: projectname,
      }, { transaction: transaction });
    }
  }
  return true;
};