ALTER proc [dbo].[MediaBS_SelectById]
@id int
as

BEGIN
	SELECT Id, ParentId, Title, FileName, FileType, FileSize, MediaType, Created, UserId, Status, Description, SourceId, ExternalCreatedDate, MediaInfo, FreeTag, Slug, Deleted
	FROM MediaBS	
	WHERE id=@id 

	EXEC dbo.Tags_selectTagsByMediaTagsMid @id;

	/*
		EXECUTE MediaBS_SelectById 148263;
	*/
END;