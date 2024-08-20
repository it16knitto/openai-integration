module.exports = [
  {
    ...require('eslint-config-love'),
    files: ['**/*.js', '**/*.ts'],
		ignores: [
			'**/tests/**',
			'node_modules/',
			'eslint.config.js',
			'database/',
			'dist/',
			'jest.*',
			'coverage/',
			'storage/',
			'husky/',
			'github/'
		],
		rules: {
			'@typescript-eslint/indent': ['error', 'tab'],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/space-before-function-paren': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/semi': ['error', 'always', { 'omitLastInOneLineClassBody': true }],
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/quotes': ['error', 'single'],
			'@typescript-eslint/naming-convention': [
				"error",
				{
					"selector": "variable",
					"format": ['camelCase', 'snake_case', 'UPPER_CASE']
				}
			],
			'no-tabs': ['off'],
			'quote-props': 'off',
			"no-console": 'error'
		}
  },
]
