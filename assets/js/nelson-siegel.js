(function () {
  const root = document.getElementById("ns-explorer");
  if (!root) return;

  const ids = { beta0:"ns-b0", beta1:"ns-b1", beta2:"ns-b2", lambda:"ns-lambda" };
  const defaults = { beta0:5, beta1:-2.4, beta2:2.8, lambda:.55 };
  let view = "curve";
  const svg = document.getElementById("ns-svg");
  const ns = "http://www.w3.org/2000/svg";

  function params() { return Object.fromEntries(Object.entries(ids).map(([k,id]) => [k, Number(document.getElementById(id).value)])); }
  function l1(t, lambda) { const x=lambda*t; return x===0 ? 1 : (1-Math.exp(-x))/x; }
  function l2(t, lambda) { return l1(t,lambda)-Math.exp(-lambda*t); }
  function y(t,p) { return p.beta0+p.beta1*l1(t,p.lambda)+p.beta2*l2(t,p.lambda); }
  function el(name, attrs, text) { const n=document.createElementNS(ns,name); Object.entries(attrs||{}).forEach(([k,v])=>n.setAttribute(k,v)); if(text!=null)n.textContent=text; return n; }
  function format(n) { return n.toFixed(2).replace("-","−"); }

  function draw() {
    const p=params(), W=720, H=400, m={l:55,r:18,t:25,b:42};
    const series=Array.from({length:121},(_,i)=>{const t=.25+i*29.75/120;return {t,y:y(t,p),level:1,slope:l1(t,p.lambda),curvature:l2(t,p.lambda)}});
    const keys=view==="curve"?["y"]:["level","slope","curvature"];
    const values=series.flatMap(d=>keys.map(k=>d[k]));
    let ymin=Math.min(...values), ymax=Math.max(...values); const pad=Math.max((ymax-ymin)*.15,.2); ymin-=pad;ymax+=pad;
    const X=t=>m.l+(t/30)*(W-m.l-m.r), Y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
    svg.innerHTML="";
    for(let i=0;i<=5;i++){const v=ymin+i*(ymax-ymin)/5, yy=Y(v);svg.append(el("line",{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:"#d7dce2","stroke-dasharray":"3 5"}));svg.append(el("text",{x:m.l-10,y:yy+4,"text-anchor":"end",fill:"#78828c","font-size":"12"},view==="curve"?v.toFixed(1)+"%":v.toFixed(1)));}
    [0,5,10,15,20,25,30].forEach(t=>{svg.append(el("text",{x:X(t),y:H-14,"text-anchor":"middle",fill:"#78828c","font-size":"12"},t+"y"));});
    const colors={y:"#24547e",level:"#24547e",slope:"#2c857d",curvature:"#ca7838"};
    keys.forEach(k=>{const d=series.map((r,i)=>(i?"L":"M")+X(r.t).toFixed(2)+","+Y(r[k]).toFixed(2)).join(" ");svg.append(el("path",{d,fill:"none",stroke:colors[k],"stroke-width":k==="y"?4:3,"stroke-linecap":"round"}));});
    if(view==="curve"){const xx=X(Math.min(1.793/p.lambda,30));svg.append(el("line",{x1:xx,y1:m.t,x2:xx,y2:H-m.b,stroke:"#ca7838","stroke-dasharray":"5 5"}));}
    document.getElementById("ns-short").textContent=format(p.beta0+p.beta1)+"%";
    document.getElementById("ns-long").textContent=format(p.beta0)+"%";
    document.getElementById("ns-peak").textContent=(1.793/p.lambda).toFixed(2)+" years";
    Object.entries(ids).forEach(([k,id])=>document.getElementById(id+"-out").textContent=format(p[k]));
  }

  Object.values(ids).forEach(id=>document.getElementById(id).addEventListener("input",draw));
  root.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{view=btn.dataset.view;root.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b===btn));draw();}));
  root.querySelector(".ns-reset").addEventListener("click",()=>{Object.entries(ids).forEach(([k,id])=>document.getElementById(id).value=defaults[k]);draw();});
  draw();
})();
