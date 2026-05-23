export default class FiniteAutomaton {
    constructor(inputString) {
        this.input = inputString;
        this.tokens = [];
        this.currentState = 'START';
        this.currentToken = '';
        this.index = 0;
    }

    // Helper functions
    isDigit(c) { return c >= '0' && c <= '9'; }
    isLetter(c) { return /[a-z]/i.test(c); }
    isOperator(c) { return "+-*/^()".includes(c); }

    run() {
        for (this.index = 0; this.index <= this.input.length; this.index++) {
            const char = this.input[this.index];
            const isEOF = this.index === this.input.length;

            switch (this.currentState) {
                case 'START':
                    if (isEOF) break;
                    if (this.isDigit(char)) {
                        this.currentState = 'INTEGER';
                        this.currentToken += char;
                    } else if (this.isLetter(char)) {
                        this.currentState = 'WORD';
                        this.currentToken += char;
                    } else if (this.isOperator(char)) {
                        this.tokens.push(char);
                    }
                    break;

                case 'INTEGER':
                    if (!isEOF && this.isDigit(char)) {
                        this.currentToken += char;
                    } else if (!isEOF && char === '.') {
                        this.currentState = 'DECIMAL';
                        this.currentToken += char;
                    } else {
                        this.commitTokenAndRewind();
                    }
                    break;

                case 'DECIMAL':
                    if (!isEOF && this.isDigit(char)) {
                        this.currentToken += char;
                    } else {
                        this.commitTokenAndRewind();
                    }
                    break;

                case 'WORD':
                    if (!isEOF && this.isLetter(char)) {
                        this.currentToken += char;
                    } else {
                        this.commitTokenAndRewind();
                    }
                    break;
            }
        }
        return this.tokens;
    }

    commitTokenAndRewind() {
        this.tokens.push(this.currentToken);
        this.currentToken = '';
        this.currentState = 'START';
        this.index--; 
    }
}