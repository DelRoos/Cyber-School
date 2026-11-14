import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const pwRoot=path.join(process.env.LOCALAPPDATA,"ms-playwright");
const candidate=fs.readdirSync(pwRoot).filter(x=>x.startsWith("chromium-")).sort().reverse().map(x=>path.join(pwRoot,x,"chrome-win64","chrome.exe")).find(x=>fs.existsSync(x));
const browser=await chromium.launch({executablePath:candidate});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on("pageerror", e=>console.log("PAGEERROR",e.message));
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.screenshot({path:"audits/studio-redesign-2026-11-14/home-desktop.png",fullPage:true});
console.log("TITLE",await page.title());
await page.goto("http://localhost:3000/lessons/program-memory-fundamentals",{waitUntil:"networkidle"});
await page.screenshot({path:"audits/studio-redesign-2026-11-14/memory-desktop.png",fullPage:true});
console.log("HEADINGS",await page.locator("h1").allTextContents());
await browser.close();

