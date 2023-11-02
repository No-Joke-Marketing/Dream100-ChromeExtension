
importScripts('../lib/moment.min.js', '../config.js');
 
var userUrl = false;
var token = false;
var myUserId = false;
var jwtToken = '';
var youTubeItems = [];
var instagramItems = []; 

var bio_title = "";
var bio_title_url = "";


var userSocial = infId = false;

var linkedInTabId = '';
var linkedInInfluencers = [];
// var linkedInProcess = false;

// var isLinkedInLoggedIn = false;

var window_height = 0;
var window_width = 0;
chrome.windows.getAll({populate : true}, function (list) {
    window_height = list?.length > 0 ? list[0]?.height : 0;
    window_width = list?.length > 0 ? list[0]?.width : 0;
});

var linkedInCustomSync = false;

var totalComments = '';

var currentLinkedInInfluencerId = '';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true,
        didErr = false,
        err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next();
            normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true;
            err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


chrome.storage.local.get(['FBtoken', 'myFBUserId', 'authToken'], function(_ref) {
    var FBtoken = _ref.FBtoken,
        myFBUserId = _ref.myFBUserId;
    if (!FBtoken || !myFBUserId) {
        updateToken().then(function() {});
    } else {
        token = FBtoken;
        myUserId = myFBUserId;
    }

    if (typeof _ref.authToken != "undefined") {
        jwtToken = _ref.authToken;
        /*scanProfiles(_ref.authToken);*/
    }
});

/**
 * parse user facebook token  and user facebook user id
 * @return {Promise<string>}
 */
function updateToken() {
    return fetch('https://www.facebook.com/help').then(function(response) {
        return response.text();
    }).then(function(text) {
        myUserId = text.match(/"USER_ID":"(.*?)"/)[1];
        token = text.match(/"token":"(.*?)"/)[1];
        return chrome.storage.local.set({
            FBtoken: token,
            myFBUserId: myUserId
        });
    });
}

