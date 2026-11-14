import {chromium} from "@playwright/test"; import fs from "node:fs"; import path from "node:path";
const pw=path.join(process.env.LOCALAPPDATA,"ms-playwright");
const exe=fs.readdirSync(pw).filter(x=>x.startsWith("chromium-")).sort().reverse().map(x=>path.join(pw,x,"chrome-win64","chrome.exe")).find(x=>fs.existsSync(x));
const browser=await chromium.launch({executablePath:exe});const results=[];
for(const port of [3000,3100]){
 const page=await browser.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text().slice(0,250))});
 try{await page.goto("http://127.0.0.1:"+port,{waitUntil:"networkidle"});await page.getByRole("button",{name:"Augmenter le nombre"}).click();await page.waitForFunction(()=>document.querySelector("output")?.textContent?.startsWith("43"),{},{timeout:4000});results.push({port,interactive:true,errors});}
 catch(e){results.push({port,interactive:false,errors,error:e.message.slice(0,120)});}await page.close();
}
await browser.close();fs.writeFileSync("audits/agent-skills-integration-2026-11-14/browser-environment.json",JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
