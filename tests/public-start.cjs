'use strict';
const {root,electronPath}=require('./runtime.cjs'),{_electron}=require(process.env.PLAYWRIGHT_PATH||'playwright'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 if(fs.existsSync(path.join(root,'app/data/catalog.js')))throw Error('Este teste exige o clone público sem acervo; use outro checkout para não apagar o acervo local.');
 const profile=path.join(root,'tmp/public-start-profile');fs.rmSync(profile,{recursive:true,force:true});
 let app;try{
  app=await _electron.launch({executablePath:electronPath(),args:['--no-sandbox','--disable-gpu',path.join(root,'app'),'--user-data-dir='+profile]});
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('h1');
  assert.equal(await page.evaluate(()=>C.localAvailable),false);
  assert.match(await page.locator('.sidebar-bottom').innerText(),/não configurado/);
  await page.locator('[data-view="personagem"]').click();await page.locator('[data-field="name"]').fill('Clone público');
  await page.locator('[data-attr="R"]').fill('2');await page.locator('[data-attr="R"]').press('Tab');
  assert.equal(await page.evaluate(()=>R.calculate(ch()).pv),10);
  await page.locator('[data-view="poderes"]').click();await page.locator('[data-action="catalog"]').first().click();await page.locator('#catalog-search').fill('magia');await page.evaluate(()=>waitForSearch());
  await page.waitForFunction(()=>searchStates.catalog.result?.total===0&&!searchStates.catalog.result?.pending);assert.match(await page.locator('.content').innerText(),/Configure seu acervo local/);
  await page.locator('[data-view="biblioteca"]').click();assert.match(await page.locator('.content').innerText(),/Configure seu acervo local/);
  await page.evaluate(()=>flushSave());assert.deepEqual(errors,[]);console.log('PASS: clone sem PDFs ou corpus abre, edita ficha e pesquisa vazia sem erro de interface.');
 }finally{if(app)await app.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
