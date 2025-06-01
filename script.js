
//--------Data for all your seasons, episodes, and other informations needed--------
const DATA = {
    name:"Hoshikuzu Telepath", //<- anime name, this is used in the website title and About dialogue
    name_alt:"Hoshitele",
    contribuitor:"Alefo", //<- your name or username, this is used in the About dialogue
    fps_chopped:"2", //<- frames per second of GENERATED FRAMES, this is used for calculating the timestamps
    frames_path_pattern:"/frames/frame_{x}.jpg", //<- pattern for the frame image file
    base_url:"https://raw.githubusercontent.com/alefouau/ehtfio", //<- base url for fetching the images whithout "/" in the end
    seasons:[ //put your seasons here using: {name:"SEASON NAME", path: "/your/season/path", EPISODES:[YOUR EPISODES HERE]}
        {
            name:"Season 1",
            path:"",
            episodes:[ //put your episodes here, separated with ","
                //{name:"EPISODE NAME", path:"/your/episode/path", frames:"FRAMES QUANTITY"},
                {name:"Episode 1",path:"/ep1",frames:"2836"},
                {name:"Episode 2",path:"/ep2",frames:"2842"},
                {name:"Episode 3",path:"/ep3",frames:"2842"},
                {name:"Episode 4",path:"/ep4",frames:"2836"},
                {name:"Episode 5",path:"/ep5",frames:"2842"},
                {name:"Episode 6",path:"/ep6",frames:"2842"},
                {name:"Episode 7",path:"/ep7",frames:"2842"},
                {name:"Episode 8",path:"/ep8",frames:"2842"},
                {name:"Episode 9",path:"/ep9",frames:"2841"},
                {name:"Episode 10",path:"/ep10",frames:"2842"},
                {name:"Episode 11",path:"/ep11",frames:"2842"},
                {name:"Episode 12",path:"/ep12",frames:"2842"}
            ]
        }
    ]
}

//-------------------------code v0.2.8---------------------------
let url = new URL(window.location.href);
let SEL_SEASONID = url.searchParams.get('scid');
let SEL_EPISODEID = url.searchParams.get('epid');
let SEL_FRAMENUM = url.searchParams.get('fr');

let page_title = document.querySelector('title');
let e_selector_season = document.getElementById("selector-season");
let e_selector_episode = document.getElementById("selector-episode");
let e_selector_frame = document.getElementById("selector-frame");
let e_image_frame = document.getElementById("image-frame");
let e_btn_random = document.getElementById("btn-random");
let e_btn_download = document.getElementById("btn-download");
let e_btn_frameup = document.getElementById("btn-frameup");
let e_btn_framedown = document.getElementById("btn-framedown")
let e_btn_menu = document.getElementById("btn-menu")
let e_toast = document.getElementById("toast");
let e_timestamp = document.getElementById("timestamp");
let e_ui = document.getElementById("ui");

let toast_timeout;
let ui_timeout;

function showUi(){
    if(ui_timeout){
        clearTimeout(ui_timeout);
        e_ui.classList.remove('inactive');
    };
    ui_timeout = setTimeout(()=>{e_ui.classList.add('inactive');}, 5000 );
}

document.addEventListener('mousemove', showUi);

const toast = {
    showText:(text)=>{
        e_toast.innerText = text;
        e_toast.style.display = "block";
    },
    close:()=>{
        e_toast.style.display = "none"; 
        e_toast.innerText = "";
    }
};

DATA.seasons.forEach((se,si)=>{e_selector_season.insertAdjacentHTML("beforeend", `<option value="${si}">${se.name}</option>`);});
applyFrame();
updateUILists();
updateUIValues();
setParamsInUrl();
showUi();

