import directusConfig from '@directus/eslint-config';

export default [
	...directusConfig,
	{
		ignores: ['**/*.md', '**/shims.d.ts', '**/shim.d.ts'],
	},
];