function parseUserInfo(userUrl) {
    var userId = false;
    var pageID = false;
    var fulName = false;
    var results = false;
    /** global var for save result */

    var countPosts = 0;
    var countGroups = 0;
    var countFriends = 0; //let iframeForParseImage = false;

    var userLink = userUrl;
    var reviewsUrl = '';
    var photosUrl = '';
    var videosUrl = '';
    var aboutUrl = '';
    var friendsUrl = '';
    var userImageURL = '';
    return getUserId(userUrl).then(function(result) {

        // console.log('getUserId', result);
        if (result.error) {
            return result;
        }

        return parseInfo().then(function(userInfo) {
           
            //console.log('userInfo', userInfo);
            return userInfo;
        });
    });

    function getUserId(url) {
        return fetch(url).then(function(response) {
            return response.text();
        }).then(function(text) {
            try {
                var userIdArr = text.match(/"userID":"(.*?)"/);

                if (userIdArr) {
                    userId = userIdArr[1];
                }

                if (!userId) {
                    return {
                        error: true,
                        message: _consts__WEBPACK_IMPORTED_MODULE_1__["MESSAGE_TEXT"].NOT_USR_ERROR
                    }; //pageID = text.match(/"pageID":"(.*?)"/)[1];
                    //userId = pageID;
                }

                fulName = text.match(/<title>(.*?)<\/title>/)[1];
                getImageUrl(url, fulName).then(function(url) {
                    //console.log(url); 
                    userImageURL = url;
                });
                return {
                    error: false,
                    userId: userId
                };
            } catch (e) {
                return {
                    error: true,
                    message: _consts__WEBPACK_IMPORTED_MODULE_1__["MESSAGE_TEXT"].URL_ERROR
                };
            }
        })["catch"](function(error) {
            // console.error(error);
            return {
                error: true,
                message: _consts__WEBPACK_IMPORTED_MODULE_1__["MESSAGE_TEXT"].URL_ERROR
            };
        });
    }

    async function getImageUrl(userUrl, fulName) {
        userUrl = userUrl.replace('www.', 'mbasic.');
        // console.log(userUrl);
        let responses = await fetch(userUrl);
        let output = await responses.text();
        // console.log(output);
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({action: "scrapFbImage", text:output}, function(response) {
                // console.log(response);
                resolve(response);
            });
        });
    }

    function parseInfo() {
        var promises = [];
        promises.push(getCountGroups());
        promises.push(getLikesInfo());
        promises.push(getBasicInfo());
        return Promise.all(promises).then(function(result) {

                return {
                    error: false,
                    FB_user_id: userId,
                    picture_my_like: results.picture.myLike,
                    picture_other_like: results.picture.otherLike,
                    video_my_like: results.video.myLike,
                    video_other_like: results.video.otherLike,
                    posts_my_like: results.posts.myLike,
                    posts_other_like: results.posts.otherLike,
                    total_posts: countPosts,
                    count_groups: countGroups,
                    count_friends: countFriends,
                    ful_name: fulName,
                    photo_uri: userImageURL,
                    total_comments: results.totalComments,
                    get_comments: results.getComments,
                    last_activity: results.lastActivity,
                    bio: results.bio,
                    user_link: userLink,
                    reviews_url: reviewsUrl,
                    photos_url: photosUrl,
                    videos_url: videosUrl,
                    about_url: aboutUrl,
                    friends_url: friendsUrl
                };            
        });
    }

    function getLikesInfo() {
        results = {
            picture: {
                myLike: 0,
                otherLike: 0
            },
            video: {
                myLike: 0,
                otherLike: 0
            },
            posts: {
                myLike: 0,
                otherLike: 0
            },
            totalComments: 0,
            getComments: 0,
            lastActivity: {
                comments: [],
                posts: []
            },
            bio: "",
            photoUri: ""
        };
        countPosts = 0; // reviewsUrl = '';
        // photosUrl = '';
        // videosUrl = '';
        // aboutUrl = '';
        // friendsUrl = '';

        return getLikes().then(function() {
            results.lastActivity.comments = getLast20(results.lastActivity.comments);
            results.lastActivity.posts = getLast20(results.lastActivity.posts);
            return results;
        });

        function getLast20(array) {
            array.sort(function(a, b) {
                if (a.date < b.date) {
                    return -1;
                }

                return 1;
            });
            return array.slice(-20); // for (let i=0; i < array.length; i++){
            //     array[i].date = array[i].date*1000;
            // }
            // return array;
        }
    }
    /**
     * Parse like and comments from post in page
     * @param {String | null} [cursor = null] pagination next page (null for first page)
     * @return {Promise<unknown>} for synchronize parse
     */


    function getLikes() {
        var cursor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        // console.log('token',token);
        // console.log('av',myUserId);
        // console.log('__user',myUserId);
        if (cursor === null) {
            var formData = new FormData();
            formData.append("fb_dtsg", token);
            formData.append("av", myUserId);
            formData.append("__user", myUserId);
            formData.append("__a", "1");
            formData.append("__comet_req", "1");
            formData.append("fb_api_caller_class", "RelayModern");
            formData.append("fb_api_req_friendly_name", "ProfileCometTimelineFeedQuery");
            formData.append("doc_id", "3830470597031384");
            formData.append("variables", "{\"UFI2CommentsProvider_commentsKey\":\"ProfileCometTimelineRoute\",\"count\":1,\"feedLocation\":\"TIMELINE\",\"feedbackSource\":0,\"omitPinnedPost\":true,\"privacySelectorRenderLocation\":\"COMET_STREAM\",\"renderLocation\":\"timeline\",\"scale\":1.5,\"userID\":\"".concat(userId, "\"}"));

            return fetch("https://www.facebook.com/api/graphql/", {
                "body": formData,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function(res) {
                return res.text();
            }).then(function(text) {

                // console.log(text);
                var jsons = text.split('\n');
                jsons = jsons.filter(function(post) {
                    return !(post.indexOf('"label":"CometFeedStoryVideoAttachmentVideoPlayer_video$defer') + 1);
                }); 
                var last = JSON.parse(jsons.pop());
                var nextCursor = last.data.page_info.end_cursor;
                var formData1 = new FormData();
                formData1.append("doc_id", "3266828430086283");
                formData1.append("fb_dtsg", token);
                formData1.append("server_timestamps", true);
                formData1.append("fb_api_caller_class", "RelayModern");
                formData1.append("fb_api_req_friendly_name", "ProfileCometTimelineFeedQuery");
                formData1.append("variables", "{\"UFI2CommentsProvider_commentsKey\":\"ProfileCometTimelineRoute\",\"afterTime\":null,\"beforeTime\":null,\"count\":3,\"cursor\":\"".concat(nextCursor, "\",\"displayCommentsContextEnableComment\":null,\"displayCommentsContextIsAdPreview\":null,\"displayCommentsContextIsAggregatedShare\":null,\"displayCommentsContextIsStorySet\":null,\"displayCommentsFeedbackContext\":null,\"feedLocation\":\"TIMELINE\",\"feedbackSource\":0,\"focusCommentID\":null,\"memorializedSplitTimeFilter\":null,\"omitPinnedPost\":true,\"postedBy\":null,\"privacy\":null,\"privacySelectorRenderLocation\":\"COMET_STREAM\",\"renderLocation\":\"timeline\",\"scale\":1.5,\"should_show_profile_pinned_post\":true,\"taggedInOnly\":null,\"useDefaultActor\":false,\"id\":\"").concat(userId, "\"}"));
                return fetch("https://www.facebook.com/api/graphql/", {
                    "body": formData1,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(function(res) {
                    return res.text();
                }).then(function(result) {
                    var _jsons;

                    if (!result) return {
                        error: false
                    };

                    if (result.indexOf('Please try closing and re-opening your browser window.') + 1) {
                        return updateToken().then(function() {
                            return getLikes(cursor);
                        });
                    }

                    var jsons1 = result.split('\n');
                    /** filter not post info */

                    jsons1 = jsons1.filter(function(post) {
                        return !(post.indexOf('"label":"CometFeedStoryVideoAttachmentVideoPlayer_video$defer') + 1);
                    });
                    var last = JSON.parse(jsons1.pop());

                    (_jsons = jsons).push.apply(_jsons, _toConsumableArray(jsons1));

                    return formatLikes(jsons).then(function(isLast) {
                        // console.log('isLast, last', isLast, last);
                        if (last.data.page_info && last.data.page_info.has_next_page && countPosts < 20 && !isLast) {
                            return getLikes("\"".concat(last.data.page_info.end_cursor, "\""));
                        } else {
                            return {
                                error: false
                            };
                        }
                    });
                });
            });
        } else {
            var formData1 = new FormData();
            formData1.append("doc_id", "3266828430086283");
            formData1.append("fb_dtsg", token);
            formData1.append("server_timestamps", true);
            formData1.append("fb_api_caller_class", "RelayModern");
            formData1.append("fb_api_req_friendly_name", "ProfileCometTimelineFeedQuery");
            formData1.append("variables", "{\"UFI2CommentsProvider_commentsKey\":\"ProfileCometTimelineRoute\",\"afterTime\":null,\"beforeTime\":null,\"count\":3,\"cursor\":\"".concat(cursor, "\",\"displayCommentsContextEnableComment\":null,\"displayCommentsContextIsAdPreview\":null,\"displayCommentsContextIsAggregatedShare\":null,\"displayCommentsContextIsStorySet\":null,\"displayCommentsFeedbackContext\":null,\"feedLocation\":\"TIMELINE\",\"feedbackSource\":0,\"focusCommentID\":null,\"memorializedSplitTimeFilter\":null,\"omitPinnedPost\":true,\"postedBy\":null,\"privacy\":null,\"privacySelectorRenderLocation\":\"COMET_STREAM\",\"renderLocation\":\"timeline\",\"scale\":1.5,\"should_show_profile_pinned_post\":true,\"taggedInOnly\":null,\"useDefaultActor\":false,\"id\":\"").concat(userId, "\"}"));
            return fetch("https://www.facebook.com/api/graphql/", {
                "body": formData1,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function(res) {
                return res.text();
            }).then(function(result) {
                if (!result) return {
                    error: false
                };

                if (result.indexOf('Please try closing and re-opening your browser window.') + 1) {
                    return updateToken().then(function() {
                        return getLikes(cursor);
                    });
                }

                var jsons = result.split('\n');
                /** filter not post info */

                jsons = jsons.filter(function(post) {
                    return !(post.indexOf('"label":"CometFeedStoryVideoAttachmentVideoPlayer_video$defer') + 1);
                });
                var last = JSON.parse(jsons.pop());
                // console.log('last.data', last.data);
                return formatLikes(jsons).then(function(isLast) {
                    // console.log('isLast, last', isLast, last);
                    // console.log(last.data);
                    if (last.data.page_info && last.data.page_info.has_next_page && countPosts < 20 && !isLast) {
                        return getLikes("\"".concat(last.data.page_info.end_cursor, "\""));
                    } else {
                        return {
                            error: false
                        };
                    }
                });
            });
        }
    }
    /**
     *
     * @param {Array} posts
     * @see results
     * @return {Promise<boolean>} for synchronize parse
     */


    function formatLikes(posts) {
        var postParse = [];
        var commentsPromises = [];
        var isLast = false;

        var _iterator = _createForOfIteratorHelper(posts),
            _step;

        try {
            var _loop = function _loop() {
                var post = _step.value;

                try {
                    var data = JSON.parse(post);

                    if (data.data && (data.data.node || data.data.user)) {
                        var comet_sections;

                        if (data.data.user) {
                            comet_sections = data.data.user?.timeline_list_feed_units.edges[0]?.node?.comet_sections;
                        } else if (data.data?.node.timeline_list_feed_units) {
                            comet_sections = data.data?.node.timeline_list_feed_units.edges[0]?.node?.comet_sections;
                        } else {
                            comet_sections = data.data?.node.comet_sections;
                        }

                        if (comet_sections?.feedback) {
                            var creationPostTime = comet_sections.context_layout.story.comet_sections.timestamp.story.creation_time;
                            var postUrl = comet_sections.context_layout.story.comet_sections.timestamp.story.url;
                            /** Check stop parse */

                            if (creationPostTime + 604800 < new Date().getTime() / 1000) {
                                isLast = true;
                                return "break";
                            }

                            countPosts++;
                            var myReaction = false;

                            if (comet_sections.feedback.story.feedback_context.feedback_target_with_context.comet_ufi_summary_and_actions_renderer.feedback.viewer_feedback_reaction_info) {
                                myReaction = true;
                            }

                            var types = [];
                            /** checking post contain a photo or video*/

                            if (comet_sections.content.story.attachments.length) {
                                var attachment = comet_sections.content.story.attachments[0].style_type_renderer.attachment;

                                if (attachment) {
                                    if (attachment.media) {
                                        types.push(attachment.media.__typename);
                                    } else if (attachment.all_subattachments) {
                                        var _iterator2 = _createForOfIteratorHelper(attachment.all_subattachments.nodes),
                                            _step2;

                                        try {
                                            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                                var node = _step2.value;
                                                types.push(node.media.__typename);
                                            }
                                        } catch (err) {
                                            _iterator2.e(err);
                                        } finally {
                                            _iterator2.f();
                                        }
                                    }
                                }
                            }

                            var comments = comet_sections.feedback.story.feedback_context.feedback_target_with_context.display_comments;
                            var commentsPromise = getCountComments(comments);
                            var countReaction = comet_sections.feedback.story.feedback_context.feedback_target_with_context.comet_ufi_summary_and_actions_renderer.feedback.reaction_count.count; // const topReactions = comet_sections.feedback.story.feedback_context.feedback_target_with_context
                            //     .comet_ufi_summary_and_actions_renderer.feedback.top_reactions.edges;
                            // for (let reaction of topReactions){
                            //     if (reaction.node.reaction_type === 'LIKE'){
                            //         count = reaction.reaction_count;
                            //     }
                            // }

                            if (myReaction) {
                                countReaction--;
                            }

                            if (types.includes('Photo')) {
                                results.picture.otherLike += countReaction;

                                if (myReaction) {
                                    results.picture.myLike++;
                                }
                            }

                            if (types.includes('Video')) {
                                results.video.otherLike += countReaction;

                                if (myReaction) {
                                    results.video.myLike++;
                                }
                            }

                            results.posts.otherLike += countReaction;

                            if (myReaction) {
                                results.posts.myLike++;
                            }
                            /** save post info (preview text and author) */


                            var author = comet_sections.context_layout.story.comet_sections.title.story.actors[0].name;

                            if (countPosts < 21) {
                                var text = "";

                                if (comet_sections.content.story.comet_sections.message) {
                                    text = comet_sections.content.story.comet_sections.message.story.message.text;
                                }

                                if (text.length > 40) {
                                    text = text.slice(0, 40) + '...';
                                }

                                results.lastActivity.posts.push({
                                    date: creationPostTime,
                                    url: postUrl,
                                    event: 'published new post.',
                                    text: text,
                                    author: author
                                });
                            }
                            /** save all post info after parse all comments */


                            commentsPromise.then(function(commentsState) {
                                results.totalComments += commentsState.totalComments;
                                results.getComments += commentsState.totalComments - commentsState.countMyComments;
                                postParse.push({
                                    myLike: myReaction,
                                    otherLike: countReaction,
                                    types: types,
                                    myComments: commentsState.countMyComments,
                                    TotalComments: commentsState.totalComments,
                                    arrayComments: comments,
                                    author: author
                                });
                                return true;
                            });
                            commentsPromises.push(commentsPromise);
                        }
                    }
                } catch (err) {
                    console.log(err);
                    console.log('errorParsePost -->', JSON.parse(post));
                }
                /**
                 * Recursive parse comments and sub comments
                 * @param commentsInfo
                 * @param {Integer} [countMyComments = 0]
                 * @param {Integer} [totalComments = 0]
                 * @return {Promise<Object>} for synchronize parse posts
                 */


                function getCountComments(commentsInfo) {
                    var countMyComments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                    var totalComments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
                    var id = null;
                    var subCommentPromises = [];
                    totalComments += commentsInfo.edges.length;

                    var _iterator3 = _createForOfIteratorHelper(commentsInfo.edges),
                        _step3;

                    try {
                        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                            var comment = _step3.value;

                            if (comment.node.author.id === userId) {
                                countMyComments++;
                            }
                            /** Post or comment id (for sub comment) */


                            if (comment.node.parent_feedback.id) {
                                id = comment.node.parent_feedback.id;
                            }

                            var _text = "";

                            if (comment.node.body) {
                                _text = comment.node.body.text;

                                if (_text.length > 40) {
                                    _text = _text.slice(0, 40) + '...';
                                }
                            }

                            results.lastActivity.comments.push({
                                date: comment.node.created_time,
                                url: comment.node.url,
                                event: "added new comment.",
                                text: _text,
                                author: comment.node.author.name
                            }); // if (comment.node.feedback && comment.node.feedback.display_comments.highlighted_comments.length) {
                            //     totalComments += comment.node.feedback.display_comments.highlighted_comments.length;
                            //     for (let subComment of comment.node.feedback.display_comments.highlighted_comments) {
                            //         if (subComment.author.id === userId) {
                            //             countMyComments++;
                            //         }
                            //     }
                            // }

                            /** sub comment if there is */

                            if (comment.node.feedback && comment.node.feedback.display_comments.edges.length) {
                                totalComments += comment.node.feedback.display_comments.edges.length;

                                var _iterator4 = _createForOfIteratorHelper(comment.node.feedback.display_comments.edges),
                                    _step4;

                                try {
                                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                                        var subComment = _step4.value;

                                        if (subComment.node.author.id === userId) {
                                            countMyComments++;
                                        }

                                        var _text2 = "";

                                        if (subComment.node.body) {
                                            _text2 = subComment.node.body.text;

                                            if (_text2.length > 40) {
                                                _text2 = _text2.slice(0, 40) + '...';
                                            }
                                        }

                                        results.lastActivity.comments.push({
                                            date: subComment.node.created_time,
                                            url: subComment.node.url,
                                            event: "added new comment.",
                                            text: _text2,
                                            author: subComment.node.author.name
                                        });
                                    }
                                } catch (err) {
                                    _iterator4.e(err);
                                } finally {
                                    _iterator4.f();
                                }
                            }
                            /** check next pagination page for sub comments */


                            if (comment.node.feedback && comment.node.feedback.display_comments.page_info.has_next_page) {
                                var commentId = comment.node.feedback.id;
                                var cursor = null;

                                if (comment.node.feedback.display_comments.page_info.end_cursor) {
                                    cursor = "\"".concat(comment.node.feedback.display_comments.page_info.end_cursor, "\"");
                                } // let commentId = comment.node.feedback.display_comments.id;


                                /*subCommentPromises.push(getComments(cursor, commentId).then(function (result) {
                                  console.log(result);
                                  return getCountComments(result.data.feedback.display_comments);
                                }));*/
                            }
                        }
                    } catch (err) {
                        _iterator3.e(err);
                    } finally {
                        _iterator3.f();
                    }

                    return Promise.all(subCommentPromises).then(function(results) {
                        // debugger;
                        if (results.length) {
                            var resultCountMyComments = Array.from(results, function(x) {
                                return x.countMyComments;
                            });
                            var resultTotalComments = Array.from(results, function(x) {
                                return x.totalComments;
                            }); // let t = results.reduce((a, b) => a + b);

                            countMyComments += resultCountMyComments.reduce(function(a, b) {
                                return a + b;
                            });
                            /** sum my sub comment*/

                            totalComments += resultTotalComments.reduce(function(a, b) {
                                return a + b;
                            });
                            /** sum total sub comment*/
                        }
                        /** check next pagination page for comments */

                        return new Promise(function(resolve) {
                            resolve({
                                countMyComments: countMyComments,
                                totalComments: totalComments
                            });
                        });
                    });
                }
            };

            for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var _ret = _loop();

                if (_ret === "break") break;
            }
        } catch (err) {
            _iterator.e(err);
        } finally {
            _iterator.f();
        }

        return Promise.all(commentsPromises).then(function(result) {
            // debugger;
            // console.log("postParsed", postParse);
            return isLast;
        });
    }
    /**
     *  Request for get token
     * @param after {string} token comments page
     * @param id {string} post (for main comment) or comment id (for sub comment)
     * @return {Promise<any>} for synchronize parse posts
     */


    function getComments(after, id) {
        var formData = new FormData();
        formData.append("fb_dtsg", token);
        formData.append("av", myUserId);
        formData.append("__user", myUserId);
        formData.append("__a", "1");
        formData.append("fb_api_caller_class", "RelayModern");
        formData.append("fb_api_req_friendly_name", "CometUFICommentsProviderPaginationQuery");
        formData.append("doc_id", "3384995174931261");
        formData.append("variables", "{\"after\":".concat(after, ",\"before\":null,\"displayCommentsFeedbackContext\":null,\"displayCommentsContextEnableComment\":null,\"displayCommentsContextIsAdPreview\":null,\"displayCommentsContextIsAggregatedShare\":null,\"displayCommentsContextIsStorySet\":null,\"feedLocation\":\"TIMELINE\",\"feedbackID\":\"").concat(id, "\",\"feedbackSource\":0,\"first\":5,\"focusCommentID\":null,\"includeHighlightedComments\":false,\"includeNestedComments\":true,\"isInitialFetch\":false,\"isPaginating\":true,\"last\":null,\"scale\":1,\"topLevelViewOption\":null,\"useDefaultActor\":false,\"viewOption\":null,\"UFI2CommentsProvider_commentsKey\":\"ProfileCometTimelineRoute\",\"id\":\"").concat(userId, "\"}"));
        return fetch("https://www.facebook.com/api/graphql/", {
            "body": formData,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(function(res) {
            return res.json();
        }).then(function(result) {
            return result;
        });
    }
    /**
     * Get count groups and count friend
     * @return {Promise<boolean>} for synchronize parse
     */


    function getCountGroups() {
        return request().then(function(result) {
            var _result$userId, _result$userId$groups, _result$userId2, _result$userId2$frien, _result$userId3, _result$userId3$group, _result$userId4, _result$userId4$frien;

            // console.log('countGroupsUserFacebookID:', userId, result[userId]);
            // console.log('countGroups', ((_result$userId = result[userId]) === null || _result$userId === void 0 ? void 0 : (_result$userId$groups = _result$userId.groups) === null || _result$userId$groups === void 0 ? void 0 : _result$userId$groups.count) || 0);
            // console.log('countFriends', ((_result$userId2 = result[userId]) === null || _result$userId2 === void 0 ? void 0 : (_result$userId2$frien = _result$userId2.friends) === null || _result$userId2$frien === void 0 ? void 0 : _result$userId2$frien.count) || 0);
            countGroups = ((_result$userId3 = result[userId]) === null || _result$userId3 === void 0 ? void 0 : (_result$userId3$group = _result$userId3.groups) === null || _result$userId3$group === void 0 ? void 0 : _result$userId3$group.count) || 0;
            countFriends = ((_result$userId4 = result[userId]) === null || _result$userId4 === void 0 ? void 0 : (_result$userId4$frien = _result$userId4.friends) === null || _result$userId4$frien === void 0 ? void 0 : _result$userId4$frien.count) || 0;
            return true;
        });

        function request() {
            var formData = new FormData();
            formData.append("fb_dtsg", token);
            formData.append("q", "node(".concat(userId, "){friends{count},subscribers{count},groups{count},created_time,timeline_feed_units.first(500){page_info,edges{node{url,feedback{reactors{count},comments{count}}}}}}"));
            return fetch("https://www.facebook.com/api/graphql/", {
                "body": formData,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function(res) {
                return res.text();
            }).then(function(text) {
                // console.log(text)
                /** check if the facebook token not works */
                if (text.length === 0 || text.indexOf('Please try closing and re-opening your browser window.') + 1) {
                    return updateToken().then(function() {
                        return request();
                    });
                }

                return JSON.parse(text);
            });
        }
    }
    /**
     * Parse about page and save in global var results
     * @see results
     * @return {Promise<boolean>} for synchronize parse
     */


    function getBasicInfo() {
        // if (pageID) {
        // return requestPageAbout().then(result => {
        // debugger;
        // let page = result.data.page.comet_page_about_tab.page.page_about_sections.page;
        // return {
        // bio:{
        // page_info:{
        // follower_count:page.follower_count,
        // global_likers_count: page.page_likers.global_likers_count,
        // other_accounts:result.data.page.page_about_fields.other_accounts
        // }
        // }
        // }
        // });
        // }
        // console.log('with blank params');
        return requestUserApout().then(function(text) {


            // console.log(text);
            /** get All tokens */
            var jsons = text.split('\n');
            var first = JSON.parse(jsons[0]);
            //var second = JSON.parse(jsons[10]);
            //var third =JSON.parse(jsons[16]);

            // console.log(third);

            var datafound = jsons.filter(function(item) {
                return item.indexOf('"tracking":"202"') > -1
            });
            let dataItemfound = JSON.parse(datafound);
            //console.log(dataItemfound.data.activeCollections.nodes[1].style_renderer.profile_field_sections.length);
            //if(get_founderTitle)
            bio_title = "";
            bio_title_url = "";
            var hrefTitle = "";
            try {
                if (typeof dataItemfound != 'undefined' && typeof dataItemfound.data != 'undefined' && typeof dataItemfound.data.activeCollections.nodes[1] != 'undefined' && dataItemfound.data.activeCollections.nodes[1].style_renderer.profile_field_sections.length > 0) {
                    bio_title = dataItemfound.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.text;

                    // console.log(bio_title);
                    if (bio_title == "Add a workplace") {
                        hrefTitle = '';
                    } else {
                        if (dataItemfound.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.ranges[0].entity.url == '') {
                            hrefTitle = 'javascript:void(0)';
                        } else {
                            hrefTitle = dataItemfound.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.ranges[0].entity.url;
                        }
                    }
                    bio_title_url = hrefTitle;
                } else if (typeof second != 'undefined' && typeof second.data.activeCollections.nodes[1] != 'undefined') {

                }
            } catch (err) {
                // console.log(err);
                bio_title = "";
                bio_title_url = "";
            }


            /*try {
              if(typeof second != 'undefined' && typeof second.data.activeCollections.nodes[1] != 'undefined'){
                // bio_title = second.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.text;
                
                if(second.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.ranges[0].entity.url == '') {
                  hrefTitle = '#!';
                }else {
                  hrefTitle = second.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.ranges[0].entity.url;
                }
                
                //bio_title = `<a href='`+hrefTitle+`'>`+second.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.text+`</a>`
                bio_title = second.data.activeCollections.nodes[1].style_renderer.profile_field_sections[0].profile_fields.nodes[0].title.text;
                bio_title_url = hrefTitle;

              }
            }
            catch(err) {
              console.log(err);
              bio_title = "";
              bio_title_url = "";
            }*/

            // console.log(bio_title_url);

            var collectionToken = "";
            var sectionToken = "";
            /** Save pages url and get about page tokens */

            var _iterator5 = _createForOfIteratorHelper(first.data.user.about_app_sections.nodes),
                _step5;

            try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    var pageNode = _step5.value;

                    if (pageNode.name.toLowerCase() === "about") {
                        sectionToken = pageNode.id;
                        aboutUrl = pageNode.url;

                        var _iterator11 = _createForOfIteratorHelper(pageNode.all_collections.nodes),
                            _step11;

                        try {
                            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                                var note = _step11.value;

                                if (note.name.toLowerCase() === "contact and basic info") {
                                    collectionToken = note.id;
                                }
                            }
                        } catch (err) {
                            _iterator11.e(err);
                        } finally {
                            _iterator11.f();
                        }
                    } else if (pageNode.name.toLowerCase() === "reviews") {
                        reviewsUrl = pageNode.url;
                    } else if (pageNode.name.toLowerCase() === "photos") {
                        photosUrl = pageNode.url;
                    } else if (pageNode.name.toLowerCase() === "videos") {
                        videosUrl = pageNode.url;
                    } else if (pageNode.name.toLowerCase() === "friends") {
                        friendsUrl = pageNode.url;
                    }
                }
                /** get about page (contact and basic section) info */

            } catch (err) {
                _iterator5.e(err);
            } finally {
                _iterator5.f();
            }
            // console.log('with params');
            return requestUserApout("\"".concat(collectionToken, "\""), "\"".concat(sectionToken, "\"")).then(function(text) {
                var bio = {
                    bio_basic: "",
                    bio_contact: "",
                    bio_social: ""
                };
                var jsons = text.split('\n');

                var _iterator6 = _createForOfIteratorHelper(jsons),
                    _step6;

                try {
                    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                        var json = _step6.value;
                        var data = JSON.parse(json);

                        if (data.data.activeCollections) {
                            var profile_field_sections = data.data.activeCollections.nodes[0].style_renderer.profile_field_sections;

                            var _iterator7 = _createForOfIteratorHelper(profile_field_sections),
                                _step7;

                            try {
                                for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                                    var profile_field_section = _step7.value;
                                    var info = [];

                                    var _iterator8 = _createForOfIteratorHelper(profile_field_section.profile_fields.nodes),
                                        _step8;

                                    try {
                                        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                                            var node = _step8.value;

                                            /** scip update info text (for wen adding your own page) */
                                            if (node.field_type !== "upsell" && node.title.text !== "" && node.title.text !== "No contact info to show" && node.title.text !== "No links to show") {
                                                var _node$list_item_group, _node$list_item_group2, _node$list_item_group3;

                                                var fieldType = node.field_type;

                                                if (node !== null && node !== void 0 && (_node$list_item_group = node.list_item_groups[0]) !== null && _node$list_item_group !== void 0 && (_node$list_item_group2 = _node$list_item_group.list_items[0]) !== null && _node$list_item_group2 !== void 0 && (_node$list_item_group3 = _node$list_item_group2.text) !== null && _node$list_item_group3 !== void 0 && _node$list_item_group3.text) {
                                                    fieldType = node.list_item_groups[0].list_items[0].text.text;
                                                }

                                                info.push({
                                                    field_type: fieldType,
                                                    text: node.title.text,
                                                    is_editing: 0
                                                });
                                            }
                                        }
                                    } catch (err) {
                                        _iterator8.e(err);
                                    } finally {
                                        _iterator8.f();
                                    }

                                    var title = profile_field_section.title.text.toLowerCase(); // info = JSON.stringify(info);

                                    if (title === "basic info") {
                                        bio.bio_basic = JSON.stringify(info);
                                    } else if (title === "contact info") {
                                        var defaultBioContact = [{
                                            field_type: "Email",
                                            text: " "
                                        }, {
                                            field_type: "Mobile",
                                            text: " "
                                        }, {
                                            field_type: "Address",
                                            text: " "
                                        }, {
                                            field_type: "Title",
                                            text: bio_title
                                        }, {
                                            field_type: "TitleUrl",
                                            text: bio_title_url
                                        }];

                                        var _iterator9 = _createForOfIteratorHelper(info),
                                            _step9;

                                        try {
                                            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                                                var item = _step9.value;

                                                if (item.field_type === 'Email') {
                                                    defaultBioContact[0].text = item.text;
                                                }

                                                if (item.field_type === 'Mobile') {
                                                    defaultBioContact[1].text = item.text;
                                                }

                                                if (item.field_type === 'Address') {
                                                    defaultBioContact[2].text = item.text;
                                                }

                                                if (item.field_type === 'Title') {
                                                    defaultBioContact[3].text = item.text;
                                                }

                                                if (item.field_type === 'TitleUrl') {
                                                    defaultBioContact[4].text = item.text;
                                                }


                                            }
                                        } catch (err) {
                                            _iterator9.e(err);
                                        } finally {
                                            _iterator9.f();
                                        }

                                        bio.bio_contact = JSON.stringify(defaultBioContact);
                                    } else if (title === "websites and social links" || title === 'category') {
                                        var defaultBioSocial = [{
                                            "field_type": "Facebook",
                                            "text": [userLink],
                                            is_editing: 0
                                        }, {
                                            "field_type": "LinkedIn",
                                            "text": [],
                                            is_editing: 0
                                        }, {
                                            "field_type": "YouTube",
                                            "text": [],
                                            is_editing: 0
                                        }, {
                                            "field_type": "Instagram",
                                            "text": [],
                                            is_editing: 0
                                        }, {
                                            "field_type": "Twitter",
                                            "text": [],
                                            is_editing: 0
                                        }, {
                                            "field_type": "Pinterest",
                                            "text": [],
                                            is_editing: 0
                                        }];

                                        var defaultBioContact = [{
                                            field_type: "Email",
                                            text: " "
                                        }, {
                                            field_type: "Mobile",
                                            text: " "
                                        }, {
                                            field_type: "Address",
                                            text: " "
                                        }, {
                                            field_type: "Title",
                                            text: " "
                                        }, {
                                            field_type: "TitleUrl",
                                            text: " "
                                        }];

                                        // console.log('Parsed info', info, userLink);

                                        var _iterator10 = _createForOfIteratorHelper(info),
                                            _step10;

                                        try {
                                            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                                                var _item = _step10.value;

                                                if (_item.field_type === 'Facebook' && !defaultBioSocial[0].text.includes(_item.text) && defaultBioSocial[0].text.length === 0) {
                                                    defaultBioSocial[0].text.push(_item.text);
                                                }

                                                if (_item.field_type === 'LinkedIn' && !defaultBioSocial[1].text.includes(_item.text) && defaultBioSocial[1].text.length === 0) {
                                                    if (_item.text.indexOf('linkedin.com') + 1) {
                                                        defaultBioSocial[1].text.push(_item.text);
                                                    } else {
                                                        defaultBioSocial[1].text.push("https://www.linkedin.com/".concat(_item.text));
                                                    }
                                                }

                                                if (_item.field_type === 'YouTube' && !defaultBioSocial[2].text.includes(_item.text) && defaultBioSocial[2].text.length === 0) {
                                                    if (_item.text.indexOf('https://www.youtube.com/') + 1) {
                                                        defaultBioSocial[2].text.push(_item.text);
                                                    } else {
                                                        defaultBioSocial[2].text.push("https://www.youtube.com/".concat(_item.text));
                                                    }
                                                }

                                                if (_item.field_type === 'Instagram' && !defaultBioSocial[3].text.includes(_item.text) && defaultBioSocial[3].text.length === 0) {
                                                    if (_item.text.indexOf('https://www.instagram.com/') + 1) {
                                                        defaultBioSocial[3].text.push(_item.text);
                                                    } else {
                                                        defaultBioSocial[3].text.push("https://www.instagram.com/".concat(_item.text));
                                                    }
                                                }

                                                if (_item.field_type === 'Twitter' && !defaultBioSocial[4].text.includes(_item.text) && defaultBioSocial[4].text.length === 0) {
                                                    if (_item.text.indexOf('twitter.com/') + 1) {
                                                        defaultBioSocial[4].text.push(_item.text);
                                                    } else {
                                                        defaultBioSocial[4].text.push("https://twitter.com/".concat(_item.text));
                                                    }
                                                }

                                                if (_item.field_type === 'Pinterest' && !defaultBioSocial[5].text.includes(_item.text) && defaultBioSocial[5].text.length === 0) {
                                                    defaultBioSocial[5].text.push(_item.text);
                                                }
                                            }
                                        } catch (err) {
                                            _iterator10.e(err);
                                        } finally {
                                            _iterator10.f();
                                        }

                                        // console.log('Default Bio', defaultBioSocial);

                                        for (var i = 0; i < defaultBioSocial.length; i++) {
                                            if (defaultBioSocial[i].text.length === 0) {
                                                defaultBioSocial[i].text.push("");
                                            }
                                        }

                                        bio.bio_social = JSON.stringify(defaultBioSocial);
                                    }
                                }
                            } catch (err) {
                                _iterator7.e(err);
                            } finally {
                                _iterator7.f();
                            }
                        }
                    }
                } catch (err) {
                    _iterator6.e(err);
                } finally {
                    _iterator6.f();
                }

                results.bio = bio;
                return true;
            });
        });
        /**
         * Page page info
         * @param {String || null} [collectionToken = null] Page token, null for get all page tokes
         * @param {String || null}  [sectionToken = null] Section in page token
         * @return {Promise<Text>}
         */

        function requestUserApout() {

            
            var collectionToken = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var sectionToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var formData = new FormData();
            formData.append("fb_dtsg", token);
            formData.append("av", myUserId);
            formData.append("__user", myUserId);
            formData.append("__a", "1");
            formData.append("__comet_req", "1");
            formData.append("fb_api_caller_class", "RelayModern");
            formData.append("fb_api_req_friendly_name", "ProfileCometAboutAppSectionQuery");
            formData.append("doc_id", "3415254011925748");
            formData.append("variables", "{\"appSectionFeedKey\":\"ProfileCometAppSectionFeed_timeline_nav_app_sections__100041663866376:2327158227\",\"collectionToken\":".concat(collectionToken, ",\"rawSectionToken\":\"100041663866376:2327158227\",\"scale\":1,\"sectionToken\":").concat(sectionToken, ",\"userID\":\"").concat(userId, "\"}"));
            return fetch("https://www.facebook.com/api/graphql/", {
                "body": formData,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function(res) {
                return res.text();
            }).then(function(text) {
                /** check if the facebook token not works */ 
                if (text.length === 0 || text.indexOf('Please try closing and re-opening your browser window.') + 1) {
                    return updateToken().then(function() {
                        return requestUserApout(collectionToken, sectionToken);
                    });
                }
                return text;
            });
        }

        function requestPageAbout() {
            var formData = new FormData();
            formData.append("fb_dtsg", token);
            formData.append("av", myUserId);
            formData.append("__user", myUserId);
            formData.append("__a", "1");
            formData.append("__comet_req", "1");
            formData.append("fb_api_caller_class", "RelayModern");
            formData.append("fb_api_req_friendly_name", "PagesCometAboutRootQuery");
            formData.append("doc_id", "3654525204666563");
            formData.append("variables", "{\"pageID\":\"".concat(pageID, "\",\"scale\":1}"));
            return fetch("https://www.facebook.com/api/graphql/", {
                "body": formData,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function(res) {
                return res.text();
            }).then(function(text) {
                /** check if the facebook token not works */
                if (text.length === 0 || text.indexOf('Please try closing and re-opening your browser window.') + 1) {
                    return updateToken().then(function() {
                        return requestPageAbout(collectionToken, sectionToken);
                    });
                }
                return JSON.parse(text);
            });
        }
    }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {  
    if (message.action === 'get-facebook-profile') { 
        userUrl = message.facebookProfileUrl;
        updateToken();
        parseUserInfo(userUrl).then((userInfo) => {
           
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            userInfo.currentTime = dateTime;
            if(message.type == 'new'){
                userInfo.type = 'new';
            }else{
                userInfo.type = 'syncing'; 
            }
            userInfo.id = message.profile_id;
            fetch(_config.apiBaseUrl + "/add-influencer", {
                method: "POST",
                body: JSON.stringify(userInfo),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    'Authorization': "Bearer " + jwtToken
                }
            }).then(response => response.json()).then(res => {
                //console.log('res', res)
                if(message.type == 'new'){
                    if(res.status){
                       // console.log(res.usedLimit);
                        chrome.runtime.sendMessage({ action: "fb-completed", status:true, profile_id:message.profile_id, userData:res.data, usedLimit:res.usedLimit, resonseMessage: res.message});
                    }else{
                        chrome.runtime.sendMessage({ action: "fb-completed", status:false, profile_id:message.profile_id, resonseMessage: res.message });
                    }
                }else if(message.type == 'syncing'){
                    chrome.runtime.sendMessage({ action: "fb-completed", status:true, profile_id:message.profile_id, userData:res.data, usedLimit:res.usedLimit,resonseMessage: res.message});
                }
            });

        }).catch(error => {
            // console.log(error);
            // console.log('error in ffacebook scrapping')
            chrome.runtime.sendMessage({ action: "fb-completed", status:false });
        });
    }else if (message.action === 'add-blank-facebook-profile') {
        
        updateToken();
        
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
                                    { "field_type": "gender", "text": "", "is_editing": 0 },],
                          bio_contact :[
                                    { "field_type": "Email", "text": "" },
                                    { "field_type": "Mobile", "text": "" },
                                    { "field_type": "Address", "text": "" },
                                    { "field_type": "Title", "text": "" },
                                    { "field_type": "TitleUrl", "text": "" } ],
                          bio_social :[
                                    { "field_type": "Facebook", "text": [""], "is_editing": 0 },
                                    { "field_type": "LinkedIn", "text": [""], "is_editing": 0 },
                                    { "field_type": "YouTube", "text": [""], "is_editing": 0 },
                                    { "field_type": "Instagram", "text": [""], "is_editing": 0 },
                                    { "field_type": "Twitter", "text": [""], "is_editing": 0 },
                                    { "field_type": "Pinterest", "text": [""], "is_editing": 0 }
                       ]},
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
  
             // console.log("make by jiten");
             // console.log(userInfo);

             fetch(_config.apiBaseUrl + "/add-blank-influencer", {
                method: "POST",
                body: userInfo,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    'Authorization': "Bearer " + jwtToken
                }
            }).then(response => response.json()).then(response => {
                console.log(response);

                if(res.status){
                    chrome.runtime.sendMessage({ action: "get-blank-facebook-profile-data",data:res.data });    
                }
                 
            });
            
    } else if (message.action === 'scrap_videos_from_youtube') {
        
        var youTubeUrl = message.url;
        var channelId = '';
        if (youTubeUrl.indexOf('/channel/') > -1) {
            channelId = youTubeUrl.split('/channel/')[1];
            channelId = channelId.split('?')[0];
        }else if (youTubeUrl.indexOf('/c/') > -1) {

            await new Promise((resolve) => {
                fetch(youTubeUrl).then(function(response) {
                    return response.text();
                }).then(function(text) {
                    channelId = text.match(/<meta itemprop="channelId" content="(.*?)"/)[1];
                    resolve(1);
                });
            });
        }
        else if (youTubeUrl.indexOf('/user/') > -1) {
            var userName = '';
            userName = youTubeUrl.split('/user/')[1];
            userName = userName.split('?')[0];
            getChannelIdFromUsername(userName, message.influencer_id);
            return false;
        } else {
            return false;
        }

        var publishAfterDate = GetLast30DaysDate();
        // console.log(publishAfterDate)

        youTubeItems = [];

        // console.log(youTubeUrl)
            //cinema
        youTubeApiUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + channelId + "&order=date&type=video&key=AIzaSyAoN_fQBiotuKYJgvR_CESJj0WgE5tYWDw&maxResults=50&publishedAfter=" + publishAfterDate;
        //console.log(youTubeApiUrl)

        fetchYoutubeItems(youTubeApiUrl, message.influencer_id);
    } else if (message.action === 'scrap_instagram_posts') { 
        // console.log('instagram scrapping received');

        prepareFetchInstagramPosts(message.url, message.influencer_id);
    
    } else if (message.action === 'scrap_linkedin_posts') { 

        scrapLinkedInUserData(message.url, message.influencerId)
        // console.log('instagram scrapping received');

      //  prepareFetchInstagramPosts(message.url, message.influencer_id);
    }


});

