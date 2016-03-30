using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Sabio.Web.Models.Requests
{
    public class MediaTagRequest
    {
        public List<int> mediaId { get; set; }
        public List<int> tagId { get; set; }
    }
}