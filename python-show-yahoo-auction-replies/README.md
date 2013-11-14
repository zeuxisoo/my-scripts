### Install

Install environment and dependencies

	virtualenv-2.7 --no-site-package venv
	source venv/bin/activate
	pip install -r requirements.txt

Edit config

	vim index.py

	request_datas  = dict(login='USERNAME', passwd='PASSWORD')

### Usage

	source venv/bin/activate
	
	python index.py