// build time: Mon Oct 09 2023 16:05:28 GMT+0800 (中国标准时间) 
class t{constructor({path:t="",unescape:e=false,top_n_per_article:n=1}){this.path=t;this.unescape=e;this.top_n_per_article=n;this.isfetched=false;this.datas=null}getIndexByWord(t,e,n=false){const s=[];const o=new Set;if(!n){e=e.toLowerCase()}t.forEach((t=>{if(this.unescape){const e=document.createElement("div");e.innerText=t;t=e.innerHTML}const i=t.length;if(i===0)return;let r=0;let c=-1;if(!n){t=t.toLowerCase()}while((c=e.indexOf(t,r))>-1){s.push({position:c,word:t});o.add(t);r=c+i}}));s.sort(((t,e)=>{if(t.position!==e.position){return t.position-e.position}return e.word.length-t.word.length}));return[s,o]}mergeIntoSlice(t,e,n){let s=n[0];let{position:o,word:i}=s;const r=[];const c=new Set;while(o+i.length<=e&&n.length!==0){c.add(i);r.push({position:o,length:i.length});const t=o+i.length;n.shift();while(n.length!==0){s=n[0];o=s.position;i=s.word;if(t>o){n.shift()}else{break}}}return{hits:r,start:t,end:e,count:c.size}}highlightKeyword(t,e){let n="";let s=e.start;for(const{position:o,length:i}of e.hits){n+=t.substring(s,o);s=o+i;n+=`<mark class="search-keyword">${t.substr(o,i)}</mark>`}n+=t.substring(s,e.end);return n}getResultItems(t){const e=[];this.datas.forEach((({title:n,content:s,url:o})=>{const[i,r]=this.getIndexByWord(t,n);const[c,l]=this.getIndexByWord(t,s);const a=new Set([...r,...l]).size;const h=i.length+c.length;if(h===0)return;const d=[];if(i.length!==0){d.push(this.mergeIntoSlice(0,n.length,i))}let u=[];while(c.length!==0){const t=c[0];const{position:e}=t;const n=Math.max(0,e-20);const o=Math.min(s.length,e+100);u.push(this.mergeIntoSlice(n,o,c))}u.sort(((t,e)=>{if(t.count!==e.count){return e.count-t.count}else if(t.hits.length!==e.hits.length){return e.hits.length-t.hits.length}return t.start-e.start}));const g=parseInt(this.top_n_per_article,10);if(g>=0){u=u.slice(0,g)}let p="";o=new URL(o,location.origin);o.searchParams.append("highlight",t.join(" "));if(d.length!==0){p+=`<div class="local-search-hit-item"><a href="${o.href}"><span class="search-result-title">${this.highlightKeyword(n,d[0])}</span>`}else{p+=`<div class="local-search-hit-item"><a href="${o.href}"><span class="search-result-title">${n}</span>`}u.forEach((t=>{p+=`<p class="search-result">${this.highlightKeyword(s,t)}...</p></a>`}));p+="</div>";e.push({item:p,id:e.length,hitCount:h,includedCount:a})}));return e}fetchData(){const t=!this.path.endsWith("json");fetch(this.path).then((t=>t.text())).then((e=>{this.isfetched=true;this.datas=t?[...(new DOMParser).parseFromString(e,"text/xml").querySelectorAll("entry")].map((t=>({title:t.querySelector("title").textContent,content:t.querySelector("content").textContent,url:t.querySelector("url").textContent}))):JSON.parse(e);this.datas=this.datas.filter((t=>t.title)).map((t=>{t.title=t.title.trim();t.content=t.content?t.content.trim().replace(/<[^>]+>/g,""):"";t.url=decodeURIComponent(t.url).replace(/\/{2,}/g,"/");return t}));window.dispatchEvent(new Event("search:loaded"))}))}highlightText(t,e,n){const s=t.nodeValue;let o=e.start;const i=[];for(const{position:t,length:r}of e.hits){const e=document.createTextNode(s.substring(o,t));o=t+r;const c=document.createElement("mark");c.className=n;c.appendChild(document.createTextNode(s.substr(t,r)));i.push(e,c)}t.nodeValue=s.substring(o,e.end);i.forEach((e=>{t.parentNode.insertBefore(e,t)}))}highlightSearchWords(t){const e=new URL(location.href).searchParams.get("highlight");const n=e?e.split(" "):[];if(!n.length||!t)return;const s=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,null);const o=[];while(s.nextNode()){if(!s.currentNode.parentNode.matches("button, select, textarea, .mermaid"))o.push(s.currentNode)}o.forEach((t=>{const[e]=this.getIndexByWord(n,t.nodeValue);if(!e.length)return;const s=this.mergeIntoSlice(0,t.nodeValue.length,e);this.highlightText(t,s,"search-keyword")}))}}window.addEventListener("load",(()=>{const{path:e,top_n_per_article:n,unescape:s,languages:o}=GLOBAL_CONFIG.localSearch;const i=new t({path:e,top_n_per_article:n,unescape:s});const r=document.querySelector("#local-search-input input");const c=document.getElementById("local-search-stats-wrap");const l=document.getElementById("loading-status");const a=()=>{if(!i.isfetched)return;const t=r.value.trim().toLowerCase();if(t!=="")l.innerHTML='<i class="fas fa-spinner fa-pulse"></i>';const e=t.split(/[-\s]+/);const n=document.getElementById("local-search-results");let s=[];if(t.length>0){s=i.getResultItems(e)}if(e.length===1&&e[0]===""){n.classList.add("no-result");n.textContent=""}else if(s.length===0){n.textContent="";c.innerHTML=`<div class="search-result-stats">${o.hits_empty.replace(/\$\{query}/,t)}</div>`}else{s.sort(((t,e)=>{if(t.includedCount!==e.includedCount){return e.includedCount-t.includedCount}else if(t.hitCount!==e.hitCount){return e.hitCount-t.hitCount}return e.id-t.id}));const t=o.hits_stats.replace(/\$\{hits}/,s.length);n.classList.remove("no-result");n.innerHTML=`<div class="search-result-list">${s.map((t=>t.item)).join("")}</div>`;c.innerHTML=`<hr><div class="search-result-stats">${t}</div>`;window.pjax&&window.pjax.refresh(n)}l.textContent=""};let h=false;const d=document.getElementById("search-mask");const u=document.querySelector("#local-search .search-dialog");const g=()=>{if(window.innerWidth<768){u.style.setProperty("--search-height",window.innerHeight+"px")}};const p=()=>{const t=document.body.style;t.width="100%";t.overflow="hidden";btf.animateIn(d,"to_show 0.5s");btf.animateIn(u,"titleScale 0.5s");setTimeout((()=>{r.focus()}),300);if(!h){!i.isfetched&&i.fetchData();r.addEventListener("input",a);h=true}document.addEventListener("keydown",(function t(e){if(e.code==="Escape"){m();document.removeEventListener("keydown",t)}}));g();window.addEventListener("resize",g)};const m=()=>{const t=document.body.style;t.width="";t.overflow="";btf.animateOut(u,"search_close .5s");btf.animateOut(d,"to_hide 0.5s");window.removeEventListener("resize",g)};const f=()=>{document.querySelector("#search-button > .search").addEventListener("click",p)};const w=()=>{document.querySelector("#local-search .search-close-button").addEventListener("click",m);d.addEventListener("click",m);if(GLOBAL_CONFIG.localSearch.preload){i.fetchData()}i.highlightSearchWords(document.getElementById("article-container"))};window.addEventListener("search:loaded",(()=>{const t=document.getElementById("loading-database");t.nextElementSibling.style.display="block";t.remove()}));f();w();window.addEventListener("pjax:complete",(()=>{!btf.isHidden(d)&&m();i.highlightSearchWords(document.getElementById("article-container"));f()}))}));
//rebuild by hexo-renderer-multi-next-markdown-it 