$.extend($.expr[":"], {
    "containsI": function(elem, i, match, array) {
        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

var influencers;  
var myInfluencers = [];
var global_tags = [];
var timelineArray = [];
var dr_activities = [];
var customSyncing = false;
var customInstaSyncing = false;
var getInfuExistTagsdetails = [];
var sortColumn = "";
var sortOrder = "";
var selectedTag = "";
var jwtToken = '';
var blankTemplateIndex = '';
var assignedTags = [];
// GLOBAL SETTING SCREEN 
var global_var_checklists = [];
var exists_infu_checklist = [];

var global_var_scripts = [];

var tempUserData = [];
var indexNoToRemove = -1;
var bulkSelectedInfIds = [];

chrome.runtime.onMessage.addListener((message,response)=>{
    if(message.action == 'getAllTags'){
        loadAllTags();
    }

});


function showDetail(i, reset = true) {

    if(reset){
        indexNoToRemove = -1; // changed to default state so that it will not remove further indexes    
    }

    var activity = influencers[i].activity;
    if (influencers[i].bio_contact != '') {
        var contactInfo = JSON.parse(influencers[i].bio_contact);
    } else {
        var contactInfo = [
            { "field_type": "Email", "text": " " },
            { "field_type": "Mobile", "text": " " },
            { "field_type": "Address", "text": " " },
            { "field_type": "Title", "text": " " },
            { "field_type": "TitleUrl", "text": " " }
        ];
    }

    if (influencers[i].bio_social != '') {
        var socialInfo = JSON.parse(influencers[i].bio_social);
    } else {
        var socialInfo = [
            { "field_type": "Facebook", "text": [""], "is_editing": 0 },
            { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
            { "field_type": "YouTube", "text": [""], "is_editing": 0 },
            { "field_type": "Instagram", "text": [""], "is_editing": 0 },
            { "field_type": "Twitter", "text": [""], "is_editing": 0 },
            { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
        ];
    }

    let emailIndex = contactInfo.findIndex(x => x.field_type == 'Email');
    let mobileIndex = contactInfo.findIndex(x => x.field_type == 'Mobile');
    let addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    let title = contactInfo.findIndex(x => x.field_type == 'Title');
    let titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');

    let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
    let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
    let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
    let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');
    let twitterIndex = socialInfo.findIndex(x => x.field_type == 'Twitter');
    let pinterestIndex = socialInfo.findIndex(x => x.field_type == 'Pinterest');

    let facebookUrl = socialInfo[facebookIndex].text[0];
    let linkedInUrl = socialInfo[linkedInIndex].text[0];
    let youTubeUrl = socialInfo[youTubeIndex].text[0];
    let instagramUrl = socialInfo[instagramIndex].text[0];
    let twitterUrl = socialInfo[twitterIndex].text[0];
    let pinterestUrl = socialInfo[pinterestIndex].text[0];
    
    if (contactInfo[addressIndex] == 'undefined' || typeof contactInfo[addressIndex] == 'undefined') {
        contactInfo.push({ "field_type": "Address", "text": " " });
        addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    }

    if (titleUrl != -1 || contactInfo[titleUrl] == 'undefined' || typeof contactInfo[titleUrl] == 'undefined') {

        contactInfo.push({ "field_type": "TitleUrl", "text": "" });
        titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');
    }

    if (title != -1 || contactInfo[title] == 'undefined' || typeof contactInfo[title] == 'undefined') {

        contactInfo.push({ "field_type": "Title", "text": "" });
        title = contactInfo.findIndex(x => x.field_type == 'Title');
    }
    
    let profileFB_url_array = facebookUrl.split('/');
    let profileFB_id = profileFB_url_array[profileFB_url_array.length - 1];

    let dm_url = "https://www.messenger.com/t/" + profileFB_id;
    $(".tab").hide();
    $('#profile-section').empty();

    let inf_profile_img_url = '';
    if(influencers[i].template_flag == 1) {
        inf_profile_img_url = influencers[i].photo_uri;
    }else {
        inf_profile_img_url = _config.baseUrl+'/public/images/'+influencers[i].photo_uri;
    }
    tempUserData.id = influencers[i].id;
    
    var profileData = `
        <div class="col-12 mt-4 profile_part p-0 pb-2">
            <div class="row">
                
                <div class="col-3 profile_img">
                    <span class="back-link"><img src="assets/images/back.png" class="back-icon"></span>
                     
                     <div class="dropZoneContainer ">


                        <input type="file" id="drop_zone"  name="inf_image" class="FileUpload" accept=".jpg,.png,.gif"/>
                        <div class="profile-image dropZoneOverlay" >
                            <img id="influencer_profile_img"  src="${inf_profile_img_url}" class="profile-image" />
                        </div>
                
                    </div>

                    <div class="dropdown convo_type" data-index="${i}">
                        <button class="dropdown-toggle" type="button" data-toggle="dropdown">
                            <span class="selected_convo">Default</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                        <li data-type="email" title="Email"><img src="assets/images/email.jpg"></li>
                        <li data-type="text" title="Text"><img src="assets/images/text.jpg"></li>
                        <li data-type="phone" title="Phone"><img src="assets/images/phone.jpg"></li>
                        <li data-type="messenger" title="Messenger"><img src="assets/images/messenger.jpg"></li>
                        <li data-type="instagram" title="Instagram"><img src="assets/images/instagram.jpg"></li>
                        <li data-type="linkedin" title="LinkedIn"><img src="assets/images/linkedin.jpg"></li>
                        <li data-type="youtube" title="Youtube"><img src="assets/images/youtube.jpg"></li>
                        </ul>
                    </div>
                </div>
                <div class="col-9 p-0">
                    
                    <div class="row">
                        <div class="col-10 p-0"><h2 class="name">${influencers[i].ful_name}</h2></div>
                        <div class="col-2 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="${influencers[i].ful_name}" data-key="Ful_name" data-id="${i}"/>
                        <img src="assets/images/copy.png" title="Click to copy title" class="copyInfluencerName" data-value="${influencers[i].ful_name}"/>
                        </div>   
                    </div>

                    
                    <div class="row">
                        <div class="col-10 p-0">
                        <h3> <span> 
                            <a href="${contactInfo[titleUrl]?.text}" class="small" target="_blank">${contactInfo[title].text} </a>
                            </span>
                        </h3>
                        </div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[title].text}" data-key="Title" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy title" class="copyTitle" data-value="${contactInfo[title].text}"/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/envelope.png"/> Email: <span>${contactInfo[emailIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[emailIndex].text}" data-key="Email" data-id="${i}" />
                            <img src="assets/images/copy.png" title="Click to copy email" class="copyEmail" data-value="${contactInfo[emailIndex].text}"/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/phone.png" /> Mobile: <span>${contactInfo[mobileIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[mobileIndex].text}" data-key="Mobile" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy mobile" class="copyNumber" data-value="${contactInfo[mobileIndex].text}"/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/address.png" /> Address: <span>${contactInfo[addressIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[addressIndex].text}" data-key="Address" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy address" class="copyAddress" data-value="${contactInfo[addressIndex].text}"/>
                        </div>
                    </div>                                       

                </div>
            </div>
        </div>   
        <div class="row listing">
            <div class="col-3 p-0">
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (facebookUrl != '' ? facebookUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (facebookUrl != '' ? facebookUrl : '') + `" data-key="Facebook" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (linkedInUrl != '' ? linkedInUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-linkedin"></i> LinkedIn</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (linkedInUrl != '' ? linkedInUrl : '') + `" data-key="LinkedIn" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (youTubeUrl != '' ? youTubeUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-youtube-play"></i> Youtube</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (youTubeUrl != '' ? youTubeUrl : '') + `" data-key="YouTube" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (instagramUrl != '' ? instagramUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-instagram"></i> Instagram</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (instagramUrl != '' ? instagramUrl : '') + `" data-key="Instagram" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (twitterUrl != '' ? twitterUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (twitterUrl != '' ? twitterUrl : '') + `" data-key="Twitter" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (pinterestUrl != '' ? pinterestUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-pinterest"></i> Pinterest</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (pinterestUrl != '' ? pinterestUrl : '') + `" data-key="Pinterest" data-id="${i}" /></div>
                </div>

                <div class="row">
                    <div class="col-8 pr-0">
                        <a href="javascript:void(0)" class="open_extra_links">
                            <i class="fa fa-link"></i> Extra Links
                        </a>
                    </div> 
                    <div class="col-3 p-0">
                        <img src="assets/images/edit.png" class="edit-extra-links" data-id="${i}"/>
                    </div>
                </div>  

                <div class="row">
                    <div class="col-12 pr-0"><a href="javascript:void(0)" target="_blank"><i class="fa fa-tags"></i> Tags</a></div>
                    <div class="get-tags col-12 p-0"> <p class="fetch">Fetching Tags... </p>
                    <select class="request-input tagsinputbox" multiple placeholder="Type Here..." data-role="tagsinput"></select>
                    </div>
                    <div class="tag-suggestion-container col-12" style="padding: 4px 6px;">
                        <ul class="list-group" id="tagSuggestionList">
          
                        </ul>
                    </div>
                </div>               
            </div>
            <div class="col-9 p-0">

            <a class="emailDefaultLink" href="#" target="_blank"><img src="assets/images/envelope.png" /> Email</a>
            <a href="${dm_url}" target="_blank"><img style="width: 25px;" src="assets/images/messnger.png" /> DM</a>
            <a href="https://www.dream100videobox.com" target="_blank"><img src="assets/images/video.png" /> Video Box</a>
            <a href="https://www.dream100box.com" target="_blank"><img src="assets/images/mail_swag.png" /> Mail Swag</a>
            <a href="https://www.facebook.com/${profileFB_id}/friends_mutual" target="_blank"><img src="assets/images/people.png" /> Friends</a>
 
                     <div class="filter-wrap pr-1">
                                <span>Script </span>
                                <select class="filter-dropdown select_script_dropdown">
                                    <option value="0">Select Script</option>
                                    
                                </select>
                            </div>

                <ul class="nav nav-tabs multi_tabs stats_tabs mt-2">
                
                <li class="nav-item">
                    <a class="nav-link profileTimeline active" data-toggle="tab" href="#time">Timeline</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileInterest" data-toggle="tab" href="#interests">Interests</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileObjectives" data-toggle="tab" href="#objectives">Objectives</a>
                </li>
                
                </ul>

                <div class="tab-content">

                    <div id="interests" class="tab-pane fade pl-2 pr-2 interest_list">
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/map" target="_blank">Check-Ins</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/sports" target="_blank">Sports</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/music" target="_blank">Music</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/movies" target="_blank">Movies</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/tv" target="_blank">Tv Shows</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/books" target="_blank">Books</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/games" target="_blank">Apps & Games</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/likes" target="_blank">Likes</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/events" target="_blank">Events</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${influencers[i].user_link}/groups" target="_blank">Groups</a></h3>
                        </div>
                        
                    </div>

                    <div id="time" class="active show tab-pane fade pl-2 pr-2">

                        <ul class="nav nav-tabs mt-4 multi_tabs time_tabs ">

                            <li class="nav-item">
                                <a class="nav-link active profileTimelineAll" data-toggle="tab" href="#both">All</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelinePosts" data-toggle="tab" href="#Posts-sec">Posts</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelineComments" data-toggle="tab" href="#comment-sec">Comments</a>
                            </li>
                        </ul>
                        <div class="filter-wrap text-right pr-2">
                            <span>Social Platform</span>
                            <select class="filter-dropdown influencer-timeline-filter">
                                <option value="all">All</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">Youtube</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>
                        <hr></hr>
                        <div class="tab-content">
                            <div id="both" class="tab-pane active pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <a href="` + item.url + `" target="_blank">`;

        if (item.platform == 'youtube') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px">` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        } else if (item.platform == 'facebook') {

            profileData += `<h4>`;
            if (item.event == 'published new post.') {
                profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
            } else {
                profileData += `<img src="assets/images/chat.png">`;
            }
            profileData += item.author + `  ` + item.event + `</h4>
                                                    <p>` + (item.text != null ? item.text : '') + `</p>
                                                    <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>`;

        } else if (item.platform == 'instagram') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!--<img src="https://via.placeholder.com/150" style="    width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        }else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
            }else if(item.event == 'react' || item.event == 'comment'){

                    profileData += `<h4>`;
                                if(item.event == 'react'){
                                    profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
                                }else{
                                    profileData += `<img src="assets/images/chat.png">`    
                                }
                                
                                profileData += item.author + ` ` + item.text + `
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;

            }

        }

        // <h4>`;
        // if(item.event == 'published new post.'){
        //     profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
        // }else{
        //     profileData += `<img src="assets/images/chat.png">`;
        // }
        // profileData += item.author+`  `+item.event+`</h4>
        // <p>`+(item.text != null ? item.text : '')+`</p>
        // <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        profileData += `</a>
                                        </div>
                                    `;
    });
    profileData += `</div>
                            <div id="Posts-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {

        if (item.platform == 'youtube') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        } else if (item.platform == 'facebook') {

            if (item.event == 'published new post.') {
                profileData += `
                                            <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                <h4>
                                                <a href="` + item.url + `" target="_blank">
                                                <i class="fa fa-sticky-note-o post-icon"></i> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                                </a> 
                                            </div>`;
            }

        } else if (item.platform == 'instagram') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!-- <img src="https://via.placeholder.com/150" style="width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        }
        else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">`;
                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
                profileData += `</a>
                    </div>`;
            }

        }
        // if(item.event == 'published new post.'){
        //     profileData += `
        //     <div class="col-md-12 rows p-0">
        //         <h4>
        //         <a href="`+item.url+`" target="_blank">
        //         <i class="fa fa-sticky-note-o post-icon"></i> `+item.author+`  `+item.event+`</h4>
        //         <p>`+(item.text != null ? item.text : '')+`</p>
        //         <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        //         </a> 
        //     </div>`;
        // } 
    });
    profileData += `</div>
                            <div id="comment-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        if (item.event == 'added new comment.') {
            profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <h4>
                                            <a href="` + item.url + `" target="_blank">
                                                <img src="assets/images/chat.png"> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                            </a>
                                        </div>`;
        }else if (item.platform == 'linkedin') {

            if(item.event == 'comment'){

                    profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                        <a href="` + item.url + `" target="_blank">
                                         <h4>
                                            <img src="assets/images/chat.png">`
                                            + item.author + ` ` + item.text + `
                                         </h4>
                                         <h5>
                                            <img src="assets/images/linkedin.png" width="20px"> ` + 
                                            (item.date != null ? formatDate(item.date) : 'NA') + `
                                         </h5>
                                        </a>
                                    </div>`;

            }

        }
    });
    profileData += `</div>
                        </div>
                    </div>

                    <div id="objectives" class="tab-pane fade pl-2 pr-2 objectives_list" data-id="` + influencers[i].id + `">
                        <div class="col-md-12 row_sec p-0 dream-outcome mt-4 mb-3">
                            <b><u>Dream Outcome: </u></b>
                            <span class="edit-dream-outcome"> "click to edit" </span>
                        </div> 

                        <div class="col-md-12 row_sec p-0">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Action Steps:</b><button class="obj-form-buttons delete-actions btn-right-obj">Delete Completed</button>
                        </div> 

                        <div class="col-md-12 filter-wrap text-right pr-2 d-flex flex-row-reverse checklist-filter">
                            <select class="filter-dropdown preloaded-checklist">
                                
                            </select>
                            <span>Preloaded</span>
                        </div>

                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="action_steps-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar action_steps-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 row_sec p-0 main-action_steps">
                        </div>  

                        <div class="col-md-12 p-0 row_sec">
                            <input name="add-new-item-action_steps" class="obj-form-control add-new-item-action_steps default-hide" value="" placeholder="Write here and press enter">
                            <button id="add-item-action_steps" class="add-item-action_steps obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide close-btn-actions"></span>

                        </div> 

                        <div class="col-md-12 row_sec p-0 mt-4">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Notes</b><button class="obj-form-buttons delete-notes btn-right-obj">Delete Completed</button> </br>                            
                        </div>
                        
                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="notes-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar notes-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>



                        <div class="col-md-12 row_sec p-0 main-notes">
                                                 
                        </div>
                        <input name="add-new-item-notes" class="obj-form-control add-new-item-notes default-hide" placeholder="Write here and press enter">
                            <button id="add-item-notes" class="add-item-notes obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide  close-btn-notes"></span>
                            <span class="fa fa-spinner fa-spin default-hide  loading-notes"></span>
                    </div>


                </div>
            </div>
        </div>
    `;

    $('#profile-section').append(profileData);
    updateConvoTypeDropdown(influencers[i].convo_type);

    chrome.storage.local.get(['defaultEmailApp'], function(_ref) {
        //console.log('inside storage', contactInfo[emailIndex].text)
        if(_ref.defaultEmailApp == 1){
            //console.log('outloook')
            $(".emailDefaultLink").attr("href","https://outlook.live.com/owa/?to="+contactInfo[emailIndex].text+"&path=/mail/action/compose")
        }else{
            //console.log('gmail')
            $(".emailDefaultLink").attr("href","https://mail.google.com/mail/u/0/?fs=1&to="+contactInfo[emailIndex].text+"&tf=cm")
            
        }
    });

    $("img.profile-image").on('error', handleError);


    getTagsDetails(influencers[i].id);

    getObjectivesDetails(influencers[i].id);
    loadAllChecklistTags();
    getPreloadedChecklist();
    getInfluencerNotes(influencers[i].id);
    setTimeout(() => {
        loadGlobalScripts();
    }, 1000)


    $("#profile_screen").show();
}


function addContactDetails() {
    let i = -1;
    // console.log("I am reached here!!!!");
    // console.log(contactInfo);
     // console.log(influencers[i].template_status);
      //console.log(tempUserData);
   

    var activity = tempUserData.activity;
      //console.log(activity);
      // return false;

     // console.log(tempUserData.bio_contact)
    if (tempUserData.length > 0 && tempUserData.bio_contact != '') {
        var contactInfo = JSON.parse(tempUserData.bio_contact);
    } else {
        var contactInfo = [
            { "field_type": "Email", "text": " " },
            { "field_type": "Mobile", "text": " " },
            { "field_type": "Address", "text": " " },
            { "field_type": "Title", "text": " " },
            { "field_type": "TitleUrl", "text": " " }
        ];
    }

    if (tempUserData.length > 0 && tempUserData.bio_social != '') {
        var socialInfo = JSON.parse(tempUserData.bio_social);
    } else {
        var socialInfo = [
            { "field_type": "Facebook", "text": [""], "is_editing": 0 },
            { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
            { "field_type": "YouTube", "text": [""], "is_editing": 0 },
            { "field_type": "Instagram", "text": [""], "is_editing": 0 },
            { "field_type": "Twitter", "text": [""], "is_editing": 0 },
            { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
        ];
    }

    //console.log(contactInfo)

    let emailIndex = contactInfo.findIndex(x => x.field_type == 'Email');
    let mobileIndex = contactInfo.findIndex(x => x.field_type == 'Mobile');
    let addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    let title = contactInfo.findIndex(x => x.field_type == 'Title');
    let titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');
    //console.log(title + " title index");

    let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
    let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
    let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
    let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');
    let twitterIndex = socialInfo.findIndex(x => x.field_type == 'Twitter');
    let pinterestIndex = socialInfo.findIndex(x => x.field_type == 'Pinterest');

    let facebookUrl = socialInfo[facebookIndex].text[0];
    let linkedInUrl = socialInfo[linkedInIndex].text[0];
    let youTubeUrl = socialInfo[youTubeIndex].text[0];
    let instagramUrl = socialInfo[instagramIndex].text[0];
    let twitterUrl = socialInfo[twitterIndex].text[0];
    let pinterestUrl = socialInfo[pinterestIndex].text[0];
    //let tags            = '';
    // console.log(contactInfo);
    // console.log(titleUrl);
    // console.log(contactInfo[titleUrl]);
    // return false;
    if (contactInfo[addressIndex] == 'undefined' || typeof contactInfo[addressIndex] == 'undefined') {
        //console.log(contactInfo[addressIndex].text);
        contactInfo.push({ "field_type": "Address", "text": " " });
        addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
        // console.log(contactInfo[addressIndex].text);
    }

    if (contactInfo[titleUrl] == 'undefined' || typeof contactInfo[titleUrl] == 'undefined') {

        contactInfo.push({ "field_type": "TitleUrl", "text": "" });
        titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');
        //console.log(titleUrl);
    }

    if (contactInfo[title] == 'undefined' || typeof contactInfo[title] == 'undefined') {

        contactInfo.push({ "field_type": "title", "text": "" });
        title = contactInfo.findIndex(x => x.field_type == 'title');
        //console.log(titleUrl);
    }

     //console.log(facebookUrl);

    let profileFB_id = '';

    if(facebookUrl != null){
        let profileFB_url_array = facebookUrl.split('/');
        profileFB_id = profileFB_url_array[profileFB_url_array.length - 1];
    }
    

    // console.log(profileFB_id);

    let dm_url = "https://www.messenger.com/t/" + profileFB_id;
    $(".tab").hide();
    $('#profile-section').empty();

    // console.log(global_var_scripts);

    //let encoded_title_text = base64encode(contactInfo[title].text); // "aGV5ICB0aGVyZQ=="
    //console.log(encoded_title_text); // "aGV5ICB0aGVyZQ=="

    // let decoded_title_text = base64decode(encoded); // "hey there"

    // $(".profile-image#influencer_profile_img").attr('src', _config.baseUrl+'/public/images/'+tempUserData.photo_uri);
   
    let inf_profile_img_url = '';
    if(tempUserData.template_flag == 1) {
        inf_profile_img_url = tempUserData.photo_uri;
    }else {
       inf_profile_img_url = _config.baseUrl+'/public/images/'+tempUserData.photo_uri;
    }
    //console.log(tempUserData);
   
    var profileData = `
        <div class="col-12 mt-4 profile_part p-0 pb-2">
            <div class="row">
                <div class="col-3 profile_img">
                    <span class="back-link"><img src="assets/images/back.png" class="back-icon"></span>
                    <div class="dropZoneContainer ">
                     

                        <input type="file" id="drop_zone"  name="inf_image" class="FileUpload" accept=".jpg,.png,.gif"/>
                        <div class="profile-image dropZoneOverlay" >
                            <img id="influencer_profile_img"  src="${inf_profile_img_url}" class="profile-image" />
                        </div>
                       
                     </div>
                </div>

                

                <div class="col-9 p-0">
                    
                    
                    <div class="row">
                        <div class="col-10 p-0"><h2 class="name">${tempUserData.ful_name}</h2></div>
                        <div class="col-2 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="${tempUserData.ful_name}" data-key="Ful_name" data-id="${i}"/></div>   
                    </div>
                    
                    <div class="row">
                        <div class="col-10 p-0"> 
                            <a href='${contactInfo[titleUrl]?.text?.replace(/ /g, '') != "" ? contactInfo[titleUrl]?.text : "javascript:void(0)"}' class="small" target="_blank">${contactInfo[title].text?.replace(/ /g, '') != "" ? contactInfo[title].text : 'Title'} </a>
                        </div>
                        <div class="col-2 p-0">    
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[title].text}" data-key="Title" data-id="${i}"/>  
                        </div>                        
                    </div>
                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/envelope.png"/> Email: ${contactInfo[emailIndex].text}</h3></div>
                        <div class="col-2 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[emailIndex].text}" data-key="Email" data-id="${i}" /></div>
                    </div>
                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/phone.png" /> Mobile: ${contactInfo[mobileIndex].text}</h3></div>
                        <div class="col-2 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[mobileIndex].text}" data-key="Mobile" data-id="${i}"/></div>
                    </div>

                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/address.png" /> Address: ${contactInfo[addressIndex].text}</h3></div>
                        <div class="col-2 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[addressIndex].text}" data-key="Address" data-id="${i}"/></div>
                    </div>                                       

                </div>
            </div>
        </div>   
        <div class="row listing">
            <div class="col-3 p-0">
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (facebookUrl != '' ? facebookUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (facebookUrl != '' ? facebookUrl : '') + `" data-key="Facebook" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (linkedInUrl != '' ? linkedInUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-linkedin"></i> LinkedIn</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (linkedInUrl != '' ? linkedInUrl : '') + `" data-key="LinkedIn" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (youTubeUrl != '' ? youTubeUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-youtube-play"></i> Youtube</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (youTubeUrl != '' ? youTubeUrl : '') + `" data-key="YouTube" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (instagramUrl != '' ? instagramUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-instagram"></i> Instagram</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (instagramUrl != '' ? instagramUrl : '') + `" data-key="Instagram" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (twitterUrl != '' ? twitterUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (twitterUrl != '' ? twitterUrl : '') + `" data-key="Twitter" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (pinterestUrl != '' ? pinterestUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-pinterest"></i> Pinterest</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (pinterestUrl != '' ? pinterestUrl : '') + `" data-key="Pinterest" data-id="${i}" /></div>
                </div> 

                <div class="row">
                    <div class="col-12 pr-0"><a href="javascript:void(0)" target="_blank"><i class="fa fa-tags"></i> Tags</a></div>
                    
                    <div class="get-tags col-12 p-0"> <p class="fetch">Fetching Tags... </p>
                    
                    

                    <select class="request-input tagsinputbox" multiple placeholder="Type Here..." data-role="tagsinput"></select>
                    </div>

                    <div class="tag-suggestion-container col-12" style="padding: 4px 6px;">
                        <ul class="list-group" id="tagSuggestionList">
                            
                        </ul>
                    </div>
                </div>               
            </div>
            <div class="col-9 p-0">

            <a class="emailDefaultLink" href="https://mail.google.com/mail/u/0/?fs=1&to=${contactInfo[emailIndex].text}&tf=cm" target="_blank"><img src="assets/images/envelope.png" /> Email</a>
            <a href="${dm_url}" target="_blank"><img style="width: 25px;" src="assets/images/messnger.png" /> DM</a>
            <a href="https://www.dream100videobox.com" target="_blank"><img src="assets/images/video.png" /> Video Box</a>
            <a href="https://www.dream100box.com" target="_blank"><img src="assets/images/mail_swag.png" /> Mail Swag</a>
            <a href="https://www.facebook.com/${profileFB_id}/friends_mutual" target="_blank"><img src="assets/images/people.png" /> Friends</a>
 
                     <div class="filter-wrap  pr-1">
                                <span>Script </span>
                                <select class="filter-dropdown select_script_dropdown">
                                    <option value="0">Select Script</option>
                                    
                                </select>
                            </div>

                <ul class="nav nav-tabs multi_tabs stats_tabs mt-2">
                
                <li class="nav-item">
                    <a class="nav-link profileTimeline active" data-toggle="tab" href="#time">Timeline</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileInterest" data-toggle="tab" href="#interests">Interests</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileObjectives" data-toggle="tab" href="#objectives">Objectives</a>
                </li>
                
                </ul>

                <div class="tab-content">

                    <div id="interests" class="tab-pane fade pl-2 pr-2 interest_list">
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/map" target="_blank">Check-Ins</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/sports" target="_blank">Sports</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/music" target="_blank">Music</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/movies" target="_blank">Movies</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/tv" target="_blank">Tv Shows</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/books" target="_blank">Books</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/games" target="_blank">Apps & Games</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/likes" target="_blank">Likes</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/events" target="_blank">Events</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${tempUserData.user_link}/groups" target="_blank">Groups</a></h3>
                        </div>
                        
                    </div>

                    <div id="time" class="active show tab-pane fade pl-2 pr-2">

                        <ul class="nav nav-tabs mt-4 multi_tabs time_tabs ">

                            <li class="nav-item">
                                <a class="nav-link active profileTimelineAll" data-toggle="tab" href="#both">All</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelinePosts" data-toggle="tab" href="#Posts-sec">Posts</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelineComments" data-toggle="tab" href="#comment-sec">Comments</a>
                            </li>
                        </ul>
                        <div class="filter-wrap text-right pr-2">
                            <span>Social Platform</span>
                            <select class="filter-dropdown influencer-timeline-filter">
                                <option value="all">All</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">Youtube</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                        <hr></hr>
                        <div class="tab-content">
                            <div id="both" class="tab-pane active pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <a href="` + item.url + `" target="_blank">`;

        if (item.platform == 'youtube') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px">` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        } else if (item.platform == 'facebook') {

            profileData += `<h4>`;
            if (item.event == 'published new post.') {
                profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
            } else {
                profileData += `<img src="assets/images/chat.png">`;
            }
            profileData += item.author + `  ` + item.event + `</h4>
                                                    <p>` + (item.text != null ? item.text : '') + `</p>
                                                    <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>`;

        } else if (item.platform == 'instagram') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!--<img src="https://via.placeholder.com/150" style="    width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        }

        // <h4>`;
        // if(item.event == 'published new post.'){
        //     profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
        // }else{
        //     profileData += `<img src="assets/images/chat.png">`;
        // }
        // profileData += item.author+`  `+item.event+`</h4>
        // <p>`+(item.text != null ? item.text : '')+`</p>
        // <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        profileData += `</a>
                                        </div>
                                    `;
    });
    profileData += `</div>
                            <div id="Posts-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {

        if (item.platform == 'youtube') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        } else if (item.platform == 'facebook') {

            if (item.event == 'published new post.') {
                profileData += `
                                            <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                <h4>
                                                <a href="` + item.url + `" target="_blank">
                                                <i class="fa fa-sticky-note-o post-icon"></i> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                                </a> 
                                            </div>`;
            }

        } else if (item.platform == 'instagram') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!-- <img src="https://via.placeholder.com/150" style="width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        }
        // if(item.event == 'published new post.'){
        //     profileData += `
        //     <div class="col-md-12 rows p-0">
        //         <h4>
        //         <a href="`+item.url+`" target="_blank">
        //         <i class="fa fa-sticky-note-o post-icon"></i> `+item.author+`  `+item.event+`</h4>
        //         <p>`+(item.text != null ? item.text : '')+`</p>
        //         <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        //         </a> 
        //     </div>`;
        // } 
    });
    profileData += `</div>
                            <div id="comment-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        if (item.event == 'added new comment.') {
            profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <h4>
                                            <a href="` + item.url + `" target="_blank">
                                                <img src="assets/images/chat.png"> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                            </a>
                                        </div>`;
        }
    });
    profileData += `</div>
                        </div>
                    </div>

                    <div id="objectives" class="tab-pane fade pl-2 pr-2 objectives_list" data-id="` + tempUserData.id + `">
                        <div class="col-md-12 row_sec p-0 dream-outcome mt-4 mb-3">
                            <b><u>Dream Outcome: </u></b>
                            <span class="edit-dream-outcome"> "click to edit" </span>
                        </div> 

                        <div class="col-md-12 row_sec p-0">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Action Steps:</b><button class="obj-form-buttons delete-actions btn-right-obj">Delete Completed</button>
                        </div> 

                        <div class="col-md-12 filter-wrap text-right pr-2 d-flex flex-row-reverse checklist-filter">
                            <select class="filter-dropdown preloaded-checklist">
                                
                            </select>
                            <span>Preloaded</span>
                        </div>

                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="action_steps-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar action_steps-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 row_sec p-0 main-action_steps">
                        </div>  

                        <div class="col-md-12 row_sec p-0">
                            <input name="add-new-item-action_steps" class="obj-form-control add-new-item-action_steps default-hide" value="" placeholder="Write here and press enter">
                            <button id="add-item-action_steps" class="add-item-action_steps obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide close-btn-actions"></span>

                        </div> 

                        <div class="col-md-12 row_sec p-0 mt-4">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Notes</b><button class="obj-form-buttons delete-notes btn-right-obj">Delete Completed</button> </br>                            
                        </div>
                        
                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="notes-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar notes-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>



                        <div class="col-md-12 row_sec p-0 main-notes">
                                                 
                        </div>
                        <input name="add-new-item-notes" class="obj-form-control add-new-item-notes default-hide" placeholder="Write here and press enter">
                            <button id="add-item-notes" class="add-item-notes obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide  close-btn-notes"></span>
                    </div>


                </div>
            </div>
        </div>
    `;
    //console.log(i);

    //console.log(influencers[i].id);
    $('#profile-section').append(profileData);

    $("img.profile-image").on('error', handleError);

    getTagsDetails(tempUserData.id);

    // getTagsDetails(influencers[i].id);

    // getObjectivesDetails(influencers[i].id);
    // loadAllChecklistTags();
    // getPreloadedChecklist();

    // console.log('460')
    // setTimeout(() => {
        // loadGlobalScripts();
    // }, 1000)


    $("#profile_screen").show();

  

}

