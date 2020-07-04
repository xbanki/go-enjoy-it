const Path = require('path');

module.exports = {
	entry: ['./src/index.ts', './src/html/index.html', './src/scss/index.scss'],
	module: {
		rules: [
			{
				test: /\.html$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]'
						}
					},
					{
						loader: 'extract-loader'
					},
					{
						loader: 'html-loader',
						options: {
							attributes: false,
							minimize: true
						}
					}
				]
			}
		]
	},
	output: {
		libraryTarget: 'umd',
		pathinfo: false
	},
	resolve: {
		extensions: [
			'css',
			'sass',
			'scss',
			'ts',
			'js',
			'json'
		],
		alias: {
			'@': Path.resolve(__dirname, '../src/')
		}
	}
};
