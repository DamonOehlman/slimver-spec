# slimver

This repository describes __slimver__ which is a simplified, opinionated, and strict variant of the [semver](http://semver.org/) spec.  If it doesn't fit your needs, then that is likely by design and you should continue with using semver.

Feel free to [open an issue](https://github.com/DamonOehlman/slimver-spec/issues) if you would like to discuss aspects of the design though.

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable)

<div class="app encoder"></div>
<div class="app rangetester"></div>

## Rules

### Version Strings

- A slimver version string is expressed in the form, `MAJOR.MINOR.PATCH` as per the semver spec. In contrast with semver though, slimver has no capacity to express prerelease or build metadata as part of the version string.  It is a strictly three positive integer values (between 0 and 65535) joined using a single dot character (`.`).

  __OK__

  - `1.0.0`

  __NOT OK__

  - `1.0.0-beta1`

- As each of the version parts is constrained within the range of `0..65535`, the largest version of a thing that can be tagged for release using slimver is `65535.65535.65535`.

  __OK__

  - `1.0.0`
  - `1.5.65535`

  __NOT OK__

  - `5.123232.0`

### Ranges

Only simple version range expressions are permitted:

- `^` expressions mean - any version matching the current major version, starting at the currently specified version.

- `~` expressions are supported, but are __EXACTLY THE SAME__ as `^` expressions.

- In the case that you want to lock to something other than a major version, you should use an `n.n.x` range expression or simply "pin" the version to a specific version with `n.n.n`.

__NOTE:__ The special pre `1.0.0` version range matching expressions have been replaced with simpler rules (see [here](https://github.com/DamonOehlman/slimver-spec/issues/2) and [here](https://github.com/dominictarr/semver-ftw/issues/2) for more info behind why).

#### Range Examples

| version | min   | max           |
|---------|-------|---------------|
| ^1.2.3  | 1.2.3 | 1.65535.65535 |
| ^0.1.2  | 0.1.2 | 0.65535.65535 |
| ^0.0.1  | 0.0.1 | 0.65535.65535 |
| ~1.2.3  | 1.2.3 | 1.65535.65535 |
| ~0.1.2  | 0.1.2 | 0.65535.65535 |
| ~0.0.1  | 0.0.1 | 0.65535.65535 |
| 1.x.x   | 1.0.0 | 1.65535.65535 |
| 1.1.x   | 1.1.0 | 1.1.65535     |

## Benefits

- By sticking to these strict rules a version can be encoded into a single numeric value for easy comparison.
- Simplified range expressions mean requirements are visually grokkable.

## Implementations

- JS: [slimver](https://github.com/DamonOehlman/slimver)

## Feedback

Drop an issue in the [source repo](https://github.com/DamonOehlman/slimver-spec), or add your opinion to any of the [existing issues](https://github.com/DamonOehlman/slimver-spec/issues).

## Other Reading

The following sites, issues, posts, etc are all worth a look:

- <http://semver-ftw.org/>

## License

[Creative Commons - CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)