function setInfluencers(influencers) { 
    // console.log("Influencers....");
    // console.log(influencers); //console.log(${contactInfo[title].text});
    $("#influencer-listing").empty();

    for (let i = 0; i < influencers.length; i++) {
        var title_name = '';

   // console.log(influencers[i].template_status);
     
    if (influencers[i].bio_contact != '') {
            var contactInfo = JSON.parse(influencers[i].bio_contact);

            let title = contactInfo.findIndex(x => x.field_type == 'Title');
           // console.log(title);
            if (title != -1) {
                title_name = contactInfo[title].text;
            }
        }

        let profile_url_array = influencers[i].user_link.split('/');
        // console.log(profile_url_array);
        let inf_profile_img_url = '';
        if(influencers[i].template_flag == 1) {
           // console.log(influencers[i].template_flag);
            inf_profile_img_url = influencers[i].photo_uri;
        }else {
           //  console.log(influencers[i].template_flag);
            inf_profile_img_url = _config.baseUrl+'/public/images/'+influencers[i].photo_uri;
        }
        
        let profileId = profile_url_array[profile_url_array.length - 1];
        if (!$('#influencer-listing').has('[id="profile-id-'+profileId+'"]').length) {
            

            $("#influencer-listing").append(`
            <div class="row mt-4 rows" profile-id="${profileId}" id="profile-id-${influencers[i].id}">

                <input type="checkbox" name="inf" value="${ influencers[i].id }" class="inf_selection"> 
                <div data-id="${influencers[i].index_no}" class="col-2 p-0 showDetail" style="text-align: right; padding-right: 8px !important;">
                    ${(influencers[i].reminder)?'<span class="bell"><img src="assets/images/notify.png"></span>':''}
                <img src="${inf_profile_img_url}" class="profile ${influencers[i].template_flag}"/>
                </div>
                <div data-id="${influencers[i].index_no}" class="col-7 list p-0 showDetail">
                <h3 class="name">${ influencers[i].ful_name }</h3>
                <h3 class="date">` + title_name + `</h3>
                </div>
                <div class="col-3 delete_img pr-0">
                    <span title="${influencers[i].new_activity_count} activities" class="new-activity ${(influencers[i].new_activity_count ==0)?'hide-label':''}" data-id="${influencers[i].index_no}" title="${influencers[i].new_activity_count}" >
                        ${influencers[i].new_activity_count}
                    </span>
                    <i data-id="${influencers[i].index_no}" class="fa fa-star toggle-flag ${(influencers[i].is_favourite ==1)?'checked':''} mr-3"></i>
                    <i data-id="${influencers[i].index_no}" user-link="${influencers[i].user_link}" title="Sync latest activities" class="fa fa-refresh mr-3 sync-profile"></i>
                    <i data-id="${influencers[i].index_no}" title="Delete" class="fa fa-trash text-danger remove"></i>
                    
                </div>
                <div class="col-12 p-0">                   
                        <h3 class="date text-right">Last Scan: ` + (influencers[i].last_scan != null ? formatDate(influencers[i].last_scan) : 'NA') + `</h3>
                        
                    </div>
            </div>
            `);
        }
        setTimeout(function() {
            if ($('#search').val() != '') {
                $('#search').focus();
                $('#search').keyup();
            }
        }, 200);
    }

    $("img.profile").on('error', handleError);
}

function removeInfuencer(i) {

    $("#deleteInfluencerModal button").attr('disabled', true)
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/delete-influencer",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            data: { influencer_id: influencers[i].id },
            success: function(res) {
                if (res.status) {
                    $("#deleteInfluencerModal button").attr('disabled', false);
                    $("#deleteInfluencerModal").modal('hide');
                    toastr["success"](res.message);
                    influencers.splice(i, 1);
                    showListingAfterDelete();
                    setInfluencers(influencers);
                    updateProgressBar(0,'deleted');
                    //showListingAfterDelete();
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });
}

function toggleFlag(i, favourite) {
    influencers[i].is_favourite = favourite;

    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/update-favourite",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            data: { influencer_id: influencers[i].id, favourite: favourite },
            success: function(res) {
                //console.log(res);
                if (res.status) {

                    toastr["success"](res.message);
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });
}

function showLoginScreen() {
    $("#login_screen").show();
    $("#profile_screen").hide();
    $("#home_screen").hide();
    $("#forgot_screen").hide();
    $("#settings_screen").hide();
}

function showListingScreen() {
    $("#login_screen").hide();
    $("#home_screen").show();
}

function showForgotScreen() {
    $(".tab").hide();
    $("#forgot_screen").show();
}

function currentDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    return output;
}

function showListing(profile = '', clearAdded = false) {
    //console.log("showListing");
    $('#loader').show();
    showListingScreen();
    today = currentDate();
    var current = parseInt($("#current_influencer").html());
    var postData = { today: today, skipRow: current };
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {

                    if (clearAdded) {
                        //$('#loader').show();
                        influencers = [];
                    }else {
                        influencers =  influencers; 
                    }
                    //console.log("influencers", influencers);
                    //influencers = [];
                    res.data.forEach(function(inf, i) {
                        inf.index_no = i;
                        influencers.push(inf);
                    });
                    //console.log(res);
                    $("#total_influencer").html(res.totalInfluencers);
                    $("#current_influencer").html(influencers.length);
                    //influencers = res.data;
                    setInfluencers(influencers);

                    if (profile != "") {
                        setTimeout(() => {
                            $('#loader').hide();
                            // if ($("#influencer-listing > div[profile-id = '" + profile + "']").length > 0) {
                            toastr["success"]('Influencer added successfully');
                            // } else {
                            //     toastr["error"]('Try again later.');
                            // }
                        }, 200)
                    }
                    var total = parseInt($("#total_influencer").html());
                    current = parseInt($("#current_influencer").html());
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }

                    $(".postsCount").text(res.todaysPosts)
                    if (typeof _ref.lastScreen != "undefined") {
                        displayLastScreen(_ref.lastScreen);
                    } else {
                        $('#loader').hide();
                    }

                    $(document).on("click", '.remove', function() {
                        removeConfirmation($(this).data("id"));
                        // removeInfuencer($(this).data("id"));
                    })
                    /*$(document).on("click", '.toggle-flag', function() {
                       
                       
                       if ($(this).hasClass("checked")) {
                        

                            toggleFlag($(this).data("id"), 0);
                        } else {
                           

                            toggleFlag($(this).data("id"), 1);
                        }
                        $(this).toggleClass('checked');
                    });*/
                    $(document).on("click", '.showDetail', function() {
                        showDetail($(this).data("id"));
                        //console.log($(this).data("id"));
                    });
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });
}

function showListingAfterDelete(profile = '') {
    $('#loader').show();
    today = currentDate();
    var current = parseInt($("#current_influencer").html());
    // var postData = { today: today, skipRow: current };
    var postData = { today: today, skipRow: 0 };
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
                    influencers = [];
                    res.data.forEach(function(inf, i) {
                        inf.index_no = i;
                        influencers.push(inf);
                    });
                    //influencers = res.data;

                    $("#total_influencer").html(res.totalInfluencers);
                    $("#current_influencer").html(influencers.length);
                    setInfluencers(influencers);

                    var total = parseInt($("#total_influencer").html());
                    current = influencers.length;
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }
                    $('#loader').hide(); 
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });

}
/*
function loadTimeline() {
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-timeline",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) 
              {
                if (res.status) {
                    timelineArray = res.data;
                    renderTimeline(timelineArray);
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });
}*/

