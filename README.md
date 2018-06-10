<!-- TITLE/ -->

<h1>replace-html-element</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/bevry/replace-html-element" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bevry/replace-html-element/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/replace-html-element" title="View this project on NPM"><img src="https://img.shields.io/npm/v/replace-html-element.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/replace-html-element" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/replace-html-element.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/replace-html-element" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/replace-html-element.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/replace-html-element#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/replace-html-element.svg" alt="Dev Dependency Status" /></a></span>
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

Replace each occurrence of a specified HTML element with another string

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save replace-html-element</code></li>
<li>Module: <code>require('replace-html-element')</code></li></ul>

<a href="http://browserify.org" title="Browserify lets you require('modules') in the browser by bundling up all of your dependencies"><h3>Browserify</h3></a><ul>
<li>Install: <code>npm install --save replace-html-element</code></li>
<li>Module: <code>require('replace-html-element')</code></li>
<li>CDN URL: <code>//wzrd.in/bundle/replace-html-element@0.1.0</code></li></ul>

<a href="http://enderjs.com" title="Ender is a full featured package manager for your browser"><h3>Ender</h3></a><ul>
<li>Install: <code>ender add replace-html-element</code></li>
<li>Module: <code>require('replace-html-element')</code></li></ul>

<h3><a href="https://github.com/bevry/editions" title="Editions are the best way to produce and consume packages you care about.">Editions</a></h3>

<p>This package is published with the following editions:</p>

<ul><li><code>replace-html-element</code> aliases <code>replace-html-element/source/index.js</code></li>
<li><code>replace-html-element/source/index.js</code> is Source + <a href="https://babeljs.io/docs/learn-es2015/" title="ECMAScript Next">ESNext</a> + <a href="https://nodejs.org/dist/latest-v5.x/docs/api/modules.html" title="Node/CJS Modules">Require</a></li></ul>

<p>Older environments may need <a href="https://babeljs.io/docs/usage/polyfill/" title="A polyfill that emulates missing ECMAScript environment features">Babel's Polyfill</a> or something similar.</p>

<!-- /INSTALL -->


## Usage

[Documentation.](http://master.detect-indentation.bevry.surge.sh/docs/)

[Tests.](https://github.com/bevry/detect-indentation/blob/master/source/test.js)

Let's say we want to create a HTML element to capitalise everything inside it. Let's call it `<x-uppercase>`.

To accomplish this, we would do the following:

<!-- <x-example> -->
``` js
'use strict'

const { extractAttribute, replaceElement, replaceElementAsync } = require('replace-html-element')

// uppercase the contents of <x-uppercase>
console.log(
	replaceElement(
		'<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
		'x-uppercase',
		function (element, attributes, content) {
			return content.toUpperCase()
		}
	)
)
// => <strong>I am AWESOME</strong>

// power the numbers of <power> together
console.log(
	replaceElement(
		'<x-pow>2 <x-power>3 4</x-power> 5</x-pow>',
		'x-pow(?:er)?',
		function (element, attributes, content) {
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
	replaceElement(
		'<x-pow:1>2 <x-pow:2>3 4</x-pow:2> 5</x-pow:1>',
		'x-pow',
		function (element, attributes, content) {
			const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
			return result
		}
	)
)
// => 8.263199609878108e+121

// we can even fetch attributes
console.log(
	replaceElement(
		'<x-pow power=10>2</x-pow>',
		'x-pow',
		function (element, attributes, content) {
			const power = extractAttribute(attributes, 'power')
			const result = Math.pow(content, power)
			return result
		}
	)
)
// => 1024

// and even do asynchronous replacements
async function asyncExample () {
	const result = await replaceElementAsync(
		'<x-readfile>package.json</x-readfile>',
		'x-readfile',
		function (element, attributes, content) {
			return require('fs').promises.readFile(content, 'utf8')
		}
	)
	console.log(result)
	// => the output of package.json
}
asyncExample()
```
<!-- </x-example> -->


<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/bevry/replace-html-element/blob/master/HISTORY.md#files">Discover the release history by heading on over to the <code>HISTORY.md</code> file.</a>

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/bevry/replace-html-element/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

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

No contributors yet! Will you be the first?

<a href="https://github.com/bevry/replace-html-element/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2018+ Benjamin Lupton</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
