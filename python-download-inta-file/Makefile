all:
	@echo "make env"

env:
	pyvenv venv

install:
	source venv/bin/activate && pip3 install -r requirements.txt

database:
	source venv/bin/activate && python index.py --init

page:
	source venv/bin/activate && python index.py --fetch=page

output-list:
	source venv/bin/activate && python index.py --output

download-output-list:
	cd storage/ && aria2c -i output-list.txt -j5 && cd -
