<script setup lang="ts">
import { computed, ref } from 'vue';
import { getFieldPrecisionAndScale, getLocaleSettings } from '../shared/utils.js';

//
// Setup and types
//

/**
 * Interface representing the properties for a specific configuration or data structure.
 *
 * @interface Props
 *
 * @property {string} collection - The name of the collection that is being referenced or operated on.
 * @property {string} field - The specific field within the collection to be targeted or utilized.
 * @property {string | null} [value] - An optional property representing the value associated with the field. Can be a string or null.
 * @property {string} [currency] - An optional property indicating the currency related to the data or operation.
 */
interface Props {
	collection: string;
	field: string;
	value?: string | null;
	currency?: string;
}

/**
 * Represents options for formatting numbers.
 *
 * Properties:
 * - `useGrouping` (optional): A boolean indicating whether to use grouping separators, such as commas or spaces, within the number.
 * - `valueIsLocalized` (optional): A boolean indicating whether the input value is already in locale-specific format.
 *   If true, value will be parsed considering locale-specific decimal separators. If false, assumes standard dot-decimal format.
 */
interface FormatNumberOptions {
	useGrouping?: boolean;
	valueIsLocalized?: boolean;
}

//
// Core state and configuration
//

const props = defineProps<Props>();
const emit = defineEmits<{
	(e: 'input', value: string | null): void;
}>();

const rawInput = ref('');
const [,numericScale] = getFieldPrecisionAndScale(props.collection, props.field);
const scale = numericScale ?? 0;

/**
 * @computed
 * Reactive wrapper for the current locale configuration.
 * Updates automatically when locale settings change.
 *
 * @returns {LocaleSettings} Current locale settings object
 */
const localeSettings = computed(() =>
	getLocaleSettings(),
);

/**
 * @computed
 * Current locale identifier used for formatting.
 *
 * @returns {string} The current locale string
 */
const locale = computed(() => localeSettings.value.locale);

/**
 * @computed
 * Current locale's decimal separator character (e.g., '.' or ',').
 * Dynamically computed using Intl.NumberFormat based on active locale.
 *
 * @returns {string} The decimal separator character for the current locale
 */
const decimalSeparator = computed(() => {
	return new Intl.NumberFormat(locale.value)
		.format(1.1)
		.replaceAll(/\d/g, '');
});

/**
 * @computed
 * A computed property that generates a currency prefix string based on the specified locale and currency.
 * The prefix includes the currency symbol and a non-breaking space (`\u00A0`) at the end.
 * The value is formatted according to the `locale` reactive property and the `currency` prop, defaulting to 'USD' if not provided.
 *
 * The function uses the `Intl.NumberFormat` API to format the currency and extract the symbol or the specified currency code.
 * If a specific currency is provided through props, it will use the provided value; otherwise, defaults to 'USD'.
 *
 * Dependencies: `locale` (reactive property) and `props.currency` (optional prop).
 *
 * @returns {string} A string representing the currency prefix.
 */
const prefix = computed(() => {
	return `${Intl
		.NumberFormat(locale.value, {
			style: 'currency',
			currency: props?.currency || 'USD',
			currencyDisplay: 'symbol',
		})
		.formatToParts(0)
		.find((part) => part.type === 'currency')
		// Add space between currency symbol and number that won't break across lines
		?.value || props.currency}\u00A0`;
});

//
// Utility functions
//

/**
 * Sanitizes a string to contain only valid numeric characters.
 *
 * @param {string} value - Input string to clean
 * @returns String containing only digits, decimal separator, and optional leading minus
 */
function cleanValueString(value: string) {
	return value
		// First, clean everything except for numbers, commas and dots
		.replaceAll(/[^\d.,-]/g, '')
		// Then handle the minus sign specifically
		.replaceAll(/(?!^)-/g, '')
	;
}

/**
 * Sanitizes and parses a string into a floating-point number.
 * Removes invalid characters, handles locale-specific decimal separators,
 * and converts the input string into a numeric value.
 *
 * @param {string} value - The string input to sanitize and parse into a number.
 * @return The parsed floating-point number. Returns NaN if the input is invalid.
 */
function sanitizeAndParseNumber(value: string) {
	if (!value) return Number.NaN;
	if (value === '-') return 0;
	let cleanValue = cleanValueString(value);

	decimalSeparator.value === ','
		? cleanValue = cleanValue.replaceAll('.', '').replace(',', '.')
		: cleanValue = cleanValue.replaceAll(',', '');

	return Number.parseFloat(cleanValue);
}

/**
 * Rounds a given number to a specified decimal scale and returns it as a fixed-point notation string.
 *
 * @param {number} number - The number to be rounded.
 * @param {number} scale - The number of decimal places to round to.
 * @return The rounded number as a string in fixed-point notation.
 */
