<!-- TITLE/ -->

<h1>ropo</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.com/bevry/ropo" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/com/bevry/ropo/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/ropo" title="View this project on NPM"><img src="https://img.shields.io/npm/v/ropo.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/ropo" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/ropo.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/ropo" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/ropo.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/ropo#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/ropo.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-githubsponsors"><a href="https://github.com/sponsors/balupton" title="Donate to this project using GitHub Sponsors"><img src="https://img.shields.io/badge/github-donate-yellow.svg" alt="GitHub Sponsors donate button" /></a></span>
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

String replacement utilities with support for both synchronous and asynchronous replacements. Supports replacing regular expressions, HTML Elements, and comment elements. Compatible with async/await.

<!-- /DESCRIPTION -->


> `ropo` is `replace` in [Yoruba](https://en.wikipedia.org/wiki/Yoruba_language)

## Usage

[Complete API Documentation.](http://master.ropo.bevry.surge.sh/docs/globals.html)

[Tests.](https://github.com/bevry/ropo/blob/master/source/test.ts)

<!-- <x-example> -->

```js
import { strictEqual } from 'assert'
import {
    extractAttribute,
    replaceSync,
    replaceAsync,
    replaceElementSync,
    replaceElementAsync,
} from 'ropo'

async function main() {
    // uppercase `bc` of `abcd`
    console.log(
        replaceSync('abcd', /bc/, function ({ content }) {
            return content.toUpperCase()
        })
    )
    // => aBCd

    // uppercase `bc` of `abcd` asynchronously
    console.log(
        await replaceAsync('abcd', /bc/, function ({ content }) {
            return new Promise(function (resolve) {
                process.nextTick(function () {
                    resolve(content.toUpperCase())
                })
            })
        })
    )
    // => aBCd

    // use a RegExp named capture group to allow the inversion of content between BEGIN and END
    // https://github.com/tc39/proposal-regexp-named-groups
    console.log(
        replaceSync(
            'hello BEGIN good morning END world',
            new RegExp('BEGIN (?<inside>.+?) END'),
            function (section, captures) {
                strictEqual(section.outer, 'BEGIN good morning END')
                strictEqual(section.inner, null)
                strictEqual(section.content, section.outer)
                return captures.inside.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom doog world

    // for convenience, and some extra magic (magic explained in next example) we can call `inside` `inner` to have it used as a section
    console.log(
        replaceSync(
            'hello BEGIN good morning END world',
            new RegExp('BEGIN (?<inner>.+?) END'),
            function (section, captures) {
                strictEqual(section.outer, 'BEGIN good morning END')
                strictEqual(section.inner, captures.inner)
                strictEqual(section.content, captures.inner)
                return section.content.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom doog world

    // invert anything between INVERT:<N> with recursive rendering
    console.log(
        replaceSync(
            'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
            new RegExp('(?<element>INVERT:\\d+) (?<inner>.+?) /\\k<element>'),
            function ({ content }) {
                return content.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom guten yadg morgen doog world
    // notice how the text is replaced correctly, gday has 3 inversions applied, so it is inverted
    // whereas guten morgen has 2 inversions applied, so is reset
    // the ability to perform this recursive replacement is possible because if the RegExp named capture group `inner` exists,
    // then ropo will perform recursion on it inner, and return the result as the `content` section
    // e.g. by doing this, the initial recursion will occur on: good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning
    // then on: guten INVERT:3 gday /INVERT:3 morgen
    // and finally on: gday
    // without doing this, recursion would have to happen on the outer, which would cause the replacement to recur infinitely against itself
    // e.g. the initial recursion would occur on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and the second on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and the third on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and so on, so no progress is made
    // as such, ropo will only allow recursion when it detects the `inner` named capture group

    // invert anything between INVERT:<N>, without using the `inner` named capture group
    console.log(
        replaceSync(
            'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
            new RegExp(
                '(?<element>INVERT:\\d+) (?<whatever>.+?) /\\k<element>'
            ),
            function (sections, { whatever }) {
                return whatever.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
    // as we can see, recursion was correctly disabled
    // if it wasn't, we would end up with an error like:
    // (node:7252) UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
    // and if we used the `outer` section instead of the `whatever` capture group, we would have:
    // => hello 1:TREVNI/ gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog 1:TREVNI world

    // ropo also has built in helpers for element replacements,
    // such that we only need to specify the tag name/regexp,
    // and ropo handles the replacement sections and capture groups for us

    // uppercase the contents of <x-uppercase>
    console.log(
        replaceElementSync(
            '<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
            /x-uppercase/,
            function ({ content }) {
                return content.toUpperCase()
            }
        )
    )
    // => <strong>I am AWESOME</strong>

    // power the numbers of <power> together
    console.log(
        replaceElementSync(
            '<x-pow>2 <x-power>3 4</x-power> 5</x-pow>',
            /x-pow(?:er)?/,
            function ({ content }) {
                const result = content
                    .split(/[\n\s]+/)
                    .reduce((a, b) => Math.pow(a, b))
                return result
            }
        )
    )
    // => 8.263199609878108e+121
    // note that this is the correct result of: 2 ^ (3 ^ 4) ^ 5
    // which means, the nested element is replaced first, then the parent element, as expected

    // now as replace-element is just regex based, we must ensure that nested elements have unique tags
    // this can be done as above with `x-pow` and `x-power`, but can also be done via a `:<N>` suffix to the tag
    console.log(
        replaceElementSync(
            '<x-pow>2 <x-pow:2>3 4</x-pow:2> 5</x-pow>',
            /x-pow(?::\d+)?/,
            function ({ content }) {
                const result = content
                    .split(/[\n\s]+/)
                    .reduce((a, b) => Math.pow(a, b))
                return result
            }
        )
    )
    // => 8.263199609878108e+121

    // we can even fetch attributes
    console.log(
        replaceElementSync('<x-pow power=10>2</x-pow>', /x-pow/, function (
            { content },
            { attributes }
        ) {
            const power = extractAttribute(attributes, 'power')
            const result = Math.pow(content, power)
            return result
        })
    )
    // => 1024

    // and even do asynchronous replacements
    console.log(
        await replaceElementAsync(
            '<x-readfile>example-fixture.txt</x-readfile>',
            /x-readfile/,
            function ({ content }) {
                return require('fs').promises.readFile(content, 'utf8')
            }
        )
    )
    // => hello world from example-fixture.txt

    // and with support for self-closing elements
    console.log(
        replaceElementSync(
            '<x-pow x=2 y=3 /> <x-pow>4 6</x-pow>',
            /x-pow/,
            function ({ content }, { attributes }) {
                const x =
                    extractAttribute(attributes, 'x') || content.split(' ')[0]
                const y =
                    extractAttribute(attributes, 'y') || content.split(' ')[1]
                const result = Math.pow(x, y)
                return result
            }
        )
    )
    // => 8 4096
}
main()
```

Which results in:

```
aBCd
aBCd
hello gninrom doog world
hello gninrom doog world
hello gninrom guten yadg morgen doog world
hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
<strong>I am AWESOME</strong>
8.263199609878108e+121
8.263199609878108e+121
1024
hello world from example-fixture.txt
8 4096
```

<!-- </x-example> -->

<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
<ul>
<li>Install: <code>npm install --save ropo</code></li>
<li>Import: <code>import * as pkg from ('ropo')</code></li>
<li>Require: <code>const pkg = require('ropo')</code></li>
</ul>

<a href="https://www.pika.dev/cdn" title="100% Native ES Modules CDN"><h3>pika</h3></a>

``` html
<script type="module">
    import * as pkg from '//cdn.pika.dev/ropo/^2.9.0'
</script>
```

<a href="https://unpkg.com" title="unpkg is a fast, global content delivery network for everything on npm"><h3>unpkg</h3></a>

``` html
<script type="module">
    import * as pkg from '//unpkg.com/ropo@^2.9.0'
</script>
```

<a href="https://jspm.io" title="Native ES Modules CDN"><h3>jspm</h3></a>

``` html
<script type="module">
    import * as pkg from '//dev.jspm.io/ropo@2.9.0'
</script>
```

<h3><a href="https://editions.bevry.me" title="Editions are the best way to produce and consume packages you care about.">Editions</a></h3>

<p>This package is published with the following editions:</p>

<ul><li><code>ropo/source/index.ts</code> is <a href="https://www.typescriptlang.org/" title="TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. ">TypeScript</a> source code with <a href="https://babeljs.io/docs/learn-es2015/#modules" title="ECMAScript Modules">Import</a> for modules</li>
<li><code>ropo</code> aliases <code>ropo/edition-esnext/index.js</code></li>
<li><code>ropo/edition-esnext/index.js</code> is <a href="https://www.typescriptlang.org/" title="TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. ">TypeScript</a> compiled against <a href="https://en.wikipedia.org/wiki/ECMAScript#ES.Next" title="ECMAScript Next">ESNext</a> for <a href="https://nodejs.org" title="Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine">Node.js</a> with <a href="https://nodejs.org/dist/latest-v5.x/docs/api/modules.html" title="Node/CJS Modules">Require</a> for modules</li>
<li><code>ropo/edition-browsers/index.js</code> is <a href="https://www.typescriptlang.org/" title="TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. ">TypeScript</a> compiled against <a href="https://en.wikipedia.org/wiki/ECMAScript#10th_Edition_-_ECMAScript_2019" title="ECMAScript ES2019">ES2019</a> for web browsers with <a href="https://babeljs.io/docs/learn-es2015/#modules" title="ECMAScript Modules">Import</a> for modules</li></ul>

<!-- /INSTALL -->


<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/bevry/ropo/blob/master/HISTORY.md#files">Discover the release history by heading on over to the <code>HISTORY.md</code> file.</a>

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/bevry/ropo/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

<h2>Backers</h2>

<h3>Maintainers</h3>

These amazing people are maintaining this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/ropo/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/ropo">view contributions</a></li></ul>

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-githubsponsors"><a href="https://github.com/sponsors/balupton" title="Donate to this project using GitHub Sponsors"><img src="https://img.shields.io/badge/github-donate-yellow.svg" alt="GitHub Sponsors donate button" /></a></span>
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/ropo/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/ropo">view contributions</a></li></ul>

<a href="https://github.com/bevry/ropo/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2018+ <a href="https://balupton.com">Benjamin Lupton</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
