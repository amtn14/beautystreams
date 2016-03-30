ALTER proc [dbo].[MediaBS_UpdateByParentId] 
@Id int,
@ParentId int
as
begin
	Update MediaBS
	SET ParentId = @ParentId
	WHERE Id = @Id
	
	/* 
	declare
	@Id int = 90475,
	@ParentId int= 0

	exec MediaBS_UpdateByParentId @Id, @ParentId;

	*/
end