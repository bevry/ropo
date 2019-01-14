/* eslint no-invalid-regexp:0 */
'use strict'

const { isRegExp } = require('typechecker')

/**
 * @typedef {object} RegexObject
 * @property {string} source
 * @property {string} flags
 */

/**
 * @typedef {object} Sections
 * @property {string} outer The matched content
 * @property {string|null} inner The inner named capture group, but set to null if it wasn't defined
 * @property {string} content The rendered inner named capture group if it exists, otherwise the outer content
 */

// ====================================
// Private Utilities

/**
 * Merge the characters of two strings together without duplicates
 * Used to merge the flags of regexes
 * @private
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function mergeFlags(a, b) {
	return [...new Set(a.split('').concat(b.split('')))].join('')
}

/**
 * Extract the inputs RegExp source, and merge its flags with the passed flags
 * @private
 * @param {RegExp} input
 * @param {string} [addFlags]
 * @returns {RegexObject}
 */
function prepareElementRegex(input, addFlags = '') {
	let source, flags
	if (isRegExp(input)) {
		flags = mergeFlags(addFlags, input.flags)
		source = input.source
	} else {
		throw new Error('input should be a RegExp instance')
	}
	return { source, flags }
}

/**
 * The regular expression used for finding elements
 * @private
 * @type {RegExp}
 */
const elementsRegex = new RegExp(
	'<(?<element>[-a-z]+)(?<attributes>\\s+.+?)?(?:\\/>|>(?<inner>[\\s\\S]*?)<\\/\\k<element>>)'
)

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param {RegExp} element
 * @param {string} [addFlags]
 * @returns {RegExp}
 */
function getElementRegex(element, addFlags) {
	const { source, flags } = prepareElementRegex(element, addFlags)
	const regex = new RegExp(
		`<(?<element>${source})(?<attributes>\\s+.+?)?(?:\\/>|>(?<inner>[\\s\\S]*?)<\\/\\k<element>>)`,
		flags
	)
	return regex
}

/**
 * The regular expression used for finding comment elements
 * @private
 * @type {RegExp}
 */
const commentElementsRegex = new RegExp(
	'<!-- <(?<element>[-a-z]+)(?<attributes>\\s+.+?)?(?:\\/>|> -->(?<inner>[\\s\\S]*?)<!-- <\\/\\k<element>> -->)'
)

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param {RegExp} element
 * @param {string} [addFlags]
 * @returns {RegExp}
 */
function getCommentElementRegex(element, addFlags) {
	const { source, flags } = prepareElementRegex(element, addFlags)
	const regex = new RegExp(
		`<!-- <(?<element>${source})(?<attributes>\\s+.+?)?(?:\\/>|> -->(?<inner>[\\s\\S]*?)<!-- <\\/\\k<element>> -->)`,
		flags
	)
	return regex
}

// ====================================
// Public Utilities

/**
 * Returns the value of a specific attribute
 * @param {string} attributes The string of attributes to fetch from
 * @param {string} attribute The attribute to fetch the value of
 * @returns {string}
 */
