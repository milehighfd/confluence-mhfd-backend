import fs from 'fs';
import pdf from 'html-pdf';

var limit = 0;
const priceFormatter = (value) => {
  return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
};

export const printProblem = async (data, components, map, problempart,teamsProblems) => {
  var html = fs.readFileSync('./pdf-templates/Problems2.html', 'utf8');
  const {
    problemname,
    problemtype,
    jurisdiction,
    servicearea,
    county,
    solutionstatus,
    streamname,
    problempriority,
    sourcename,
    source,
    problemdescription,
    component_cost,
  } = data;
  let mainImage = problemtype ? `https://confdev.mhfd.org/detailed/${problemtype}.png` : 'https://i.imgur.com/kLyZbrB.jpg'
  const mapHeight = 500;
  html = html.split('${problemname}').join(problemname == null? ' N/A' : problemname);
  html = html.split('${problemtype}').join(problemtype + ' Problem' == null? ' N/A' : problemtype + ' Problem');
  html = html.split('${jurisdiction}').join(jurisdiction + ', CO'  == null? ' N/A' : jurisdiction + ', CO');
  html = html.split('${county}').join(county == null? ' N/A' : county + ' County');
  html = html.split('${servicearea}').join(servicearea == null? ' N/A' : servicearea + ' Service Area');
  html = html.split('${solutionstatus}').join(solutionstatus ? solutionstatus : 0);
  html = html.split('${solutioncost}').join(component_cost ? priceFormatter(component_cost) : 'No Cost Data');
  html = html.split('${streamname}').join(streamname == null? ' N/A' : streamname);
  html = html.split('${problempriority}').join(problempriority == null? ' N/A' : problempriority);
  html = html.split('${sourcename}').join(sourcename == null? ' N/A' : sourcename);
  html = html.split('${source}').join(source == null? ' N/A' : source);
  html = html.split('${problemdescription}').join(problemdescription == null? ' N/A' : problemdescription);
  html = html.split('${map}').join(map);
  html = html.split('${mainImage}').join(mainImage);
  html = html.split('${mapHeight}').join(mapHeight);

  const flattenedStaff = teamsProblems.flatMap((item) => item.project_staffs);
  let teamRow = flattenedStaff.map((el) => {
    const MHFD_LEAD = 1; 
    const MHFD_SUPPORT = 4;
    const ADMIN_STAFF = 5;
    const LG_LEAD = 10;
    const STAFF_ROL_MAP = {
      [MHFD_LEAD]: 'MHFD Lead',
      [MHFD_SUPPORT]: 'MHFD Support',
      [ADMIN_STAFF]: 'Admin Staff',
      [LG_LEAD]: 'LG Lead',
    };
    if(STAFF_ROL_MAP[el.code_project_staff_role_type_id] && el.is_active){
      return `
        <tr>
          <td style="width: 242.5px; padding: 7px 0px;">
            <h6 style="font-size: 14px; color: #11093c; margin: 0; font-weight: 600;">${el.business_associate_contact.contact_name.substring(0,30) === el.business_associate_contact.contact_name.substring(0,31) ? el.business_associate_contact.contact_name.substring(0,30): (el.business_associate_contact.contact_name.substring(0,30) + '...')}</h6>
            <p style="font-size: 12px; color: #11093c; margin-bottom: 0px; margin-top: -3px; padding-top: 5px;">${STAFF_ROL_MAP[el.code_project_staff_role_type_id]}</p>
            <span style="font-size: 12px; color: #11093c; margin-bottom: 15px;margin-top: -3px; line-height: 10px;">${el.business_associate_contact.business_address.business_associate.business_name}</span>
          </td>
        </tr>
    `
    }
    })
  .join('');
  html = html.split('${teamRow}').join(teamRow);

  let solutionstatusVal = solutionstatus ? solutionstatus : 0;
  solutionstatusVal = Math.floor((solutionstatusVal / 100) * 150)
  html = html.split('${solutionstatusVal}').join(solutionstatusVal);
  let _components = components.length > 0 ? components : [{
    type: '',
    estimated_cost: 0,
    original_cost: 0,
    percen: 0
  }]
  let sum = _components.reduce((prev, curr) => curr.estimated_cost + prev, 0);
  let totalComponents = _components.reduce((prev, next) => prev + next.component_count_total, 0);
  let componentRows = _components.map((c) => {
    return `
        <tr>
          <td width="30%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${c.type == null? 'N/A' : c.type}</td>
          <td width="20%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${priceFormatter(c.estimated_cost)}</td>
          <td width="20%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${c.original_cost ? (Math.round(c.original_cost * 10) / 10) : 0}%</td>
          <td width="30%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${c.percen == null? 'N/A' : `${Math.round(c.percen)}%` }</td>
        </tr>
      `
  }).join('')
  let problempartRows = problempart.map((c) => {
    return `
      <tr>
        <td width="30%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${c.problem_type == null? 'N/A' : c.problem_type}</td>
        <td width="35%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${(c.problem_part_category == null? 'N/A' : c.problem_part_category)}</td>
        <td width="35%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${c.problem_part_subcategory == null? 'N/A' : c.problem_part_subcategory}</td>
      </tr>
    `
  }).join('');
  html = html.split('${problempartRows}').join(problempartRows);
  if (sum >= 0) {
    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(`<tfoot>
      <tr>
        <th width="40%" style="color: #11093C; padding: 17px 20px; text-align:left; font-weight: 600;  padding-top:0px"><b>Total Proposed Cost (${totalComponents})</b></th>
        <th width="60%" colspan="3" style="color: #11093C; padding: 17px 20px; text-align:left; font-weight: 600;  padding-top:0px"><b>${priceFormatter(sum)}</b></th>
      </tr>
    </tfoot>`);
  } else {
    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join('');
  }
  let q = 0;
  let spaceBetween = '';
  switch (components.length) {
    case 0:
    case 1:
    case 2:
      q = 0;
      break
    case 3:
      q = 35;
      break;
    case 4:
      q = 30;
      break;
    case 5:
      q = 28;
      break;
    case 6:
      q = 25;
      break;
    case 7:
      q = 23;
      break;
    case 8:
      q = 20;
      break;
    case 9:
      q = 15;
      break;
    case 10:
      q = 10;
      break;
  }
  for (var i = 0; i < q; i++) {
    spaceBetween += '<br/>'
  }
  html = html.split('${spaceBetween}').join(components.length > limit ? `<br><div style="page-break-after:always;"></div>` : '');

  // let width = 1200;
  let width = 900;
  let height = 1150;

  var options = {
    width: `${width}px`,
    height: `${height}px`,
    border:  {
      top: '2cm',
      right: '1cm',
      bottom: '2cm',
      left: '1cm'
    }

  };

  return pdf.create(html, options);
}

