import type { Config } from 'jest';
import aliases from 'module-alias-jest/register';

const config: Config = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	moduleNameMapper: aliases.jest
};

export default config;
