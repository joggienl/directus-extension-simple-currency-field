import { defineInterface } from '@directus/extensions-sdk';
import { DEFAULT_CURRENCIES, DEFAULT_CURRENCY } from '../shared/constants';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'currency-field',
	name: 'Currency',
	icon: 'attach_money',
	description: 'Input and store currency values',
	types: ['decimal'],
	localTypes: ['standard'],
	component: InterfaceComponent,
	options: [
		{
			field: 'currency',
			name: 'Currency',
			type: 'string',
			schema: {
				default_value: DEFAULT_CURRENCY,
			},
			meta: {
				note: 'Select the currency format that will be used for input and display.',
				interface: 'select-dropdown',
				options: {
					choices: DEFAULT_CURRENCIES,
				},
			},
		},
		{
			field: 'precisionNote',
			name: '$t:note',
			meta: {
				interface: 'presentation-notice',
				options: {
					text: 'To customize the maximum value and decimal places (e.g., between $10.00 and $999,999.000), adjust the precision and scale in the field\'s advanced settings under the "Schema" tab.',
					icon: 'info',
					style: 'info',
				},
			},
		},

	],
	recommendedDisplays: ['currency-display'],
	group: 'standard',
	preview: `<svg width="156" height="96" viewBox="0 0 156 96" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="18" y="35" width="120" height="26" rx="6" fill="var(--theme--background)" class="glow" />
		<rect x="19" y="36" width="118" height="24" rx="5" stroke="var(--theme--primary)" stroke-width="2" />
		<path d="M30.896,55 L30.896,53.333 C30.188,53.181 29.58,52.861 29.073,52.375 C28.566,51.889 28.208,51.285 28,50.563 L29.542,49.938 C29.653,50.438 29.934,50.886 30.385,51.281 C30.837,51.677 31.306,51.875 31.792,51.875 C32.333,51.875 32.778,51.736 33.125,51.458 C33.472,51.181 33.646,50.82 33.646,50.375 C33.646,49.958 33.49,49.611 33.177,49.333 C32.865,49.056 32.313,48.778 31.521,48.5 C30.438,48.111 29.646,47.684 29.146,47.219 C28.646,46.754 28.396,46.153 28.396,45.417 C28.396,44.722 28.622,44.125 29.073,43.625 C29.524,43.125 30.132,42.799 30.896,42.646 L30.896,41 L32.396,41 L32.396,42.646 C33.396,42.813 34.066,43.195 34.406,43.792 C34.747,44.389 34.924,44.701 34.938,44.729 L33.479,45.333 C33.368,44.972 33.146,44.674 32.813,44.438 C32.479,44.201 32.111,44.083 31.708,44.083 C31.222,44.083 30.819,44.208 30.5,44.458 C30.181,44.708 30.021,45.014 30.021,45.375 C30.021,45.736 30.194,46.045 30.542,46.302 C30.889,46.559 31.535,46.847 32.479,47.167 C33.451,47.486 34.16,47.903 34.604,48.417 C35.049,48.931 35.271,49.583 35.271,50.375 C35.271,51.167 35.014,51.833 34.5,52.375 C33.986,52.917 33.285,53.257 32.396,53.396 L32.396,55 L30.896,55 Z" fill="var(--theme--primary)" fill-rule="nonzero" />
		<rect x="42" y="45" width="50" height="6" rx="2" fill="var(--theme--primary)" fill-opacity="0.25" />
		<rect x="96" y="45" width="20" height="6" rx="2" fill="var(--theme--primary)" fill-opacity="0.25" />
	</svg>`,
});
