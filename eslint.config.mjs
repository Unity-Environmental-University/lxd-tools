import globals from "globals";
import tseslint from "typescript-eslint";


export default tseslint.config(
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
            }
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'off',
        }
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'], // Adjust the glob pattern if necessary
    },
)