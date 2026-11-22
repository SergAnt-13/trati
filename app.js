
var DEFE=[["🛒","Еда"],["☕","Кафе"],["🚕","Транспорт"],["🏠","Дом"],["🛍","Покупки"],["💊","Здоровье"],["🎬","Досуг"],["➕","Другое"]];
var DEFI=[["💼","Зарплата"],["🧾","Подработка"],["🎁","Подарок"],["💰","Проценты"],["➕","Другое"]];
var LK="trati_pwa_v1",entries=[],cats={exp:DEFE.slice(),inc:DEFI.slice()},type="exp",ctype="exp",cur=0,mode="all",anchor=new Date(),tab="add";
var MN=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
var MS=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
function $(i){return document.getElementById(i)}
function pad(n){return n<10?"0"+n:""+n}
function fmt(n){return (Math.round(n*100)/100).toLocaleString("ru-RU")}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function dstr(t){var d=new Date(t);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function mkey(t){var d=new Date(t);return d.getFullYear()+"-"+pad(d.getMonth()+1)}
function icon(t,n){var c=cats[t]||[];for(var i=0;i<c.length;i++)if(c[i][1]===n)return c[i][0];return "🔹"}
function fixCats(c){if(Array.isArray(c))c={exp:c,inc:DEFI};if(!c||!Array.isArray(c.exp)||!Array.isArray(c.inc))return null;
 function cl(a,d){var o=a.filter(function(x){return Array.isArray(x)&&x.length>1}).map(function(x){return[String(x[0]).slice(0,8),String(x[1]).slice(0,30)]});return o.length?o:d.slice()}
 return{exp:cl(c.exp,DEFE),inc:cl(c.inc,DEFI)}}
function cleanE(e){if(!e||typeof e!=="object")return null;var a=Number(e.amount),t=Number(e.ts),id=Number(e.id);if(!isFinite(a)||a<=0||!isFinite(t))return null;
 return{id:isFinite(id)?id:Math.floor(t+Math.random()*1e6),ts:t,amount:a,type:e.type==="inc"?"inc":"exp",cat:String(e.cat||"Другое").slice(0,40),note:String(e.note||"").slice(0,200)}}
function cs(s){s=String(s).replace(/[;\n\r]/g,",");return /^[=+\-@\t]/.test(s)?"'"+s:s}
var LKB="trati_pwa_lastbackup",corrupt=false;
function bkText(){var t=+localStorage.getItem(LKB)||0;return t?"Последний резерв: "+Math.floor((Date.now()-t)/864e5)+" дн. назад":"Резерв ещё не делали"}
try{var raw=localStorage.getItem(LK);if(raw){var r=JSON.parse(raw);entries=(r.entries||[]).map(cleanE).filter(Boolean);cats=fixCats(r.cats)||cats}}catch(e){corrupt=true;entries=[];try{localStorage.setItem(LK+"_corrupt",localStorage.getItem(LK))}catch(x){}}
function save(){try{localStorage.setItem(LK,JSON.stringify({entries:entries,cats:cats}));return true}catch(e){toast("⚠️ Не удалось сохранить: память браузера недоступна",4000);return false}}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
function toast(t,ms){var el=$("toast");el.textContent=t;el.style.opacity=1;setTimeout(function(){el.style.opacity=0},ms||1300)}
var undoT;function undo(e,added){var u=$("undo");u.innerHTML=(added?"Записано":"Запись удалена")+" · <b>Отменить</b>";u.style.opacity=1;u.style.pointerEvents="auto";clearTimeout(undoT);
 function hide(){u.style.opacity=0;u.style.pointerEvents="none"}
 u.onclick=function(){if(added)entries=entries.filter(function(x){return x!==e});else entries.push(e);save();renderAll();hide()};undoT=setTimeout(hide,5000)}
function seg(id,items,val,fn){var el=$(id);el.innerHTML="";items.forEach(function(x){var b=document.createElement("button");b.textContent=x[1];b.className=x[0]===val?"on":"";b.onclick=function(){fn(x[0])};el.appendChild(b)})}

/* периоды */
function sod(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function rng(m,a){var s,e,y=a.getFullYear(),mo=a.getMonth();
 if(m==="week"){s=sod(a);s.setDate(s.getDate()-(s.getDay()+6)%7);e=new Date(s);e.setDate(e.getDate()+7)}
 else if(m==="month"){s=new Date(y,mo,1);e=new Date(y,mo+1,1)}
 else if(m==="year"){s=new Date(y,0,1);e=new Date(y+1,0,1)}
 else{s=new Date(0);e=new Date(8.64e15)}
 return [s.getTime(),e.getTime()]}
function shift(d){if(mode==="week")anchor=new Date(anchor.getTime()+d*7*864e5);else if(mode==="month")anchor=new Date(anchor.getFullYear(),anchor.getMonth()+d,1);else if(mode==="year")anchor=new Date(anchor.getFullYear()+d,0,1);renderAll()}
function plabel(r){if(mode==="all")return "Всё время";if(mode==="year")return String(new Date(r[0]).getFullYear());if(mode==="month")return MN[new Date(r[0]).getMonth()]+" "+new Date(r[0]).getFullYear();
 var a=new Date(r[0]),b=new Date(r[1]-1);return a.getDate()+" "+MS[a.getMonth()]+" – "+b.getDate()+" "+MS[b.getMonth()]}
function inR(list,r){return list.filter(function(e){return e.ts>=r[0]&&e.ts<r[1]})}
function sums(l){var s={inc:0,exp:0};l.forEach(function(e){s[e.type]+=e.amount});return s}
function pct(c,p){if(!(p>0))return "нет данных за прошлый период";var d=Math.round(Math.abs(c-p)/p*100);return (c>=p?"+":"−")+d+"% к прошлому периоду ("+fmt(p)+")"}
function bars(by,tot,cls){var k=Object.keys(by).sort(function(a,b){return by[b]-by[a]});
 return k.map(function(c){return "<div class='bar' data-c='"+encodeURIComponent(c)+"'><div class='l'>"+esc(icon(cls==="g"?"inc":"exp",c))+" "+esc(c)+"</div><div class='t'><i class='"+cls+"' style='width:"+Math.round(by[c]/tot*100)+"%'></i></div><div class='v'>"+fmt(by[c])+"</div></div>"}).join("")}
function buckets(r,list){var b=[],map={},kf,d,i,now=new Date();
 function put(k,l){map[k]={l:l,inc:0,exp:0};b.push(map[k])}
 if(mode==="week"||mode==="month"){for(d=new Date(r[0]);d.getTime()<r[1];d.setDate(d.getDate()+1))put(dstr(d.getTime()),String(d.getDate()));kf=dstr}
 else if(mode==="year"){var y=new Date(r[0]).getFullYear();for(i=0;i<12;i++)put(y+"-"+pad(i+1),MS[i].charAt(0));kf=mkey}
 else if(list.length){var mn=Math.min.apply(null,list.map(function(e){return e.ts})),f=new Date(mn),n=(now.getFullYear()-f.getFullYear())*12+now.getMonth()-f.getMonth()+1;
  if(n>24){for(i=f.getFullYear();i<=now.getFullYear();i++)put(String(i),String(i).slice(2));kf=function(t){return String(new Date(t).getFullYear())}}
  else{for(i=0;i<n;i++){var m=new Date(f.getFullYear(),f.getMonth()+i,1);put(mkey(m.getTime()),MS[m.getMonth()].charAt(0))}kf=mkey}}
 else return [];
 list.forEach(function(e){var x=map[kf(e.ts)];if(x)x[e.type]+=e.amount});return b}
function chart(b){var mx=1;b.forEach(function(x){mx=Math.max(mx,x.inc,x.exp)});
 return "<div class='chart'>"+b.map(function(x,i){var sh=b.length<=13||i%5===0;return "<div class='col'><div class='bb'><i class='g' style='height:"+Math.round(x.inc/mx*100)+"%'></i><i style='height:"+Math.round(x.exp/mx*100)+"%'></i></div><em>"+(sh?x.l:"")+"</em></div>"}).join("")+"</div>"}

function renderOv(){var r=rng(mode,anchor),l=inR(entries,r),s=sums(l),h="",by={},bi={};
 l.forEach(function(e){if(e.type==="exp")by[e.cat]=(by[e.cat]||0)+e.amount;else bi[e.cat]=(bi[e.cat]||0)+e.amount});
 var bal=s.inc-s.exp;
 h+="<div class='card'><div class='mut'>Баланс</div><div class='big "+(bal>0?"inc":"")+"'>"+(bal>0?"+":bal<0?"−":"")+fmt(Math.abs(bal))+" ₽</div><div class='two'><div><span class='mut'>Доходы</span><b class='inc'>"+fmt(s.inc)+"</b></div><div><span class='mut'>Расходы</span><b>"+fmt(s.exp)+"</b></div></div>";
 if(mode!=="all"){var pr=[0,0];if(mode==="week")pr=rng("week",new Date(r[0]-864e5));else if(mode==="month")pr=rng("month",new Date(r[0]-864e5));else pr=rng("year",new Date(r[0]-864e5));var ps=sums(inR(entries,pr));
  h+="<div class='mut'>Расходы: "+pct(s.exp,ps.exp)+"</div><div class='mut'>Доходы: "+pct(s.inc,ps.inc)+"</div>";
  var cs=sums(entries.filter(function(e){return e.ts<r[0]})),cb=cs.inc-cs.exp;h+="<div class='mut' style='margin-top:6px'>Перенос с прошлых периодов: "+(cb<0?"−":"+")+fmt(Math.abs(cb))+" ₽ · итого с переносом: "+fmt(bal+cb)+" ₽</div>"}
 h+="</div>";
 var st=mode==="all"&&l.length?Math.min.apply(null,l.map(function(e){return e.ts})):r[0],en=Math.min(r[1],sod(new Date()).getTime()+864e5),days=Math.max(1,Math.ceil((en-st)/864e5));
 var big=l.filter(function(e){return e.type==="exp"}).sort(function(a,b){return b.amount-a.amount}).slice(0,5);
 if(!l.length){h+="<div class='card mut'>За этот период записей нет</div>";$("t-ov").innerHTML=h;return}
 h+="<div class='card'><h3>Динамика</h3>"+chart(buckets(r,l))+"<div class='mut' style='margin-top:6px'>Среднее в день: расходы "+fmt(s.exp/days)+(s.inc?" · доходы "+fmt(s.inc/days):"")+" · операций "+l.length+"</div></div>";
 if(s.exp)h+="<div class='card'><h3>Расходы по категориям</h3>"+bars(by,s.exp,"")+"</div>";
 if(s.inc)h+="<div class='card'><h3>Источники доходов</h3>"+bars(bi,s.inc,"g")+"</div>";
 if(big.length)h+="<div class='card'><h3>Крупнейшие траты</h3>"+big.map(rowH).join("")+"</div>";
 $("t-ov").innerHTML=h}
function rowH(e,del){var d=new Date(e.ts);return "<div class='row'><div class='i'>"+esc(icon(e.type,e.cat))+"</div><div class='m'>"+esc(e.cat)+(e.note?" · "+esc(e.note):"")+"<small>"+pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear()+"</small></div><div class='a "+(e.type==="inc"?"inc":"")+"'>"+(e.type==="inc"?"+":"")+fmt(e.amount)+"</div>"+(del===true?"<button class='x' data-a='e' data-id='"+e.id+"'>✎</button><button class='x' data-a='c' data-id='"+e.id+"'>⧉</button><button class='x' data-a='x' data-id='"+e.id+"'>✕</button>":"")+"</div>"}
function renderHi(){var q=($("q").value||"").toLowerCase(),l=inR(entries,rng(mode,anchor)).filter(function(e){return(!catF||e.cat===catF)&&(!q||(e.cat+" "+(e.note||"")).toLowerCase().indexOf(q)>=0)}).sort(function(a,b){return b.ts-a.ts}).slice(0,300);
 $("list").innerHTML=(catF?"<div class='mut' style='margin-bottom:6px'>Категория: "+esc(catF)+" <button class='x' id='clrF'>✕</button></div>":"")+(l.length?l.map(function(e){return rowH(e,true)}).join(""):"<span class='mut'>Записей нет</span>")}
function renderChips(){var c=$("chips");c.innerHTML="";cats[type].forEach(function(x,i){var b=document.createElement("button");b.className="chip"+(i===cur?" on":"");b.innerHTML="<span>"+esc(x[0])+"</span>"+esc(x[1]);b.onclick=function(){cur=i;renderChips()};c.appendChild(b)})}
function renderCatEd(){seg("ctypes",[["exp","Расходы"],["inc","Доходы"]],ctype,function(v){ctype=v;renderCatEd()});
 $("catList").innerHTML=cats[ctype].map(function(x,i){return "<div class='row'><div class='i'>"+esc(x[0])+"</div><div class='m'>"+esc(x[1])+"</div><button class='x' data-r='"+i+"'>✎</button><button class='x' data-i='"+i+"'>✕</button></div>"}).join("")}
function renderAll(){
 seg("modes",[["week","Неделя"],["month","Месяц"],["year","Год"],["all","Всё"]],mode,function(v){mode=v;renderAll()});
 var r=rng(mode,anchor);$("per").textContent=plabel(r);$("prev").style.visibility=$("next").style.visibility=mode==="all"?"hidden":"visible";
 $("csvPl").textContent=plabel(r);$("nav").style.display=(tab==="ov"||tab==="hi"||tab==="du")?"block":"none";
 seg("types",[["exp","Расход"],["inc","Доход"]],type,function(v){type=v;cur=0;renderChips();renderAll()});
 if(tab==="ov")renderOv();if(tab==="hi")renderHi();if(tab==="du")renderDu();if(tab==="add")renderSug()}
function setTab(t){if(t!=="add"&&editing)cancelEdit();tab=t;["add","ov","hi","du","more"].forEach(function(x){$("t-"+x).style.display=x===t?"block":"none"});
 var tb=$("tabs");tb.innerHTML="";[["add","＋","Запись"],["ov","◔","Обзор"],["hi","☰","История"],["du","≈","Дубли"],["more","⋯","Ещё"]].forEach(function(x){var b=document.createElement("button");b.className=x[0]===t?"on":"";b.innerHTML="<span>"+x[1]+"</span>"+x[2];b.onclick=function(){setTab(x[0])};tb.appendChild(b)});
 if(t==="more"){renderCatEd();$("bk").textContent=bkText();$("pinSt").textContent=localStorage.getItem(PK)?"включён":"выключен"}renderAll();window.scrollTo(0,0)}
$("prev").onclick=function(){shift(-1)};$("next").onclick=function(){shift(1)};
$("add").onclick=function(){var v=calc($("amt").value);if(!(v>0)){$("amt").focus();return}
 var dv=$("dt").value,ts=Date.now();if(dv&&dv!==dstr(ts)){var p=dv.split("-");ts=new Date(+p[0],+p[1]-1,+p[2],12,0).getTime()}
 if(editing){if(dv===dstr(editing.ts))ts=editing.ts;editing.ts=ts;editing.amount=v;editing.type=type;editing.cat=cats[type][cur][1];editing.note=$("note").value.trim();cancelEdit();save();toast("Изменено ✓");setTab("hi");return}
 entries.push({id:Date.now(),ts:ts,amount:v,type:type,cat:cats[type][cur][1],note:$("note").value.trim()});
 $("amt").value="";$("cp").textContent="";$("note").value="";$("dt").value=dstr(Date.now());if(save())toast(type==="inc"?"Доход записан":"Записано ✓");renderSug()};
$("list").onclick=function(ev){var t=ev.target,id=t.getAttribute("data-id"),a=t.getAttribute("data-a");if(t.id==="clrF"){catF="";renderAll();return}if(!id)return;
 var e=entries.filter(function(x){return String(x.id)===id})[0];if(!e)return;
 if(a==="x"){entries=entries.filter(function(x){return x!==e});save();renderAll();undo(e)}
 else if(a==="c"){entries.push({id:Date.now(),ts:Date.now(),amount:e.amount,type:e.type,cat:e.cat,note:e.note});save();renderAll();toast("Скопировано на сегодня")}
 else if(a==="e")editE(e)};
$("catList").onclick=function(ev){var r=ev.target.getAttribute("data-r"),i=ev.target.getAttribute("data-i");
 if(r!==null){var o=cats[ctype][+r][1],n=(prompt("Новое название",o)||"").trim().slice(0,30);if(!n||n===o)return;cats[ctype][+r][1]=n;entries.forEach(function(e){if(e.type===ctype&&e.cat===o)e.cat=n});save();renderChips();renderCatEd();return}
 if(i===null||cats[ctype].length<2)return;cats[ctype].splice(+i,1);cur=0;save();renderChips();renderCatEd()};
$("ca").onclick=function(){var n=$("cn").value.trim();if(!n)return;cats[ctype].push([$("ce").value.trim()||"🔹",n]);$("cn").value="";$("ce").value="";save();renderChips();renderCatEd()};

/* выгрузка */
function csv(l){return "дата;время;тип;сумма;категория;заметка\n"+l.slice().sort(function(a,b){return a.ts-b.ts}).map(function(e){var d=new Date(e.ts);return dstr(e.ts)+";"+pad(d.getHours())+":"+pad(d.getMinutes())+";"+(e.type==="inc"?"доход":"расход")+";"+e.amount+";"+cs(e.cat)+";"+cs(e.note||"")}).join("\n")}
function saveFile(name,text,t){var f=new File(["\ufeff"+text],name,{type:t});
 if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}
 else{var a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();a.remove()}}
$("csvP").onclick=function(){var r=rng(mode,anchor),n=mode==="all"?"all":dstr(r[0])+"_"+dstr(r[1]-1);saveFile("trati_"+n+".csv",csv(inR(entries,r)),"text/csv")};
$("csvA").onclick=function(){saveFile("trati_all_"+dstr(Date.now())+".csv",csv(entries),"text/csv")};
$("svJSON").onclick=function(){saveFile("trati-backup-"+dstr(Date.now())+".json",JSON.stringify({entries:entries,cats:cats}),"application/json");try{localStorage.setItem(LKB,String(Date.now()));$("bk").textContent=bkText()}catch(e){}};
$("cpAI").onclick=function(){var r=rng(mode,anchor),l=inR(entries,r),s=sums(l);
 var t="Вот мои финансы за период «"+plabel(r)+"»: доходы "+fmt(s.inc)+", расходы "+fmt(s.exp)+". Данные (дата;время;тип;сумма;категория;заметка) ниже. Проанализируй: куда уходит больше всего, есть ли необычные или повторяющиеся траты, как соотносятся доходы и расходы, и дай 3 конкретных совета.\n\n"+csv(l);
 var o=$("out");o.style.display="block";o.value=t;o.focus();o.select();try{document.execCommand("copy")}catch(e){}toast("Скопировано")};
$("imp").onclick=function(){$("file").click()};
$("file").onchange=function(){var f=this.files[0];if(!f)return;if(f.size>5e6){alert("Файл слишком большой");return}var rd=new FileReader();
 rd.onload=function(){try{var d=JSON.parse(String(rd.result).replace(/^\ufeff/,"")),seen={},n=0;if(!d||!Array.isArray(d.entries))throw 0;
  try{localStorage.setItem(LK+"_prev",JSON.stringify({entries:entries,cats:cats}))}catch(x){}
  entries.forEach(function(e){seen[e.id]=1});
  d.entries.map(cleanE).filter(Boolean).forEach(function(e){if(!seen[e.id]){seen[e.id]=1;entries.push(e);n++}});
  var c=fixCats(d.cats);if(c)["exp","inc"].forEach(function(t){c[t].forEach(function(x){if(!cats[t].some(function(y){return y[1]===x[1]}))cats[t].push(x)})});
  save();cur=0;renderChips();renderAll();toast("Добавлено записей: "+n)}catch(e){alert("Не удалось прочитать файл")}};rd.readAsText(f);this.value=""};

$("dt").value=dstr(Date.now());renderChips();setTab("add");
if(corrupt)setTimeout(function(){toast("⚠️ Данные повреждены, копия сохранена. Напиши мне, восстановим",6000)},600);
else if(entries.length>=10)setTimeout(function(){var t=+localStorage.getItem(LKB)||0;if(Date.now()-t>30*864e5)toast("Давно не было резерва: Ещё → Резерв",3500)},900);
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});

