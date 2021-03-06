0.7.0 / 2016-06-29
==================

New features:
* Add improvement count to terminal and email output (https://github.com/pelias/fuzzy-tester/pull/64)

Bug fixes:
* Round success percentages to 2 decimals to avoid inaccurately reporting 100% success (https://github.com/pelias/fuzzy-tester/pull/62)

Dependency updates:
* nodemailer-ses-transport 1.4.0 (https://github.com/pelias/fuzzy-tester/pull/61)
* juice 2.0.0 (https://github.com/pelias/fuzzy-tester/pull/56)

0.6.3 / 2016-06-13
==================

Bug fixes:
* Fix the long standing email sending bug! (https://github.com/pelias/fuzzy-tester/issues/30)

0.6.2 / 2016-05-03
==================

Bug fixes:
* dependency updates

0.6.1 / 2016-04-04
==================

Bug fixes:
* Output from large test suites is no longer truncated
  See https://github.com/pelias/fuzzy-tester/pull/44

0.5.1 / 2016-03-28
==================

Bug fixes:
* Backport usage of http.Agent to limit maximum concurrent requests to 1
  This helps avoid overloading small clusters during testing

0.6.0 / 2016-01-06
==================

New features:
* [Autocomplete mode!](https://github.com/pelias/fuzzy-tester/pull/28)

0.5.0 / 2015-12-07
==================

New features:
* use a more concise diff output that is easier to read

0.4.4 / 2015-10-06
==================

Text changes:
* remove broken and old status badge from readme
* update the readme with better capitalization

0.4.3 / 2015-09-25
==================

Bug fix
* [handle timeout responses](https://github.com/pelias/fuzzy-tester/pull/16)

0.4.2 / 2015-09-04
==================

* update pelias-config for v1 responses

0.4.1 / 2015-09-02
==================

New features:
 * [allow specifying api keys in pelias config](https://github.com/pelias/fuzzy-tester/pull/14)

0.4.0 / 2015-08-19
==================

New features:
 * [score based test evaluation, with a nice diff-like output](https://github.com/pelias/fuzzy-tester/pull/4)

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
