const fs = require('fs');
const path = require('path');

console.clear();


//Copy files function
const copyFiles = (sourceDir, destDir, done) => {
  var results = [];
  fs.readdir(sourceDir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      fileName = file;
      file = path.resolve(sourceDir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {

	  newDestName = path.join(destDir, fileName);
          fs.mkdir(newDestName, {recursive:true}, (err)=>{
            if (err) console.log(`Error creating directory: ${err} \n`); 
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
};


// Delete a directory and its children and copy new files then
const removeDirectory = (dirPath) => {
  try {
    fs.rm(dirPath, { recursive: true }, (err) => {
      if (err) throw err;
      console.log('Directory has been removed!');
      // Create new folder
      fs.mkdir(path.join(__dirname, 'files-copy'), {recursive:true}, (err)=>{
        if (err) console.log(`Error creating directory: ${err}`);
        //copy files into new created folder
        copyFiles(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'), function(err, results) {
          if (err) throw err;
          console.log('Files have been copied!');
        });
      });

    });
  } catch (err) {
    console.log(err);
  }
};

//Start main script
removeDirectory(path.join(__dirname, 'files-copy'));


