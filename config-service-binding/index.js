const fs = require('fs');
const path = require('path');

function bindings(type, id) {
    return getBindingConfiguration(type, id)
}
function getBindingConfiguration(type, id) {
    const root = process.env.SERVICE_BINDING_ROOT
    if (root === undefined) {
        throw Error("Please set env SERVICE_BINDING_ROOT to use service bindings")
    }
    const bindingDataPath = getBindingDataPath(root, type, id)
    if (!isDefined(bindingDataPath)) {
        throw new Error('No Binding Found for app-configuration/' + id);
    }
    console.log(bindingDataPath)
    bindingData = getBindingData(bindingDataPath)
    const binding = {};
    bindingData.forEach(([mappedKey, mappedValue]) => { binding[mappedKey] = mappedValue });
    return binding
}

function isDefined(x) {
    return !(typeof x === 'undefined' || x === null);
}

function getBindingDataPath(root, type, id) {
    try {
        const candidates = fs.readdirSync(root);
        console.log(candidates)
        for (const file of candidates) {
            const bindingType = fs
                .readFileSync(path.join(root, file, 'type'))
                .toString()
                .trim();
            console.log(bindingType)
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
            fs.readFileSync(path.join(bindingDataPath, filename)).toString().trim()
        ]);
}


module.exports = {
    getBindingConfiguration,
    bindings
}