function prepareFetchInstagramPosts(instagramUrl, influencer_id) {

    var urlTemp = new URL(instagramUrl);
    var path = urlTemp.pathname.substring(1);
    path = path.split('/')[0];
    instagramUrl = urlTemp.origin + '/' + path + '/?__a=1&__d=dis';
    //console.log(instagramUrl);
    fetchInstagramPosts(instagramUrl, influencer_id)

}

async function scrapVideosFromYoutubeBulkSyncing(youTubeUrl, influencer_id) {
    // console.log('bulk scraaping message received');
    var channelId = '';
    if (youTubeUrl.indexOf('/channel/') > -1) {
        channelId = youTubeUrl.split('/channel/')[1];
        channelId = channelId.split('?')[0];
    }
    else if (youTubeUrl.indexOf('/c/') > -1) {
        await new Promise((resolve) => {
            fetch(youTubeUrl).then(function(response) {
                return response.text();
            }).then(function(text) {
                channelId = text.match(/<meta itemprop="channelId" content="(.*?)"/)[1];
                resolve(1);
            });
        });
    }
    else if (youTubeUrl.indexOf('/user/') > -1) {
        var userName = '';
        userName = youTubeUrl.split('/user/')[1];
        userName = userName.split('?')[0];
        getChannelIdFromUsername(userName, message.influencer_id);
        return false;
    } else {
        return false;
        // console.log("invalid url")
    }

    var publishAfterDate = GetLast30DaysDate();
    // console.log(publishAfterDate)

    youTubeItems = [];

    // console.log(youTubeUrl)
        //cinema
    youTubeApiUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + channelId + "&order=date&type=video&key=AIzaSyAoN_fQBiotuKYJgvR_CESJj0WgE5tYWDw&maxResults=50&publishedAfter=" + publishAfterDate;
    // console.log(youTubeApiUrl)

    fetchYoutubeItemsBulkScrapping(youTubeApiUrl, influencer_id);
}

