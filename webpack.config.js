//via https://medium.com/@tharshita13/creating-a-chrome-extension-with-react-a-step-by-step-guide-47fe9bab24a1
const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const {TsconfigPathsPlugin} = require("tsconfig-paths-webpack-plugin");

const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const isDevelopment = process.env.NODE_ENV !== 'production'


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
    entry: {
        ...Object.entries({
            'popup': './src/popup',
            'js/background': './src/background',
            'js/content': './src/content',
            'js/publish': './src/publish',
            'js/pageFixes': './src/content/pageFixes.js',
            'js/speedGrader': './src/ui/speedGrader',
            'js/ui/course': './src/ui/course',
            'js/ui/account': './src/ui/account',
            'js/ui/module': './src/ui/module',
        }).reduce((aggregator, [key, value]) => {
            return {
                ...aggregator,
                [key]: {
                    import: value,
                }
            }
        }, {})
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {noEmit: false},
                        }
                    }],
                exclude: /node_modules|dist|__test__/,
            },
            {
                test: /\.module\.css$/, // Match CSS modules
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                    },
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
                ],
            },
            {
                test: /\.css$/, // Match regular CSS files
                exclude: /\.module\.css$/, // Exclude CSS modules
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
                ],
            },
            {
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
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.SourceMapDevToolPlugin({
            exclude: /node_modules|dist/,
            test: /\.(ts|js|s?[ca]ss|mjs|tsx)/,
            filename: '[name][ext].map'
        }),
        new CopyPlugin({
            patterns: [
                {from: "./README.dist.md", to: "README.md"},
                {
                    from: path.resolve(__dirname, 'manifest.json'),
                    to: "manifest.json",
                    transform: (content, path) => {
                        let packageJson = require('./package.json');
                        console.log(JSON.stringify(packageJson));
                        let manifest = JSON.parse(content.toString());
                        manifest.version = packageJson.version;
                        return JSON.stringify(manifest, null, 2);
                    }
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
    ],
    resolve:
        {
            extensions: [".tsx", ".ts", ".js"],
            alias:
                {
                    config: path.resolve(__dirname, process.env.NODE_ENV),
                }
            ,
            plugins: [
                new TsconfigPathsPlugin({}),

            ]
        }
    ,
    stats: {
        errorDetails: true,
    }
    ,
    output: {
        path: path.join(__dirname, "../dist/"),
        filename:
            '[name].js',
        chunkFilename:
            '[name]/.js'
    }
    ,
}

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