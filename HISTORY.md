# History

## v2.5.0 2019 December 1

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.4.0 2019 December 1

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.3.0 2019 November 18

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.2.0 2019 November 18

-   Converted to TypeScript
-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.1.0 2019 November 8

-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.0.1 2019 January 14

-   Fixed JSDoc types
-   Fixed README example
-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.0.0 2018 June 26

-   First argument in replace callbacks is now an object of the sections `outer`, `inner`, `content`
-   Second argument is the named capture groups object
-   To upgrade, change your replace callback's first argument from `content` to `{ content }`

## v1.2.0 2018 June 11

-   Fixed element detection when the element had no inner content, e.g. `<el></el>`
-   Fixed attributes being extracted based on their ending, instead of their entirety

## v1.1.0 2018 June 11

-   Support self-closing elements

## v1.0.0 2018 June 11

-   [Extracted out](https://github.com/balupton/bal-util/blob/3f78e730250a08ab1a459ad7d876285391df2280/source/lib/html.coffee) from [bal-util](https://github.com/balupton/bal-util) and dramatically improved
