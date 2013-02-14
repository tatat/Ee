REPORTER = spec
SPEC_DIR = spec
MOCHA = ./node_modules/.bin/mocha

test:
	@NODE_ENV=test $(MOCHA) $(SPEC_DIR) \
		--reporter $(REPORTER)

test-watch:
	@NODE_ENV=test $(MOCHA) $(SPEC_DIR) \
		--reporter $(REPORTER) \
		--growl \
		--watch

.PHONY: test test-watch