function renderTimeline(data) {

   // console.log("data", data);
    
    var all = posts = comments = '';
    $.each(data, function(index, item) {
        all += `
            <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                <a href="` + item.url + `" target="_blank">`;

        if (item.platform == 'youtube') {

            all += `<span class="youtube-item-wrap">
                                    <img src="` + item.thumbnail + `">
                                    <span>
                                        <p>` + item.text + `</p>
                                        <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                    </span>
                                </span>`;
        } else if (item.platform == 'facebook') {

            all += `<h4>`;
            if (item.event == 'published new post.') {
                all += `<i class="fa fa-sticky-note-o post-icon"></i>`;
            } else {
                all += `<img src="assets/images/chat.png">`;
            }
            all += item.author + `  ` + item.event + `</h4>
                        <p>` + (item.text != null ? item.text : '') + `</p>
                        <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>`;

        } else if (item.platform == 'instagram') {

            all += `<span class="youtube-item-wrap">
                                    <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                    <span>
                                        <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                        <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                    </span>
                                </span>`;
        }else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                if(item.thumbnail != null){
                    all += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    all += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
            }else if(item.event == 'react' || item.event == 'comment'){

                    all += `<h4>`;
                                if(item.event == 'react'){
                                    all += `<i class="fa fa-sticky-note-o post-icon"></i>`;
                                }else{
                                    all += `<img src="assets/images/chat.png">`    
                                }
                                
                                all += item.author + ` ` + item.text + `
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;

            }

        }
        all += `</a>
            </div>
        `;

        /*if (item.platform == 'youtube') {

            posts += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                        <a href="` + item.url + `" target="_blank">
                            <span class="youtube-item-wrap">
                                <img src="` + item.thumbnail + `">
                                <span>
                                    <p>` + item.text + `</p>
                                    <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                </span>
                            </span>
                        </a>
                    </div>`;
        } else if (item.platform == 'facebook') {
            if (item.event == 'published new post.') {
                posts += `
                <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                    <a href="` + item.url + `" target="_blank">
                        <h4><i class="fa fa-sticky-note-o post-icon"></i> ` + item.author + `  ` + item.event + `</h4>
                        <p>` + (item.text != null ? item.text : '') + `</p>
                        <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                    </a>
                </div>`;
            } else if (item.event == 'added new comment.') {
                comments += `
                <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                    <a href="` + item.url + `" target="_blank">
                        <h4><img src="assets/images/chat.png"> ` + item.author + `  ` + item.event + `</h4>
                        <p>` + (item.text != null ? item.text : '') + `</p>
                        <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                    </a>
                </div>`;
            }
        } else if (item.platform == 'instagram') {

            posts += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                        <a href="` + item.url + `" target="_blank">
                            <span class="youtube-item-wrap">
                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                <span>
                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                </span>
                            </span>
                        </a>
                    </div>`;
        }*/

    });

    $("#timeline #all").html(all);
    $("#timeline #Posts").html(all);
    $("#timeline #comment").html(all);
}

function loginApp() {
    let username = $("#username").val();
    let password = $("#password").val();
    $.ajax({
        url: _config.apiBaseUrl + "/login",
        type: "POST",
        data: { email: username, password: password },
        success: function(res) {
            $("#login_form button[type='submit']").attr('disabled', false).text('LOGIN');
            if (res.status) {
                $("#login_form")[0].reset();
                chrome.runtime.sendMessage({action:'reloadStorageData'});
                chrome.storage.local.set({
                    authToken: res.token,
                    defaultEmailApp: res.user.default_email_app
                }, function() {
                    // showListing();
                    // Change with new logic
                    $("#total_influencer").text('0');
                    $("#current_influencer").text('0');


                    // chrome.runtime.sendMessage({action:'startLinkedInScrapping'});
                    //$("#total_timeline").text('0');
                    //$("#current_timeline").text('0');
                    getAllInfluenerDetails(true);
                    getAllTimelineDetails(true)
                    //loadTimeline();
                    // loadAllTags();
                });
            } else {
                toastr["error"](res.message);
            }
        },
        error: function(jqXHR, exception) {
            $("#login_form button[type='submit']").attr('disabled', false).text('LOGIN');
            toastr["error"]("Request failed: " + exception);
        }
    });
}

function forgotPassword() {
    let username = $("#email").val();
    $.ajax({
        url: _config.apiBaseUrl + "/forgot-password-email",
        type: "POST",
        data: { email: username },
        success: function(res) {
            if (res.status) {
                $("#forgot_form button[type='submit']").attr('disabled', false).text('Mail Sent');
                toastr["success"](res.message);
            } else {
                $("#forgot_form button[type='submit']").attr('disabled', false).text('Try Again');
                toastr["error"](res.message);
            }
        },
        error: function(jqXHR, exception) {
            $("#forgot_form button[type='submit']").attr('disabled', false).text('Send Mail');
            toastr["error"]("Request failed: " + exception);
        }
    });
}

function removeConfirmation(index) {
    $("#idToDelete").val(index);
    $("#deleteInfluencerModal").modal('show');
}

function updateLocalVariable(index, key, value) {

    //console.log(key);
    var column = 'bio_social';
    var storeInArray = true;
    if (key == 'Email' || key == 'Mobile' || key == 'Address' || key == 'Title') {
        column = 'bio_contact';
        storeInArray = false;
    }

    //console.log(column);
    //console.log(tempUserData); 

    if(index == -1){
        if(key == 'Email' || key == 'Mobile' || key == 'Address' || key == 'Title'){
           var columnJSON = JSON.parse(tempUserData.bio_contact);
        }else if(key == 'Ful_name'){
            column = 'ful_name';
        }else{
            var columnJSON = JSON.parse(tempUserData.bio_social);
        }
    }else{
        var columnJSON = JSON.parse(influencers[index][column]);
    }
    //console.log(columnJSON);

    if(key != 'Ful_name'){
        let keyIndex = columnJSON.findIndex(x => x.field_type == key);
        //console.log(keyIndex);
    
        if (storeInArray) {
            columnJSON[keyIndex].text = [value];
        } else {
            columnJSON[keyIndex].text = value;
        }
    }
    if(index == -1){ 
        if(key == 'Email' || key == 'Mobile' || key == 'Address' || key == 'Title'){            
            tempUserData.bio_contact = JSON.stringify(columnJSON);
        }else if(key == 'Ful_name'){
            tempUserData.ful_name = value;
        }else{
            tempUserData.bio_social = JSON.stringify(columnJSON);
        }   
        //influencers[index][column] = JSON.stringify(columnJSON);       
        addContactDetails();
     }else{
         influencers[index][column] = JSON.stringify(columnJSON);
          showDetail(index, false);
     }

        // influencers[index][column] = JSON.stringify(columnJSON);

        // console.log(influencers[index][column])

        //  showDetail(index);
    

}

function formatDate(dateString) {
    var allDate = dateString.split(' ');
    var thisDate = allDate[0].split('-');
    var thisTime = allDate[1].split(':');
    var newTime = thisTime[0] + ':' + thisTime[1];
    var newDate = [thisDate[1], thisDate[2], thisDate[0]].join("-");
    return newDate + ' ' + newTime;
}

function handleError() {
    this.src = "/assets/images/user-avatar.png";
}

$(document).ready(function() {

    chrome.runtime.sendMessage({action:'fireTestUrl'});

    // $(".logo,.head_logo").parent().attr('href',_config.baseUrl); 
    $(".logo,.head_logo").parent().attr('href', "javascript:void(0)");
    $(".signup-link").attr('href', _config.baseUrl);
    $(".upgradeBtn a").attr('href', _config.upgradeUrl);
    $(".sample-csv-link").attr('href', _config.baseUrl+'/public/Dream100-sample.xlsx');

    chrome.storage.local.get(['authToken', 'userId', 'linkedInLimitExceeded'], function(_ref) {
        if (_ref.authToken) {
            // showListing();
            getAllInfluenerDetails(true);
            loadAllTags();
            chrome.runtime.sendMessage({action:'checkLinkedInLogin'});
            //loadTimeline();
            //getAllTimelineDetails();
        } else {
            showLoginScreen();
        }

        if(_ref.linkedInLimitExceeded){
            let text = "<div class='limit_reached'>Linkedin syncing limit reached for today.</div>";
            $("#home_screen .header").after(text)
            $("#settings_screen .header").after(text)
            $("#profile_screen .header").after(text)
        }
    });

    $(".nav-tabs a").click(function() {
        $(this).tab('show');
    });


    $(document).on("click",".addManualfb",function() {
        //console.log('console log 123')
        $("#facebookProfileUrl").val('');
    });

    $(document).on("click",".copyInfluencerName",function() {
        copyText($(this).attr('data-value'), 'InfluencerName');
    })
    $(document).on("click",".copyTitle",function() {
        copyText($(this).attr('data-value'), 'InfluencerTitle');
    })

    $(document).on("click",".copyEmail",function() {
        copyText($(this).attr('data-value'), 'Email');
    });
    $(document).on("click",".copyNumber",function() {
        copyText($(this).attr('data-value'), 'Number');
    });
    $(document).on("click",".copyAddress",function() {
        copyText($(this).attr('data-value'), 'Address');
    });


    $('.sort').click(function() {

        // let arrayinfluencers = influencers;
        // let obj = [];
        let sort = $(this).attr("data-sort");
        //console.log(sort);
        if (sort == 'asc') {
            //console.log('sort asc');
            $(this).attr("data-sort", 'desc');
            $(this).attr("data-column", 'ful_name');
            sortColumn = 'ful_name';
            sortOrder = 'desc';
            // obj = arrayinfluencers.sort((a, b) => a.ful_name.localeCompare(b.ful_name));
        } else {
            //console.log('sort desc');
            // $(this).data("sort", 'asc');
            $(this).attr("data-sort", 'asc');
            $(this).attr("data-column", 'ful_name');
            sortColumn = 'ful_name';
            sortOrder = 'asc';
            // obj = arrayinfluencers.sort((a, b) => b.ful_name.localeCompare(a.ful_name));
        }

        // getSearchResults('');
        // setInfluencers(obj);
        $("#current_influencer").html('0');
        getAllInfluenerDetails(true);
    });
    
    // Clear search placeholder on focus on dashobard
    $('[placeholder]').focus(function () {
        $(this).attr('data-text', $(this).attr('placeholder'));
        $(this).removeAttr('placeholder');
      }).blur(function () {
        $(this).attr('placeholder', $(this).attr('data-text'));
      });
    
      let previousValue = '';
    // $('#search').on('keyup blur', function(event) {
    //     var currentValue = $(this).val();
    //    // if (e.key === 'Enter' || e.keyCode === 13) {
    //         //let searchStr = $(this).val();
    //         //getSearchResults(searchStr);
    //         if (currentValue !== previousValue) {
    //             influencers = [];
    //             previousValue = currentValue;
    //             $("#current_influencer").html('0');
    //             getAllInfluenerDetails(true);
    //         }
    //     //}

    // });



    function debounce(func, delay) {
        let timerId;
      
        return function(...args) {
          clearTimeout(timerId);
          timerId = setTimeout(() => {
            func.apply(this, args);
          }, delay);
        };
      }
      
      function performSearch(query) {
        // Perform the search operation using the query and fetch data from API
        // fetch(`https://api.example.com/search?q=${query}`)
        //   .then(response => response.json())
        //   .then(data => {
        //     // Process and display the search results
        //     console.log(data);
        //   })
        //   .catch(error => {
        //     console.error('Error occurred:', error);
        //   });
        getSearchResults(query);
      }
      
      const searchInput = document.getElementById('search');
      
      searchInput.addEventListener('input', debounce(function() {
        const query = searchInput.value;
        performSearch(query);
      }, 500));
      


    $("#login_btn").click(function() {
        $("#login_form").validate({
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                }
            },
            messages: {
                username: {
                    required: "Username can not be empty"
                },
                password: {
                    required: "Password can not be empty"
                }
            },
            submitHandler: function() {
                $("#login_form button[type='submit']").attr('disabled', true).text('Processing');
                loginApp();
                return false;
            }
        });
    });

    $("#forgot_btn").click(function() {
        $("#forgot_form").validate({
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                email: {
                    required: "Email can not be empty"
                }
            },
            submitHandler: function() {
                $("#forgot_form button[type='submit']").attr('disabled', true).text('Processing');
                forgotPassword();
                return false;
            }
        });
    });

    $('.log-out').click(function() {
        $("#influencer-listing").empty();

        chrome.storage.local.set({
            "get_all_tags":'',
            "get_global_tags":'',
            "get_global_checklists":'',
            "get_global_scripts":''
        });
        chrome.storage.local.clear(function(obj) {
            showLoginScreen();
        });
    });

    $(".home_icon").click(function() {
        $("#home_screen").show();
        $("#settings_screen").hide();
        $(".setting_icon").show();
    })

    $(document).on('click', '.sync-profile', function() {
        //console.log('syncProfile')
        let url = $(this).attr('user-link');

        let inf_index = $(this).attr('data-id');

        chrome.runtime.sendMessage({ action: "get-linkedin-custom-process-status"}, (response) => {
            //console.log('get-linkedin-custom-process-status')
            //console.log(response.linkedInCustomSync)

            if(response.linkedInCustomSync){
                toastr["error"]('Other influencer syncing in process, please wait for some time.');
                return false;
            }else{
                toastr["success"]('Sync Started will be completed soon');

                if (url != "") {
            
                    chrome.runtime.sendMessage({ action: "get-facebook-profile", facebookProfileUrl: url, type:'update' }, (response) => {

                        var social_data = influencers[inf_index].bio_social;
                        if (social_data != "") {
                            // console.log(1)
                            social_data = JSON.parse(social_data);
                            yt_index = social_data.findIndex(x => x.field_type == "YouTube");
                            var insta_index = social_data.findIndex(x => x.field_type == "Instagram");
                            var linkedIn_index = social_data.findIndex(x => x.field_type == "LinkedIn");
                            var facebook_index = social_data.findIndex(x => x.field_type == "Facebook");
                            var timeOut = 0;
                            if (social_data[insta_index].text['0'] != '') {
                                // console.log(2)
                                customInstaSyncing = true;
                                scrapInstagramPosts(social_data[insta_index].text['0'], influencers[inf_index].id);
                                timeOut = 4000;
                            }

                            if (social_data[facebook_index].text['0'] != '') {
                                // console.log(2)
                                customInstaSyncing = true;
                                scrapFacebook(social_data[facebook_index].text['0'], influencers[inf_index].id);
                                timeOut = 4000;
                            }

                            if (social_data[linkedIn_index].text['0'] != '') {
                                chrome.runtime.sendMessage({action:'customSyncLinkedIn',bio_social:social_data,influencer_id:influencers[inf_index].id})
                            }

                            setTimeout(() => {
                                // console.log(3)
                                if (social_data[yt_index].text['0'] != '') {
                                    // console.log(4)
                                    customSyncing = true;
                                    scrapYoutubeVideos(social_data[yt_index].text['0'], influencers[inf_index].id)
                                } else {
                                    // console.log(5)
                                    syncingCompletedMessage(true);
                                }

                            }, timeOut);
                        } else {
                            // console.log(6)
                            syncingCompletedMessage(true);
                        }
                    });
                }
            }
        })

    
        // toastr["success"]('Sync Started will be completed soon');

        
    })

    // $('#fb-search').click(function() {
    //     let url = $("#facebookProfileUrl").val();
    //     if (url != "") {
    //         $('#loader').show();
    //         chrome.runtime.sendMessage({ action: "get-facebook-profile", facebookProfileUrl: url }, (response) => {
    //             console.log(response);
    //             let profile_url_array = url.split('/')
    //             let profile_id = profile_url_array[profile_url_array.length - 1];

    //             setTimeout(() => {
    //                 showListing(profile_id);
    //             }, 9000)

    //         });
    //     }
    // });

    $(".delete-influencer").click(function() {
        removeInfuencer($("#idToDelete").val());
    });

    $(document).on('click', '.edit-info-popup', function() {
        let key = $(this).attr('data-key');
        let value = $(this).attr('data-value');
        let index = $(this).attr('data-id');

        // console.log(key);
        // console.log(value);
        // console.log(index);

        blankTemplateIndex = index;


        $("#updateFieldLabel").text(key + ':');
        $("#keyToUpdate").val(key);
        $("#fieldToUpdate").val(value);
        $("#idToUpdate").val(index);
        $("#fieldError").html('');
        $(".popup_msg").html('');
        $("#myModal").modal({ backdrop: 'static', keyboard: false });
        $("#myModal button").removeClass('disabled-btn');
    });

    //######################## START EVENT CODE OF TAGS ##################//
    $('#follow .tag-filter-dropdown').on('change', function() {

         

          $('#loader').show();

        // Code Changed on 8 Nov 2021 To add work in paging
        // selected_tags = this.value;
        // let influencers_new = [];

        // if (selected_tags != "") {
        //     var getInfulencer_ids = global_tags.filter(function(item) {
        //         return (item.name.indexOf(selected_tags) >= 0);
        //     });

        //     console.log(getInfulencer_ids);


        //     new_influencers = [];

        //     getInfulencer_ids.forEach(function(v) {
        //         new_influencers.push(v.id);
        //     })

        //     influencers_new = influencers.filter((oneM) => {
        //         return new_influencers.indexOf(oneM.id) >= 0
        //     })
        // } else {
        //     influencers_new = influencers;
        // }
        // setInfluencers(influencers_new);
        $("#current_influencer").html('0');
        getAllInfluenerDetails(true);
    });

    $('#timeline .tag-filter-dropdown').on('change', function() {
        
        //dr_activities = [];
        //$("#loader").show();
        $("#current_timeline").text('0');
        getAllTimelineDetails(true);

    });

    $(document).on('click', 'body', function(e) {
        $('#tagSuggestionList').hide();
        //$(this).prop('readonly',true);
        //saveTags(this);         
    });

    $(document).on('click', '#tagSuggestionList li.suggestion', function(e) {
        $('#tagSuggestionList').hide();

        var tagInputEle = $('.tagsinputbox');
        tagInputEle.tagsinput('add', $(this).text());
        saveTags(this);
    });

    $(document).on('keyup', '.get-tags input', function(e) {
        this.value = this.value.toLocaleUpperCase();

        // GET AUTOCOMPLETE DATA FROM TAGS
        tagsAutoCompleteData(this);
        if (e.keyCode == 13) {
            $(this).prop('readonly', true);
            saveTags(this)
        }

    });


    function tagsAutoCompleteData(elem) {
        var keyword = $(elem).val();
        chrome.storage.local.get(["saved_influencer_tags"], function(result) {
            if (result.saved_influencer_tags != undefined && result.saved_influencer_tags != '') {
                //console.log(result.saved_influencer_tags);
                $('#tagSuggestionList').html('').hide();
                if (keyword != "") {
                    var matchedRecords1 = result.saved_influencer_tags.filter(function(item) {
                        return (item.indexOf(keyword) >= 0);
                    });

                    //console.log(inputTags);
                    if ($('.tagsinputbox option').length > 0) {
                        inputTags = [];
                        $('.tagsinputbox option').each(function(item) {
                            inputTags.push($(this).attr('value'));
                        })
                        var matchedRecords = matchedRecords1.filter(function(obj) { return inputTags.indexOf(obj) == -1; });
                        //console.log(matchedRecords);
                    } else {
                        var matchedRecords = result.saved_influencer_tags.filter(function(item) {
                            return (item.indexOf(keyword) >= 0);
                        });
                        //console.log(matchedRecords);
                    }


                    //console.log(matchedRecords);
                    var suggestionKeywords = '';
                    matchedRecords.forEach(function(item, index) {
                        //console.log(item);
                        if (item != "") {
                            suggestionKeywords += `<li class="list-group-item suggestion">` + item + `</li>`
                        }
                    })
                    $('#tagSuggestionList').html(suggestionKeywords).show();
                }
            }
        });
    }

    function saveTags(elem) {
        var inputTags = [];

        let influencers_id = $('#objectives').attr('data-id');

        $('.tagsinputbox option').each(function(item) {
            inputTags.push($(this).attr('value'));
        })

        if (inputTags.length > 0) {
            $(elem).removeAttr('readonly');
            updateTagsDetails(influencers_id, inputTags);
        }
    }

    $(document).on('click', 'span[data-role="remove"]', function() {
        //console.log('yesss');
        let influencers_id = $('#objectives').attr('data-id');
        $(this).parent().remove();

        var inputTags = [];
        $('.tag').each(function(item) {
            //console.log(item);
            let inputTag = $(this).text();
            inputTags.push(inputTag);
        });
        //console.log(inputTags);
        //console.log(influencers_id);
        updateTagsDetails(influencers_id, inputTags);
    });

    //######################## END EVENT CODE OF TAGS ##################//


    $("#updateInfo").on('click', function() {

        let key = $("#keyToUpdate").val();
        let value = $("#fieldToUpdate").val();
        let index = $("#idToUpdate").val();
        let influencer_id = '' ;

        //console.log(value);           

        //console.log(blankTemplateIndex);

        if( blankTemplateIndex == -1){
              influencer_id =  tempUserData.id;
        }else{             
              influencer_id = influencers[index].id;
        }
       
        //console.log(influencer_id); 

        customSyncing = false;
        //console.log(key)
        //console.log(key.toLowerCase())
        //console.log(value)

       //return false;

        if (value == '') {
            $("#fieldError").html('<span class="text-danger">Field is required.</span>');
            return false;
        }

        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
            var closePopup = true;
 
            if (key.toLowerCase() == 'facebook') {
                $('#loader').show();
                let url = value;
                let profile_url_array = url.split('/')
                let profile_id = profile_url_array[profile_url_array.length - 1];

                if (value.indexOf('facebook') > -1) {
                    closePopup = false;
                    scrapFacebook(value, influencer_id);
                } else {
                    toastr["error"]("Invalid URL.");
                    return false;
                }
               
            }else if(key.toLowerCase() == 'linkedin'){ 
                $('#loader').show();
                let url = value;
                let profile_url_array = url.split('/')
                let profile_id = profile_url_array[profile_url_array.length - 1];

                if (value.indexOf('linkedin') > -1) {
                    closePopup = false;
                    scrapLinkedIn(value, influencer_id);
                } else {
                    toastr["error"]("Invalid URL.");
                    return false;
                }
                

            }else if (key.toLowerCase() == 'youtube') {

                /*if(!(value.indexOf('/channel/')>-1)){
                    toastr["error"]("Invalid channel URL.");
                    return false;
                }
                closePopup = false;
                scrapYoutubeVideos(value,influencer_id);*/

                if ((value.indexOf('/c/') > -1) || (value.indexOf('/channel/') > -1) || (value.indexOf('/user/') > -1)) {
                    closePopup = false;
                    scrapYoutubeVideos(value, influencer_id);
                } else {
                    toastr["error"]("Invalid URL.");
                    return false;
                }
            } else if (key.toLowerCase() == 'instagram') {

                if (value.indexOf('instagram.com/') > -1) {
                    closePopup = false;
                    scrapInstagramPosts(value, influencer_id);
                } else {
                    toastr["error"]("Invalid URL.");
                    return false;
                }

            }
            $.ajax({
                url: _config.apiBaseUrl + "/update-info",
                type: "POST",
                data: { influencer_id: influencer_id, key: key, value: value },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                   
                         //console.log(res);

                    if (res.status) {
                        getinfluencerById(influencer_id);
                        setTimeout(() => {
                            if(res.usedLimit != '-1'){
                                updateProgressBar(res.usedLimit);
                            }
                            if (closePopup) {
                                toastr["success"](res.message);
                                $("#myModal").modal('hide');
                            }
                            updateLocalVariable(index, key, value);
                            if (key == 'Title') {
                                showListingAfterDelete();
                            } 
                        }, 500);
                        

                        
                    }
                },
                error: function(jqXHR, exception) {
                    toastr["error"]("Request failed: " + exception);
                }
            });
        });
    });



    $(document).on('click', '.back-link', function() {
        $("#home_screen").show();
        $("#profile_screen").hide();
        //console.log('back link clicked')
        if(indexNoToRemove >= 0){
            //console.log('index to remove condition true')

            //console.log(influencers)
            let indexToRemove = influencers.findIndex(x => x.index_no == indexNoToRemove); 
            influencers.splice(indexToRemove,1);
            //console.log(influencers)
        }
        backtoListing(); // Added by Rajinder
    })
    function backtoListing(){
        
            today = currentDate();
            var current = 0;
            var postData = { today: today, skipRow: current };
            chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
                $.ajax({
                    url: _config.apiBaseUrl + "/get-latest-influencers-v3",
                    type: "POST",
                    data: postData,
                    headers: {
                        "Authorization": "Bearer " + _ref.authToken
                    },
                    success: function(res) {
                        if (res.status) { 
                            influencers = [];
                            influencers = res.data;
                            res.data.forEach(function(inf, i) {
                                influencers[i].index_no = i;
                                //inf.index_no = i;
                                //influencers.push(inf);
                            });

                            setInfluencers(influencers);
                            $(".postsCount").text(res.todaysPosts);
    
                            chrome.storage.local.set({'webhookKey': res.webhookKey});
    
                            $(document).on("click", '.remove', function() {
                                removeConfirmation($(this).data("id"));
                                // removeInfuencer($(this).data("id"));
                            })
                            /*$(document).on("click", '.toggle-flag', function() {
    
                                if ($(this).hasClass("checked")) {
                                    toggleFlag($(this).data("id"), 0);
                                } else {
                                    toggleFlag($(this).data("id"), 1);
                                }
                                $(this).toggleClass('checked');
                            });*/
                            $(document).on("click", '.showDetail', function() {
                                showDetail($(this).data("id"));
                            });
                        }
                    },
                    error: function(jqXHR, exception) {
                        console.log("Request failed: " + exception);
                    }
                });
            });
       
    }
    $("#forgot").click(function() {
        showForgotScreen();
    })

    $("#backToLogin").click(function() {
        showLoginScreen();
    });

    $(document).on('click', '.head_logo', function() {
        $(".tabs").hide();
        $("#home_screen").show();
        $(".setting_icon").show();
        $(".followedTab").addClass('active');
        $(".timelineTab").removeClass('active');
        $("#follow").addClass('active');
        $("#timeline").removeClass('active');

    });


    $(document).on('click', '.new-activity', function() {
        var index = $(this).attr('data-id');
        var element = $(this);
        var influencer_id = influencers[index].id;
        // console.log();
        showDetail(index);
        element.hide();
        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/update-view-count",
                type: "POST",
                data: { influencer_id: influencer_id },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                    //console.log(res)
                    if (res.status) {

                    }
                },
                error: function(jqXHR, exception) {
                    toastr["error"]("Request failed: " + exception);
                }
            });
        });
    });

    var lastProfileVisitIndex = 0;

    $(document).on('click', '.timelineTab', function() {
        //$("#loader").show();
        updateLastScreen('timeline', 'allPosts');
        $("#current_timeline").html(0);
        getAllTimelineDetails(true, true);
    });
    $(document).on('click', '.timelineAllTab', function() {
         //console.log('hey jiten All');
         //$("#loader").show();
        //dr_activities = [];
        updateLastScreen('timeline', 'allPosts');
        $("#current_timeline").text('0');
        getAllTimelineDetails(true);
    });
    $(document).on('click', '.timelinePostsTab', function() {
         //console.log('hey jiten posts');
         //$("#loader").show();
        //dr_activities = [];
        $("#current_timeline").text('0');
        updateLastScreen('timeline', 'onlyPosts');
        getAllTimelineDetails(true);
    });
    $(document).on('click', '.timelineCommentsTab', function() {
        updateLastScreen('timeline', 'onlyComments');
        $("#current_timeline").text('0');
        getAllTimelineDetails(true);
    });
    $(document).on('click', '.followedTab', function() {
        updateLastScreen('dashboard', false);
    });

    $(document).on('click', '.showDetail', function() {
        lastProfileVisitIndex = $(this).attr('data-id');
        
        //console.log('showDetail');
        updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'all');
        //console.log(influencers[lastProfileVisitIndex]);
        chrome.storage.local.set({'selectedProfileDetails': influencers[lastProfileVisitIndex]});

        setTimeout(() => {
            
            if (global_var_scripts.length > 0) {
                showGlobalScripts(global_var_scripts);
            } else {
                loadGlobalScripts();
            }
        }, 2000)

    });

    // HIDE PROFILE STATS FROM PROFILE TABS.
    $(document).on('click', '.profileInterest', function() {
        //console.log('profile');
        updateLastScreen('profile', 'interests', lastProfileVisitIndex);
    });

    $(document).on('click', '.profileTimeline', function() {
        updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'all');
    });

    $(document).on('click', '.profileTimelineAll', function() {
        //console.log('profileTimelineAll');
        updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'all');
    });

    $(document).on('click', '.profileTimelinePosts', function() {
        //console.log('profileTimelinePosts');
        updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'posts');
    });

    $(document).on('click', '.profileTimelineComments', function() {
        //console.log('profileTimelineComments');
        updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'comments');
    });

    $(document).on('click', '.back-link', function() {
        updateLastScreen('dashboard', false);
    });

    $(document).on('change', '.global-timeline-filter', function() {
        //$("#loader").show();       
        //dr_activities = [];
        $("#current_timeline").text('0');
        getAllTimelineDetails(true);
    });

    $(document).on('change', '.influencer-timeline-filter', function() {
        var filter = $(this).val();
        $("#time .profileTimeline").show();
        if (filter != 'all') {
            $("#time .timeline-row").hide();
            $("#time .timeline-row." + filter).show();
        }
    });


    // ##################### CODE FOR OBJECTIVE JS  ################### //

    $(document).on('click', '.profileObjectives', function() {
        updateLastScreen('profile', 'objectives', lastProfileVisitIndex);
    });

    document.addEventListener('keydown', function(event) {
        var esc = event.which == 27,
            nl = event.which == 13,
            el = event.target,
            input = el.nodeName != 'INPUT' && el.nodeName != 'TEXTAREA',
            data = {};

        if (input) {
            if (esc) {
                // restore state
                document.execCommand('undo');
                el.blur();
            } else if (nl) {
                // save
                data[el.getAttribute('data-name')] = el.innerHTML;
                el.blur();
                event.preventDefault();
            }
        }
    }, true);

    $(document).on('click', '.edit-dream-outcome', function() {
        $(this).attr('contenteditable', 'true');
    });

    $(document).on('click', '.close-btn', function() {

    });

    $(document).on('blur', '.edit-dream-outcome', function() {
        let influencers_id = $('#objectives').attr('data-id');
        let heading_text = $('.edit-dream-outcome').text();
        //console.log(heading_text);
        //console.log('updateObjectivesDetails 1')
        updateObjectivesDetails(influencers_id, 'dream_outcome_heading', heading_text);
    });

    $(document).on('click', '.action_steps', function() {
        displayProgressBarObj('.action_steps', 'action_steps', this);
    });

    $(document).on('click', '.notes', function() {
        displayProgressBarObj('.notes', 'notes', this);
    });

    $(document).on('click', '.add-item-action_steps', function() {
        $('.add-new-item-action_steps').show();
        $('.add-new-item-action_steps').focus();
        $('.close-btn-actions').removeClass('default-hide');
        $('.close-btn-actions').show();
        $(this).hide();
    });

    $(document).on('click', '.close-btn-actions', function() {
        $('.add-new-item-action_steps').hide();
        $('.add-item-action_steps').show();
        $('.close-btn-actions').addClass('default-hide');
        $(this).hide();
    });

    $(document).on('click', '.close-btn-notes', function() {
        $('.add-new-item-notes').hide();
        $('.add-item-notes').show();
        $('.close-btn-notes').addClass('default-hide');
        $(this).hide();
    });

    $(document).on('click', '.add-item-notes', function() {
        $('.add-new-item-notes').show();
        $('.close-btn-notes').removeClass('default-hide');
        $('.close-btn-notes').show();
        $(this).hide();
    });

    $(document).on('keyup', '.add-new-item-action_steps', function(e) {
        if (e.keyCode == 13) {
            addNewItemsObjectives(this, 'action_steps', '.action_steps');
            $('.close-btn-actions').addClass('default-hide');
        }
    });

    $(document).on('keyup', '.add-new-item-notes', function(e) {
        if (e.keyCode == 13) {

            addNewNote();
            // addNewItemsObjectives(this, 'notes', '.notes');
            $('.fa-close').hide();
            $('.loading-notes').removeClass('default-hide');
        }
    });

    $(document).on('click', '.delete-actions', function() {
        $("#deleteObjectivesModal").modal('show');
        $('#objective_type').val('action_steps');
    });

    // $(document).on('click', '.delete-notes', function() {
        // $("#deleteObjectivesModal").modal('show');
        // $('#objective_type').val('notes');
    // });

    $(document).on('click', '.delete-objectives-actions', function() { 
        var type = $('#objective_type').val();
        if (type == 'action_steps') {
            deleteSelectedSteps('action_steps', '.action_steps');
            chrome.storage.local.get(['selectedProfileDetails'],function(_ref){
                selectedInfluencers = _ref.selectedProfileDetails;
                getObjectivesDetails(selectedInfluencers.id);
            }); 
            
        } else {
            deleteSelectedSteps('notes', '.notes');
        }
    });

    $(document).on('click', '.add-notes-btn', function() {
        $('.notes-textarea').show();
    });

    $(document).on('click', '.main-action_steps label', function() {
        $(this).attr('contenteditable', 'true');
    });

    $(document).on('blur', '.main-action_steps label', function() {
        var label_name = '';
        var label_id = $(this).attr('check-id');
        label_name = $.trim($(this).text());
        getAllActionCheckboxes('.action_steps', 'action_steps', label_id, label_name);
        $(this).prev().val($.trim($(this).text()));
    });

    $(document).on('click', '.main-notes label', function() {
        $(this).attr('contenteditable', 'true');
    });

    $(document).on('blur', '.main-notes label', function() {
        var label_name = '';
        var label_id = $(this).attr('check-id');
        label_name = $.trim($(this).text());

        // console.log('getAllActionCheckboxes called', label_name, label_id)
        getAllActionCheckboxes('.notes', 'notes', label_id, label_name);
        $(this).prev().val($.trim($(this).text()));
    });

    // load all tags
    //loadAllTags();
    /******************* END CODE FOR OBJECTIVE JS  *******************/


    /***********************LOAD MORE INFLUENCER**********************************/

    $(document).on('click', '#btn_show_more', function() {
        $("#btn_show_more").text('Loading...');
        //loadMoreInfluencers();
        getAllInfluenerDetails();
    });
     $(document).on('click', '.btn-more-timeline', function() {
          $(this).text('Loading...');
          getAllTimelineDetails();
    });

    

    /***********************LOAD MORE INFLUENCER**********************************/

    /****************DELETE OBJECTIVE ITEMS*********************** */
    $(document).on('click', '.action-step-delete-icon', function(event) {  
        
        

       let index = $(this).attr('data-id');
       let parentDivId = $("#action-step-"+index);
      
       $('.main-action_steps').find('.selectedForDelete').removeClass("selectedForDelete");
       $('[data-id="action-step-' + index + '"]').addClass('selectedForDelete');  

       $(parentDivId).children("div").find("#"+index).prop("checked", true);
       displayProgressBarObj('.action_steps', 'action_steps', $(parentDivId).children("div").find("#"+index));
       $(".delete-actions").trigger("click");
       
    });
    
    /****************DELETE OBJECTIVE ITEMS*********************** */
});


