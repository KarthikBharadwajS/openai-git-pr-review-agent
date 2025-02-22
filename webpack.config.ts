const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        modules: ["node_modules"],
    },
    watchOptions: {
        ignored: /node_modules/,
    },
    target: "node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "server.js",
    },
    externals: [nodeExternals()],
    mode: "production",
};
