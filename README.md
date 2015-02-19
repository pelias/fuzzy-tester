# QUALITY... I has it!

## Acceptance tests for Pelias Geocoder API

This is an attempt at integration/acceptance/regression test framework that will allow us
to keep an eye on Pelias quality as we continue to hack away at it. The goal is to provide a
framework with the following features:

 * easily add test cases with input/expected output
 * generate a report for each run

### Usage

```
    $ npm test

    GET /search
        ✓ [id:0] query: { input: 'brooklyn' } (top 3) (151ms)
        ✓ [id:1] query: { input: 'brooklyn, ny' } (top 3) (69ms)
        1) [id:2] query: { input: 'new york' } (top 3)
        2) [id:3] query: { input: 'philadelphia' } (top 3)
        3) [id:4] query: { input: 'new york, ny' } (top 3)
        4) [id:5] query: { input: '130 dean street brooklyn, ny' } (top 1)
        ✓ [id:6] query: { input: 'billerica' } (top 1) (71ms)
        ✓ [id:7] query: { input: 'billerica, ma' } (top 1) (137ms)
        5) [id:8] query: { input: '15 call street billerica, ma' } (top 1)


      4 passing (895ms)
      5 failing
```


### Test Case File

#### Search

 + `name` is the suite title displayed when executing.
 + `priorityThresh` indicates the expected result must be found within the top N locations. This can be set for the entire suite as well as overwritten in individual test cases.
 + `tests` is an array of test cases that make up the suite.
 + `id` is a unique identifier within the test suite (this could be unnecessary, let's discuss)
 + `user` is the name of the person that added the test case.
 + `in` is the json query that will be urlencoded and appended to the host url.
 + `out` is the expected result. This can be a string, in which case it will be used to look up a location in locations.json.
  It can also be an object with various properties. Every property specified must be matched identically in the actual result location in order to claim success.


```javascript
    {
      "name": "GET /search",
      "priorityThresh": 3,
      "tests": [
        {
          "id": 1,
          "user": "Randy",
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