/* ---- новое: правка, калькулятор, drilldown, импорт CSV, код ---- */
var editing=null,catF="",PK="trati_pwa_pin",hid=0;
function cancelEdit(){editing=null;$("add").textContent="Записать";$("amt").value="";$("cp").textContent="";$("note").value="";$("dt").value=dstr(Date.now())}
function editE(e){setTab("add");editing=e;type=e.type;cur=Math.max(0,cats[type].map(function(c){return c[1]}).indexOf(e.cat));renderChips();
 $("amt").value=String(e.amount).replace(".",",");$("note").value=e.note||"";$("dt").value=dstr(e.ts);$("more").open=true;$("add").textContent="Сохранить изменения";renderAll()}
function calc(s){s=String(s).replace(/,/g,".").replace(/[×xX*]/g,"*").replace(/[÷:\/]/g,"/").replace(/−/g,"-").replace(/\s/g,"");if(!/^[\d.+\-*\/()]+$/.test(s))return NaN;var i=0;
 function E(){var v=T();while(s[i]==="+"||s[i]==="-"){var o=s[i++],r=T();v=o==="+"?v+r:v-r}return v}
 function T(){var v=F();while(s[i]==="*"||s[i]==="/"){var o=s[i++],r=F();v=o==="*"?v*r:v/r}return v}
 function F(){if(s[i]==="("){i++;var v=E();i++;return v}var j=i;while(i<s.length&&/[\d.]/.test(s[i]))i++;return parseFloat(s.slice(j,i))}
 try{var v=E();return i===s.length&&isFinite(v)&&v>0?Math.round(v*100)/100:NaN}catch(e){return NaN}}
