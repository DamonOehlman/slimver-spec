BIN = ./node_modules/.bin

index.html:
	$(BIN)/blockdown template.html < README.md > index.html

clean:
	rm -rf index.html
