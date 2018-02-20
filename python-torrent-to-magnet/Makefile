help:
	@echo ""
	@echo "Command      : Description"
	@echo "--------------------------"
	@echo "make install : Install the dependencies"
	@echo "make clean   : Clean the dependencies"
	@echo ""

install:
	virtualenv -p python3 venv
	source venv/bin/activate && pip install --upgrade virtualenv && pip install -r requirements.txt

clean:
	@rm -rf venv
