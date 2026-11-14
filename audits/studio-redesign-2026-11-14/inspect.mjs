import {chromium} from "@playwright/test"; import fs from "node:fs"; import path from "node:path";
const pw=path.join(process.env.LOCALAPPDATA,"ms-playwright"); const exe=fs.readdirSync(pw).filter(s=>s.startsWith("chromium-")).sort().reverse().map(s=>path.join(pw,s,"chrome-win64","chrome.exe")).find(s=>fs.existsSync(s));
const browser=await chromium.launch({executablePath:exe}); const p=await browser.newPage({viewport:{width:1280,height:800}});
await p.goto("http://127.0.0.1:3100/lessons/program-memory-fundamentals");await p.getByTestId("chapter-filter-all").click();
console.log("DESKTOP",await p.evaluate(()=>[...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect();return r.width && (r.right>innerWidth+1 ||r.left< -1)}).slice(0,30).map(e=>({tag:e.tagName,cls:e.className,id:e.getAttribute("data-testid"),r:e.getBoundingClientRect().right,w:e.clientWidth}))));
await p.setViewportSize({width:375,height:812});await p.screenshot({path:"audits/studio-redesign-2026-11-14/memory-mobile.png",fullPage:true});
console.log("MOBILE",await p.evaluate(()=>[...document.querySelectorAll("main *")].filter(e=>{const r=e.getBoundingClientRect();return r.width && (r.right>innerWidth+1||r.left< -1)}).slice(0,30).map(e=>({tag:e.tagName,cls:e.className,id:e.getAttribute("data-testid"),r:e.getBoundingClientRect().right,w:e.clientWidth}))));
await p.goto("http://127.0.0.1:3100");await p.screenshot({path:"audits/studio-redesign-2026-11-14/home-mobile.png",fullPage:true});await browser.close();
