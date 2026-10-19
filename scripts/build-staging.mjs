import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const output=new URL('dist-staging/',root);
// Explicit allowlist: never publish backend code, tests, local files or credentials.
const files=['index.html','app.js','auth-flow.js','post-ui.js','styles.css','firebase-config.js','sw.js','prime-avenue-logo.svg','icon-192.png','icon-512.png','manifest.webmanifest'];
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const file of files)await cp(new URL(file,root),new URL(file,output));
await writeFile(new URL('robots.txt',output),'User-agent: *\nDisallow: /\n');
console.log(`Prepared ${files.length} frontend files for Firebase staging. Private data still requires approved membership.`);
