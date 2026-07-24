USE [SE_Career_Roadmap];
GO

-- Cập nhật toàn bộ các tài khoản có role là ADMIN (hoặc admin) thành STAFF
UPDATE [dbo].[Users]
SET [role] = 'STAFF'
WHERE UPPER([role]) = 'ADMIN';
GO
