var fs = require('fs');
var Trie = require('./Trie');

var simp_trie, trad_trie;

function initialize(cedict_file) {
    var simpWordsSet = {}, tradWordsSet = {};
    var data, lines, fields;
    var simpWordsArray, tradWordsArray;

    data = fs.readFileSync(cedict_file).toString();
    lines = data.split('\n');

    lines.forEach(function(line) {
        if (line[0] !== '#') {
            fields = line.split(' ');
            simpWordsSet[fields[1]] = true;
            tradWordsSet[fields[0]] = true;
        }
    });
    simpWordsArray = Object.keys(simpWordsSet);
    tradWordsArray = Object.keys(tradWordsSet);

    simp_trie = new Trie();
    trad_trie = new Trie();

    simp_trie.add_words(simpWordsArray);
    trad_trie.add_words(tradWordsArray);
}

function split_simp_string(s) {
    return simp_trie.split_string(s);
}

function split_trad_string(s) {
    return trad_trie.split_string(s);
}

module.exports = {
    initialize: initialize,
    split_simp_string: split_simp_string,
    split_trad_string: split_trad_string
};