(function(){var a=$("amt"),d=document.createElement("div"),p=document.createElement("span");d.style.cssText="display:flex;gap:6px;justify-content:center;align-items:center;margin:2px 0 4px";
 ["+","−","×","÷"].forEach(function(o){var b=document.createElement("button");b.textContent=o;b.style.cssText="padding:4px 14px;font-size:18px;border:1px solid var(--bd);border-radius:10px;background:none;color:var(--ac)";b.onclick=function(){a.value+=o;a.oninput()};d.appendChild(b)});
 p.id="cp";p.className="mut";d.appendChild(p);a.parentNode.insertBefore(d,a.nextSibling);
 a.oninput=function(){var s=a.value,v=calc(s);p.textContent=/[+\-−×÷*\/xX]/.test(s)&&v>0?"= "+fmt(v):""}})();
$("q").oninput=function(){renderHi()};
$("t-ov").onclick=function(ev){var b=ev.target.closest?ev.target.closest(".bar"):null;if(b&&b.getAttribute("data-c")){catF=decodeURIComponent(b.getAttribute("data-c"));setTab("hi")}};
$("impC").onclick=function(){$("fileC").click()};
$("fileC").onchange=function(){var f=this.files[0];if(!f||f.size>5e6)return;var rd=new FileReader();rd.onload=function(){var n=0,seen={};
 try{localStorage.setItem(LK+"_prev",JSON.stringify({entries:entries,cats:cats}))}catch(x){}
 entries.forEach(function(e){seen[e.ts+"|"+e.amount+"|"+e.cat+"|"+e.note]=1});
 String(rd.result).replace(/^\ufeff/,"").split(/\r?\n/).slice(1).forEach(function(l){var p=l.split(";");if(p.length<5)return;var d=p[0].split("-"),tm=(p[1]||"12:00").split(":"),
  e=cleanE({id:Date.now()+n,ts:new Date(+d[0],+d[1]-1,+d[2],+tm[0]||0,+tm[1]||0).getTime(),amount:parseFloat(String(p[3]).replace(",",".")),type:/^дох/i.test(p[2])?"inc":"exp",cat:p[4].replace(/^'/,"")||"Другое",note:p.slice(5).join(";").replace(/^'/,"")});
  if(!e)return;var k=e.ts+"|"+e.amount+"|"+e.cat+"|"+e.note;if(seen[k])return;seen[k]=1;
  if(!cats[e.type].some(function(c){return c[1]===e.cat}))cats[e.type].push(["🔹",e.cat]);entries.push(e);n++});
 save();cur=0;renderChips();renderAll();toast("Добавлено записей: "+n)};rd.readAsText(f);this.value=""};
