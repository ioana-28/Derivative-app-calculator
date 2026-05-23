import ExprTreeNode from '../dataStructures/ExprTreeNode.js';
import FiniteAutomaton from '../dataStructures/FiniteAutomaton.js';

// Recognized functions (Unary Operators - 1 child)
const FUNCTIONS = new Set(["cos", "sin", "ln", "tan", "sqrt", "-cos", "-sin", "-ln", "-tan", "-sqrt"]);

// export function tokenize(str) {
   
//     let processed = str.replace(/\s+/g, "");
//     processed = processed.replace(/(\d)(?=[a-z\(])/gi, "$1*");  // 2x -> 2*x, 2( -> 2*(
//     processed = processed.replace(/(\))(?=[\dx\(])/gi, "$1*"); // )2 -> )*2, )x -> )*x, )( -> )*(
//     processed = processed.replace(/(x)(?=\()/gi, "$1*");        // x( -> x*(

//     console.log("After Implied Multiplication:", processed); // Debugging output

//     // Tokenization using regex
//     const tokenRegex = /\d+(?:\.\d*)?(?:e[+-]?\d+)?|[a-z]+|[+\-*/^()]/gi;
//     const rawTokens = processed.match(tokenRegex) || [];
    
//     const tokens = [];
//     for (let i = 0; i < rawTokens.length; i++) {
//         let token = rawTokens[i];
//         const prev = tokens[tokens.length - 1];

//         // Handle Unary Minuses (e.g., -cos, -x, -5)
//         if (token === "-" && (!prev || "+-*/^(".includes(prev))) {
//             const next = rawTokens[i + 1];
//             if (next && !"+-*/^()".includes(next)) {
//                 tokens.push("-" + next);
//                 i++; 
//                 continue;
//             }
//         }
//         tokens.push(token);
//     }
//     return tokens;
// }



// export function tokenize(str) {
//     // Implied Multiplication
//     let processed = str.replace(/\s+/g, "");
//     processed = processed.replace(/(\d)(?=[a-z\(])/gi, "$1*"); 
//     processed = processed.replace(/(\))(?=[\dx\(])/gi, "$1*"); 
//     processed = processed.replace(/(x)(?=\()/gi, "$1*");

//     const tokens = [];
//     let currentState = 'START';
//     let currentToken = '';

//     // Helper functions for character types
//     const isDigit = (c) => c >= '0' && c <= '9';
//     const isLetter = (c) => /[a-z]/i.test(c);
//     const isOperator = (c) => "+-*/^()".includes(c);

//     // The Finite Automaton Loop for tokenization
//     for (let i = 0; i <= processed.length; i++) {
//         const char = processed[i];
//         const isEOF = i === processed.length; // End of File/String

//         switch (currentState) {
//             case 'START':
//                 if (isEOF) break;
//                 if (isDigit(char)) {
//                     currentState = 'INTEGER';
//                     currentToken += char;
//                 } else if (isLetter(char)) {
//                     currentState = 'WORD';
//                     currentToken += char;
//                 } else if (isOperator(char)) {
//                     // Operators are single characters, no need to change state, just push
//                     tokens.push(char); 
//                 }
//                 break;

//             case 'INTEGER':
//                 if (!isEOF && isDigit(char)) {
//                     currentToken += char; // Stay in INTEGER
//                 } else if (!isEOF && char === '.') {
//                     currentState = 'DECIMAL'; // Transition to DECIMAL
//                     currentToken += char;
//                 } else {
//                     // We hit something that isn't a number. 
//                     // Save the token, reset state, and step back one character to evaluate it from START.
//                     tokens.push(currentToken);
//                     currentToken = '';
//                     currentState = 'START';
//                     i--; 
//                 }
//                 break;

//             case 'DECIMAL':
//                 if (!isEOF && isDigit(char)) {
//                     currentToken += char; // Stay in DECIMAL
//                 } else {
//                     // End of decimal number
//                     tokens.push(currentToken);
//                     currentToken = '';
//                     currentState = 'START';
//                     i--;
//                 }
//                 break;