function fetchYoutubeItems(url, influencer_id, token = false) {
    // console.log('fetchYoutubeItems called with token' + token);
    if (token) {
        url = url + "&pageToken=" + token;
    }
    youTubeItems = [];

    fetch(url).then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var items = response.items;
            if (items.length > 0) {

                // $.each(items, function(index, item) {
                items.forEach(function(item, index){
                    let tempItem = {
                        id: item.id.videoId,
                        name: item.snippet.title,
                        publish_at: item.snippet.publishedAt,
                        thumbnail: item.snippet.thumbnails.default.url
                    };
                    youTubeItems.push(tempItem);
                    if (index == items.length - 1) {
                        // console.log('youTubeItems.length: '+youTubeItems.length);
                        // call function on last iteration
                        // if(typeof response.nextPageToken != 'undefined'){
                        //   console.log("token found: "+response.nextPageToken)
                        //   fetchYoutubeItems(url,influencer_id,response.nextPageToken);
                        // }else{
                        saveYoutubeItems(influencer_id);
                        // } 
                    }
                })

            } else {
                chrome.runtime.sendMessage({ action: "youtube_videos_scrapping_completed" });
            }

        })
}

function fetchYoutubeItemsBulkScrapping(url, influencer_id, token = false) {
    // console.log('fetchYoutubeItems called with token' + token);
    if (token) {
        url = url + "&pageToken=" + token;
    }

    fetch(url).then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var items = response.items;
            
            // $.each(items, function(index, item) {
            items.forEach(function(item, index){
                let tempItem = {
                    id: item.id.videoId,
                    name: item.snippet.title,
                    publish_at: item.snippet.publishedAt,
                    thumbnail: item.snippet.thumbnails.default.url
                };
                youTubeItems.push(tempItem);
                if (index == items.length - 1) {
                    // console.log('youTubeItems.length: '+youTubeItems.length);
                    // call function on last iteration
                    // if(typeof response.nextPageToken != 'undefined'){
                    //   console.log("token found: "+response.nextPageToken)
                    //   fetchYoutubeItemsBulkScrapping(url,influencer_id,response.nextPageToken);
                    // }else{
                    saveYoutubeItemsBulkScrapping(influencer_id);
                    // } 
                }
            })
        })
}

