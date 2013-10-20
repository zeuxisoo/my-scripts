#!/bin/bash

# Settings
TIMESTAMP=$(date +"%F")

BACKUP_DIR="backup/$TIMESTAMP"
MYSQL_USER="MYSQL_USER"
MYSQL_PASS="MYSQL_PASSWORD"
MYSQL_SELF="/usr/local/mysql/bin/mysql"
MYSQL_DUMP="/usr/local/mysql/bin/mysqldump"

DROPBOX_PATH="/Backup/Server/Database/All"

# Create backup directory
mkdir -p $BACKUP_DIR

# Get all database
databases=`$MYSQL_SELF -u $MYSQL_USER -p"$MYSQL_PASS" -e 'SHOW DATABASES;' | grep -Ev "(Database|information_schema)"`

for database in $databases; do
    echo "Dumping $database"
    $MYSQL_DUMP --force --opt -u $MYSQL_USER -p"$MYSQL_PASS" --database $database | gzip > "$BACKUP_DIR/$database.gz"
done

# Zip databases to one file then remove all databases
tar zcvf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Put to dropbox
put_cmd="/home/backup/dropbox_uploader.sh upload $BACKUP_DIR.tar.gz $DROPBOX_PATH/$TIMESTAMP.tar.gz"
echo $put_cmd && `$put_cmd`

# Remove from dropbox (expire 6 day files)
delete_cmd="/home/backup/dropbox_uploader.sh delete $DROPBOX_PATH/$(date -v -6d +'%F').tar.gz"
echo $delete_cmd && `$delete_cmd`

# Remove backup zip file
rm -rf $BACKUP_DIR