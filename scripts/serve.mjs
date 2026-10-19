import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const types={'html':'text/html','js':'text/javascript','css':'text/css','svg':'image/svg+xml','png':'image/png','webmanifest':'application/manifest+json'};
const files=new Set(['index.html','app.js','auth-flow.js','post-ui.js','styles.css','firebase-config.js','sw.js','prime-avenue-logo.svg','icon-192.png','icon-512.png','manifest.webmanifest']);
createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname.replace(/^\//,'')||'index.html';if(!files.has(path)){res.writeHead(404);res.end();return;}const body=await readFile(new URL('../'+path,import.meta.url));res.writeHead(200,{'Content-Type':types[path.split('.').at(-1)],'Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(500);res.end();}}).listen(4173,'0.0.0.0',()=>console.log('Local: http://localhost:4173/'));
