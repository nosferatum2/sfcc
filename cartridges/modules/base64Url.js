'use strict'

var StringUtils = require('dw/util/StringUtils');

function encode(input) {
    let output = StringUtils.encodeBase64(input);

    output = output.split('=')[0]; // Remove any trailing '='s
    output = output.replace('+', '-'); // 62nd char of encoding
    output = output.replace('/', '_'); // 63rd char of encoding

    return output;
}

function decode(input) {
    let output = input;

    output = output.replace('-', '+'); // 62nd char of encoding
    output = output.replace('_', '/'); // 63rd char of encoding

    switch (output.length % 4) // Pad with trailing '='s
    {
        case 0:
            break; // No pad chars in this case
        case 2:
            output += '==';
            break; // Two pad chars
        case 3:
            output += '=';
            break; // One pad char
        default:
            throw new Error('Illegal base64url input!');
    }

    let converted = StringUtils.decodeBase64(output); // Standard base64 decoder

    return converted;
}

module.exports = {
    encode: encode,
    decode: decode
};
