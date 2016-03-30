using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using Sabio.Data;
using System.Data.SqlClient;
using Sabio.Web.Models;
using Sabio.Web.Domain;
using Sabio.Web.Services.Interfaces;
using Sabio.Web.Models.Requests;
using System.IO.Compression;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace Sabio.Web.Services
{
    public class MediaService : BaseService, IMediaService
    {
        //updated so that its updating parentId from medias from mediaBS--can use to update or delete a single media
        public bool UpdateParentId(MediaParentRequest model)
        {
            bool updateStatus = true;

            //make connection to DB + Stored procedure:
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.MediaBS_UpdateByParentId"
            , inputParamMapper: delegate (SqlParameterCollection paramCollection)
            {
                //packing up the parameter suitcase to ship to DB:
                paramCollection.AddWithValue("@Id", model.MediaId);
                paramCollection.AddWithValue("@ParentId", model.MediaParentId);
            }
            );
            return updateStatus;
        }

        public MediaAndTags SelectMediasById(int mediaId)
        {
            MediaAndTags x = new MediaAndTags();
            List<Tag> tList = null;
            {
            DataProvider.ExecuteCmd(GetConnection, "dbo.MediaBS_SelectById",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Id", mediaId);
                },
                map: delegate (IDataReader reader, short set)
                {
                    int startingIndex = 0;
                        {
                            if (set == 0)
                            {
                                Media p = new Media();

                    p.MediaId = reader.GetSafeInt32(startingIndex++);
                    p.MediaParentId = reader.GetSafeInt32(startingIndex++);
                    p.MediaTitle = reader.GetSafeString(startingIndex++);
                    p.MediaFileName = reader.GetSafeString(startingIndex++);
                    p.MediaFileType = reader.GetSafeString(startingIndex++);
                    p.MediaFileSize = reader.GetSafeInt32(startingIndex++);
                    p.MediaType = reader.GetSafeInt32(startingIndex++);
                    p.MediaCreated = reader.GetSafeDateTime(startingIndex++);
                    p.MediaUserId = reader.GetGuid(startingIndex++);
                    p.MediaStatus = reader.GetSafeBool(startingIndex++);
                    p.MediaDescription = reader.GetSafeString(startingIndex++);
                    p.MediaFullUrl = p.MediaFullUrl + p.MediaFileName;
                    p.SourceId = reader.GetSafeInt32(startingIndex++);
                    p.ExternalCreatedDate = reader.GetSafeDateTime(startingIndex++);
                    p.MediaInfo = reader.GetSafeString(startingIndex++);
                    p.FreeTag = reader.GetSafeString(startingIndex++);
                    p.Slug = reader.GetSafeString(startingIndex++);
                    p.text = p.MediaDescription;
                    p.Deleted = reader.GetSafeBool(startingIndex++);

                    //determining the db base address:
                    if (p.SourceId == 1)
                    {
                        p.MediaFullUrl = "removedUrl" + p.MediaFileName;
                    }
                    else if (p.SourceId == 2)
                    {
                        p.MediaFullUrl = "removedUrl" + p.MediaFileName;
                    }

                    if (p.SourceId == 1 || p.SourceId == 2)
                    {
                    p.MediaThumbnailFullUrl = GenerateThumbnailUrl(p.MediaFullUrl, p.MediaFileName, p.SourceId);
                    }

                                x.Media = p;
                    }

                            if (set == 1)
                            {
                                Tag tag = new Tag();

                                tag.Id = reader.GetSafeInt32(startingIndex++);
                                tag.Tags = reader.GetSafeString(startingIndex++);
                                tag.Slug = reader.GetSafeString(startingIndex++);
                                tag.Created = reader.GetSafeDateTime(startingIndex++);
                                tag.ParentId = reader.GetSafeInt32(startingIndex++);
                                //tag.SynonymId = reader.GetSafeInt32(startingIndex++);

                                if (tList == null)
                                {
                                    tList = new List<Tag>();
                }
                                tList.Add(tag);
                                x.Tags = tList;
                            }
                        }
                    }
            );
                return x;
            }
        } //updated to Media Domain

        public bool DeleteMediaById(int id)
        {
            bool deleted = true;

            //make connection to DB + Stored procedure:
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.MediaBS_DeleteMediaById"
            , inputParamMapper: delegate (SqlParameterCollection paramCollection)
            {
                //packing up the parameter suitcase to ship to DB:
                paramCollection.AddWithValue("@Id", id);
            }
            );
            return deleted;
        }

        public List<Media> GetAllMedia()
        {
            List<Media> list = null; //will only create this list if there are objects to put in it!

            //grab connection:
            DataProvider.ExecuteCmd(GetConnection, "dbo.Media_SelectAll"
                , inputParamMapper: null //no need for any parameters
               , map: delegate (IDataReader reader, short set)
               {
                   Media m = new Media();
                   int startingIndex = 0; //allows us to manuever through the columns--like 'i++' in a for loop!

                   m.MediaId = reader.GetSafeInt32(startingIndex++);
                   m.MediaParentId = reader.GetSafeInt32(startingIndex++);
                   m.MediaTitle = reader.GetSafeString(startingIndex++);
                   m.MediaFileName = reader.GetSafeString(startingIndex++);
                   m.MediaFileType = reader.GetSafeString(startingIndex++);
                   m.MediaFileSize = reader.GetSafeInt32(startingIndex++);
                   m.MediaType = reader.GetSafeInt32(startingIndex++);
                   m.MediaCreated = reader.GetSafeDateTime(startingIndex++);
                   m.MediaUserId = reader.GetSafeGuid(startingIndex++);
                   m.MediaStatus = reader.GetSafeBool(startingIndex++);
                   m.MediaDescription = reader.GetSafeString(startingIndex++);
                   m.MediaFullUrl = m.MediaFullUrl + m.MediaFileName;

                   if (m.SourceId == 1 || m.SourceId == 2)
                   {
                   m.MediaThumbnailFullUrl = GenerateThumbnailUrl(m.MediaFullUrl, m.MediaFileName, m.SourceId);
                   }

                   if (list == null)
                   {
                       list = new List<Media>();
                   }

                   list.Add(m);
               }
            );
            return list;
        } //------end of GetAllMedia();

        //for imagebank 'image tagging' feature:
        public bool InsertTagIdByMediaId(MediaTagRequest model)
        {
            bool insertSuccess = true;

            if (model.mediaId.Count > 1)             //when user sends multiple mediaIds + tagIds --we will not allow user to update/make changes to db aside from inserting data
            {
            foreach (int i in model.mediaId)
            {
                IEnumerator<int> enumerator = model.tagId.GetEnumerator();
                    //System.Collections.IEnumerator enumerator = model.tagId.GetEnumerator();
                while (enumerator.MoveNext())
                {
                        DataProvider.ExecuteNonQuery(GetConnection, "dbo.MediaTags_InsertTagIdWithMultipleMid"
                    , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                    {
                        paramCollection.AddWithValue("@mediaId", i);
                        paramCollection.AddWithValue("@tagId", enumerator.Current);
                    });
                }
                }
            }
            else if (model.mediaId.Count == 1)      //when user sends ONE media with 1 or multiple tagIds -- we will allow user to insert + update/make changes to the db
            {
                DataProvider.ExecuteNonQuery(GetConnection, "MediaTags_InsertTagIdByMid"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@mediaId", model.mediaId[0]); //the mediaId in the request model is a list, we just want to grab the one mediaId
                    SqlParameter TagId = new SqlParameter("@tagId", SqlDbType.Structured);
                    if (model.tagId != null && model.tagId.Any())
                    {
                        TagId.Value = new IntIdTable(model.tagId.ToArray());
                    }
                    paramCollection.Add(TagId);
                });
            }
            return insertSuccess;
        }//----------------------------end of InsertMedia
    }//-----------end of MediaService
}//---------------end of service namespace