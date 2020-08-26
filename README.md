<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/api?style=flat&color=orange" /></a>
<a href="https://hub.docker.com/u/pelias"><img src="https://img.shields.io/docker/pulls/pelias/api?style=flat&color=informational" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you’re able to turn your users’ place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias Fuzzy Tester

This is the Pelias fuzzy tester library, used for testing the [Pelias Geocoder](https://github.com/pelias/pelias) by running our
[acceptance-tests](https://github.com/pelias/acceptance-tests) and
[fuzzy-tests](https://github.com/pelias/fuzzy-tests).

Unlike a traditional unit test suite, testing a geocoder requires a bit of flexibility for many reasons:
- data can change
- minor differences in expected output should be handled
- it may not be feasible to fix certain errors at a certain time.
- The number of test cases is extremely large

For more info on the challenges, see the original [problem statement](https://github.com/pelias/acceptance-tests/issues/109)
that lead to the creation of this library.

## Example Usage

```
// in the root directory of the repo containing the tests
fuzzy-tester
fuzzy-tester --help
fuzzy-tester -e prod
fuzzy-tester -t dev
```


## Command Line Parameters

* `--help` show help :)
* `-e` Select an envronment from `pelias.json` to run tests against. A list of valid environments will be printed if an invalid value or no value is passed
* `-o` Select an output mode. Valid values are `terminal` (default), `csv`, `json`, and `autocomplete` ([see below](#autocomplete-mode))
* `-q` Enable quiet mode. Only test failures (not successes) are printed
* `-t` Select a test 'type' to filter on. This is a free-text value that can be added to each test, to allow running a subset of tests
* `-r` Set a limit of the number of requests that can be sent per second when running tests. This is useful to avoid overloading a small Pelias server
* `-m` Set a limit on the maximum number of requests that can be in progress simultaneously (default 1). Higher values can be faster, but can overload a small Pelias server.

## Test Case Files
Test-cases are expected to live in `test_cases/`, and are split into test
*suites* in individual JSON files. Each file must contain the following
properties:

 + `name` is the suite title displayed when executing.
 + `priorityThresh` indicates the expected result must be found within the top N locations. This can be set for the entire suite as well as overwritten in individual test cases.
 + `distanceThresh` (optional) defines the accepted maximal distance (in meters) between search result coordinates and the coordinates defined in each test.
    Each test case can include a specific threshold value. This makes sense because location of a neigborhood is not as accurately defined as location of,
    say, a building. Default threshold is 500 meters.
 + `tests` is an array of test cases that make up the suite.
 + `endpoint` the API endpoint (`search`, `reverse`, `suggest`) to target. Defaults to `search`.
 + `weights` (optional) test suite wide weighting for scores of the individual expectations. See the
   weights section below

`tests` consists of objects with the following properties:
 + `id` is a unique identifier within the test suite (this could be unnecessary, let's discuss)
 + `type` is simply a category to group the test under, to allowing running select groups of tests rather than all of
   them.
 + `status` is the optional expected status of this test-case (whether it should pass/fail/etc.), and will be used to
   identify improvements and regressions. May be either of `pass` or `fail`.
 + `user` is the name of the person that added the test case.
 + `endpoint` the API endpoint (`search`, `reverse`, `suggest`) to target. Defaults to `search`, which will override the
   `endpoint` specified by the test-suite.
 + `in` contains the API parameters that will be urlencoded and appended to the API url.
 + `expected` contains *expected* results. The object can contain a `priorityThresh` property, which will override the
   `priorityThresh` specified by the test-suite, and must contain a `properties` property. `properties` is mapped to an
   array of either of:

     + `object`: all of the key-value pairs will be tested against the objects returned by the API for exact matches.
     + `string`: a matching object will be looked up in the `locations.json` file. Allows you to easily reuse the same
      object for multiple test-cases.

   If `properties` is `null`, the test-case is assumed to be a placeholder.

   `expected` can also contain a test specific `distanceThresh` value, and an array of `[lon, lat]` coordinates.
   With these coordinates, it is possible to compare distance between locations found in the search and expected
   locations. This is often useful, because matching the name labels may fail even when the geocoder has found a
   proper result ('Harvard' != 'Harvard University'). Location coordinates are less ambiguous.

   Coordinate based tests also help to track invalid location data in the search database.

 + `unexpected` is analogous to `expected`, except that you *cannot* specify a `priorityThresh` and the `properties`
  array does *not* support strings.
 + `weights` (optional) test case specific weighting for scores of the individual expectations. See the
   weights section below

## Import Scripts for Test Cases

The `scripts` folder contains example scripts for creating fuzzy tests. For example, the data import script
`scripts/importHSLpoi.js` can be used to create a fuzzy test from a poi data list as follows:

 + Edit the import script `scripts/importHSLPoi.js` to specify which poi attributes and search attributes
   will be compared in the test. The current defaults serve as a good starting point.
 + Run the command `node scripts/importHSLPoi.js data/poi.txt`, where poi.txt is the source data file.
 + The script creates a test file called `HslPoitest.json`. You may edit it to fine tune the test setup.
   For example, you can change the threshold values afterwards, or add subtest specific thresholds.
 + Move the test file to the testing environment `../fuzzy-tests/test_cases` and run the test there.
   For more information, check [fuzzy-tests](http://github.com/Pelias/fuzzy-tests).

## Output Generators
The acceptance-tests support multiple different output generators, like an email and terminal output. See `node test
--help` for details on how to specify a generator besides the default. Note that the `email` generator requires an
AWS account, and that your `pelias-config` file contain the following configuration:

```javascript
{
  "acceptance-tests": {
    "email": {
      "ses": {
        "accessKeyId": "AWSACCESSKEY",
        "secretAccessKey": "AWS/Secret/key",
      },
      "recipients": ["recipient1@domain.com", "recipient2@domain.com"], // the list of recipients
    }
  }
}
```

### Autocomplete mode

A special output generator, `-o autocomplete` not only changes the output, but changes the behaviour of the test suite.
Instead of running each test case exactly as defined, it will run many tests for each test case. The tests will be run
against the autocomplete endpoint and will correspond to successively longer substrings of the input text, similar to
how a user would type the text into autocomplete. It looks like this:

![autocomplete example output](./autocomplete_example_output.png)

The results are shown underneath the input text, with each character corresponding to the result of the autocomplete
query with the input text up to the character above entered. Tests that pass are green, tests that fail are red. If the
expected output was not found at all, the result character will be an `F`, if the expected output was found, the
character will be the zero indexed location in the API results where it was found.

To the right of the input text, some additional info might be displayed. The first is any additional parameters being
sent with the API call, like a location bias. The second is a count of the number of expectations included in the test
case. This helps detect situations where one expectation is found, but the other isn't (the result might be a confusing
red `0` in that case).

## API URL aliases

The acceptance-tests runner recognizes a number of aliases for Pelias API URLs (eg, `stage` corresponds to
`pelias.stage.mapzen.com`), which can be specified as command-line arguments when running a test suite. You can
override the default aliases and define your own in `pelias-config`:

```javascript
{
  "acceptance-tests": {
    "endpoints": {
      "prod": "http://pelias-prod.myhost.com/protectedpath/",
      "staging": "http://pelias-staging.myhost.com",
      "localhost": "http://localhost:3100"
    }
  }
}
```


### Credentials

You can specify api keys for different hosts via `pelias.json` in the `acceptance-tests.credentials`
section.

The keys are bare hostnames (with no path or protocol). The values can either be a string, or an
object.

If using a string, the string will be used as an API key and appended to the query URL with
`&api_key=${value}`.  or an object.

If using an object, the `method` property can be specified as either `GET` (the default`) or
`Header`. Selecting `Header` will send the API key in the `authorization:` HTTP header.

The optional `keyName` property can be specified with `GET` if an authorization URL other than
`api_key` is required.

```javascript
{
  "acceptance-tests": {
    "endpoints": {
      "prod": "http://pelias-prod.myhost.com/protectedpath/",
      "staging": "http://pelias-staging.myhost.com",
      "localhost": "http://localhost:3100"
    },
    "credentials": {
      "pelias-staging.myhost.com": 'secret_key_12342354',
      "pelias-prod.myhost.com": {
        "method": "Header",
        "value": "prj_sk_XXXXXXXXX"
      },
      "pelias-testing.myhost.com": {
        "method": "GET",
		"keyName": "my_auth_parameter",
        "value": "prj_sk_XXXXXXXXX"
      }
    }
  }
}
```

## Weights

Weights are used to influence the score each individual expectation contributes to the total score
for a test. By default, all fields in expected properties, passing the priority threshold, and the
absence of any unexpected properties each contribute one point.

Any score for any individual property can be changed by specifying an object `weights` in a test
suite, or in an individual test case. For example, to more heavily weight the `name` property by
giving it a weight of 10 points, set weights to the following:
```javascript
{
  "properties": {
    "name": 10
  }
}
```

Weights can be nested and are completely optional, in which case the defaults will be in effect.

## Normalizers

Not all string matches should be exact. Many minor differences might make sense
to ignore because they are not relevant for the goals of a particular test.

The fuzzy-tester supports many [normalizers](./lib/normalizers.js) to serve these needs.

#### List of normalizers

- **stripPunctuation**: remove anything that's not a letter, number, underscore, or whitespace
- **toLowerCase**: convert all string values to lower case
- **toUpperCase**: convert all string values to upper case
- **trim**: remove leading and trailing whitespace
- **abbreviateDirectionals**: Replace directionals such as 'NorthWest' with their abbreviated form, such as 'NW'
- **abbreviateStreetSuffixes**: Abbreviate common street suffixes, such as replacing `avenue` with `ave`
- **removeOrdinals**: Remove [ordinal numbers](https://en.wikipedia.org/wiki/Ordinal_numeral) such as 1st, 2nd, in favor of 1, 2

### Specifying normalizers

Normalizers are specified at the top level of a test suite. Each property in the result can have one or more normalizers applied.

For example, to lowercase all `name` properties, and ensure all street values
are lowercased with abbreviated suffixes, use the following configuration:

```json
{
  "name": "My Test Suite",
  "normalizers": {
    "name": [ "toLowerCase" ],
    "street": [
      "toLowerCase",
      "abbreviateStreetSuffixes"
    ]
  }
}
```

## Using the Docker image

### rebuild the image

you can rebuild the image on any system with the following command:

```bash
$ docker build -t pelias/fuzzy-tester .
```

### download pre-built image

Up to date Docker images are built and automatically pushed to Docker Hub from our continuous integration pipeline

You can pull the latest stable image with

```bash
$ docker pull pelias/fuzzy-tester
```

### running tests in a container

You can bind-mount local tests to make them available inside the container using the `-v` flag.

In this example, the local file `./pelias.json` and local directory `./test_cases` are bind-mounted in to the container.

```bash
docker run --rm -i \
  -v './pelias.json:/code/pelias.json' \
  -v './test_cases:/code/pelias/fuzzy-tester/test_cases' \
  pelias/fuzzy-tester --help
```

### download custom image tags

We publish each commit and the latest of each branch to separate tags

A list of all available tags to download can be found at https://hub.docker.com/r/pelias/fuzzy-tester/tags/
