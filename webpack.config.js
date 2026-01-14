/* eslint-disable @typescript-eslint/no-require-imports,@/no-undef */
//via https://medium.com/@tharshita13/creating-a-chrome-extension-with-react-a-step-by-step-guide-47fe9bab24a1

const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const packageJson = require('./package.json');
const {TsconfigPathsPlugin} = require("tsconfig-paths-webpack-plugin");
const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const isDevelopment = process.env.NODE_ENV !== 'production'
//const outputPath = path.resolve(__dirname, "../dist");
const relativeOutputDir = process.env.BUILD_OUTPUT_DIR || "../dist";
const outputPath = path.resolve(__dirname, relativeOutputDir);
const ZipPlugin = require("zip-webpack-plugin");

const entry = {
    'popup': './src/popup',
    'js/background': './src/background',
    'js/content': './src/content',
    'js/publish': './src/publish',
    'js/reporting' : './src/reporting',

    'js/pageFixes': './src/content/pageFixes.js',
    'js/speedGrader': './src/ui/speedGrader',
    'js/ui/course': './src/ui/course',
    'js/ui/account': './src/ui/account',
    'js/ui/module': './src/ui/module',

    'js/rubricOrganize': './src/ui/rubricOrganize/rubricOrganize.ts',
};

const postcssLoader = {
    loader: "postcss-loader",
    options: {
        postcssOptions: {
            plugins: function () {
                return [
                    require('precss'),
                    require('autoprefixer')];
            }
        },
    },
};
const cssRule = {
    test: /\.css$/, // Match regular CSS files
    exclude: /\.module\.css$/, // Exclude CSS modules
    use: [
        "style-loader",
        "css-loader",
        postcssLoader,
    ],
};

const mjsRule = {
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
};

const tsRule = {
    test: /\.tsx?$/,
    use: [{
        loader: "ts-loader",
        options: {compilerOptions: {noEmit: false},}
    }],
    exclude: /node_modules|__test__/,
};

const scssRule = {
    test: /\.(scss)$/,
    use: [
        "style-loader",
        "css-loader",
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: function () {
                        return [
                            require('precss'),
                            require('autoprefixer')
                        ];
                    }
                },
            },
        },
        "sass-loader"
    ],
};

const _module = {
    rules: [
        mjsRule,
        tsRule,
        cssRule,
        scssRule,
    ],
};


function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "React extension",
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}

const transformManifest = (content) => {
    let manifest = JSON.parse(content.toString());
    manifest.version = packageJson.version;

    return JSON.stringify(manifest, null, 2);
}

const transformUpdates = (content) => {
    let updates = JSON.parse(content.toString());

    if(!updates.addons) {
        updates.addons = {};
    }

    if (!updates.addons['lxd-extension@unity.edu']) {
        updates.addons['lxd-extension@unity.edu'] = { updates: [] };
    }

    if (updates.addons['lxd-extension@unity.edu'].updates.length === 0) {
        updates.addons['lxd-extension@unity.edu'].updates.push({});
    }

    updates.addons['lxd-extension@unity.edu'].updates[0].version = packageJson.version;
    updates.addons['lxd-extension@unity.edu'].updates[0].update_link = `ai2.unity.edu/lxd-tools/lxd-extension-${packageJson.version}.xpi`;

    return JSON.stringify(updates, null, 2);
}

const createPlugins = () => [
    new webpack.ProvidePlugin({
        process: require.resolve('process/browser'),
    }),
    new webpack.SourceMapDevToolPlugin({
        exclude: /node_modules/,
        test: /\.(ts|js|s?[ca]ss|mjs|tsx)/,
        filename: '[name][ext].map'
    }),
    new CopyPlugin({
        patterns: [
            {from: "./README.dist.md", to: "README.md"},
            {
                // eslint-disable-next-line @/no-undef
                from: path.resolve(__dirname, 'manifest.source.json'),
                to: "manifest.json",
                transform: transformManifest,
            },
            {
                from: path.resolve(__dirname, 'updates.source.json'),
                to : "updates.json",
                transform: transformUpdates,
            },
            {from: "./img/*", to: 'img/[name][ext]'}
        ]
    }),
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");
        switch (mod) {
            case "assert":
                resource.request = "assert";
                break;
        }
    }),
    ...getHtmlPlugins(["popup"]),
    new ZipPlugin({
        path: outputPath,
        filename: `lxd-extension-${packageJson.version}`,
        fileOptions: {
            mtime: new Date(),
            mode: 0o100644,
        },
        zipOptions: {
            forceZip64: false,
            zlib: {level: 9},
        },
        extension: 'xpi',
    })
];

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    performance: {
        hints: isDevelopment ? false : 'warning'
    },
    optimization: {
        minimize: false,

    },
    cache: {
        type: 'filesystem',
        allowCollectingMemory: true,
    },
    entry,
    devtool: 'source-map',
    module: _module,
    plugins: createPlugins(),
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".mjs"],
        alias: {
            config: path.resolve(__dirname, process.env.NODE_ENV || 'development'),
        },
        plugins: [
            new TsconfigPathsPlugin({}),
        ],
    },
    stats: {
        errorDetails: true,
    }
    ,
    output: {
        path: outputPath,
        filename:
            '[name].js',
        chunkFilename:
            '[name].js'
    }
}