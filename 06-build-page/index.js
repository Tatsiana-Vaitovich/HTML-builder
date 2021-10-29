'use strict';
const path = require('path');
const fs = require('fs');
// const modCopyDir = require('../04-copy-directory/index.js');
// const modCreateBundle = require('../05-merge-styles/index.js');

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
            fs.copyFile(file, path.join(destDir, fileName), function(err, results) {
              if (err) throw err;
            });
            next();
          }
        });
      })();
    });
  }

  //перед созданием копии очищаю предыдущую копию, если она была создана
  const removeDirectory = (sourceDir, distDir) => {
    try {
      fs.rm(distDir, { recursive: true }, (err) => {
        if (err) {
          fs.mkdir(destDir, {recursive: true}, (err)=>{
            if (err) console.log(`Error creating directory: ${err}`);
          });        
        } else {
          // console.log('Directory has been removed!');
        }
        // Create new folder
        fs.mkdir(distDir, {recursive:true}, (err)=>{
          if (err) console.log(`Error creating directory: ${err}`);
          //copy files into new created folder
          copyFiles(sourceDir, distDir, function(err, results) {
            if (err) throw err;
            // console.log('Files have been copied!');
          });
        });
      });
    } catch (err) {
      // console.log(err);
    }
  };
  
  //Start main script
  removeDirectory(sourceDir, destDir);
}

function getComponents() {
  //зайду в папку components и найду в ней все файлы
} 


function buildPage() {
  //создать папку project-dist
  const projectDist = path.join(__dirname, 'project-dist');
  fs.mkdir(projectDist, {recursive: true}, err => {
    if (err) throw err;

    //todo создаю в данной папке собранный файл index.html
    //заменить шаблонные теги в файле template.html с названиями файлов из папки components (пример:{{section}}) на содержимое одноимённых компонентов и сохраняет результат в project-dist/index.html.
    const templateHtml = path.join(__dirname, 'template.html');
    const readableStream = fs.createReadStream(templateHtml, 'utf-8');
    let data = '';
    readableStream.on('data', (chunk, err) => {
      if (err) throw err;
      data = data + chunk;
      //ищем в данной строке шаблонные теги
    });




    //копирую папку assets со всем содержимым
    const sourcedir = path.join(__dirname, 'assets');
    const distDir = path.join(projectDist, 'assets');
    copyDir(sourcedir, distDir);

    //создаю в данной папке bundle.css
    const stylesDir = path.join(__dirname, 'styles');
    const stylesBundle = path.join(projectDist, 'style.css');
    createBundle(stylesDir, stylesBundle);
  });
}

buildPage();

