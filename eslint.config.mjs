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
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'off', // Allow any types in test files
            "@/no-undef": "error", // TypeScript specific: disallow use of undeclared variables
            //"@/no-unused-vars": "warn", // Warn for unused variables, ignore those starting with '_'
        }
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'], // Adjust the glob pattern if necessary
    },
    {
        env: { browser: true },
    }
)