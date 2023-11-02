console.log("Options loaded");

var linkedInInfluencers = [];
var linkedInProcess = false;
var linkedInCustomSync = false;
var isLinkedInLoggedIn = false;

var influencers = [];

var limitAllowed = 10;
// linkedInProcess

var scrappingInterval = '';

chrome.storage.local.get(['limitAllowed'], function(_ref) {
    if(_ref.limitAllowed != "" && _ref.limitAllowed != undefined){
        limitAllowed = _ref.limitAllowed;

        console.log(limitAllowed)
    }
})
function currentDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    return output;
}



// getLinkedInInfluencers();

// setInterval(() => {
//     getLinkedInInfluencers();
//     // console.log('Called after 4 mins', new Date())
// // }, 60000*4);
// }, 60000*30);

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     for (key in changes) {
//         if (key === 'authToken') {
//             jwtToken = changes[key].newValue;
//             if (jwtToken != null || jwtToken != '') {
//                 scanProfiles(jwtToken); 
//             }
//         }
//     }
// });
// setInterval(() => {
//     automationProcess();
// }, 30000);
automationProcess(); 
function automationProcess(){ 
    chrome.storage.local.get(function(data){
        console.log(data);
        toBeScan = []
        delay = 0;
        activeIndex = 0;
        var postData = {skipRow: '0'};
        setTimeout(() => {
            fetch(_config.apiBaseUrl + "/get-latest-influencers", {
            method: "POST",
            body: JSON.stringify(postData),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': "Bearer " + data.authToken
            }
        }).then(response => response.json()).then(res => {
            console.log(res)
            if (res.status) {
                influencers = res.data; 
                // updateInfluencerFBImages();
                // let influencer_id='';
                // $.each(influencers, function(index, item) {
                influencers.forEach(function(item, index){
                    // influencer_id=item.influencer_id;
                    console.log(item.user_link, item.last_scan);
                    if (item.last_scan == null) {
                        toBeScan.push({ 'link': item.user_link, 'id': item.id, 'bio_social': item.bio_social });
                    } else {
                        var lastScanDateVar = lastScanDate(item.last_scan); 
                        var currentDateVar = currentDate();

                        // console.log(lastScanDateVar, currentDateVar)
                        if (lastScanDateVar != currentDateVar) {
                            toBeScan.push({ 'link': item.user_link, 'id': item.id, 'bio_social': item.bio_social });
                        }
                    }
                });
                console.log(toBeScan.length, toBeScan)
                // if(toBeScan.length != 0){
                    influencerData();
                    scrappingInterval = setInterval(() => {
                        influencerData();
                    }, 60000*5); 
                // }               
            }
            
        });
        }, 5000);
        
    })
}
function influencerData(){
    console.log('inside influencer', toBeScan.length);
    if(toBeScan.length != 0){
        let firstInfluencerSocialData = toBeScan[0].bio_social;
        let influencer_id=toBeScan[0].id;
        console.log(influencer_id);
        chrome.runtime.sendMessage({action:'scrapAutomationData',data:firstInfluencerSocialData,influencerId:influencer_id})
        toBeScan.shift();
    }else{

        clearInterval(scrappingInterval);
        console.log('scan length not found restart the process');

        setTimeout(()=>{ 
            automationProcess();
        },60000*30);
        
    }
}
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => { 
    if (message.action === 'scrapFbImage') {
        console.log('scrap fb image')

        var img = $(message.text).find("img[alt$=\"profile picture\"]");
        // console.log(img);
        sendResponse(img[0].getAttribute('src'));
    }
    else if (message.action === 'clearLinkedInInfluencerVariable') {
        console.log('clearLinkedInInfluencerVariable');
        // linkedInInfluencers.shift();
        // console.log('one influencer completed');
        chrome.storage.local.get(['linkedInLimit'], function(_ref) {
            var currentDateStr = currentDate();
            console.log(_ref);
            if(_ref.linkedInLimit != "" && _ref.linkedInLimit != undefined){
                console.log('enter in 1', _ref.linkedInLimit.date, currentDateStr)
                if(_ref.linkedInLimit.date == currentDateStr){
                    console.log('enter in 2');
                    let newValue = _ref.linkedInLimit.count;

                    newValue = parseInt(newValue) + 1;
                    let newObject = _ref.linkedInLimit;
                    newObject.count = newValue;
                    console.log('newObject', newObject);
                    chrome.storage.local.set({'linkedInLimit':newObject});
                }else{
                    console.log('date not matched to update count')
                }                      
            }else{
                console.log('linkedin _ref empty')
            }
        });

        // setTimeout(() => {
        //     console.log('single completed')
        //     console.log(JSON.stringify(linkedInInfluencers));
        //     scrapLinkedInInfluencer();
        // }, 3000);
        
    }
    else if (message.action === 'resetLinkedInProcess') {
        linkedInProcess = false;
        
    }
    else if(message.action === 'startLinkedInScrapping'){

        // getLinkedInInfluencers();

    }
    else if(message.action == 'get-linkedin-custom-process-status'){ 
        sendResponse({linkedInCustomSync:linkedInCustomSync});
    }
    else if(message.action === 'customSyncLinkedIn'){ 
        linkedInCustomSync = true;

        setTimeout(() => {
            linkedInCustomSync = false;
        }, 60000*2);

        linkedInInfluencers = [{id:message.influencer_id,bio_social:JSON.stringify(message.bio_social)}];

        linkedInProcess = false;
        // chrome.tabs.remove(linkedInTabId);
        // console.log(linkedInInfluencers);
        setTimeout(function(){
           scrapLinkedInInfluencer(); 
        },2000)
    }
    else if(message.action == 'checkLinkedInLogin'){
        checkLinkedInLogin();
        setTimeout(function(){
            chrome.runtime.sendMessage({action:'linkedInLoginStatus',status: isLinkedInLoggedIn});
        },3000);
        
    }
    // else if(message.action == 'scanProfiles'){
    //     scanProfiles(message.token); 
    // }
});

