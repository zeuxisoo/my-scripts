### Install

	rbenv local 2.0.0-p247
	rbenv rehash
	
	bundle install --path vendor
	rbenv rehash

### Usage

Edit `username` and `password`

	vim index.rb
	
		f.login  = "Username"
        f.passwd = "Password"

Run script

	ruby index.rb
	
### Test and Parse

Case A

	Test Script : test.rb
	Test Case   : test/current-auction-list-page.html
	Content From: 我的拍賣主頁 > 拍賣中

	

	