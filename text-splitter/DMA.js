counter = 0;

function State() {
    this.is_final = false;
    this.id = counter++;
    this.children = {}
    this.matched_words = [];
    this.failure_link = null;
}
State.prototype = {
    get_child_for: function(c) {
        return this.children[c];
    },

    has_child_for: function(c) {
        if (typeof this.children[c] === 'undefined') {
            return false;
        } else {
            return true;
        }
    },
    
    add_child_for: function(c) {
        if (this.has_child_for(c)) {
            throw new Error('Already has child for this char');
        }
        
        this.children[c] = new State();
    }
};


function DMA() {
    this.root = new State();
    this.current_state = this.root;
}
DMA.prototype = {
    add_words: function(dict) {
        var max_length, char_index, word_index, is_final, state, word, prefix;

        max_length = length_of_longest_word(dict);

        for (char_index = 0; char_index < max_length; char_index++) {
            for (word_index = 0; word_index < dict.length; word_index++) {
                word = dict[word_index];

                if (char_index < word.length) {
                    prefix = word.slice(0, char_index);
                    character = word[char_index];

                    this.add_transition(dict, word, prefix, character);
                }
            }
        }
    },

    add_transition: function(dict, word, prefix, character) {
        var parent_state, child_state, failure_state;

        parent_state = this.get_state_for_string(prefix);

        if (parent_state.has_child_for(character)) {
            child_state = parent_state.get_child_for(character);

            if (word.length == prefix.length + 1) {
                child_state.is_final = true;
                child_state.matched_words.push(word);
            }
        } else {
            parent_state.add_child_for(character);
            child_state = parent_state.get_child_for(character);

            if (word.length == prefix.length + 1) {
                child_state.is_final = true;
                child_state.matched_words.push(word);
            }


            failure_state = this.get_failure_state(dict, prefix + character);
            child_state.failure_link = failure_state;
            if (failure_state.is_final) {
                child_state.is_final = true;
                child_state.matched_words = child_state.matched_words.concat(failure_state.matched_words);
            }
        }
    },

    get_failure_state: function(dict, word) {
        var suffix;

        suffix = find_longest_proper_suffix_that_is_prefix_in_dict(dict, word);

        return this.get_state_for_string(suffix);
    },

    get_state_for_string: function(str) {
        var state, i, character;

        state = this.root;

        for (i = 0; i < str.length; i++) {
            character = str[i];

            if (state.has_child_for(character)) {
                state = state.get_child_for(character);
            } else {
                return null;
            }
        }

        return state;
    },

    feed_string: function(s) {
        var state, i, character, output, j, matched_word;

        state = this.root;
        output = [];

        for (i = 0; i < s.length; i++) {
            character = s[i];

            if (state.has_child_for(character)) {

                state = state.get_child_for(character);

                if (state.is_final) {
                    for (j = 0; j < state.matched_words.length; j++) {
                        matched_word = state.matched_words[j];

                        output.push([i - matched_word.length + 1, matched_word.length]);
                    }
                }
            } else {
                do {
                    state = state.failure_link;
                } while (state !== this.root && !state.has_child_for(character));
                
                if (state === this.root && !state.has_child_for(character)) {
                    // Do nothing
                } else {
                    state = state.get_child_for(character);

                    if (state.is_final) {
                        for (j = 0; j < state.matched_words.length; j++) {
                            matched_word = state.matched_words[j];

                            output.push([i - matched_word.length + 1, matched_word.length]);
                        }
                    }
                }
            }
        }

        return output;
    },
};

function find_longest_proper_suffix_that_is_prefix_in_dict(dict, word) {
    var i, suffix, j, dict_word, prefix;

    for (i = 1; i < word.length; i++) {
        suffix = word.slice(i);

        for (j = 0; j < dict.length; j++) {
            dict_word = dict[j];

            prefix = dict_word.slice(0, suffix.length);

            if (prefix === suffix) {
                return prefix;
            }
        }
    }

    return '';
}

function length_of_longest_word(dict) {
    var i, max, length;

    max = -1;

    for (i = 0; i < dict.length; i++) {
        length = dict[i].length;

        if (length > max) {
            max = length;
        }
    }

    return max;
}

module.exports = {DMA: DMA};
