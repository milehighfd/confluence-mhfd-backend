import { saveProjectStream } from 'bc/utils/create';

export const updateStreams = async (project_id, streams, transaction) => {
  try {
    const promises = JSON.parse(streams).map(async (stream) => {
      const streamId = stream.stream && stream.stream.stream_id
        ? stream.stream.stream_id
        : stream.stream[0].stream_id;
      return saveProjectStream({
        project_id: project_id,
        stream_id: streamId,
        length_in_mile: new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }).format(stream.length),
        drainage_area_in_sq_miles: new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(stream.drainage),
        code_local_government_id:
          stream.code_local_goverment.length > 0
            ? stream.code_local_goverment[0].code_local_government_id
            : 0,
      }, transaction);
    });
    const responses = await Promise.all(promises);
    return { message: 'Streams updated successfully', responses };
  } catch (error) {
    throw error;
  }
};