### Usage

Directory structure

	/home/backup
	|-- dropbox_uploader.sh
	|-- shell-backup-all-db-to-dropbox
		|-- backup.sh

Clone the script

	git clone git@github.com:zeuxisoo/undefined-scripts.git
	
Set permission for script

	cd shell-backup-all-db-to-dropbox
	chmod 755 backup.sh
	
Update the `backup.sh` settings

	vim backup.sh
	
	MYSQL_USER="MYSQL_USER"
	MYSQL_PASS="MYSQL_PASSWORD"
	
Run script (**Please make sure backup user was created**)

	./backup.sh
	
### Set Cron Job

ran `crontab -e` add this line

	00 3 * * * /home/backup/undefined-scripts/shell-backup-all-db-to-dropbox/backup.sh

### Create Database User

	CREATE USER 'backup'@'localhost' IDENTIFIED BY  'YOUR_PASSWORD';

### Grant Permission to User

	GRANT SELECT , 
	RELOAD , 
	SHOW DATABASES ,
	LOCK TABLES ON * . * TO  'backup'@'localhost' IDENTIFIED BY  'YOUR_PASSWORD' WITH 	MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 	MAX_USER_CONNECTIONS 0 ;
	
### Dropbox Uploader

Download it

	curl "https://raw.github.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o dropbox_uploader.sh
	
Run it

	./dropbox_uploader.sh
	
Create app first, Go to

	https://www2.dropbox.com/developers/apps
	
Action in create app

	- Dropbox API app
	- Files and datastores
	- Yes My app only needs access to files it creates
	
	- AppName copy from console output or custom
	
Submit, Copy `App Key`, `App Secret` and Enter `a` for App Folder

Enter, Go to given token url and accept then go back console and press enter
