import ExprTreeNode from '../dataStructures/ExprTreeNode.js';

function isNumberValue(value) {
    return value !== null && value !== undefined && !isNaN(value);
}

function simplifyNodeOnce(node) {
    if (!node) return { node: null, changed: false, rule: null };

    const left = node.left;
    const right = node.right;
    const val = node.value;

    if (left && right && isNumberValue(left.value) && isNumberValue(right.value)) {
        const l = parseFloat(left.value);
        const r = parseFloat(right.value);
        if (val === "+") return { node: new ExprTreeNode((l + r).toString()), changed: true, rule: "Constant folding" };
        if (val === "-") return { node: new ExprTreeNode((l - r).toString()), changed: true, rule: "Constant folding" };
        if (val === "*") return { node: new ExprTreeNode((l * r).toString()), changed: true, rule: "Constant folding" };
        if (val === "/") {
            if (r !== 0) {
                return { node: new ExprTreeNode((l / r).toString()), changed: true, rule: "Constant folding" };
            }
        }
        if (val === "^") return { node: new ExprTreeNode(Math.pow(l, r).toString()), changed: true, rule: "Constant folding" };
    }

    if (val === "+") {
        if (left?.value === "0") return { node: right, changed: true, rule: "Add zero" };
        if (right?.value === "0") return { node: left, changed: true, rule: "Add zero" };
    }

    if (val === "-") {
        if (right?.value === "0") return { node: left, changed: true, rule: "Subtract zero" };
        if (left?.value === right?.value) return { node: new ExprTreeNode("0"), changed: true, rule: "Subtract self" };
    }

    if (val === "*") {
        if (left?.value === "0" || right?.value === "0") return { node: new ExprTreeNode("0"), changed: true, rule: "Multiply by zero" };
        if (left?.value === "1") return { node: right, changed: true, rule: "Multiply by one" };
        if (right?.value === "1") return { node: left, changed: true, rule: "Multiply by one" };
    }

    if (val === "^") {
        if (right?.value === "0") return { node: new ExprTreeNode("1"), changed: true, rule: "Power of zero" };
        if (right?.value === "1") return { node: left, changed: true, rule: "Power of one" };
        if (left?.value === "0") return { node: new ExprTreeNode("0"), changed: true, rule: "Zero base" };
    }

    return { node, changed: false, rule: null };
}

export function simplifyOnce(node) {
    if (!node) return { node: null, changed: false, rule: null };

    const leftResult = simplifyOnce(node.left);
    if (leftResult.changed) {
        return {
            node: new ExprTreeNode(node.value, leftResult.node, node.right),
            changed: true,
            rule: leftResult.rule
        };
    }

    const rightResult = simplifyOnce(node.right);
    if (rightResult.changed) {
        return {
            node: new ExprTreeNode(node.value, node.left, rightResult.node),
            changed: true,
            rule: rightResult.rule
        };
    }

    return simplifyNodeOnce(node);
}

export function simplify(node) {
    if (!node) return null;

    // Recursively simplify children first
    const left = simplify(node.left);
    const right = simplify(node.right);
    const val = node.value;

    // If both children are numbers, perform the math
    if (left && isNumberValue(left.value) && right && isNumberValue(right.value)) {
        const l = parseFloat(left.value);
        const r = parseFloat(right.value);
        if (val === "+") return new ExprTreeNode((l + r).toString());
        if (val === "-") return new ExprTreeNode((l - r).toString());
        if (val === "*") return new ExprTreeNode((l * r).toString());
        if (val === "/") return r !== 0 ? new ExprTreeNode((l / r).toString()) : node;
        if (val === "^") return new ExprTreeNode(Math.pow(l, r).toString());
    }

    
    if (val === "+") {
        if (left?.value === "0") return right; // 0 + f = f
        if (right?.value === "0") return left;  // f + 0 = f
    }

    if (val === "-") {
        if (right?.value === "0") return left; // f - 0 = f
        if (left?.value === right?.value) return new ExprTreeNode("0"); // f - f = 0
    }

    if (val === "*") {
        if (left?.value === "0" || right?.value === "0") return new ExprTreeNode("0"); // f * 0 = 0
        if (left?.value === "1") return right; // 1 * f = f
        if (right?.value === "1") return left;  // f * 1 = f
    }

    if (val === "^") {
        if (right?.value === "0") return new ExprTreeNode("1"); // f ^ 0 = 1
        if (right?.value === "1") return left; // f ^ 1 = f
        if (left?.value === "0") return new ExprTreeNode("0"); // 0 ^ f = 0
    }

    // Return the node with simplified children
    return new ExprTreeNode(val, left, right);
}