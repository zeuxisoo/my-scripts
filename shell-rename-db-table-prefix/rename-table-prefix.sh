#!/bin/bash

MYSQL_BIN="/usr/local/mysql/bin/mysql"
MYSQL_USER="username"
MYSQL_PASS="password"
MYSQL_DATABASE="database"

PATTERN_TO="old_"
PATTERN_FROM="new_"

run() {
	command=$1
	
	echo -e `$MYSQL_BIN -u $MYSQL_USER -p"$MYSQL_PASS" --database="$MYSQL_DATABASE" -Bse "$command"`
}

title() {
	echo -e "\n$1\n"
}

message() {
	echo -e "--- $1"
}

# Check prefix is or not exists by PATTERN_FROM
title "Prefix checking ..."

select_prefix_tables_command="show tables like '${PATTERN_FROM}%'"

if [[ -n $(run "$select_prefix_tables_command") ]]; then
	message "Rename action: pass"
else
	message "Rename action: stop"
	exit 0
fi

# Rename table
title "Renaming tables ..."

for table in $(run "$select_prefix_tables_command")
do
	new_table_name=$(echo "$table" | sed -e "s/$PATTERN_FROM/$PATTERN_TO/g")
	rename_command="RENAME TABLE \`$table\` TO \`$new_table_name\`;"

	message "Rename table $table to $new_table_name"
	run "$rename_command"
done

# Show current tables
title "Current tables ..."

for table in $(run "show tables")
do
	message "$table"
done
