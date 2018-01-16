var htmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
module.exports = {
	entry: {
		main: './src/app.js'
	},
	output: {
		path: __dirname + '/dist',
		// filename: 'bundle.js' 
		filename: 'js/[name]-bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.html$/,
				loader: 'html-loader',
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				// include: __dirname + '/src'
				include: path.resolve(__dirname, 'src'),
				exclude: path.resolve(__dirname, 'node_modules')
			},
			{
				test: /\.ts$/,
				loader: 'babel-loader!ts-loader',
				include: path.resolve(__dirname, 'src'),
				exclude: path.resolve(__dirname, 'node_modules')
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader'
			}
		]
	},
	plugins: [
		new htmlWebpackPlugin({
			// context为根目录
			filename: 'index.html',	//输出文件名称
			template: 'index.html',
			// inject: 'head'   打包到body还是head标签中
			// filename: 'main-[hash].html'
			inject: 'body',
			title: 'scrollbar'
		})
	],
	devServer: {
		port: 8081
	}
};