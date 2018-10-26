// For web-pack-ifying our WebVR thing: 

const HtmlWebPackPlugin = require("html-webpack-plugin");
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./src/index.html"
});

module.exports = {
	module:{
		rules:[
		// Triggers ify-loader for all javascript files in plotly.js modules directory. 
		// this is for bundling plotly. 
			{
				test: /\.js$/, 
				use:{
					loader: "ify-loader", 
				}
			}, 		
			// Bundles mp3 files via 'file-loader'. 
      {
        test: /\.mp3$/,
        loader: 'file-loader'
      },
		  {
		    // following is an example of YOUR loader config
		    test: /\.(png|jpe?g|gif)(\?.*)?$/,
		    // here I decided to put all my gltf files under a folder named 'gltf'
		    // so I added and exclude rule to my existing loader
		    exclude: /gltf/, // only add this line
		    // (etc)
		    loader: 'url-loader'
		    // options: {
		    //   limit: 10000,
		    //   name: 'img/[name].[hash:7].[ext]'
		    // }
		  },
		  // GLTF configuration: add this to rules
		  {
		    // match all .gltf files
		    test: /\.(gltf)$/,
		    loader: 'gltf-loader-2'
		  },
		  {
		    // here I match only IMAGE and BIN files under the gltf folder
		    test: /gltf.*\.(bin|png|jpe?g|gif)$/,
		    // or use url-loader if you would like to embed images in the source gltf
		    loader: 'file-loader'
		    // options: {
		    //   // output folder for bin and image files, configure as needed
		    //   name: 'gltf/[name].[hash:7].[ext]'
		    // }
		  }
		]
	}, 
	plugins: [
		htmlPlugin, 
	], 
	output: {
		path: __dirname + "/docs",
		filename: "main.js"
	}
};