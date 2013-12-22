#!/bin/bash

# Variable
username=""
password=""
savefile=""
filepath=""

# Const
RESET='\033[0m'
RED='\033[00;31m'
GREEN='\033[00;32m'
YELLOW='\033[00;33m'
BLUE='\033[00;34m'
PURPLE='\033[00;35m'
CYAN='\033[00;36m'
LIGHTGRAY='\033[00;37m'

# Function
get_char() {
	SAVEDSTTY=`stty -g`
	stty -echo
	stty cbreak
	dd if=/dev/tty bs=1 count=1 2> /dev/null
	stty -raw
	stty echo
	stty $SAVEDSTTY
}

error() {
	echo -e "${RED}$1${RESET}"
}

success() {
	echo -e "${GREEN}$1${RESET}"
}

# Get username
read -p "Please enter username: " username

if [ "$username" = "" ]; then
	error "Error: Username cannot empty"
	exit 1
fi

# Get password
read -p "Please enter password: " password

if [ "$password" = "" ]; then
	error "Error: Password cannot empty"
	exit 1
fi

# Get save file and file path
read -p "Need save to htpaaswd file (Y/N)? " savefile

if [ "$savefile" = "Y" ] || [ "$savefile" = "y" ]; then
	read -p "Please enter htpasswd file path: " filepath
fi

# Generate encrypted password
encrypted=$(perl -e 'print crypt($ARGV[0], time())', $password)

# Output status
success "Your username: $username"
success "Your password: $password"
success "Output string: $username:$encrypted"

# Output save file
if [ "$filepath" != "" ]; then
	echo ""
	echo "Press any key to Create file or Press Ctrl+c to cancel"
	echo ""
	char=`get_char`

	if [ ! -f "$filepath" ]; then
		success "Save to file: $filepath"
		echo "$username:$encrypted" >> $filepath
	else
		error "Error: File already exists"
		exit 1
	fi
fi