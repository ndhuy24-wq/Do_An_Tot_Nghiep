@echo off
set DB_NAME=legion_shop
set IN_FILE=backup_legion_shop.sql
mysql -u root -p %DB_NAME% < %IN_FILE%
echo Import done.
pause