function lastScanDate(scan_date) {
    var d = new Date(scan_date);
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    return output;
}

var toBeScan = []
var delay = 0;
var activeIndex = 0;

function scanProfiles(authToken) {
    toBeScan = []
    delay = 0;
    activeIndex = 0;
    var postData = {skipRow: '0'};

    fetch(_config.apiBaseUrl + "/get-latest-influencers", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': "Bearer " + authToken
        }
    }).then(response => response.json()).then(res => {
        
        if (res.status) {
            influencers = res.data; 
            // updateInfluencerFBImages();

            // $.each(influencers, function(index, item) {
            influencers.forEach(function(item, index){
                if (item.last_scan == null) {
                    toBeScan.push({ 'link': item.user_link, 'id': item.id, 'bio_social': item.bio_social });
                } else {
                    var lastScanDateVar = lastScanDate(item.last_scan);
                    var currentDateVar = currentDate();
                    if (lastScanDateVar < currentDateVar) {
                        toBeScan.push({ 'link': item.user_link, 'id': item.id, 'bio_social': item.bio_social });
                    }
                }
            });
            // console.log(toBeScan);
            toBeScan.forEach(function(item, index){
            // $.each(toBeScan, function(index, item) {
                setTimeout(() => {
                    scanUser();
                    activeIndex++;
                }, delay);
                delay = delay + 60000;
            });
        }
        
    });
}

function scanUser() {
    userUrl = toBeScan[activeIndex].link;
    userSocial = toBeScan[activeIndex].bio_social;
    infId = toBeScan[activeIndex].id;

    chrome.runtime.sendMessage({action: "scanSingleUser", userUrl:userUrl, userSocial:userSocial, infId:infId});
}

function detectLoggedIn() {

    return new Promise(function(resolve, reject) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log(xmlHttp);
                if (xmlHttp.responseURL.indexOf('linkedin.com/feed') >= 0) {
                    resolve(true);
                } else {
                    console.log('login page found');
                    reject(false);
                }
            }
        }
        xmlHttp.open("GET", "https://www.linkedin.com/login"); // true for asynchronous 
        xmlHttp.send(null);
    });
}

function checkLinkedInLogin(){
    detectLoggedIn().then(result => {
        //logged in 
        isLinkedInLoggedIn = true;
        return isLinkedInLoggedIn;
    }).catch(result => {
        //not logged in 
        isLinkedInLoggedIn = false;
        return isLinkedInLoggedIn;
    });    
}

function getLinkedInInfluencers() {

    /*if(linkedInProcess){
        console.log('process aborted');
        return false;
    }
    linkedInProcess = true;

    chrome.storage.local.get(['authToken'], function(_ref) {
        if (typeof _ref.authToken != "undefined") {
            jwtToken = _ref.authToken;
            linkedInInfluencers = [];
            fetch(_config.apiBaseUrl + "/get-linkedin-influencers", {
                method: "POST",
                body: {},
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    'Authorization': "Bearer " + jwtToken
                }
            }).then(response => response.json()).then(response => {
                if(response.status){
                    chrome.storage.local.set({'limitAllowed':response.limit});
                    limitAllowed = response.limit;

                    console.log('influencers received and limit updated')
                    linkedInInfluencers = response.data;
                    chrome.storage.local.get(['linkedInLimit'], function(_ref) {
                        var currentDateStr = currentDate();
                        if(_ref.linkedInLimit == "" || _ref.linkedInLimit == undefined){
                            console.log('limit not exists already')
                            currentDateStr = currentDate();
                            var updatedLimit = {date: currentDateStr, count: 0};
                            chrome.storage.local.set({'linkedInLimit':updatedLimit});  
                            chrome.storage.local.set({'linkedInLimitExceeded':false});                          
                        }else{
                            console.log('limit exists already')
                            let savedDate = _ref.linkedInLimit.date;
                            if(currentDateStr != savedDate){
                                console.log('limit not exists for today');
                                currentDateStr = currentDate();
                                var updatedLimit = {date: currentDateStr, count: 0};
                                chrome.storage.local.set({'linkedInLimit':updatedLimit});
                                chrome.storage.local.set({'linkedInLimitExceeded':false});
                            }
                        }
                        // setTimeout(() => {
                        //     scrapLinkedInInfluencer();
                        // },2000)
                    });
                }    
            });

        }else{
            linkedInProcess = false;
            linkedInCustomSync = false;
        }
    });*/
}

function scrapLinkedInInfluencer(){
    console.log('scrapLinkedInInfluencer function called')
    if(linkedInInfluencers.length > 0){
        console.log('influencers length found')
        chrome.storage.local.get(['linkedInLimit'], function(_ref) {
            console.log('checking value in storage', _ref)
            if(_ref?.linkedInLimit?.count < limitAllowed){
                console.log('limit available')
                var socialInfo = JSON.parse(linkedInInfluencers[0].bio_social);
                let index = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
                var url = socialInfo[index].text;
                url = url[0];
                var lastChar = url.charAt(url.length - 1);
                if(lastChar == '/'){
                    url = url.slice(0, -1);
                }
                url = url+"/recent-activity"; 
                console.log("window open with url", url);
                chrome.runtime.sendMessage({action:'openLinkedInTab', url: url, influencerId: linkedInInfluencers[0].id});
            }else{
                console.log('limit exceeded')
                chrome.storage.local.set({'linkedInLimitExceeded':true});
            }
        });

    }else{
        linkedInProcess = false; 
        linkedInCustomSync = false;
    }
}