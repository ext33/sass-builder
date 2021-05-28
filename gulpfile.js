const gulp = require("gulp")
const sass = require("gulp-sass")
const fileinclude = require("gulp-file-include")
const postcss = require("gulp-postcss")
const sourcemaps = require("gulp-sourcemaps")
const cssnano = require("cssnano")
const precss = require("precss")
const autoprefixer = require("gulp-autoprefixer")
const { series } = require("gulp")
const browserSync = require("browser-sync").create()

const project_folder = "src"
const build_folder = "dist"

const plugins = [
	precss,
	autoprefixer,
	cssnano
]
const paths = {
	src: {
		html: [ project_folder + "/pages/**.html" ],
		sass: project_folder + "/sass/**.sass",
		assets: project_folder + "/assets/**/*",
		css: build_folder + "/css/**/*.css"
	},

	build: {
		html: build_folder + "/",
		css: build_folder + "/css/",
		assets: build_folder + "/assets/"
	},

	watch: {
		html: [ project_folder + "/pages/**.html", project_folder + "/components/**.html" ],
		sass: project_folder + "/sass/**/*.sass",
		assets: project_folder + "/assets/**/*"
	},

	clean: "./" + build_folder + "/"
}

// SASS Compiler and Post CSS
gulp.task("sass", (done) => {
	gulp
		.src(paths.src.sass)
		.pipe(sourcemaps.init())
		.pipe(
			sass().on("error", (err) => {
				console.error(err.message)
			})
		)
		.pipe(postcss(plugins))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(paths.build.css))
		.pipe(browserSync.stream())
	done()
})

// File include
gulp.task("fileinclude", (done) => {
	gulp
		.src(paths.src.html)
		.pipe(
			fileinclude({
				prefix: "@@",
				basepath: "@file"
			})
		)
		.pipe(gulp.dest(paths.build.html))
		.pipe(browserSync.stream())
	done()
})

// Copy assets
gulp.task("copyAssets", (done) => {
	gulp.src(paths.src.assets).pipe(gulp.dest(paths.build.assets)).pipe(browserSync.stream())
	done()
})

// Browser sync
gulp.task("serve", (done) => {
	browserSync.init({
		server: {
			baseDir: paths.clean
		},
		port: 5000,
		notify: false,
		index: "main.html",
		directory: true
	})

	gulp.watch(paths.watch.html, series("fileinclude"))
	gulp.watch(paths.watch.sass, series("sass"))
	gulp.watch(paths.watch.html).on("change", () => {
		browserSync.reload()
		done()
	})

	done()
})

gulp.task("default", series("sass", "serve", "fileinclude", "copyAssets"))
