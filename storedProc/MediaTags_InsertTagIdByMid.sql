ALTER proc [dbo].[MediaTags_InsertTagIdByMid]
--insert/update SINGLE media
@MediaId int,
@TagId AS [dbo].[IntIdTable] READONLY
as
begin
	DELETE FROM MediaTags
	WHERE MediaId = @MediaId

	INSERT INTO MediaTags (MediaId, TagId)
	SELECT @MediaId, Data FROM @TagId;
end;