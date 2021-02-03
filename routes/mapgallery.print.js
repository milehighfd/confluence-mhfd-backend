var fs = require('fs');
var pdf = require('html-pdf');

let width = 1200;
let height = 1828;

var options = {
  width: `${width}px`,
  height: `${height}px`,
  border: '0px',
  viewportSize: {
      width: width,
      height: height
  }
};

const priceFormatter = (value) => {
  return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

module.exports = {
  printProblem: (data, components, map) => {
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

    let mainImage = problemtype ? `http://confluence.mhfd.org/gallery/${problemtype}.jpg` : 'https://i.imgur.com/kLyZbrB.jpg'

    html = html.split('${problemname}').join(problemname);

    html = html.split('${problemtype}').join(problemtype + ' Problem');
    html = html.split('${jurisdiction}').join(jurisdiction + ', CO' );
    html = html.split('${county}').join(county);
    html = html.split('${servicearea}').join(servicearea);
    html = html.split('${solutionstatus}').join(solutionstatus);
    html = html.split('${solutioncost}').join(priceFormatter(solutioncost));
    html = html.split('${streamname}').join(streamname);
    html = html.split('${problempriority}').join(problempriority);
    html = html.split('${sourcename}').join(sourcename);
    html = html.split('${source}').join(source);
    html = html.split('${problemdescription}').join(problemdescription);
    html = html.split('${map}').join(map);
    html = html.split('${mainImage}').join(mainImage);

    let solutionstatusVal = solutionstatus ? solutionstatus : 0;
    solutionstatusVal = Math.floor((solutionstatusVal / 100) * 150)
    html = html.split('${solutionstatusVal}').join(solutionstatusVal);

    let _components = components.length > 0 ? components : [{
      type: '',
      estimated_cost: 0,
      original_cost: 0,
      percen: 0
    }]
    let sum = 0;
    let componentRows = _components.map((c) => {
      sum += c.estimated_cost;
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.estimated_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.original_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `
    }).join('')

    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(priceFormatter(sum));

    return pdf.create(html, options);
  },
  printProject: (_data, components, map) => {
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
    html = html.split('${projectname}').join(projectname);
    html = html.split('${projecttype}').join(projecttype + ' Project');
    html = html.split('${sponsor}').join(sponsor);
    html = html.split('${county}').join(county);
    html = html.split('${servicearea}').join(servicearea);
    html = html.split('${cost}').join(priceFormatter(finalcost ? finalcost : estimatedcost));
    html = html.split('${status}').join(status);
    html = html.split('${streamname}').join(streamname);
    html = html.split('${projectsubtype}').join(projectsubtype);
    html = html.split('${attachmentUrl}').join(attachments.length > 0 ? attachments[0] : 'https://i.imgur.com/kLyZbrB.jpg');
    html = html.split('${startyear}').join(startyear);
    html = html.split('${completedyear}').join(completedyear);
    html = html.split('${frequency}').join(frequency);
    html = html.split('${mhfdmanager}').join(mhfdmanager);
    html = html.split('${description}').join(description);
    html = html.split('${contractor}').join(contractor);
    html = html.split('${consultant}').join(consultant);

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
    let sum = 0;
    let componentRows = _components.map((c) => {
      sum += c.estimated_cost;
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.estimated_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${priceFormatter(c.original_cost)}</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `
    }).join('')

    html = html.split('${componentRows}').join(componentRows);
    html = html.split('${totalEstimatedCost}').join(priceFormatter(sum));
    html = html.split('${map}').join(map);

    return pdf.create(html, options);
  }
}
