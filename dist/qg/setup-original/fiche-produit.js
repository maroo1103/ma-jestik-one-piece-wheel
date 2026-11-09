/* Fiches produit statiques — dialog natif (focus, Échap) + catalogue commun aux deux pages. */
import {MATERIAL,ORIGINAL_SETUP_PHOTO,PC_COMPONENT_IDS} from "./materiel.js?v=20261109-modal2";
const SVG_NS="http://www.w3.org/2000/svg";
let modal=null,lastTrigger=null;
const node=(tag,cls,text)=>{
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=text;
 return element;
};
function emptyVisual(item,short=false){
 const frame=node("div",short?"mj-photo-missing mj-photo-missing-small":"mj-photo-missing");
 frame.setAttribute("role","img");
 frame.setAttribute("aria-label","Photographie à ajouter pour "+item.name);
 frame.append(node("span","mj-photo-placeholder-icon","◇"));
 frame.append(node("strong",null,"PHOTO À AJOUTER"));
 if(!short)frame.append(node("small",null,item.name));
 return frame;
}
function photoElement(item,{small=false}={}){
 const visual=node("div","mj-photo-surface");
 const info=item.image;
 if(!info){visual.append(emptyVisual(item,small));return visual;}
 if(info.kind==="owned-webp"){
  const photo=node("img","mj-owned-photo");
  photo.src=new URL(info.src,document.baseURI).href;photo.alt=info.alt;photo.loading="lazy";photo.decoding="async";
  photo.addEventListener("error",()=>visual.replaceChildren(emptyVisual(item,small)),{once:true});
  visual.append(photo);return visual;
 }
 if(info.kind==="setup-crop"){
  const svg=document.createElementNS(SVG_NS,"svg");
  const [x,y,w,h]=info.area;
  svg.setAttribute("viewBox",[x,y,w,h].join(" "));
  svg.setAttribute("preserveAspectRatio","xMidYMid slice");
  svg.setAttribute("role","img");svg.setAttribute("aria-label",info.alt);
  svg.classList.add("mj-setup-crop");
  const image=document.createElementNS(SVG_NS,"image");
  image.setAttribute("href",ORIGINAL_SETUP_PHOTO);
  image.setAttribute("x","0");image.setAttribute("y","0");
  image.setAttribute("width","1448");image.setAttribute("height","1086");
  image.setAttribute("preserveAspectRatio","xMidYMid meet");
  image.addEventListener("error",()=>visual.replaceChildren(emptyVisual(item,small)),{once:true});
  svg.append(image);visual.append(svg);return visual;
 }
 visual.append(emptyVisual(item,small));
 return visual;
}
function dialogHostDocument(){
 try{
  if(window.parent!==window&&window.frameElement?.id==="setupFrame"&&window.parent.document?.body)
   return window.parent.document;
 }catch{} // Autonome ou hors même origine.
 return document;
}
function makeDialog(){
 if(modal?.isConnected)return modal;
 const host=dialogHostDocument();
 modal=host.createElement("dialog");
 modal.className="mj-product-dialog";
 modal.setAttribute("aria-labelledby","mj-product-title");
 modal.setAttribute("aria-describedby","mj-product-description");
 modal.innerHTML='<div class="mj-product-window"><button type="button" class="mj-product-close" aria-label="Fermer la fiche produit"><span aria-hidden="true">×</span></button><div class="mj-product-content"></div></div>';
 modal.querySelector(".mj-product-close").addEventListener("click",()=>modal.close());
 modal.addEventListener("click",event=>{
  if(event.target===modal)modal.close();
 });
 modal.addEventListener("close",()=>{
  modal.ownerDocument.body.classList.remove("mj-product-open");
  if(lastTrigger&&lastTrigger.isConnected){
   try{lastTrigger.focus({preventScroll:true});}catch{lastTrigger.focus();}
  }
  lastTrigger=null;
 });
 host.body.append(modal);
 return modal;
}
window.addEventListener("pagehide",()=>{
 if(modal&&modal.ownerDocument!==document){
  if(modal.open)modal.close();
  modal.remove();
  modal=null;
 }
});
function buildDetail(item){
 const grid=node("div","mj-product-layout");
 const media=node("figure","mj-product-figure");
 media.append(photoElement(item));
 grid.append(media);
 const content=node("div","mj-product-info");
 content.append(node("span","mj-product-kicker",item.category));
 content.append(node("h2","mj-product-title",item.name));
 content.querySelector("h2").id="mj-product-title";
 content.append(node("p","mj-product-description",item.description));
 content.querySelector(".mj-product-description").id="mj-product-description";
 const specs=node("dl","mj-product-specs");
 for(const [name,value] of item.specs){
  const row=node("div","mj-product-spec");
  row.append(node("dt",null,name),node("dd",null,value));specs.append(row);
 }
 content.append(specs);
 if(item.caution){
  const notice=node("p","mj-product-caution",item.caution);
  content.append(notice);
 }
 if(item.configLink){
  const link=node("a","mj-product-config-link","Explorer ma configuration PC →");
  link.href=new URL("config-pc.html?v=20261109-modal2",document.baseURI).href;
  link.addEventListener("click",event=>{
   if(modal?.open)modal.close();
   if(modal?.ownerDocument!==document){
    event.preventDefault();
    window.location.assign(link.href);
   }
  });
  content.append(link);
 }
 grid.append(content);return grid;
}
export function openMaterialCard(id,trigger){
 const item=MATERIAL[id];if(!item)return false;
 const dlg=makeDialog();
 if(dlg.open)dlg.close();
 dlg.querySelector(".mj-product-content").replaceChildren(buildDetail(item));
 lastTrigger=trigger||document.activeElement;
 dlg.showModal();
 dlg.ownerDocument.body.classList.add("mj-product-open");
 dlg.querySelector(".mj-product-close").focus();
 return true;
}
export function fillPCParts(){
 const root=document.getElementById("pc-parts-grid");if(!root)return;
 const fragment=document.createDocumentFragment();
 PC_COMPONENT_IDS.forEach((id,index)=>{
  const item=MATERIAL[id];
  if(!item)throw Error("Composant manquant : "+id);
  const card=node("article","part mj-part-card");
  const visual=node("div","mj-part-visual");
  // Les miniatures sont uniquement chargées dans la liste si une vraie photo locale existe.
  if(item.image?.kind==="owned-webp")visual.append(photoElement(item,{small:true}));
  else visual.append(emptyVisual(item,true));
  card.append(visual);
  const copy=node("div","mj-part-copy");
  copy.append(node("span","part-type",item.category));
  copy.append(node("h2",null,item.name));
  copy.append(node("p",null,item.description));
  card.append(copy);
  const action=node("button","mj-part-open","Découvrir la fiche →");
  action.type="button";action.dataset.productId=id;
  action.setAttribute("aria-label","Découvrir la fiche de "+item.name);
  action.addEventListener("click",()=>openMaterialCard(id,action));
  card.append(action);
  fragment.append(card);
 });
 root.replaceChildren(fragment);
 const counter=document.getElementById("pc-part-count");
 if(counter)counter.textContent=PC_COMPONENT_IDS.length+" composants détaillés";
}