function loadAllTags(functionName = null) {
    chrome.storage.local.get(['get_all_tags'], function(_ref) {
        getInfuExistTagsdetails = _ref.get_all_tags;

        //console.log(getInfuExistTagsdetails)
        var all_tags = [];
        var tags_html = `<option value="" >All</option>`;
        if(getInfuExistTagsdetails != '' && getInfuExistTagsdetails != undefined){
            if (getInfuExistTagsdetails.length > 0) {
                var single_all_tags = [];
                getInfuExistTagsdetails.forEach(function(item1) {
                    single_all_tag = JSON.parse(item1.tags);
                    if (single_all_tag != null) {
                        single_all_tag.forEach(function(item) {
                            if (item != null) {
                                global_tags.push({ id: item1.influencer_id, name: item });
                                all_tags.push(item);
                            }
                        });
                    }
                })
            } 
        }
        

        getAllTags = all_tags;
        
        let tagNames = Object.fromEntries(all_tags.map(s => [s.toUpperCase(), s]));
        let tag_names = Object.values(tagNames);
        assignedTags = tag_names;
        
        //  console.log(global_tags);


        chrome.storage.local.set({ 'saved_influencer_tags': tag_names });

        tag_names.forEach(function(item) {
            tags_html += `<option data-id="0" value="` + item + `" >` + item + `</option>`;
        })
        if (functionName != '') {
            $('.assign_global_tag_influencer_btn').text('Save');
            $('#selectinfluencerModal').modal('hide');
        }
        $('.tag-filter-dropdown').html(tags_html);
        
    });
            
}

function getObjectivesDetails(id) {

    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {

        $.ajax({
            url: _config.apiBaseUrl + "/get-objectives-info",
            type: "POST",
            data: { influencer_id: id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                let listOfActionsSteps = '';
                let listOfNotes = '';
                var dream_outcome_heading = "";
                if (res.status && res.data != null) {
                    setTimeout(function() {

                        
                        dream_outcome_heading = res.data.dream_outcome_heading != null ? JSON.parse(res.data.dream_outcome_heading) : '';;
                        if (res.data.action_steps != null) {

                            $('span.edit-dream-outcome').text(dream_outcome_heading);

                            let steps = [];
                            let status = '';

                            steps = JSON.parse(res.data.action_steps);
                            exists_infu_checklist = steps;
                            chrome.storage.local.set({ 'exists_infu_checklist': steps });
                            if (steps != null) {
                                steps.forEach(function(item, i) {
                                    if (item.status == 'true') {
                                        status = "checked";

                                    } else {
                                        status = '';
                                    }
                                    listOfActionsSteps += '<div class="row" id="action-step-'+ i +'" data-id="action-step-'+ i +'" >';
                                    listOfActionsSteps += '<div class="col-8 p-0" >';
                                    listOfActionsSteps += `<input type="checkbox" id="` + i + `" value="` + item.input + `" class="action_steps" ` + status + `>&nbsp;<label check-id="` + i + `"> ` + item.input + `</label>`;
                                    listOfActionsSteps += '</div>';
                                    
                                    listOfActionsSteps += '<div class="col-4 text-right">';
                                    listOfActionsSteps += '<i class="fa fa-trash action-step-delete-icon" data-id="' + i + '" id="' + item.input + '-' + i + '" ></i>';
                                    listOfActionsSteps += '</div>';
                                    listOfActionsSteps += '</div>';
                                    

                                });
                            }
                        }
                        $('.main-action_steps').html(listOfActionsSteps);
                        displayPorgressBarOnLoad('.action_steps', 'action_steps');

                        if (res.data.extra_links != null) {

                            let links = JSON.parse(res.data.extra_links);
                            let linksHtml = '';
                            $.each(links, function(index,item){
                                linksHtml += `
                                    <div class="form-group">
                                        <label class="single_link">`+item+`</label>
                                        <span class="edit_single_link">
                                            <i class="fa fa-edit"></i>
                                        </span>
                                        <span class="remove_single_link">
                                            <i class="fa fa-close"></i>
                                        </span>
                                    </div>
                                `;
                            });

                            $('.extra_links_wrap').html(linksHtml);
                            let linksAddBtnHtml = `<button class="add_link_btn">Add new link</button>`;
                            $('.addLinkBtnWrap').html(linksAddBtnHtml);

                        }else{

                            $('.extra_links_wrap').html('');
                            let linksAddBtnHtml = `<button class="add_link_btn">Add new link</button>`;
                            $('.addLinkBtnWrap').html(linksAddBtnHtml);

                        }

                        /*if (res.data.notes != null) {
                            let notes = [];
                            let status = '';
                            notes = JSON.parse(res.data.notes);
                            // console.log('notes',notes);
                            if (notes != null) {
                                notes.forEach(function(item, i) {
                                    if (item.status == 'true') {
                                        status = "checked";
                                    } else {
                                        status = '';
                                    }
                                    listOfNotes += `<input type="checkbox" id="` + i + `" value="` + item.input + `" class="notes" ` + status + ` data-added="` + item.date + `" data-reminder="`+item.reminder+`">
                                    <label check-id="` + i + `"> ` + item.input + `</label>
                                    <span class="notes-label-date" data-index="` + i + `">
                                        ` + formatNotesDate(item.reminder) + `
                                        <input type="text" class="calender calender_` + i + `" style="visibility:hidden;width: 1px;" value="`+item.reminder+`"> - 
                                        <i class="fa fa-clock-o clockIcon" aria-hidden="true" title="Created date"></i> <span class="added-date">`+ formatNotesDate(item.date, true) +` </span>
                                    </span>
                                    <br>`;
                                });
                            }
                        }
                        $('.main-notes').html(listOfNotes);

                        // initializeDatePicker();
                        displayPorgressBarOnLoad('.notes', 'notes');*/


                    }, 1000);
                }else{
                    $('.extra_links_wrap').html('');
                    let linksAddBtnHtml = `<button class="add_link_btn">Add new link</button>`;
                    $('.addLinkBtnWrap').html(linksAddBtnHtml);
                }
            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });

}


function formatNotesDate(dateString, returnDateOnly = false){
    // console.log(dateString);

    var date = '';
    if(dateString != undefined){
        var dateArray = dateString.split('-');
        var dd = dateArray[2];
        var mm = dateArray[1];
        date = mm + '/' + dd;
    }
    // var date = new Date(dateString);
    // console.log(date);
    // var dd = String(date.getDate()).padStart(2, '0');
    // var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = date.getFullYear();
    // date = mm + '/' + dd;

    if(returnDateOnly){
        return date; 
    }

    if(dateString == undefined){
        return "<span class='reminder_date'></span> <i class='fa fa-bell calenderIcon' aria-hidden='true' title='Add reminder'></i>";
    }
    return "<span class='reminder_date'>"+date+"</span> <i class='fa fa-bell calenderIcon text-danger' aria-hidden='true' title='Reminder'></i>";
}


function getTagsDetails(id) {
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {

        $.ajax({
            url: _config.apiBaseUrl + "/get-tags-info",
            type: "POST",
            data: { influencer_id: id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                var tagInputEle = $('.tagsinputbox');
                tagInputEle.tagsinput('refresh');

                //tagInputEle.tagsinput('add', '');
                if (res.status && res.data != null) {
                   
                    let get_tags = JSON.parse(res.data.tags);
                    if (get_tags != null) {
                        get_tags.forEach(function(item) {
                            tagInputEle.tagsinput('add', item);
                        })
                    }
                }

                $('.get-tags p.fetch').hide();
                $('.tagsinputbox').show();



            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
}

$(document).on('change', '.tagsinputbox', function() {
    adf_keyword = $(this).val();
    chrome.storage.local.get(["saved_influencer_tags"], function(result) {
        if (result.saved_influencer_tags != undefined && result.saved_influencer_tags != '') {

            newHistoryArray = result.saved_influencer_tags;
            adf_keyword.forEach(function(v, i) {
                if (result.saved_influencer_tags.indexOf(v) < 0) {
                    newHistoryArray.push(v);
                }
            })
            chrome.storage.local.set({ 'saved_influencer_tags': newHistoryArray });
        } else {
            chrome.storage.local.set({ 'saved_influencer_tags': adf_keyword });
        }
    })
})


$(document).on('change', '.preloaded-checklist', function() {
    let checklist_id = this.value;
    if (checklist_id != '') {

        let getSelectedChecklistItems = global_var_checklists.filter(function(item) {
            return (item.id == checklist_id)
        });
        let checklist_items_lists = getSelectedChecklistItems[0].checklist_items;
        let checklist_items_listsArr = JSON.parse(checklist_items_lists);
        //console.log(checklist_items_listsArr);
        let item_html = '';
        
        let parentElement = $(".main-action_steps");
        let childCount = parentElement.children("div").length;
        
        //console.log(childCount); // Output: 3

        checklist_items_listsArr.forEach(function(childItem, index) {
            let newIndex = childCount+index;
            item_html += '<div class="row" data-id="action-step-'+ newIndex +'" id="action-step-'+ newIndex +'" >';
            item_html += '<div class="col-8 p-0" >';
            item_html += `<input type="checkbox" id="0" value="` + childItem.input + `" class="action_steps preloaded-push">&nbsp;<label check-id="0" class="action_steps-label preloaded-push"> ` + childItem.input + `</label>`;
            item_html += '</div>';
            item_html += '<div class="col-4 text-right">';
            item_html += '<i class="fa fa-trash action-step-delete-icon" data-id="' + newIndex + '" id="' + childItem.input + '-' + newIndex + '" ></i>';
            item_html += '</div>';
            item_html += '</div>';
        })
        let influencers_id = $('#objectives').attr('data-id');

        let checkBoxValues = [];
        $('.action_steps').each(function(index) {

            let input_val = $(this).val();
            if (input_val != '') {
                checkBoxValue = {
                    input: input_val,
                    status: false
                };
                checkBoxValues.push(checkBoxValue);
            }

        });

        const action_steps = checkBoxValues.concat(checklist_items_listsArr);
        //console.log(action_steps);
        //console.log('updateObjectivesDetails 2')
        updateObjectivesDetails(influencers_id, 'action_steps', action_steps);
        $('.main-action_steps').append(item_html);
        //$('.main-action_steps').html(item_html);
    }



    /*var getInfulencer_ids = global_tags.filter(function(item) {
                return (item.name.indexOf(selected_tags) >= 0);
            });*/
});

//Global checklist display in objective
function getPreloadedChecklist() { 
    let global_var_checklists = [];
    chrome.storage.local.get(['get_global_checklists'], function (_ref) { 
        global_var_checklists = _ref.get_global_checklists;
        var preloaded_checlist_html = '<option value=""> Select </option>';
        if (global_var_checklists?.length > 0) {
            global_var_checklists.forEach(function(item) {
    
                preloaded_checlist_html += `<option value="` + item.id + `"> ` + item.checklist_title + ` </option>`;
    
            })
        }
        $('.preloaded-checklist').html(preloaded_checlist_html);
    });
   
}



function displayPorgressBarOnLoad(selector, type) {
    calculateProgressbar = 0;
    var no_of_selectedSteps = $(selector + ':checked').length;
    var no_of_TotalSteps = $(selector).length;
    if (no_of_TotalSteps > 0) {


        if ($(selector).is(":checked")) {
            $(selector).next().addClass(type + '-label');
            $(selector).next().next().addClass(type + '-label');
            var checkbox_status = true;
        } else {

            $(selector).next().removeClass(type + '-label');
            $(selector).next().next().removeClass(type + '-label');
            var checkbox_status = false;

        }

        calculateProgressbar = (100 * no_of_selectedSteps) / no_of_TotalSteps;
        $(selector + '-progress').css('width', calculateProgressbar + '%');
        $(selector + '-only').text(Math.round(calculateProgressbar) + '%');
    }
}

function addNewItemsObjectives(element, type, selector) {
    //var type = 'notes';
    //var selector = '.notes';
    //let influencers_id = $(element).parents('div[data-id]').attr('data-id');
    let influencers_id = $('#objectives').attr('data-id');

    var d = new Date();
    var month = d.getMonth()+1, day = d.getDate();
    var todayDate = d.getFullYear() +'-'+(month<10 ? '0' : '') + month +'-'+(day<10 ? '0' : '') + day;
    // console.log(influencers_id);
    let action_steps = [];

    if ($(selector).length > 0) {
        $(selector).each(function(item) {
            let input = $(this).val();
            let status = $(this).is(':checked');
            action_step = {
                input: input,
                status: status
            };

            if(type == 'notes'){
                let date = $(this).attr('data-added');
                if(date != 'undefined'){
                   action_step.date = date;
                }

                // let reminder = $(this).attr('data-reminder');
                // if(reminder != 'undefined'){
                //    action_step.reminder = reminder;
                // }
            }
            action_steps.push(action_step);
        });
    }

    //console.log(action_steps)

    input_val = $(element).val();
    if (input_val != '') {
        action_step = {
            input: input_val,
            status: false
        };
        if(type == 'notes'){
            action_step.date = todayDate;
        }
        action_steps.push(action_step);
    }

    let len1 = action_steps.length - 1;
    //console.log(action_steps)
    //console.log(action_steps[len1]);


    if(type == 'notes'){
        var newRowSteps = `<input type="checkbox" id="` + len1 + `" value="` + action_steps[len1].input + `" class="` + type + `" data-added ="` + action_steps[len1].date + `"><label check-id= "` + len1 + `" style="margin-left:5px;"> ` + action_steps[len1].input + ` </label> <span class="notes-label-date" data-index="` + len1 + `">` + formatNotesDate(action_steps[len1].reminder) + `
            <input type="text" class="calender calender_` + len1 + `" style="visibility:hidden;width: 1px;" value="">
             - <i class="fa fa-clock-o clockIcon" aria-hidden="true" title="Created date"></i> <span class="added-date">`+ formatNotesDate(action_steps[len1].date, true) +` </span>
        </span> <br>`;
    }else{
      // var newRowSteps = `<input type="checkbox" id="` + len1 + `" value="` + action_steps[len1].input + `" class="` + type + `" ><label> ` + action_steps[len1].input + `</label><br>`; //change by
      newRowSteps = '<div class="row" id="action-step-'+ len1 +'" data-id="action-step-'+ len1 +'" >';
      newRowSteps += '<div class="col-8 p-0" >';
      newRowSteps += `<input type="checkbox" id="` + len1 + `" value="` + action_steps[len1].input + `" class="` + type + ` action_steps" >&nbsp;<label> ` + action_steps[len1].input + `</label>`;
      newRowSteps += '</div>';
      
      newRowSteps += '<div class="col-4 text-right">';
      newRowSteps += '<i class="fa fa-trash action-step-delete-icon" data-id="' + len1 + '" id="' + action_steps[len1].input + '-' + len1 + '" ></i>';
      newRowSteps += '</div>';
      newRowSteps += '</div>';

    }

    $('.main-' + type).append(newRowSteps);

    if(type == 'notes'){
        updateObjectivesProgress('.notes','notes');
    }

    //console.log('updateObjectivesDetails 3')
    updateObjectivesDetails(influencers_id, type, action_steps);

    $('.add-new-item-' + type).hide();
    $('.add-item-' + type).show();
    $(element).val('');
}

function displayProgressBarObj(selector, type, element) {

    // console.log(selector, type, element)
    var no_of_selectedSteps = $(selector + ':checked').length;
    var no_of_TotalSteps = $(selector).length;
    if ($(element).is(":checked")) {
        $(element).next().addClass(type + '-label');
        $(element).next().next().addClass(type + '-label');
        var checkbox_status = true;
    } else {

        $(element).next().removeClass(type + '-label');
        $(element).next().next().removeClass(type + '-label');
        var checkbox_status = false;

    }

    calculateProgressbar = (100 * no_of_selectedSteps) / no_of_TotalSteps;
    $(selector + '-progress').css('width', calculateProgressbar + '%');
    $(selector + '-only').text(Math.round(calculateProgressbar) + '%');
    updateSelectedValues(selector, type);
}

function updateObjectivesProgress(selector, type){

    //console.log('inside updateObjectivesProgress');
    //console.log(selector, type)
    
    var no_of_selectedSteps = $(selector + ':checked').length;
    var no_of_TotalSteps = $(selector).length;
    //console.log('no_of_selectedSteps', no_of_selectedSteps);
    //console.log('no_of_TotalSteps', no_of_TotalSteps);
    var calculate = 0;
    if(no_of_selectedSteps != 0 && no_of_TotalSteps != 0){
        calculate = (100 * no_of_selectedSteps) / no_of_TotalSteps;
    }
    //console.log(calculate)
    $(selector + '-progress').css('width', calculate + '%');
    $(selector + '-only').text(Math.round(calculate) + '%');
}

function deleteSelectedSteps(type, element) { 
    let action_steps = [];
    let influencers_id = $('#objectives').attr('data-id');
    if ($(element + ':checked').length > 0) {
        $(element + ':checked').each(function(item) {

            let parentId = $(this).parent().attr("data-id");
            $('[data-id="' + parentId + '"]').remove(); 
            // $(this).next().next().next().remove();
            // $(this).next().next().remove();
            // $(this).next().remove();
            // $(this).remove();            
        });        
    } 

    updateObjectivesProgress('.notes','notes');

    if ($(element + ':not(:checked)').length > 0) { 
        $(element + ':not(:checked)').each(function(item) {

            // $(element + ':checked').remove();
            // $(element + '-label').remove();
            let input = $(this).val();
            action_step = {
                input: input,
                status: false
            };

            if(type == 'notes'){

                let date = $(this).attr('data-added');
                if(date != 'undefined'){
                   action_step.date = date;
                }

                let reminder = $(this).attr('data-reminder');
                if(reminder != 'undefined'){
                   action_step.reminder = reminder;
                }
            }
            action_steps.push(action_step);
        });

       // console.log(action_steps); 
        var model_name = 'deleteObjectivesModal';
        //console.log('updateObjectivesDetails 4')
        updateObjectivesDetails(influencers_id, type, action_steps, model_name);
        $("#deleteObjectivesModal").modal('hide');
    }else if($(element + ':not(:checked)').length == 0){ 
        action_step = {};
        action_steps.push(action_step);
        
        let calculateProgressbar = 0
        $('.' + type + '-progress').css('width', calculateProgressbar + '%');
        $('.' + type + '-only').text(Math.round(calculateProgressbar) + '%');
        
           var model_name = 'deleteObjectivesModal';
        updateObjectivesDetails(influencers_id, type, action_steps, model_name);
        $("#deleteObjectivesModal").modal('hide');
     

    }else if($(element).length == 0){ 
        //console.log('updateObjectivesDetails 5')
        updateObjectivesDetails(influencers_id, type, action_steps, model_name);
        $("#deleteObjectivesModal").modal('hide'); 
    }

    //console.log('length', $(element).length)
}

function updateSelectedValues(selector, type) {
    // console.log('updateSelectedValues called')
    // console.log(arguments);
    let checked_values = [];
    let influencers_id = $('#objectives').attr('data-id');
    //var no_of_selectedSteps = $(selector+':checked').length;
    if ($(selector).length > 0) {
        $(selector).each(function(item) {

            let input1 = $(this).val();
            let status1 = $(this).is(":checked");
            checked_value = {
                input: input1,
                status: status1
            };

            if(type == 'notes'){
                let date = $(this).attr('data-added');
                if(date != 'undefined'){
                   checked_value.date = date;
                }
                let reminder = $(this).attr('data-reminder');
                if(reminder != 'undefined'){
                   checked_value.reminder = reminder;
                }
            }
            checked_values.push(checked_value);

        });
        //console.log('updateObjectivesDetails 6')
        updateObjectivesDetails(influencers_id, type, checked_values);
    }
}

function getAllActionCheckboxes(element, type, label_index, title) {

    let checkBoxValues = [];
    let influencers_id = $('#objectives').attr('data-id');

    $(element).each(function(index) {
        let input_val = $(this).val();
        if (input_val != '') {
            checkBoxValue = {
                input: input_val,
                status: false
            };

            if(type == 'notes'){
                let date = $(this).attr('data-added');
                if(date != 'undefined'){
                   checkBoxValue.date = date;
                }

                let reminder = $(this).attr('data-reminder');
                if(reminder != 'undefined'){
                   checkBoxValue.reminder = reminder;
                }
            }
            checkBoxValues.push(checkBoxValue);
        }
    });

    // console.log(checkBoxValues);
    // checkBoxValue_n = {
    //     input: title,
    //     status: false
    // };
    checkBoxValues[label_index].input  = title;
    checkBoxValues[label_index].status = false;
    //console.log(checkBoxValues);
    //console.log('updateObjectivesDetails 7')
    updateObjectivesDetails(influencers_id, type, checkBoxValues);
}

function updateObjectivesDetails(id, nameOfColumn, valueOfColumn, functionName = null) {

    
    // console.log('updateObjectivesDetails');
    // console.log(id, nameOfColumn, valueOfColumn);

    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/update-objectives-info",
            type: "POST",
            data: { influencer_id: id, key: nameOfColumn, value: valueOfColumn },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) { 
                if (functionName != null) {

                    $('.assign_global_tag_influencer_btn').text('Save');
                    $('#selectinfluencerModal').modal('hide');
                }
                //console.log(res);
                //toastr["success"](res.message);
            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
}

function updateTagsDetails(id, tags, functionName = null) {
    //console.log(id, nameOfColumn, valueOfColumn);
    chrome.storage.local.get(['authToken', 'userId','get_all_tags'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/update-tags-info",
            type: "POST",
            data: { influencer_id: id, tags: tags },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                $('.bootstrap-tagsinput input').focus();
                //location.reload();
                chrome.runtime.sendMessage({action:'updateTagInfo'})
                // loadAllTags(functionName); 
            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
}


function updateLastScreen(tab, childTab, index = false, subChildTab = false) {
    chrome.storage.local.get(['lastScreen'], function(_ref) {

        if (!index) {
            if (typeof _ref.lastScreen != "undefined") {
                index = _ref.lastScreen.profileIndex; // if last scrren is profile screen and again user change the tab of timeline then it is not updating the index
            }
        }
        chrome.storage.local.set({
            'lastScreen': {
                tab: tab,
                childTab: childTab,
                profileIndex: index,
                subChildTab: subChildTab
            }
        }, function() {
            chrome.storage.local.get(['lastScreen'], function(_ref) {
                //console.log(_ref.lastScreen);   
            })
        });
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 
    if (message.action === 'display_influencers') {
        today = currentDate();
        var current = parseInt($("#current_influencer").html());
        var postData = { today: today, skipRow: current };
        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/get-latest-influencers-v3",
                type: "POST",
                data: postData,
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                    if (res.status) {
                        influencers = res.data;
                        setInfluencers(influencers);
                        $(".postsCount").text(res.todaysPosts);

                        chrome.storage.local.set({'webhookKey': res.webhookKey});

                        $(document).on("click", '.remove', function() {
                            removeConfirmation($(this).data("id"));
                            // removeInfuencer($(this).data("id"));
                        })
                        /*$(document).on("click", '.toggle-flag', function() {

                            if ($(this).hasClass("checked")) {
                                toggleFlag($(this).data("id"), 0);
                            } else {
                                toggleFlag($(this).data("id"), 1);
                            }
                            $(this).toggleClass('checked');
                        });*/
                        $(document).on("click", '.showDetail', function() {
                            showDetail($(this).data("id"));
                        });
                    }
                },
                error: function(jqXHR, exception) {
                    console.log("Request failed: " + exception);
                }
            });
        });
    } else if (message.action === 'youtube_videos_scrapping_completed') {
        renderYoutubeActivity();
    }else if (message.action === 'get-blank-facebook-profile-data') {
        //console.log(message.data)
        tempUserData = message.data;
        //console.log(tempUserData);
        addContactDetails();


        lastProfileVisitIndex = $(this).attr('data-id');
        //console.log(lastProfileVisitIndex);

        //updateLastScreen('profile', 'timeline', lastProfileVisitIndex, 'all');

        setTimeout(() => {
            //console.log(global_var_scripts);
            if (global_var_scripts.length > 0) {
                showGlobalScripts(global_var_scripts);
            } else {
                loadGlobalScripts();
            }
        }, 2000)


    }else if(message.action === 'linkedInLoginStatus'){
        if(!message.status){
            toastr["error"]('Login to linkedin to get influencers activity.');    
        }
    }else if(message.action === 'fb-completed'){

        if(message.status){
            
            //toastr["success"]('Influencer added successfully');
            toastr["success"](message.resonseMessage);
           
            //console.log(message.usedLimit)
            updateProgressBar(message.usedLimit)
            let newInfluencer = message.userData;
            let infIndex = influencers.findIndex(x => x.id == newInfluencer.id);

            let index_no = '';
            if(infIndex >= 0){
                //console.log('influencer found');
                //console.log(influencers);
                index_no = infIndex;
            }else{
                let prev = influencers.length;
                newInfluencer.index_no = prev;
                influencers.push(newInfluencer);
                index_no = prev;
                indexNoToRemove = prev;
                //console.log(influencers);
                //console.log("influencer added in array");
            }
            // console.log(index_no);
            $('#loader').hide();

            //console.log("showDetail called");
            showDetail(index_no, false);

            // console.log(influencers); 
            // 
            // 
            // newInfluencer.index_no = prev;
            // influencers.push(newInfluencer);

            // console.log(prev);
            // console.log(influencers) 

            // console.log(influencers); 

            //console.log(res);
            
            //         res.data.forEach(function(inf, i) {
            //             
            //         });
            //         console.log(res);
            // showDetailAfterAdding(message.userData);
            //showListing(message.profile_id);
        }else{
             
            toastr["error"]('Try again later2.'); 
        }

    }else if(message.action === 'linkedin-completed'){ 
        if(message.status){
            getinfluencerById(message?.influencerId, 'linkedin');
        }else{
            console.log("Request failed: LinkedIn Scrapping failed due to some network error");
        }
        $("#myModal").modal('hide');
        $('#loader').hide();
    }
    
});

function displayLastScreen(data) {
    // console.log(data)
    // console.log('displayLastScreen')
    $('#loader').hide();
    if (data.tab == 'dashboard') {
        // do nothing
    } else if (data.tab == 'timeline') {
        $(".timelineTab").addClass('active');
        $(".followedTab").removeClass('active');
        $("#timeline").addClass('active').removeClass('fade');
        $("#follow").removeClass('active');

        if (data.childTab == 'allPosts') {
            $('.timelineAllTab').click();
            // do nothing
        } else if (data.childTab == 'onlyPosts') {
            $(".timelinePostsTab").click();
            $(".timelinePostsTab").addClass('active');
            $(".timelineAllTab").removeClass('active');
            $("#Posts").addClass('active').removeClass('fade');
            $("#all").removeClass('active');
        } else if (data.childTab == 'onlyComments') {
            $(".timelineCommentsTab").click();
            $(".timelineCommentsTab").addClass('active');
            $(".timelineAllTab").removeClass('active');
            $("#comment").addClass('active').removeClass('fade');
            $("#all").removeClass('active');
        }
    } else if (data.tab == 'profile') { 
        //console.log(data.profileIndex)
        profileIndex = data.profileIndex;
        

        chrome.storage.local.get(['selectedProfileDetails'],function(_ref){
            //console.log(_ref.selectedProfileDetails)
            if(_ref.selectedProfileDetails != undefined && _ref.selectedProfileDetails != ''){

            }
            selectedInfluencers = _ref.selectedProfileDetails;
            showDetailSectedProfile(profileIndex, selectedInfluencers,data);
        });    
    } else if(data.tab == 'setting') {
        $('.home_icon').show();
        $('.setting_icon').hide();
        $('#home_screen').hide()
        $('#settings_screen').show();
        if(data.childTab == "manageChecklist"){
            $(".manageChecklist").click();
        }else if(data.childTab == "manageScripts"){
            $(".manageScripts").click();
        }else if(data.childTab == "generalTab"){
            $(".generalTab").click();
        }
    }
}

function scrapYoutubeVideos(url, influencer_id, syncing = false) {
    
    chrome.runtime.sendMessage({ action: "scrap_videos_from_youtube", url: url, influencer_id: influencer_id });

    if (!customSyncing) {
        $(".popup_msg").html('<span class="text-success">Syncing youtube data,<br> Please wait...</span>')
        $("#myModal button").addClass('disabled-btn');
        setTimeout(() => {
            $("#myModal").modal('hide');
        }, 8000)
    }
}
function scrapLinkedIn(url, influencerId, syncing = false){
    
    // console.log('limit not exists already')
    currentDateStr = currentDate();
    var updatedLimit = {date: currentDateStr, count: 5};
    chrome.storage.local.set({'linkedInLimit':updatedLimit});  
    chrome.storage.local.set({'linkedInLimitExceeded':false});  

    const inf_index = influencers.findIndex((item) => item.id === influencerId);
    var social_data = influencers[inf_index].bio_social;
    social_data1 = JSON.parse(social_data);
    var linkedIn_index = social_data1.findIndex(x => x.field_type == "LinkedIn");
   
    if (social_data1[linkedIn_index].text['0'] != '') {
      // chrome.runtime.sendMessage({action:'customSyncLinkedIn',bio_social:social_data1,influencer_id:influencerId})
        
        chrome.runtime.sendMessage({ action:'customSyncLinkedIn',bio_social:social_data1,influencer_id:influencerId }, function(response) {
            console.log('customSyncLinkedIn :', response);
            if (!customSyncing) {
                $(".popup_msg").html('<span class="text-success">Scraping LinkedIn posts and comment data, its takes aprox 30 seconds<br> Please wait...</span>')
                $("#myModal button").addClass('disabled-btn');
                
            }
            // setTimeout(() => {
            //     $("#myModal").modal('hide');
            //     //$('#loader').hide();
            //     //getinfluencerById(influencerId);
            // }, 10000)
        });
        

        
    }
}


function scrapFacebook(url, influencer_id, syncing = false) { 
    chrome.runtime.sendMessage({ action: "get-facebook-profile", facebookProfileUrl: url, profile_id:influencer_id , type:'syncing'});
    if (!customSyncing) {
        $(".popup_msg").html('<span class="text-success">Syncing facebook data,<br> Please wait...</span>')
        $("#myModal button").addClass('disabled-btn');
        setTimeout(() => {
            $("#myModal").modal('hide');
        }, 8000)
    }
}

function renderYoutubeActivity() {

    // console.log('youtube syncing');
    if (!customSyncing) {
        $("#myModal").modal('hide');
        toastr["success"]('Syncing Completed');
        showListing();
    } else {
        syncingCompletedMessage();
    }

}

function syncingCompletedMessage(syncing = false) {
    // setTimeout(() => {
    //     if(syncing) {
    //         showListing(syncing);
    //     }else {
    //         showListing();
    //     }
        
    //     setTimeout(() => {
    //         $('#loader').hide();
    //         toastr["success"]('Influencer updated successfully');
    //     }, 500)
    // }, 9000)
}

function scrapInstagramPosts(url, influencer_id) {
    chrome.runtime.sendMessage({ action: "scrap_instagram_posts", url: url, influencer_id: influencer_id });

    if (!customInstaSyncing) {
        $(".popup_msg").html('<span class="text-success">Syncing instagram data,<br> Please wait...</span>')
        $("#myModal button").addClass('disabled-btn');
        setTimeout(() => {
            $("#myModal").modal('hide');
            showListing();
            toastr["success"]('Syncing Completed');
        }, 8000)
    }

}

function loadMoreInfluencers() {

    $("#btn_show_more").text('Loading...');
    today = currentDate();
    var current = parseInt($("#current_influencer").html());
    var searchStr = $("#search").val();

    let sort = $('.sort').attr("data-sort");
    let column = $('.sort').attr("data-column"); 
    var postData = { today: today, skipRow: current, searchStr: searchStr, sort: sort, column: column };
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
            
                    //console.log(res);
                    let prev = influencers.length;
                    res.data.forEach(function(inf, i) {
                        inf.index_no = prev + i;
                        influencers.push(inf);
                    });
                   // console.log(res);
                    // $("#total_influencer").html(res.totalInfluencers);
                    // $("#current_influencer").html('25');
                    //influencers = res.data;
                    setInfluencers(influencers);

                    if (profile != "") {
                        setTimeout(() => {
                            $('#loader').hide();
                            if ($("#influencer-listing > div[profile-id = '" + profile + "']").length > 0) {
                                toastr["success"]('Influencer added successfully');
                            } else {
                                toastr["error"]('Try again later1.');
                            }
                        }, 200)
                    }

                    var total = parseInt($("#total_influencer").html());
                    current = influencers.length;
                    $("#current_influencer").html(current);
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }

                    // $(".postsCount").text(res.todaysPosts)
                    // if (typeof _ref.lastScreen != "undefined") {
                    //     displayLastScreen(_ref.lastScreen);
                    // } else {
                    //     $('#loader').hide();
                    // }

                    /*$(document).on("click", '.remove', function() {
                        removeConfirmation($(this).data("id"));
                    })
                    $(document).on("click", '.toggle-flag', function() {
                        if ($(this).hasClass("checked")) {
                            toggleFlag($(this).data("id"), 0);
                        } else {
                            toggleFlag($(this).data("id"), 1);
                        }
                        $(this).toggleClass('checked');
                    });
                    $(document).on("click", '.showDetail', function() {
                        showDetail($(this).data("id"));
                    });*/
                }
            },
            error: function(jqXHR, exception) {
               // console.log("Request failed: " + exception);
            }
        });
    });
}


