//via https://medium.com/@tharshita13/creating-a-chrome-extension-with-react-a-step-by-step-guide-47fe9bab24a1
const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const isDevelopment = process.env.NODE_ENV !== 'production'


module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    performance: {
        hints: isDevelopment ? false : 'warning'
    },
    entry: {
        'popup': './src/popup',

        'js/background': './src/background',
        'js/content': './src/content',
        'js/publish': './src/publish',
        'js/pageFixes': './src/content/pageFixes.js',
        'js/speedGrader': './src/ui/speedGrader',
        'js/ui/course': './src/ui/course',
        'js/ui/account': './src/ui/account',
        'js/ui/module': './src/ui/module',
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
                exclude: /node_modules/,
            },
            {
                exclude: /node_modules/,
                test: /\.(css|scss)$/i,
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
                            }
                        },
                    },
                    "sass-loader"
                ]
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),

        new webpack.SourceMapDevToolPlugin({
            exclude: /node_modules/,
            test: /\.(ts|js|s?[ca]ss|mjs|tsx)/,
            filename: '[name][ext].map'
        }),
        new CopyPlugin({
            patterns: [
                {from: "./README.dist.md", to: "README.md"},
                {from: "./manifest.json", to: "manifest.json"},
            ],
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
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    stats: {
        errorDetails: true,
    }
    ,
    output: {
        path: path.join(__dirname, "dist"),
        filename:
            '[name].js',
        chunkFilename:
            '[name]/.js'
    },

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