//             case 'WORD':
//                 if (!isEOF && isLetter(char)) {
//                     currentToken += char; // Stay in WORD (building 'sin', 'cos', etc.)
//                 } else {
//                     // End of word
//                     tokens.push(currentToken);
//                     currentToken = '';
//                     currentState = 'START';
//                     i--;
//                 }
//                 break;
//         }
//     }

//     // Unary minus handling (you can keep your existing logic for this loop)
//     const finalTokens = [];
//     for (let i = 0; i < tokens.length; i++) {
//         let token = tokens[i];
//         const prev = finalTokens[finalTokens.length - 1];
//         // Handle Unary Minuses
//         if (token === "-" && (!prev || prev === "(" || "+-*/^".includes(prev))) {
//              if (tokens[i + 1] && /[a-z]/i.test(tokens[i + 1])) {
//                 finalTokens.push("-" + tokens[++i]); // -cos, -x
//              } else if (tokens[i + 1] && !isNaN(tokens[i+1])) {
//                  finalTokens.push("-" + tokens[++i]); // -5
//              } else {
//                 finalTokens.push("-1", "*"); // fallback
//              }
//         } else {
//             finalTokens.push(token);
//         }
//     }

//     return finalTokens;
// }


export function tokenize(str) {
    // 1. Implied Multiplication
    let processed = str.replace(/\s+/g, "");
    processed = processed.replace(/(\d)(?=[a-z\(])/gi, "$1*");  
    processed = processed.replace(/(\))(?=[\dx\(])/gi, "$1*"); 
    processed = processed.replace(/(x)(?=\()/gi, "$1*");        

    // 2. Delegate to your Custom Data Structure
    const fsm = new FiniteAutomaton(processed);
    const rawTokens = fsm.run();
    
    // 3. Handle Unary Minuses
    const tokens = [];
    for (let i = 0; i < rawTokens.length; i++) {
        let token = rawTokens[i];
        const prev = tokens[tokens.length - 1];

        if (token === "-" && (!prev || prev === "(" || "+-*/^".includes(prev))) {
             if (rawTokens[i + 1] && /[a-z]/i.test(rawTokens[i + 1])) {
                tokens.push("-" + rawTokens[++i]); 
             } else if (rawTokens[i + 1] && !isNaN(rawTokens[i+1])) {
                 tokens.push("-" + rawTokens[++i]); 
             } else {
                tokens.push("-1", "*"); 
             }
        } else {
            tokens.push(token);
        }
    }

    return tokens;
}

export function infixToPostfix(tokens) {
    const output = [];
    const stack = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3,
                         "cos": 4, "sin": 4, "ln": 4, "tan": 4, "sqrt": 4,
                         "-cos": 4, "-sin": 4, "-ln": 4, "-tan": 4, "-sqrt": 4 };

    tokens.forEach(token => {
        // Operands
        if (!isNaN(token) || ["x", "-x", "e", "-e"].includes(token)) {
            output.push(token);
        } else if (FUNCTIONS.has(token) || token === "(") {
            stack.push(token);
        } else if (token === ")") {
            while (stack.length && stack[stack.length - 1] !== "(") {
                output.push(stack.pop());
            }
            if (stack.length) stack.pop(); // Remove "("
            if (stack.length && FUNCTIONS.has(stack[stack.length - 1])) {
                output.push(stack.pop());
            }
        } else {
            // Binary Operators
            while (stack.length && stack[stack.length - 1] !== "(" && 
                   precedence[stack[stack.length - 1]] >= precedence[token]) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });
    while (stack.length) output.push(stack.pop());
    return output;
}

export function buildTreeFromPostfix(postfix) {
    const stack = [];
    postfix.forEach(token => {
        if (!isNaN(token) || ["x", "-x", "e", "-e"].includes(token)) {
            stack.push(new ExprTreeNode(token)); //
        } else if (FUNCTIONS.has(token)) {
            const arg = stack.pop();
            stack.push(new ExprTreeNode(token, null, arg)); 
        } else {
            const right = stack.pop();
            const left = stack.pop();
            if (left && right) {
                stack.push(new ExprTreeNode(token, left, right)); 
            }
        }
    });
    return stack[0];
}

export function parseExpression(input) {
    const tokens = tokenize(input);
    const postfix = infixToPostfix(tokens);
    return buildTreeFromPostfix(postfix);
}