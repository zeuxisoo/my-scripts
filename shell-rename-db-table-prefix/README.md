### Usage

1. Open `rename-table-prefix.sh`
2. Update configures like

	MySQL Connection
	
		MYSQL_USER="username"       # username
		MYSQL_PASS="password"       # password
		MYSQL_DATABASE="database"   # database
		
	Table Prefix
		
		PATTERN_TO="old_"			 # old table prefix
		PATTERN_FROM="new_"	         # new table prefix
		
	Other
	
		# Path for your mysql command bin		
		MYSQL_BIN="/usr/local/mysql/bin/mysql"	
	
3. Save and run the shell script

		bash rename-table-prefix.sh


### Other

Find the path of `MYSQL_BIN`

	$ which mysql
