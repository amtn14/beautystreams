using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Sabio.Web.Models
{
    public class MediaRequest
    {
        public int MediaId { get; set; }
        public int MediaParentId { get; set; }
        [Required]
        public string MediaTitle { get; set; }
        public string MediaFileName { get; set; }
        public string MediaFileType { get; set; }
        public int MediaFileSize { get; set; }
        public int MediaType { get; set; }
        public DateTime MediaCreated { get; set; }
        public string MediaUserId { get; set; }
        public bool MediaStatus { get; set; }
        public string MediaDescription { get; set; }
        public int SourceId { get; set; }
        public bool Deleted { get; set; }
    }
}