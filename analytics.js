(function(){
"use strict";
// Vercel Analytics enabled; deployment refreshed 2026-09-15.
window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};
function track(name,data){try{window.va("event",{name:name,data:data||{}})}catch(error){console.info("Analytics event unavailable",error)}}
function source(){if(location.pathname==="/")return "home";if(location.pathname.startsWith("/places/"))return "destination";return location.pathname.replace(/^\//,"")||"home"}
document.addEventListener("click",function(event){
const target=event.target.closest("a,button");if(!target)return;
if(target.matches(".affiliate-link[data-provider]")){track("Affiliate Click",{provider:target.dataset.provider,source:source()});return}
if(target.id==="claimLink"||target.matches('a[href^="/partners"]')){track("Partner CTA",{source:source()});return}
if(target.id==="detailsLink"||target.matches('a[href^="/places/"]')){track("Destination Guide Open",{source:source()});return}
if(target.id==="transitDirections"){track("Bus Directions Click",{source:"place_modal"});return}
if(target.id==="restaurantsNearby"){track("Nearby Restaurants Click",{source:"place_modal"});return}
if(target.id==="accommodationNearby"){track("Nearby Accommodation Click",{source:"place_modal"});return}
if(target.id==="directions"||target.matches('a[href*="google.com/maps"]')){track("Directions Click",{source:source()});return}
if(target.id==="generateTrip"){const days=document.querySelector(".duration.active")?.dataset.days||"unknown";const pace=document.getElementById("tripPace")?.value||"unknown";track("Itinerary Generated",{days:days,pace:pace});return}
if(target.id==="wantBtn")track("Place Saved",{source:"map"});
if(target.id==="visitedBtn")track("Place Visited",{source:"map"});
if(target.id==="language"||target.id==="pageLanguage")setTimeout(function(){track("Language Switched",{language:document.documentElement.lang||"unknown",source:source()})},0);
if(target.matches('a[href*="el-salvador-bus-guide"],a[href="#bus-guide"]'))track("Bus Guide Open",{source:source()});
if(target.matches('a[href^="/travel-services"]'))track("Travel Service Open",{source:source()});
});
const partnerForm=document.getElementById("partnerForm");if(partnerForm)partnerForm.addEventListener("submit",function(){const type=document.getElementById("requestType")?.value||"unknown";track("Partner Lead Prepared",{request_type:type})});
})();
