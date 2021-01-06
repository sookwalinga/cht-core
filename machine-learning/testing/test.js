#!/usr/bin/env node

let RandomForestClassifier = require('./model/model.js');
let fs = require('fs'); 
let model = new RandomForestClassifier(); 


function runSample(data){
  let lines=data.map(d=>d.replace(/true/ig,'1').replace(/false/gi,'0').split(','))

  // remove childdeath column;
  let n=lines[0].indexOf('childdeath') 
  lines=lines.map(l=>{l.splice(n,1); return l}) 

    lines.slice(1,lines.length) 
    .map(d=>d.map(Number))
    .filter(d=>d.length==243)
    .forEach(l=>console.log(model.predict(l)==1?"True":"False"))
}

std = process.openStdin()
  data = ""
  std.on("data", function (chunk) { data += chunk.toString() })
  std.on('end', function () {runSample(data.split("\n"));})
