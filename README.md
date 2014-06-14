# slimver

This repository describes __slimver__ which is a simplified, and strict variant of the [semver](http://semver.org/) spec.

## Rules

### Version Strings

- A slimver version string is expressed in the form, `MAJOR.MINOR.PATCH` as per the semver spec. In contrast with semver though, slimver has no capacity to express prerelease or build metadata as part of the version string.  It is a strictly three unsigned integer values joined using a single dot character (`.`).

  __OK__

  - `1.0.0`

  __NOT OK__

  - `1.0.0-beta1`

- Each of the version parts is constrained within the range of `0..65535`, whereby `65535.65535.65535` is the most significant version of a thing that can be tagger for release using slimver.

  __OK__

  - `1.0.0`
  - `1.5.65535`

  __NOT OK__

  - `5.123232.0`

### Version Expressions

Only simple version range expressions are permitted, and while this is still being thought about my thinking is this:

- `^` expressions will be supported with all their current weirdness:

	| version | min   | max           |
  |---------|-------|---------------|
  | ^1.2.3  | 1.2.3 | 1.65535.65535 |
  | ^0.1.2  | 0.1.2 | 0.1.65535     |
  | ^0.0.1  | 0.0.1 | 0.0.1         |

- `.x` expressions will also be supported.

## Benefits

- Comparisons are easy
- By sticking to the version string rules a version can be encoded into a single unsigned integer value for easy comparison.

## Feedback

Drop an issue in the repo, or add your opinion to any of the existing issues.