function getSearchResults(searchStr) {
    $('#loader').show();

    let sort = $('.sort').attr("data-sort");
    let column = $('.sort').attr("data-column");

    today = currentDate();
    influencers = [];
    $("#current_influencer").html('0');
    $("#total_influencer").html('0');
    var postData = { today: today, skipRow: '0', searchStr: searchStr, sort: sort, column: column };
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
                    res.data.forEach(function(inf, i) {
                        inf.index_no = i;
                        influencers.push(inf);
                    });
                    $("#total_influencer").html(res.totalInfluencers);
                    $("#current_influencer").html(influencers.length);
                    
                    setInfluencers(influencers);

                    var total = parseInt($("#total_influencer").html());
                    current = influencers.length;
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }
                    $('#loader').hide();
                }
            },
            error: function(jqXHR, exception) {
                //console.log("Request failed: " + exception);
            }
        });
    });
}


// Function to get All Influencer Details on 8 Nov 2021
function getAllInfluenerDetails(clearAdded = false) {

    //console.log('ins');
    let searchString = $("#search").val().trim();
    let tagValue = $("#tag_filter_dropdown").val();
    today = currentDate();
    if (clearAdded) {
        //alert('hii');
        $('#InfluencerLoader').show();
        influencers = [];
    }
    $('#InfluencerLoader').show();
    let skip = parseInt($("#current_influencer").html());

    // console.log(skip);
    chrome.storage.local.set({'skiprowPaginate': skip});
    var postData = { today: today, skipRow: skip, searchStr: searchString, sort: sortOrder, column: sortColumn, tags: tagValue };
    showListingScreen();
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            async: false,
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
                    let influencers_length = influencers.length;
                    res.data.forEach(function(inf, i) {
                        inf.index_no = influencers_length + i;
                        influencers.push(inf);
                    });

                    chrome.storage.local.set({'webhookKey': res.webhookKey});

                    updateProgressBar(res.totalInfluencers);

                     $("#total_influencer").html(res.totalInfluencers);
                     $("#current_influencer").html(influencers.length);

                    // chrome.storage.local.set({currentkey: res.totalInfluencers,totalkey: influencers.length}, function() {
                       //  console.log('Value is set to current & Total  ' + res.totalInfluencers +","+influencers.length);
                   // });

                    setInfluencers(influencers);

                    var total = parseInt($("#total_influencer").html());
                    current = influencers.length;
                    $("#current_influencer").html(current);
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }

                    $('#loader').hide();
                    $('#InfluencerLoader').hide();
                }
            },
            error: function(jqXHR, exception) {
                $('#InfluencerLoader').hide();
                console.log("Request failed: " + exception);
            }
        });

        // console.log(_ref.lastScreen);
        // if (typeof _ref.lastScreen != "undefined") {
        //     displayLastScreen(_ref.lastScreen);
        // } else {
        //     $('#loader').hide();
        // }
    });

}



// Function to get All Influencer Details on 8 Nov 2021
function getAllInfluenerDetailsTimeline(clearAdded = false) {

   
    let searchString = $("#search").val().trim();
    let tagValue = $("#tag_filter_dropdown").val();
    today = currentDate();
    if (clearAdded) {
        $('#loader').show();
        influencers = [];
    }
    let skip = parseInt($("#current_influencer").html());

   // console.log(skip);
   chrome.storage.local.set({'skiprowPaginate': skip});
    var postData = { today: today, skipRow: skip, searchStr: searchString, sort: sortOrder, column: sortColumn, tags: tagValue };
    showListingScreen();
    chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-influencers-v3",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
                    let influencers_length = influencers.length;
                    res.data.forEach(function(inf, i) {
                        inf.index_no = influencers_length + i;
                        influencers.push(inf);
                    });

                     $("#total_influencer").html(res.totalInfluencers);
                     $("#current_influencer").html(influencers.length);

                    // chrome.storage.local.set({currentkey: res.totalInfluencers,totalkey: influencers.length}, function() {
                       //  console.log('Value is set to current & Total  ' + res.totalInfluencers +","+influencers.length);
                   // });

                    setInfluencers(influencers);

                    var total = parseInt($("#total_influencer").html());
                    current = influencers.length;
                    $("#current_influencer").html(current);
                    if (current < total) {
                        $("#influencer-listing").append(`<button id="btn_show_more">Show More</button>`);;
                    }
                    $('#loader').hide();
                   


                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });

}


//var mybtn = false;
// Function to get All Influencer Details on 8 Nov 2021
function getAllTimelineDetails(clearAdded = false) {
    
    let tagValue = $("#timeline > div select.tag-filter-dropdown").val();
    let platform = $("#timeline > div select.global-timeline-filter").val();
    let event = $("#timeline ul.multi_tabs > li .active").html();
    let btn = `<button id="btn_show_more_timeline" data-id="all" class="btn-more-timeline">Show More</button>`;
     
      //console.log(tagValue);

    if (clearAdded) { 
        $("#loader").show();       
        dr_activities = [];
    }

    /*if (!hideloader) {
        $("#loader").show();
    }*/
    let timeline_current = $("#current_timeline").text(); 
    let skip = parseInt(timeline_current);
    var postData = { skip_row: skip, tags: tagValue, platform: platform, event: event};
    //showListingScreen();
    //console.log(postData);
    current_activity_no = 0;
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-latest-timeline",
            type: "POST",
            data: postData,
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {                 
                $('#loader').hide(); 
                $('#btn_show_more_timeline').remove();              
                if (res.status) {
                    //console.log(res.data);
                    res.data.forEach(function(item) {                        
                        dr_activities.push(item);
                    });

                    //console.log(dr_activities);
                    //console.log('#'+event.toLowerCase()+' .timeline-row');
                    //let current_activity_no2 = $('#'+event.toLowerCase()+' .timeline-row').length; 
                    let timeline_activity_length = dr_activities.length; 

                    //$("#btn_show_more_timeline").text('Show More');                        
                   
                    $("#total_timeline").html(res.total);
                    $("#current_timeline").html(timeline_activity_length);
                  
                    //console.log(timeline_activity_length);
                    renderTimeline(dr_activities);
                    
                    if(dr_activities.length == '0'){
                        $("#btn_show_more_timeline").hide();
                       // $("#timeline div.tab-content").html('There is no Records...');
                    }

                    var total = parseInt($("#total_timeline").html());
                    let current_activity_no = dr_activities.length;

                    // $("#current_timeline").html(current);
                    if (current_activity_no < total) {
                        $("#timeline div.tab-content").append(btn);                                             
                    }


                }
            },
                error: function(jqXHR, exception) {
                    console.log("Request failed: " + exception);
                }
        });
    });

}

 $(document).on("click", '.remove', function() {
        removeConfirmation($(this).data("id"));
    })
    $(document).on("click", '.toggle-flag', function() {
        //console.log('hey jiten');

        //console.log($(this).hasClass("checked"));

        if ($(this).hasClass("checked")) {
            toggleFlag($(this).data("id"), 0);
        } else {
            toggleFlag($(this).data("id"), 1);
        }
        $(this).toggleClass('checked');
    });
    $(document).on("click", '.showDetail', function() {
        showDetail($(this).data("id"));
    });

  $(".add_dropedown").hide();

 $("#fb-add").click(function(){

    let usedLimit = $(".usedLimit").html();
    let planLimit = $(".planLimit").html();

    if(usedLimit >= _config.planLimit){

        toastr["error"]('Plan limit exceeded, Upgrade to add more.');
        return false;

    }
       

 var drop = `
  <ul style="border: 1px solid #ebeff3; padding:5px; list-style: none; border-radius:5px;">
    
    <li data-val="1" class="addManualfb" data-toggle="modal" data-target="#manualEntryModel"><a href="#">Facebook</a></li>
    <li data-val="2" class="addManualac" data-toggle="modal" ><a href="#">Add Contact</a></li>
    <li data-val="3" class="addBulkAccounts" data-toggle="modal" ><a href="#">Bulk Upload</a></li>

  </ul>`;

    $(".add_dropedown").html(drop);
    $(".add_dropedown").slideToggle();
  

    });

/*$(document).on('click','.addManualfb',function(){
    console.log('hey  fb');
    var val = $(this).attr('data-val');
});*/  

$(document).on('click','.addManualac',function(){
        $('#loader').show();
        $(".add_dropedown").hide();    
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        var userInfo = {
            FB_user_id : "2003651141",
            user_id : "18",
            about_url : "",
            bio : {
                bio_basic :[
                    { "field_type": "state", "text": "", "is_editing": 0 },                                
                    { "field_type": "gender", "text": "", "is_editing": 0 }
                ],
                bio_contact :[
                    { "field_type": "Email", "text": "" },
                    { "field_type": "Mobile", "text": "" },
                    { "field_type": "Address", "text": "" },
                    { "field_type": "Title", "text": "" },
                    { "field_type": "TitleUrl", "text": "" } 
                ],
                bio_social :[
                    { "field_type": "Facebook", "text": [""], "is_editing": 0 },
                    { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
                    { "field_type": "YouTube", "text": [""], "is_editing": 0 },
                    { "field_type": "Instagram", "text": [""], "is_editing": 0 },
                    { "field_type": "Twitter", "text": [""], "is_editing": 0 },
                    { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
                ]    
            },
            count_friends : "",
            count_groups : "",
            currentTime : dateTime,
            error : "",
            friends_url : "",
            ful_name : "Sample Name",
            get_comments : "",
            last_activity : {
                comments :"" ,
                posts :"" 
            },
            photo_uri : "",
            photos_url : "",
            picture_my_like : "",
            picture_other_like : "",
            posts_my_like : "",
            posts_other_like : "",
            reviews_url : "",
            total_comments : "",
            total_posts : "",
            user_link : "Enter_link",
            video_my_like : "",
            video_other_like : "",
            videos_url : "",
            template_status :0
        };

        chrome.storage.local.get(['FBtoken', 'myFBUserId', 'authToken'], function(_ref) {
                jwtToken = _ref.authToken;
                //console.log(jwtToken);

                $.ajax({
                url: _config.apiBaseUrl + "/add-blank-influencer",
                type: "POST",
                data: userInfo,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + jwtToken);
                },
                success: function(res) { 
                      $('#loader').hide();
                     //console.log(res);
                    
                    tempUserData = res.data;
                    //console.log(tempUserData);
                    addContactDetails();
                  
                    
                 }
                // ,
                // error: function(jqXHR, exception) {
                //     sendResponse('error');
                // }
        
        });
    });
});  

$(document).on('click','.addBulkAccounts',function(){

    $(".uploadError").text('')
    $("#csv_file").val(''); 
    $("#bulkUploadModal").modal('show');

})

