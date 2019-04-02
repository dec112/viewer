const fs = require('fs');
const path = require('path');
const findRoot = require('find-root');
const args = require("args-parser")(process.argv);
const rootDirectory = findRoot(__dirname);
let languages = [];
let outputDirectory = [];
let defaultLanguage = '';

readCommandLineArguments();
createLanguageFiles();
var defaultMessages = null;

function createLanguageFiles() {
    for (var i = 0; i < languages.length; i++) {
        let messages = {};
        const currentMessageDirectory = path.join(rootDirectory, outputDirectory, `${languages[i]}.json`);
        let existingMessages = null;
        if (fs.existsSync(currentMessageDirectory)) {
            existingMessages = JSON.parse(fs.readFileSync(currentMessageDirectory));
        }
        Object.keys(defaultMessages).forEach(function (key) {
            let currentMessage = defaultMessages[key];
            if (existingMessages && existingMessages[currentMessage.id]) {
                messages[currentMessage.id] = existingMessages[currentMessage.id];
            } else {
                if (languages[i] === defaultLanguage) {
                    messages[currentMessage.id] = currentMessage.defaultMessage;
                } else {
                    messages[currentMessage.id] = "";
                }
            }
        });
        fs.writeFileSync(path.join(rootDirectory, outputDirectory, `${languages[i]}.json`), JSON.stringify(messages, null, 2));
    }
}

function readCommandLineArguments() {
    if (args['d']) {
        defaultLanguage = args['d'];
    } else {
        throw new Error("No default language specified");
    }
    if (args['o']) {
        outputDirectory = args['o'];
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
        }
    } else {
        throw new Error("No output directory specified");
    }
    if (args['l']) {
        languages = args['l'].split(',');
    } else {
        throw new Error("No languages specified");
    }
    if (args['s']) {
        if (!fs.existsSync(args['s'])) {
            throw new Error("No such file or directory");
        }
        defaultMessages = JSON.parse(fs.readFileSync(path.join(rootDirectory, args['s'])));
    } else {
        throw new Error("No template file specified");
    }
}
