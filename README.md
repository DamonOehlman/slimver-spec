# slimver

This repository describes __slimver__ which is a simplified, opinionated, and strict variant of the [semver](http://semver.org/) spec.  If it doesn't fit your needs, then that is likely by design and you should continue with using semver.

Feel free to [open an issue](https://github.com/DamonOehlman/slimver-spec/issues) if you would like to discuss aspects of the design though.

<div class="app encoder"></div>
<div class="app rangetester"></div>

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

### Ranges

Only simple version range expressions are permitted, and while this is still being thought about my thinking is this:

- `^` expressions will be supported with all their current weirdness:

- `~` expressions are supported, but are __EXACTLY THE SAME__ as `^` expressions

- `.x` expressions also be supported.

#### Range Examples

| version | min   | max           |
|---------|-------|---------------|
| ^1.2.3  | 1.2.3 | 1.65535.65535 |
| ^0.1.2  | 0.1.2 | 0.1.65535     |
| ^0.0.1  | 0.0.1 | 0.0.1         |
| ~1.2.3  | 1.2.3 | 1.65535.65535 |
| ~0.1.2  | 0.1.2 | 0.1.65535     |
| ~0.0.1  | 0.0.1 | 0.0.1         |
| 1.x.x   | 1.0.0 | 1.65535.65535 |
| 1.1.x   | 1.1.0 | 1.1.65535     |


## Benefits

By sticking to the version string rules a version can be encoded into a single numeric value for easy comparison.

## Feedback

Drop an issue in the repo, or add your opinion to any of the existing issues.
