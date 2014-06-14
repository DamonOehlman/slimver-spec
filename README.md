# slimver

This repository describes __slimver__ which is a simplified, and strict variant of the [semver](http://semver.org/) spec.

## Rules

### Version Strings

- A slimver version string is expressed in the form, `MAJOR.MINOR.PATCH` as per the semver spec. In contrast with semver though, slimver has no capacity to express prerelease or build metadata as part of the version string.  It is a strictly three unsigned integer values joined using a single dot character (`.`).

- Each of the version parts is constrained within the range of 0..65535, whereby `65535.65535.65535` is the most significant version of a thing that can be tagger for release using slimver.

### Version Expressions

Only simple version range expressions are permitted, and while this is still being thought about my thinking is this:

- `^` expressions will be supported with all their current weirdness:
  - To be documented

- `.x` expressions will also be supported.

## Benefits

- Comparisons are easy
- By sticking to the version string rules a version can be encoded into a single unsigned integer value for easy comparison.

## Feedback

Drop an issue in the repo, or add your opinion to any of the existing issues.
