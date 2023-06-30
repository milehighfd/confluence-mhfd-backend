import { saveProjectStream } from 'bc/utils/create';

export const saveProjectStreams = async (project_id, streams, transaction = null) => {
  for (const stream of JSON.parse(streams)) {
    await saveProjectStream({
      project_id: project_id,
      stream_id: stream.stream ? stream.stream[0].stream_id : 0,
      length_in_mile: new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(stream.length * 0.000621371),
      drainage_area_in_sq_miles: new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(stream.drainage),
      code_local_government_id:
        stream.code_local_goverment.length > 0
          ? stream.code_local_goverment[0].code_local_government_id
          : 0,
    }, transaction);
  }
};