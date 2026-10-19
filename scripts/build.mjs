import {mkdir,cp,readdir,rm,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dest=resolve(root,'dist');
await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
const notPages=new Set(['node_modules','dist','supabase','tests','scripts','docs','deploy','test-results']);
for(const entry of await readdir(root,{withFileTypes:true})){
 if(entry.isFile()&&/\.(html|css|js)$/.test(entry.name))await cp(resolve(root,entry.name),resolve(dest,entry.name));
 // Each page lives at name/index.html, so every top-level folder that holds an index.html is a page.
 if(entry.isDirectory()&&!notPages.has(entry.name)&&await access(resolve(root,entry.name,'index.html')).then(()=>true,()=>false))await cp(resolve(root,entry.name),resolve(dest,entry.name),{recursive:true});
}
for(const dir of ['assets','desk','fonts'])await cp(resolve(root,dir),resolve(dest,dir),{recursive:true});
await cp(resolve(root,'deploy/_headers'),resolve(dest,'_headers'));
await cp(resolve(root,'deploy/_redirects'),resolve(dest,'_redirects'));
console.log('Built dist: public website and lending desk. Database, tests and secrets are excluded.');
