const fs = require('fs');
const path = require('path');
const pug = require('pug');
const http = require('http');
const ecstatic = require('ecstatic');

require('dotenv').config();

const srcFolder = path.join(__dirname, 'src');
const outputFolder = process.env.OUTPUT_FOLDER || path.join(__dirname, 'dist');

// Function to generate HTML from Pug template
function generateHTML(templatePath, outputPath) {
  console.log(`Generating HTML file from Pug template: ${templatePath}`);
  // check if is Pug file
  if (!templatePath.endsWith('.pug')) {
    return;
  }
  // check if not include folder // if templatePath includes 'include' in string
  if (templatePath.includes('include'))
  {
    return;
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const compiledFunction = pug.compile(template, { pretty: parseInt(process.env.PRETTY), doctype : 'html', filename: templatePath });
  // on check if data exists for page 
  let menuPath = process.env.DATA_FOLDER +'/'+ 'menu.json';
  let menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
  let dataPath = process.env.DATA_FOLDER +'/'+ path.parse(templatePath).name + '.json';
  let html;
  if(fs.existsSync(dataPath))
  {
    let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data = {menu: menu, ...data};
    html = compiledFunction(data);
  } else {
    html = compiledFunction({ menu: menu });
  }
  // write HTML file
  fs.writeFileSync(outputPath, html);
  console.log(`Generated HTML file: ${outputPath}`);
}

// Function to generate HTML files from Pug templates in the src folder
function generateHTMLFiles() {
  fs.readdirSync(srcFolder).forEach((file) => {
    
    const templatePath = path.join(srcFolder, file);
    const outputPath = path.join(outputFolder, `${path.parse(file).name}.html`);
    generateHTML(templatePath, outputPath);
  });
}

// Generate HTML files
generateHTMLFiles();

// Watch for changes in the src folder and regenerate HTML files
if (process.env.WATCH_MODE === 'true') {
  fs.watch(srcFolder, { recursive: true }, (eventType, filename) => {
    if (eventType === 'change') {
      generateHTMLFiles();
    }
  });
  console.log('Watching for changes in the src folder...');

  // create http server to serve the generated html files
  
  const server = http.createServer(ecstatic({ root: outputFolder }));
  server.listen(process.env.PORT || 8080);
  console.log('Server running at http://localhost:' + (process.env.PORT || 8080));

  // prevent the process from exiting
  process.stdin.resume();
}

