import ExprTreeNode from '../dataStructures/ExprTreeNode.js';
import FiniteAutomaton from '../dataStructures/FiniteAutomaton.js';

// Recognized functions (Unary Operators)
const FUNCTIONS = new Set(["cos", "sin", "ln", "tan", "sqrt", "-cos", "-sin", "-ln", "-tan", "-sqrt"]);


export function tokenize(str) {
    // Implied Multiplication
    let processed = str.replace(/\s+/g, "");
    processed = processed.replace(/(\d)(?=[a-z\(])/gi, "$1*");  
    processed = processed.replace(/(\))(?=[\dx\(])/gi, "$1*"); 
    processed = processed.replace(/(x)(?=\()/gi, "$1*");        

    // Apply tokenization using the custom Data Structure
    const fsm = new FiniteAutomaton(processed);
    const rawTokens = fsm.run();
    
    // Handle Unary Minuses
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
    // example: 3x + 2 => 3 * x + 2 => 
    // Infix: [3, '*', 'x', '+', '2']
    // Postfix: [3, 'x', '*', 2, '+']

    // more complicated example: 3x^2 + 2sin(x) => 3 * x ^ 2 + 2 * sin(x) => 
    // Infix: [3, '*', 'x', '^', '2', '+', '2', '*', 'sin', '(', 'x', ')'] 
    // Postfix: [3, 'x', '2', '^', '*', 2, 'x', 'sin', '*', '+']
       
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
            stack.push(new ExprTreeNode(token)); 
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