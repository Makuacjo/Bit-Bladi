import { chromium } from "playwright";
import { SignJWT } from "jose";
const B="http://localhost:3000";
const SECRET=new TextEncoder().encode(process.env.AUTH_SECRET||"dev-only-change-me-32chars-minimum-secret");
const WIDTHS=[320,375,768,1024,1440];
const PUBLIC=["/en","/en/menu","/en/reserve","/ar","/ar/menu","/ar/reserve"];
const ADMIN=["/admin/login","/admin","/admin/menu","/admin/categories","/admin/promotions","/admin/reviews","/admin/reservations","/admin/media","/admin/settings"];
const b=await chromium.launch({channel:"chrome",headless:true});
const token=await new SignJWT({sub:"t",email:"admin@bitbladi.com",role:"super",name:"Admin"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("1h").sign(SECRET);
const ctx=await b.newContext();
await ctx.addCookies([{name:"bb_session",value:token,domain:"localhost",path:"/"}]);
const p=await ctx.newPage();
const issues=[]; let checks=0;
async function scan(route){
  for(const w of WIDTHS){
    await p.setViewportSize({width:w,height:900});
    try{ await p.goto(B+route,{waitUntil:"domcontentloaded",timeout:15000}); }catch{ continue; }
    await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=800){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}window.scrollTo(0,0);});
    await p.waitForTimeout(120); checks++;
    const r=await p.evaluate((vw)=>{
      const sw=document.documentElement.scrollWidth; const off=[];
      if(sw>vw+1){document.querySelectorAll("*").forEach(el=>{const b=el.getBoundingClientRect();if(b.width>0&&(b.right>vw+1||b.left<-1))off.push(el.tagName+"."+String(el.className||"").slice(0,40));});}
      return {sw,over:sw>vw+1,off:[...new Set(off)].slice(0,4)};
    },w);
    if(r.over) issues.push({route,w,sw:r.sw,off:r.off});
  }
}
for(const rt of [...PUBLIC,...ADMIN]) await scan(rt);
if(issues.length===0) console.log("NO horizontal overflow across all routes × widths ✓");
else for(const i of issues) console.log(`OVERFLOW ${i.route} @${i.w} (sw=${i.sw}) :: ${i.off.join(" | ")}`);
console.log(`\n${issues.length} overflow findings / ${checks} checks`);
await b.close();
