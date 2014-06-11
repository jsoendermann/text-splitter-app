var fs = require('fs');
var DMA_module = require('./DMA');
var DMA = DMA_module.DMA;

var simp_dma, trad_dma;

var dma;

function initialize(cedict_file) {
    /*var simpWordsSet = {}, tradWordsSet = {};
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

    simp_dma = new DMA();
    trad_dma = new DMA();

    simp_dma.add_words(simpWordsArray);
    trad_dma.add_words(tradWordsArray);*/

    dma = new DMA();

    dma.add_words(['ab', 'aba', 'b']);
}

function split_string(s, charset) {
    /*var matchingPositions = trad_trie.feed_string(s);

    for (var i = 0; i < matchingPositions.length; i++) {
        var p = matchingPositions[i];
        console.log(s.substring(p.pos, p.pos + p.length));
    }

    console.log(matchingPositions);*/

    console.log(dma.feed_string(s));
}

module.exports = {
    initialize: initialize,
    split_string: split_string
};
