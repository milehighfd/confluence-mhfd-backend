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
    console.log('data', data);
    return pdf.create(html, options);
  }
}
