function printExpression(node) {
    if (!node) return "";
    if (!node.left && !node.right) return node.value;

    if (node.value === "D" && node.right) {
        return `d/dx(${printExpression(node.right)})`;
    }

    // Handle Unary Functions: cos(x), sin(x), etc.
    if (!node.left && node.right) {
        return `${node.value}(${printExpression(node.right)})`;
    }

    // Handle Binary Operators: (x + y)
    return `(${printExpression(node.left)} ${node.value} ${printExpression(node.right)})`;
}

export default printExpression;