function saveYoutubeItems(influencer_id) {
    // console.log("saveYoutubeItems called")
    // console.log(youTubeItems)

    fetch(_config.apiBaseUrl + "/add-youtube-activity", {
        method: "POST",
        body: JSON.stringify({ influencer_id: influencer_id, activity: youTubeItems }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': "Bearer " + jwtToken
        }
    }).then(response => {
        //console.log(response);
        response.json()
    }).then(response => {
        //console.log(response);

        chrome.runtime.sendMessage({ action: "youtube_videos_scrapping_completed" });
        
    });
}

function saveYoutubeItemsBulkScrapping(influencer_id) {
    // console.log("saveYoutubeItems called")
    // console.log(youTubeItems)

    fetch(_config.apiBaseUrl + "/add-youtube-activity", {
        method: "POST",
        body: JSON.stringify({ influencer_id: influencer_id, activity: youTubeItems }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': "Bearer " + jwtToken
        }
    }).then(response => response.json()).then(response => {
        //console.log(response);

        // chrome.runtime.sendMessage({ action: "youtube_videos_scrapping_completed" });
        
    });
}


function GetLast30DaysDate() {
    let now = new Date()
    let last30days = new Date(now.setDate(now.getDate() - 30))
    var month = last30days.getMonth() + 1;
    var day = last30days.getDate();
    var output = last30days.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day + "T00:00:00Z";
    return output;
}


