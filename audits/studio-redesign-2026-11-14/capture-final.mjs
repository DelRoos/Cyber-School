import { chromium } from "@playwright/test";
import fs from "node:fs"; import path from "node:path";
const root=path.join(process.env.LOCALAPPDATA,"ms-playwright");
const exe=fs.readdirSync(root).filter(x=>x.startsWith("chromium-")).sort().reverse().map(x=>path.join(root,x,"chrome-win64","chrome.exe")).find(x=>fs.existsSync(x));
const browser=await chromium.launch({executablePath:exe}); const errors=[]; const rows=[];
for(const [device,width,height] of [["desktop",1280,800],["mobile",375,812]]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:"reduce"});
 page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error") errors.push(m.text())});
 for (const [name,url] of [["home","/"],["memory","/lessons/program-memory-fundamentals"],["tcp","/lessons/tcp-three-way-handshake"]]) {
  const response=await page.goto("http://127.0.0.1:3100"+url,{waitUntil:"networkidle"});
  await page.screenshot({path:"audits/studio-redesign-2026-11-14/"+name+"-"+device+"-final.png",fullPage:true});
  rows.push({name,device,status:response.status(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(name==="memory") {await page.getByTestId("vis-01-cpu-memory").scrollIntoViewIfNeeded();await page.screenshot({path:"audits/studio-redesign-2026-11-14/memory-lab-"+device+".png"});}
 }
 await page.close();
}
console.log(JSON.stringify({rows,errors},null,2)); fs.writeFileSync("audits/studio-redesign-2026-11-14/visual-checks.json",JSON.stringify({rows,errors},null,2));
await browser.close();