function roundToFixed(number: number, scale: number) {
	const multiplier = 10 ** scale;
	return (Math.round((number + Number.EPSILON) * multiplier) / multiplier).toFixed(scale);
}

/**
 * Formats a given numeric string into a localized number format.
 *
 * @param {string} value - The numeric string to be formatted.
 * @param {FormatNumberOptions} options - An object containing formatting options.
 * @param {boolean} [options.useGrouping] - Indicates whether to use grouping separators (e.g., commas).
 * @param {boolean} [options.valueIsLocalized] - Indicates whether the input value is in locale-specific format. If false (default), assumes standard dot-decimal format.
 * @return The formatted number as a string. Returns an empty string if the input value is invalid or cannot be parsed.
 */
function formatNumber(value: string, options: FormatNumberOptions) {
	const {
		useGrouping = true,
		valueIsLocalized = true,
	} = options;

	if (!value) return '';

	const number = valueIsLocalized
		? sanitizeAndParseNumber(value)
		: Number.parseFloat(cleanValueString(value));

	return !Number.isNaN(number)
		? new Intl.NumberFormat(locale.value, {
				minimumFractionDigits: scale,
				maximumFractionDigits: scale,
				useGrouping,
			}).format(number)
		: '';
}

/**
 * Validates if the input string matches our desired pattern for currency values
 * @param {string} value - The value to validate
 * @returns True if the value is valid
 */
function isValidInput(value: string) {
	if (!value) return true;
	const validPattern = new RegExp(`^-?\\d*${decimalSeparator.value}?\\d*$`);
	return validPattern.test(value);
}

//
// Core functionality
//

/**
 * @computed
 * Manages the bidirectional binding between raw input and formatted display value.
 *
 * Getter:
 * - Returns empty string for null/undefined values
 * - Preserves raw input during active editing
 * - Returns formatted value from `props.value` when not actively editing
 *
 * Setter:
 * - Handles empty/whitespace input by emitting null
 * - Sanitizes and parses numeric input
 * - Emits rounded value at specified scale for valid numbers
 * - Emits null for invalid numeric input
 */
const inputValue = computed({
	get() {
		if (props.value === null || props.value === undefined) {
			return '';
		}

		if (rawInput.value) {
			return rawInput.value;
		}

		return formatNumber(props.value, { valueIsLocalized: false });
	},
	set(value) {
		if (!value || value.trim() === '') {
			rawInput.value = '';
			emit('input', null);
			return;
		}

		const cleanValue = cleanValueString(value);
		const parsed = sanitizeAndParseNumber(cleanValue);
		rawInput.value = cleanValue;

		emit('input', Number.isNaN(parsed)
			? null
			// The reason for toFixed via rounding the value is that it is the
			// way for directus to determine a value change, letting us save
			// the item.
			: roundToFixed(parsed, scale));
	},
});

//
// Event handlers
//

/**
 * Handles the focus or blur event on an input element by updating its value
 * format based on whether the element is focused or not.
 *
 * @param {boolean} isFocused - A boolean indicating if the input element is focused.
 */
function handleFocusOrBlurEvent(isFocused: boolean) {
	if (!inputValue.value) {
		rawInput.value = '';
		return;
	}

	rawInput.value = formatNumber(inputValue.value, { useGrouping: !isFocused });
}

/**
 * Custom input handler that validates before updating
 * @param {Event} event - The input event
 */
function handleInput(event: Event) {
	const input = event.target as HTMLInputElement;
	const newValue = input.value;

	if (isValidInput(newValue)) {
		inputValue.value = newValue;
	}
	else {
		// If invalid, revert to the last valid value
		input.value = rawInput.value;
	}
}

/**
 * Handles paste events by sanitizing and formatting pasted content.
 * Prevents default paste behavior to ensure consistent number formatting.
 *
 * @param {ClipboardEvent} event - The paste event
 */
function handlePaste(event: ClipboardEvent) {
	// Prevent default paste to ensure consistent formatting across browsers
	event.preventDefault();

	const pastedText = event.clipboardData?.getData('text');
	if (!pastedText) return;

	// Clean and normalize pasted value before processing
	const cleanValue = cleanValueString(pastedText);
	const parsed = sanitizeAndParseNumber(cleanValue);

	if (!Number.isNaN(parsed)) {
		inputValue.value = formatNumber(
			parsed.toString(),
			{
				useGrouping: false,
				valueIsLocalized: false,
			},
		);
	}
}
</script>

<template>
	<v-input
		:model-value="inputValue"
		type="text"
		:prefix="prefix"
		inputmode="decimal"
		:pattern="`^-?\\d*${decimalSeparator}?\\d*$`"
		@input="handleInput"
		@paste="handlePaste"
		@blur="() => handleFocusOrBlurEvent(false)"
		@focus="() => handleFocusOrBlurEvent(true)"
	/>
</template>
