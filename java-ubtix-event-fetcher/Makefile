.PHONY: lib

usage:
	@echo "make run"
	@echo "make clean"

run: clean
	@javac -cp "lib/*:." *.java
	@java -cp "lib/*:." Ubx

clean:
	@rm -rf *.class

lib:
	@rm -rf lib/*.jar

	@wget http://central.maven.org/maven2/com/github/kevinsawicki/http-request/6.0/http-request-6.0.jar -O lib/http-request-6.0.jar
	@wget http://central.maven.org/maven2/com/google/code/gson/gson/2.7/gson-2.7.jar -O lib/gson-2.7.jar
