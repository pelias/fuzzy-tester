0.3.2 / 2015-08-24
==================

Bug fix:
 * backoff between tests will no longer grow exponentiall forever
   - it's now capped at a default of 10 seconds

0.3.1 / 2015-07-29
==================

Bug fix:
 * 500 errors no longer cause the entire test suite to fail
   - instead the invidual test will be marked as failed

0.3.0 / 2015-07-17
==================

New features:
 * [endpoint name in output generators](https://github.com/pelias/fuzzy-tester/tree/build-names)

0.2.0 / 2015-07-15
==================

New features:
  * [json output generator for failures](https://github.com/pelias/fuzzy-tester/tree/print_failures)

0.1.0 / 2015-07-15
==================

New features:

  * [exponential backoff](https://github.com/pelias/fuzzy-tester/commit/02388de3ba738e6774a459dfd59d136a9e69482d)

0.0.1 / 2015-07-13
==================

  * First release
