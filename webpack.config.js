const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        app: "./dev/app.js",
        cv:  "./dev/cv.js",
    },
    // JS goes directly to assets/js/ — no intermediate dist/ or CopyPlugin needed
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "assets/js"),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                // Suppress @import deprecation warnings from theme SCSS.
                                // The theme uses @import throughout; migrating to @use is a
                                // separate task and not required for the build to succeed.
                                silenceDeprecations: ["import"],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        // CSS goes to assets/css/ relative to the JS output path
        new MiniCssExtractPlugin({
            filename: "../css/[name].min.css",
        }),
    ],
    devtool: "source-map",
    watchOptions: {
        ignored: /node_modules/,
    },
};
