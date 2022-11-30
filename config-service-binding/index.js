const fs = require('fs');
const path = require('path');

function isDefined(x) {
    return !(typeof x === 'undefined' || x === null);
}

function loadConfiguration(id) {
    console.log("--> loadConfiguration")
    const root = process.env.SERVICE_BINDING_ROOT;
    const bindingDataPath = getBindingDataPath(root, "app-configuration", id)
    if (!isDefined(bindingDataPath)) {
        throw new Error('No Binding Found for app-configuration/' + id);
    }
    console.log(bindingDataPath)
    bindingData = getBindingData(bindingDataPath)
    console.log(bindingData)

    const binding = {};

    bindingData
        .forEach(([mappedKey, mappedValue]) =>
            //binding[mappedKey] = mappedValue        
            process.env[mappedKey] = mappedValue
        );
    console.log("<-- loadConfiguration")
}

function getBindingDataPath(root, type, id) {
    try {
        const candidates = fs.readdirSync(root);
        for (const file of candidates) {
            const bindingType = fs
                .readFileSync(path.join(root, file, 'type'))
                .toString()
                .trim();
            if (bindingType === type) {
                if (id === undefined || file.includes(id)) {
                    return path.join(root, file);
                }
            }
        }
    } catch (err) { console.log(err) }
}

function getBindingData(bindingDataPath) {
    return fs
        .readdirSync(bindingDataPath)
        .filter((filename) => !filename.startsWith('..'))
        .map((filename) => [
            filename,
            getBindValue(path.join(bindingDataPath, filename))
        ]);
}

function getBindValue(filepath) {
    const filename = path.basename(filepath);
    //console.log("getBindValue " + filepath)
    return fs.readFileSync(filepath).toString().trim();
}

module.exports.loadConfiguration = loadConfiguration;