async function sha(s){var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("trati:"+s));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
function showLock(){if(!localStorage.getItem(PK))return;var l=$("lock");
 if(!l){l=document.createElement("div");l.id="lock";l.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;z-index:99;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px";
  l.innerHTML="<div style='font-size:42px'>🔒</div><div id='lm' class='mut'>Введите код</div><input id='lp' type='password' inputmode='numeric' maxlength='6' style='width:190px;text-align:center;font-size:28px;letter-spacing:8px'>";document.body.appendChild(l);
  $("lp").oninput=async function(){var v=this.value;if(v.length<4)return;if(await sha(v)===localStorage.getItem(PK)){l.style.display="none";this.value="";$("lm").textContent="Введите код"}else if(v.length>=6){this.value="";$("lm").textContent="Неверный код"}}}
 l.style.display="flex";$("lp").focus()}
document.addEventListener("visibilitychange",function(){if(document.hidden)hid=Date.now();else if(hid&&Date.now()-hid>60000)showLock()});
$("pinSet").onclick=async function(){var p=prompt("Новый код: 4–6 цифр.\nЕсли забудешь код, войти можно будет только со сбросом данных приложения, поэтому делай резерв.");if(p===null)return;if(!/^\d{4,6}$/.test(p)){alert("Нужно 4–6 цифр");return}
 try{localStorage.setItem(PK,await sha(p))}catch(e){}$("pinSt").textContent="включён";toast("Код установлен")};
