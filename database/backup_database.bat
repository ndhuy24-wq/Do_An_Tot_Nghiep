@echo off
set DB_NAME=legion_shop
set OUT_FILE=backup_legion_shop.sql
mysqldump -u root -p %DB_NAME% > %OUT_FILE%
echo Backup done: %OUT_FILE%
pause
