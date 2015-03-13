# QUALITY... I has it!

## Acceptance tests for Pelias Geocoder API

This is an attempt at integration/acceptance/regression test framework that will allow us
to keep an eye on Pelias quality as we continue to hack away at it. The goal is to provide a
framework with the following features:

 * easily add test cases with input/expected output
 * generate a report for each run

### Usage

```
node test --help
```

### Test Case Files
Test-cases live in `test_cases/`, and are split into test *suites* in individual JSON files. Each file must contain the
following properties:

 + `name` is the suite title displayed when executing.
 + `priorityThresh` indicates the expected result must be found within the top N locations. This can be set for the entire suite as well as overwritten in individual test cases.
 + `tests` is an array of test cases that make up the suite.

`tests` consists of objects with the following properties:
 + `id` is a unique identifier within the test suite (this could be unnecessary, let's discuss)
 + `status` is the optional expected status of this test-case (whether it should pass/fail/etc.), and will be used to
   identify improvements and regressions. May be either of `pass` or `fail`.
 + `user` is the name of the person that added the test case.
 + `in` is the json query that will be urlencoded and appended to the host url.
 + `expected` contains *expected* results. The object can contain a `priorityThresh` property, which will override the
   `priorityThresh` specified by the test-suite, and must contain a `properties` property. `properties` is mapped to an
   array of either of:

     + `object`: all of the key-value pairs will be tested against the objects returned by the API for exact matches.
     + `string`: a matching object will be looked up in the `locations.json` file. Allows you to easily reuse the same
      object for multiple test-cases.

+ `unexpected` is analogous to `expected`, except that you *cannot* specify a `priorityThresh` and the `properties`
  array does *not* support strings.


```javascript
{
  "name": "GET /search",
  "priorityThresh": 3,
  "tests": [
    {
      "id": 1,
      "user": "Randy",
      "status": "pass",
      "in": {
        "input": "brooklyn"
      },
      "out": "Brooklyn , Cattaraugus County, New York"
    },
    {
      "id": 6,
      "user": "Randy",
      "in": {
        "input": "130 dean street brooklyn, ny"
      },
      "priorityThresh": 1,
      "out": {
        "text": "130 Dean Street, Brooklyn, NY",
        "name": "130 Dean Street",
        "admin0": "United States",
        "admin1": "New York"
      }
    }
  ]
}
```

#### Locations

Each location in this index may have as many properties as we'd like. We can decide collectively how specific we
want to be here. Less specific =? less fragile.

```javascript
{
  "Brooklyn , Cattaraugus County, New York": {
    "name": "Brooklyn",
    "admin0": "United States",
    "admin1": "New York",
    "admin2": "Cattaraugus County",
    "text": "Brooklyn, Cattaraugus County, New York"
  },
  "New York, New York": {
    "name": "New York",
    "admin1": "New York",
    "admin0": "United States",
    "text": "New York, New York"
  },
  "Billerica, Middlesex County, Massachusetts": {
    "name": "Billerica",
    "admin0": "United States",
    "admin1": "Massachusetts",
    "admin2": "Middlesex County",
    "text": "Billerica, Middlesex County, Massachusetts"
  }
}
```
