import fs from 'fs';
import pdf from 'html-pdf';

var limit = 0;
const priceFormatter = (value) => {
  return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
};
export const newPrintProblem = async (data, components, map, problempart) => {
  var html = fs.readFileSync('./pdf-templates/Problems2.html', 'utf8');
  const {
    problemname,
    problemtype,
    jurisdiction,
    servicearea,
    county,
    solutionstatus,
    solutioncost, 
    streamname,
    problempriority,
    sourcename,
    source,
    problemdescription,
  } = data;
  
  return pdf.create(html, options);
}


export const printProblem = async (data, components, map, problempart) => {
  var html = fs.readFileSync('./pdf-templates/Problems.html', 'utf8');
  const {
    problemname,
    problemtype,
    jurisdiction,
    servicearea,
    county,
    solutionstatus,
    solutioncost, 
    streamname,
    problempriority,
    sourcename,
    source,
    problemdescription,
  } = data;
  let mainImage = problemtype ? `https://confdev.mhfd.org/detailed/${problemtype}.png` : 'https://i.imgur.com/kLyZbrB.jpg'
  const mapHeight = 500;

  html = html.split('${problemname}').join(problemname);

  html = html.split('${problemtype}').join(problemtype + ' Problem');
  html = html.split('${jurisdiction}').join(jurisdiction + ', CO');
  html = html.split('${county}').join(county);
  html = html.split('${servicearea}').join(servicearea);
  html = html.split('${solutionstatus}').join(solutionstatus ? solutionstatus : 0);
  html = html.split('${solutioncost}').join(solutioncost ? priceFormatter(solutioncost) : 'No Cost Data');
  html = html.split('${streamname}').join(streamname);
  html = html.split('${problempriority}').join(problempriority);
  html = html.split('${sourcename}').join(sourcename);
  html = html.split('${source}').join(source);
  html = html.split('${problemdescription}').join(problemdescription);
  html = html.split('${map}').join(map);
  html = html.split('${mainImage}').join(mainImage);
  html = html.split('${mapHeight}').join(mapHeight);

  let solutionstatusVal = solutionstatus ? solutionstatus : 0;
  solutionstatusVal = Math.floor((solutionstatusVal / 100) * 150)
  html = html.split('${solutionstatusVal}').join(solutionstatusVal);
  let _components = components.length > 0 ? components : [{
    type: '',
    estimated_cost: 0,
    original_cost: 0,
    percen: 0
  }]
  let sum = _components.reduce((prev, curr) => curr.estimated_cost + prev, 0);;
  let componentRows = _components.map((c) => {
    return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.estimated_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${c.original_cost ? (Math.round(c.original_cost * 10) / 10) : 0}%</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `
  }).join('')
  let problempartRows = problempart.map((c) => {
    return `
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <td width="40%" style="padding: 17px 20px;">${c.problem_type}</td>
        <td width="25%" style="padding: 17px 20px;">${(c.problem_part_category)}</td>
        <td width="25%" style="padding: 17px 20px;">${c.problem_part_subcategory}%</td>
      </tr>
    `
  }).join('');
  html = html.split('${problempartRows}').join(problempartRows);
  if (sum >= 0) {
    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(`<tfoot>
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <th width="40%" style="padding: 17px 20px; text-align:left;"><b>Total Estimated Cost</b></th>
        <th width="60%" colspan="3" style="padding: 17px 20px; text-align:left;"><b>${priceFormatter(sum)}</b></th>
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
    border: '0px'
  };

  return pdf.create(html, options);
}

// const validateDetailsInfo = (k, _data, value =>{
//   if (k.includes(value) && _data[k].length > 0) {
//       return true;
//   }
//   return false;
// })

export const newPrintProject = async (_data, components, mapImage) => {
  let data = {};

  var html = fs.readFileSync('./pdf-templates/Projects2.html', 'utf8');
  Object.keys(_data).forEach((k) => {
    if (k === 'description') {
      data[k] = _data[k] ? _data[k] : 'No Data';
    }

    if (k.includes('problems') && _data[k].length > 0) {
      data[k] = _data[k];
    }

    if (k.includes('project_statuses') && !!_data[k] && _data[k].length > 0) {
      data['project_type_name'] =
        _data?.project_statuses[0].code_phase_type.code_project_type.project_type_name;
      const currentStatus = _data.project_statuses.filter(
        (element) =>
          element.project_status_id === _data.current_project_status_id
      );
      if (currentStatus && currentStatus.length > 0) {
        data['phase'] = currentStatus[0].code_phase_type.phase_name;
        data['status'] =
          currentStatus[0].code_phase_type.code_status_type.status_name;
      }
    }

    if (k.includes('project_partners') && !!_data[k] && _data[k].length > 0) {
      for (let i = 0; i < _data?.project_partners.length; i++) {
        if (_data?.project_partners[i]?.code_partner_type_id === 11) {
          data['sponsor']
            ? (data[
                'sponsor'
              ] += `${_data?.project_partners[i].business_associate.business_name} `)
            : (data['sponsor'] =
                _data?.project_partners[i].business_associate.business_name);
        }
        if (_data?.project_partners[i]?.code_partner_type_id === 8) {
          data['vendors']
            ? (data[
                'vendors'
              ] += `${_data?.project_partners[i].business_associate.business_name} `)
            : (data['vendors'] =
                _data?.project_partners[i].business_associate.business_name);

          data['typeVendor']
            ? (data['typeVendor'] += `Civil Contractor ,`)
            : (data['typeVendor'] = 'Civil Contractor');
        }
        if (_data?.project_partners[i]?.code_partner_type_id === 1) {
          data['vendors']
            ? (data[
                'vendors'
              ] += `${_data?.project_partners[i].business_associate.business_name} ,`)
            : (data['vendors'] =
                _data?.project_partners[i].business_associate.business_name);

          data['typeVendor']
            ? (data['typeVendor'] += `Developer ,`)
            : (data['typeVendor'] = 'Developer');
        }
        if (_data?.project_partners[i]?.code_partner_type_id === 9) {
          data['vendors']
            ? (data[
                'vendors'
              ] += `${_data?.project_partners[i].business_associate.business_name} ,`)
            : (data['vendors'] =
                _data?.project_partners[i].business_associate.business_name);

          data['typeVendor']
            ? (data['typeVendor'] += `Landscape Contractor ,`)
            : (data['typeVendor'] = 'Landscape Contractor');
        }
      }
    }

    if (k.includes('project_counties') && !!_data[k] && _data[k].length > 0) {
      data[
        'county'
      ] = `${_data?.project_counties[0].CODE_STATE_COUNTY.county_name} `;
    }

    if (
      k.includes('project_service_areas') &&
      !!_data[k] &&
      _data[k].length > 0
    ) {
      data[
        'servicearea'
      ] = `${_data?.project_service_areas[0].CODE_SERVICE_AREA.service_area_name} `;
    }

    if (k.includes('project_costs') && !!_data[k] && _data[k].length > 0) {
      const estimatedCost = _data.project_costs.filter(
        (element) => element.code_cost_type_id === 1
      );
      if (estimatedCost.length > 0) {
        data['cost'] = _data?.project_costs[0].cost;
      }
    }

    if (k.includes('project_streams') && !!_data[k] && _data[k].length > 0) {
      data['stream_name'] = _data?.project_streams[0].stream.stream_name;
    }
    data[k] = _data[k] ? _data[k] : 'N/A';
  });

  const {
    project_name,
    county,
    project_type_name,
    sponsor,
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
    project_type_name === 'Capital (CIP)'
      ? `${URL_BASE}detailed/capital.png`
      : project_type_name === 'Planning Study (Study)'
      ? `${URL_BASE}projectImages/study.jpg`
      : project_type_name === 'Vegetation Management'
      ? `${URL_BASE}detailed/vegetation-management.png`
      : project_type_name === 'Sediment Removal'
      ? `${URL_BASE}detailed/sediment-removal.png`
      : project_type_name === 'Maintenance Restoration'
      ? `${URL_BASE}detailed/restoration.png`
      : project_type_name === 'General Maintenance'
      ? `${URL_BASE}detailed/minor-repairs.png`
      : `${URL_BASE}detailed/debris-management.png`;

  html = html.split('${projectname}').join(project_name);
  html = html.split('${projecttype}').join(project_type_name + ' Project');
  html = html.split('${sponsor}').join(sponsor);
  html = html.split('${county}').join(county);
  html = html.split('${servicearea}').join(servicearea);
  html = html
    .split('${cost}')
    .join(cost ? priceFormatter(cost) : 'No Cost Data');
  html = html.split('${status}').join(status);
  html = html.split('${phase}').join(phase);
  html = html.split('${streamname}').join(stream_name);
  // html = html.split('${projectsubtype}').join(projectsubtype);
  html = html.split('${attachmentUrl}').join(urlImage);
  // html = html.split('${startyear}').join(startyear);
  // html = html.split('${completedyear}').join(completedyear);
  // html = html.split('${frequency}').join(frequency);
  html = html.split('${mhfdManager}').join('N/A');
  html = html.split('${lgManager}').join('N/A');
  html = html.split('${description}').join(description);
  html = html.split('${contractor}').join(contractor ? contractor : 'N/A');
  html = html.split('${consultant}').join(consultant ? consultant : 'N/A');
  // html = html.split('${mapHeight}').join(mapHeight);

  let _problems =
    !!problems && problems.length > 0
      ? problems
      : [{ problemname: '', problempriority: '' }];

  let problemRows = _problems
    .map((p) => {
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="50%" style="padding: 17px 20px;">${p.problemname}</td>
          <td width="50%" style="padding: 17px 20px;">${p.problempriority}</td>
        </tr>
      `;
    })
    .join('');
  html = html.split('${problemRows}').join(problemRows);
  // VENDORS
  let _vendors =
    !!vendors && vendors.length > 0
      ? vendors.split(',')
      : [{ type: '', name: '' }];
  let _typeVendor =
    typeVendor.length > 0 ? typeVendor.split(',') : [{ type: '', name: '' }];
  let vendorRows = _vendors
    .map((element, index) => {
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="50%" style="padding: 17px 20px;">${element}</td>
          <td width="50%" style="padding: 17px 20px;">${_typeVendor[index]}</td>
        </tr>
      `;
    })
    .join('');
  html = html.split('${vendorRows}').join(vendorRows);
  //END VENDORS
  let _components =
    !!components && components.length > 0
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
  let componentRows = _components
    .map((c, i) => {
      let str = `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(
            c.estimated_cost
          )}</td>
          <td width="20%" style="padding: 17px 20px;">${
            c.original_cost ? Math.round(c.original_cost * 10) / 10 : 0
          }%</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `;
      if (components.length === 9 && i === 6) {
        str +=
          '<tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/>';
      }
      return str;
    })
    .join('');
  if (sum) {
    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(`<tfoot>
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <th width="40%" style="padding: 17px 20px; text-align:left;"><b>Total Estimated Cost</b></th>
        <th width="60%" colspan="3" style="padding: 17px 20px; text-align:left;"><b>${priceFormatter(
          sum
        )}</b></th>
      </tr>
    </tfoot>`);
  } else {
    html = html.split('${componentRows}').join(`
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <td width="40%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
      </tr>
    `);
    html = html.split('${totalEstimatedCost}').join('');
  }
  html = html.split('${map}').join(mapImage);
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
    border: '0px',
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
    sponsor,
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
  html = html.split('${sponsor}').join(sponsor);
  html = html.split('${county}').join(county);
  html = html.split('${servicearea}').join(servicearea);
  html = html.split('${cost}').join(cost ? priceFormatter(cost) : 'No Cost Data');
  html = html.split('${status}').join(status);
  html = html.split('${streamname}').join(streamname);
  html = html.split('${projectsubtype}').join(projectsubtype);
  html = html.split('${attachmentUrl}').join(attachments.length > 0 ? attachments[0] : urlImage);
  html = html.split('${startyear}').join(startyear);
  html = html.split('${completedyear}').join(completedyear);
  html = html.split('${frequency}').join(frequency);
  html = html.split('${mhfdmanager}').join(mhfdmanager);
  html = html.split('${description}').join(description);
  html = html.split('${contractor}').join(contractor);
  html = html.split('${consultant}').join(consultant);
  html = html.split('${mapHeight}').join(mapHeight);

  let _problems = problems.length > 0 ? problems : [{ problemname: '', problempriority: '' }]

  let problemRows = _problems.map((p) => {
    return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="50%" style="padding: 17px 20px;">${p.problemname}</td>
          <td width="50%" style="padding: 17px 20px;">${p.problempriority}</td>
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
        <th width="40%" style="padding: 17px 20px; text-align:left;"><b>Total Estimated Cost</b></th>
        <th width="60%" colspan="3" style="padding: 17px 20px; text-align:left;"><b>${priceFormatter(sum)}</b></th>
      </tr>
    </tfoot>`);
  } else {
    html = html.split('${componentRows}').join(`
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <td width="40%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
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
    border: '0px'
  };

  return pdf.create(html, options);
}
