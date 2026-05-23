class ExprTreeNode {
    constructor(value, left = null, right = null) {
        this.value = value;
        this.left = left;
        this.right = right;
    }

    visualize(prefix = "", isLeft = true) {
        console.log(`${prefix}${isLeft ? "├── " : "└── "}${this.value}`);
        
        const nextPrefix = `${prefix}${isLeft ? "│   " : "    "}`;
        
        if (this.left) {
            this.left.visualize(nextPrefix, true);
        }
        if (this.right) {
            this.right.visualize(nextPrefix, false);
        }
    }

    clone() {
        const newNode = new ExprTreeNode(this.value);
        newNode.left = this.left ? this.left.clone() : null;
        newNode.right = this.right ? this.right.clone() : null;
        return newNode;
    }

    toD3Format() {
        const displayValue = this.value === "D" ? "d/dx" : this.value;
        const nodeData = {
            name: displayValue.toString(),
            children: []
        };

        // If a left child exists, recursively format it
        if (this.left) {
            nodeData.children.push(this.left.toD3Format());
        }

        // If a right child exists, recursively format it
        if (this.right) {
            nodeData.children.push(this.right.toD3Format());
        }

        return nodeData;
    }
}

export default ExprTreeNode;