'use strict';
const fs = require('fs');
const path = require('path');

function copyDir (sourceDir, destDir) {

  // fs.mkdir(destDir, {recursive: true}, (err)=>{
  //   if (err) console.log(`Error creating directory: ${err}`);
  // });

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

const dir = path.join(__dirname, 'files');
const newDir = path.join(__dirname, 'files-copy');
copyDir(dir, newDir);

// module.exports.copyDir = copyDir;