$(document).on('click','#csvUpload',function(){

    $(".uploadError").text('')
    var files = document.getElementById('csv_file').files;
    if (files.length == 0) {
        $(".uploadError").text("Please choose a file first.");
        return false;
    }
    var filename = files[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
    if (extension != '.XLS' && extension != '.XLSX') {
        $(".uploadError").text("Only xls and xlsx file formats are allowed.");
        return false;
    }

    var file = files[0];
    try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            }
            );
            var result = {
            };

            workbook.SheetNames.forEach(function (sheetName) {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                //console.log(roa)
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }       
            });

            if(result.Sheet1){
                var data = result.Sheet1;
                // console.log(data);
                csv_data_array = [];
                $.each(data, function(index, item){
                    let newObject = {};
                    for (let x in item) {
                       key = x.toLowerCase().replace(' ','_').replace('/','_').trim();
                       newObject[key] = item[x]
                    }
                    csv_data_array.push(newObject);
                });
                //console.log(csv_data_array);
                uploadBulkInfluencers(csv_data_array); 
            }else{
                $(".uploadError").text("Your file sheet name must be Sheet1.");
            }
        }
    }
    catch (e) {
        console.error(e);
    }

    /*let csv_data = [];

    if($("#csv_file")[0].files.length > 0){
        $(".uploadError").text('')
        let headers = [];
        var file = $("#csv_file")[0].files[0];

        var reader = new FileReader();
        reader.onload = function (e) {

            var rows = e.target.result.split("\n");

            let headersRow = rows.splice(0,1);
            var headerCells = headersRow[0].split(",");
            if (headerCells.length > 1) {
                for (var j = 0; j < headerCells.length; j++) { 
                    if(headerCells[j].trim() != ''){
                        headers.push(headerCells[j].toLowerCase().replace(' ','_').replace('/','_').trim());     
                    }
                }
            }

            for (var i = 0; i < rows.length; i++) {

                console.log(rows[i])
                let jsonRow = {};
                let push = false;
                var cells = rows[i].split(",");
                if (cells.length > 1) {
                    for (var j = 0; j < cells.length; j++) {    
                        jsonRow[headers[j]] =  cells[j].trim();
                        if(cells[j].trim() != ''){ // if any of the column has value only then push in array
                            push = true;
                        }        
                    }
                    if(push){
                        csv_data.push(jsonRow);    
                    }
                }

                if(i == rows.length - 1){
                    console.log('csv data here');
                    console.log(csv_data);
                    // uploadBulkInfluencers(csv_data);

                }
            }
        }
        reader.readAsText(file);
    }else{

        $(".uploadError").text('Please choose a file first.');

    }*/

});

function uploadBulkInfluencers(data){

    chrome.storage.local.get(['FBtoken', 'myFBUserId', 'authToken'], function(_ref) {
        jwtToken = _ref.authToken;
        $.ajax({
            url: _config.apiBaseUrl + "/bulk-upload",
            type: "POST",
            data: {data:data},
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + jwtToken);
            },
            success: function(res) {
                if(res.status) {
                    $("#csv_file").val(''); 
                    toastr["success"](res.message);
                } else {
                    toastr["error"](res.message);
                }
               //console.log(res);
            } 
        });
    });

}



/* $(document).on('click','.FileUpload333',function(){
        console.log("hey  i Am Image");
       
       

        output = 'https://images.statusfacebook.com/profile_pictures/emo_boys/emo_boys_profile_picture04.jpg';
        var uploadedImg = $("#myImg").attr('src',output);
        var upImg =  $("#myImg").attr('src');
        influencer_id =  tempUserData.id;

        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/upload-profile-pic",
                type: "POST",
                data: { influencer_id: influencer_id, imgUpload: upImg },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                    console.log(res);
                }
            });
        });

 }); */

// SEARCH FB --
$(document).on('click','#fb-search',function() {      
   $('#manualEntryModel').modal('hide');
   $(".add_dropedown").slideUp();
    let url = $("#facebookProfileUrl").val();       
    //  alert(url);
    if (url != "") {
        $('#loader').show();

        let profile_url_array = url.split('/')
        let profile_id = profile_url_array[profile_url_array.length - 1];

        chrome.runtime.sendMessage({ action: "get-facebook-profile", facebookProfileUrl: url, profile_id:profile_id, type:'new' });

        /*chrome.runtime.sendMessage({ action: "get-facebook-profile", facebookProfileUrl: url }, (response) => {
            console.log(response);
            let profile_url_array = url.split('/')
            let profile_id = profile_url_array[profile_url_array.length - 1];
            setTimeout(() => {
                showListing(profile_id);
            }, 9000)  
        });*/
    }
 });

// UPDATE PROFILE IMAGE OF NEW INFLUNCER (ADD NEW).
function updateNewInfluencerProfileImage(input, target) { 
    influencer_id =  tempUserData.id;
    if (input.files && input.files[0]) {
        var input = document.querySelector('input[type=file]'),
        file = input.files[0];
        var fd = new FormData();
        fd.append("file", file);
        fd.append("inf_id", influencer_id);
        chrome.storage.local.get(['FBtoken', 'myFBUserId', 'authToken'], function(_ref) {
            jwtToken = _ref.authToken;
            $.ajax({
                url: _config.apiBaseUrl + "/move-img-folder",
                type: "POST",
                data: fd,
                contentType: false,
                cache: false,
                processData: false,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + jwtToken);
                },
                success: function(res) {
                    if(res.status) {
                        toastr["success"](res.message);
                    } else {
                        toastr["error"](res.message);
                    }
                  //  console.log(res);
                   // console.log(res.allData);

                    tempUserData = res.allData;
                    
                    //$(".profile-image").html('<img id="influencer_profile_img" src="'+_config.baseUrl+'/public/images/'+res.photo_url.photo_uri+'" class="profile-image">')
                    //$(".profile-image#influencer_profile_img").attr('src', _config.baseUrl+'/public/images/'+res.photo_url.photo_uri);
                } 
            });
        });
        
        var reader = new FileReader();
        var image_target = $(target);
        reader.onload = function (e) {
            image_target.attr('src', e.target.result).show();
        };
        reader.readAsDataURL(input.files[0]);
        
        //var f = input.files[0];

        // var formData = [name,fileType,fileSize,webkit];         
        // console.log(formData);
        /*var fsize = f.size||f.fileSize;
        console.log(fsize);
        if(fsize > 200000){
            alert("Image File Size is very big");
        }
        else{

        }*/
    }
}

// CLICK ON BROWSE IMAGE
$(document).on('change','.FileUpload',function(event){
    //event.preventDefault();
    //event.stopPropagation();
    updateNewInfluencerProfileImage(this, "#influencer_profile_img")
});



function copyText(TextToCopy, type) {
  var TempText = document.createElement("input");
  TempText.value = TextToCopy;
  document.body.appendChild(TempText);
  TempText.select();
  document.execCommand("copy");
  document.body.removeChild(TempText);
  
  toastr["success"](type+' copied to clipboard.');
  // alert("Copied the text: " + TempText.value);
}




