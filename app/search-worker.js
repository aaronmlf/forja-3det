'use strict';
// The corpus and its accent-insensitive index never enter the UI thread.
self.window=self;
try{importScripts('data/catalog.js')}catch{}
const corpus=self.CATALOG||{books:[],entries:[],pages:[]};
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const entries=corpus.entries.map(e=>normalize(e.name+' '+e.text));
const pages=corpus.pages.map(p=>normalize(p.text));
const cache=new Map();
self.onmessage=({data:m})=>{try{
 if(m.kind==='page'){const page=corpus.pages.find(p=>p.book===m.book&&p.page===m.page);if(!page)throw Error('Página não encontrada.');self.postMessage({id:m.id,result:page});return}
 const query=normalize(m.query||''),key=JSON.stringify([m.kind,query,m.book,m.category]);let indices=cache.get(key);
 const list=m.kind==='catalog'?corpus.entries:corpus.pages,normalized=m.kind==='catalog'?entries:pages;
 if(!indices){indices=[];for(let n=0;n<list.length;n++){const row=list[n];if(m.book&&row.book!==m.book)continue;if(m.category&&row.category!==m.category)continue;if(!query||normalized[n].includes(query))indices.push(n)}cache.set(key,indices);if(cache.size>12)cache.delete(cache.keys().next().value)}
 const page=Math.max(0,Math.min(m.page||0,Math.max(0,Math.ceil(indices.length/30)-1)));
 const rows=indices.slice(page*30,page*30+30).map(n=>{const row=list[n];if(m.kind==='catalog')return row;const at=normalized[n].indexOf(query);return {book:row.book,page:row.page,text:row.text.slice(Math.max(0,at-120),at+350),snippet:true}});
 self.postMessage({id:m.id,result:{rows,total:indices.length,page}});
}catch(e){self.postMessage({id:m.id,error:e.message})}};
