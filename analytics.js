(function(){
"use strict";
// Vercel Analytics enabled; deployment refreshed 2026-09-15.
window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};
function track(name,data){try{window.va("event",{name:name,data:data||{}})}catch(error){console.info("Analytics event unavailable",error)}}
function source(){if(location.pathname==="/")return "home";if(location.pathname.startsWith("/places/"))return "destination";return location.pathname.replace(/^\//,"")||"home"}
function footerLanguage(){const lang=(document.documentElement.lang||"en").toLowerCase();return lang.startsWith("es")?"es":lang.startsWith("fr")?"fr":"en"}
function upgradeFooter(){
const footer=document.querySelector("footer");if(!footer)return;
const l=footerLanguage(),base=l==="es"?"/es":l==="fr"?"/fr":"";
const c={en:{tag:"Independent travel planning for El Salvador.",explore:"Explore",map:"Interactive map",guides:"Travel guides",bus:"Bus guide",services:"Travel services",partners:"Partners",join:"Become a partner",claim:"Claim a listing",legal:"Legal",privacy:"Privacy Policy",terms:"Terms of Use",affiliate:"Affiliate Disclosure",language:"Languages",rights:"All rights reserved."},es:{tag:"Planificación de viajes independiente para El Salvador.",explore:"Explorar",map:"Mapa interactivo",guides:"Guías de viaje",bus:"Guía de buses",services:"Servicios de viaje",partners:"Socios",join:"Hazte socio",claim:"Reclamar un anuncio",legal:"Legal",privacy:"Política de privacidad",terms:"Condiciones de uso",affiliate:"Divulgación de afiliados",language:"Idiomas",rights:"Todos los derechos reservados."},fr:{tag:"Planification de voyage indépendante pour le Salvador.",explore:"Explorer",map:"Carte interactive",guides:"Guides de voyage",bus:"Guide des bus",services:"Services de voyage",partners:"Partenaires",join:"Devenir partenaire",claim:"Revendiquer une fiche",legal:"Mentions légales",privacy:"Politique de confidentialité",terms:"Conditions d’utilisation",affiliate:"Divulgation d’affiliation",language:"Langues",rights:"Tous droits réservés."}}[l];
const guide=l==="es"?"/es/guias-de-viaje":l==="fr"?"/fr/guides-de-voyage":"/travel-guides",bus=l==="es"?"/es/el-salvador-bus-guide":l==="fr"?"/fr/el-salvador-bus-guide":"/el-salvador-bus-guide";
footer.className="site-footer";footer.innerHTML=`<div class="footer-grid"><div class="footer-brand"><a class="brand" href="${base||'/'}"><span class="footer-flag" aria-hidden="true">🇸🇻</span><span>El Salvador <b>Trip Guide</b></span></a><p>${c.tag}</p></div><div><h2>${c.explore}</h2><a href="${base||'/'}#explore">${c.map}</a><a href="${guide}">${c.guides}</a><a href="${bus}">${c.bus}</a><a href="/travel-services">${c.services}</a></div><div><h2>${c.partners}</h2><a href="/partners">${c.join}</a><a href="/partners#claim">${c.claim}</a></div><div><h2>${c.legal}</h2><a href="/privacy-policy?lang=${l}">${c.privacy}</a><a href="/terms-of-use?lang=${l}">${c.terms}</a><a href="/affiliate-disclosure?lang=${l}">${c.affiliate}</a></div><div><h2>${c.language}</h2><div class="footer-languages"><a href="/" hreflang="en" onclick="localStorage.estgLang='en'">English</a><a href="/es" hreflang="es" onclick="localStorage.estgLang='es'">Español</a><a href="/fr" hreflang="fr" onclick="localStorage.estgLang='fr'">Français</a></div></div></div><div class="footer-bottom"><span>© 2026 El Salvador Trip Guide. ${c.rights}</span><span>elsalvadortripguide.com</span></div>`}
upgradeFooter();window.addEventListener("legal-language-change",upgradeFooter);
document.addEventListener("click",function(event){
const target=event.target.closest("a,button");if(!target)return;
if(target.matches(".affiliate-link[data-provider],.partner-cta[data-provider]")){track("Affiliate Click",{provider:target.dataset.provider,source:source()});return}
if(target.id==="claimLink"||target.matches('a[href^="/partners"]')){track("Partner CTA",{source:source()});return}
if(target.id==="detailsLink"||target.matches('a[href^="/places/"]')){track("Destination Guide Open",{source:source()});return}
if(target.id==="transitDirections"){track("Bus Directions Click",{source:"place_modal"});return}
if(target.id==="restaurantsNearby"){track("Nearby Restaurants Click",{source:"place_modal"});return}
if(target.id==="accommodationNearby"){track("Nearby Accommodation Click",{source:"place_modal"});return}
if(target.id==="chivoAtmLink"||target.matches('a[href*="chivowallet.com/index.html#ubicacion"]')){track("Chivo ATM Locator Click",{source:source()});return}
if(target.id==="directions"||target.matches('a[href*="google.com/maps"]')){track("Directions Click",{source:source()});return}
if(target.id==="generateTrip"){const days=document.querySelector(".duration.active")?.dataset.days||"unknown";const pace=document.getElementById("tripPace")?.value||"unknown";track("Itinerary Generated",{days:days,pace:pace});return}
if(target.id==="wantBtn")track("Place Saved",{source:"map"});
if(target.id==="visitedBtn")track("Place Visited",{source:"map"});
if(target.id==="language"||target.id==="pageLanguage"||target.matches("[data-page-lang]"))setTimeout(function(){upgradeFooter();track("Language Switched",{language:document.documentElement.lang||"unknown",source:source()})},0);
if(target.matches('a[href*="el-salvador-bus-guide"],a[href="#bus-guide"]'))track("Bus Guide Open",{source:source()});
if(target.matches('a[href^="/travel-services"]'))track("Travel Service Open",{source:source()});
});
const partnerForm=document.getElementById("partnerForm");if(partnerForm)partnerForm.addEventListener("submit",function(){const type=document.getElementById("requestType")?.value||"unknown";track("Partner Lead Prepared",{request_type:type})});
})();
