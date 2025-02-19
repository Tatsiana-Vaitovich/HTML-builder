'use strict';

const fs = require('fs');
const path = require('path');
const {stdout} = process;

//при помощи функции walk получим список всех файлов в директории
function walk(dir, done) {
  let results = [];//получим результат массив имен всех файлов в директории secret-folder
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
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function getInformationAboutFiles(dir) {
  walk(dir, function(err, results) {
    if (err) throw err;
    results.forEach((el) => {
      //получим объект со свойствами
      const data = path.parse(el);
      fs.stat(el, (err, stats) => {
        if (err) throw err;
        //todo ?? в чате написали, что не нужно выводить информацию о .gitkeep
        else if (data.name !== '.gitkeep') {
          stdout.write(`${data.name} - ${data.ext.slice(1)} - ${(stats['size']/1000)}kb \n`);
        }
      });
    });
  });
}

const dir = path.join(__dirname, 'secret-folder');
getInformationAboutFiles(dir);

module.exports.walk = walk;