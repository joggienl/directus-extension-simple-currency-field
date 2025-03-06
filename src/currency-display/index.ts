import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'currency-display',
	name: 'Currency',
	icon: 'attach_money',
	description: 'Display formatted currency values',
	types: ['decimal'],
	localTypes: ['standard'],
	component: DisplayComponent,
	options: null,
});