function extractAttribute(attributes, attribute) {
	const regex = new RegExp(
		`\\s(${attribute})\\s*=\\s*('[^']+'|\\"[^\\"]+\\"|[^'\\"\\s]\\S*)`,
		'ig'
	)
	let value = null
	while (true) {
		const match = regex.exec(attributes)
		if (!match) break
		value = match[2].trim().replace(/(^['"]\s*|\s*['"]$)/g, '')
	}
	return value
}

// ====================================
// Replace

/**
 * Your callback should follow the following format
 * @callback replaceSyncCallback
 * @param {Sections} sections
 * @param {object} captures The [RegExp Named Capture Groups](https://github.com/tc39/proposal-regexp-named-groups)
 * @returns {string?}
 */

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {RegExp} regex The regular expression To perform nested replacements, you must provide a RegExp named capture group called inner
 * @param {replaceSyncCallback} replace The callback to perform the replacement
 * @returns {string}
 */
function replaceSync(source, regex, replace) {
	const result = source.replace(regex, function(...args) {
		const captures = args[args.length - 1] || {}
		const outer = captures.outer || args[0]
		const inner = captures.inner == null ? null : captures.inner
		const content = inner === null ? outer : replaceSync(inner, regex, replace)
		const sections = { outer, inner, content }
		let innerResult = replace(sections, captures)
		if (innerResult == null) {
			innerResult = content
		}
		return innerResult
	})
	return result
}

/**
 * Your callback should follow the following format
 * @callback replaceAsyncCallback
 * @param {Sections} sections
 * @param {object} captures The [RegExp Named Capture Groups](https://github.com/tc39/proposal-regexp-named-groups)
 * @returns {Promise<string?>}
 */

/**
 * Replaces each match of the regular expression, with the result of the replace function
 * @param {string} source The source string to run the regular expression against
 * @param {RegExp} regex The regular expression To perform nested replacements, you must provide a RegExp named capture group called inner
 * @param {replaceAsyncCallback} replace The callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceAsync(source, regex, replace) {
	// evaluate if the `y` (sticky) flag will speed this up
	const match = source.match(regex)
	if (!match) return source
	// @ts-ignore
	const captures = match.groups || {}
	const outer = captures.outer || match[0]
	const inner = captures.inner == null ? null : captures.inner
	const content =
		inner === null ? outer : await replaceAsync(inner, regex, replace)
	const sections = { outer, inner, content }
	let innerResult = await replace(sections, captures)
	if (innerResult == null) {
		innerResult = content
	}
	// replace uses `() => result` instead of just `result`
	// as `result` would interpret `$` in the result as a regex replacement
	// when a function that returns the result, the result is just a string, rather than an instruction
	const result = match.input.replace(outer, () => innerResult)
	return await replaceAsync(result, regex, replace)
}

// ====================================
// Replace Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {replaceSyncCallback} replace The callback to perform the replacement
 * @returns {string}
 */
function replaceElementsSync(source, replace) {
	return replaceSync(source, elementsRegex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {replaceAsyncCallback} replace The callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementsAsync(source, replace) {
	return await replaceAsync(source, elementsRegex, replace)
}

// ====================================
// Replace Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {RegExp} element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace The callback to perform the replacement
 * @returns {string}
 */
function replaceElementSync(source, element, replace) {
	const regex = getElementRegex(element, 'g')
	const result = replaceSync(source, regex, replace)
	return result
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {RegExp} element The regex string/instance for finding the element
 * @param {replaceAsyncCallback} replace The callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementAsync(source, element, replace) {
	const regex = getElementRegex(element)
	return await replaceAsync(source, regex, replace)
}

// ====================================
// Replace Comment Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {replaceSyncCallback} replace The callback to perform the replacement
 * @returns {string}
 */
function replaceCommentElementsSync(source, replace) {
	return replaceSync(source, commentElementsRegex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {replaceAsyncCallback} replace The callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceCommentElementsAsync(source, replace) {
	return await replaceAsync(source, commentElementsRegex, replace)
}

// ====================================
// Replace Comment Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {RegExp} element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace The callback to perform the replacement
 * @returns {string}
 */
function replaceCommentElementSync(source, element, replace) {
	const regex = getCommentElementRegex(element, 'g')
	return replaceSync(source, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source The source string to replace elements within
 * @param {RegExp} element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceAsyncCallback} replace The callback to perform the replacement
 * @returns {Promise<string>}
 */
function replaceCommentElementAsync(source, element, replace) {
	const regex = getCommentElementRegex(element)
	return replaceAsync(source, regex, replace)
}

// ====================================
// Export

module.exports = {
	extractAttribute,
	replaceSync,
	replaceElementSync,
	replaceElementsSync,
	replaceCommentElementSync,
	replaceCommentElementsSync,
	replaceAsync,
	replaceElementAsync,
	replaceElementsAsync,
	replaceCommentElementAsync,
	replaceCommentElementsAsync
}
