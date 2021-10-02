This folder contains global styles.
They will be compiled to css and copied to the dist folder:

`dist/app/styles`

Partials should start with `_` these will then compiled into any SASS file in the application that
`@import`s them.

For Partials to not be compiled into CSS, but imported into other SASS files,
the following is required in angular-cli-build.js.

`cacheExclude: [/\/_[^\/]+$/]`

See Also: https://github.com/angular/angular-cli/commit/6b45099b6a277ecd7a57f2d2e632bf40af774879

Styles:
http://blog.thoughtram.io/angular/2015/06/25/styling-angular-2-components.html