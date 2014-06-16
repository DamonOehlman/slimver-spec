BIN = ./node_modules/.bin

all: index.html css/main.css

index.html:
	$(BIN)/blockdown src/template.html < README.md > index.html

css/main.css:
	@mkdir -p css
	$(BIN)/suitcss src/main.css css/main.css

clean:
	rm -rf index.html
	rm -rf css

dev: clean all
	beefy index.js:bundle.js
