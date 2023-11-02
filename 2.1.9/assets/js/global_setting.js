var global_var_scripts = [];
chrome.runtime.onMessage.addListener((message, response) => {
    if (message.action == 'getGlobalTags') {
        //console.log('message received');
        loadAllGlobalTags();
    }
    if (message.action == 'getGlobalChecklists') {
        loadAllChecklistTags();
    }
    if (message.action == 'getGlobalScripts') {
        loadGlobalScripts();
    }

});
setTimeout(() => {
    loadAllGlobalTags();

    setTimeout(() => {
        loadAllChecklistTags();
    }, 3000);

    setTimeout(() => {
        loadGlobalScripts();
    }, 1000);
}, 2000);

$(".search_tag_input").keyup(function () {
    var keyword = this.value.toLowerCase();
    $("#manage_tags .tag_rows").each(function () {
        var tagName = $(this).find('h3').text().toLowerCase();
        if (tagName.indexOf(keyword) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});

$(".search_checklist_input").keyup(function () {
    var keyword = this.value.toLowerCase();
    $("#manage_checklist .checklist_rows").each(function () {
        var tagName = $(this).find('h3').text().toLowerCase();
        if (tagName.indexOf(keyword) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});

$(".search_scripts_input").keyup(function () {
    var keyword = this.value.toLowerCase();
    $("#manage_scripts .script_rows").each(function () {
        var scriptTitle = $(this).find('h3').text().toLowerCase();
        if (scriptTitle.indexOf(keyword) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});

$(".setting_icon").click(function () {
    $(".tab").hide()
    $("#settings_screen").show();
    $(".setting_icon").hide();
    $(".home_icon").show();
})


// CONVERT TEXT TO UPPERCASE IN ADD TAG INPUT BOX 
$('#global_tag_name_input').keyup(function () {
    this.value = this.value.toLocaleUpperCase();
})

// SAVE TAGS IN DB AFTER CLICK SAVE BUTTON 
$(".save-global-tags").click(function () {

    let tag_name = $('#global_tag_name_input').val();
    $("#add_tag_modal .save-global-tags").text('Saving..');
    let exist_tags = [];
    if ($('.tag_rows').length > 0) {
        $('.tag_rows').each(function (item) {
            exist_tags.push($(this).find('h3').text());
        })
    }
    let matchedExistsTag = [];
    if (exist_tags.length > 0) {
        matchedExistsTag = exist_tags.filter(function (item) {
            return (item.indexOf(tag_name) >= 0);
        });
    }

    if (matchedExistsTag.length > 0) {
        toastr["error"]("Tag Already exist");
        $("#add_tag_modal .save-global-tags").text('Save');
        return false;
    } else {
        chrome.storage.local.get(['authToken', 'userId', 'get_global_tags'], function (_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/add-global-tags",
                type: "POST",
                data: { tags: tag_name },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function (res) {
                    if (res.status) {
                        toastr["success"](res.message);
                        $('#global_tag_name_input').val('');
                        //console.log(_ref.get_global_tags);
                        let newTag = {
                            'id': res.inserted_id,
                            'user_id': _ref.userId,
                            'tags': tag_name,
                            'created_at': new Date().toISOString(),
                            'updated_at': new Date().toISOString()
                        };
                        chrome.storage.local.set({ 'get_global_tags': [..._ref.get_global_tags, newTag] }, function () {
                            chrome.storage.local.get(['get_global_tags'], function (data) {
                                //console.log(data)
                            });
                        });
                        let addnew_tag = `<div class="row tag_rows" tag-id="` + res.inserted_id + `">
                                <div class="col-1 check_list pr-0">
                                    <input type="checkbox" name="` + tag_name + `">
                                </div>
                                <div class="col-10 pl-0">
                                    <div class="col-12 p-0 shown_tags_sec" style="background:#05931c;">
                                        <h3>` + tag_name + `</h3>
                                    </div>
                                </div>
                                <div class="col-1 p-0 delete-icon">
                                    <i class="fa fa-trash tags-delete-icon" data-id="` + res.inserted_id + `"></i>
                                </div>
                            </div>`;
                        $('.shown_tags').prepend(addnew_tag);
                        $("#add_tag_modal").modal('hide');
                        $("#add_tag_modal .save-global-tags").text('Save');
                    }
                },
                error: function (jqXHR, exception) {
                    $("#add_tag_modal .save-global-tags").text('Save');
                    toastr["error"]("Request failed: " + exception);
                }
            });
        });
    }

})

// ADD CHECKLIST BUTTON
$(document).on('click', '.add_checklist', function () {
    $('#global_checklist_name_input').val('');
    $('.global-checklist-section').html('');
    $('#add_checklist_modal').attr('data-checklist_id', 0);
});
// OPEN DELETE GLOBAL CHECKLIST CONFIRMATION POPUP
$(document).on('click', '.checklist-item-delete-icon', function () {
    //$('#deleteGlobalTagsModal').hide
    let checklist_item_delete_id = $(this).attr('id');
    $("#deleteGlobalChecklisItemtModal").modal('show');
    $("#deleteGlobalChecklisItemtModal .delete-global-checklist-item").attr('id', checklist_item_delete_id);
})
// DELETE CHECKLIST ITEM
$(document).on('click', '.delete-global-checklist-item', function (event) {
    //$(this).text('Deleting..');
   let id= event.target.id;
   let idArray = id.split("-");
   let value = idArray[0];
   let checklist_id = $('#add_checklist_modal').attr('data-checklist_id');
   let index = idArray[2];
   

    let checklist = global_var_checklists.filter(function (item, i) {
        return (item.id == checklist_id);
    });

    let checklist_items_listsArr = checklist?.length > 0 ? JSON.parse(checklist[0]?.checklist_items) : [];
    
    const filteredItems = checklist_items_listsArr.filter(item => item.input !== value);

    let a = JSON.stringify(filteredItems);

    const updatedUsers = global_var_checklists.map(user => {
        if (user.id === parseInt(checklist_id)) {
        return { ...user, checklist_items: a };
        } else {
        return user;
        }
    });
    $("#checklist-item-"+index).remove();
    $("#deleteGlobalChecklisItemtModal").modal('hide');
});

// EDIT CHECKLST BUTTON
$(document).on('click', '.checklist-edit-icon', function () {
    //$('#deleteGlobalTagsModal').hide
    let checklist_row_html = '';
    let checklist_name = $(this).attr('data-name');
    let checklist_id = $(this).attr('data-id');
    $('#add_checklist_modal').attr('data-checklist_id', checklist_id);

    //add_checklist_modal 
    $('#global_checklist_name_input').val(checklist_name);
    let globalChecklistByInfuencerId = global_var_checklists.filter(function (item, i) {
        return (item.id == checklist_id);
    });

    const checlistsArr = JSON.parse(globalChecklistByInfuencerId[0].checklist_items);
    if (checlistsArr != null) {
        checlistsArr.forEach(function (item, index) {
            let checked = '';
            if (item.status == 'true') {
                checked = 'checked';
            }


            checklist_row_html += `<div class="row checklist-item-row" id="checklist-item-` + index + `" >
                    <div class="col-8">
                    <input type="checkbox" id="` + item.input + `" name="` + item.input + `" value="` + item.input + `" ` + checked + ` class="hide-only" readonly>
                    <label for="` + item.input + `">` + item.input + `</label>
                    </div>
                    <div class="col-4 text-right">
                     <i class="fa fa-trash checklist-item-delete-icon" data-id="` + item.input + `" id="` + item.input + `-` + checklist_id + `-` + index + `" ></i>
                   
                    </div>
                    <br>
                </div>`;
            //exist_checklistsItems.push(exist_name);
        })
        $('.global-checklist-section').html(checklist_row_html);
    }
});

// DELETE TAGS CONFIRMATION FROM DB
$(document).on('click', '.tags-delete-icon', function () {
    //$('#deleteGlobalTagsModal').hide
    let tag_delete_id = $(this).attr('data-id');
    //console.log("tags-delete-icon");
    $("#deleteGlobalTagsModal").modal('show');
    $("#deleteGlobalTagsModal .delete-global-tags").attr('delete-tag-id', tag_delete_id);
})

// DELETE GLOBAL FROM DATABASE WITH API 
$(document).on('click', '.delete-global-tags', function () {
    //$('#deleteGlobalTagsModal').hide
    $(this).text('Deleting..');
    let tag_id = $(this).attr('delete-tag-id');
    //console.log("hghgfhg", tag_id);
    chrome.storage.local.get(['authToken', 'userId', 'get_global_tags'], function (_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/delete-global-tags",
            type: "POST",
            data: { global_tag_id: tag_id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function (res) {
                if (res.status) {
                    let globalTags = _ref.get_global_tags;
                    let newGlobalTagArr = [];
                    for (let globalTag of globalTags) {
                        if (globalTag.id != tag_id) {
                            newGlobalTagArr.push(globalTag)
                        }
                    }
                    chrome.storage.local.set({ 'get_global_tags': newGlobalTagArr }, function () {
                        chrome.storage.local.get(['get_global_tags'], function (data) {
                            //console.log(data)
                        });
                    });

                    $('.delete-global-tags').text('Yes');
                    $("#deleteGlobalTagsModal .delete-global-tags").removeAttr('delete-tag-id');
                    $("#deleteGlobalTagsModal").modal('hide');
                    $('.tag_rows[tag-id="' + tag_id + '"]').remove();
                    toastr["success"](res.message);

                }
            },
            error: function (jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
})


// CLICK THIS BUTTON AFTER SELECT ALL GLOBAL TAGS
$(".select_influencer_btn").click(function () {
    if ($('.tag_rows input:checked').length == 0) {
        toastr["error"]("Please select tag(s) first");
    } else {
        $('#selectinfluencerModal .assign_global_tag_influencer_btn').attr('data-id', 0);
        displayInfuencersOnPopup(influencers);
        $('#selectinfluencerModal').modal('show');
    }
});
// CLICK ON ASSIGN(+) ICON ON GLOBAL CHECKLIST SECTION
$(document).on('click', '.checklist-assign-icon', function () {
    displayInfuencersOnPopup(influencers);
    $('#selectinfluencerModal').modal('show');
    $('#selectinfluencerModal .assign_global_tag_influencer_btn').attr('data-id', $(this).attr('data-id'));
});

// CLICK ON SAVE BUTTON ON ASSIGN INFULENCER POPUP
$(".assign_global_tag_influencer_btn").click(function () {
    $('.assign_global_tag_influencer_btn').text('Saving..');
    if ($('.add-influencers-data input[type="checkbox"]:checked').length > 0) {
        let checklist_id = $(this).attr('data-id');
        $('.add-influencers-data input[type="checkbox"]:checked').each(function () {
            let influencers_id = this.value;
            if (checklist_id == 0) {
                assignedTagsToInfluencers(influencers_id);
            } else {
                assignedChecklistToInfluencers(influencers_id, checklist_id);
            }
        });
    } else {
        toastr["error"]("select at least one influencer");
    }
});

// CONVER TEXT IN UPPERCASE WHEN TYPE INPUT IN ADD CHECKLIST INPUT BOX
$('#global_checklist_name_input').keyup(function () {
    this.value = this.value.toLocaleUpperCase();
})

//  SAVE(ADD & UPDATE) CHECKLIST IN DATABASE AFTER CLICK SAVE BUTTON
$(".save-global-checklist").click(function () {

    $('.save-global-checklist').text('Saving');

    let checklist_name = $('#global_checklist_name_input').val();
    let checklist_id = $('#add_checklist_modal').attr('data-checklist_id');

    if (checklist_name != '') {
        //console.log('checklist_name');
        let exist_checklist_rows = [];
        let matchedChecklist_rows = [];
        let exist_checklist = [];
        let matchedExistsChecklist = [];
        if ($('.checklist_rows').length > 0) {
            //console.log('checklist_rows');
            $('.checklist_rows').each(function (item) {
                exist_checklist_rows.push($(this).find('h3').text());
            })
        }
        if (exist_checklist_rows.length > 0) {
            //console.log('exist_checklist_rows');
            matchedChecklist_rows = exist_checklist_rows.filter(function (item) {
                return (item.indexOf(checklist_name) >= 0);
            });
        }
         if (matchedChecklist_rows.length > 0 && checklist_id == "0") {
            //console.log('matchedChecklist_rows');
            toastr["error"]("Checklist Already exist");
            $(".save-global-checklist").text('Save');
            return false;
        }
         if ($('.checklist-item-row').length > 0) {
            //console.log('exist_checklist');
            $('.checklist-item-row').each(function (item) {
                let input = $(this).find('input').val();
                //console.log(input);
                let status = $(this).find('input').is(':checked');
                let randomnumber=Math.ceil(Math.random()*100);
                action_step = {
                    input: input,
                    status: status,
                    itemId: randomnumber,
                    checklist_id: checklist_id
                };
                exist_checklist.push(action_step);

            })
        } else {
            $('.save-global-checklist').text('Save');
            toastr["error"]("Checklist Item not exist");
            return false;
        }

        
        if (exist_checklist.length > 0) {
            matchedExistsChecklist = exist_checklist.filter(function (item) {
                return (item.input.indexOf(checklist_name) >= 0);
            });
        }

        if (matchedExistsChecklist.length > 0) {
            $('.save-global-checklist').text('Save');
            toastr["error"]("This Checklist Already exist");
            return false;
        } else {
           // console.log(exist_checklist);
            chrome.storage.local.get(['authToken', 'userId', 'get_global_checklists'], function (_ref) {
                $.ajax({
                    url: _config.apiBaseUrl + "/add-global-checklists",
                    type: "POST",
                    data: { checklist_title: checklist_name, checklist_items: exist_checklist, checklist_id: checklist_id },
                    headers: {
                        "Authorization": "Bearer " + _ref.authToken
                    },
                    success: function (res) {

                        if (res.status) {
                            //console.log(_ref.get_global_checklists);
                            let newChecklist = {
                                'id': res.inserted_id,
                                'user_id': _ref.userId,
                                'checklist_title': checklist_name,
                                'checklist_items': JSON.stringify(exist_checklist),
                                'created_at': new Date().toISOString(),
                                'updated_at': new Date().toISOString()
                            };
                           
                            if(checklist_id != "0"){
                                _ref.get_global_checklists  = _ref.get_global_checklists.map(x => (x.id === newChecklist.id) ? newChecklist : x);
                            }else{
                                _ref.get_global_checklists  =  [..._ref.get_global_checklists, newChecklist];
                            }
                          
                            chrome.storage.local.set({ 'get_global_checklists': _ref.get_global_checklists }, function () {
                                chrome.storage.local.get(['get_global_checklists'], function (data) {
                                    //console.log(data)
                                });
                            });
                            $('#global_checklist_name_input').val('');
                            
                          // $('#checklist-id-'+res.inserted_id).remove();

                            let addnew_checklist = `<div class="row checklist_rows" checklist-id="` + res.inserted_id + `" id="checklist-id-` + res.inserted_id + `" >                                   
                                    <div class="col-10">
                                        <div class="col-12 p-0 shown_checklist_sec" style="background:#05931c;">
                                            <h3>` + checklist_name + `</h3>
                                        </div>
                                    </div>
                                    <div class="col-1 p-0 delete-icon links">
                                        <i class="fa fa-edit checklist-edit-icon" data-id="` + res.inserted_id + `" data-toggle="modal" data-name="` + checklist_name + `" data-target="#add_checklist_modal"></i>
                                        <i class="fa fa-trash checklist-delete-icon" data-id="` + res.inserted_id + `"></i>
                                        <i class="fa fa-user checklist-assign-icon" data-id="` + res.inserted_id + `"></i>

                                    </div>
                                </div>`;
                            
                            if (checklist_id == 0) {
                                $('.shown-global-checklist').prepend(addnew_checklist);
                            } else {
                                $('.checklist_rows[checklist-id="' + checklist_id + '"]').find('h3').text(checklist_name);
                            }

                            toastr["success"](res.message);
                            $('.save-global-checklist').text('Save');
                            $("#add_checklist_modal").modal('hide');
                            loadAllChecklistTags();
                        }
                    },
                    error: function (jqXHR, exception) {
                        $('.save-global-checklist').text('Save');
                        toastr["error"]("Request failed: " + exception);
                    }
                });
            });
        }
    } else {
        $('.save-global-checklist').text('Save');
        toastr["error"]("Enter checklist name");
        return false;
    }

})


// -------------------------------manage script start here ---------------------------------
$(".save-script").click(function () {

    let script_name = $('#script_name').val();
    let script_content = $('#script_content').val();
    let script_id = $('#add_manage_script_modal').attr('data-script_id');
    $(".save-script").text('Saving...');

    // alert('checklistName : '+checklist_name + ' checklistId : '+checklist_id); script_content
    // alert('script_name : '+script_name + ', script_id : '+script_id + ', script_content : '+script_content);

    if (script_name != "" && script_content != "") {

        chrome.storage.local.get(['authToken', 'userId', 'get_global_scripts'], function (_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/add-global-script",
                type: "POST",
                data: { script_name: script_name, script_content: script_content },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function (res) {
                    //console.log(res)
                    global_var_scripts = res.scripts;

                    chrome.storage.local.set({ 'get_global_scripts': global_var_scripts }, function () {
                        chrome.storage.local.get(['get_global_scripts'], function (data) {
                            //console.log(data)
                        });
                    });
                    showGlobalScripts(res.scripts);
                    $("#add_manage_script_modal").modal('hide');
                    $(".save-script").text('Save');
                    toastr["success"]("Save Successfully");
                }

            });
        });

    } else {
        $('.save-global-checklist-manage-scripts').text('Save');
        toastr["error"]("Please Fill All Field ");
        return false;
    }




});

$(".edit-script").click(function () {

    let script_name = $('#script_edit_name').val();
    let script_content = $('#script_edit_content').val();
    // let script_id    = $('#edit_manage_script_modal').attr('data-script_id');
    let script_id = $('#edit_manage_script_modal').attr('data-script_id');

    $(".edit-script").text('Updating...');

    //console.log(script_id);

    // alert('checklistName : '+checklist_name + ' checklistId : '+checklist_id); script_content
    // alert('script_name : '+script_name + ', script_id : '+script_id + ', script_content : '+script_content);


    if (script_name != "" && script_content != "") {

        chrome.storage.local.get(['authToken', 'userId'], function (_ref) {
            $.ajax({
                url: _config.apiBaseUrl + "/edit-global-script",
                type: "POST",
                data: { script_id: script_id, script_name: script_name, script_content: script_content },
                headers: {
                    "Authorization": "Bearer " + _ref.authToken
                },
                success: function (res) {
                    //console.log(res);
                    global_var_scripts = res.scripts;
                    chrome.storage.local.set({ 'get_global_scripts': global_var_scripts }, function () {
                        chrome.storage.local.get(['get_global_scripts'], function (data) {
                           /// console.log(data)
                        });
                    });
                    showGlobalScripts(res.scripts);
                    $("#edit_manage_script_modal").modal('hide');
                    $(".edit-script").text('Update');
                    toastr["success"]("Update Successfully");
                }

            });
        });

    } else {
        //  $('.save-global-checklist-manage-scripts').text('Save');
        toastr["error"]("Please Fill All Field ");
        return false;
    }




});

$(document).on('click', '.script-delete-icon', function () {
    //$('#deleteGlobalTagsModal').hide

    $("#deleteGlobalScriptModal").modal('show');
    let script_delete_id = $(this).attr('data-id');
    //  console.log(script_delete_id);
    $("#deleteGlobalScriptModal .delete-global-script").attr('delete-script-id', script_delete_id);

});

$(document).on('click', '.delete-global-script', function () {
    //$('#deleteGlobalTagsModal').hide
    $(this).text('Deleting..');
    let script_id = $(this).attr('delete-script-id');
    // console.log(script_id);

    chrome.storage.local.get(['authToken', 'userId', 'get_global_scripts'], function (_ref) {
        // console.log('hey i got it');
        $.ajax({
            url: _config.apiBaseUrl + "/delete-global-script",
            type: "POST",
            data: { global_script_id: script_id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function (res) {
                //  console.log(res);
                if (res.status) {
                    let globalScripts = _ref.get_global_scripts;
                    let newGlobalScriptsArr = [];
                    for (let globalScript of globalScripts) {
                        if (globalScript.id != script_id) {
                            newGlobalScriptsArr.push(globalScript)
                        }
                    }
                    chrome.storage.local.set({ 'get_global_scripts': newGlobalScriptsArr }, function () {
                        chrome.storage.local.get(['get_global_scripts'], function (data) {
                            //console.log(data)
                        });
                    });
                    loadAllChecklistTags();
                    $('.delete-global-script').text('Yes');
                    $("#deleteGlobalScriptModal .delete-global-script").removeAttr('delete-script-id');
                    $("#deleteGlobalScriptModal").modal('hide');

                    $('.script_rows[script-id="' + script_id + '"]').remove();
                    toastr["success"](res.message);
                }
            },
            error: function (jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
});


$(document).on('click', '.script-edit-icon', function () {


    let checklist_row_html = '';
    let script_name = $(this).attr('data-name');
    let script_content = $(this).attr('data-content');
    let script_id = $(this).attr('data-id');
    //  $('#edit_manage_script_modal').attr('data-script_id',script_id);

    $('#edit_manage_script_modal').attr('data-script_id', script_id);

    $('#script_edit_name').val(script_name);
    $('#script_edit_content').val(script_content);



});



// --------------------------------end manage script here ----------------------------------


// OPEN DELETE GLOBAL CHECKLIST CONFIRMATION POPUP
$(document).on('click', '.checklist-delete-icon', function () {
    //$('#deleteGlobalTagsModal').hide
    let checklist_delete_id = $(this).attr('data-id');
    $("#deleteGlobalChecklistModal").modal('show');
    $("#deleteGlobalChecklistModal .delete-global-checklist").attr('delete-checklist-id', checklist_delete_id);
})

// DELETE GLOBAL CHECKLIST FROM DATABASE (CONFIRMATION POPUP DELETE BUTTON CLICK)
$(document).on('click', '.delete-global-checklist', function () {
    //$('#deleteGlobalTagsModal').hide
    $(this).text('Deleting..');
    let checklist_id = $(this).attr('delete-checklist-id');
    //console.log(checklist_id);
    chrome.storage.local.get(['authToken', 'userId', 'get_global_checklists'], function (_ref) {
        $.ajax({
            url: _config.apiBaseUrl + "/delete-global-checklists",
            type: "POST",
            data: { global_checklist_id: checklist_id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function (res) {
                if (res.status) {
                    let globalChecklists = _ref.get_global_checklists;
                    let newGlobalChecklistArr = [];
                    for (let globalChecklist of globalChecklists) {
                        if (globalChecklist.id != checklist_id) {
                            newGlobalChecklistArr.push(globalChecklist)
                        }
                    }
                    chrome.storage.local.set({ 'get_global_checklists': newGlobalChecklistArr }, function () {
                        chrome.storage.local.get(['get_global_checklists'], function (data) {
                            //console.log(data)
                        });
                    });
                    loadAllChecklistTags();
                    $('.delete-global-checklist').text('Yes');
                    $("#deleteGlobalChecklistModal .delete-global-checklist").removeAttr('delete-checklist-id');
                    $("#deleteGlobalChecklistModal").modal('hide');

                    $('.checklist_rows[checklist-id="' + checklist_id + '"]').remove();
                    toastr["success"](res.message);
                }
            },
            error: function (jqXHR, exception) {
                toastr["error"]("Request failed: " + exception);
            }
        });
    });
})

// ADD NEW ITEMS IN CHECKLIST
$(document).on('click', '.add-item-global-checklist', function () {
    $('.add-checklist-items-input').show();
    $('.close-btn-checklist').removeClass('default-hide');
    $('.close-btn-checklist').show();
    $(this).hide();
});

// HIDE INPUT FILED CHECKLIST POPUP
$(document).on('click', '.close-btn-checklist', function () {
    $('.add-checklist-items-input').hide();
    $('.add-item-global-checklist').show();
    $('.close-btn-checklist').addClass('default-hide');
    $(this).hide();
});

//ADD CHECKLIST ITEMS ON POPUP WITH MATCH EXISTING
$(document).on('keyup', '.add-checklist-items-input', function (e) {
    if (e.keyCode == 13) {
        
       
        let checklist_id = $('#add_checklist_modal').attr('data-checklist_id');
      
        let countItems = $('.checklist-item-row').length;
        let index = countItems+1;
        let item_name = $(this).val();
        let exist_checklistsItems = [];
        let checklist_row_html = `<div class="row checklist-item-row" id="checklist-item-` + index + `" >
                            <div class="col-8">
                            <input type="checkbox" id="` + item_name + `" name="` + item_name + `" value="` + item_name + `" class="hide-only" readonly>
                            <label for="` + item_name + `">` + item_name + `</label>
                            </div>
                            <div class="col-4 text-right">
                            <i class="fa fa-trash checklist-item-delete-icon" data-id="` + item_name + `" id="` + item_name + `-` + checklist_id + `-` + index + `" ></i>
                          
                           </div>
                            <br>
                        </div>`;
        if ($('.checklist-item-row').length > 0) {
            $('.checklist-item-row').each(function (item) {
                let exist_name = $(this).find('label').text();
                exist_checklistsItems.push(exist_name);
            })
        }

        let matchedExistsChecklistitems = [];
        if (exist_checklistsItems.length > 0) {
            matchedExistsChecklistitems = exist_checklistsItems.filter(function (item) {
                return (item.indexOf(item_name) >= 0);
            });
        }

        if (matchedExistsChecklistitems.length > 0) {
            toastr["error"]("checklist Already exist");
            return false;
        } else {

            $('.global-checklist-section').append(checklist_row_html);
            $('.close-btn-checklist').addClass('default-hide');
            $('.add-checklist-items-input').hide();
            $('.add-item-global-checklist').show();
            $(this).val('')
        }

    }
});





/////////////////////  END ///////////////////////////////

//ASSIGNED MULIPLE TAGS TO MULTIPLE CHECKED INFULENCER
function assignedTagsToInfluencers(influencers_id) {

    let selected_global_tags = [];
    $('.shown_tags input[type="checkbox"]:checked').each(function () {
        selected_global_tags.push(this.name);
    });

    let existTagsByInfuencerId = getInfuExistTagsdetails.filter(function (item, i) {
        return (item.influencer_id == influencers_id);
    });

    if (existTagsByInfuencerId.length > 0) {

        const text = existTagsByInfuencerId[0].tags;
        const myArr = JSON.parse(text);
        if (myArr != null) {
            var inputTags = myArr.concat(selected_global_tags);
            let uniqueTags = [...new Set(inputTags)];
            var function_name = 'assignedTagsToInfluencers';
            updateTagsDetails(influencers_id, uniqueTags, function_name);
        }
    } else {
        var function_name = 'assignedTagsToInfluencers';
        updateTagsDetails(influencers_id, selected_global_tags, function_name);
    }
}

//ASSIGNED CHECKLIST TO MULTIPLE CHECKED INFULENCER
function assignedChecklistToInfluencers(influencers_id, checklist_id) {
    var get_checklistdataByInfluencerId = [];
    chrome.storage.local.get(['authToken', 'userId'], function (_ref) {

        $.ajax({
            url: _config.apiBaseUrl + "/get-objectives-info",
            type: "POST",
            data: { influencer_id: influencers_id },
            headers: {
                "Authorization": "Bearer " + _ref.authToken
            },
            success: function (res) {
                if (res.status && res.data != null) {
                    get_checklistdataByInfluencerId = JSON.parse(res.data.action_steps);
                    //console.log(get_checklistdataByInfluencerId);

                    let globalChecklistsDataItems = global_var_checklists.filter(function (item, i) {
                        return (item.id == checklist_id);
                    });

                    if (get_checklistdataByInfluencerId.length > 0) {
                        let globalSelectedChecklist_items = (globalChecklistsDataItems[0].checklist_items);
                        let globalSelectedChecklist_items_array = JSON.parse(globalSelectedChecklist_items);

                        if (globalSelectedChecklist_items_array != null) {
                            const inputChecklists = globalSelectedChecklist_items_array.concat(get_checklistdataByInfluencerId);
                            //console.log(inputChecklists);
                            var function_name = 'assignedChecklistToInfluencers';
                            updateObjectivesDetails(influencers_id, 'action_steps', inputChecklists, function_name);
                            //$('#selectinfluencerModal').modal('hide');
                        }
                    }
                }
            }
        });
    });
}


//GLOBAL TAGS SAVE 
function displayInfuencersOnPopup(influencers) {

    infulencer_htmls = '';
    //console.log(influencers);
    influencers.forEach(function (item) {
        infulencer_htmls += `<div class="row rows" influencer-id = "` + item.id + `">
          <div class="col-2 p-0 select_checklist">
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="` + item.id + `" name="` + item.ful_name + `" value="` + item.id + `">
                <label class="custom-control-label" for="` + item.id + `"></label>
              </div>
          </div>
          <div data-id="` + item.id + `" class="col-2 p-0">
             <img src="` + item.photo_uri + `" class="profile">
         </div>
         <div class="col-8 list pl-0">
           <h3 class="name">` + item.ful_name + `</h3>
         </div>            
        </div>`;
    });
    $('.add-influencers-data').html(infulencer_htmls);
}

// function for global settings
function loadAllGlobalTags() {

    chrome.storage.local.get(['get_global_tags'], function (_ref) {
        //console.log(_ref.get_global_tags);
        let data = [];
        if (_ref.get_global_tags != undefined && _ref.get_global_tags != "") {
            data = _ref.get_global_tags;
        }
        showAllGlobalTags(data)
    });
}

//APPEND ALL GLOBAL TAGS HTML ON GLOBAL SETTING SECTION 
function showAllGlobalTags(globalTags) {

    let allGlobalTagsHTML = '';
    //console.log(globalTags);

    if (globalTags.length > 0) {
        globalTags.forEach(function (item) {

            allGlobalTagsHTML += `<div class="row tag_rows" tag-id="` + item.id + `">
                                        <div class="col-1 check_list pr-0">
                                            <input type="checkbox" value="` + item.id + `" name="` + item.tags + `">
                                        </div>
                                        <div class="col-10 pl-0">
                                            <div class="col-12 p-0 shown_tags_sec" style="background:#05931c;">
                                                <h3>` + item.tags + `</h3>
                                            </div>
                                        </div>
                                        <div class="col-1 p-0 delete-icon">
                                            <i class="fa fa-trash tags-delete-icon" data-id="` + item.id + `"></i>
                                        </div>
                                    </div>`;
        });
    } else {
        allGlobalTagsHTML += `<div class="row tag_rows_blank"></div>`;
    }

    $('.shown_tags ').html(allGlobalTagsHTML);

}

// function for global settings
function loadAllChecklistTags() {
    chrome.storage.local.get(['get_global_checklists'], function (_ref) {
        global_var_checklists = _ref.get_global_checklists;
        let data = [];
        if (_ref.get_global_checklists != undefined && _ref.get_global_checklists != "") {
            data = _ref.get_global_checklists;
        }
        showAllGlobalChecklists(data)
    });
    //   chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
    //       $.ajax({
    //           url: _config.apiBaseUrl + "/get-global-checklists",
    //           type: "GET",
    //           headers: {
    //               "Authorization": "Bearer " + _ref.authToken
    //           },
    //           success: function(res) {
    //               if (res.status) {
    //                   // console.log(res);
    //                   global_var_checklists = res.checklist;
    //                   showAllGlobalChecklists(res.checklist)
    //               }
    //           },
    //           error: function(jqXHR, exception) {
    //               console.log("Request failed: " + exception);
    //           }
    //       });
    //   });
}

// SHOW ALL CHECKLIST 
function showAllGlobalChecklists(globalChecklist) {

    let allGlobalChecklistHTML = '';
    if (globalChecklist.length > 0) {
        globalChecklist.forEach(function (item) {

            allGlobalChecklistHTML += `<div class="row checklist_rows" checklist-id="` + item.id + `" id="checklist-id-` + item.id + `" >
                                <div class="col-10">
                                    <div class="col-12 p-0 shown_checklist_sec" style="background:#05931c;">
                                        <h3>` + item.checklist_title + `</h3>
                                    </div>
                                </div>
                                <div class="col-2 p-0 delete-icon links">
                                    <i class="fa fa-edit checklist-edit-icon" data-name="` + item.checklist_title + `" data-id="` + item.id + `" data-toggle="modal" data-target="#add_checklist_modal"></i>
                                    <i class="fa fa-trash checklist-delete-icon" data-id="` + item.id + `"></i>
                                    <i class="fa fa-user checklist-assign-icon" data-id="` + item.id + `"></i>
                                </div>
                            </div>`;
        });
    } else {
        allGlobalChecklistHTML += `<div class="row checklist_rows_blank"></div>`;
    }
    $('.shown-global-checklist').html(allGlobalChecklistHTML);
}



// function for global settings
function loadGlobalScripts() {
    chrome.storage.local.get(['get_global_scripts'], function (_ref) {

        let data = [];
        if (_ref.get_global_scripts != undefined && _ref.get_global_scripts != "") {
            data = _ref.get_global_scripts;
        }
        global_var_scripts = data;
        showGlobalScripts(data);
        var opt = ` <option value="-1">Select</option>`;
        global_var_scripts.forEach(function (item, index) {
            //console.log(item);
            //console.log(index);
            opt += ` <option value="` + index + `">` + item['title'] + `</option>`;
        });

        $(".select_script_dropdown").html(opt);

        $(".select_script_dropdown ").on('change', function () {
            // console.log(global_var_scripts)
            let selectedScriptIndex = $(this).val();
            // console.log(selectedScriptIndex);
            if (selectedScriptIndex >= 0) {
                ////  console.log(global_var_scripts[selectedScriptIndex]['content']);




                var code = global_var_scripts[selectedScriptIndex]['content'];
                var $temp = $("<textarea>");
                $("body").append($temp);
                $temp.val(code).select();
                document.execCommand("copy");
                $temp.remove();

                toastr["success"]("Content Copied!! ");


            }

        });
    });
    //   chrome.storage.local.get(['authToken', 'userId', 'lastScreen'], function(_ref) {
    //       $.ajax({
    //           url: _config.apiBaseUrl + "/get-global-scripts",
    //           type: "GET",
    //           headers: {
    //               "Authorization": "Bearer " + _ref.authToken
    //           },
    //           success: function(res) {
    //               if (res.status) {
    //                   global_var_scripts = res.scripts;
    //                   showGlobalScripts(res.scripts);



    //               }
    //           },
    //           error: function(jqXHR, exception) {
    //               console.log("Request failed: " + exception);
    //           }
    //       });
    //   });
}




// SHOW ALL CHECKLIST 
function showGlobalScripts(globalScripts) {

    let globalScriptsHTML = '';
    if (globalScripts.length > 0) {
        globalScripts.forEach(function (item) {

            globalScriptsHTML += `<div class="row script_rows" script-id="` + item.id + `">
                                <div class="col-10">
                                    <div class="col-12 p-0 shown_checklist_sec" style="background:#05931c;">
                                        <h3>` + item.title + `</h3>
                                    </div>
                                </div>
                                <div class="col-2 p-0 delete-icon links">
                                    <i class="fa fa-edit script-edit-icon" data-name="` + item.title + `" data-content="` + item.content + `" data-id="` + item.id + `" data-toggle="modal" data-target="#edit_manage_script_modal"></i>
                                    <i class="fa fa-trash script-delete-icon" data-id="` + item.id + `"></i>
                                </div>
                            </div>`;
        });
    } else {
        globalScriptsHTML += `<div class="row checklist_rows_blank"></div>`;
    }
    $('.shown-global-scripts').html(globalScriptsHTML);
}

function removeObjectWithId(arr, id) {
    const objWithIdIndex = arr?.findIndex((obj) => obj.id === id);
  
    if (objWithIdIndex > -1) {
      arr.splice(objWithIdIndex, 1);
    }
  
    return arr;
}