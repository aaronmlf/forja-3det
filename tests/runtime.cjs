'use strict';
const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
process.chdir(root);
fs.mkdirSync(path.join(root,'tmp'),{recursive:true});
fs.mkdirSync(path.join(root,'tmp/qa'),{recursive:true});
function electronPath(){
 if(process.env.ELECTRON_PATH)return process.env.ELECTRON_PATH;
 return require('electron');
}
module.exports={root,electronPath};
