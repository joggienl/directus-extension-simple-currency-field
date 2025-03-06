import { useStores } from '@directus/extensions-sdk';

/** Represents a language/locale identifier (e.g., 'en-US', 'fr-FR') */
type Locale = string;

/** Settings object containing locale configuration */
interface LocaleSettings {
	locale: Locale;
}

/**
 * Retrieves the locale settings based on user preferences and system defaults.
 *
 * @returns {LocaleSettings} An object containing the resolved locale,
 * prioritizing user language settings, then system defaults, falling back to 'en-US'.
 */
export function getLocaleSettings(): LocaleSettings {
	const { useUserStore, useSettingsStore } = useStores();
	const userStore = useUserStore();
	const settingsStore = useSettingsStore();

	return {
		locale:
			userStore.currentUser?.language
			|| settingsStore.settings?.default_language
			|| 'en-US',
	};
}

/** Represents the precision of a numeric field (total number of digits). Null if not specified */
type NumberPrecision = number | null;

/** Represents the scale of a numeric field (digits after decimal point). Null if not specified */
type NumberScale = number | null;

/**
 * Retrieves the numeric precision and scale for a specified field in a given collection.
 *
 * @param {string} collection The name of the collection containing the field.
 * @param {string} fieldKey The key or name of the field whose precision and scale are to be retrieved.
 * @return {[NumberPrecision, NumberScale]} A tuple containing the numeric precision and numeric scale of the field.
 */
export function getFieldPrecisionAndScale(collection: string, fieldKey: string): [NumberPrecision, NumberScale] {
	const { useFieldsStore } = useStores();
	const fieldsStore = useFieldsStore();
	const field = fieldsStore.getField(collection, fieldKey);

	const {
		numeric_precision,
		numeric_scale,
	} = field.schema;

	return [numeric_precision, numeric_scale];
}
