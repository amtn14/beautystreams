using Sabio.Web.Domain;
using Sabio.Web.Models;
using Sabio.Web.Models.Responses;
using Sabio.Web.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http; //used for 'httpContent'
using System.Web;
using System.Web.Http;
using System.IO;
using Sabio.Web.Services.Interfaces;
using Sabio.Web.Models.Requests;
using Sabio.Web.Classes.Medias.Tasks;
using Sabio.Web.Classes.Medias;
using System.Threading.Tasks;

namespace Sabio.Web.Controllers.Api
{
    [RoutePrefix("api/media")]
    public class MediaApiController : BaseApiController
    {
        private IMediaService _mediaService { get; set; }
        private IFileStorageService _fileStorageService { get; set; }
        private IUserService _userService { get; set; }

        public MediaApiController(IMediaService mediaService, IFileStorageService fileStorageService, IUserService userService)
        {
            _mediaService = mediaService;
            _fileStorageService = fileStorageService;
            _userService = userService;
        }       
		
        //------Parent(This updates the 'ParentId' to make sure the dropzone media gets appended the JsTree in the right spot):
        [Route("parent"), HttpPut]
        public HttpResponseMessage UpdateParentId(MediaParentRequest model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            bool returnedVal = _mediaService.UpdateParentId(model);

            ItemResponse<bool> MediaResponse = new ItemResponse<bool>();
            MediaResponse.Item = returnedVal;

            return Request.CreateResponse(HttpStatusCode.OK, MediaResponse);

        }//end of Parent
		
		
        //------SELECTBYID (grabbing from MediaBS):
        [Route("SelectMediaById/{mediaId:int}"), HttpGet]
        public HttpResponseMessage SelectById(int mediaId)
        {
            MediaAndTags getMediaAndTags = _mediaService.SelectMediasById(mediaId);
            ItemResponse<MediaAndTags> MediaResponse = new ItemResponse<MediaAndTags>();
            MediaResponse.Item = getMediaAndTags;
            return Request.CreateResponse(HttpStatusCode.OK, MediaResponse);
        }//end of select

        //Delete single media by media's ID:
        [Route("delete/{id:int}"), HttpPut]
        public HttpResponseMessage DeleteMediaById(int id)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            bool returnedVal = _mediaService.DeleteMediaById(id);

            ItemResponse<bool> MediaResponse = new ItemResponse<bool>();
            MediaResponse.Item = returnedVal;

            return Request.CreateResponse(HttpStatusCode.OK, MediaResponse);
        }//end of Parent

        [Route("insertTagsByMediaId"), HttpPost]
        public HttpResponseMessage InsertTagsByMediaId(MediaTagRequest model)
        {
            if (!ModelState.IsValid) {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            var returnedBool = _mediaService.InsertTagIdByMediaId(model);
            ItemResponse<bool> MediaResponse = new ItemResponse<bool>();
            MediaResponse.Item = returnedBool;
            return Request.CreateResponse(HttpStatusCode.OK, MediaResponse);
        }

        //------GETALL:
        [Route("list"), HttpGet]
        public HttpResponseMessage GetAllMedia()
        {
            List<Media> MediaList = _mediaService.GetAllMedia();

            ItemsResponse<Media> MediaResponse = new ItemsResponse<Media>();
            MediaResponse.Items = MediaList;

            return Request.CreateResponse(HttpStatusCode.OK, MediaResponse);
        }

    }
}