$("pinOff").onclick=function(){if(localStorage.getItem(PK)&&confirm("Убрать код?")){localStorage.removeItem(PK);$("pinSt").textContent="выключен"}};
showLock();

/* ---- поиск дублей ---- */
var duW=10,duT=0,duC=true,duGs=[],NDK="trati_pwa_nodup";
function nodup(){try{return JSON.parse(localStorage.getItem(NDK)||"[]")}catch(e){return[]}}
function r2(x){return Math.round(x*100)/100}
function dups(list){var ig=nodup(),s=list.slice().sort(function(a,b){return a.ts-b.ts}),p=s.map(function(_,i){return i});
 function f(i){while(p[i]!==i){p[i]=p[p[i]];i=p[i]}return i}
 for(var i=0;i<s.length;i++)for(var j=i+1;j<s.length&&s[j].ts-s[i].ts<=duW*6e4;j++){var a=s[i],b=s[j];
  if(a.type!==b.type||(duC&&a.cat!==b.cat))continue;var x=r2(a.amount),y=r2(b.amount);
  if(duT===0?x===y:Math.abs(x-y)<=Math.max(.01,Math.max(x,y)*duT/100))p[f(j)]=f(i)}
 var g={};s.forEach(function(e,i){var k=f(i);(g[k]=g[k]||[]).push(e)});
 return Object.keys(g).map(function(k){return g[k]}).filter(function(a){return a.length>1&&ig.indexOf(a.map(function(e){return e.id}).join(","))<0})}
