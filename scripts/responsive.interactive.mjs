import { chromium } from "playwright";
import { SignJWT } from "jose";
const B="http://localhost:3000";
const SECRET=new TextEncoder().encode(process.env.AUTH_SECRET||"dev-only-change-me-32chars-minimum-secret");
const b=await chromium.launch({channel:"chrome",headless:true});
const res=[]; const ok=(n,p,d="")=>{res.push({n,p});console.log(`${p?"PASS":"FAIL"}  ${n}${d?"  — "+d:""}`)};
const token=await new SignJWT({sub:"t",email:"admin@bitbladi.com",role:"super",name:"Admin"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("1h").sign(SECRET);

// ---- Public mobile nav (EN 375) ----
const ctx=await b.newContext({viewport:{width:375,height:800}});
const p=await ctx.newPage();
await p.goto(`${B}/en`,{waitUntil:"networkidle"});
await p.locator('button[aria-label="Open menu"]').click(); await p.waitForTimeout(350);
const overlay=p.locator('div.fixed.bg-brown');          // the mobile menu overlay
const overlayMenu=overlay.getByRole("link",{name:"Menu",exact:true});
ok("mobile: menu overlay opens", await overlayMenu.isVisible());
const lb=await overlayMenu.boundingBox();
ok("mobile: overlay link big tap target (≥32h)", !!lb && lb.height>=32, lb?`h=${Math.round(lb.height)}`:"");
await overlayMenu.click();
await p.waitForURL("**/en/menu",{timeout:6000}).catch(()=>{});
await p.waitForTimeout(300);
ok("mobile: menu closes after nav", (await p.locator('div.fixed.bg-brown').count())===0);

// ---- Reviews Add-a-Review dialog fits 375 ----
await p.goto(`${B}/en`,{waitUntil:"networkidle"});
await p.locator("#reviews").scrollIntoViewIfNeeded();
await p.locator('#reviews button',{hasText:"Add a Review"}).first().click(); await p.waitForTimeout(400);
const dlg=await p.locator('[role="dialog"]').boundingBox();
ok("mobile: review dialog fits viewport", !!dlg && dlg.width<=375, dlg?`w=${Math.round(dlg.width)}`:"");
await ctx.close();

// ---- AR mobile nav ----
const arctx=await b.newContext({viewport:{width:375,height:800}});
const ap=await arctx.newPage();
await ap.goto(`${B}/ar`,{waitUntil:"networkidle"});
ok("AR mobile: html dir rtl", (await ap.getAttribute("html","dir"))==="rtl");
await ap.locator('button[aria-label="Open menu"]').click(); await ap.waitForTimeout(350);
ok("AR mobile: menu opens", await ap.locator('div.fixed.bg-brown').getByRole("link",{name:"احجز طاولة"}).isVisible());
await arctx.close();

// ---- Admin mobile (375, authed) ----
const actx=await b.newContext({viewport:{width:375,height:800}});
await actx.addCookies([{name:"bb_session",value:token,domain:"localhost",path:"/"}]);
const adp=await actx.newPage();
await adp.goto(`${B}/admin`,{waitUntil:"networkidle"});
ok("admin mobile: sidebar nav present", await adp.locator('a:has-text("Dashboard")').first().isVisible());
ok("admin mobile: dashboard no overflow", !(await adp.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)));
await adp.goto(`${B}/admin/reviews`,{waitUntil:"networkidle"}); await adp.waitForTimeout(600);
ok("admin mobile: reviews table renders", await adp.locator("table").isVisible());
ok("admin mobile: reviews no page-overflow", !(await adp.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)));
await adp.goto(`${B}/admin/reservations`,{waitUntil:"networkidle"}); await adp.waitForTimeout(600);
ok("admin mobile: reservations no page-overflow", !(await adp.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)));
await actx.close();

await b.close();
const f=res.filter(x=>!x.p).length;
console.log(`\n${res.length-f}/${res.length} passed`);
process.exit(f?1:0);
