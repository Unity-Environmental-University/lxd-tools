//via https://medium.com/@tharshita13/creating-a-chrome-extension-with-react-a-step-by-step-guide-47fe9bab24a1
const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const isDevelopment = process.env.NODE_ENV !== 'production'


module.exports = {
    mode: isDevelopment ? 'development' : 'production',

    entry: {
        background: './src/background',
        content: './src/content',
        canvas: './src/canvas',
        pageFixes: './src/content/pageFixes.js',
        'ui/course': './src/ui/course',
        'ui/account': './src/ui/account',
        'ui/module': './src/ui/module',
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
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
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
            test: /\.(ts|js|css|mjs|tsx)/
        }),
        new CopyPlugin({
            patterns: [
                {from: "manifest.json", to: "../manifest.json"},
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
        ...getHtmlPlugins(["index"]),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    }

    ,
    stats: {
        errorDetails: true,
    }
    ,
    output: {
        path: path.join(__dirname, "dist/js"),
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