export const newPrintProject = async (_data, components, mapImage, roadMap) => {
  let data = {};

  var html = fs.readFileSync('./pdf-templates/Projects2.html', 'utf8');
  Object.keys(_data).forEach((k) => {
    if (k === 'description') {
      data[k] = _data[k] ? _data[k] : 'No Data';
    }

    if (
      k.includes('problems') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data[k] = _data[k];
    }

    if (
      k.includes('project_statuses') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data['project_type_name'] =
        _data?.project_statuses[0].code_phase_type.code_project_type.project_type_name;
      const currentStatus = _data?.project_statuses.filter(
        (element) =>
        element.project_status_id === _data.current_project_status_id
      );
      if (currentStatus && currentStatus?.length > 0) {
        data['phase'] = currentStatus[0].code_phase_type.phase_name;
        data['status'] =
          currentStatus[0].code_phase_type.code_status_type.status_name;
      }
    }

    if (
      k.includes('project_local_governments') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      for (let i = 0; i < _data?.project_local_governments.length; i++) {
        if (_data?.project_local_governments[i]?.CODE_LOCAL_GOVERNMENT) {
          data['local_government']
            ? (data[
                'local_government'
              ] += `${_data?.project_local_governments[i]?.CODE_LOCAL_GOVERNMENT.local_government_name}, `)
            : (data['local_government'] =
                _data?.project_local_governments[i]?.CODE_LOCAL_GOVERNMENT.local_government_name);
        }
      }
    }

    if (
      k.includes('project_counties') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data[
        'county'
      ] = `${_data?.project_counties[0].CODE_STATE_COUNTY.county_name} `;
    }

    if (
      k.includes('project_service_areas') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data[
        'servicearea'
      ] = `${_data?.project_service_areas[0].CODE_SERVICE_AREA.service_area_name} `;
    }

    if (
      k.includes('project_costs') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      const estimatedCost = _data.project_costs.filter(
        (element) => element.code_cost_type_id === 1
      );
      if (estimatedCost?.length > 0) {
        data['cost'] = _data?.project_costs[0].cost;
      }
    }

    if (
      k.includes('project_streams') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data['stream_name'] = _data?.project_streams[0].stream.stream_name;
    }
    if (
      k.includes('project_staffs') &&
      (_data[k] !== void 0 || _data[k] !== []) &&
      _data[k]?.length > 0
    ) {
      data['project_staffs'] = _data?.project_staffs;
    }
    data[k] = _data[k] ? _data[k] : [];
  });

  const {
    project_name,
    county,
    project_type_name,
    local_government,
    servicearea,
    phase,
    cost,
    stream_name,
    // projectsubtype,
    // attachments,
    status,
    // startyear,
    // completedyear,
    // frequency,
    // mhfdmanager,
    description,
    contractor,
    consultant,
    problems,
    vendors,
    typeVendor,
  } = data;
  const mapHeight = 500;
  const mapWidth = 750;
  const URL_BASE = 'https://confdev.mhfd.org/';
  const urlImage =
    project_type_name === 'CIP'
      ? `${URL_BASE}detailed/capital.png`
      : project_type_name === 'Study'
      ? `${URL_BASE}projectImages/study.jpg`
      : project_type_name === 'Vegetation Management'
      ? `${URL_BASE}detailed/vegetation-management.png`
      : project_type_name === 'Sediment Removal'
      ? `${URL_BASE}detailed/sediment-removal.png`
      : project_type_name === 'Maintenance Restoration'
      ? `${URL_BASE}detailed/restoration.png`
      : project_type_name === 'General Maintenance'
      ? `${URL_BASE}detailed/minor-repairs.png`
      :project_type_name === 'Restoration'
      ? `${URL_BASE}detailed/restoration.png`
      :project_type_name === 'Routine Trash and Debris'
      ? `${URL_BASE}detailed/debris-management.png`
      : `${URL_BASE}detailed/watershed-change.png`;
  let mhfdManager = 'N/A'
  let lgManager = 'N/A'
  data.project_staffs.map((el) => {
    if(el.code_project_staff_role_type_id === 1){
      mhfdManager = el.business_associate_contact.contact_name
    }
    if(el.code_project_staff_role_type_id === 10){
      lgManager = el.business_associate_contact.contact_name
    }
  })
  let projectId = data.project_id ? data.project_id : 'N/A'

  html = html.split('${projectname}').join(_data.project_name);
  html = html.split('${projecttype}').join(_data.code_project_type.project_type_name + ' Project');
  html = html.split('${onBaseId}').join(_data.onbase_project_number);
  html = html.split('${local_government}').join(local_government);
  html = html.split('${county}').join(county);
  html = html.split('${servicearea}').join(servicearea);
  html = html
    .split('${cost}')
    .join(cost ? priceFormatter(cost) : 'No Cost Data');
  html = html.split('${status}').join(status);
  html = html.split('${phase}').join(phase);
  html = html.split('${streamname}').join(stream_name ? stream_name:'N/A' );
  html = html.split('${attachmentUrl}').join(urlImage);
  html = html.split('${projectId}').join(projectId);
  html = html.split('${mhfdManager}').join(mhfdManager);
  html = html.split('${lgManager}').join(lgManager);
  html = html.split('${description}').join(_data.description ? _data.description : 'N/A');
  html = html.split('${contractor}').join(contractor ? contractor : 'N/A');
  html = html.split('${consultant}').join(consultant ? consultant : 'N/A');
  let _problems =
    (problems !== void 0 || problems !== []) && problems?.length > 0
      ? problems
      : [{ problemname: '', problempriority: '' }];
  if(_problems.length > 0 && (_problems[0].problemname != '' || _problems[0].problempriority != '') ){
    let problemRows = `<thead>
      <tr>
        <th width="50%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Name</th>
        <th width="50%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Priority</th>
      </tr>
    </thead>`;
    problemRows = problemRows + _problems
      .map((p) => {
        return `
          <tr>
            <td width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${
              p.problemname == null ? 'N/A' : p.problemname
            }</td>
            <td width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${
              p.problempriority == null ? 'N/A' : p.problempriority
            }</td>
          </tr>
        `;
      })
      .join('');
    html = html.split('${problemRows}').join(problemRows);
  }
  else{
    let problemRows = `
    <tr>
      <td style="text-align: center;">No data available</td>
    </tr> `;
    html = html.split('${problemRows}').join(problemRows);
  }

  // TEAMS
  let teamRow = data.project_staffs.map((el) => {
    const MHFD_LEAD = 1; 
    const MHFD_SUPPORT = 4;
    const ADMIN_STAFF = 5;
    const LG_LEAD = 10;
    const STAFF_ROL_MAP = {
      [MHFD_LEAD]: 'MHFD Lead',
      [MHFD_SUPPORT]: 'MHFD Support',
      [ADMIN_STAFF]: 'Admin Staff',
      [LG_LEAD]: 'LG Lead',
    };
    if(STAFF_ROL_MAP[el.code_project_staff_role_type_id] && el.is_active){
      return `
        <tr>
          <td style="width: 242.5px; padding: 7px 0px;">
            <h6 style="font-size: 14px; color: #11093c; margin: 0; font-weight: 600;">${el.business_associate_contact.contact_name.substring(0,30) === el.business_associate_contact.contact_name.substring(0,31) ? el.business_associate_contact.contact_name.substring(0,30): (el.business_associate_contact.contact_name.substring(0,30) + '...')}</h6>
            <p style="font-size: 12px; color: #11093c; margin-bottom: 0px; margin-top: -3px; padding-top: 5px;">${STAFF_ROL_MAP[el.code_project_staff_role_type_id]}</p>
            <span style="font-size: 12px; color: #11093c; margin-bottom: 15px;margin-top: -3px; line-height: 10px;">${el.business_associate_contact.business_address.business_associate.business_name}</span>
          </td>
        </tr>
    `
    }
    })
  .join('');
  html = html.split('${teamRow}').join(teamRow);

  // VENDORS
  const validIds = "VENDORS";
  const projectPartners = data.project_partners.filter((pp) => validIds.includes(pp?.code_project_partner_type?.partner_type))
    .map((pp) => {
      return {
        type: pp?.code_project_partner_type?.partner_type_name || '',
        name: pp?.business_associate?.business_name || '',
        key: pp?.project_partner_id || -1
      }
    })
  if(projectPartners.length > 0){
    let vendorRows = `
    <tr>
      <th width="50%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Name</th>
      <th width="50%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Priority</th>
    </tr>`;
    vendorRows = vendorRows +  projectPartners
      .map((element, index) => {
        return `
          <tr>
            <td width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${
              element.type
            }</td>
            <td width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${
              element.name
            }</td>
          </tr>
        `;
      })
      .join('');
    html = html.split('${vendorRows}').join(vendorRows);
  }else{
    let vendorRows = `
      <tr>
        <td style="text-align: center;">No data available</td>
      </tr>`;
    html = html.split('${vendorRows}').join(vendorRows);
  }
  //END VENDORS
  let _components =
    (components !== void 0 || components !== []) && components?.length > 0
      ? components
      : [
          {
            type: '',
            estimated_cost: 0,
            original_cost: 0,
            percen: 0,
          },
        ];
  let sum = _components.reduce((prev, curr) => curr.estimated_cost + prev, 0);
  if(_components.length > 0 && (_components[0].type !== '')){
    let componentRows =`
    <tr>
      <th width="40%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Component Type</th>
      <th width="20%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">Cost</th>
      <th width="20%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">% Complete</th>
      <th width="20%" style="color: #251863; text-align: left; padding: 12px 20px; font-weight: 500; border-bottom: 1px solid #eae8f0;">% of Total Cost</th>
    </tr>
    `;
    componentRows = componentRows + _components
      .map((c, i) => {
        let str = `
          <tr>
            <td width="30%" style="color: #11093c; text-align: left; padding-left: 20px; padding-top: 4px; padding-right: 20px; padding-bottom: 0px; font-weight: 400;">${
              c.type == null ? 'N/A' : c.type
            }</td>
            <td width="15%" style="color: #11093c; text-align: left; padding-left: 20px; padding-top: 4px; padding-right: 20px; padding-bottom: 0px; font-weight: 400;">${priceFormatter(
              c.estimated_cost
            )}</td>
            <td width="15%" style="color: #11093c; text-align: left; padding-left: 20px; padding-top: 4px; padding-right: 20px; padding-bottom: 0px; font-weight: 400;">${
              c.original_cost ? Math.round(c.original_cost * 10) / 10 : 0
            }%</td>
            <td width="40%" style="color: #11093c; text-align: left; padding-left: 20px; padding-top: 4px; padding-right: 20px; padding-bottom: 0px; font-weight: 400;">${
              c.percen == null ? 'N/A' : Math.round(c.percen)
            }%</td>
          </tr>
        `;
        return str;
      })
      .join('');
      
      let totalComponents = _components.reduce((prev, next) => prev + next.component_count_total, 0);
      if (sum) {
        html = html.split('${componentRows}').join(componentRows);
        html = html.split('${totalEstimatedCost}').join(`
          <tr>
            <th width="15%" style="margin-top:-10px; color: #11093c; text-align: left; padding-left: 20px; padding-top: 0px; padding-right: 20px; padding-bottom: 4px; font-weight: 600;"><b>Total Estimated Cost(${totalComponents})</b></th>
            <th width="60%" colspan="3" style="margin-top:-10px; color: #11093c; padding-left: 20px; padding-top: 0px; padding-right: 20px; padding-bottom: 4px; text-align:left;"><b>${priceFormatter(
              sum
            )}</b></th>
          </tr>`);
      } else {
        html = html.split('${componentRows}').join(`
          <tr">
            <td width="40%" style="margin-top:-10px; padding: 17px 20px;  padding-top:0px"></td>
            <td width="20%" style="margin-top:-10px; padding: 17px 20px;  padding-top:0px"></td>
            <td width="20%" style="margin-top:-10px; padding: 17px 20px;  padding-top:0px"></td>
            <td width="20%" style="margin-top:-10px; padding: 17px 20px;  padding-top:0px"></td>
          </tr>
        `);
        html = html.split('${totalEstimatedCost}').join(``);
      }
    }else{
    html = html.split('${componentRows}').join(`
      <tr>
        <td style="text-align: center;">No data available</td>
      </tr>`);
    html = html.split('${totalEstimatedCost}').join(``);
  }
  html = html.split('${map}').join(mapImage);
  html = html.split('${roadMap}').join(roadMap);

  // let q = 0;
  // let spaceBetween = '';
  // switch (components.length) {
  //   case 0:
  //     q = 0;
  //     break;
  //   case 1:
  //     q = 25;
  //     break;
  //   case 2:
  //     q = 20;
  //     break;
  //   case 3:
  //     q = 17;
  //     break;
  //   case 4:
  //     q = 13;
  //     break;
  //   case 5:
  //     q = 8;
  //     break;
  //   case 6:
  //     q = 5;
  //     break;
  //   case 7:
  //     q = 3;
  //     break;
  // }
  // for (var i = 0; i < q; i++) {
  //   spaceBetween += '<br/>'
  // }
  // html = html.split('${spaceBetween}').join(components.length > limit ? `<br><div style="page-break-after:always;"></div>` : '');
  // let width = 900;
  // let height = 1150;
  // if (!(problems.length + components.length)) {
  //   height += 180
  // }
  const width = 900;
  const height = 1150;
  var options = {
    width: `${width}px`,
    height: `${height}px`,
    border: {
      top: '2cm',
      right: '1cm',
      bottom: '2cm',
      left: '1cm',
    },
  };

  return pdf.create(html, options);
};

