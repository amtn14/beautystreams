using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Sabio.Web.Controllers
{
    [RoutePrefix("media-library")]
    public class MediaLibraryController : BaseController
    {
        // GET: MediaLibrary
        [Route]
        public ActionResult Index()
        {
            return View("IndexNg4");
        }      

        public ActionResult IndexMediaZipTest()
        {
            return View();
        }        
    }
}