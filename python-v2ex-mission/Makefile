all:
	@echo "make install"
	@echo "make clean"

install:
	@virtualenv --no-site-package venv
	@source venv/bin/activate && pip install -r requirements.txt

clean: clean-pyc clean-venv

clean-pyc:
	@find . -name '*.pyc' -exec rm -f {} +
	@find . -name '*.pyo' -exec rm -f {} +
	@find . -name '*~' -exec rm -f {} +

clean-venv:
	@rm -rf venv
