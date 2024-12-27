export const apiConfig = {
	extends: ["airbnb-base", "plugin:prettier/recommended"],
	rules: {
		"prettier/prettier": [
			"error",
			{
				singleQuote: true,
				endOfLine: "auto",
			},
		],
	},
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort"],
			extends: [
				"airbnb-base",
				"airbnb-typescript/base",
				"plugin:prettier/recommended",
			],
			parserOptions: {
				project: "./tsconfig.json",
				projectRootDir: "packages/api",
			},
			rules: {
				"prettier/prettier": [
					"error",
					{
						singleQuote: true,
						endOfLine: "auto",
					},
				],
				"import/extensions": [
					"error",
					"ignorePackages",
					{
						js: "never",
						jsx: "never",
						ts: "never",
						tsx: "never",
						"": "never",
					},
				],
				"@typescript-eslint/comma-dangle": "off",
				"@typescript-eslint/consistent-type-imports": "error",
				"no-restricted-syntax": [
					"error",
					"ForInStatement",
					"LabeledStatement",
					"WithStatement",
				],
				"import/prefer-default-export": "off",
				"consistent-return": "off",
				"simple-import-sort/imports": "error",
				"simple-import-sort/exports": "error",
				"import/order": "off",
				"@typescript-eslint/no-unused-vars": "off",
				"unused-imports/no-unused-imports": "error",
				"unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			},
		},
		{
			files: ["**/*.test.ts"],
			plugins: ["jest", "jest-formatting"],
			extends: [
				"plugin:jest/recommended",
				"plugin:jest-formatting/recommended",
			],
			rules: {
				"jest/no-mocks-import": "off",
			},
		},
	],
};
