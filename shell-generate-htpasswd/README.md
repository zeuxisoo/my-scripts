### Usage

Run the shell script

	bash htpasswd.sh
	
### Example

	$ bash htpasswd.sh
	
	Please enter username: user_a
	Please enter password: pass_a
	Need save to htpaaswd file (Y/N)? y
	Please enter htpasswd file path: /Users/user_a/Desktop/abc.txt
	Your username: user_a
	Your password: pass_a
	Output string: z:13Bqwl.l4SXNU
	
	Press any key to Create file or Press Ctrl+c to cancel
	
	Save to file: /Users/user_a/Desktop/abc.txt

### Other

It is generate by `crypt(PASSWORD, TIME_SALT)`