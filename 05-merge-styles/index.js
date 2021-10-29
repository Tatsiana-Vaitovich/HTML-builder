'use strict';

const fs = require('fs');
const path = require('path');

//создаю файл bundle.css в папке project-dist fs.writeFile()
//получить из директории css все файлы с расширением css. другие файлы и директрории игнорировать. использую walk. в результат передаю не название файла, а его содержимое - читаем файл fs.readFile
//bundle.css перезаписывается => используется fs.writeFile()

function createBundle(dir, bundle) {
  //получу объект с содержимым всех css-файлов в папке styles
  function walk(dir, done) {
    let results = [];
    //fs.readdir() - получим имена всех файлов в данной директории
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      let pending = list.length;
      if (!pending) return done(null, results, bundle);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results, bundle);
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
            if (!--pending) done(null, results, bundle);
          }
        });
      });
    });
  }

  function createBundleFile(err, results, bundle) {
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

const bundle = path.join(__dirname, 'project-dist', 'bundle.css');
const dir = path.join(__dirname, 'styles');
createBundle(dir, bundle);

// module.exports.createBundle = createBundle;