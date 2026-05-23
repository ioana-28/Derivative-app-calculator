import ExprTreeNode from '../dataStructures/ExprTreeNode.js';
import { simplifyOnce } from '../logic/simplify.js';
import printExpression from '../logic/printExpression.js';

const DERIVATIVE_OP = "D";

// Helper to capture a visual snapshot of the RBTree structure at this specific step
// function snapshotRBTree(node, nilNode) {
//     if (!node || node === nilNode) return null;
//     return {
//         key: node.key,
//         color: node.color,
//         left: snapshotRBTree(node.left, nilNode),
//         right: snapshotRBTree(node.right, nilNode)
//     };
// }

// Helper to capture a visual snapshot of the RBTree structure at this specific step
function snapshotRBTree(node, nilNode) {
    if (!node || node === nilNode) return null;
    
    // Self-contained inline printer to guarantee flawless expression stringification
    const stringifyExpression = (exprNode) => {
        if (!exprNode) return "";
        if (!exprNode.left && !exprNode.right) return exprNode.value?.toString() ?? "";

        if (exprNode.value === "D" && exprNode.right) {
            return `d/dx(${stringifyExpression(exprNode.right)})`;
        }

        // Handle Unary Functions: cos(x), sin(x), etc.
        if (!exprNode.left && exprNode.right) {
            return `${exprNode.value}(${stringifyExpression(exprNode.right)})`;
        }

        // Handle Binary Operators: (x + y)
        return `(${stringifyExpression(exprNode.left)} ${exprNode.value} ${stringifyExpression(exprNode.right)})`;
    };

    return {
        key: node.key,
        computedValue: stringifyExpression(node.value), // Resolves directly from the cached tree node
        color: node.color,
        left: snapshotRBTree(node.left, nilNode),
        right: snapshotRBTree(node.right, nilNode)
    };
}

function isNumberValue(value) {
    return value !== null && value !== undefined && !isNaN(value);
}

function isConstantNode(node) {
    if (!node) return false;
    if (isNumberValue(node.value)) return true;
    return node.value === "e" || node.value === "-e";
}

function wrapNegation(node) {
    return new ExprTreeNode("*", new ExprTreeNode("-1"), node);
}

function makeDerivativeNode(target) {
    return new ExprTreeNode(DERIVATIVE_OP, null, target.clone());
}

function buildUnaryDerivative(func, inner) {
    const g = inner.clone();
    const gPrime = makeDerivativeNode(g);
    const isNegative = func.startsWith("-");
    const baseFunc = isNegative ? func.slice(1) : func;

    let fPrime = null;
    if (baseFunc === "sin") {
        fPrime = new ExprTreeNode("cos", null, g.clone());
        if (isNegative) fPrime = wrapNegation(fPrime);
    } else if (baseFunc === "cos") {
        fPrime = wrapNegation(new ExprTreeNode("sin", null, g.clone()));
        if (isNegative) fPrime = new ExprTreeNode("sin", null, g.clone());
    } else if (baseFunc === "tan") {
        const cosG = new ExprTreeNode("cos", null, g.clone());
        const cosSq = new ExprTreeNode("^", cosG, new ExprTreeNode("2"));
        fPrime = new ExprTreeNode("/", new ExprTreeNode("1"), cosSq);
        if (isNegative) fPrime = wrapNegation(fPrime);
    } else if (baseFunc === "ln") {
        fPrime = new ExprTreeNode("/", new ExprTreeNode("1"), g.clone());
        if (isNegative) fPrime = wrapNegation(fPrime);
    } else if (baseFunc === "sqrt") {
        const denom = new ExprTreeNode("*", new ExprTreeNode("2"), new ExprTreeNode("sqrt", null, g.clone()));
        fPrime = new ExprTreeNode("/", new ExprTreeNode("1"), denom);
        if (isNegative) fPrime = wrapNegation(fPrime);
    }

    if (!fPrime) {
        return { node: new ExprTreeNode("0"), rule: "Unsupported function" };
    }

    return { node: new ExprTreeNode("*", fPrime, gPrime), rule: "Chain rule" };
}

