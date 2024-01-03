import { saveProjectStream } from 'bc/utils/create';

export const updateStreams = async (project_id, streams, creator = 'conf_db_user', transaction) => {
  try {
    const promises = JSON.parse(streams).map(async (stream) => {
      const streamId = stream.stream && stream.stream.stream_id
        ? stream.stream.stream_id
        : stream.stream[0].stream_id;
        console.log('Stream at update', stream);
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
      }, transaction);
    });
    const responses = await Promise.all(promises);
    return { message: 'Streams updated successfully', responses };
  } catch (error) {
    throw error;
  }
};