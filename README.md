<!-- TITLE/ -->

<h1>ropo</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/bevry/ropo" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bevry/ropo/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/ropo" title="View this project on NPM"><img src="https://img.shields.io/npm/v/ropo.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/ropo" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/ropo.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/ropo" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/ropo.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/ropo#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/ropo.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>
<br class="badge-separator" />
<span class="badge-slackin"><a href="https://slack.bevry.me" title="Join this project's slack community"><img src="https://slack.bevry.me/badge.svg" alt="Slack community badge" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

String replacement utilities with support for both synchronous and asynchronous replacements. Supports replacing regular expressions, HTML Elements, and comment elements. Compatible with async/await.

<!-- /DESCRIPTION -->


> `ropo` is `replace` in [Yoruba](https://en.wikipedia.org/wiki/Yoruba_language)


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save ropo</code></li>
<li>Module: <code>require('ropo')</code></li></ul>

<a href="http://browserify.org" title="Browserify lets you require('modules') in the browser by bundling up all of your dependencies"><h3>Browserify</h3></a><ul>
<li>Install: <code>npm install --save ropo</code></li>
<li>Module: <code>require('ropo')</code></li>
<li>CDN URL: <code>//wzrd.in/bundle/ropo@1.0.0</code></li></ul>

<a href="http://enderjs.com" title="Ender is a full featured package manager for your browser"><h3>Ender</h3></a><ul>
<li>Install: <code>ender add ropo</code></li>
<li>Module: <code>require('ropo')</code></li></ul>

<h3><a href="https://github.com/bevry/editions" title="Editions are the best way to produce and consume packages you care about.">Editions</a></h3>

<p>This package is published with the following editions:</p>

<ul><li><code>ropo</code> aliases <code>ropo/source/index.js</code></li>
<li><code>ropo/source/index.js</code> is Source + <a href="https://babeljs.io/docs/learn-es2015/" title="ECMAScript Next">ESNext</a> + <a href="https://nodejs.org/dist/latest-v5.x/docs/api/modules.html" title="Node/CJS Modules">Require</a></li></ul>

<p>Older environments may need <a href="https://babeljs.io/docs/usage/polyfill/" title="A polyfill that emulates missing ECMAScript environment features">Babel's Polyfill</a> or something similar.</p>

<!-- /INSTALL -->


## Usage

[Documentation.](http://master.ropo.bevry.surge.sh/docs/)

[Tests.](https://github.com/bevry/ropo/blob/master/source/test.js)

<!-- <x-example> -->
``` js
'use strict'

const { extractAttribute, replaceSync, replaceAsync, replaceElementSync, replaceElementAsync } = require('ropo')

async function main () {
    // uppercase `bc` of `abcd`
    console.log(
        replaceSync(
            'abcd',
            /bc/,
            function (content) {
                return content.toUpperCase()
            }
        )
    )
    // => aBCd

    // uppercase `bc` of `abcd` asynchronously
    console.log(
        await replaceAsync(
            'abcd',
            /bc/,
            function (content) {
                return new Promise(function (resolve) {
                    process.nextTick(function () {
                        resolve(
                            content.toUpperCase()
                        )
                    })
                })
            }
        )
    )
    // => aBCd

    // use RegExp named capture groups to swap two words
    // https://github.com/tc39/proposal-regexp-named-groups
    console.log(
        replaceSync(
            'hello world',
            new RegExp('^(?<first>\\w+) (?<second>\\w+)$'),
            function (content, { first, second }) {
                return second + ' ' + first
            }
        )
    )
    // => world hello
    // yes, doing content.split(' ').reverse().join('') would have also worked
    // but now you know what RegExp named capture groups are and how to use them
    // which will come into play in the following examples

    // invert anything between BEGIN and END
    console.log(
        replaceSync(
            'hello BEGIN good morning END world',
            new RegExp('BEGIN (?<inner>.+?) END'),
            function (content) {
                return content.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom doog world

    // invert anything between INVERT:<N>
    console.log(
        replaceSync(
            'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
            new RegExp('(?<element>INVERT:\\d+) (?<inner>.+?) /\\k<element>'),
            function (content) {
                return content.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom guten yadg morgen doog world
    // notice how the text is replaced correctly, gday has 3 inversions applied, so it is inverted
    // whereas guten morgen has 2 inversions applied, so is reset
    // the ability to perform this recursive replacement is possible by using a RegExp named capture group called `inner` with ropo
    // when inner is provided, ropo will perform recursion on inner
    // e.g. using inner, the initial recursion will occur on the content: good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning
    // then on: guten INVERT:3 gday /INVERT:3 morgen
    // and finally on: gday
    // without inner, recursion would have to happen on the outer, which would cause the replacement to recur infinitely against itself
    // e.g. the intiial recursion would occur on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and the second on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and the third on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
    // and so on, so no progress is made
    // as such, ropo will only allow recursion when it detects the `inner` named capture group

    // invert anything between INVERT:<N>, without using the `inner` named capture group
    console.log(
        replaceSync(
            'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
            new RegExp('(?<element>INVERT:\\d+) (?<content>.+?) /\\k<element>'),
            function (outer, { content }) {
                return content.split('').reverse().join('')
            }
        )
    )
    // => hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
    // as we can see, recursion was correctly disabled
    // if it wasn't, we would end up with an error like:
    // (node:7252) UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
    // and if we used `outer` instead of the content capture group, we would have:
    // => hello 1:TREVNI/ gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog 1:TREVNI world

    // uppercase the contents of <x-uppercase>
    console.log(
        replaceElementSync(
            '<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
            /x-uppercase/,
            function (content) {
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
            function (content) {
                const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
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
            function (content) {
                const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
                return result
            }
        )
    )
    // => 8.263199609878108e+121

    // we can even fetch attributes
    console.log(
        replaceElementSync(
            '<x-pow power=10>2</x-pow>',
            /x-pow/,
            function (content, { attributes }) {
                const power = extractAttribute(attributes, 'power')
                const result = Math.pow(content, power)
                return result
            }
        )
    )
    // => 1024

    // and even do asynchronous replacements
    console.log(
        await replaceElementAsync(
            '<x-readfile>example.txt</x-readfile>',
            /x-readfile/,
            function (content) {
                return require('fs').promises.readFile(content, 'utf8')
            }
        )
    )
    // => hello world from example.txt

}
main()
```

Which results in:

```
aBCd
aBCd
world hello
hello gninrom doog world
hello gninrom guten yadg morgen doog world
hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
<strong>I am AWESOME</strong>
8.263199609878108e+121
8.263199609878108e+121
1024
hello world from example.txt
```
<!-- </x-example> -->


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

No maintainers yet! Will you be the first?

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="http://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/ropo/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/ropo">view contributions</a></li></ul>

<a href="https://github.com/bevry/ropo/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2018+ Benjamin Lupton</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
