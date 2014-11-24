var path = require("path");

module.exports = function(grunty){

  var bowerScripts = [];
  var uglifyScripts = ["modalBasic.js"];

  grunty.initConfig({
    pkg: grunty.file.readJSON("package.json"),
    less: {
      all: {
        options: {
          paths: ["/"],
          compress: true
        },
        files: {
          "modalBasic.min.css" : "modalBasic.less"
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      libs: {
        files: {
          "modalBasic.min.js" : uglifyScripts
        }
      }
    },
    watch: {
      options: {
        spawn: false
      },
      scripts: {
        files: ["*.js"],
        tasks: ["uglify:libs"]
      },
      css: {
        files: ["*.less"],
        tasks: ["less"]
      }
    },
    focus: {
      all: {
        include: ["scripts", "css"]
      }
    }

  })

  grunty.loadNpmTasks("grunt-contrib-uglify");
  grunty.loadNpmTasks("grunt-contrib-watch");
  grunty.loadNpmTasks("grunt-contrib-less");
  grunty.loadNpmTasks("grunt-focus");

  grunty.registerTask("default", ["focus:all"]);
}