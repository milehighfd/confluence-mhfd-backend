import {
  updateStreams,
  deleteStreams,
  saveProjectStream,
} from 'bc/utils/create';
import db from 'bc/config/db.js';
import moment from 'moment';

const ProjectStream = db.project_stream;
const PrimaryStream = db.primaryStream;

export const processStreamUpdates = async (project_id, newStreams, creator, transaction) => {
  try {
    const currentProjectStreams = await ProjectStream.findAll({
      where: { project_id: project_id },
      transaction: transaction
    });

    const oldIds = currentProjectStreams.map(stream => stream.stream_id);

    const newStreamsObj = JSON.parse(newStreams);
    
    const newStreamIds = newStreamsObj.map(stream => {
      const streamId = stream.stream && stream.stream.stream_id
        ? stream.stream.stream_id
        : stream.stream[0].stream_id;
      return streamId;
    });
    console.log('newStreamsObj', newStreamsObj.map(stream => {
      return stream.stream;
    }))
    console.log('newStreamIds', newStreamIds)
    console.log('oldIds', oldIds)
    for (let currentStream of currentProjectStreams) {
      if (!newStreamIds.includes(currentStream.stream_id)) {
        await PrimaryStream.destroy({
          where: { project_stream_id: currentStream.project_stream_id },
          transaction: transaction
        });
      }
    }
    if (!newStreamIds.every(id => oldIds.includes(id)) || !oldIds.every(id => newStreamIds.includes(id))) {
      const deletedIds = oldIds.filter(id => !newStreamIds.includes(id));
      console.log('deletedIds', deletedIds)
      const newIds = newStreamIds.filter(id => !oldIds.includes(id));
      console.log('newIds', newIds)

      if (deletedIds.length > 0) {
        await ProjectStream.destroy({
          where: {
            project_id: project_id,
            stream_id: deletedIds
          },
          transaction: transaction
        });
      }
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      if (newIds.length > 0) {
        const newData = newStreamsObj.filter(stream => newIds.includes(
          stream.stream && stream.stream.stream_id
            ? stream.stream.stream_id
            : stream.stream[0].stream_id
        ));
        const promises = newData.map((stream) => {
          const streamId = stream.stream && stream.stream.stream_id
            ? stream.stream.stream_id
            : stream.stream[0].stream_id;
          return saveProjectStream({
            project_id: project_id,
            stream_id: streamId,
            length_in_feet: stream.length ? stream.length : 0,
            drainage_area_in_acres: stream.tributary ? stream.tributary : 0,
            code_local_government_id:
              stream.code_local_goverment.length > 0
                ? stream.code_local_goverment[0].code_local_government_id
                : 0,
            created_by: creator,
            last_modified_by: creator,
            created_date: date,
            modified_date: date
          }, transaction);
        });
        await Promise.all(promises);
      }
      return { message: 'Streams processed', deletedIds, newIds };
    } else {
      return { message: 'No changes in streams' };
    }
  } catch (error) {
    throw error;
  }
};