function showDetailAfterAdding(data) {
    var singleInfluencer = [data];

    let i = 0;
    
    var activity = singleInfluencer[i].activity;
    if (singleInfluencer[i].bio_contact != '') {
        var contactInfo = JSON.parse(singleInfluencer[i].bio_contact);
    } else {
        var contactInfo = [
            { "field_type": "Email", "text": " " },
            { "field_type": "Mobile", "text": " " },
            { "field_type": "Address", "text": " " },
            { "field_type": "Title", "text": " " },
            { "field_type": "TitleUrl", "text": " " }
        ];
    }

    if (singleInfluencer[i].bio_social != '') {
        var socialInfo = JSON.parse(singleInfluencer[i].bio_social);
    } else {
        var socialInfo = [
            { "field_type": "Facebook", "text": [""], "is_editing": 0 },
            { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
            { "field_type": "YouTube", "text": [""], "is_editing": 0 },
            { "field_type": "Instagram", "text": [""], "is_editing": 0 },
            { "field_type": "Twitter", "text": [""], "is_editing": 0 },
            { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
        ];
    }

    let emailIndex = contactInfo.findIndex(x => x.field_type == 'Email');
    let mobileIndex = contactInfo.findIndex(x => x.field_type == 'Mobile');
    let addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    let title = contactInfo.findIndex(x => x.field_type == 'Title');
    let titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');

    let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
    let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
    let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
    let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');
    let twitterIndex = socialInfo.findIndex(x => x.field_type == 'Twitter');
    let pinterestIndex = socialInfo.findIndex(x => x.field_type == 'Pinterest');

    let facebookUrl = socialInfo[facebookIndex].text[0];
    let linkedInUrl = socialInfo[linkedInIndex].text[0];
    let youTubeUrl = socialInfo[youTubeIndex].text[0];
    let instagramUrl = socialInfo[instagramIndex].text[0];
    let twitterUrl = socialInfo[twitterIndex].text[0];
    let pinterestUrl = socialInfo[pinterestIndex].text[0];
    
    if (contactInfo[addressIndex] == 'undefined' || typeof contactInfo[addressIndex] == 'undefined') {
        contactInfo.push({ "field_type": "Address", "text": " " });
        addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    }

    if (titleUrl != -1 || contactInfo[titleUrl] == 'undefined' || typeof contactInfo[titleUrl] == 'undefined') {

        contactInfo.push({ "field_type": "TitleUrl", "text": "" });
        titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');
    }

    if (title != -1 || contactInfo[title] == 'undefined' || typeof contactInfo[title] == 'undefined') {

        contactInfo.push({ "field_type": "title", "text": "" });
        title = contactInfo.findIndex(x => x.field_type == 'title');
    }


    let profileFB_url_array = facebookUrl.split('/');
    let profileFB_id = profileFB_url_array[profileFB_url_array.length - 1];

    let dm_url = "https://www.messenger.com/t/" + profileFB_id;
    $(".tab").hide();
    $('#profile-section').empty();

   // console.log(" PRofile is going to view.... ");
    let inf_profile_img_url = '';
    if(singleInfluencer[i].template_flag == 1) {
        inf_profile_img_url = singleInfluencer[i].photo_uri;
    }else {
        inf_profile_img_url = _config.baseUrl+'/public/images/'+singleInfluencer[i].photo_uri;
    }

    var profileData = `
        <div class="col-12 mt-4 profile_part p-0 pb-2">
            <div class="row">
                <div class="col-3 profile_img">
                <span class="back-link"><img src="assets/images/back.png" class="back-icon"></span>
                <img src="${inf_profile_img_url}" class="profile-image" /> 
                </div>
                <div class="col-9 p-0">
                    
                    <div class="row">
                    <div class="col-5 p-0">
                        <h2 class="name">${singleInfluencer[i].ful_name}</h2> 
                          
                    </div>
                    <div class="col-7 p-0">
                        <a href="${contactInfo[titleUrl]?.text}" class="small" target="_blank">${contactInfo[title].text} </a>
                        <img src="assets/images/edit.png" class="edit-info-popup edit-title" data-value="${contactInfo[title].text}" data-key="Title" data-id="${i}"/>  
                    </div>                        
                    </div>
                    <div class="row">
                        <div class="col-9 p-0"> <h3><img src="assets/images/envelope.png"/> Email: <span>${contactInfo[emailIndex].text}</span></h3></div>
                        <div class="col-3 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[emailIndex].text}" data-key="Email" data-id="${i}" />
                            <img src="assets/images/copy.png" title="Click to copy email" class="copyEmail" data-value="${contactInfo[emailIndex].text}"/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-9 p-0"> <h3><img src="assets/images/phone.png" /> Mobile: <span>${contactInfo[mobileIndex].text}</span></h3></div>
                        <div class="col-3 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[mobileIndex].text}" data-key="Mobile" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy mobile" class="copyNumber" data-value="${contactInfo[mobileIndex].text}"/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-9 p-0"> <h3><img src="assets/images/address.png" /> Address: <span>${contactInfo[addressIndex].text}</span></h3></div>
                        <div class="col-3 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[addressIndex].text}" data-key="Address" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy address" class="copyAddress" data-value="${contactInfo[addressIndex].text}"/>
                        </div>
                    </div>                                        

                </div>
            </div>
        </div>   
        <div class="row listing">
            <div class="col-3 p-0">
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (facebookUrl != '' ? facebookUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (facebookUrl != '' ? facebookUrl : '') + `" data-key="Facebook" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (linkedInUrl != '' ? linkedInUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-linkedin"></i> LinkedIn</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (linkedInUrl != '' ? linkedInUrl : '') + `" data-key="LinkedIn" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (youTubeUrl != '' ? youTubeUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-youtube-play"></i> Youtube</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (youTubeUrl != '' ? youTubeUrl : '') + `" data-key="YouTube" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (instagramUrl != '' ? instagramUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-instagram"></i> Instagram</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (instagramUrl != '' ? instagramUrl : '') + `" data-key="Instagram" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (twitterUrl != '' ? twitterUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (twitterUrl != '' ? twitterUrl : '') + `" data-key="Twitter" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (pinterestUrl != '' ? pinterestUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-pinterest"></i> Pinterest</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (pinterestUrl != '' ? pinterestUrl : '') + `" data-key="Pinterest" data-id="${i}" /></div>
                </div> 

                <div class="row">
                    <div class="col-12 pr-0"><a href="javascript:void(0)" target="_blank"><i class="fa fa-tags"></i> Tags</a></div>
                    
                    <div class="get-tags col-12 p-0"> <p class="fetch">Fetching Tags... </p>
                    
                    

                    <select class="request-input tagsinputbox" multiple placeholder="Type Here..." data-role="tagsinput"></select>
                    </div>

                    <div class="tag-suggestion-container col-12" style="padding: 4px 6px;">
                        <ul class="list-group" id="tagSuggestionList">
                            
                        </ul>
                    </div>
                </div>               
            </div>
            <div class="col-9 p-0">

            <a href="https://mail.google.com/mail/u/0/?fs=1&to=${contactInfo[emailIndex].text}&tf=cm" target="_blank"><img src="assets/images/envelope.png" /> Email</a>
            <a href="${dm_url}" target="_blank"><img style="width: 25px;" src="assets/images/messnger.png" /> DM</a>
            <a href="https://www.dream100videobox.com" target="_blank"><img src="assets/images/video.png" /> Video Box</a>
            <a href="https://www.dream100box.com" target="_blank"><img src="assets/images/mail_swag.png" /> Mail Swag</a>
            <a href="https://www.facebook.com/${profileFB_id}/friends_mutual" target="_blank"><img src="assets/images/people.png" /> Friends</a>
 
                     <div class="filter-wrap  pr-1">
                                <span>Script </span>
                                <select class="filter-dropdown select_script_dropdown">
                                    <option value="0">Select Script</option>
                                    
                                </select>
                            </div>

                <ul class="nav nav-tabs multi_tabs stats_tabs mt-2">
                
                <li class="nav-item">
                    <a class="nav-link profileTimeline active" data-toggle="tab" href="#time">Timeline</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileInterest" data-toggle="tab" href="#interests">Interests</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileObjectives" data-toggle="tab" href="#objectives">Objectives</a>
                </li>
                
                </ul>

                <div class="tab-content">

                    <div id="interests" class="tab-pane fade pl-2 pr-2 interest_list">
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/map" target="_blank">Check-Ins</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/sports" target="_blank">Sports</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/music" target="_blank">Music</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/movies" target="_blank">Movies</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/tv" target="_blank">Tv Shows</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/books" target="_blank">Books</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/games" target="_blank">Apps & Games</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/likes" target="_blank">Likes</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/events" target="_blank">Events</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${singleInfluencer[i].user_link}/groups" target="_blank">Groups</a></h3>
                        </div>
                        
                    </div>

                    <div id="time" class="active show tab-pane fade pl-2 pr-2">

                        <ul class="nav nav-tabs mt-4 multi_tabs time_tabs ">

                            <li class="nav-item">
                                <a class="nav-link active profileTimelineAll" data-toggle="tab" href="#both">All</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelinePosts" data-toggle="tab" href="#Posts-sec">Posts</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelineComments" data-toggle="tab" href="#comment-sec">Comments</a>
                            </li>
                        </ul>
                        <div class="filter-wrap text-right pr-2">
                            <span>Social Platform</span>
                            <select class="filter-dropdown influencer-timeline-filter">
                                <option value="all">All</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">Youtube</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>
                        <hr></hr>
                        <div class="tab-content">
                            <div id="both" class="tab-pane active pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <a href="` + item.url + `" target="_blank">`;

        if (item.platform == 'youtube') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px">` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        } else if (item.platform == 'facebook') {

            profileData += `<h4>`;
            if (item.event == 'published new post.') {
                profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
            } else {
                profileData += `<img src="assets/images/chat.png">`;
            }
            profileData += item.author + `  ` + item.event + `</h4>
                                                    <p>` + (item.text != null ? item.text : '') + `</p>
                                                    <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>`;

        } else if (item.platform == 'instagram') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!--<img src="https://via.placeholder.com/150" style="    width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        }else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
            }else if(item.event == 'react' || item.event == 'comment'){

                    profileData += `<h4>`;
                                if(item.event == 'react'){
                                    profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
                                }else{
                                    profileData += `<img src="assets/images/chat.png">`    
                                }
                                
                                profileData += item.author + ` ` + item.text + `
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;

            }

        }

        profileData += `</a>
                                        </div>
                                    `;
    });
    profileData += `</div>
                            <div id="Posts-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {

        if (item.platform == 'youtube') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        } else if (item.platform == 'facebook') {

            if (item.event == 'published new post.') {
                profileData += `
                                            <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                <h4>
                                                <a href="` + item.url + `" target="_blank">
                                                <i class="fa fa-sticky-note-o post-icon"></i> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                                </a> 
                                            </div>`;
            }

        } else if (item.platform == 'instagram') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!-- <img src="https://via.placeholder.com/150" style="width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        }
        else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">`;
                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
                profileData += `</a>
                    </div>`;
            }

        }
    });
    profileData += `</div>
                            <div id="comment-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        if (item.event == 'added new comment.') {
            profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <h4>
                                            <a href="` + item.url + `" target="_blank">
                                                <img src="assets/images/chat.png"> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                            </a>
                                        </div>`;
        }else if (item.platform == 'linkedin') {

            if(item.event == 'comment'){

                    profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                        <a href="` + item.url + `" target="_blank">
                                         <h4>
                                            <img src="assets/images/chat.png">`
                                            + item.author + ` ` + item.text + `
                                         </h4>
                                         <h5>
                                            <img src="assets/images/linkedin.png" width="20px"> ` + 
                                            (item.date != null ? formatDate(item.date) : 'NA') + `
                                         </h5>
                                        </a>
                                    </div>`;

            }

        }
    });
    profileData += `</div>
                        </div>
                    </div>

                    <div id="objectives" class="tab-pane fade pl-2 pr-2 objectives_list" data-id="` + singleInfluencer[i].id + `">
                        <div class="col-md-12 row_sec p-0 dream-outcome mt-4 mb-3">
                            <b><u>Dream Outcome: </u></b>
                            <span class="edit-dream-outcome"> "click to edit" </span>
                        </div> 

                        <div class="col-md-12 row_sec p-0">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Action Steps:</b><button class="obj-form-buttons delete-actions btn-right-obj">Delete Completed</button>
                        </div> 

                        <div class="col-md-12 filter-wrap text-right pr-2 d-flex flex-row-reverse checklist-filter">
                            <select class="filter-dropdown preloaded-checklist">
                                
                            </select>
                            <span>Preloaded</span>
                        </div>

                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="action_steps-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar action_steps-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 row_sec p-0 main-action_steps">
                        </div>  

                        <div class="col-md-12 row_sec p-0">
                            <input name="add-new-item-action_steps" class="obj-form-control add-new-item-action_steps default-hide" value="" placeholder="Write here and press enter">
                            <button id="add-item-action_steps" class="add-item-action_steps obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide close-btn-actions"></span>

                        </div> 

                        <div class="col-md-12 row_sec p-0 mt-4">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Notes</b><button class="obj-form-buttons delete-notes btn-right-obj">Delete Completed</button> </br>                            
                        </div>
                        
                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="notes-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar notes-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>



                        <div class="col-md-12 row_sec p-0 main-notes">
                                                 
                        </div>
                        <input name="add-new-item-notes" class="obj-form-control add-new-item-notes default-hide" placeholder="Write here and press enter">
                            <button id="add-item-notes" class="add-item-notes obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide  close-btn-notes"></span>
                    </div>


                </div>
            </div>
        </div>
    `;

    $('#profile-section').append(profileData);

    $("img.profile-image").on('error', handleError);


    getTagsDetails(singleInfluencer[i].id);

    getObjectivesDetails(singleInfluencer[i].id);
    loadAllChecklistTags();
    getPreloadedChecklist();
    setTimeout(() => {
        loadGlobalScripts();
    }, 1000);

    $('#loader').hide();
    $("#profile_screen").show();
}



function updateProgressBar(addedInfluencers, type = 'initial'){


    if(type == 'deleted'){
        let existingUsed = $(".usedLimit:eq(0)").text();
        addedInfluencers = parseInt(existingUsed) - 1;
    }else{
        addedInfluencers = parseInt(addedInfluencers);
    }

    $(".usedLimit").text(addedInfluencers);
    $(".planLimit").text(_config.planLimit);

    let fill = (addedInfluencers / _config.planLimit)*100;
    // console.log('fill',fill);
    $(".progress .progress__bar").css('width',fill+'%');

    if(addedInfluencers >= _config.planLimit){
        $(".progress .progress__bar").addClass('danger');
        $(".upgradeBtn").show();
    }else{
        $(".progress .progress__bar").removeClass('danger');
        $(".upgradeBtn").hide();
    }

    $('.progressBarWrap').show();
    $('.progressBarLabel').show();
    // console.log(fill)

}

function initializeDatePicker(){
    // $( ".calender" ).datepicker();
}


/*$(document).ready(function() {

    $( document ).on('click',".calenderIcon", function(){

        // console.log('calender clickkkkk')

        // let index = $(this).closest('.notes-label-date').attr('data-index');
        
        // $(".calender_"+index).datepicker({dateFormat: 'yy-mm-dd', onSelect: function (dateString, txtDate) {
        //     appendDateToInput(dateString, txtDate);
        // }});
        // $(".calender_"+index).focus(); // we have to double click the button to maintain the focus that why added focus two
        // $(".calender_"+index).focus(); // will find another solution then will remove the second one
    })


});*/

/*function appendDateToInput(dateString, txtDate){


    console.log(dateString); 
    let inputId = txtDate.id;
    let alreadySelectedDate = $("#"+inputId).parent('.notes-label-date').prev().prev().attr('data-reminder');
    // console.log(alreadySelectedDate);
    // console.log(dateString);

    if(alreadySelectedDate == dateString){
        $("#"+inputId).parent('.notes-label-date').prev().prev().attr('data-reminder','undefined');
        $("#"+inputId).parent('.notes-label-date').find('.reminder_date').text('');
    }else{
        $("#"+inputId).parent('.notes-label-date').prev().prev().attr('data-reminder',dateString); 
        $("#"+inputId).parent('.notes-label-date').find('.reminder_date').text(formatNotesDate(dateString,true));
    }
    updateSelectedValues('.notes', 'notes');

    let bellIcon = false;
    let influencers_id = $('#objectives').attr('data-id');
    let currentDateStr = currentDate();

    $('.main-notes .notes').each(function(index,item){
        let reminderDate = $(item).attr('data-reminder');
        if(currentDateStr == reminderDate){
            bellIcon = true;
            return false;
        }
    });

    let infIndex = influencers.findIndex(x => x.id == influencers_id);
    $("#influencer-listing div[data-id="+infIndex+"]").find('.bell').remove();
    if(bellIcon){
        $("#influencer-listing div[data-id="+infIndex+"].col-2").prepend('<span class="bell"><img src="assets/images/notify.png"></span>');
    }
}*/


function getInfluencerNotes(id){

    chrome.storage.local.get(['authToken'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-influencer-notes",
            type: "POST",
            data: { influencer_id: id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if (res.status) {
                    var notes = res.data;
                    var notesHTML = '';
                    if(notes.length > 0){
                                                
                        notes.forEach(function(item, i) {
                            var checked = "";
                            if (item.is_checked) {
                                checked = "checked";
                            }
                            let dateOnly = '';
                            let activeBellClass = ""
                            if(item.reminder != null){
                                dateOnly = item.reminder.split(' ')[0];
                                activeBellClass = 'active';
                            }
                        
                            notesHTML += `<div class="notes_row" data-id="`+item.id+`">
                                <span class="notes_checkbox">
                                    <input type="checkbox" `+checked+`>
                                </span>
                                <span class="notes_title">
                                    `+item.title+`
                                </span>
                                <span class="notes_reminder" data-reminder="`+dateOnly+`">
                                    <span>`+getDatesForNotes(item.reminder)+`</span>
                                    <i class='fa fa-bell calenderIcon `+activeBellClass+`' aria-hidden='true' title='Add reminder'></i>
                                    <input type="text" class="calender calender_` + i + `" style="visibility:hidden;width: 1px;" value="`+dateOnly+`">
                                </span>
                                <span>
                                     - 
                                </span>
                                <span class="notes_added_date">
                                    <i class="fa fa-clock-o clockIcon" aria-hidden="true" title="Created date"></i> 
                                    `+getDatesForNotes(item.created_at)+`
                                </span>
                            </div>`;
                            
                        });
                        $('.main-notes').html(notesHTML);
                        updateNotesProgressBar();
                        
                    }else{
                        $('.main-notes').html(notesHTML);
                    }
                    

                        // initializeDatePicker();
                        // displayPorgressBarOnLoad('.notes', 'notes');
                }
            }
        })
    });

}


function getDatesForNotes(dateString){

    var date = '';
    if(dateString != null){
        let dateArray = dateString.split(' ');
        dateArray = dateArray[0].split('-');
        let dd = dateArray[2];
        let mm = dateArray[1];
        date = mm + '/' + dd;
    }
    return date;
}
    
function addNewNote(){

    let note = $(".add-new-item-notes").val();
    let influencer_id = $('#objectives').attr('data-id');
    var d = new Date();
    var month = d.getMonth()+1, day = d.getDate();
    var todayDate = d.getFullYear() +'-'+(month<10 ? '0' : '') + month +'-'+(day<10 ? '0' : '') + day;

    chrome.storage.local.get(['authToken'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/add-influencer-note",
            type: "POST",
            data: { influencer_id: influencer_id, date: todayDate, note: note },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if(res.status){

                    let newRow = `<div class="notes_row" data-id="`+res.note_id+`">
                        <span class="notes_checkbox">
                            <input type="checkbox">
                        </span>
                        <span class="notes_title">
                            `+note+`
                        </span>
                        <span class="notes_reminder" data-reminder="">
                            <span>`+getDatesForNotes(null)+`</span>
                            <i class='fa fa-bell calenderIcon' aria-hidden='true' title='Add reminder'></i>
                            <input type="text" class="calender" style="visibility:hidden;width: 1px;" value="">
                        </span>
                        <span>
                             - 
                        </span>
                        <span class="notes_added_date">
                            <i class="fa fa-clock-o clockIcon" aria-hidden="true" title="Created date"></i> 
                            `+getDatesForNotes(todayDate)+`
                        </span>
                    </div>`;

                    /*let newRow = `<div class="notes_row">
                        <span class="notes_checkbox">
                            <input type="checkbox">
                        </span>
                        <span class="notes_title">
                            `+note+`
                        </span>
                        <span class="notes_reminder">
                            `+getDatesForNotes(null)+`
                            <i class='fa fa-calendar calenderIcon' aria-hidden='true' title='Add reminder'></i>
                        </span>
                        <span>
                             - 
                        </span>
                        <span class="notes_added_date">
                            <i class="fa fa-clock-o clockIcon" aria-hidden="true" title="Created date"></i> 
                            `+getDatesForNotes(todayDate)+`
                        </span>
                    </div>`;*/

                    $('.main-notes').append(newRow); 
                    $('.add-new-item-notes').hide();
                    $('.loading-notes').addClass('default-hide');
                    $('.add-item-notes').show();
                    $('.add-new-item-notes').val('');
                    toastr["success"](res.message); 
                }
            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception); 
            }
        });
    });
}

function updateNote(note_id, column, value){

    chrome.storage.local.get(['authToken'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/update-influencer-note",
            type: "POST",
            data: { note_id: note_id, column: column, value: value },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                if(res.status){


                    
                }
            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception); 
            }
        });
    });
}

function updateNotesProgressBar(){

    let checkedNotes = $(".notes_checkbox input:checked").length;
    let totalNotes = $(".notes_checkbox input").length;
    let calculatedPercentage = (100 * checkedNotes) / totalNotes;
    $('.notes-progress').css('width', calculatedPercentage + '%');
    $('.notes-only').text(Math.round(calculatedPercentage) + '%');

}

function updateReminder(dateString, txtDate, inputField){

    // var newReminder = '';

    let note_id = $(inputField).parent().parent().attr('data-id');

    let previousReminder = $(inputField).parent().attr('data-reminder');
    previousReminder = previousReminder.replaceAll('-','');


    let newReminder = dateString.replaceAll('-','');

    if(previousReminder == newReminder){
        newReminder = null;
        $(inputField).parent().find('.calenderIcon').removeClass('active');
    }else{
        newReminder = dateString;
        $(inputField).parent().find('.calenderIcon').addClass('active');
    }

    $(inputField).parent().attr('data-reminder', newReminder);
    $(inputField).parent().find('span').html(getDatesForNotes(newReminder));
    updateNote(note_id,'reminder', newReminder);

    let bellIcon = false;
    let influencer_id = $('#objectives').attr('data-id');
    let currentDateStr = currentDate();
    currentDateStr = currentDateStr.replaceAll('-','');

    $('.main-notes .notes_reminder').each(function(index,item){
        let reminderDate = $(item).attr('data-reminder');
        if(reminderDate != "" && reminderDate != undefined){
            reminderDate = reminderDate.replaceAll('-','');
            //console.log(reminderDate)
            if(currentDateStr >= reminderDate){
                bellIcon = true;
                return false;
            }
        }
    });

    let infIndex = influencers.findIndex(x => x.id == influencer_id);
    $("#influencer-listing div[data-id="+infIndex+"]").find('.bell').remove();
    if(bellIcon){
        $("#influencer-listing div[data-id="+infIndex+"].col-2").prepend('<span class="bell"><img src="assets/images/notify.png"></span>');
    }
}

function copyToClipboard(url) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(url).select();
    document.execCommand("copy");
    $temp.remove();
}

$(document).ready(function(){

    chrome.storage.local.get(["lastScreen"],function(_ref){
        // console.log(_ref.lastScreen);
        if (typeof _ref.lastScreen != "undefined") {
            //displayLastScreen({'tab':'dashboard'}); // added by Rajinder Sharma
            displayLastScreen(_ref.lastScreen);
        } else {
            $('#loader').hide();
        }
    });

    $(document).on('change','.notes_checkbox input',function(){

        let note_id = $(this).closest('.notes_row').attr('data-id');
        let checked = 0;
        if ($(this).is(":checked")) {
            checked = 1;
        }
        updateNote(note_id,'is_checked', checked);
        updateNotesProgressBar();
    });


    $(document).on('click','.notes_title',function(){
        $(this).attr('contenteditable', 'true');
    });

    $(document).on('blur','.notes_title',function(){
        let note_id = $(this).closest('.notes_row').attr('data-id');
        let title = $(this).text().trim();
        updateNote(note_id,'title', title);        
    });

    $(document).on('click','.calenderIcon',function(){


        let inputField = $(this).next();        
        $(inputField).datepicker({dateFormat: 'yy-mm-dd', onSelect: function (dateString, txtDate) {
            // console.log(inputField)
            updateReminder(dateString, txtDate, inputField);
        }});
        $(inputField).focus(); // we have to double click the button to maintain the focus that why added focus two
        $(inputField).focus(); // will find another solution then will remove the second one


    });


    $(document).on('click', '.delete-notes', function() {
        let checkedNotes = $(".notes_checkbox input:checked");
        let idsToDelete = [];
        $.each(checkedNotes, function(index, item) {
            let id = $(item).closest('.notes_row').attr('data-id');
            idsToDelete.push(id);
        });
        idsToDelete = idsToDelete.join(',');
        $("#notesIdToDelete").val(idsToDelete);
        $("#deleteNotesModal").modal('show');
    });

    $(document).on('click', '.delete-notes-btn', function() {

        let idsToDelete = $("#notesIdToDelete").val();

        let idsToDeleteArray = idsToDelete.split(',');

        $.each(idsToDeleteArray, function(index, id) {
            $(".notes_row[data-id='"+id+"']").remove();
        });
        updateNotesProgressBar();

        $("#deleteNotesModal").modal('hide');

        chrome.storage.local.get(['authToken'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/delete-influencer-note",
                type: "POST",
                data: { ids: idsToDelete },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                    if(res.status){

                    }
                },
                error: function(jqXHR, exception) {
                    toastr["error"]("Request failed: " + exception); 
                }
            });
        });
        
    });

    $(document).on('click','.edit-extra-links', function(){

        let index = $(this).attr('data-id');
        $("#infIndexToUpdate").val(index);
        $("#extraLinksModal").modal('show');
    });

    $(document).on('click','.add_link_row', function(){
        $(".extra_links_wrap").append(`
            <div class="form-group">
                <input type="text" class="form-control">
                <span class="add_link_row">Add</span>
            </div>`
        );
    });

    $(document).on('click','#updateExtraLinks', function(){

        let linksArray = [];
        let infIndexToUpdate = $("#infIndexToUpdate").val();
        let influencer_id = influencers[infIndexToUpdate].id;
        $('.extra_links_wrap .form-group').each(function(index, item){

            let link = $(item).find('label').text();

            if(link == ''){
                $(item).remove();
            }
            linksArray.push(link);

        });

        $("#updateExtraLinks").text('Loading...');
        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/update-objectives-info",
                type: "POST",
                data: { influencer_id: influencer_id, key: 'extra_links', value: linksArray },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function(res) {
                    // console.log(res);
                    toastr["success"](res.message);
                    $("#updateExtraLinks").text('Update');
                },
                error: function(jqXHR, exception) {
                    toastr["error"]("Request failed: " + exception);
                    $("#updateExtraLinks").text('Update'); 
                }
            });
        });

    });

    $(document).on('click','.edit_single_link', function(){

        $(".single_link").attr('contenteditable', 'false');
        $(".single_link").removeClass('link_border');

        let label = $(this).parent().find('.single_link');

        $(label).attr('contenteditable', 'true');
        $(label).addClass('link_border');
        $(label).focus();
        // $(this).parent().find('.single_link').attr('contenteditable', 'true');
        // console.log()
        // $(this).attr('contenteditable', 'true');
    })


    $(document).on('click','.remove_single_link', function(){
        $(this).parent().remove();
    });

    $(document).on('blur','.single_link', function(){
        $(".single_link").attr('contenteditable', 'false');
        $(".single_link").removeClass('link_border');
    });

    
    $(document).on('click','.add_link_btn', function(){
       
        let newRow = `
            <div class="form-group">
                <label class="single_link link_border" contenteditable="true"></label>
                <span class="edit_single_link">
                    <i class="fa fa-edit"></i>
                </span>
                <span class="remove_single_link">
                    <i class="fa fa-close"></i>
                </span>
            </div>
        `;

        $(".single_link").attr('contenteditable', 'false');
        $(".single_link").removeClass('link_border');

        $('.extra_links_wrap').append(newRow);
    });

    $(document).on('click','.open_extra_links', function(){

        let linksToOpen = [];
        $('.extra_links_wrap .form-group').each(function(index, item){
            let link = $(item).find('label').text();
            if(link != ''){
                linksToOpen.push(link);
            }
        });

        $.each(linksToOpen,function(i,link){
            window.open(link, '_blank'); 
        });
        // console.log(linksToOpen)

    });

    
    $(document).on('click','.generalTab', function(){
        chrome.storage.local.get(['defaultEmailApp'], function(_ref) {
            // console.log(_ref)
            if(_ref.defaultEmailApp == 1){
                $("#default_email_app").prop('checked',true);
            }else{
                $("#default_email_app").prop('checked',false);
            }
        });
    });

    $(document).on('change', "#default_email_app", function(){

        let newValue = 0;
        if($(this).is(":checked")){
            newValue = 1;
        }

        chrome.storage.local.get(['authToken'], function(_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/update-default-email-app",
                type: "POST",
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                data: { data: newValue },
                success: function(res) {
                    if (res.status) {
                        chrome.storage.local.set({defaultEmailApp: newValue});
                        toastr["success"](res.message);
                    }
                },
                error: function(jqXHR, exception) {
                    console.log("Request failed: " + exception);
                }
            });
        });
    })

    $(document).on('click','.convo_type li', function(){

        let type = $(this).attr('data-type');
        let infIndex = $(".convo_type").attr('data-index');
        let influencer_id = influencers[infIndex].id;

        let tempInfluencers = influencers;
        tempInfluencers[infIndex].convo_type = type;
        influencers = tempInfluencers;
        updateConvoTypeDropdown(type);
        // console.log(type)

        chrome.storage.local.get(['authToken', 'selectedProfileDetails'], function(_ref) {

            if(_ref.selectedProfileDetails != undefined && _ref.selectedProfileDetails != ""){
                let tempProfileData = _ref.selectedProfileDetails;
                tempProfileData.convo_type = type;
                chrome.storage.local.set({'selectedProfileDetails':tempProfileData});
            }

            $.ajax({
                url: _config.apiBaseUrl + "/update-convo-type",
                type: "POST",
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                data: { type: type, influencer_id:influencer_id},
                success: function(res) {
                    if (res.status) {
                        toastr["success"](res.message);
                    }
                },
                error: function(jqXHR, exception) {
                    console.log("Request failed: " + exception);
                }
            });
        });

    })


/*----------------------------12-07-2022----------------------------*/

    $(document).on('click', '.manageTags', function() {
        updateLastScreen('setting', 'manageTags');
    });

    $(document).on('click', '.setting_icon', function() {
        updateLastScreen('setting', false);
    });

    $(document).on('click', '.manageChecklist', function() {
        updateLastScreen('setting', 'manageChecklist');
    });

    $(document).on('click', '.manageScripts', function() {
        updateLastScreen('setting', 'manageScripts');
    });

    $(document).on('click', '.generalTab', function() {
        updateLastScreen('setting', 'generalTab');
    });

    $(document).on('click', '.home_icon', function() {
        updateLastScreen('dashboard', false);
    });

    /*----------------------------12-07-22 end--------------*/

    $(document).on('click', '.removeAssignedTagsPopup', function(){

        var data = '';
        // loadAllTags();
        chrome.runtime.sendMessage({action:'getAssignedTags'})
        $.each(assignedTags, function(index,item){
            if(item != ''){
                data += `
                <div class="row tag_rows">
                    <div class="col-1 check_list pr-0">
                        <input type="checkbox" class="tag_to_remove" value="${item.toUpperCase()}" name="tagName">
                    </div>
                    <div class="col-10 pl-0">
                        <div class="col-12 p-0 shown_tags_sec" style="background:#05931c;">
                            <h3>${item.toUpperCase()}</h3>
                        </div>
                    </div>
                    <!-- <div class="col-1 p-0 delete-icon">
                        <i class="fa fa-trash tags-delete-icon" data-id="32"></i>
                    </div> -->
                </div>
            `;
            }
            
        });
        $(".tagsToRemoveWrapper").html(data);
        $("#remove_tags_modal").modal('show');
    });

    $(document).on('click', '.delete-assigned-tags-button', function(){

        let checkedElementes = $(".tag_to_remove:checked");
        $(".tag_rows").removeClass('row-in-process');
        let tagsArray = [];
        if(checkedElementes.length){
            $(checkedElementes).each(function(){
                tagsArray.push($(this).val());
                $(this).parent().parent().addClass('row-in-process');
            });

            $("#remove_tags_modal button").attr('disabled', true);
            $("#remove_tags_modal button").text('Removing..');
            chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
                $.ajax({
                    url: _config.apiBaseUrl + "/delete-assigned-tags",
                    type: "POST",
                    headers: {
                        "Authorization": "Bearer " + _ref.authToken
                    },
                    data: { tags:tagsArray },
                    success: function(res) {
                        if (res.status) {
                            $("#remove_tags_modal button").attr('disabled', false);
                            $("#remove_tags_modal button").text('Remove');
                            $(".row-in-process").remove();
                            toastr["success"](res.message);
                            chrome.runtime.sendMessage({action:'getAssignedTags'})

                        }else{
                            toastr["error"]('There was an error.');
                        }
                    },
                    error: function(jqXHR, exception) {
                        console.log("Request failed: " + exception);
                    }
                });
            });
        }else{
            toastr["error"]('Select atleast one tag.');
            return false;
        }
    });


    $(document).on('click', "#webhookUrl", function(){
        chrome.storage.local.get(["webhookKey"],function(_ref){
            if (typeof _ref.webhookKey != "undefined") {
                let url = _config.apiBaseUrl+"/google-sheet-webhook/"+_ref.webhookKey;
                copyToClipboard(url);
                toastr["success"]("URL copied successfully.");
            }
        });
    });

    $(document).on('click', ".inf_selection_all", function(){
        bulkSelectedInfIds = [];
        let isChecked = $(this).is(':checked');
        $(".inf_selection").each(function(index,item){
            $(item).prop('checked', isChecked);
            let id = $(item).val();
            if(isChecked){
                bulkSelectedInfIds.push(id);
            }
        });
    });

    $(document).on('click', ".inf_selection", function(){
        let isChecked = $(this).is(':checked');
        let value = $(this).val();
        if($(".inf_selection").length == $(".inf_selection:checked").length){
            $(".inf_selection_all").prop('checked', true);
        }else{
            $(".inf_selection_all").prop('checked', false);
        }
        if(isChecked){
            let index = bulkSelectedInfIds.indexOf(value);
            if(index < 0){
                bulkSelectedInfIds.push(value);
            }
        }else{
            let index = bulkSelectedInfIds.indexOf(value);
            if(index >= 0){
                bulkSelectedInfIds.splice(index, 1);
            }
        }
    });

    $(document).on('change', ".selected_inf_action_dropdown", function(){
        let selectedOption = $(this).val();
        if(selectedOption == "export"){
            exportInfluencers();
        }else if(selectedOption == "delete"){
            confirmDeleteSelectedInfluencers();
        }
    });

    $(document).on('click', ".delete-selected-influencers", function(){
        // need to create apis
        $("#bulkDeleteInfluencerModal button").attr('disabled', true)
        chrome.storage.local.get(['authToken', 'userId'], function(_ref) {

            let idsToDelete = $("#bulkIdsToDelete").val();
            $.ajax({
                url: _config.apiBaseUrl + "/bulk-delete-influencer",
                type: "POST",
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                data: { influencer_ids: idsToDelete },
                success: function(res) {
                    if (res.status) {
                        $("#bulkDeleteInfluencerModal button").attr('disabled', false);
                        $("#bulkDeleteInfluencerModal").modal('hide');
                        toastr["success"](res.message);
                        resetDropdownValue();
                        $("#current_influencer").html('0');
                        getAllInfluenerDetails(true);
                        // showListingAfterDelete();
                        // updateProgressBar(0,'deleted');
                        //showListingAfterDelete();
                    }else{
                        $("#bulkDeleteInfluencerModal button").attr('disabled', false);
                    }
                },
                error: function(jqXHR, exception) {
                    $("#bulkDeleteInfluencerModal button").attr('disabled', false);
                    console.log("Request failed: " + exception);
                }
            });
        });

    });

    $(document).on('click', ".cancel-delete-bulk", function(){
        resetDropdownValue();
    });
});



function confirmDeleteSelectedInfluencers(){
    if(bulkSelectedInfIds.length == 0){
        toastr["error"]("Select influencer first");
        resetDropdownValue();
        return false;
    }
    $("#bulkIdsToDelete").val(bulkSelectedInfIds);
    $("#bulkDeleteInfluencerModal").modal('show');
}

function exportInfluencers(){

    if(bulkSelectedInfIds.length == 0){
        toastr["error"]("Select influencer first");
        resetDropdownValue();
        return false;
    }

    toastr["success"]("CSV will be exported shortly.");
    resetDropdownValue();

    chrome.storage.local.get(['authToken'], function(_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/get-users-extra-info",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            data: { influencer_ids: bulkSelectedInfIds },
            success: function(res) {

                if (res.status) {                    
                    createCSV(res.data);
                }
            },
            error: function(jqXHR, exception) {
                console.log("Request failed: " + exception);
            }
        });
    });
}

function createCSV(extraInfo){

    let influencersToExport = influencers.filter(function (inf) {
        let index = bulkSelectedInfIds.indexOf(String(inf.id));
        if(index >= 0){
            return true;
        }
        return false; 
    });

    var csvData = [];
    var csvHeader = [];
    csvHeader.push('Full Name');
    csvHeader.push('Title');
    csvHeader.push('Image URL');
    csvHeader.push('Email');
    csvHeader.push('Phone');
    csvHeader.push('Full Address');
    csvHeader.push('Facebook Url');
    csvHeader.push('LinkedIn Url');
    csvHeader.push('YouTube URL');
    csvHeader.push('Instagram URL');
    csvHeader.push('Twitter Url');
    csvHeader.push('Pinterest URL');
    csvHeader.push('Website/Extra Links')
    csvHeader.push('Tag')
    csvData.push(csvHeader.join(',')); 
    $.each(influencersToExport, function(index,influencer){
        var csvRow = [];
        let fullname = influencer.ful_name;
        let image = influencer.photo_uri
        var contactInfo = [];
        if (influencer.bio_contact != '') {
            var contactInfo = JSON.parse(influencer.bio_contact);
        }
        let socialInfo = JSON.parse(influencer.bio_social);

        let emailIndex = contactInfo.findIndex(x => x.field_type == 'Email');
        let mobileIndex = contactInfo.findIndex(x => x.field_type == 'Mobile');
        let addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
        let titleIndex = contactInfo.findIndex(x => x.field_type == 'Title');

        let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
        let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
        let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
        let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');
        let twitterIndex = socialInfo.findIndex(x => x.field_type == 'Twitter');
        let pinterestIndex = socialInfo.findIndex(x => x.field_type == 'Pinterest');


        
        var email = "";
        if(emailIndex >= 0){
            email = contactInfo[emailIndex].text;
        }

        var mobile = "";
        if(mobileIndex >= 0){
            mobile = contactInfo[mobileIndex].text;
        }
    
        var address = "";
        if(addressIndex >= 0){
            address = contactInfo[addressIndex].text;
        }

        var title = "";
        if(titleIndex >= 0){
            title = contactInfo[titleIndex].text;
        }

        let facebookUrl = socialInfo[facebookIndex].text[0];
        let linkedInUrl = socialInfo[linkedInIndex].text[0];
        let youTubeUrl = socialInfo[youTubeIndex].text[0];
        let instagramUrl = socialInfo[instagramIndex].text[0];
        let twitterUrl = socialInfo[twitterIndex].text[0];
        let pinterestUrl = socialInfo[pinterestIndex].text[0];


        extraInfoIndex = extraInfo.findIndex(x => x.id == influencer.id);
        var extraLinks = '';
        var tags = '';
        if(extraInfoIndex >= 0){
            extraLinks = extraInfo[extraInfoIndex].extra_links
            tags = extraInfo[extraInfoIndex].tags

            if(extraLinks != null && extraLinks != ''){
                extraLinks = JSON.parse(extraLinks);
                extraLinks = extraLinks.join(' ')
            }

            if(tags != null && tags != ''){
                tags = JSON.parse(tags);
                if(tags != null){
                    tags = tags.join('|')
                }
                
            }
        }

        csvRow.push(sanitizeData(fullname));
        csvRow.push(sanitizeData(title));
        csvRow.push(sanitizeData(image));
        csvRow.push(sanitizeData(email));
        csvRow.push(sanitizeData(mobile));
        csvRow.push(sanitizeData(address));
        csvRow.push(sanitizeData(facebookUrl));
        csvRow.push(sanitizeData(linkedInUrl));
        csvRow.push(sanitizeData(youTubeUrl));
        csvRow.push(sanitizeData(instagramUrl));
        csvRow.push(sanitizeData(twitterUrl));
        csvRow.push(sanitizeData(pinterestUrl));
        csvRow.push(extraLinks)
        csvRow.push(tags)
        csvData.push(csvRow.join(',')); 

    })

    csvData = csvData.join('\n');
    CSVFile = new Blob([csvData], { type: "text/csv" });
    var temp_link = document.createElement('a');
    temp_link.download = "dream100-export.csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);
    temp_link.click();
    document.body.removeChild(temp_link);

}

function sanitizeData(str){
    if(str != null){
        return str.split(',').join(' ');
    }
    return '';
}
function resetDropdownValue(){
    $(".selected_inf_action_dropdown").val('');
}

function showDetailSectedProfile(i,selectedInfluencers,data,reset = true) {

   // console.log(selectedInfluencers)

    if(reset){
        indexNoToRemove = -1; // changed to default state so that it will not remove further indexes    
    }


    var activity = selectedInfluencers.activity;
    if (selectedInfluencers.bio_contact != '') {
        var contactInfo = JSON.parse(selectedInfluencers.bio_contact);
    } else {
        var contactInfo = [
            { "field_type": "Email", "text": " " },
            { "field_type": "Mobile", "text": " " },
            { "field_type": "Address", "text": " " },
            { "field_type": "Title", "text": " " },
            { "field_type": "TitleUrl", "text": " " },
        ];
    }

    if (selectedInfluencers.bio_social != '') {
        var socialInfo = JSON.parse(selectedInfluencers.bio_social);
    } else {
        var socialInfo = [
            { "field_type": "Facebook", "text": [""], "is_editing": 0 },
            { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
            { "field_type": "YouTube", "text": [""], "is_editing": 0 },
            { "field_type": "Instagram", "text": [""], "is_editing": 0 },
            { "field_type": "Twitter", "text": [""], "is_editing": 0 },
            { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
        ];
    }

    let emailIndex = contactInfo.findIndex(x => x.field_type == 'Email');
    let mobileIndex = contactInfo.findIndex(x => x.field_type == 'Mobile');
    let addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    let title = contactInfo.findIndex(x => x.field_type == 'Title');
    let titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');

    let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
    let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
    let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
    let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');
    let twitterIndex = socialInfo.findIndex(x => x.field_type == 'Twitter');
    let pinterestIndex = socialInfo.findIndex(x => x.field_type == 'Pinterest');

    let facebookUrl = socialInfo[facebookIndex].text[0];
    let linkedInUrl = socialInfo[linkedInIndex].text[0];
    let youTubeUrl = socialInfo[youTubeIndex].text[0];
    let instagramUrl = socialInfo[instagramIndex].text[0];
    let twitterUrl = socialInfo[twitterIndex].text[0];
    let pinterestUrl = socialInfo[pinterestIndex].text[0];
    
    if (contactInfo[addressIndex] == 'undefined' || typeof contactInfo[addressIndex] == 'undefined') {
        contactInfo.push({ "field_type": "Address", "text": " " });
        addressIndex = contactInfo.findIndex(x => x.field_type == 'Address');
    }

    if (titleUrl != -1 || contactInfo[titleUrl] == 'undefined' || typeof contactInfo[titleUrl] == 'undefined') {

        contactInfo.push({ "field_type": "TitleUrl", "text": "" });
        titleUrl = contactInfo.findIndex(x => x.field_type == 'TitleUrl');
    }

    if (title != -1 || contactInfo[title] == 'undefined' || typeof contactInfo[title] == 'undefined') {

        contactInfo.push({ "field_type": "Title", "text": "" });
        title = contactInfo.findIndex(x => x.field_type == 'Title');
    }

    let profileFB_url_array = facebookUrl.split('/');
    let profileFB_id = profileFB_url_array[profileFB_url_array.length - 1];

    let dm_url = "https://www.messenger.com/t/" + profileFB_id;
    $(".tab").hide();
    $('#profile-section').empty();

    let inf_profile_img_url = '';
    if(selectedInfluencers.template_flag == 1) {
        inf_profile_img_url = selectedInfluencers.photo_uri;
    }else {
        inf_profile_img_url = _config.baseUrl+'/public/images/'+selectedInfluencers.photo_uri;
    }
  

    

    var profileData = `
        <div class="col-12 mt-4 profile_part p-0 pb-2">
            <div class="row">
                <div class="col-3 profile_img">
                    <span class="back-link"><img src="assets/images/back.png" class="back-icon"></span>
                    <img src="${inf_profile_img_url}" class="profile-image" /> 
                    <div class="dropdown convo_type" data-index="${i}">
                        <button class="dropdown-toggle" type="button" data-toggle="dropdown">
                            <span class="selected_convo">Default</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                          <li data-type="email" title="Email"><img src="assets/images/email.jpg"></li>
                          <li data-type="text" title="Text"><img src="assets/images/text.jpg"></li>
                          <li data-type="phone" title="Phone"><img src="assets/images/phone.jpg"></li>
                          <li data-type="messenger" title="Messenger"><img src="assets/images/messenger.jpg"></li>
                          <li data-type="instagram" title="Instagram"><img src="assets/images/instagram.jpg"></li>
                          <li data-type="linkedin" title="LinkedIn"><img src="assets/images/linkedin.jpg"></li>
                          <li data-type="youtube" title="Youtube"><img src="assets/images/youtube.jpg"></li>
                        </ul>
                    </div>
                </div>
                <div class="col-9 p-0">
                    
                    <div class="row">
                        <div class="col-10 p-0">
                            <h2 class="name">${selectedInfluencers.ful_name}</h2> 
                            </div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup copyInfluencerName" data-value="${selectedInfluencers.ful_name}" data-key="Ful_name" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy email" class="copyInfluencerName" data-value="${selectedInfluencers.ful_name}"/>  
                        </div>
                    </div> 
                    <div class="row"> 
                        <div class="col-10 p-0"><a href="${contactInfo[titleUrl]?.text}" class="small" target="_blank">${contactInfo[title].text} </a></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[title].text}" data-key="Title" data-id="${i}"/>  
                            <img src="assets/images/copy.png" title="Click to copy email" class="copyTitle" data-value="${contactInfo[title].text}"/> 
                        </div>                        
                    </div>
                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/envelope.png"/> Email: <span>${contactInfo[emailIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[emailIndex].text}" data-key="Email" data-id="${i}" />
                            <img src="assets/images/copy.png" title="Click to copy email" class="copyEmail" data-value="${contactInfo[emailIndex].text}"/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/phone.png" /> Mobile: <span>${contactInfo[mobileIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[mobileIndex].text}" data-key="Mobile" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy mobile" class="copyNumber" data-value="${contactInfo[mobileIndex].text}"/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-10 p-0"> <h3><img src="assets/images/address.png" /> Address: <span>${contactInfo[addressIndex].text}</span></h3></div>
                        <div class="col-2 p-0">
                            <img src="assets/images/edit.png" class="edit-info-popup" data-value="${contactInfo[addressIndex].text}" data-key="Address" data-id="${i}"/>
                            <img src="assets/images/copy.png" title="Click to copy address" class="copyAddress" data-value="${contactInfo[addressIndex].text}"/>
                        </div>
                    </div>                                       

                </div>
            </div>
        </div>   
        <div class="row listing">
            <div class="col-3 p-0">
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (facebookUrl != '' ? facebookUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (facebookUrl != '' ? facebookUrl : '') + `" data-key="Facebook" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (linkedInUrl != '' ? linkedInUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-linkedin"></i> LinkedIn</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (linkedInUrl != '' ? linkedInUrl : '') + `" data-key="LinkedIn" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (youTubeUrl != '' ? youTubeUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-youtube-play"></i> Youtube</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (youTubeUrl != '' ? youTubeUrl : '') + `" data-key="YouTube" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (instagramUrl != '' ? instagramUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-instagram"></i> Instagram</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (instagramUrl != '' ? instagramUrl : '') + `" data-key="Instagram" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (twitterUrl != '' ? twitterUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (twitterUrl != '' ? twitterUrl : '') + `" data-key="Twitter" data-id="${i}" /></div>
                </div>
                <div class="row">
                    <div class="col-8 pr-0"><a href="` + (pinterestUrl != '' ? pinterestUrl : 'javascript:void(0)') + `" target="_blank"><i class="fa fa-pinterest"></i> Pinterest</a></div>
                    <div class="col-3 p-0"><img src="assets/images/edit.png" class="edit-info-popup" data-value="` + (pinterestUrl != '' ? pinterestUrl : '') + `" data-key="Pinterest" data-id="${i}" /></div>
                </div>

                <div class="row">
                    <div class="col-8 pr-0">
                        <a href="javascript:void(0)" class="open_extra_links">
                            <i class="fa fa-link"></i> Extra Links
                        </a>
                    </div> 
                    <div class="col-3 p-0">
                        <img src="assets/images/edit.png" class="edit-extra-links" data-id="${i}"/>
                    </div>
                </div>  

                <div class="row">
                    <div class="col-12 pr-0"><a href="javascript:void(0)" target="_blank"><i class="fa fa-tags"></i> Tags</a></div>
                    <div class="get-tags col-12 p-0"> <p class="fetch">Fetching Tags... </p>
                    <select class="request-input tagsinputbox" multiple placeholder="Type Here..." data-role="tagsinput"></select>
                    </div>
                    <div class="tag-suggestion-container col-12" style="padding: 4px 6px;">
                        <ul class="list-group" id="tagSuggestionList">
          
                        </ul>
                    </div>
                </div>               
            </div>
            <div class="col-9 p-0">

            <a class="emailDefaultLink" href="#" target="_blank"><img src="assets/images/envelope.png" /> Email</a>
            <a href="${dm_url}" target="_blank"><img style="width: 25px;" src="assets/images/messnger.png" /> DM</a>
            <a href="https://www.dream100videobox.com" target="_blank"><img src="assets/images/video.png" /> Video Box</a>
            <a href="https://www.dream100box.com" target="_blank"><img src="assets/images/mail_swag.png" /> Mail Swag</a>
            <a href="https://www.facebook.com/${profileFB_id}/friends_mutual" target="_blank"><img src="assets/images/people.png" /> Friends</a>
 
                     <div class="filter-wrap pr-1">
                                <span>Script </span>
                                <select class="filter-dropdown select_script_dropdown">
                                    <option value="0">Select Script</option>
                                    
                                </select>
                            </div>

                <ul class="nav nav-tabs multi_tabs stats_tabs mt-2">
                
                <li class="nav-item">
                    <a class="nav-link profileTimeline active" data-toggle="tab" href="#time">Timeline</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileInterest" data-toggle="tab" href="#interests">Interests</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link profileObjectives" data-toggle="tab" href="#objectives">Objectives</a>
                </li>
                
                </ul>

                <div class="tab-content">

                    <div id="interests" class="tab-pane fade pl-2 pr-2 interest_list">
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/map" target="_blank">Check-Ins</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/sports" target="_blank">Sports</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/music" target="_blank">Music</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/movies" target="_blank">Movies</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/tv" target="_blank">Tv Shows</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/books" target="_blank">Books</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/games" target="_blank">Apps & Games</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/likes" target="_blank">Likes</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/events" target="_blank">Events</a></h3>
                        </div>
                        <div class="col-md-12 rows row_sec p-0">
                            <h3><a href="${selectedInfluencers.user_link}/groups" target="_blank">Groups</a></h3>
                        </div>
                        
                    </div>

                    <div id="time" class="active show tab-pane fade pl-2 pr-2">

                        <ul class="nav nav-tabs mt-4 multi_tabs time_tabs ">

                            <li class="nav-item">
                                <a class="nav-link active profileTimelineAll" data-toggle="tab" href="#both">All</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelinePosts" data-toggle="tab" href="#Posts-sec">Posts</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link profileTimelineComments" data-toggle="tab" href="#comment-sec">Comments</a>
                            </li>
                        </ul>
                        <div class="filter-wrap text-right pr-2">
                            <span>Social Platform</span>
                            <select class="filter-dropdown influencer-timeline-filter">
                                <option value="all">All</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">Youtube</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>
                        <hr></hr>
                        <div class="tab-content">
                            <div id="both" class="tab-pane active pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <a href="` + item.url + `" target="_blank">`;

        if (item.platform == 'youtube') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px">` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        } else if (item.platform == 'facebook') {

            profileData += `<h4>`;
            if (item.event == 'published new post.') {
                profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
            } else {
                profileData += `<img src="assets/images/chat.png">`;
            }
            profileData += item.author + `  ` + item.event + `</h4>
                                                    <p>` + (item.text != null ? item.text : '') + `</p>
                                                    <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>`;

        } else if (item.platform == 'instagram') {
            profileData += `<span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!--<img src="https://via.placeholder.com/150" style="    width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>`;
        }else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
            }else if(item.event == 'react' || item.event == 'comment'){

                    profileData += `<h4>`;
                                if(item.event == 'react'){
                                    profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
                                }else{
                                    profileData += `<img src="assets/images/chat.png">`    
                                }
                                
                                profileData += item.author + ` ` + item.text + `
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;

            }

        }

        // <h4>`;
        // if(item.event == 'published new post.'){
        //     profileData += `<i class="fa fa-sticky-note-o post-icon"></i>`;
        // }else{
        //     profileData += `<img src="assets/images/chat.png">`;
        // }
        // profileData += item.author+`  `+item.event+`</h4>
        // <p>`+(item.text != null ? item.text : '')+`</p>
        // <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        profileData += `</a>
                                        </div>
                                    `;
    });
    profileData += `</div>
                            <div id="Posts-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {

        if (item.platform == 'youtube') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img src="` + item.thumbnail + `">
                                                                <span>
                                                                    <p>` + item.text + `</p>
                                                                    <p><img src="assets/images/yt.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        } else if (item.platform == 'facebook') {

            if (item.event == 'published new post.') {
                profileData += `
                                            <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                <h4>
                                                <a href="` + item.url + `" target="_blank">
                                                <i class="fa fa-sticky-note-o post-icon"></i> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                                </a> 
                                            </div>`;
            }

        } else if (item.platform == 'instagram') {
            profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">
                                                            <span class="youtube-item-wrap">
                                                                <img  class="insta-img" src="data:image/jpg;base64,` + item.thumbnail + `">
                                                                <!-- <img src="https://via.placeholder.com/150" style="width: 75px;">-->
                                                                <span>
                                                                    <p> Posted ` + (item.event == 'video' ? 'a video' : 'an image') + `</p>
                                                                    <p><img src="assets/images/ig.png" width="20px"> ` + formatDate(item.date) + `</p>
                                                                </span>
                                                            </span>
                                                    </a>
                                                </div>`;
        }
        else if (item.platform == 'linkedin') {

            if (item.event == 'post') {

                profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                                     <a href="` + item.url + `" target="_blank">`;
                if(item.thumbnail != null){
                    profileData += `<span class="youtube-item-wrap">
                            <img  class="insta-img" src="` + item.thumbnail + `">
                            <span>
                                <p>`+ item.author + ` added a new post </p>
                                <p><img src="assets/images/linkedin.png" width="20px"> ` + formatDate(item.date) + `</p>
                            </span>
                        </span>`;
                }else{
                    profileData += `<h4>
                                <i class="fa fa-sticky-note-o post-icon"></i>`
                                + item.author + `  added a new post
                            </h4>
                            <h5>
                                <img src="assets/images/linkedin.png" width="20px"> ` + 
                                (item.date != null ? formatDate(item.date) : 'NA') + `
                            </h5>`;
                }
                profileData += `</a>
                    </div>`;
            }

        }
        // if(item.event == 'published new post.'){
        //     profileData += `
        //     <div class="col-md-12 rows p-0">
        //         <h4>
        //         <a href="`+item.url+`" target="_blank">
        //         <i class="fa fa-sticky-note-o post-icon"></i> `+item.author+`  `+item.event+`</h4>
        //         <p>`+(item.text != null ? item.text : '')+`</p>
        //         <h5>Last Scan: `+(item.date != null ? formatDate(item.date) : 'NA')+`</h5>
        //         </a> 
        //     </div>`;
        // } 
    });
    profileData += `</div>
                            <div id="comment-sec" class="tab-pane fade pl-2 pr-2 stats_list">`;
    $.each(activity, function(index, item) {
        if (item.event == 'added new comment.') {
            profileData += `
                                        <div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                            <h4>
                                            <a href="` + item.url + `" target="_blank">
                                                <img src="assets/images/chat.png"> ` + item.author + `  ` + item.event + `</h4>
                                                <p>` + (item.text != null ? item.text : '') + `</p>
                                                <h5><img src="assets/images/fb.png" width="20px"> ` + (item.date != null ? formatDate(item.date) : 'NA') + `</h5>
                                            </a>
                                        </div>`;
        }else if (item.platform == 'linkedin') {

            if(item.event == 'comment'){

                    profileData += `<div class="col-md-12 rows p-0 timeline-row ` + item.platform + `">
                                        <a href="` + item.url + `" target="_blank">
                                         <h4>
                                            <img src="assets/images/chat.png">`
                                            + item.author + ` ` + item.text + `
                                         </h4>
                                         <h5>
                                            <img src="assets/images/linkedin.png" width="20px"> ` + 
                                            (item.date != null ? formatDate(item.date) : 'NA') + `
                                         </h5>
                                        </a>
                                    </div>`;

            }

        }
    });
    profileData += `</div>
                        </div>
                    </div>

                    <div id="objectives" class="tab-pane fade pl-2 pr-2 objectives_list" data-id="` + selectedInfluencers.id + `">
                        <div class="col-md-12 row_sec p-0 dream-outcome mt-4 mb-3">
                            <b><u>Dream Outcome: </u></b>
                            <span class="edit-dream-outcome"> "click to edit" </span>
                        </div> 

                        <div class="col-md-12 row_sec p-0">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Action Steps:</b><button class="obj-form-buttons delete-actions btn-right-obj">Delete Completed</button>
                        </div> 

                        <div class="col-md-12 filter-wrap text-right pr-2 d-flex flex-row-reverse checklist-filter">
                            <select class="filter-dropdown preloaded-checklist">
                                
                            </select>
                            <span>Preloaded</span>
                        </div>

                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="action_steps-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar action_steps-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 row_sec p-0 main-action_steps">
                        </div>  

                        <div class="col-md-12 row_sec p-0">
                            <input name="add-new-item-action_steps" class="obj-form-control add-new-item-action_steps default-hide" value="" placeholder="Write here and press enter">
                            <button id="add-item-action_steps" class="add-item-action_steps obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide close-btn-actions"></span>

                        </div> 

                        <div class="col-md-12 row_sec p-0 mt-4">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i><b> Notes</b><button class="obj-form-buttons delete-notes btn-right-obj">Delete Completed</button> </br>                            
                        </div>
                        
                        <div class="row mt-3 mb-3">           
                            <div class="col-md-1 p-0">
                                <span class="notes-only progress-count"> 0% </span>
                            </div>
                            <div class="col-md-11 p-0 pt-2">
                                <div class="progress">
                                  <div class="progress-bar notes-progress" role="progressbar" aria-valuenow="70"
                                  aria-valuemin="0" aria-valuemax="100" style="width:0%">
                                    
                                  </div>
                                </div>
                            </div>
                        </div>



                        <div class="col-md-12 row_sec p-0 main-notes">
                                                 
                        </div>
                        <input name="add-new-item-notes" class="obj-form-control add-new-item-notes default-hide" placeholder="Write here and press enter">
                            <button id="add-item-notes" class="add-item-notes obj-form-buttons">Add an Item</button>
                            <span class="fa fa-close default-hide  close-btn-notes"></span>
                            <span class="fa fa-spinner fa-spin default-hide  loading-notes"></span>
                    </div>


                </div>
            </div>
        </div>
    `;

    $('#profile-section').append(profileData);

    updateConvoTypeDropdown(selectedInfluencers.convo_type);
    

    chrome.storage.local.get(['defaultEmailApp'], function(_ref) {
        console.log('inside storage', contactInfo[emailIndex].text)
        if(_ref.defaultEmailApp == 1){
            //console.log('outloook')
            $(".emailDefaultLink").attr("href","https://outlook.live.com/owa/?to="+contactInfo[emailIndex].text+"&path=/mail/action/compose")
        }else{
            //console.log('gmail')
            $(".emailDefaultLink").attr("href","https://mail.google.com/mail/u/0/?fs=1&to="+contactInfo[emailIndex].text+"&tf=cm")
            
        }
    });

    $("img.profile-image").on('error', handleError);


    getTagsDetails(selectedInfluencers.id);

    getObjectivesDetails(selectedInfluencers.id);
    loadAllChecklistTags();
    getPreloadedChecklist();
    getInfluencerNotes(selectedInfluencers.id);
    setTimeout(() => {
        loadGlobalScripts();
    }, 1000)


    $("#profile_screen").show();

    setTimeout(() => {
        if (data.childTab == 'stats') {
            // do nothing
        }else if (data.childTab == 'interests') {
            $(".profileInterest").click();
            $(".profileInterest").addClass('active');
            $(".profileStats").removeClass('active');
            $(".profileTimeline").removeClass('active');
            $("#interests").addClass('active').removeClass('fade');
            $("#stats").removeClass('active');
            $("#time").removeClass('active');
        }else if (data.childTab == 'timeline') {
            $(".profileTimeline").addClass('active');
            $(".profileStats").removeClass('active');
            $(".profileInterest").removeClass('active');
            $("#time").addClass('active').removeClass('fade');
            $("#stats").removeClass('active');
            $("#interests").removeClass('active');
            if (data.subChildTab == 'all') {
                // do nothing
            } else if (data.subChildTab == 'posts') {
                $(".profileTimelinePosts").addClass('active');
                $(".profileTimelineAll").removeClass('active');
                $("#Posts-sec").addClass('active').removeClass('fade');
                $("#both").removeClass('active');
            } else if (data.subChildTab == 'comments') {
                $(".profileTimelineComments").addClass('active');
                $(".profileTimelineAll").removeClass('active');
                $("#comment-sec").addClass('active').removeClass('fade');
                $("#both").removeClass('active');
            }
        }else if (data.childTab == 'objectives') {
            $(".profileObjectives").addClass('active');
            $(".profileInterest").removeClass('active');
            $(".profileTimeline").removeClass('active');
            $("#objectives").addClass('active').removeClass('fade');
            $("#interests").removeClass('active');
            $("#time").removeClass('active');
        }
    }, 500)
}