chrome.storage.onChanged.addListener(function(changes, namespace) {

    for (key in changes) {
        if (key === 'authToken') {
            jwtToken = changes[key].newValue;
            if (jwtToken != null || jwtToken != '') {
                //console.log('jwttoken')
                chrome.runtime.sendMessage({ action:"scanProfiles", token: jwtToken });
                // scanProfiles(jwtToken); 
            }
        }
    }
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

function currentDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    return output;
}

function scanSingleUser(userUrl, userSocial, infId) {

    updateToken();

    parseUserInfo(userUrl).then((userInfo) => {

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        userInfo.currentTime = dateTime;

        fetch(_config.apiBaseUrl + "/add-influencer", {
            method: "POST",
            body: JSON.stringify(userInfo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': "Bearer " + jwtToken
            }
        }).then(response => response.json()).then(response => {
            //console.log(response);

            if (userSocial != "") {
                userSocial = JSON.parse(userSocial);

                yt_index = userSocial.findIndex(x => x.field_type == "YouTube");
                insta_index = userSocial.findIndex(x => x.field_type == "Instagram");

                if (userSocial[insta_index].text['0'] != '') {
                    prepareFetchInstagramPosts(userSocial[insta_index].text['0'], infId);
                }

                if (userSocial[yt_index].text['0'] != '') {
                    scrapVideosFromYoutubeBulkSyncing(userSocial[yt_index].text['0'], infId)
                        // chrome.runtime.sendMessage({action: "bulkScanUser", url: userSocial[yt_index].text['0'], influencer_id:infId});    
                }


            }
            
        }); 
    });
}


function getChannelIdFromUsername(username, influencer_id) {
    // console.log('getChannelIdFromUsername')
    var url = "https://youtube.googleapis.com/youtube/v3/channels?part=statistics&part=brandingSettings&part=snippet&part=contentDetails&part=contentOwnerDetails&forUsername=" + username + "&key=AIzaSyAoN_fQBiotuKYJgvR_CESJj0WgE5tYWDw";
    fetch(url).then(function(response) {
            return response.json();
        })
        .then(function(response) {

            var channelId = response.items[0].id;
            var publishAfterDate = GetLast30DaysDate();
            // console.log(publishAfterDate)

            youTubeItems = [];

            youTubeApiUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + channelId + "&order=date&type=video&key=AIzaSyAoN_fQBiotuKYJgvR_CESJj0WgE5tYWDw&maxResults=50&publishedAfter=" + publishAfterDate;
            // console.log(youTubeApiUrl);
            fetchYoutubeItems(youTubeApiUrl, influencer_id);

        })
}


function updateInfluencerFBImages() {
    //console.log(influencers)
    $.each(influencers, function(index, item) {

        if (item.photo_uri == null) {
            // console.log(item);
            setTimeout(() => {

                
                getFBImageUrl(item.user_link, item.ful_name).then(function(url) {
                    //console.log(url)
                    userInfo = { influencer_id: item.id, profile_img: url }
                        //console.log(userInfo);
                        //database update

                    fetch(_config.apiBaseUrl + "/update-profile-image", {
                        method: "POST",
                        body: userInfo,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            'Authorization': "Bearer " + jwtToken
                        }
                    }).then(response => response.json()).then(response => {
                        //console.log(response);                        
                    });

                })
            }, 3000)
        } 
    });
}

