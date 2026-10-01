const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://local').pathname);if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png'}[path.extname(file)]||'application/octet-stream'));res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.FODMAN_TEST_CHROMIUM?{executablePath:process.env.FODMAN_TEST_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url+'/desk/');await page.getByRole('button',{name:'Open demonstration'}).click();
  await page.getByRole('heading',{name:'Your desk, at a glance.'}).waitFor();
  await fs.mkdir(path.join(root,'test-results'),{recursive:true});await page.screenshot({path:path.join(root,'test-results/desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'+ New application',exact:true}).click();let dialog=page.getByRole('dialog');
  await dialog.getByLabel('Full name',{exact:true}).fill('Demo • Acceptance Test');await dialog.getByLabel('Phone / WhatsApp').fill('+256700000009');
  await dialog.getByLabel('Requested amount').fill('100001');await dialog.getByLabel('Preferred term').fill('3');await dialog.getByLabel('Purpose').fill('Business stock');
  await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Save application'}).click();
  await page.getByRole('button',{name:'Applications',exact:true}).click();await page.getByRole('button',{name:'Demo • Acceptance Test',exact:true}).click();
  await dialog.getByRole('button',{name:'Approve terms'}).click();await dialog.getByLabel('Decision note').fill('Documents checked and terms agreed');await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button',{name:'Approve application'}).click();
  await page.getByRole('button',{name:'Demo • Acceptance Test',exact:true}).click();await dialog.getByRole('button',{name:'Record disbursement'}).click();await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Confirm disbursement'}).click();
  await page.getByRole('button',{name:'Loans',exact:true}).click();await page.getByRole('button',{name:'Demo • Acceptance Test',exact:true}).click();
  assert.ok((await dialog.innerText()).includes('UGX 107,501'));await dialog.getByRole('button',{name:'Record repayment'}).click();
  await dialog.getByLabel('Amount received').fill('10000');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Save repayment & receipt'}).click();
  await dialog.getByRole('heading',{name:'Fodman International Limited'}).waitFor();assert.ok((await dialog.innerText()).includes('UGX 97,501'));
  await page.screenshot({path:path.join(root,'test-results/receipt.png'),fullPage:true});
  await dialog.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:'Reports',exact:true}).click();
  assert.ok((await page.locator('#content').innerText()).includes('Reconciled: receipts equal repayment allocations.'));
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().right<=0);await page.screenshot({path:path.join(root,'test-results/mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})))));
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.getByRole('heading',{name:'Your desk, at a glance.'}).waitFor();await page.screenshot({path:path.join(root,'test-results/mobile-overview.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})))));
  await page.goto(url+'/apply.html?purpose=Business');await page.locator('#apPurpose').selectOption('Business');assert.equal(await page.locator('#apPurpose').inputValue(),'Business');
  await page.context().route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'<title>Prepared WhatsApp enquiry</title>'}));let popup=page.waitForEvent('popup');await page.locator('#apName').fill('Test Applicant');await page.locator('#apPhone').fill('+256700123456');await page.locator('#apAmount').fill('100000');await page.locator('#apTerm').fill('3');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Review in WhatsApp'}).click();const draft=await popup;await draft.waitForURL('https://wa.me/**');assert.ok(draft.url().includes('wa.me'));await draft.close();
  assert.ok((await page.locator('#applyFormNote').innerText()).includes('only when you send'));
  // Simulate configured intake to verify server confirmation and duplicate retry key.
  await page.route('**/lending-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.FODMAN_CONFIG={supabaseUrl:'https://project.supabase.co',publishableKey:'sb_publishable_test',turnstileSiteKey:'test-site-key',supportPhone:'+256775858924'};"}));
  await page.route('https://challenges.cloudflare.com/**',r=>r.fulfill({contentType:'text/javascript',body:"window.turnstile={render:(s,o)=>{o.callback('test-token');window.testTurnstileCallback=o.callback;return 'widget';},reset:()=>{window.testTurnstileCallback('test-token');}};"}));
  const keys=[];await page.route('https://project.supabase.co/functions/v1/lending-intake',r=>{const data=r.request().postDataJSON();keys.push(data.requestKey);return r.fulfill({status:keys.length===1?500:201,contentType:'application/json',body:JSON.stringify(keys.length===1?{error:'Please retry'}:{reference:'APP-1234567890ABCDEF'})});});
  await page.reload();await page.locator('#apName').fill('Test Applicant');await page.locator('#apPhone').fill('+256700123456');await page.locator('#apAmount').fill('100000');await page.locator('#apTerm').fill('3');await page.locator('#apPurpose').selectOption('Business');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Submit application'}).click();await page.getByText('Please retry',{exact:true}).waitFor();
  assert.equal(await page.locator('#applySuccess').isVisible(),false);await page.getByRole('button',{name:'Submit application'}).click();await page.locator('#applySuccess').waitFor();assert.equal(keys[0],keys[1]);assert.equal(await page.locator('#applicationReference').innerText(),'APP-1234567890ABCDEF');
  assert.deepEqual(errors,[]);console.log('PASS: desktop and mobile workflow, exact approval quote, disbursement, partial repayment, receipt, reports, WhatsApp fallback, public intake confirmation and duplicate retry key.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