function renderDu(){var gs=dups(inR(entries,rng(mode,anchor))),se=0,si=0,ex=0,ig=nodup().length;duGs=gs;
 gs.forEach(function(a){a.slice(1).forEach(function(e){ex++;if(e.type==="inc")si+=e.amount;else se+=e.amount})});
 var h="<div class='card'><h3>Как искать</h3><div class='mut' style='margin-bottom:4px'>Время между записями</div><div class='seg' id='duW'></div><div class='mut' style='margin-bottom:4px'>Разница в сумме (после округления до сотых)</div><div class='seg' id='duT'></div><div class='seg' style='margin-bottom:0' id='duC'></div></div>";
 h+="<div class='card'><div class='mut'>Подозрительных групп: "+gs.length+" · лишних записей: "+ex+"</div>"+(ex?"<div class='big'>"+(se?fmt(se):fmt(si))+"</div><div class='mut'>"+(se?"расходов":"доходов")+(se&&si?" (и доходов "+fmt(si)+")":"")+" могли записать дважды</div>":"<div class='mut'>Похожих записей не найдено</div>")+"</div>";
 gs.forEach(function(a,gi){h+="<div class='card'><h3>×"+a.length+" · "+fmt(a[0].amount)+"</h3>"+a.map(function(e){var d=new Date(e.ts);
  return "<div class='row'><div class='i'>"+esc(icon(e.type,e.cat))+"</div><div class='m'>"+esc(e.cat)+(e.note?" · "+esc(e.note):"")+"<small>"+pad(d.getDate())+"."+pad(d.getMonth()+1)+" "+pad(d.getHours())+":"+pad(d.getMinutes())+"</small></div><div class='a "+(e.type==="inc"?"inc":"")+"'>"+fmt(e.amount)+"</div><button class='x' data-did='"+e.id+"'>✕</button></div>"}).join("")
  +"<button class='btn' data-keep='"+gi+"'>Оставить первую, остальные удалить</button><button class='btn' data-ok='"+a.map(function(e){return e.id}).join(",")+"'>Это не дубль</button></div>"});
 if(ig)h+="<button class='btn' id='duRst'>Сбросить пометки «не дубль» ("+ig+")</button>";
 $("t-du").innerHTML=h;
 seg("duW",[[10,"10 мин"],[60,"1 час"],[1440,"1 день"]],duW,function(v){duW=v;renderDu()});
 seg("duT",[[0,"точно"],[1,"±1%"],[5,"±5%"]],duT,function(v){duT=v;renderDu()});
 seg("duC",[[true,"та же категория"],[false,"любая"]],duC,function(v){duC=v;renderDu()})}
