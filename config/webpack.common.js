/**
 * @author: @AngularClass
 */

const webpack = require('webpack');
const helpers = require('./helpers');
const path = require('path');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

/*
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  title: 'Udegree | Degree planning made easy',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer()
};

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  isProd = options.env === 'production';

  return {

    /*
     * Static metadata for index.html
     *
     * See: (custom attribute)
     */
    metadata: METADATA,

    /*
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
     //cache: false,

    /*
     * The entry point for the bundle
     * Our Angular.js app
     *
     * webpack will take each file and load in any dependencies.
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: {

      'polyfills': './src/polyfills.browser.ts',
      'vendor':    './src/vendor.browser.ts',
      'main':      './src/main.browser.ts'

    },

    /*
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {

      /*
       * An array of extensions that should be used to resolve modules.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: ['', '.ts', '.js', '.json'],

      // Make sure root is src
      root: helpers.root('src'),

      // remove other default values
      modulesDirectories: ['node_modules'],

    },

//includePaths[]=' + helpers.root('node_modules/ionicons/dist/scss'
    sassLoader: {
      includePaths:[helpers.root('src/assets')]
      //includePaths: [path.resolve(__dirname, "./src/assets")]
    },

    /*
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {

      /*
       * An array of applied pre and post loaders.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
       */
      preLoaders: [
        {
          test: /\.ts$/,
          loader: 'string-replace-loader',
          query: {
            search: '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
            replace: '$1.import($3).then(mod => (mod.__esModule && mod.default) ? mod.default : mod)',
            flags: 'g'
          },
          include: [helpers.root('src')]
        },

      ],

      /*
       * An array of automatically applied loaders.
       *
       * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
       * This means they are not resolved relative to the configuration file.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-loaders
       */
      loaders: [

        /*
         * Typescript loader support for .ts and Angular 2 async routes via .async.ts
         * Replace templateUrl and stylesUrl with require()
         *
         * See: https://github.com/s-panferov/awesome-typescript-loader
         * See: https://github.com/TheLarkInn/angular2-template-loader
         */
        {
          test: /\.ts$/,
          loaders: [
            '@angularclass/hmr-loader?pretty=' + !isProd + '&prod=' + isProd,
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        /*
         * Json loader support for *.json files.
         *
         * See: https://github.com/webpack/json-loader
         */
        {
          test: /\.json$/,
          loader: 'json-loader'
        },

        /*
         * to string and css loader support for *.css files
         * Returns file content as string
         *
         */
        {
          test: /\.css$/,
          loaders: ['to-string-loader', 'css-loader?url=false']
        },

        /* Raw loader support for *.html
         * Returns file content as string
         *
         * See: https://github.com/webpack/raw-loader
         */
        {
          test: /\.html$/,
          loader: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        /* File loader for supporting images, for example, in CSS files.
        */
        {
          test: /\.(jpg|png|gif|svg)$/,
          loader: 'file'
        },
        /* sass
           https://github.com/jtangelder/sass-loader
           http://blog.assaf.co/angular-2-webpack-sass-and-viewencapsulation/
           https://libraries.io/github/datatypevoid/ng2-mean-webpack
           https://github.com/AngularClass/angular2-webpack-starter/wiki/How-to-include-SCSS-in-components
           https://github.com/datatypevoid/ng2-mean-webpack/blob/master/src/app/app.ts
           http://stackoverflow.com/questions/34717203/webpack-with-sass-loader-scss-file-import-does-not-recognize-resolve-alias
http://stackoverflow.com/questions/36926521/webpack-sass-loader-cannot-dedupe-common-scss-imports
http://stackoverflow.com/questions/37402003/webpack-url-and-file-loaders-dont-working-on-angular-2-required-component-style
          We define 2 loaders, the 1st one is for our component specific CSS, the CSS that we set in the styles component meta property.
          The 2nd loader is for global CSS, which we will usually require at the top of our modules.

          There is a convention here, a file that ends with .global.scss is loaded with a chain that will make sure it end's up in the <style> tag inside <head>.
          A file NOT ending with .global.scss will end up as a CSS string, suitable for angular components.
        */
        {
          test: /\.scss$/,
          exclude: [/\.global\.scss$/],
          //http://blog.assaf.co/angular-2-webpack-sass-and-viewencapsulation/
          loaders: ['raw-loader', 'sass-loader']
        },
        {
          test: /\.global\.scss$/,
          loaders: ['style-loader', 'css-loader', 'sass-loader']
        },

              // support for sass imports
      // add CSS rules to your document:
      // `require("!style!css!sass!./file.scss");`
        // {
        //   test: /\.scss$/,
        //   loader: 'style!css!autoprefixer-loader?browsers=last 2 versions!sass',
        //   exclude: [ helpers.root('node_modules') ]
        // },

        //URL LOADER FOR FONTS
        {
          test: /\.(ttf|eot)$/,
          exclude: [ helpers.root('node_modules') ],
          //any files smaller than 10kb will be inlined as base64
          loader: 'url-loader?limit=1000'
        },
        //URL LOADER FOR  IMAGES
        {
          test: /\.(png|jpg)$/,
          exclude: [ helpers.root('node_modules') ],
          //any files smaller than 10kb will be inlined as base64
          loader: 'url-loader?limit=1000'
        }
      ],

      postLoaders: [
        {
          test: /\.js$/,
          loader: 'string-replace-loader',
          query: {
            search: 'var sourceMappingUrl = extractSourceMappingUrl\\(cssText\\);',
            replace: 'var sourceMappingUrl = "";',
            flags: 'g'
          }
        }
      ]
    },

    /*
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [

      new webpack.ContextReplacementPlugin(
        /angular(\\|\/)core/,
        path.resolve(__dirname, '../src')
      ),

      new AssetsPlugin({
        path: helpers.root('dist'),
        filename: 'webpack-assets.json',
        prettyPrint: true
      }),

      /*
       * Plugin: CommonsChunkPlugin
       * Description: Shares common code between the pages.
       * It identifies common modules and put them into a commons chunk.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
       * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
       */
      new webpack.optimize.CommonsChunkPlugin({
        name: ['polyfills', 'vendor'].reverse()
      }),

      /*
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       *
       * See: https://www.npmjs.com/package/copy-webpack-plugin
       */
      new CopyWebpackPlugin([{
        from: 'src/assets',
        to: 'assets'
      }]),

      /*
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       *
       * See: https://github.com/ampedandwired/html-webpack-plugin
       */
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        chunksSortMode: 'dependency'
      }),

      /*
       * Plugin: HtmlHeadConfigPlugin
       * Description: Generate html tags based on javascript maps.
       *
       * If a publicPath is set in the webpack output configuration, it will be automatically added to
       * href attributes, you can disable that by adding a "=href": false property.
       * You can also enable it to other attribute by settings "=attName": true.
       *
       * The configuration supplied is map between a location (key) and an element definition object (value)
       * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
       *
       * Example:
       *  Adding this plugin configuration
       *  new HtmlElementsPlugin({
       *    headTags: { ... }
       *  })
       *
       *  Means we can use it in the template like this:
       *  <%= webpackConfig.htmlElements.headTags %>
       *
       * Dependencies: HtmlWebpackPlugin
       */
      new HtmlElementsPlugin({
        headTags: require('./head-config.common')
      }),

    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: 'window',
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false,
    }

  };
}
