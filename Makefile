REPORTER = spec
SPEC_DIR = ./spec
MOCHA = ./node_modules/.bin/mocha
LIB_DIR = ./lib
UGLIFY = ./node_modules/.bin/uglifyjs

test:
	@NODE_ENV=test $(MOCHA) $(SPEC_DIR) \
		--reporter $(REPORTER)

test-watch:
	@NODE_ENV=test $(MOCHA) $(SPEC_DIR) \
		--reporter $(REPORTER) \
		--growl \
		--watch

uglify:
	@find $(LIB_DIR) -name '*.js' -not -name '*.min.js' | \
		while read n; do $(UGLIFY) "$$n" --output "$${n%.js}.min.js"; done

.PHONY: test test-watch uglify