$("t-du").onclick=function(ev){var t=ev.target,d=t.getAttribute("data-did"),k=t.getAttribute("data-keep"),o=t.getAttribute("data-ok");
 if(d){var e=entries.filter(function(x){return String(x.id)===d})[0];if(e){entries=entries.filter(function(x){return x!==e});save();renderDu();undo(e)}}
 else if(k!==null){var a=duGs[+k];if(a&&confirm("Удалить записей: "+(a.length-1)+"?")){try{localStorage.setItem(LK+"_prev",JSON.stringify({entries:entries,cats:cats}))}catch(x){}
  var del={};a.slice(1).forEach(function(e){del[e.id]=1});entries=entries.filter(function(e){return !del[e.id]});save();renderDu();toast("Удалено: "+(a.length-1))}}
 else if(o){var n=nodup();n.push(o);try{localStorage.setItem(NDK,JSON.stringify(n))}catch(x){}renderDu()}
 else if(t.id==="duRst"){try{localStorage.removeItem(NDK)}catch(x){}renderDu()}};

/* ---- быстрый ввод: частые варианты, итоги на главной, клавиатура ---- */
var sm="all";try{if(localStorage.getItem("trati_pwa_sm")==="month")sm="month"}catch(e){}
function sugs(){var now=Date.now(),m={};entries.forEach(function(e){if(e.type!==type)return;var k=e.cat+"|"+e.amount,o=m[k]||(m[k]={cat:e.cat,amount:e.amount,n:0,last:0});if(e.ts>now-90*864e5)o.n++;o.last=Math.max(o.last,e.ts)});
 return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.n-a.n||b.last-a.last}).slice(0,6)}