function getFBImageUrl(userUrl, fulName) {
    userUrl = userUrl.replace('www.', 'mbasic.');
    // console.log(userUrl);
    return fetch(userUrl).then(function(response) {
        return response.text();
    }).then(function(text) {
        //console.log(text);
        var img = $(text).find("img[alt$=\"profile picture\"]");
        return img[0].getAttribute('src');
    });
}

function fetchInstagramPosts(url, influencer_id) {

    instagramItems = [];
    fetch(url).then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var items = response.graphql.user.edge_owner_to_timeline_media.edges;
            //console.log(items);
            // $.each(items, function(index, item) {
            items.forEach(function(item, index){

                let tempItem = {
                    date: item.node.taken_at_timestamp,
                    shortcode: item.node.shortcode,
                    is_video: item.node.is_video,
                    thumbnail: item.node.thumbnail_resources[0].src
                };
                instagramItems.push(tempItem);
                

                if (index == items.length - 1) {
                    saveInstagramItems(influencer_id);
                }
            })
            //console.log(instagramItems);
            //console.log(items.length)
        })
}

function saveInstagramItems(influencer_id) {
    //console.log(JSON.stringify({ influencer_id: influencer_id, activity: instagramItems }))
    fetch(_config.apiBaseUrl + "/add-insta-activity", {
        method: "POST",
        body: JSON.stringify({ influencer_id: influencer_id, activity: instagramItems }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': "Bearer " + jwtToken
        }
    }).then(response => response.json()).then(response => {
        //console.log(response);
        
    });
}

// <input type="file" accept="image/*" onchange="loadFile(event)">
//<img id="output"/>
 
 // var loadFile = function(event) {
 //    var output = document.getElementById('output');
 //    output.src = URL.createObjectURL(event.target.files[0]);
 //    output.onload = function() {
 //      URL.revokeObjectURL(output.src) // free memory
 //    }
 //  };



function linkedInTabListener(tabId, changeInfo, tab){ 
    if (changeInfo.status === "complete" && tabId === linkedInTabId) { 

        if(tab.url.indexOf('sessionRedirect') <= -1){
            //console.log('linkedInTabId before sending msg', linkedInTabId)
            chrome.tabs.sendMessage(linkedInTabId,{action:'scrapLinkedinProfile', influencerId: currentLinkedInInfluencerId});
            
            chrome.tabs.onUpdated.removeListener(linkedInTabListener); 
        }else{
           // console.log('linkedInTabId else');
            chrome.tabs.remove(linkedInTabId);
            chrome.tabs.onUpdated.removeListener(linkedInTabListener); 
        }      
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'linkedinProfileCompleted') {

        var influencerId = message.influencerId;
        var activity = message.activity;
        
        chrome.storage.local.get(['authToken'], function(_ref) {
            if (typeof _ref.authToken != "undefined") {
                jwtToken = _ref.authToken;
                
                fetch(_config.apiBaseUrl + "/add-linkedin-activity", {
                    method: "POST",
                    body: JSON.stringify({influencerId:influencerId,activity:activity}),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        'Authorization': "Bearer " + jwtToken
                    }
                }).then(response => response.json()).then(response => {
                    console.log('add-linkedin-activity Response: ', response.status); 
                    
                    chrome.runtime.sendMessage({ action: "linkedin-completed", status:response.status, influencerId:influencerId });
                        //getinfluencerById(influencerId); 
                    

                    chrome.tabs.remove(sender.tab.id); // close the linkedin tab
                    chrome.runtime.sendMessage({action: "clearLinkedInInfluencerVariable"});
                    
                });

                
            }
        });
    }
    else if(message.action === 'linkedinProfileTimedOut'){

        //console.log('linkedinProfileTimedOut event occur', new Date());
        // linkedInProcess = false;
        chrome.runtime.sendMessage({action: "resetLinkedInProcess"});
        // linkedInCustomSync = false;
        chrome.tabs.remove(sender.tab.id);

    }
    else if(message.action == 'openLinkedInTab'){

        let url = message.url;
        currentLinkedInInfluencerId = message.influencerId;
        chrome.windows.create({ 
            url: url,
            focused:false, 
            type:"popup",
            top:Math.floor(window_height/4*3),
            left:Math.floor(window_width/4*3), 
            height:Math.floor(window_height/4), 
            width:Math.floor(window_width/4)
        },function (tabs) {
            linkedInTabId = tabs.tabs[0].id;
           // console.log('linkedInTabId', linkedInTabId);
            chrome.tabs.onUpdated.addListener(linkedInTabListener);
        });
        
    }
    else if(message.action == 'scanSingleUser'){

        scanSingleUser(message.userUrl, message.userSocial, message.infId);

    }
    else if(message.action == 'reloadStorageData'){
        getAllTags('manual');
        getGlobalTags('manual');
        getGlobalChecklists('manual');
        getGlobalScripts('manual');
    }else if(message.action== 'updateTagInfo'){
        getAllTags('manual');
        
    }else if(message.action == 'scrapAutomationData'){
        //console.log('his')
        //console.log(message.data)
        var socialInfo = JSON.parse(message.data);
        let facebookIndex = socialInfo.findIndex(x => x.field_type == 'Facebook');
        let linkedInIndex = socialInfo.findIndex(x => x.field_type == 'LinkedIn');
        let youTubeIndex = socialInfo.findIndex(x => x.field_type == 'YouTube');
        let instagramIndex = socialInfo.findIndex(x => x.field_type == 'Instagram');

        let facebookUrl = socialInfo[facebookIndex].text[0];
        let linkedInUrl = socialInfo[linkedInIndex].text[0];
        let youTubeUrl = socialInfo[youTubeIndex].text[0];
        let instagramUrl = socialInfo[instagramIndex].text[0];
        let infId = message.influencerId;


        //console.log(facebookUrl+'--'+linkedInUrl+'--'+youTubeUrl+'--'+instagramUrl)
        // let responseFromFunction = '';
        if(facebookUrl != ''){
            scrapUserFacebookData(facebookUrl,infId);
        }
        if(instagramUrl != ''){
            prepareFetchInstagramPosts(instagramUrl, infId)
        }
        if(youTubeUrl != ''){
            scrapVideosFromYoutubeBulkSyncing(youTubeUrl, infId)
        }
        if(linkedInUrl != ''){
            //console.log('linkedIn')
            scrapLinkedInUserData(linkedInUrl, infId)
        }
        
    }else if(message.action == 'getAssignedTags'){
        getAllTags('manual');
    }
});

