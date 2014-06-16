BIN = ./node_modules/.bin

all: index.html css/main.css bundle.js

index.html:
	$(BIN)/blockdown src/template.html < README.md > index.html

css/main.css:
	@mkdir -p css
	$(BIN)/suitcss src/main.css css/main.css

bundle.js:
	$(BIN)/browserify -d index.js > bundle.js

clean:
	rm -rf index.html
	rm -rf css
	rm -rf bundle.js

dev: clean all
	beefy index.js:bundle.js
