if (!sabio.services.media)
    sabio.services.media = {};

//--------------------"UPDATEPARENTID" AJAX CALL --Currently being used to append dropzone media files to the right spot (updated to MEDIABS):
sabio.services.media.updateParentId = function (id, parentId, onSuccess, onError) {

    var url = "/api/media/parent";
    var settings = {
        cache: false
        , contentType: "application/x-www-form-urlencoded; charset=UTF-8"
        , data: { 
            MediaId: id,
            MediaParentId: parentId
        }
        , dataType: "json"
        , success: onSuccess
        , error: onError
        , type: "PUT"
    };
    $.ajax(url, settings);
}

//--------------------"SELECTBYID" AJAX CALL:
sabio.services.media.selectById = function (mediaId, onSuccess, onError) {
    var url = "/api/media/SelectMediaById/" + mediaId;
    var settings = {
        cache: false
        , contentType: "application/x-www-form-urlencoded; charset=UTF-8"
        , dataType: "json"
        , success: onSuccess
        , error: onError
        , type: "GET"
    };
    $.ajax(url, settings);
}

//--------------------"DELETE" AJAX CALL (MediaBS):
sabio.services.media.deleteMediaById = function (id, onSuccess, onError) {

    var url = "/api/media/delete/" + id;
    var settings = {
        cache: false
        , contentType: "application/x-www-form-urlencoded; charset=UTF-8"
        , dataType: "json"
        , success: onSuccess
        , error: onError
        , type: "PUT"
    };
    $.ajax(url, settings);
}

//------------------"GETALL" AJAX CALL:
sabio.services.media.getAll = function (onSuccess, onError) {
    var url = "/api/media/list";
    var settings = {
        cache: false
        , contentType: "application/x-www-form-urlencoded; charset=UTF-8"
        , data: null 
        , dataType: "json"
        , success: onSuccess
        , error: onError
        , type: "GET"
    };
    $.ajax(url, settings);
}

//--insert Tags to Media by MediaId:
sabio.services.media.insertTagsByMediaId = function (myData, onSuccess, onError) {
    var url = "/api/media/insertTagsByMediaId";
    var settings = {
        cache: false
        , contentType: "application/json"
        , data: JSON.stringify(myData)
        , dataType: "json"
        , success: onSuccess
        , error: onError
        , type: "POST"
    };
    $.ajax(url, settings);
}