function deriveAtNode(target, cache = null) {
    if (!target) return { node: new ExprTreeNode("0"), rule: "Constant rule" };

    const key = printExpression(target);
    if (cache) {
        const cachedResult = cache.search(key);
        if (cachedResult) {
            return { node: cachedResult.clone(), rule: "Cache hit (Memoized)" };
        }
    }

    const val = target.value;
    let finalResult = null;

    if (isConstantNode(target)) {
        finalResult = { node: new ExprTreeNode("0"), rule: "Constant rule" };
    } else if (val === "x") {
        finalResult = { node: new ExprTreeNode("1"), rule: "Variable rule" };
    } else if (val === "-x") {
        finalResult = { node: new ExprTreeNode("-1"), rule: "Variable rule" };
    } else if (val === "+" || val === "-") {
        const left = makeDerivativeNode(target.left);
        const right = makeDerivativeNode(target.right);
        finalResult = { node: new ExprTreeNode(val, left, right), rule: val === "+" ? "Sum rule" : "Difference rule" };
    } else if (val === "*") {
        const f = target.left.clone();
        const g = target.right.clone();
        const term1 = new ExprTreeNode("*", makeDerivativeNode(f), g.clone());
        const term2 = new ExprTreeNode("*", f.clone(), makeDerivativeNode(g));
        finalResult = { node: new ExprTreeNode("+", term1, term2), rule: "Product rule" };
    } else if (val === "/") {
        const f = target.left.clone();
        const g = target.right.clone();
        const numerator = new ExprTreeNode("-",
            new ExprTreeNode("*", makeDerivativeNode(f), g.clone()),
            new ExprTreeNode("*", f.clone(), makeDerivativeNode(g))
        );
        const denominator = new ExprTreeNode("^", g.clone(), new ExprTreeNode("2"));
        finalResult = { node: new ExprTreeNode("/", numerator, denominator), rule: "Quotient rule" };
    } else if (val === "^") {
        const base = target.left.clone();
        const exp = target.right.clone();
        if (isConstantNode(exp)) {
            const nMinus1 = new ExprTreeNode("-", exp.clone(), new ExprTreeNode("1"));
            const power = new ExprTreeNode("^", base.clone(), nMinus1);
            const coeff = new ExprTreeNode("*", exp.clone(), power);
            finalResult = { node: new ExprTreeNode("*", coeff, makeDerivativeNode(base)), rule: "Power rule" };
        } else {
            const u = base.clone();
            const v = exp.clone();
            const term1 = new ExprTreeNode("*", makeDerivativeNode(v.clone()), new ExprTreeNode("ln", null, u.clone()));
            const term2 = new ExprTreeNode("*", v.clone(), new ExprTreeNode("/", makeDerivativeNode(u.clone()), u.clone()));
            const sum = new ExprTreeNode("+", term1, term2);
            const outer = new ExprTreeNode("*", new ExprTreeNode("^", u.clone(), v.clone()), sum);
            finalResult = { node: outer, rule: "General power rule" };
        }
    } else if (target.right && !target.left) {
        finalResult = buildUnaryDerivative(val, target.right);
    } else {
        finalResult = { node: new ExprTreeNode("0"), rule: "Fallback rule" };
    }

    if (cache && finalResult && finalResult.node) {
        cache.insert(key, finalResult.node.clone());
    }

    return finalResult;
}

function applyDerivativeRule(node, cache = null) {
    if (!node) return { node: null, changed: false, rule: null };

    if (node.value === DERIVATIVE_OP) {
        const result = deriveAtNode(node.right, cache);
        return { node: result.node, changed: true, rule: result.rule };
    }

    const leftResult = applyDerivativeRule(node.left, cache);
    if (leftResult.changed) {
        return {
            node: new ExprTreeNode(node.value, leftResult.node, node.right),
            changed: true,
            rule: leftResult.rule
        };
    }

    const rightResult = applyDerivativeRule(node.right, cache);
    if (rightResult.changed) {
        return {
            node: new ExprTreeNode(node.value, node.left, rightResult.node),
            changed: true,
            rule: rightResult.rule
        };
    }

    return { node, changed: false, rule: null };
}

export function getDerivativeSteps(root, cache = null) {
    const steps = [];
    let current = new ExprTreeNode(DERIVATIVE_OP, null, root.clone());

    steps.push({ 
        tree: current.clone(), 
        label: "Start differentiation",
        cacheSnapshot: cache ? snapshotRBTree(cache.root, cache.NIL) : null
    });

    let safety = 0;
    while (safety < 500) {
        const { node: next, changed, rule } = applyDerivativeRule(current, cache);
        if (!changed) break;
        current = next;
        steps.push({ 
            tree: current.clone(), 
            label: rule,
            cacheSnapshot: cache ? snapshotRBTree(cache.root, cache.NIL) : null
        });
        safety += 1;
    }

    return { steps, finalTree: current };
}

export function getSimplificationSteps(initialTree, cache = null) {
    const steps = [];
    let current = initialTree.clone();
    const finalCacheSnapshot = cache ? snapshotRBTree(cache.root, cache.NIL) : null;

    steps.push({ 
        tree: current.clone(), 
        label: "Start simplification",
        cacheSnapshot: finalCacheSnapshot
    });

    let safety = 0;
    while (safety < 500) {
        const { node: next, changed, rule } = simplifyOnce(current);
        if (!changed) break;
        current = next;
        steps.push({ 
            tree: current.clone(), 
            label: rule,
            cacheSnapshot: finalCacheSnapshot
        });
        safety += 1;
    }

    return steps;
}