export const printProject = async (_data, components, map) => {
  let data = {};
  Object.keys(_data).forEach(k => {
    if (k.includes('cost')) {
      data[k] = _data[k];
    } else if (k === 'description') {
      data[k] = _data[k] ? _data[k] : 'No Data';
    } else {
      data[k] = _data[k] ? _data[k] : 'N/A';
    }
  })
  var html = fs.readFileSync('./pdf-templates/Projects.html', 'utf8');
  const {
    projectname,
    county,
    projecttype,
    local_government,
    servicearea,
    finalcost,
    estimatedcost,
    streamname,
    projectsubtype,
    attachments,
    status,
    startyear,
    completedyear,
    frequency,
    mhfdmanager,
    description,
    contractor,
    consultant,
    problems,
  } = data;

  let cost = 0;
  if (finalcost) {
    cost = finalcost;
  } else if (estimatedcost) {
    cost = estimatedcost;
  }
  const mapHeight = 500;
  const URL_BASE = 'https://confdev.mhfd.org/';
  const urlImage = projecttype === 'Capital' ? `${URL_BASE}detailed/capital.png` :
    projecttype === 'Study' ? `${URL_BASE}projectImages/study.jpg` :
      projecttype === 'Maintenance' ?
        (projectsubtype === 'Vegetation Management' ? `${URL_BASE}detailed/vegetation-management.png` :
          projectsubtype === 'Sediment Removal' ? `${URL_BASE}detailed/sediment-removal.png` :
            projectsubtype === 'Restoration' ? `${URL_BASE}detailed/restoration.png` :
              projectsubtype === 'Minor Repairs' ? `${URL_BASE}detailed/minor-repairs.png` :
                `${URL_BASE}detailed/debris-management.png`) : 'https://i.imgur.com/kLyZbrB.jpg'

  html = html.split('${projectname}').join(projectname);
  html = html.split('${projecttype}').join(projecttype + ' Project');
  html = html.split('${local_government}').join(local_government);
  html = html.split('${county}').join(county);
  html = html.split('${servicearea}').join(servicearea);
  html = html.split('${cost}').join(cost ? priceFormatter(cost) : 'No Cost Data');
  html = html.split('${status}').join(status);
  html = html.split('${streamname}').join(streamname.length > 0 ? streamname :'N/A');
  html = html.split('${projectsubtype}').join(projectsubtype);
  html = html.split('${attachmentUrl}').join(attachments.length > 0 ? attachments[0] : urlImage);
  html = html.split('${startyear}').join(startyear);
  html = html.split('${completedyear}').join(completedyear);
  html = html.split('${frequency}').join(frequency);
  html = html.split('${mhfdmanager}').join(mhfdmanager);
  html = html.split('${description}').join(description.length > 0 ? description: 'N/A');
  html = html.split('${contractor}').join(contractor);
  html = html.split('${consultant}').join(consultant);
  html = html.split('${mapHeight}').join(mapHeight);

  let _problems = problems.length > 0 ? problems : [{ problemname: '', problempriority: '' }]

  let problemRows = _problems.map((p) => {
    return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${p.problemname}</td>
          width="50%" style="color: #11093c; text-align: left; padding: 4px 20px; font-weight: 400;">${p.problempriority}</td>
        </tr>
      `
  }).join('')
  html = html.split('${problemRows}').join(problemRows);
  let _components = components.length > 0 ? components : [{
    type: '',
    estimated_cost: 0,
    original_cost: 0,
    percen: 0
  }]
  let sum = _components.reduce((prev, curr) => curr.estimated_cost + prev, 0);
  let componentRows = _components.map((c, i) => {
    let str = `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.estimated_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${c.original_cost ? (Math.round(c.original_cost * 10) / 10) : 0}%</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `
    if (components.length === 9 && i === 6) {
      str += '<tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/>'
    }
    return str;
  }).join('')
  if (sum) {
    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(`<tfoot>
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <th width="40%" style="padding: 17px 20px; text-align:left;  padding-top:0px"><b>Total Estimated Cost</b></th>
        <th width="60%" colspan="3" style="padding: 17px 20px; text-align:left;  padding-top:0px"><b>${priceFormatter(sum)}</b></th>
      </tr>
    </tfoot>`);
  } else {
    html = html.split('${componentRows}').join(`
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <td width="40%" style="padding: 17px 20px; padding-top:0px"></td>
        <td width="20%" style="padding: 17px 20px; padding-top:0px"></td>
        <td width="20%" style="padding: 17px 20px; padding-top:0px"></td>
        <td width="20%" style="padding: 17px 20px; padding-top:0px"></td>
      </tr>
    `);
    html = html.split('${totalEstimatedCost}').join('');
  }
  html = html.split('${map}').join(map);
  let q = 0;
  let spaceBetween = '';
  switch (components.length) {
    case 0:
      q = 0;
      break;
    case 1:
      q = 25;
      break;
    case 2:
      q = 20;
      break;
    case 3:
      q = 17;
      break;
    case 4:
      q = 13;
      break;
    case 5:
      q = 8;
      break;
    case 6:
      q = 5;
      break;
    case 7:
      q = 3;
      break;
  }
  for (var i = 0; i < q; i++) {
    spaceBetween += '<br/>'
  }
  html = html.split('${spaceBetween}').join(components.length > limit ? `<br><div style="page-break-after:always;"></div>` : '');
  let width = 900;
  let height = 1150;
  if (!(problems.length + components.length)) {
    height += 180
  }

  var options = {
    width: `${width}px`,
    height: `${height}px`,
    border:  {
      top: '2cm',
      right: '1cm',
      bottom: '2cm',
      left: '1cm'
    }
  };

  return pdf.create(html, options);
}
