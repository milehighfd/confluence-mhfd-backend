var fs = require('fs');
var pdf = require('html-pdf');
var Jimp = require('jimp');
var limit = 2;
const priceFormatter = (value) => {
  return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const base64ImageCrop = async (map, mapHeight, mapWidth) => {
  let initialString = 'data:image/png;base64,'; 
  if (map.startsWith(initialString)) {
    map = map.substr(initialString.length);
  }
  const buf = Buffer.from(map, 'base64');
  let image = await Jimp.read(buf);
  let promise = new Promise((resolve, reject) => {
    let difference = Math.abs(image.bitmap.width - mapHeight);
    let margin = 25//parseInt(difference / 8);
    console.log('margin', margin);
    image.crop(0, margin, image.bitmap.width, mapHeight)
    .quality(100)
    .getBase64(Jimp.MIME_JPEG, (err, src) => {
      if (err) reject(err);
      resolve(src)
    });
  })
  let b64 = await promise;
  return b64;
}


module.exports = {
  printProblem: async (data, components, map) => {
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

    let mainImage = problemtype ? `https://confluence.mhfd.org/gallery/${problemtype}.jpg` : 'https://i.imgur.com/kLyZbrB.jpg'

    const mapHeight = 500;
    const mapWidth = 750;
    // if (!components.length) {
    //   map = await base64ImageCrop(map, mapHeight, mapWidth);
    // }
    
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
          <td width="20%" style="padding: 17px 20px;">${c.original_cost ? (Math.round(c.original_cost * 10) /10) : 0}%</td>
          <td width="20%" style="padding: 17px 20px;">${c.percen}%</td>
        </tr>
      `
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
      html = html.split('${componentRows}').join( `
      <tr style="background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;">
        <td width="40%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
        <td width="20%" style="padding: 17px 20px;"></td>
      </tr>
    `);
      html = html.split('${totalEstimatedCost}').join('');
    }
    let q = 0;
    let spaceBetween = '';
    switch(components.length) {
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
    for (var i = 0 ; i < q ; i++) {
      spaceBetween += '<br/>'
    }
    html = html.split('${spaceBetween}').join(components.length > limit ?`<br><div style="page-break-after:always;"></div>`: '');

    // let width = 1200;
    let width = 900;
    let height = 1000;

    var options = {
      width: `${width}px`,
      height: `${height}px`,
      border: '0px'
    };

    return pdf.create(html, options);
  },
  printProject: async (_data, components, map) => {
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
    const mapWidth = 750;
    // if (!(problems.length + components.length)) {
    //   map = await base64ImageCrop(map, mapHeight, mapWidth);
    // }

    html = html.split('${projectname}').join(projectname);
    html = html.split('${projecttype}').join(projecttype + ' Project');
    html = html.split('${sponsor}').join(sponsor);
    html = html.split('${county}').join(county);
    html = html.split('${servicearea}').join(servicearea);
    html = html.split('${cost}').join(priceFormatter(cost));
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
          <td width="20%" style="padding: 17px 20px;">${c.original_cost ? (Math.round(c.original_cost * 10) /10) : 0}%</td>
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
    switch(components.length) {
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
    for (var i = 0 ; i < q ; i++) {
      spaceBetween += '<br/>'
    }
    html = html.split('${spaceBetween}').join(components.length > limit ?`<br><div style="page-break-after:always;"></div>`: '');
    let width = 900;
    let height = 1000;
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
}