function updateConvoTypeDropdown(value){


    if(value != null && value != ''){
        convo_type_html = $(".convo_type li[data-type='"+value+"']").html();
    }else{
        convo_type_html = "Default";
    }
    $(".selected_convo").html(convo_type_html);
}

function getinfluencerById(id, callFrom = "") { 
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) { 

        $.ajax({
            url: _config.apiBaseUrl + "/get-influencers-by-id",
            type: "POST",
            data: { influencer_id: id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function(res) {
                var tagInputEle = $('.tagsinputbox');
                tagInputEle.tagsinput('refresh');

                //tagInputEle.tagsinput('add', '');
                if (res.status && res.data != null) {
                    let influencer = res?.data[0];
                    // Find the index of the item with ID 2
                    let indexToUpdate = influencers?.findIndex(item => item?.id === influencer?.id);
                    influencers[indexToUpdate] = influencer;    
                    chrome.storage.local.set({'selectedProfileDetails': influencer});
                    if(callFrom == 'linkedin'){
                        showDetail(indexToUpdate, false);
                    }
                }

            },
            error: function(jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
}
// getinfluencerById(10090);
// function getinfluencerById(influencerId) {
//     console.log('enter in getinfluencerById ');
//     chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
//         console.log('enter in getinfluencerById function');
//         fetch(_config.apiBaseUrl + "/get-influencers-by-id",{
//             method: "POST",
//             body: JSON.stringify({ "influencer_id": influencerId }),
//             // Adding headers to the request
//             headers: {
//                 "Authorization": "Bearer " + _ref.authToken,
//                 "Content-type": "application/json; charset=UTF-8"
//             }
//         })
//         .then(response => response.json())
//         .then((data) => {
//             console.log('data', data); 
//             if (data?.status && data?.data != null) {
//                 let influencer = data?.data[0];
//                 // Find the index of the item with ID 2
//                 let indexToUpdate = influencers?.findIndex(item => item?.id === influencer?.id);
//                 influencers[indexToUpdate] = influencer;    
//                 chrome.storage.local.set({'selectedProfileDetails': influencer});
//             }
//            console.log('getinfluencerById is ok function')
        
//         })
//         .catch((error) => {
//             console.log('Error:', error);
//         });
//     });
// }

// Content script

