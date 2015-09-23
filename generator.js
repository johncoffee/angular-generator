/**
 * Generator is written for making a component.
 */
var fs = require('fs');
var program = require('commander');

String.prototype.isCharUc = function (atpos){
    var chr = this.charAt(atpos);
    return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
};

// input

program
    .version('1.0.0')
    .option('-p, --path [value]', 'Where to create the new component')
    .option('-c, --component [value]', 'The name in camelCase; eg. myNewDirective')
    .option('-n, --namespace [value]', 'Company namespace: <ns-my-directive>')
    .parse(process.argv);

var companyNameSpace = program.namespace || "ns";
var inputName = program.component || "veryDynamicThing";
var basePath = (program.path) ? program.path + "/" : "";
basePath = basePath.replace(/\\/g, "/"); // convert windows folder separator
basePath = basePath.replace(/\/\//g, "/"); // remove accidental "folder//file"

// constructor

function generate() {
    //console.log("Creating component '" + inputName + "'");

    // write files
    var files = [
        controllerNameFile,
        directiveNameFile,
        //serviceNameFile,
        partialNameFile,
    ];

//    insertLines();

    var currentError = null;
    currentError = writeFiles(files);
    if (currentError) {
        console.error("Failed ", currentError);
    }
}

// produce the settings

var controllerNameFile = inputName + ".controller.js";
var controllerName = ucFirst(inputName + "Controller");
var directiveNameFile = inputName + ".directive.js";
var directiveName = ucFirst(inputName);
var ndDirectiveName = hyphenate(inputName);
var serviceNameFile = inputName + "Data.factory.js";
var serviceName = ucFirst(inputName) + "Service";
var partialNameFile = inputName + ".partial.html";

// templates

var controllerTpl = '"use strict";\n\
\n\
{{controllerName}}.$inject = [\n\
    "$log",\n\
    "{{serviceName}}",\n\
];\n\
\n\
function {{controllerName}}($log, {{serviceName}}) {\n\
\n\
}\n\
\n\
module.exports = function(ngModule) {\n\
    ngModule.controller("{{controllerName}}", {{controllerName}});\n\
};\n\
';

var serviceTpl = '"use strict";\n\
\n\
{{serviceName}}Factory.$inject = ["$log"];\n\
\n\
function {{serviceName}}Factory($log) {\n\
    \n\
    function method() {\n\
    }\n\
    \n\
    return {\n\
        \n\
    };\n\
}\n\
\n\
module.exports = function(ngModule) {\n\
    ngModule.factory("{{serviceName}}", {{serviceName}}Factory);\n\
};\n\
';

var directiveTpl = '"use strict";\n\
\n\
{{directiveName}}Directive.$inject = ["$log"];\n\
\n\
function {{directiveName}}Directive($log) {\n\
    return {\n\
        scope: {\n\
            companyDetails: "="\n\
        },\n\
        restrict: "E",\n\
        controller: "{{controllerName}}",\n\
        controllerAs: "ctrl",\n\
        templateUrl: "{{templatePath}}",\n\
        link: function (scope, element, attrs, controller) {\n\
            if (!scope.companyDetails) {\n\
                $log.debug("missing companyDetails - did you forget?");\n\
            }\n\
        //    attrs.$observe("companyId", function (newVal) {\n\
        //        controller.setCompanyByID(newVal);\n\
        //    });\n\
        //    scope.$watch("companyName", function (newVal) {\n\
        //        if (angular.isObject(newVal)) {\n\
        //            controller.setCompany(newVal);\n\
        //        }\n\
        //    });\n\
        //    controller.setEnabled(scope.$eval(attrs.isEnabled));\n\
        },\n\
    };\n\
}\n\
\n\
\n\
module.exports = function(ngModule) {\n\
    ngModule.directive("{{companyNameSpace}}{{directiveName}}", {{directiveName}}Directive);\n\
};';

var partialTpl = '<!-- {{controllerName}} as ctrl -->\n\
\n\
<div>\n\
</div>\n\
';



// run the main logic


generate();
if (!program.component) {
    console.log("See --help on how to specify name and path for your component.");
}

// business

function insertLines() {
    console.log("Insert these lines somewhere:");
    var pathOfGenerateScript = __dirname.replace( __dirname.indexOf('nexus-frontend') ); // https://nodejs.org/docs/latest/api/globals.html#globals_dirname
    files.forEach(function(file) {
        var isJsFile = (file.indexOf(".js") > -1);
        if (isJsFile) {
            var tpl = 'require("$1/$2/$3")(ngModule);'.replace('$1', pathOfGenerateScript)
                .replace('$2', inputName )
                .replace('$3', file.replace('.js', ''));
            console.log(tpl);
        }
    });
}

function writeFiles (files) {
    var currentError = null;

    var path = basePath + inputName;
    fs.mkdir(path, onDirReady);

    function onDirReady(err) {
        currentError = err;
        if (!err) {
            files.forEach(function(file){
                writeEachFile(file, path);
            });
        }
    }

    function writeEachFile(filename, path) {
        if (!currentError) {
            var contents = "";
            var templatePath = "";

            if (filename.indexOf("controller") > -1) {
                contents = controllerTpl;
            }
            else if (filename.indexOf("factory") > -1) {
                contents = serviceTpl;
            }
            else if (filename.indexOf("directive") > -1) {
                templatePath = path + '/' + filename;
                templatePath = templatePath.replace(/\/\//g, "/");
                templatePath = templatePath.replace(/[\/\\]*source[\/\\]/, "");
                templatePath = templatePath.replace(".directive.js", ".partial.html");

                contents = directiveTpl;
            }
            if (filename.indexOf("partial") > -1) {
                contents = partialTpl;
            }

            path = path + '/' + filename;
            path = path.replace(/\/\//g, "/");

            contents = contents
                .replace(/\{\{serviceName}}/gi, serviceName)
                .replace(/\{\{controllerName}}/gi, controllerName)
                .replace(/\{\{directiveName}}/gi, directiveName)
                .replace(/\{\{ndDirectiveName}}/gi, ndDirectiveName)
                .replace(/\{\{templatePath}}/gi, templatePath)
                .replace(/\{\{companyNameSpace}}/gi, companyNameSpace);

            //console.log("Write " + path);
            fs.writeFile(path, contents, 'utf8', function (err) {
                currentError = err;
                if (!err) {
                    console.log("Created " + path);
                }
            });
        }
    }

    return currentError;
}





// helpers
function ucFirst(subject) {
    return (typeof subject === "string") ? subject.substring(0, 1).toUpperCase() + subject.substring(1) : subject;
}

function hyphenate(subject) {
    if (typeof subject === "string") {
        for (var i = subject.length-1; i > 0; i--) {
            if (subject.isCharUc(i)) {
                subject = subject.substring(0, i) + "-" + subject.substring(i);
            }
        }
        subject = subject.toLowerCase()
    }
    return subject;
}

