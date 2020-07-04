/* eslint-disable prefer-named-capture-group */
/* eslint-disable id-length */

const WebpackMerge = require('webpack-merge');
const AutoPrefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CSSNano = require('cssnano');
const PATH = require('path');

const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');

const UniversalConfiguration = require('./webpack.universal');

module.exports = WebpackMerge(UniversalConfiguration, {
	mode: 'production',
	module: {
		rules: [
			{
				exclude: /node_modules/,
				include: PATH.resolve(__dirname, '../src/'),
				loader: 'babel-loader',
				options: {
					plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-typescript'],
					presets: [
						[
							'@babel/preset-env',
							{
								corejs: {
									version: 3,
									proposals: true
								},
								targets: '> 0.25%, not dead',
								useBuiltIns: 'usage'
							}
						],
						[
							'@babel/preset-typescript',
							{
								allowDeclareFields: true,
								onlyRemoveTypeImports: true
							}
						]
					]
				},
				test: /\.ts$/

			},
			{
				exclude: /node_modules/,
				include: PATH.resolve(__dirname, '../src/'),
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
							sourceMap: false
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: [
								AutoPrefixer({
									grid: 'autoplace'
								}),
								CSSNano({
									preset: [
										'default',
										{
											discardComments: {
												removeAll: true
											}
										}
									]
								})
							]
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
							sassOptions: {
								indentedSyntax: false
							}
						}
					}
				]
			}
		]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				default: false,
				common: false,
				styles: {
					chunks: 'all',
					enforce: true,
					name: 'styles',
					test: /\.(s[ca]ss|css)$/
				}
			}
		},
		minimizer: [
			new TerserPlugin({
				cache: true,
				parallel: true,
				sourceMap: false
			})
		]
	},
	output: {
		path: PATH.resolve(process.cwd(), 'dist/'),
		chunkFilename: '[id].chunk.js',
		filename: '[name].bundle.js'
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: PATH.resolve(process.cwd(), 'dist/'),
			verbose: true,
			dry: false
		}),
		new CopyPlugin([
			{
				from: PATH.resolve(process.cwd(), 'LICENSE')
			}
		])
	]
});
