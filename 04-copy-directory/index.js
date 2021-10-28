'use strict';

function copyDir() {
  const fs = require('fs');
  const path = require('path');

  //при помощи функции walk получим список всех файлов в директории и поддиректориях
  function walk(dir, done, newDir) {
    let results = [];//получим результат массив имен всех файлов в директории
    //fs.readdir() - получим имена всех файлов в данной директории
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      let pending = list.length;
      if (!pending) return done(null, results, newDir);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results, newDir);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results, newDir);
          }
        });
      });
    });
  }

  function createDirWitnFiles(err, results, newDir) {
    if (err) throw err;
    fs.mkdir(newDir, {recursive: true}, err => {
      if (err) throw err;
      results.forEach((el) => {
        fs.copyFile(el, path.join(newDir, path.parse(el)['base']), err => {
          if (err) throw err;
        });
      });
    });
  }

  const dir = path.join(__dirname, 'files');
  const newDir = path.join(__dirname, 'files-copy');
  walk(dir, createDirWitnFiles, newDir);
}

copyDir();