window.addEventListener("popstate", (ev)=>{
    SEL_SEASONID = ev.state.s;
    SEL_EPISODEID = ev.state.e;
    SEL_FRAMENUM = ev.state.f;
    applyFrame();
    updateUILists();
    updateUIValues();
});
window.addEventListener('keydown', (e)=>{
    let key = e.key.toUpperCase();
    showUi();
    if(key == "ARROWUP" || key == "W"){
        SEL_EPISODEID = parseInt(SEL_EPISODEID)+1;
        applyFrame();
        updateUIValues();
        setParamsInUrl();
    };
    if(key == "ARROWDOWN" || key == "S"){
        SEL_EPISODEID = parseInt(SEL_EPISODEID)-1;
        applyFrame();
        updateUIValues();
        setParamsInUrl();
    };
    if(key == "ARROWLEFT" || key == "A"){
        SEL_FRAMENUM = parseInt(SEL_FRAMENUM)-1;
        applyFrame();
        updateUIValues();
        setParamsInUrl();
    };
    if(key == "ARROWRIGHT" || key == "D"){
        SEL_FRAMENUM = parseInt(SEL_FRAMENUM)+1;
        applyFrame();
        updateUIValues();
        setParamsInUrl();
    };
})
e_image_frame.addEventListener("load", ()=>{toast.close()});
e_image_frame.addEventListener("error", (e)=>{toast.showText("❌ Failed to load the image!");})
e_selector_season.addEventListener('change',(e)=>{
    SEL_SEASONID = e.target.value;
    applyFrame();
    updateUILists();
    addHistoryEntry();

});
e_selector_episode.addEventListener('change',(e)=>{
    SEL_EPISODEID = e.target.value;
    e_selector_frame.max = getAppliedOBJ().episode.frames; 
    applyFrame();
    addHistoryEntry();
});
e_selector_frame.addEventListener('change',(e)=>{
    if(e.target.checkValidity()){
        SEL_FRAMENUM = e.target.value;
        applyFrame();
        addHistoryEntry();
        updateUIValues();
    };
});
e_btn_menu.addEventListener("click", ()=>{
    clearTimeout(toast_timeout);
    toast.showText("ℹ️ a recode is coming soon... for now, no favlists or subtitles");
    toast_timeout = setTimeout(toast.close, 3000);
})
e_btn_frameup.addEventListener("click", (e)=>{
    SEL_FRAMENUM= parseInt(SEL_FRAMENUM)+1;
    applyFrame();
    addHistoryEntry();
    updateUIValues();
});
e_btn_framedown.addEventListener("click", (e)=>{
    SEL_FRAMENUM= parseInt(SEL_FRAMENUM)-1;
    applyFrame();
    addHistoryEntry();
    updateUIValues();
});
e_btn_download.addEventListener('click',()=>{
    toast.showText("⌛ Downloading, please wait...");
    fetch(e_image_frame.src)
    .then(response=>response.blob())
    .then((blob)=>{
        let r = new FileReader();
        r.onload = (res)=>{
            dle = document.createElement("a");
            dle.href = res.target.result;
            dle.download = `${DATA.name_alt}_${getAppliedOBJ().season.name}_${getAppliedOBJ().episode.name}_Frame-${SEL_FRAMENUM}.jpg`.replaceAll(" ","-");
            dle.click();
            toast.showText(`✅ File "${dle.download}" downloaded succefully!`);
            setTimeout(toast.close, 1000);
        };
        r.readAsDataURL(blob)
    });
});
e_btn_random.addEventListener('click', ()=>{
    SEL_EPISODEID = null;
    SEL_FRAMENUM = null;
    SEL_SEASONID = null;
    applyFrame();
    updateUILists();
    updateUIValues();
    addHistoryEntry();
})

function applyFrame(){
    toast.showText("⌛ Please Wait...");
    SEL_SEASONID = validateValue(SEL_SEASONID, DATA.seasons.length-1, 0);
    SEL_EPISODEID = validateValue(SEL_EPISODEID, getAppliedOBJ().season.episodes.length-1, 0);
    SEL_FRAMENUM = validateValue(SEL_FRAMENUM, getAppliedOBJ().episode.frames, 1);
    if(SEL_FRAMENUM == e_selector_frame.min){
        e_btn_framedown.disabled = true;
    }else{
        e_btn_framedown.disabled = false;
    }
    if(SEL_FRAMENUM == e_selector_frame.max){
        e_btn_frameup.disabled = true;
    }else{
        e_btn_frameup.disabled = false;
    }
    page_title.innerText = `${DATA.name_alt} Frame Viewer - ${getAppliedOBJ().season.name}, ${getAppliedOBJ().episode.name}, Frame ${SEL_FRAMENUM}`;
    e_image_frame.src = getImageUrl();
    setTimestamp();
}
function getAppliedOBJ(){
    return {season:DATA.seasons[SEL_SEASONID], episode:DATA.seasons[SEL_SEASONID].episodes[SEL_EPISODEID]}
}
function getImageUrl(){
    let fullUrl = DATA.base_url + getAppliedOBJ().season.path + getAppliedOBJ().episode.path + DATA.frames_path_pattern.replace("{x}", SEL_FRAMENUM);
    let proxiedUrl = "https://images.weserv.nl/?url="+encodeURIComponent(fullUrl.replace('https://', ''));
    return proxiedUrl;
}
function getRand(max, min){
    return Math.floor(Math.random() * max) + min; 
}
function addHistoryEntry(){
    history.pushState({s:SEL_SEASONID,e:SEL_EPISODEID, f:SEL_FRAMENUM}, "", `?scid=${SEL_SEASONID}&epid=${SEL_EPISODEID}&fr=${SEL_FRAMENUM}`);
}
function setParamsInUrl(){
    url.searchParams.set("scid",SEL_SEASONID);
    url.searchParams.set("epid",SEL_EPISODEID);
    url.searchParams.set("fr",SEL_FRAMENUM);
    history.replaceState({s:SEL_SEASONID,e:SEL_EPISODEID, f:SEL_FRAMENUM},"",url);
}
function updateUIValues(){
    e_selector_season.value = SEL_SEASONID;
    e_selector_episode.value = SEL_EPISODEID;
    e_selector_frame.value = SEL_FRAMENUM;

}
function setTimestamp(){
    let totalsecs = SEL_FRAMENUM/parseInt(DATA.fps_chopped);
    let sec = totalsecs % 60;
    let min = (totalsecs - sec) / 60 % 60;
    let hour = (totalsecs - sec - min * 60) / 3600 ;
    e_timestamp.innerText = `${hour.toString().padStart(2,"0")}:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}
function updateUILists(){
    getAppliedOBJ().season.episodes.forEach((se,si)=>{
        e_selector_episode.insertAdjacentHTML("beforeend", `<option value="${si}">${se.name}</option>`);
    });
    e_selector_frame.max = getAppliedOBJ().episode.frames;
}
function validateValue(value, max, min){
    min = parseInt(min);
    max = parseInt(max);
    if(value == null){
        value = getRand(max, min);
    } else if (parseInt(value) > max) {
        value = max;
    } else if (parseInt(value) < min) {
        value = min;
    };

    return value;
}
