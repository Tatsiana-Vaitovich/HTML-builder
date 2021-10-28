'use strict';

function copyDir() {
  const fs = require('fs');
  const path = require('path');

  //при помощи функции walk получим список всех файлов в директории и поддиректориях
  function walk(dir, done, newDir) {
    let currentDir = newDir;
    let results = [];//получим результат массив имен всех файлов в директории secret-folder
    //fs.readdir() - получим имена всех файлов в данной директории
    let currentResuls = results.slice(0);
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      let pending = list.length; //list - массив с файлами в директории
      if (!pending) return done(null, results, newDir); //если в папке нету файлов создается копия папки без файлов
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stats) {
          if (stats && stats.isDirectory()) {
            newDir = path.join(newDir, path.basename(file));
            results = [];
            walk(file, done, newDir);
          } else {
            newDir = currentDir;
            results = currentResuls.slice(0);
            results.push(file);
            done(err, results, newDir);
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

  // function cleanDir(dir, deleteFiles, deleteFolder) {
  //   let currentDir = dir;
  //   let results = [];//получим результат массив имен всех файлов в директории secret-folder
  //   //fs.readdir() - получим имена всех файлов в данной директории
  //   fs.readdir(dir, function(err, list) {
  //     if (err) throw(err);
  //     let pending = list.length; //list - массив с файлами в директории
  //     if (!pending && currentDir !== dir) fs.rmdir(currentDir, err => {if (err) {throw err;}}) ; //если в папке нету файлов создается копия папки без файлов
  //     list.forEach(function(file) {
  //       file = path.resolve(dir, file);
  //       fs.stat(file, function(err, stats) {
  //         if (stats && stats.isDirectory()) {
  //           dir = path.join(dir, path.basename(file));
  //           cleanDir(file, deleteFiles, deleteFolder);
  //         } else {
  //           dir = currentDir;
  //           results.push(file);
  //           deleteFiles(err, results);
  //           if (!--pending) deleteFolder(null, dir);
  //         }
  //       });
  //     });
  //   });
  // }

  // function deleteFiles(err, results) {
  //   if (err) throw err;
  //   results.forEach(el => {
  //     fs.unlink(el, err => {
  //       if (err) throw err;
  //     });
  //   });
  // }
  // function deleteFolder(err, dir) {
  //   fs.rmdir(dir, err => {
  //     if (err) throw err;
  //   });
  // }

  const dir = path.join(__dirname, 'files');
  const newDir = path.join(__dirname, 'files-copy');
  walk(dir, createDirWitnFiles, newDir);
}

copyDir();
