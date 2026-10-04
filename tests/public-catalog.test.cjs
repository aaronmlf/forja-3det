'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('clone público pesquisa sem corpus privado e informa página ausente',()=>{
 const sent=[];const context={self:{postMessage:m=>sent.push(m)},importScripts:()=>{throw Error('Acervo local ausente')}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app/search-worker.js'),'utf8'),context);
 context.self.onmessage({data:{id:1,kind:'catalog',query:'magia'}});
 assert.equal(sent[0].result.total,0);assert.equal(sent[0].result.rows.length,0);assert.equal(sent[0].error,undefined);
 context.self.onmessage({data:{id:2,kind:'page',book:'3d&tManualbasico',page:1}});
 assert.match(sent[1].error,/Página não encontrada/);
});
test('metadados públicos preservam fontes e aceitam metadados locais sem substituir referência',()=>{
 let optional;const context={window:{},document:{createElement:()=>({}),head:{appendChild:s=>{optional=s}}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app/data/metadata.js'),'utf8'),context);
 const initial=context.window.CATALOG;assert.equal(initial.books.length,11);assert.equal(initial.pageCount,0);assert.equal(initial.localAvailable,false);
 optional.onerror();context.window.LOCAL_CATALOG={pageCount:1505,entryCount:4188,localAvailable:true};optional.onload();
 assert.equal(context.window.CATALOG,initial);assert.equal(initial.pageCount,1505);assert.equal(initial.localAvailable,true);
});
