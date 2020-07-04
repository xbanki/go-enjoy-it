/* eslint-disable id-length */

const ForkTsChecker = require('fork-ts-checker-webpack-plugin');
const Webpackmerge = require('webpack-merge');
const PATH = require('path');

const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');

const UniversalConfiguration = require('./webpack.universal');

module.exports = Webpackmerge(UniversalConfiguration, {
	context: process.cwd(),
	devtool: 'inline-source-map',
	mode: 'development',
	module: {
		rules: [
			{
				include: PATH.resolve(process.cwd(), 'src/'),
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
					experimentalWatchApi: true
				},
				test: /\.ts$/
			},
			{
				test: /\.s[ca]ss$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].css'
						}
					},
					{
						loader: 'extract-loader'
					},
					{
						loader: 'css-loader?-url',
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								indentedSyntax: false
							}
						}
					}
				]
			}
		]
	},
	output: {
		path: PATH.resolve(process.cwd(), 'build/'),
		chunkFilename: '[id].chunk.js',
		filename: '[name].bundle.js'
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: PATH.resolve(process.cwd(), 'dist/'),
			verbose: true,
			dry: false
		}),
		new ForkTsChecker({
			eslint: true
		})
	]
});
