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

module.exports = {
  printProject: (data) => {
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
      attachments,
      status,
      startyear,
      completedyear,
      lgmanager,
      mhfdmanager,
      description,
      contractor,
      consultant,
      problems,
      components,
    } = data;
    html = html.replace('${projectname}', projectname);
    html = html.replace('${projecttype}', projecttype + ' Project');
    html = html.replace('${sponsor}', sponsor);
    html = html.replace('${county}', county);
    html = html.replace('${servicearea}', servicearea);
    html = html.replace('${cost}', finalcost ? finalcost : estimatedcost);
    html = html.replace('${status}', status);
    html = html.replace('${streamname}', streamname);
    html = html.replace('${attachmentUrl}', attachments.length > 0 ? attachments[0] : 'https://i.imgur.com/kLyZbrB.jpg');
    html = html.replace('${startyear}', startyear);
    html = html.replace('${completedyear}', completedyear);
    html = html.replace('${lgmanager}', lgmanager);
    html = html.replace('${mhfdmanager}', mhfdmanager);
    html = html.replace('${description}', description);
    html = html.replace('${contractor}', contractor);
    html = html.replace('${consultant}', consultant);

    let problemRows = problems.map((p) => {
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="50%" style="padding: 17px 20px;">${p.problemname}</td>
          <td width="50%" style="padding: 17px 20px;">${p.problempriority}</td>
        </tr>
      `
    }).join('')
    html = html.replace('${problemRows}', problemRows);

    let componentRows = components.map((c) => {
      return `
        <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
          <td width="40%" style="padding: 17px 20px;">${c.type}</td>
          <td width="20%" style="padding: 17px 20px;"></td>
          <td width="20%" style="padding: 17px 20px;">0%</td>
          <td width="20%" style="padding: 17px 20px;">0%</td>
        </tr>
      `
    }).join('')

    html = html.replace('${componentRows}', componentRows);

    return pdf.create(html, options);
  }
}
