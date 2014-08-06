var fs = require('fs');
var DMA_module = require('./DMA');
var DMA = DMA_module.DMA;

var simp_dma, trad_dma;

function initialize(cedict_file) {
    var simpWordsSet = {}, tradWordsSet = {};
    var data, lines, fields;
    var simpWordsArray, tradWordsArray;

    data = fs.readFileSync(cedict_file).toString();
    lines = data.split('\n');

    lines.forEach(function(line) {
        if (line[0] !== '#') {
            fields = line.split(' ');
            if (fields[0].length !== fields[1].length) {
                throw new Error('trad length != simp length');
            }
            if (fields[0].length > 1) {
                simpWordsSet[fields[1]] = true;
                tradWordsSet[fields[0]] = true;
            }
        }
    });
    simpWordsArray = Object.keys(simpWordsSet);
    tradWordsArray = Object.keys(tradWordsSet);

    simp_dma = new DMA();
    trad_dma = new DMA();

    simp_dma.add_words(simpWordsArray);
    trad_dma.add_words(tradWordsArray);
}

function split_string(s, charset, strategy) {
    var matches;

    charset = charset || 'simp';
    strategy = strategy || 'longest_prefix_match';

    if (charset === 'simp') {
        matches = simp_dma.feed_string(s);
    } else if (charset === 'trad') {
        matches = trad_dma.feed_string(s);
    } 

    if (strategy === 'longest_prefix_match') {
        return longest_prefix_match(s, matches);
    } else if (strategy === 'minimize_number_of_words_match') {
        return minimize_number_of_words_match(s, matches);
    }
}

function longest_prefix_match(str, matches) {
    var split_str, i, j;

    // Sort matches by position ascendingly and by length descendingly
    matches.sort(function (x, y) {
        var n = x.pos - y.pos;
        
        if (n !== 0) {
            return n;
        }
        
        return y.length - x.length;
    });


    split_str = [];

    i = 0;
    j = 0;
    while (i < str.length) {
        if (j < matches.length && i === matches[j].pos) {
            split_str.push(str.slice(i, i + matches[j].length));
            i += matches[j].length;

            while (j < matches.length && matches[j].pos < i) {
                j++;
            }
        } else {
            split_str.push(str.slice(i, i + 1));
            i++;
        }
    }

    return split_str;
}

function minimize_number_of_words_match(str, matches) {

}

module.exports = {
    initialize: initialize,
    split_string: split_string
};
