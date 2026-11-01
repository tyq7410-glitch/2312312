const API="https://bymykel.github.io/CSGO-API/api/en/";
let all=[], currentPage=1, pageSize=60, fastMode=localStorage.getItem("aurora-fast-mode")==="1", favorites=new Set(JSON.parse(localStorage.getItem("aurora-favs")||"[]")), loadouts=JSON.parse(localStorage.getItem("aurora-loadouts")||"[]"), page="catalog";
const $=id=>document.getElementById(id);
const rarityColors={"Consumer Grade":"#b0c3d9","Industrial Grade":"#5e98d9","Mil-Spec Grade":"#4b69ff","Restricted":"#8847ff","Classified":"#d32ce6","Covert":"#eb4b4b","Extraordinary":"#e4ae39"};
function norm(x){return String(x||"").toLowerCase()}
function categoryOf(s){let c=norm(s.category?.name||s.category||"");let w=norm(s.weapon?.name||s.weapon||"");let n=norm(s.name);if(c.includes("knife")||n.includes("knife")||n.includes("bayonet")||n.includes("karambit")||n.includes("daggers"))return "knife";if(c.includes("glove")||n.includes("gloves"))return "glove";if(c.includes("agent")||n.includes("agent"))return "agent";if(w.includes("sniper")||w.includes("awp")||w.includes("ssg")||w.includes("scar")||w.includes("g3sg"))return "sniper";if(w.includes("pistol")||["glock","usp","p2000","p250","five-seven","tec-9","cz75","dual berettas","desert eagle","r8 revolver"].some(t=>w.includes(t)))return "pistol";if(w.includes("smg")||["mp9","mac-10","mp7","mp5","ump","p90","pp-bizon"].some(t=>w.includes(t)))return "smg";if(w.includes("shotgun")||["nova","xm1014","mag-7","sawed-off"].some(t=>w.includes(t)))return "shotgun";if(w.includes("machinegun")||w.includes("m249")||w.includes("negev"))return "machinegun";return "rifle"}
function rarityName(s){return s.rarity?.name||s.rarity||"Unknown"}
function imageOf(s){return s.image||s.image_url||""}
function weaponOf(s){return s.weapon?.name||s.weapon||s.category?.name||"CS2"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function loadCatalog(){
 $("grid").innerHTML='<div class="loading">Завантажуємо повний каталог…</div>';
 try{
  const [skins,gloves,agents]=await Promise.all([
   fetch(API+"skins.json").then(r=>{if(!r.ok)throw Error();return r.json()}),
   fetch(API+"gloves.json").then(r=>r.ok?r.json():[]).catch(()=>[]),
   fetch(API+"agents.json").then(r=>r.ok?r.json():[]).catch(()=>[])
  ]);
  // Merge complete public datasets; remove duplicates by stable item id/name.
  const merged=[...(Array.isArray(skins)?skins:(skins.items||[])),...(Array.isArray(gloves)?gloves:(gloves.items||[])),...(Array.isArray(agents)?agents:(agents.items||[]))];
  const unique=new Map();
  for(const item of merged){if(item && item.name){const key=String(item.id||item.name);if(!unique.has(key))unique.set(key,item);}}
  all=[...unique.values()];
  $("source").textContent="Повний доступний набір community catalog • предмети показуються сторінками";
  currentPage=1;render();
 }catch(e){
  $("grid").innerHTML='<div class="loading">Не вдалося завантажити онлайн-каталог. Перевір інтернет і натисни ↻. Сам інтерфейс працює локально.</div>';
  $("count").textContent="Каталог недоступний";
 }
}
function filtered(){
 let q=norm($("search").value),cat=$("category").value,rar=$("rarity").value;
 let a=all.filter(s=>(!q||norm(s.name).includes(q)||norm(weaponOf(s)).includes(q))&&(cat==="all"||categoryOf(s)===cat)&&(rar==="all"||rarityName(s)===rar));
 if($("sort").value==="rarity")a.sort((x,y)=>Object.keys(rarityColors).indexOf(rarityName(y))-Object.keys(rarityColors).indexOf(rarityName(x)));
 else a.sort((x,y)=>String(x.name).localeCompare(String(y.name)));
 return a;
}
function card(s){
 let id=s.id||s.name,img=imageOf(s),rar=rarityName(s),fav=favorites.has(id);
 return `<article class="skin-card"><div class="skin-img">${img?`<img loading="lazy" src="${esc(img)}" alt="${esc(s.name)}" onerror="this.style.display='none'">`:'<span class="placeholder">✦</span>'}<button class="star ${fav?'on':''}" data-fav="${esc(id)}" title="Обране">${fav?'★':'☆'}</button><div class="rarity-line" style="--rarity:${rarityColors[rar]||'#8b93a8'}"></div></div><div class="skin-info"><small>${esc(weaponOf(s))}</small><h3 title="${esc(s.name)}">${esc(s.name||"Unknown item")}</h3><p>${esc(rar)}</p></div><div class="card-actions"><button class="mini-btn" data-view="${esc(id)}">Переглянути</button><button class="mini-btn" data-add="${esc(id)}">＋ У набір</button></div></article>`;
}
function render(){
 let a=filtered(), pages=Math.max(1,Math.ceil(a.length/pageSize));
 currentPage=Math.min(currentPage,pages);
 const start=(currentPage-1)*pageSize, visible=a.slice(start,start+pageSize);
 $("count").textContent=`Знайдено ${a.length.toLocaleString("uk-UA")} предметів • показано ${visible.length.toLocaleString("uk-UA")}`;
 $("grid").innerHTML=visible.map(card).join("")||'<div class="loading">Нічого не знайдено. Спробуй інший пошук.</div>';
 $("pageInfo").textContent=`Сторінка ${currentPage} із ${pages}`;
 $("prevPage").disabled=currentPage<=1;$("nextPage").disabled=currentPage>=pages;
}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2100)}
function find(id){return all.find(s=>String(s.id||s.name)===String(id))}
function showDetail(s){
 const img=imageOf(s),rar=rarityName(s);
 $("modalContent").innerHTML=`<div class="detail"><div class="detail-visual">${img?`<img src="${esc(img)}" alt="${esc(s.name)}">`:'<span class="placeholder">✦</span>'}</div><div><div class="eyebrow purple">ITEM INSPECTOR</div><h2>${esc(s.name)}</h2><p>${esc(weaponOf(s))} · ${esc(rar)}</p><label>Знос (float)</label><input id="float" type="number" min="0" max="1" step="0.0001" value="${Number(s.min_float??0).toFixed(4)}"><label>Pattern / seed</label><input id="seed" type="number" min="0" max="1000" value="0"><label><input id="stattrak" type="checkbox" style="width:auto"> StatTrak (візуальна позначка)</label><button class="primary" id="saveItem">＋ Додати до набору</button><p>Це візуальний інспектор каталогу, не змінює предмет у грі.</p></div></div>`;
 $("saveItem").onclick=()=>{addToLoadout(s);$("modal").hidden=true};
 $("modal").hidden=false;
}
function addToLoadout(s){
 if(!loadouts.length){loadouts.push({name:"Мій перший набір",items:[]})}
 let l=loadouts[0];if(!l.items.includes(s.id||s.name))l.items.push(s.id||s.name);
 saveLoadouts();toast("Додано до набору «"+l.name+"»");
}
function saveLoadouts(){localStorage.setItem("aurora-loadouts",JSON.stringify(loadouts));renderLoadouts()}
function renderLoadouts(){
 $("loadouts").innerHTML=loadouts.map((l,i)=>`<div class="loadout"><div class="eyebrow purple">LOADOUT ${String(i+1).padStart(2,"0")}</div><h3>${esc(l.name)}</h3><p>${l.items.length} предметів у наборі</p><button class="mini-btn" data-openload="${i}">Переглянути склад</button> <button class="mini-btn" data-deleteload="${i}">Видалити</button></div>`).join("")||'<div class="loading">Поки немає наборів. Додай предмети з каталогу.</div>';
}
function renderFavs(){$("favGrid").innerHTML=all.filter(s=>favorites.has(s.id||s.name)).map(card).join("")||'<div class="loading">Тут з’являться твої улюблені скіни.</div>'}
function changePage(p){
 page=p;document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===p));
 $("catalogPage").hidden=p!=="catalog";$("loadoutPage").hidden=p!=="loadout";$("favoritesPage").hidden=p!=="favorites";
 $("pageTitle").textContent=p==="catalog"?"Каталог скінів":p==="loadout"?"Мої набори":"Обране";
 if(p==="loadout")renderLoadouts();if(p==="favorites")renderFavs();
}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>changePage(b.dataset.page));
["search","category","rarity","sort"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",()=>{currentPage=1;render()}));
$("prevPage").onclick=()=>{if(currentPage>1){currentPage--;render();window.scrollTo({top:0,behavior:fastMode?"auto":"smooth"})}};
$("nextPage").onclick=()=>{currentPage++;render();window.scrollTo({top:0,behavior:fastMode?"auto":"smooth"})};
function applyFastMode(){
 document.body.classList.toggle("fast-mode",fastMode);
 $("fastMode").classList.toggle("enabled",fastMode);
 $("fastMode").textContent=fastMode?"⚡ Швидкий режим: УВІМК":"⚡ Швидкий режим: ВИМК";
}
$("fastMode").onclick=()=>{fastMode=!fastMode;localStorage.setItem("aurora-fast-mode",fastMode?"1":"0");applyFastMode();toast(fastMode?"Швидкий режим увімкнено":"Звичайний режим увімкнено")};
applyFastMode();
$("refresh").onclick=loadCatalog;$("closeModal").onclick=()=>$("modal").hidden=true;
$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").hidden=true};
$("grid").addEventListener("click",e=>{
 let f=e.target.closest("[data-fav]");if(f){let id=f.dataset.fav;favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem("aurora-favs",JSON.stringify([...favorites]));render();return}
 let v=e.target.closest("[data-view]");if(v){let s=find(v.dataset.view);if(s)showDetail(s);return}
 let a=e.target.closest("[data-add]");if(a){let s=find(a.dataset.add);if(s)addToLoadout(s)}
});
$("favGrid").addEventListener("click",e=>{let f=e.target.closest("[data-fav]");if(f){favorites.delete(f.dataset.fav);localStorage.setItem("aurora-favs",JSON.stringify([...favorites]));renderFavs();return}let v=e.target.closest("[data-view]");if(v){let s=find(v.dataset.view);if(s)showDetail(s)}});
$("newLoadout").onclick=()=>{let name=prompt("Назва нового набору:","Мій loadout");if(name){loadouts.push({name,items:[]});saveLoadouts()}};
$("loadouts").addEventListener("click",e=>{
 let d=e.target.closest("[data-deleteload]");if(d){loadouts.splice(+d.dataset.deleteload,1);saveLoadouts();return}
 let o=e.target.closest("[data-openload]");if(o){let l=loadouts[+o.dataset.openload];let names=l.items.map(id=>find(id)?.name||id);alert(l.name+"\\n\\n"+(names.join("\\n")||"Набір порожній"))}
});
loadCatalog();renderLoadouts();
