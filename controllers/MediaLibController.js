//CONTROLLER for medLib + imgBank:
(function () {
    "use strict";
    angular.module(APPNAME).controller('ng4TreeController', Ng4TreeController);
    Ng4TreeController.$inject = ['$scope', '$baseController', '$mediaService', '$folderService', '$notificationsService', '$imageDetailsService', '$tagsService', '$location', 'filterFilter'];
    function Ng4TreeController($scope, $baseController, $mediaService, $folderService, $notificationsService, $imageDetailsService, $tagsService, $location, filterFilter) {
        // =============== Declare services + Setup for basic tree-related functions: ============= \\
        var vm = this;
        vm.$scope = $scope;
        vm.$mediaService = $mediaService;
        vm.$folderService = $folderService;
        vm.$notificationService = $notificationsService;
        vm.$imageDetailsService = $imageDetailsService;
        vm.$tagsService = $tagsService;
        vm.$location = $location;
        vm.notify = vm.$folderService.getNotifier($scope);

        $baseController.merge(vm, $baseController);

        //*success + error handler + functions
        vm.selectFoldersAndMediasByPidSuccess = _selectFoldersAndMediasByPidSuccess; //gets data to build tree
        vm.ajaxCallError = _ajaxCallError;                                           //main error call

        //*tree variables:
        vm.$scope.selectedNodes = [];      //tree supports multi-selection + keeps track of all selectedNodes (folders, medias and etc.)
        vm.$scope.expandedNodes = [];      //tree will keep track of all expandedNodes -- currrently just using this to close/clear out all expanded nodes in "onSuccess" functions
        vm.selectedNode;                   //basic details on the node -- node
        vm.selectedNodeDetails;            //info on the node (id, pid, name, etc.) -- node.tableData
        vm.selectedNodeId;                 //id of selected node -- node.id
        vm.selectedNodeType;               //type of the selected node (pic, folder, movie) --node.type
        vm.directChildrenMediaUnderSingleFolder; //contains all media directly under a folder -- gets value in nodeToggleHandler success function

        // =============== Route/ScrollToTop Variables + functions(applicable to iB + mL) ============= \\
        vm.setRoute = _setRoute;
        vm.link = null;

        function _setRoute(path) {
            $location.path(path);
        }

        function resetAddressUrl() {
            vm.link = '';
            vm.setRoute(vm.link);
            vm.selectedNodeId = null;
        }

        vm.scrollToTop = _scrollToTop;
        function _scrollToTop() {
            var targetOffset = $("#treeContainer").offset().top - 108;
            $("html, body").animate({
                scrollTop: targetOffset
            }, 550);
        }

        // =============== Intial Setup - imageBank or MedLib? ============= \\
        //checker to see if controller will be executing code for mL or iB -- initially set to false:
        vm.medLibCheck = false;
        vm.imgBankCheck = false;

        //funcion is triggered by the ng-init on index page of medLib + imgBank:
        vm.modeCheck = function (page) {
            switch (page) {
                case "medLib":
                    vm.medLibCheck = true;
                    vm.imgBankCheck = false;
                    vm.treeHeader = "Media Library";
                    vm.showMedLibHeading = true;
                    vm.showImageBankHeading = false;
                    vm.displayVideoDetailsBtn = true;    //display btn container for videoDetails - panel code is in MedLib_imgBankPanels.html
                    vm.pId = 0; //for ajax calls
                    loadTree();
                    break;
                case "imgBank":
                    vm.medLibCheck = false;
                    vm.imgBankCheck = true;
                    vm.treeHeader = "Image Bank";
                    vm.showImageBankHeading = true;
                    vm.showMedLibHeading = false;
                    vm.displayVideoDetailsBtn = false;
                    vm.pId = 1; //for ajax calls
                    loadTree();
                    break;
            }
        }
        // =============== MedLib setup============= \\
        //variables for mL forms + validation:
        vm.showErrors = false;
        vm.addFolder = null;
        vm.editImageForm = null;
        vm.editFolderForm = null;
        vm.mDetails = null;
        vm.fDetails = null;
        vm.eFolder = null;
        vm.eMedia = null;
        vm.aFolder = null;
        vm.tBdFolders = 0;
        vm.tBdMedias = 0;
        vm.mainFileTbD = null;
        vm.myDropzone = null;
        vm.mediaCreatedDate = null; //holds the date of media created
        Dropzone.autoDiscover = false;

        //ng-shows + ng-disabled:
        vm.hideAllPanels = _hideAllPanels;
        vm.wellDel = false;
        vm.mediaCount = false;
        vm.folderCount = false;
        vm.displayDzMsg = true;
        vm.medLibEditDisabled = true;
        vm.medLibDeleteDisabled = true;
        vm.folderSlugDisabled = true;
        vm.refreshMedSelDisabled = true;

        //functions + error/success handlers:
        vm.clickToEdit = _clickToEdit;                          //handles media + folders
        vm.submitFolderEdit = _submitFolderEdit;
        vm.submitMediaEdit = _submitMediaEdit;
        vm.updateMlMediaSuccess = _updateMlMediaSuccess;
        vm.updateFolderSuccess = _updateFolderSuccess;
        vm.addFolderSlug = _addFolderSlug;                      //handles the slug for add folder
        vm.editFolderSlug = _editFolderSlug;                    //handles the slug for edit folder

        vm.onClickAddFolder = _onClickAddFolder;
        vm.onClickAddMedia = _onClickAddMedia;
        vm.insertFolder = _insertFolder;
        vm.insertFolderSuccess = _insertFolderSuccess;
        vm.updateMediaPidSuccess = _updateMediaPidSuccess;  //helps dropzone append medias to the right folder

        vm.onClickDelete = _onClickDelete;
        vm.confirmDelete = _confirmDelete;              //handles media + folders            
        vm.singleMediaDeleteSuccess = _singleMediaDeleteSuccess;
        vm.mediaDeleteSuccess = _mediaDeleteSuccess;
        vm.confirmDeleteSuccess = _confirmDeleteSuccess;
        vm.getCountSuccess = _getCountSuccess;          //count media+folder recursively for delete feature
        vm.checkForSelectedMediaDupes = _checkForSelectedMediaDupes; //is called when user selects a media. checks to see if mediaId has already been pushed to gallery-list array

        //values for dropdown lists + other arrays:
        //--status dropdown -- active or not active
        vm.statusItems = [
                { label: 'Active', value: 'true' },
                { label: 'Not Active', value: 'false' }
        ];

        //--admin or not:
        vm.accessItems = [
                { 'label': 'Admin', 'value': 'admin' }
        ];

        //Cancel/Close Panel:
        vm.addFolderCancel = _addFolderCancel;
        vm.deleteCancel = _deleteCancel;
        vm.addMediaCancel = _addMediaCancel;
        vm.editFolderCancel = _editFolderCancel;
        vm.editMediaCancel = _editMediaCancel;
        vm.editVideoCancel = _editVideoCancel;
        vm.editPdFcancel = _editPdFcancel;
        vm.detailsFolderCancel = _detailsFolderCancel;
        vm.detailsMediaCancel = _detailsMediaCancel;
        vm.detailsVideoCancel = _detailsVideoCancel;
        vm.detailsPdFcancel = _detailsPdFcancel;

        // =============== imageBank setup============= \\
        // ===== Image Tagging =====
        vm.mediaWithTags = null     //container for a single media + tags associated with it. Using to send to the img tagging modal
        vm.showCheck = _showCheck;
        vm.showEditImageDetails = false;
        vm.showImageTagging = false;
        vm.currentImageDetails = null;

        // ===== On Clicks =====
        vm.onImageTaggingClick = _onImageTaggingClick;
        vm.onEditImageDetailsClick = _onEditImageDetailsClick;
        vm.imageTaggingCancel = _imageTaggingCancel;
        vm.editImageCancel = _editImageCancel;

        //declare imageBank functions:
        vm.selectImageBankCategoriesSuccess = _selectImageBankCategoriesSuccess;
        vm.selectImageDetailsByIdSuccess = _selectImageDetailsByIdSuccess;
        vm.selectMediaByIdSuccess = _selectMediaByIdSuccess;

        // ===== Videos ===== (Will need to update when we have video data)
        vm.videoId = null;
        vm.videoFileName = null;
        vm.videoCreated = null;
        vm.videoUsername = null;

        // =============== Popover + Media Selection Panel variables + functions(applicable to iB + mL) ============= \\
        //2 arrays - 1 to store selected media obj and 1 to store just the ID of those media obj in the array for selected media obj
        vm.selectedMediaObjects = []; //used to capture selected media nodes
        vm.selectedMediaIds = [];
        vm.showMedSelPanel = false; //media selection panel

        //handles the popover on the angularTree (popover on mouseenter):
        vm.currentNodeId = null;
        vm.validateNodeType = _validateNodeType;
        function _validateNodeType(node) {
            if (node.type == "pic") {
                vm.currentNodeId = node.id;
            } else {
                vm.currentNodeId = null;
            }
        }

        //will remove popover on ng-mouseleave
        vm.removePopover = _removePopover;
        function _removePopover() {
            vm.currentNodeId = null;
        }

        //resets media selection panel AND/OR refresh/clear all user's selection on tree (DOES NOT RE-LOAD TREE--call loadTree(); for that function):
        vm.refreshTreeAndClearMedSelection = _refreshTreeAndClearMedSelection;
        function _refreshTreeAndClearMedSelection() {
            vm.selectedMediaObjects = [];
            vm.selectedMediaIds = [];
            vm.$scope.selectedNodes = [];
            vm.selectedNode = null;
            vm.selectedNodeId = null;
            if (vm.showMedSelPanel == true || vm.selectedMediaObjects.length == 0) {    //if medSel panel is showing, hide. After refreshing/clearing medSel panel, disable refresh btn
                vm.showMedSelPanel = false;
                vm.refreshMedSelDisabled = true;
                vm.medLibEditDisabled = true;
                vm.medLibDeleteDisabled = true;
            }
        }

        //check the media selection array to see if it has a length and updates the buttons/panels accordingly:
        vm.checkLengthOfMedSel = _checkLengthOfMedSel;
        function _checkLengthOfMedSel() {
            if (vm.medLibCheck == true) {
                if (vm.selectedMediaObjects.length > 0) {
                    vm.showMedSelPanel = true;
                    vm.refreshMedSelDisabled = false;
                } else {
                    vm.showMedSelPanel = false;
                    vm.refreshMedSelDisabled = true;
                    vm.medLibEditDisabled = true;
                    vm.medLibDeleteDisabled = true;
                    vm.hideAllPanels();
                    resetAddressUrl();
                }
            } else if (vm.imgBankCheck == true) {
                if (vm.selectedMediaObjects.length == 1) {
                    vm.showMedSelPanel = false;
                    vm.mDetails = vm.selectedMediaObjects[0];
                    vm.displayMediaDetails = true;
                    vm.refreshMedSelDisabled = true;
                } else if (vm.selectedMediaObjects.length > 1) {
                    vm.displayMediaDetails = false;
                    vm.showMedSelPanel = true;
                    vm.refreshMedSelDisabled = false;
                } else {
                    vm.showMedSelPanel = false;
                    vm.refreshMedSelDisabled = true;
                    vm.hideAllPanels();
                    resetAddressUrl();
                }
            }
        }

        //==========TREE-NG CODE:
        vm.hideAllPanels(); //set all ng-show panels to false

        function loadTree() {
            //on click, get all folders + media with parent id with currentFolderId
            vm.$folderService.selectByParentFolderId(vm.pId, vm.selectFoldersAndMediasByPidSuccess, vm.ajaxCallError);
        };

        vm.$scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            multiSelection: true
        }

        vm.multipleSelect = _multipleSelect;
        vm.lastSelectedNode;

        function _multipleSelect(keyEvent) {
            if (vm.selectedNodeType == "pic" && keyEvent.shiftKey == false) {
                //get first node - previous selected node:
                vm.lastSelectedNode = vm.selectedNode;
            } else if (vm.selectedNodeType == "pic" && keyEvent.shiftKey == true) {
                console.log("PRESSING SHIFT");
                var find = vm.directChildrenMediaUnderSingleFolder.indexOf(vm.lastSelectedNode);
                var i = find + 1;
                for (i; i < vm.directChildrenMediaUnderSingleFolder.length; i++) {
                    var tempMediaObj = vm.directChildrenMediaUnderSingleFolder[i];
                    vm.$scope.selectedNodes.push(tempMediaObj);
                    vm.checkForSelectedMediaDupes(tempMediaObj, true);
                    if (vm.directChildrenMediaUnderSingleFolder[i].id == vm.selectedNodeId) {
                        break;
                    }
                }
                //console.log(vm.$scope.selectedNodes);
            }
        }

        vm.$scope.nodeSelectionHandler = function (sel, selected) {
            vm.selectedNode = sel;
            vm.selectedNodeDetails = sel.tableData;
            vm.selectedNodeId = sel.id;
            vm.selectedNodeType = sel.type;
            vm.mediaCreatedDate = sel.dateCreated;
            console.log("you selected a node:", vm.selectedNode, vm.selectedNodeDetails, selected);

            console.log("SELECTED NODES ARRAY:", vm.$scope.selectedNodes);

            //enable edit + delete on main panel-heading for medLib:
            if (vm.medLibCheck == true && selected == true) {
                vm.medLibEditDisabled = false;
                vm.medLibDeleteDisabled = false;
            }

            if (selected == false && vm.selectedNodeType == "pic") {
                vm.checkForSelectedMediaDupes(vm.selectedNode, selected); //checks to see if the media node has been selected already--removes from media selection + disable buttons
            } else if (selected == false && vm.selectedNodeType == "folder") {
                vm.displayFolderDetails = false;
            } else if (selected == true) {
                switch (sel.type) {
                    case "folder":
                        console.log("you clicked on a folder", sel);
                        vm.link = '/folderDetails/' + sel.id;
                        vm.setRoute(vm.link);
                        //vm.hideAllPanels();
                        vm.displayFolderDetails = true;
                        vm.scrollToTop();
                        vm.fDetails = vm.eFolder = vm.selectedNodeDetails; //setting value for the details and edit panel for folders
                        vm.fDetails.fid = sel.id;
                        if (vm.medLibCheck == true) {
                            vm.$folderService.countFolderAndMediaByFid(vm.selectedNodeId, vm.getCountSuccess, vm.ajaxCallError);
                        }
                        break;
                    case "pic":
                        vm.selectedNodeId = sel.tableData.mediaId;
                        vm.tBdMedias = 1;
                        console.log("You clicked on an image", vm.selectedNode);
                        vm.link = '/imageDetails/' + vm.selectedNodeId;
                        vm.setRoute(vm.link);
                        vm.hideAllPanels();
                        vm.scrollToTop();
                        vm.mDetails = vm.selectedNodeDetails;
                        vm.checkForSelectedMediaDupes(vm.selectedNode, selected); //checks to see if the media node has been selected already
                        //vm.eMedia = vm.selectedNode;
                        //console.log(vm.mDetails.mediaFullUrl, vm.mDetails);
                        //for (var i = 0; i < vm.statusItems.length; i++) {
                        //    if (vm.statusItems[i].value == vm.eMedia.mediaStatus.value) {
                        //        vm.eMedia.mediaStatus = vm.statusItems[i];
                        //        break;
                        //    }
                        //}
                        //console.log("before defining", vm.eMedia, vm.eMedia.mediaStatus);

                        //if (vm.selectedNode.mediaStatus.value == true) {
                        //    vm.eMedia.mediaStatus = vm.statusItems[0];

                        //} else {
                        //    vm.eMedia.mediaStatus = vm.statusItems[1];
                        //}
                        //vm.eMedia.mediaStatus = (vm.selectedNode.mediaStatus.label == 'Active') ? vm.statusItems[0] : vm.statusItems[1];
                        //console.log("after defining", vm.eMedia, vm.eMedia.mediaStatus);
                        if (vm.selectedNodeId !== null) {
                            vm.$mediaService.selectById(vm.selectedNodeId, vm.selectMediaByIdSuccess, vm.ajaxCallError);
                        }
                        if (vm.imgBankCheck == true) {
                            vm.currentImageDetails = null;
                            vm.$imageDetailsService.selectById(vm.selectImageDetailsByIdSuccess, vm.ajaxCallError, vm.selectedNodeId);
                        }
                        break;
                    case "movie": //will need to update when we get video data to bring in and work with:
                        vm.link = '/videoDetails/' + vm.selectedNodeId;
                        vm.setRoute(vm.link);
                        vm.hideAllPanels();
                        vm.displayVideoDetails = true;
                        vm.scrollToTop();
                        vm.videoId = vm.selectedNodeDetails.data.id;
                        vm.videoFileName = vm.selectedNodeDetails.text;
                        vm.videoCreated = vm.selectedNodeDetails.data.created.slice(0, 10);
                        vm.videoUsername = vm.selectedNodeDetails.data.userId;
                        break;
                }
            }
        };

        vm.$scope.nodeToggleHandler = function (sel, expanded) {
            vm.selectedNode = sel;
            vm.selectedNodeId = sel.id;
            if (expanded == true) {
                //on click, get all folders + media with parent id with currentFolderId -- no need to get it, if user closes folder:
                vm.$folderService.selectByParentFolderId(vm.selectedNodeId, vm.selectFoldersAndMediasByPidSuccess, vm.ajaxCallError);
            }
        };

        function _selectFoldersAndMediasByPidSuccess(data, status, settings) {
            console.log("selectFoldersAndMediasByPidSuccess getting folders", data.item.folderInfo);
            //getting folders:
            var tempObjArray = [];
            if (data.item.folderInfo != null) {
                for (var item in data.item.folderInfo) {
                    var tempObj = {};
                    tempObj.text = data.item.folderInfo[item].folderName;
                    tempObj.id = data.item.folderInfo[item].folderId;
                    tempObj.pId = data.item.folderInfo[item].parentFolderId;
                    tempObj.children = [{}];
                    tempObj.folderOrFile = true;
                    tempObj.type = "folder";
                    tempObj.tableData = data.item.folderInfo[item];
                    tempObjArray.push(tempObj);
                }
            }

            //getting medias:
            console.log("selectFoldersAndMediasByPidSuccess getting media", data.item.mediaInfo);
            if (data.item.mediaInfo != null) {
                for (var item in data.item.mediaInfo) {
                    var tempObj = {};
                    tempObj.text = data.item.mediaInfo[item].mediaTitle;
                    tempObj.children = null;
                    tempObj.type = "pic";
                    tempObj.dateCreated = data.item.mediaInfo[item].mediaCreated.slice(0, 10);
                    tempObj.pId = data.item.mediaInfo[item].mediaParentId;
                    tempObj.id = data.item.mediaInfo[item].mediaId;
                    tempObj.tableData = data.item.mediaInfo[item];
                    tempObjArray.push(tempObj);
                }
                //using this array for the multiple select feature:
                vm.directChildrenMediaUnderSingleFolder = tempObjArray;
            }

            // For some reason, vm.selectedNode.children + tempObjArray cannot be empty/null. Current workaround:
            if (!data.item.mediaInfo && !data.item.folderInfo) {
                var tempObj = {};
                tempObj.text = "(empty)";
                tempObjArray.push(tempObj);
            }

            vm.notify(function () { //if there is not a node selected, or pId of the selectedNode = 0 then these will be root files
                if (!vm.selectedNode || vm.selectedNode.pid == 0) {
                    vm.$scope.dataForTheTree = tempObjArray;
                } else {
                    vm.selectedNode.children = tempObjArray;
                }
            });
        }

        //checks if media has been selected/pushed into the array for the media selection panel:
        function _checkForSelectedMediaDupes(selectedNode, selected) {
            console.log("before checking dupes:", vm.selectedMediaObjects, vm.selectedMediaIds);
            if (selected == true) {               //user selected media - filtering dupes + pushing to image to array
                var returnedIndex = vm.selectedMediaIds.indexOf(selectedNode.id);

                if (returnedIndex == -1) {
                    vm.selectedMediaObjects.push(selectedNode.tableData);
                    vm.selectedMediaIds.push(selectedNode.id);
                }
            } else if (selected == false) {     //user de-selected media - removing image from array:
                var returnedIndexForMid = vm.selectedMediaIds.indexOf(selectedNode.id);
                vm.selectedMediaIds.splice(returnedIndexForMid, 1);

                var indexToCheckSelectedNodesArray = vm.$scope.selectedNodes.indexOf(selectedNode);     //checks + ensures that right nodes are selected/de-selected(bolded or not) as user interacts with the tree
                if (indexToCheckSelectedNodesArray != -1) {
                    vm.$scope.selectedNodes.splice(indexToCheckSelectedNodesArray, 1);
                }

                var returnedIndexForSelectedNodes = vm.selectedMediaObjects.indexOf(selectedNode.tableData);
                vm.selectedMediaObjects.splice(returnedIndexForSelectedNodes, 1);
            }
            console.log("after checking dupes:", vm.selectedMediaObjects, vm.selectedMediaIds);

            //if user selects a node again to DESELECT it on the mediaLib page, code will remove the media first (code above), then set node to "null":
            if (vm.medLibCheck == true && selected == false) {
                vm.selectedNode = null;         //these values help append new folders + media to the correct spot in the tree
                vm.selectedNodeId = null;
                resetAddressUrl();
            }
            //determines whether to show the media selection panel based on length of vm.selectedMediaObjects array:
            vm.checkLengthOfMedSel();
        }

        //successHandler for count:
        function _getCountSuccess(data) {
            console.log("get count success", data);
            vm.tBdFolders = data.item.folderCount;
            vm.tBdMedias = data.item.mediaCount;
        };

        //main ajax error handler:
        function _ajaxCallError(ajax, status, errorThrown) {
            console.log("error: ", ajax, status, errorThrown);
        };

        //==========MEDIA-LIBRARY CODE:
        //hide all panels:
        function _hideAllPanels() {
            //medLib:
            vm.displayMediaDetails = false;
            vm.displayMediaEdits = false;
            vm.displayMediaAdd = false;
            vm.displayFolderDetails = false;
            vm.displayFolderEdits = false;
            vm.displayFolderAdd = false;
            vm.displayDeletePanel = false;
            vm.displayVideoDetails = false;
            vm.showMedSelPanel = false;
            //imageBank:
            vm.showErrors = false;
            vm.showCheck(null);
            vm.showEditImageDetails = false;
            vm.showImageTagging = false;
        }

        //cancel+close panels functions(will need to come back and clean this up --condense + combine code):
        function _addFolderCancel() {
            vm.displayFolderAdd = false;
            vm.aFolder = null; //resets the form
            resetAddressUrl();
        }

        function _deleteCancel() {
            vm.displayDeletePanel = false;
            resetAddressUrl();
        }

        function _addMediaCancel() {
            vm.displayMediaAdd = false;
            resetAddressUrl();
        }

        function _editFolderCancel() {
            vm.displayFolderEdits = false;
            vm.displayFolderDetails = true;
            vm.eFolder = null; //resets the form
            resetAddressUrl();
        }

        function _editMediaCancel() {
            vm.displayMediaEdits = false;
            resetAddressUrl();
            //reset arrays on cancel:
            vm.refreshTreeAndClearMedSelection();
            resetAddressUrl();
        }

        function _editVideoCancel() {
            vm.displayVideoEdits = false;
            resetAddressUrl();
        }

        function _editPdFcancel() {
            vm.displayPdFedits = false;
            resetAddressUrl();
        }

        function _detailsFolderCancel() {
            vm.displayFolderDetails = false;
            //vm.refreshTreeAndClearMedSelection();
            //vm.$scope.expandedNodes = [];
            resetAddressUrl();
        }

        function _detailsMediaCancel() {
            vm.displayMediaDetails = false;
            vm.currentImageDetails = null;
            //reset arrays on cancel:
            vm.refreshTreeAndClearMedSelection();
            resetAddressUrl();
        }

        function _detailsVideoCancel() {
            vm.displayVideoDetails = false;
            resetAddressUrl();
        }

        function _detailsPdFcancel() {
            vm.displayPdFdetails = false;
            resetAddressUrl();
        }

        //***SUBMIT + UPDATE/EDIT functions (folders + medias):
        function _onClickAddMedia() {
            console.log(vm.selectedNodeId);
            vm.hideAllPanels();
            vm.displayMediaAdd = true;
        }

        function _onClickAddFolder() {
            console.log(vm.selectedNodeId);
            vm.hideAllPanels();
            vm.displayFolderAdd = true;
        }

        //slug code:
        function _addFolderSlug() {
            if (vm.aFolder.FolderName == null) {
                //do nothing
            }
            else {
                var slug = vm.aFolder.FolderName.replace(/\W+/g, '-').toLowerCase();
                console.log(slug);
                vm.aFolder.slug = slug;
            }
        }

        function _clickToEdit() {
            if (vm.selectedNode == null) {
                vm.$notificationService.warning("Please select a file to edit!");
            } else if (vm.selectedNode && vm.selectedNodeType == "folder") {
                vm.hideAllPanels();
                vm.displayFolderEdits = true;
            } else if (vm.selectedNode && vm.selectedNodeType == "pic") {
                vm.hideAllPanels();
                vm.displayMediaEdits = true;
            }
            console.log("found post with id:" + vm.selectedNodeId);
        }

        //slug code:
        function _editFolderSlug() {
            if (vm.eFolder.folderName == null) {
                //do nothing
            }
            else {
                var slug = vm.eFolder.folderName.replace(/\W+/g, '-').toLowerCase();
                console.log(slug);
                vm.eFolder.slug = slug;
            }
        }

        function _submitMediaEdit() {
            vm.showErrors = true;
            if (vm.editImageForm.$valid) {
                console.log(vm.eMedia);
                vm.$mediaService.updateBS(vm.selectedNodeId, vm.eMedia, vm.updateMlMediaSuccess, vm.ajaxCallError)
            } else {
                vm.$notificationService.error("Please fill out all required fields.");
            }
        }

        function _updateMlMediaSuccess(data) {
            vm.$notificationService.success("Successfully saved your changes!");
            console.log("successfully updated media", data);
            vm.showErrors = false;
            vm.displayMediaEdits = false;
            loadTree(); //refresh tree to show most recent changes
            vm.refreshTreeAndClearMedSelection();
            vm.$scope.expandedNodes = [];
        }

        function _submitFolderEdit() {
            vm.showErrors = true;
            console.log("about to update post with id", vm.selectedNodeId);
            if (vm.editFolderForm.$valid) {
                vm.$folderService.update(vm.selectedNodeId, vm.eFolder, vm.updateFolderSuccess, vm.ajaxCallError);
            } else {
                vm.$notificationService.error("Please fill out all required fields.");
            }
        }

        function _updateFolderSuccess(data) {
            vm.$notificationService.success("Successfully saved your changes!");
            console.log("successfully updated folder", data);
            vm.showErrors = false;
            vm.displayFolderEdits = false;
            vm.displayFolderDetails = true;
            loadTree(); //refresh tree to show most recent changes
            vm.refreshTreeAndClearMedSelection();
            vm.$scope.expandedNodes = [];
        }

        function _insertFolder() {
            vm.showErrors = true;
            $("#folderNameAdd").on("keyup", function () {
                vm.slug($(this), $("#folderSlugAdd"));
            });

            console.log("About to insert a folder");
            if (vm.addFolder.$valid) {
                //adding in the parentID before sending it through with the ajax call:
                if (vm.selectedNodeId !== null && vm.selectedNodeType == 'folder') {
                    vm.aFolder.ParentFolderId = vm.selectedNodeId;
                } else if (vm.selectedNodeId !== null && vm.selectedNodeType == 'pic') {
                    vm.aFolder.ParentFolderId = vm.selectedNodeDetails.mediaParentId; //if the user clicked on an image nested inside a folder, set parendId of new image to the pId of selected pic
                } else if (vm.selecteNodeId == null) {
                    vm.aFolder.ParentFolderId = 0;
                }
                console.log(vm.aFolder);
                vm.showErrors = false;
                vm.$folderService.insert(vm.aFolder, vm.insertFolderSuccess, vm.ajaxCallError);
            } else {
                vm.$notificationService.error("Form is not valid.");
            }
        }

        function _insertFolderSuccess(data) {
            vm.$notificationService.success("Saved your new folder!");
            loadTree(); //refresh tree to show most recent changes
            console.log("successfully added in the new folder", data);
            vm.displayFolderAdd = false;
            vm.refreshTreeAndClearMedSelection();
            vm.$scope.expandedNodes = [];
            vm.aFolder = null; //resets the form
            resetAddressUrl();
        }

        //for the dropzone, on success:
        function _updateMediaPidSuccess() {
            vm.$notificationService.success("Saved your new media!");
            loadTree(); //refresh tree to show most recent changes
        }

        //***DROPZONE:
        vm.myDropzone = {
            'options': {
                // passed into the Dropzone constructor
                'url': '/api/media/create/1/0',
                'autoProcessQueue': true,
                'parallelUploads': 1,
                'maxFiles': 1
            },
            'eventHandlers': {
                'addedfile': function () {
                    vm.displayDzMsg = false;
                },
                'sending': function (file, xhr, formData) {
                },
                'success': function (file, response) {
                    console.log(response.item);
                    vm.mediaId = response.item;
                    vm.myDropzone.removeAllFiles();
                    vm.displayDzMsg = true;

                    //updating parentId:
                    var parentId;
                    if (vm.selectedNodeId == null) {
                        parentId = 0;
                    } else if (vm.selectedNodeId !== null && vm.selectedNodeType == 'pic') {
                        parentId = vm.selectedNode.pid; //if the user clicked on an image nested inside a folder, set parendId of new image to the pId of selected pic
                    } else if (vm.selecteNodeId !== null && vm.selectedNodeType == 'folder') {
                        parentId = vm.selectedNodeId;
                    }
                    console.log(vm.selectedNodeId, parentId, vm.mediaId);
                    vm.$mediaService.updateParentId(vm.mediaId, parentId, vm.updateMediaPidSuccess, vm.ajaxCallError);
                },
                'error': function (file, errorMessage) {
                    console.log("Something went wrong. Please refresh and try again.", errorMessage);
                },
                'maxfilesexceeded': function (file, response) {
                    console.log("Limit 1 media file.", response);
                }
            }
        }

        //zipping and downloading media files:
        vm.clickToDownloadZip = _clickToDownloadZip;
        function _clickToDownloadZip() {
            var startingString = "/api/folders/downloadMediaZip?";
            var first = "mediaIds=";
            var add = "&mediaIds=";

            for (var i = 0; i < vm.selectedMediaIds.length; i++) {
                if (i == 0) {
                    var stringConcat = first + vm.selectedMediaIds[i];
                    startingString += stringConcat;
                } else {
                    stringConcat = add + vm.selectedMediaIds[i];
                    startingString += stringConcat;
                }
            }
            window.open(startingString);
        }

        //zip and download a selected folder (folders + media -- same structure/hierarchy as in the tree):
        vm.clickToDownloadFolder = _clickToDownloadFolder;
        function _clickToDownloadFolder() {
            var startingString = "/api/folders/download/";
            var stringConcat = startingString + vm.selectedNodeId;
            window.open(stringConcat);
        }

        //***DELETE functions (folders + medias):
        function _onClickDelete() {
            if (vm.selectedNode == null) {
                vm.$notificationService.warning("Please select a folder or media before proceeding");
            } else {
                vm.hideAllPanels();
                if (vm.selectedNodeType == 'folder') {
                    vm.displayFolderDetails = true;
                    vm.mainFileTbD = vm.selectedNodeDetails.folderName;
                    vm.wellDel = true;
                    vm.folderCount = true;
                    if (vm.tBdMedias > 0) {
                        vm.mediaCount = true;
                    }
                    else {
                        vm.mediaCount = false;
                    }
                    vm.displayDeletePanel = true;
                } else if (vm.selectedNodeType == 'pic') {
                    vm.displayMediaDetails = true;
                    vm.mainFileTbD = vm.selectedNodeDetails.mediaTitle;
                    vm.wellDel = true;
                    vm.folderCount = false;
                    vm.mediaCount = true;
                    vm.displayDeletePanel = true;
                }
            }
        }

        function _confirmDelete() {
            //add in ajax call for folders + media;
            if (vm.selectedNodeType == 'folder') {
                vm.$folderService.deleteMediaByFolderId(vm.selectedNodeId, vm.mediaDeleteSuccess, vm.ajaxCallError);
            } else if (vm.selectedNodeType == 'pic') {
                //grabbing the selectedNodeId  to "delete" the media:
                vm.$mediaService.deleteMediaById(vm.selectedNodeId, vm.singleMediaDeleteSuccess, vm.ajaxCallError);
            }
        }

        function _singleMediaDeleteSuccess(data) {
            vm.$notificationService.success("Successfully deleted selected media.");
            loadTree(); //equivalent to "refresh tree" -- get all folders + media with parentId = 0
            console.log("Successfully deleted media", data);
            vm.hideAllPanels();
            vm.refreshTreeAndClearMedSelection();
            vm.$scope.expandedNodes = [];
            //reset address url:
            vm.link = null;
            vm.setRoute(vm.link);
        }

        function _mediaDeleteSuccess(data) {
            console.log("Successfully deleted media inside the selected folder");
            vm.$folderService.deleteByIdPlusDescendants(vm.selectedNodeId, vm.confirmDeleteSuccess, vm.ajaxCallError);
        }

        function _confirmDeleteSuccess(data) {
            vm.$notificationService.success("Successfully deleted!");
            loadTree(); //equivalent to "refresh tree" -- get all folders + media with parentId = 0
            console.log("Successfully deleted folders", data);
            vm.tBdFolders = null;
            vm.tBdMedias = null;
            vm.wellDelFolder = false;
            vm.wellDelMedia = false;
            vm.hideAllPanels();
            vm.refreshTreeAndClearMedSelection();
            vm.$scope.expandedNodes = [];
            //reset address url:
            vm.link = null;
            vm.setRoute(vm.link);
        }
        //==========IMAGE-BANK CODE:
        //***IB Functions:
        //used in media details panel...if input field doesn't have a value, do not ng-show input field:
        function _showCheck(input) {
            if (vm.imgBankCheck == true) {
                //console.log("input", input);
                if (input != null) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        //get imgBank main categories to send to tagging panel (diff controller is in charge of that panel):
        vm.$tagsService.selectImageBankMainCategories(vm.selectImageBankCategoriesSuccess, vm.ajaxCallError);

        //buttons(2) that open imgBank panels (tagging + edit):
        function _onImageTaggingClick() {
            vm.link = "/imageTagging/" + vm.selectedNodeId;
            vm.setRoute(vm.link);
            var dataForImgTagging = {
                imageBankCategories: vm.imageBankCategories,
                selectedMediaObj: vm.selectedMediaObjects,
                selectedMediaIds: vm.selectedMediaIds,
                singleMediaWithTags: vm.mediaWithTags
            };
            vm.$systemEventService.broadcast("imgTagData", dataForImgTagging);   //(name of the event, data obj we're sending) -- passing data to ImageTagController
            vm.hideAllPanels();
            vm.showImageTagging = true;
        }

        //success event handler listener (for when user clicks submit on img tagging panel AND img edit/details panel):
        vm.$systemEventService.listen("imgTagInsertAndEditSuccess", _onImgBankSuccess);

        function _onImgBankSuccess(event, payload) {
            vm.$notificationService.success("Successfully updated");
            vm.hideAllPanels();         
            //on success of the edit media details panel, bring back up the details panel for user to view updated changes
            console.log(payload[1], payload[1].imageDetailsCheck);
            if (payload[1].imageDetailsCheck == true) {
                vm.displayMediaDetails = true;
            } else {
                //loadTree();
                //reset and clear the mediaSelection panel:
                vm.refreshTreeAndClearMedSelection();
                vm.$scope.expandedNodes = [];
                resetAddressUrl();
            }
        }

        function _onEditImageDetailsClick() {
            vm.link = "/editImageDetails/" + vm.selectedNodeId;
            vm.setRoute(vm.link);
            var dataForImgEditting = {
                mDetails: vm.mDetails,
                currentImageDetails: vm.currentImageDetails
            }
            vm.$systemEventService.broadcast("imgEditData", dataForImgEditting);   //(name of the event, data obj we're sending) -- passing data to ImgDetailsController
            vm.hideAllPanels();
            vm.showEditImageDetails = true;
        }

        //***CLOSE + CANCEL functions for imageBank:
        function _imageTaggingCancel() {
            vm.showImageTagging = false;
            resetAddressUrl();
            //reset and clear the mediaSelection panel:
            if (vm.selectedMediaIds.length == 1) {
                vm.displayMediaDetails = true;
            } else {
                vm.showMedSelPanel = true;
            }
        }

        function _editImageCancel() {
            vm.showEditImageDetails = false;
            vm.displayMediaDetails = true;
            resetAddressUrl();
        }

        ///***SUCCESS + ERROR handlers:
        function _selectMediaByIdSuccess(data, status, settings) {
            vm.mediaWithTags = data.item;
            vm.eMedia = null;
            vm.notify(function () {
                console.log("select media by id success", data);
                vm.eMedia = data.item.media;
            });
        }

        function _selectImageBankCategoriesSuccess(data, status, settings) {
            //console.log("select image bank categories success", data.items);
            vm.notify(function () {
                vm.imageBankCategories = data.items;
            });
        }

        function _selectImageDetailsByIdSuccess(data, status, settings) {
            //console.log("select image details: ", data);
            if (data.items == null) {
                //console.log("data items DNE");
                vm.currentImageDetails = null;
            } else {
                //console.log("data items exist");
                vm.notify(function () {
                    console.log("select image details by success ", data.items[0]);
                    vm.currentImageDetails = null;
                    var temp = data.items[0];
                    if (data.items[0].liveDate == "0001-01-01T00:00:00") {
                        temp.liveDate = null;
                    } else {
                        var tempDate = temp.liveDate;
                        temp.liveDate = new Date(tempDate);
                        (temp.liveDate).setMinutes((temp.liveDate).getMinutes() + ((temp.liveDate).getTimezoneOffset()));
                    }
                    vm.currentImageDetails = temp;
                });
            }
        }
    }
})();        //end of controller + invoking function