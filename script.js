
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

//-------------------------code v0.2---------------------------
//initial basic variables. Each SEL variable loads their respective params from url when the page loads
let url = new URL(window.location.href);
let SEL_SEASONID = url.searchParams.get('scid');
let SEL_EPISODEID = url.searchParams.get('epid');
let SEL_FRAMENUM = url.searchParams.get('fr');

//element-related variables
let e_selector_season = document.getElementById("selector-season");
let e_selector_episode = document.getElementById("selector-episode");
let e_selector_frame = document.getElementById("selector-frame");
let e_image_frame = document.getElementById("image-frame");
let e_btn_random = document.getElementById("btn-random");
let e_btn_download = document.getElementById("btn-download");
let e_toast = document.getElementById("toast");
//function to show text info in the screen (example, the "Please wait..." text on changing frames )
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

//initialization, generate season list, then apply frames, apply ui values and load episode list
DATA.seasons.forEach((se,si)=>{e_selector_season.insertAdjacentHTML("beforeend", `<option value="${si}">${se.name}</option>`);});
applyFrame();
updateUILists();
updateUIValues();

e_image_frame.addEventListener("load", ()=>{toast.close()});//if the image is succefully loaded, closes the loading toast displayed by the applyFrame() function
e_image_frame.addEventListener("error", ()=>{toast.showText("❌ Failed to load the image!")})//if there is an error when loading the image, it will display a error msg
e_selector_season.addEventListener('change',(e)=>{//case the season selector is changed
    SEL_SEASONID = e.target.value;//apply selected seasonID value
    updateUILists();//reloads the episode list for the selected seasonID in the episodes selector
    updateParams();//update the url params
    applyFrame();//finally apply the frame in the img element
});
e_selector_episode.addEventListener('change',(e)=>{
    SEL_EPISODEID = e.target.value;//apply selected episodeID value
    e_selector_frame.max = getAppliedOBJ().episode.frames; //apply the episode total frames as max number in the frames selector
    updateParams();//update url params
    applyFrame();//finally apply the frame
});
e_selector_frame.addEventListener('change',(e)=>{
    if(e.target.checkValidity()){ //checks if the value is a valid value (more than 0, less than total frames number (max))
        SEL_FRAMENUM = e.target.value;//apply selected frame value
        applyFrame();//finally apply the frame
    };
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
            setTimeout(toast.close(), 1000);
        };
        r.readAsDataURL(blob)
    });
});
e_btn_random.addEventListener('click', ()=>{
    SEL_EPISODEID = 0;
    SEL_FRAMENUM = 0;
    SEL_SEASONID = 0;
    updateParams();
    updateUILists();
    updateUIValues();
    applyFrame();
})


function applyFrame(){//apply the selected frame in the img element
    toast.showText("⌛ Please Wait...");//shows the loading text in the screen
    //if the selected frame is null, generate a random number for it
    //(ex: when none params are specifield, the page will show a random frame)
    if(SEL_SEASONID == null){SEL_SEASONID = getRand(DATA.seasons.length-1, 0); updateParams();};
    if(SEL_EPISODEID == null){SEL_EPISODEID = getRand(getAppliedOBJ().season.episodes.length-1, 0); updateParams();};
    if(SEL_FRAMENUM == null){SEL_FRAMENUM = getRand(getAppliedOBJ().episode.frames, 0); updateParams();};
    SEL_SEASONID = Math.min(SEL_SEASONID,DATA.seasons.length);
    SEL_EPISODEID = Math.min(SEL_EPISODEID,getAppliedOBJ().season.episodes.length);
    SEL_FRAMENUM = Math.min(SEL_FRAMENUM, getAppliedOBJ().episode.frames);
    e_image_frame.src = getImageUrl();//get the url, and apply the image in the img element
}
function getAppliedOBJ(){
    return {season:DATA.seasons[SEL_SEASONID], episode:DATA.seasons[SEL_SEASONID].episodes[SEL_EPISODEID]}
}
function getImageUrl(){
    return DATA.base_url + getAppliedOBJ().season.path + getAppliedOBJ().episode.path + DATA.frames_path_pattern.replace("{x}", SEL_FRAMENUM);
}
function getRand(max, min){
    return Math.floor(Math.random() * max) + min; 
}
function updateUIValues(){
    e_selector_season.value = SEL_SEASONID;
    e_selector_episode.value = SEL_EPISODEID;
    e_selector_frame.value = SEL_FRAMENUM;
}
function updateUILists(){
    getAppliedOBJ().season.episodes.forEach((se,si)=>{
        e_selector_episode.insertAdjacentHTML("beforeend", `<option value="${si}">${se.name}</option>`);
    });
    e_selector_frame.max = getAppliedOBJ().episode.frames;
}
function updateParams(){
    url.searchParams.set('scid', SEL_SEASONID);
    url.searchParams.set('epid', SEL_EPISODEID);
    url.searchParams.set('fr', SEL_FRAMENUM);
    window.history.replaceState({}, '', url.href);
}
