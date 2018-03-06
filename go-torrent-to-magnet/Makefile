all:
	@echo "Command      : Description"
	@echo "------------ : ------------------------"
	@echo "make dep     : Install the dep tools"
	@echo "make install : Install the program"
	@echo "make clean   : Remove the built files"

dep:
	@brew install dep

install:
	@go build -o tr2mg *.go

clean:
	@rm -rf tr2mg
