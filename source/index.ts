/* eslint no-invalid-regexp:0 */

import { isRegExp } from 'typechecker'

interface RegExpObject {
	source: string
	flags: string
}

interface Captures {
	[name: string]: string
}

interface Sections {
	/** The matched content */
	outer: string

	/** The inner named capture group, but set to null if it wasn't defined */
	inner: string | null

	/** The rendered inner named capture group if it exists, otherwise the outer content */
	content: string
}

/**
 * @param captures The [RegExp Named Capture Groups](https://github.com/tc39/proposal-regexp-named-groups)
 */
export type replaceSyncCallback = (
	sections: Sections,
	captures: Captures
) => string

export type replaceAsyncCallback = (
	sections: Sections,
	captures: Captures
) => Promise<string>

// ====================================
// Private Utilities

/**
 * Merge the characters of two strings together without duplicates
 * Used to merge the flags of regexes
 * @private
 */
export function mergeFlags(a: string, b: string): string {
	return [...new Set(a.split('').concat(b.split('')))].join('')
}

/**
 * Extract the inputs RegExp source, and merge its flags with the passed flags
 * @private
 * @param input
 * @param addFlags
 */
export function prepareElementRegex(
	input: RegExp,
	addFlags: string = ''
): RegExpObject {
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
 */
const elementsRegex = new RegExp(
	'<(?<element>[-a-z]+)(?<attributes>\\s+.+?)?(?:\\/>|>(?<inner>[\\s\\S]*?)<\\/\\k<element>>)'
)

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param element
 * @param addFlags
 */
export function getElementRegex(element: RegExp, addFlags?: string): RegExp {
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
 */
const commentElementsRegex = new RegExp(
	'<!-- <(?<element>[-a-z]+)(?<attributes>\\s+.+?)?(?:\\/>|> -->(?<inner>[\\s\\S]*?)<!-- <\\/\\k<element>> -->)'
)

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param element
 * @param addFlags
 */
export function getCommentElementRegex(
	element: RegExp,
	addFlags?: string
): RegExp {
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
 * @param attributes The string of attributes to fetch from
 * @param attribute The attribute to fetch the value of
 */
export function extractAttribute(
	attributes: string,
	attribute: string
): string {
	const regex = new RegExp(
		`\\s(${attribute})\\s*=\\s*('[^']+'|\\"[^\\"]+\\"|[^'\\"\\s]\\S*)`,
		'ig'
	)
	let value = ''
	while (true) {
		const match = regex.exec(attributes)
		if (match == null) break
		value = match[2].trim().replace(/(^['"]\s*|\s*['"]$)/g, '')
	}
	return value
}

// ====================================
// Replace

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param regex The regular expression To perform nested replacements, you must provide a RegExp named capture group called inner
 * @param replace The callback to perform the replacement
 */
export function replaceSync(
	source: string,
	regex: RegExp,
	replace: replaceSyncCallback
): string {
	const result = source.replace(regex, function(substring, ...args) {
		const captures: Captures = args[args.length - 1] || {}
		const outer = captures.outer || substring
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
 * Replaces each match of the regular expression, with the result of the replace function
 * @param source The source string to run the regular expression against
 * @param regex The regular expression To perform nested replacements, you must provide a RegExp named capture group called inner
 * @param eplace The callback to perform the replacement
 */
export async function replaceAsync(
	source: string,
	regex: RegExp,
	replace: replaceAsyncCallback
): Promise<string> {
	// evaluate if the `y` (sticky) flag will speed this up
	const match = source.match(regex)
	if (match == null) return source
	// @ts-ignore
	const captures: Captures = match.groups || {}
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
	// using `as` because of https://github.com/microsoft/TypeScript/issues/35157
	const result = (match.input as string).replace(outer, () => innerResult)
	return await replaceAsync(result, regex, replace)
}

// ====================================
// Replace Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param replace The callback to perform the replacement
 */
export function replaceElementsSync(
	source: string,
	replace: replaceSyncCallback
): string {
	return replaceSync(source, elementsRegex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param replace The callback to perform the replacement
 */
export async function replaceElementsAsync(
	source: string,
	replace: replaceAsyncCallback
): Promise<string> {
	return await replaceAsync(source, elementsRegex, replace)
}

// ====================================
// Replace Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param replace The callback to perform the replacement
 */
export function replaceElementSync(
	source: string,
	element: RegExp,
	replace: replaceSyncCallback
): string {
	const regex = getElementRegex(element, 'g')
	const result = replaceSync(source, regex, replace)
	return result
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param element The regex string/instance for finding the element
 * @param replace The callback to perform the replacement
 */
export async function replaceElementAsync(
	source: string,
	element: RegExp,
	replace: replaceAsyncCallback
): Promise<string> {
	const regex = getElementRegex(element)
	return await replaceAsync(source, regex, replace)
}

// ====================================
// Replace Comment Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param replace The callback to perform the replacement
 */
export function replaceCommentElementsSync(
	source: string,
	replace: replaceSyncCallback
): string {
	return replaceSync(source, commentElementsRegex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param replace The callback to perform the replacement
 */
export async function replaceCommentElementsAsync(
	source: string,
	replace: replaceAsyncCallback
): Promise<string> {
	return await replaceAsync(source, commentElementsRegex, replace)
}

// ====================================
// Replace Comment Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param replace The callback to perform the replacement
 */
export function replaceCommentElementSync(
	source: string,
	element: RegExp,
	replace: replaceSyncCallback
): string {
	const regex = getCommentElementRegex(element, 'g')
	return replaceSync(source, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param source The source string to replace elements within
 * @param element The element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param replace The callback to perform the replacement
 */
export function replaceCommentElementAsync(
	source: string,
	element: RegExp,
	replace: replaceAsyncCallback
): Promise<string> {
	const regex = getCommentElementRegex(element)
	return replaceAsync(source, regex, replace)
}