OpenOptionPage();

function OpenOptionPage(){  

     chrome.storage.local.get(["authToken"], function(result) {
       // console.log(result)
     });
    //     if (typeof result.authToken != "undefined" && result.authToken != "") {
            chrome.windows.getAll({populate:true},function(windows){
                windowFound = windows.filter((window)=>{
                    found = window.tabs.filter(function(tab){
                        return tab.url.indexOf('option.html') > -1;
                    })
                    if(found.length > 0){
                        return true;
                    }else{
                        return false;
                    }
                });
                //console.log(windowFound.length);
                if(windowFound.length == 0){
                   // console.log('window open');
                    chrome.windows.create({
                        url: chrome.runtime.getURL("option.html"),
                        focused: false,
                        type: "popup",
                        // top:Math.floor(window_height-10),
                        // left:Math.floor(window_width-10),
                        top:Math.floor(window_height-35),
                        left:Math.floor(window_width-35),
                        height:10,
                        width:10


                        // top: Math.floor(window_height - 10),
                        // top: Math.floor(window_height*2),
                        // left: Math.floor(window_width - 10),
                        // height: 10,
                        // width: 10

                        // top:Math.floor(window_height/4*3),
                        // left:Math.floor(window_width/4*3), 
                        // height:Math.floor(window_height/4), 
                        // width:Math.floor(window_width/4)
                    }, function(tabs) {

                        optionPageTabId = tabs.tabs[0].id;
                        
                        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

                            if (changeInfo.status === "complete" && tabId === optionPageTabId) {
                                let fullSObject = {

                                    top:Math.floor(window_height*2), 
                                    left:Math.floor(window_width),
                                    // top:Math.floor(0), 
                                    // left:Math.floor(0), 
                                    height: 10,
                                    width: 10

                                } 

                                chrome.windows.update(tabs.id, fullSObject);


                            }
                        });
                    });
                }
            });
    //     }
    // });        
}


chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(["authToken"], function(result) {
       // console.log(result)
     });
    getAllTags();
    getGlobalTags();
    getGlobalChecklists();
    getGlobalScripts();
    chrome.alarms.create('forActiveState', {periodInMinutes:1/2});
});

chrome.alarms.onAlarm.addListener(function( alarm ) {
    //console.log('1');
    OpenOptionPage();
});

function getAllTags(click='initial'){
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        fetch(_config.apiBaseUrl + "/get-all-tags",{
            type: "GET",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            }
        }).then((response) => response.json())
        .then((data) => {
            if(data.status){
                //console.log('Success:', data);
                chrome.storage.local.set({"get_all_tags":data.data});
                if(click == 'manual'){
                    chrome.runtime.sendMessage({action:'getAllTags'})
                }
            }
        
        })
        .catch((error) => {
        //console.log('Error:', error);
        });
    });
}
function getGlobalTags(click='initial'){
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        fetch(_config.apiBaseUrl + "/get-global-tags",{
            type: "GET",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            }
        }).then((response) => response.json())
        .then((data) => {
            if(data.status){
               // console.log('Success:', data);
                chrome.storage.local.set({"get_global_tags":data.tags});
                //console.log('message ready');
                if(click == 'manual'){
                    //console.log('message sent');
                    chrome.runtime.sendMessage({action:'getGlobalTags'})
                }
            }
        
        })
        .catch((error) => {
        //console.log('Error:', error);
        });
    });
}

function getGlobalChecklists(click='initial'){
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        fetch(_config.apiBaseUrl + "/get-global-checklists",{
            type: "GET",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            }
        }).then((response) => response.json())
        .then((data) => {
            if(data.status){
                //console.log('Success:', data);
                chrome.storage.local.set({"get_global_checklists":data.checklist});
                if(click == 'manual'){
                    chrome.runtime.sendMessage({action:'getGlobalChecklists'})
                }
            }
        
        })
        .catch((error) => {
        //console.log('Error:', error);
        });
    });
}
// function getinfluencerById(influencerId) {
//     chrome.runtime.sendMessage({ action: "linkedin-completed", status:true, influencerId:influencerId });
//     // console.log('enter in getinfluencerById ');
//     // chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
//     //     console.log('enter in getinfluencerById function');
//     //     fetch(_config.apiBaseUrl + "/get-influencers-by-id",{
//     //         method: "POST",
//     //         body: JSON.stringify({ "influencer_id": influencerId }),
//     //         // Adding headers to the request
//     //         headers: {
//     //             "Authorization": "Bearer " + _ref.authToken,
//     //             "Content-type": "application/json; charset=UTF-8"
//     //         }
//     //     })
//     //     .then(response => response.json())
//     //     .then((data) => {
//     //         console.log('data', data); 
//     //         if (data?.status && data?.data != null) {
//     //             let influencer = data?.data[0];
//     //             console.log('influencer', influencer);
//     //             // Find the index of the item with ID 2
//     //             //let indexToUpdate = influencers?.findIndex(item => item?.id === influencer?.id);
//     //             //influencers[indexToUpdate] = influencer;    
//     //             //chrome.storage.local.set({'selectedProfileDetails': influencer});
//     //             // var loader = document.getElementById("loader");
//     //             // loader.style.display = 'none';
//     //             //chrome.runtime.reload();
//     //             chrome.runtime.sendMessage({ action: "linkedin-completed", status:true, influencer:influencer });
                
//     //         }
//     //        console.log('getinfluencerById is ok function')
        
//     //     })
//     //     .catch((error) => {
//     //         console.log('Error:', error);
//     //     });
//     // });
// }
function getGlobalScripts(click='initial'){
    chrome.storage.local.get(['authToken', 'userId'], function(_ref) {
        fetch(_config.apiBaseUrl + "/get-global-scripts",{
            type: "GET",
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            }
        }).then((response) => response.json())
        .then((data) => {
            if(data.status){
                //console.log('Success:', data);
                chrome.storage.local.set({"get_global_scripts":data.scripts});
                if(click == 'manual'){
                    chrome.runtime.sendMessage({action:'getGlobalScripts'})
                }
            }
        
        })
        .catch((error) => {
        //console.log('Error:', error);
        });
    });
}

function scrapUserFacebookData(userUrl, infId) {

    updateToken();

    parseUserInfo(userUrl).then((userInfo) => {

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        userInfo.currentTime = dateTime;

        fetch(_config.apiBaseUrl + "/add-influencer", {
            method: "POST",
            body: JSON.stringify(userInfo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': "Bearer " + jwtToken
            }
        }).then(response => response.json()).then(response => {
            //console.log(response);

            // if (userSocial != "") {
            //     userSocial = JSON.parse(userSocial);

            //     yt_index = userSocial.findIndex(x => x.field_type == "YouTube");
            //     insta_index = userSocial.findIndex(x => x.field_type == "Instagram");

            //     if (userSocial[insta_index].text['0'] != '') {
            //         prepareFetchInstagramPosts(userSocial[insta_index].text['0'], infId);
            //     }

            //     if (userSocial[yt_index].text['0'] != '') {
            //         scrapVideosFromYoutubeBulkSyncing(userSocial[yt_index].text['0'], infId)
            //             // chrome.runtime.sendMessage({action: "bulkScanUser", url: userSocial[yt_index].text['0'], influencer_id:infId});    
            //     }

                
            // }
            
        }); 
    });
}

function scrapLinkedInUserData(userUrl, infId) {
    var lastChar = userUrl?.charAt(userUrl.length - 1);
    if(lastChar == '/'){
        userUrl = userUrl.slice(0, -1);
    }
    userUrl = userUrl+"/recent-activity"; 
    //console.log("window open with url", userUrl);
    // chrome.runtime.sendMessage({action:'openLinkedInTab', url: userUrl, influencerId: infId});
    currentLinkedInInfluencerId = infId;
    chrome.windows.create({ 
        url: userUrl,
        focused:false, 
        type:"popup",
        top:Math.floor(window_height/4*3),
        left:Math.floor(window_width/4*3), 
        height:Math.floor(window_height/4), 
        width:Math.floor(window_width/4)
    },function (tabs) {
        linkedInTabId = tabs.tabs[0].id;
        //console.log('linkedInTabId', linkedInTabId);
        chrome.tabs.onUpdated.addListener(linkedInTabListener);
    });
}