function renderStrip(){var s=sums(inR(entries,rng(sm,new Date()))),b=s.inc-s.exp;
 $("mstrip").innerHTML="<div class='seg' id='sm'></div><div class='mut'>Баланс</div><div class='big "+(b>0?"inc":"")+"'>"+(b<0?"−":b>0?"+":"")+fmt(Math.abs(b))+" ₽</div><div class='two'><div><span class='mut'>Доходы</span><b class='inc'>"+fmt(s.inc)+"</b></div><div><span class='mut'>Расходы</span><b>"+fmt(s.exp)+"</b></div></div>";
 seg("sm",[["month","Этот месяц"],["all","Всё время"]],sm,function(v){sm=v;try{localStorage.setItem("trati_pwa_sm",v)}catch(e){}renderStrip()})}
function renderSug(){$("sug").innerHTML=sugs().map(function(o,i){return "<button data-s='"+i+"'>"+esc(icon(type,o.cat))+" "+esc(o.cat)+" "+fmt(o.amount)+"</button>"}).join("");renderStrip()}
$("sug").onclick=function(ev){var i=ev.target.getAttribute("data-s");if(i===null)return;var o=sugs()[+i];if(!o)return;
 var e={id:Date.now(),ts:Date.now(),amount:o.amount,type:type,cat:o.cat,note:""};entries.push(e);if(save())undo(e,true);renderSug()};
if(window.visualViewport){var kbd=function(){document.body.classList.toggle("kb",visualViewport.height<window.innerHeight-120)};visualViewport.addEventListener("resize",kbd)}
$("amt").addEventListener("focus",function(){setTimeout(function(){window.scrollTo(0,0)},120)});
renderSug();
