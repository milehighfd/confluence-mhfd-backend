import { saveProjectStream } from 'bc/utils/create';

export const saveProjectStreams = async (project_id, streams, transaction = null) => {
  try {
    const promises = [];
    for (const stream of JSON.parse(streams)) {
      const promise = saveProjectStream({
        project_id: project_id,
        stream_id: stream.stream ? stream.stream[0]?.stream_id : 0,
        length_in_mile: stream.length ? stream.length : 0,
        drainage_area_in_sq_miles: stream.tributary ? stream.tributary : 0,
        code_local_government_id:
          stream.code_local_goverment.length > 0
            ? stream.code_local_goverment[0].code_local_government_id
            : 0,
      }, transaction);
      promises.push(promise);
    }
    const responses = await Promise.all(promises);
    return { message: 'Streams saved successfully', responses };
  } catch (error) {
    throw error;
  }
};