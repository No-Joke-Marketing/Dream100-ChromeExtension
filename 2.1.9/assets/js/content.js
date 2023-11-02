jQuery.fn.extend({
    'mclick': function () {
            var click_event = document.createEvent('MouseEvents')
            click_event.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);
            
            return $(this).each(function () {
                $(this)[0].dispatchEvent(click_event)
            })
    }
});


$.extend($.expr[":"], {
    "containsI": function(elem, i, match, array) {
        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

// loadFullPage(0);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapLinkedinProfile') { 
        var influencerId = message.influencerId;
        loadFullPage(influencerId);
    }
    else if(message.action === 'scrapFbImage'){
        //console.log('scrapFbImage message received')

        // var img = $(message.text).find("img[alt$=\"profile picture\"]");
        // console.log(img);
        // return img[0].getAttribute('src');
    }
});

function getDate(dateString){
    
  var number = dateString.replace(/(^\d+)(.+$)/i,'$1');
  var stringArray = dateString.split(number);
  var string = stringArray[1];
  
  var dt = new Date();
    //alert(dt);
  if(string == 'd'){
    dt.setDate( dt.getDate() - number );
  }else if(string == 'w'){
    number = number * 7;
    dt.setDate( dt.getDate() - number );
  }else if(string == 'mo'){
    dt.setMonth( dt.getMonth() - number );
  }else if(string == 'yr'){
    dt.setFullYear( dt.getFullYear() - number );
  }

  let day = '' + dt.getDate();
  let month = '' + (dt.getMonth() + 1);
  let year = dt.getFullYear();

  if (month.length < 2){
    month = '0' + month;
  }
  if (day.length < 2){
    day = '0' + day;    
  }

  return [year, month, day].join('-');
}

function loadFullPage(influencerId){ 
    
        $("html, body").animate({
            scrollTop: $(document).height()
        }, 1000);
        startScrapping(influencerId); 
    
    
}

    
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var activity = [];

