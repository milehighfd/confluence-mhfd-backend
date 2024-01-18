import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectStream = db.project_stream;
const PrimaryStream = db.primaryStream;

export const deleteStreams = async (project_id, transaction) => {
  try {
    const projectStreams = await ProjectStream.findAll({
      where: {
        project_id: project_id 
      },
      transaction: transaction
    });

    if (projectStreams.length > 0) {
      for (let ps of projectStreams) {
        await PrimaryStream.destroy({
          where: {
            project_stream_id: ps.project_stream_id
          },
          transaction: transaction
        });
      }

      await ProjectStream.destroy({
        where: {
          project_id: project_id 
        },
        transaction: transaction
      });

      logger.info('ProjectStream and associated PrimaryStream entries destroyed');
      return true;
    } else {
      logger.info('ProjectStream not found');
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting project streams: ${error}`);
    return false;
  }
}