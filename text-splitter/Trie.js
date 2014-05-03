function Trie() {
    this.root = new State();
    this.current_state = this.root;

    this.longest_match = "";
    this.string_since_last_match = "";

    this.split_text = [];
}
Trie.prototype = {
    add_words: function(words) {
        var i;

        for (i = 0; i < words.length; i++) {
            this.add_word(words[i]);
        }
    },

    add_word: function(word) {
        var state, i, c, next_state;

        state = this.root;

        for (i = 0; i < word.length; i++) {
            c = word[i];

            next_state = state.get_child(c);

            if (typeof next_state === 'undefined') {
                state.add_child(c);
                next_state = state.get_child(c);
            }

            state = next_state;

            if (i === word.length - 1) {
                state.is_final = true;
            }
        }
    },

    feed_string: function(s) {
        var i;

        this.current_state = this.root;
        this.string_since_last_match = "";
        this.longest_match = "";

        for (i = 0; i < s.length; i++) {
            this.feed_char(s[i]);
        }
    },

    feed_char: function(c) {
        var child;

        this.string_since_last_match += c;

        child = this.current_state.get_child(c);
        if (typeof child === 'undefined') {
            this.no_child_for_char(c);
        } else {
            this.transition_to_child_state(child);
        }
    },

    no_child_for_char: function(c) {
        if (this.longest_match.length === 0) {
            this.cut_off_first_char_and_feed_rest_to_trie();
        } else {
            this.split_text.push(this.longest_match);
            this.feed_string(this.string_since_last_match);
        }
    },

    cut_off_first_char_and_feed_rest_to_trie: function() {
        this.split_text.push(this.string_since_last_match[0]);
        this.feed_string(this.string_since_last_match.substring(1));
    },

    transition_to_child_state: function(child) {
        this.current_state = child;

        if (this.current_state.is_final) {
            this.longest_match += this.string_since_last_match;
            this.string_since_last_match = "";
        }
    },

    flush: function() {
        while (this.current_state !== this.root) {
            this.split_text.push(this.longest_match);
            this.feed_string(this.string_since_last_match);
        }
    },

    split_string: function(s) {
        this.split_text = [];

        this.feed_string(s);
        this.flush();

        return this.split_text;
    }
}



function State() {
    this.is_final = false;
    this.children = [];
}
State.prototype = {
    get_child: function(c) {
        return this.children[c];
    },
    
    add_child: function(c) {
        // TODO check if there already is a child for char c
        var new_state = new State();
        this.children[c] = new_state;

        return new_state;
    }
}



module.exports = Trie;
