'use strict';
const path = require('path');
const fs = require('fs');

//функция которая получаем список файлов в папке
function walk(dir, done) {
  let results = [];
  //fs.readdir() - получим имена всех файлов в данной директории
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (path.extname(file) === '.css'){
            const readableStream = fs.createReadStream(file, 'utf-8');
            let data = '';
            readableStream.on('data', chunk => {
              data = data + chunk;
            });
            readableStream.on('end', () => {
              results.push(data);
            });
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function createBundle(dir, bundle) {

  function createBundleFile(err, results) {
    if (err) throw err;
    fs.writeFile(bundle, '', err => {
      if (err) throw err;
      results.forEach(el => {
        fs.appendFile(bundle, el, err => {
          if (err) throw err;
        });
      });
    });
  }

  walk(dir, createBundleFile);
}

function copyDir (sourceDir, destDir) {

  function copyFiles(sourceDir, destDir, done) {
    let results = [];
    fs.readdir(sourceDir, function(err, list) {
      if (err) return done(err);
      let i = 0;
      (function next() {
        let file = list[i++];
        if (!file) return done(null, results);
        let fileName = file;
        file = path.resolve(sourceDir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {

            let newDestName = path.join(destDir, fileName);
            fs.mkdir(newDestName, {recursive:true}, (err)=>{
              if (err) console.log(`Error creating directory: ${err} \n`); 
            //else console.log(`Directory created: ${newDestName} \n`);
            });

            copyFiles(file, newDestName, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            fs.copyFile(file, path.join(destDir, fileName), function(err) {
              if (err) throw err;
            });
            next();
          }
        });
      })();
    });
  }

  fs.mkdir(destDir, {recursive:true}, (err)=>{
    if (err) console.log(`Error creating directory: ${err}`);
    //copy files into new created folder
    copyFiles(sourceDir, destDir, function(err) {
      if (err) throw err;
      // console.log('Files have been copied!');
    });
  });
}

function replaceElements (template) {
  const components = path.join(__dirname, 'components');
  const articles = path.join(components, 'articles.html');
  const header = path.join(components, 'header.html');
  const footer = path.join(components, 'footer.html');
  fs.readFile(header, 'utf-8', (err, data) => {
    if(err) console.log('err writting file');
    template = template.replace(new RegExp('{{header}}','g'), data);
    // template = template.split('{{header}}').join(data);
    fs.readFile(articles, 'utf-8', (err, data) => {
      if(err) console.log('err writting file');
      template = template.replace(new RegExp('{{articles}}','g'), data);
      //template = template.split('{{articles}}').join(data);
      fs.readFile(footer, 'utf-8', (err, data) => {
        if(err) console.log('err writting file');
        template = template.replace(new RegExp('{{footer}}','g'), data);
        //template = template.split('{{footer}}').join(data);
        fs.writeFile(path.join(__dirname, 'project-dist', 'index.html'), template, err => {
          if (err) throw err;
          console.log('index.html rewritten');
        }); 
      });
    });
  });
}

function createDirectory (dirName, cb) {
  fs.rm(dirName, { recursive: true }, (err) => {
    if (err) {
      fs.mkdir(dirName, {recursive: true}, (err)=> {
        if (err) console.log(`Error creating directory: ${err}`);
        cb();
      });
    } else {
      fs.mkdir(dirName, {recursive: true}, (err)=> {
        if (err) console.log(`Error creating directory: ${err}`);
        cb();
      });
    }
  });
}

const projectDist = path.join(__dirname, 'project-dist');

createDirectory(projectDist, buildPage);

function buildPage() {
  const sourceAssets = path.join(__dirname, 'assets');
  const distAssets = path.join(projectDist, 'assets');
  copyDir(sourceAssets, distAssets);

  //создаю в данной папке bundle.css
  const stylesDir = path.join(__dirname, 'styles');
  const stylesBundle = path.join(projectDist, 'style.css');
  createBundle(stylesDir, stylesBundle);

  //создаю в данной папке собранный файл index.html
  const templateHtml = path.join(__dirname, 'template.html');
  const htmlCopy = path.join(projectDist, 'index.html');
  fs.copyFile(templateHtml, htmlCopy, err => {
    if (err) {
      console.log('error creatting index.html');
    }else {
      fs.readFile(htmlCopy, 'utf-8', (err, data) => {
        if (err) console.log('index.html is not written');
        replaceElements(data);
      });
    }
  });
}