function startScrapping(influencerId){ 
    //console.log('start scrapping linkedin profile')
    let activity = [];
    let postScrapDone = false;
    let DELAY = 0;
    setTimeout(() => {
        let author = $(".single-line-truncate").text().trim();
       // let row = {id:"",type:'',text:'',image:'',date:'',author:author,url:'https://www.linkedin.com'};
        
        $('.scaffold-layout__main').find('div').find('section').find('div.mb3 > div > div').find('button').each(function(index, item1){ 
            let buttonId= 'content-collection-pill-'+index;
            let buttonName = $('#'+buttonId).text().trim();
            //if(buttonName === 'Posts'){
                
               // $('#'+buttonId).mclick();
               delay(2000).then(() => { 
                    console.log('process started');
                    $(".profile-creator-shared-feed-update__container").each(function(activityIndex, listItem){ 
                        if(listItem.className === 'profile-creator-shared-feed-update__container') {
                            let itemComment = $(".profile-creator-shared-feed-update__container");
                            let item = $(itemComment[activityIndex]);
                            let data_urn = item.find('div div').find('.feed-shared-update-v2').attr('data-urn'); 
                            if(data_urn != null && buttonName === 'Posts'){ 
                                data_urn = data_urn?.split(':');
                                data_urn = data_urn[data_urn.length - 1];
                                console.log(data_urn )
                                let row = {id:data_urn,type:'',text:'',image:'',date:'',author:author,url:'https://www.linkedin.com'};
                                //row.id = data_urn;
                                
                                item.find('.feed-shared-control-menu__trigger').mclick();
                                delay(2000).then(() => { 
                                    item.find('li.option-share-via [role="button"]').mclick();
                                    delay(2000).then(() => { 
                                    
                                        let url = $(".artdeco-toasts_toasts div").first().find('a.artdeco-toast-item__cta').attr('href');
                                        row.url = url;
                                        
                                        console.log('post type')
                                        row.type = 'post';
                                        if(item.find('.update-components-header__image').length > 0){
                                            let imageUrl = item.find('.update-components-header__image').find('img').attr('src');
                                            row.image = imageUrl;
                                        }

                                        if(item.find('.update-components-text').length > 0){
                                            let text = $(item).find('.update-components-text').find('span[dir="ltr"]').text();
                                            row.text = text;
                                        }


                                        if(item.find('.update-components-actor__sub-description').length > 0){
                                            let dateString = item.find('.update-components-actor__sub-description').find('span[aria-hidden="true"]').text().trim();
                                            dateString = dateString.split(' •')[0];
                                            row.date = getDate(dateString);
                                        }
                                        
                                    })    
                                })

                                activity.push(row);  
                            }
                        }
                        postScrapDone = true;
                    });
                    return delay(10000);
                }).then(() => {
                
            //}else if(buttonName === 'Comments'){ 
                //delay(10000).then(() => { 
                if(buttonName === 'Comments'){ 
                    $('#'+buttonId).mclick();
                    console.log('comment process started')
                    $(".profile-creator-shared-feed-update__container").each(function(activityIndex, listItem){ 
                        if(listItem.className === 'profile-creator-shared-feed-update__container') {
                            let item = $(this);
                            let data_urn = item.find('div div').find('.feed-shared-update-v2').attr('data-urn'); 
                            if(data_urn != null){
                                data_urn = data_urn?.split(':');
                                data_urn = data_urn[data_urn.length - 1];
                                console.log(data_urn )
                                let row = {id:data_urn,type:'',text:'',image:'',date:'',author:author,url:'https://www.linkedin.com'};

                                item.find('.feed-shared-control-menu__trigger').mclick();
                                delay(2000).then(() => { 
                                    item.find('li.option-share-via [role="button"]').mclick();
                                    delay(2000).then(() => { 
                                    
                                        let url = $(".artdeco-toasts_toasts div").first().find('a.artdeco-toast-item__cta').attr('href');
                                        row.url = url;
                                        delay(2000).then(() => { 
                                            // this is not a post may be like/love reactions
                                            console.log('react type')
                                            row.type = 'react';
                                            let itemComment = $(".profile-creator-shared-feed-update__container");
                                            let event = $(itemComment[activityIndex]).find('.update-components-header').find('.update-components-text-view span');
                                            
                                            if(event.find("span:containsI('liked')").length > 0 && event.find("span:containsI('comment')").length > 0){  
                                                console.log(data_urn, 'reacted to a comment')
                                                // Prity P. liked Shubham Pandey’s comment on this
                                                // Prity P. liked your comment on this
                                                row.text = "reacted to a comment";
                                            }
                                            else if(event.find("span:containsI('replied')").length > 0 && event.find("span:containsI('comment')").length > 0){  
                                                console.log(data_urn, 'commented on a comment')
                                                // Prity P. replied to Shubham Pandey’s comment on this
                                                row.type = 'comment';
                                                row.text = "commented on a comment";
                                            }
                                            else if(event.find("span:containsI('commented')").length > 0){
                                                // Prity P. commented on this
                                                row.type = 'comment';
                                                row.text = "commented on a post";
                                            }else{
                                                // Prity P. likes this
                                                row.text = "reacted on a post";
                                            }

                                            if(item.find('.update-components-actor__sub-description').length > 0){                    
                                                let dateString = item.find('.update-components-actor__sub-description:eq(0)').find('span[aria-hidden="true"]').text().trim();
                                                dateString = dateString.split(' •')[0];
                                                row.date = getDate(dateString);
                                            }
                                           
                                            activity.push(row);
                                        })
                                    })    
                                })

                            
                            }
                        }
                        
                    });
                    }
                })
            
            

           
        });

        setTimeout(()=>{ 
            console.log('activity', activity);
            chrome.runtime.sendMessage({action:'linkedinProfileCompleted', influencerId:influencerId, activity:activity});
        },DELAY + 30000)
        

    }, 2000);

 

    //     var DELAY = 0;
    //     var activityIndex = 0;
    //     var i = 0;
    //     var k = 0;
    //     var isScrappingCompleted = false;
    //     console.log('Total ', $(".profile-creator-shared-feed-update__container").length);
        
    //     $(".profile-creator-shared-feed-update__container").each(function(activityIndex, listItem){ 
            
    //         console.log('loop started')
    //         setTimeout(()=>{ 
               
    //             // let item = $("#main .occludable-update");
    //             //let item = $(".profile-creator-shared-feed-update__container");

    //             if(listItem.className === 'profile-creator-shared-feed-update__container') { 
    //                 let item = $(this);

    //                 console.log('process started');
    //                 //let data_urn = $(item[activityIndex]).find('> div').attr('data-urn'); 
    //                 let data_urn = item.find('div div').find('.feed-shared-update-v2').attr('data-urn'); 
    //                 if(data_urn != null){
    //                 data_urn = data_urn?.split(':');
    //                 data_urn = data_urn[data_urn.length - 1];

    //                 let row = {id:data_urn,type:'',text:'',image:'',date:'',author:author,url:'https://www.linkedin.com'};

    //                 item.find('.feed-shared-control-menu__trigger').mclick();
                    
    //                 setTimeout(() => {

    //                     item.find('li.option-share-via [role="button"]').mclick();

    //                     setTimeout(() => {
                           
    //                         let url = $(".artdeco-toasts_toasts div").first().find('a.artdeco-toast-item__cta').attr('href');

    //                         row.url = url;
                           
                            
                           
    //                         if( item.find('.update-components-header').length > 0){
                                       
                                       
    //                                     delay(2000).then(() => { 
                                           
    //                                         console.log('post type')
    //                                         row.type = 'post';
    //                                         if(item.find('.update-components-header__image').length > 0){
    //                                             let imageUrl = item.find('.update-components-header__image').find('img').attr('src');
    //                                             row.image = imageUrl;
    //                                         }

    //                                         if(item.find('.update-components-text').length > 0){
    //                                             let text = $(item).find('.update-components-text').find('span[dir="ltr"]').text();
    //                                             row.text = text;
    //                                         }


    //                                         if(item.find('.update-components-actor__sub-description').length > 0){
    //                                             let dateString = item.find('.update-components-actor__sub-description').find('span[aria-hidden="true"]').text().trim();
    //                                             dateString = dateString.split(' •')[0];
    //                                             row.date = getDate(dateString);
    //                                         }
    //                                         activity.push(row);
    //                                         return delay(10000);           
    //                                     }).then(() => {
    //                                     //index = index +1;
    //                                         let buttonId= 'content-collection-pill-1';
    //                                         $('#'+buttonId).mclick();
                                           
    //                                         return delay(20000);
    //                                     }).then(() => {
    //                                        // $('.update-components-header').load('.update-components-header')
    //                                         // this is not a post may be like/love reactions
    //                                         console.log('react type')
    //                                         row.type = 'react';
    //                                         let itemComment = $(".profile-creator-shared-feed-update__container");
    //                                         let event = $(itemComment[activityIndex]).find('.update-components-header').find('.update-components-text-view span');
                                        
    //                                         if(event.find("span:containsI('liked')").length > 0 && event.find("span:containsI('comment')").length > 0){  
    //                                             console.log(data_urn, 'reacted to a comment')
    //                                             // Prity P. liked Shubham Pandey’s comment on this
    //                                             // Prity P. liked your comment on this
    //                                             row.text = "reacted to a comment";
    //                                         }
    //                                         else if(event.find("span:containsI('replied')").length > 0 && event.find("span:containsI('comment')").length > 0){  
    //                                             console.log(data_urn, 'commented on a comment')
    //                                             // Prity P. replied to Shubham Pandey’s comment on this
    //                                             row.type = 'comment';
    //                                             row.text = "commented on a comment";
    //                                         }
    //                                         else if(event.find("span:containsI('commented')").length > 0){
    //                                             // Prity P. commented on this
    //                                             row.type = 'comment';
    //                                             row.text = "commented on a post";
    //                                         }else{
    //                                             // Prity P. likes this
    //                                             row.text = "reacted on a post";
    //                                         }

    //                                         if(item.find('.update-components-actor__sub-description').length > 0){                    
    //                                             let dateString = item.find('.update-components-actor__sub-description:eq(0)').find('span[aria-hidden="true"]').text().trim();
    //                                             dateString = dateString.split(' •')[0];
    //                                             row.date = getDate(dateString);
    //                                         }
    //                                         activity.push(row);
    //                                         k++;
    //                                         return delay(20000);
    //                                     }).then(() => {
    //                                         //index = index +1;
    //                                             let buttonId= 'content-collection-pill-2';
    //                                             $('#'+buttonId).mclick();
    //                                             let buttonName = $('#'+buttonId).text().trim();
    //                                             //console.log($('#'+buttonId).text().trim());
                                               
    //                                             return delay(10000);
    //                                         }).then(() => {

                                               
                                                
    //                                             // this is not a post may be like/love reactions
    //                                             console.log('react type')
    //                                             row.type = 'react';
    //                                             let itemComment = $(".profile-creator-shared-feed-update__container");
    
    //                                             let event = $(itemComment[activityIndex]).find('.update-components-header').find('.update-components-text-view span');
                                            
    //                                             console.log('event', event)
                                                
    
    //                                             if(event.find("span:containsI('liked')").length > 0 && event.find("span:containsI('comment')").length > 0){  
    //                                                 console.log(data_urn, 'reacted to a comment')
    //                                                 // Prity P. liked Shubham Pandey’s comment on this
    //                                                 // Prity P. liked your comment on this
    //                                                 row.text = "reacted to a comment";
    //                                             }
    //                                             else if(event.find("span:containsI('replied')").length > 0 && event.find("span:containsI('comment')").length > 0){  
    //                                                 console.log(data_urn, 'commented on a comment')
    //                                                 // Prity P. replied to Shubham Pandey’s comment on this
    //                                                 row.type = 'comment';
    //                                                 row.text = "commented on a comment";
    //                                             }
    //                                             else if(event.find("span:containsI('commented')").length > 0){
    //                                                 // Prity P. commented on this
    //                                                 row.type = 'comment';
    //                                                 row.text = "commented on a post";
    //                                             }else{
    //                                                 // Prity P. likes this
    //                                                 row.text = "reacted on a post";
    //                                             }
    
    //                                             if(item.find('.update-components-actor__sub-description').length > 0){                    
    //                                                 let dateString = item.find('.update-components-actor__sub-description:eq(0)').find('span[aria-hidden="true"]').text().trim();
    //                                                 dateString = dateString.split(' •')[0];
    //                                                 row.date = getDate(dateString);
    //                                             }
    //                                             activity.push(row);
    //                                         });
    //                                // });
                                  
    //                               // activityIndex++;
    //                               isScrappingCompleted = true;   
    //                          }
    //                         //   else{
    //                         //     debugger
    //                         //     console.log('post type')
    //                         //     row.type = 'post';
    //                         //     if(item.find('.update-components-header__image').length > 0){
    //                         //         let imageUrl = item.find('.update-components-header__image').find('img').attr('src');
    //                         //         row.image = imageUrl;
    //                         //     }

    //                         //     if(item.find('.update-components-text').length > 0){
    //                         //         let text = $(item).find('.update-components-text').find('span[dir="ltr"]').text();
    //                         //         row.text = text;
    //                         //     }


    //                         //     if(item.find('.update-components-actor__sub-description').length > 0){
    //                         //         let dateString = item.find('.update-components-actor__sub-description').find('span[aria-hidden="true"]').text().trim();
    //                         //         dateString = dateString.split(' •')[0];
    //                         //         row.date = getDate(dateString);
    //                         //     }
    //                         //     i++;
    //                         // }
                            
                           
    //                         if (activityIndex == 10) {
    //                             console.log('return false')
    //                             return false;
    //                         }
                            

    //                     },2000)
    //                 },2000)

    //             }   
    //             }

    //         }, DELAY)

    //         DELAY = DELAY + 2000;
    //         //console.log(DELAY)
           
    //     })
    //     console.log('isScrappingCompleted', isScrappingCompleted);
    //     console.log(activity)
    //     debugger;
    //     if(isScrappingCompleted){
    //         setTimeout(()=>{ 
    //             // chrome.runtime.sendMessage({action:'linkedinProfileCompleted', influencerId:influencerId, activity:activity});
    //         },DELAY + 10000)
    //     }
        
    // }, 2000);

   
    setTimeout(()=>{ 
        //console.log('timeout message trigger');
        chrome.runtime.sendMessage({action:'linkedinProfileTimedOut'}); 
    },120000);

}


// console.log('123');

// console.log($(".single-line-truncate").text().trim());