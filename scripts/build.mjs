import {mkdir,cp,readdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dest=resolve(root,'dist');
await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
for(const entry of await readdir(root,{withFileTypes:true})){
 if(entry.isFile()&&/\.(html|css|js)$/.test(entry.name))await cp(resolve(root,entry.name),resolve(dest,entry.name));
}
for(const dir of ['assets','desk'])await cp(resolve(root,dir),resolve(dest,dir),{recursive:true});
await cp(resolve(root,'deploy/_headers'),resolve(dest,'_headers'));
await cp(resolve(root,'deploy/_redirects'),resolve(dest,'_redirects'));
console.log('Built dist: public website and lending desk. Database, tests and secrets are excluded.');
