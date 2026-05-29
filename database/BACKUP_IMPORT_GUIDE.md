# Backup / Import Database

## Backup
```bash
mysqldump -u root -p legion_shop > backup_legion_shop.sql
```

## Import
```bash
mysql -u root -p legion_shop < backup_legion_shop.sql
```

## Import database ban đầu
Chạy file `db/database.sql` trong MySQL Workbench hoặc phpMyAdmin.
