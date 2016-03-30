GO
ALTER proc [dbo].[Tags_selectTagsByMediaTagsMid]
@Id int
AS
BEGIN

	SELECT Tags.Id, Tags.Tag, Tags.Slug, Tags.Created, Tags.ParentId
	FROM Tags
	JOIN MediaTags
	ON Tags.Id = MediaTags.TagId 
	WHERE MediaTags.MediaId = @id

/*
DECLARE @Id int = 148263
EXEC Tags_selectTagsByMediaTagsMid @id;
*/

end