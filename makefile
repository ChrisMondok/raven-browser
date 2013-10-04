SOURCES:=$(shell find source -name '*.js')
VERSION	:= 0.1.$(shell git log --pretty=format:'' | wc -l )

deploy/RavenBrowser: $(SOURCES)
	tools/deploy.sh

clean:
	rm -rf deploy/* build/*
