'use strict';

function readFile() {
  const path = require('path');
  const fs = require('fs');
  const textPath = path.join(__dirname, 'text.txt');

  const readableStream = fs.createReadStream(`${textPath}`, 'utf-8');
  //при работе с большим объемом данных чтобы не загружать оперативную память и не остановить работу программы на все время операции, считывание и запись данных можно осуществлять по частям (chunk).
  //вторым параметром передаем 'utf-8' чтобы преобразовать buffer в строку
  //readable stream используется для чтения данных
  //У потока чтения есть событие data, которое генерируется, когда стрим прочитал порцию данных и готов отдать ее потребителю этих данных.
  //т.к данные приходят частями, чтобы части собрать вместе используем переменную data
  let data = '';
  readableStream.on('data', chunk => data += chunk);
  
  //чтобы знать, когда поток завершиться, используем событие стрима 'end', которое срабатывает когда все данные переданы
  
  readableStream.on('end', () => console.log(data));
  
  //обработаем ошибку
  
  readableStream.on('error', error => console.log('Error', error.message));
}


module.exports.readFile = readFile;