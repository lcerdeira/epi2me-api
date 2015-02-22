MAKE     := make

ifeq ($(OS),Windows_NT)
    MAKE     = gmake
endif

deps:
	npm install

test: deps
	node node_modules/jslint/bin/jslint metrichor.js
	node node_modules/mocha/bin/mocha --recursive --reporter xunit-file

just_cover: deps
	node node_modules/istanbul/lib/cli cover node_modules/mocha/bin/_mocha -- --recursive --reporter xunit-file test
