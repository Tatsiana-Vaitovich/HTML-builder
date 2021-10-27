'use strict';

function writeFile() {
  const path = require('path');
  const fs = require('fs');
  const readline = require('readline');
  const {stdout, stderr} = process;
  const txtFile = path.join(__dirname, 'text.txt');
  //Экземпляры класса readline.Interface построены с использованием метода readline.createInterface(options). Каждый экземпляр связан с одним входным (input) Readable потоком и одним выходным (output) Writable потоком. Поток output используется для вывода на экран приглашения ввода данных пользователем, которые поступают и считываются с input потока.

  const rl = readline.createInterface(process.stdin, process.stdout);
  rl.setPrompt('введите данные\n');
  rl.prompt();
  rl.on('line', function(line) {
    if (line === 'exit') rl.close();
    fs.appendFile(txtFile,
      line + '\n',
      err => {
        if (err) throw err;
      }
    );
  }).on('close',function(){
    process.exit(0);
  });

  process.on('exit', code => {
    if (code === 0) {
      stdout.write('удачи при изучении node.js');
    } else {
      stderr.write(`что-то пошло не так, програма завершилась с ошибкой ${code}`);
    }
  });
}

module.exports.writeFile = writeFile;