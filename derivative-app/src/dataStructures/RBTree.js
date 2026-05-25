class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.color = "RED";  
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

export default class RBTree {
    constructor() {
        this.NIL = new Node(0, null);
        this.NIL.color = "BLACK";
        this.NIL.left = this.NIL;
        this.NIL.right = this.NIL;
        this.NIL.parent = this.NIL;
        this.root = this.NIL;
    }

    

    leftRotate(x) {
        let y = x.right;
        x.right = y.left;

        if (y.left !== this.NIL) {
            y.left.parent = x;
        }
        y.parent = x.parent;

        if (x.parent === this.NIL) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }

        y.left = x;
        x.parent = y;
    }

    rightRotate(x) {
        let y = x.left;
        x.left = y.right;

        if (y.right !== this.NIL) {
            y.right.parent = x;
        }
        y.parent = x.parent;

        if (x.parent === this.NIL) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }

        y.right = x;
        x.parent = y;
    }


    fixInsert(k) {
        while (k !== this.root && k.parent.color === "RED") {
            if (k.parent === k.parent.parent.left) {
                let uncle = k.parent.parent.right;

                if (uncle.color === "RED") {
                    k.parent.color = "BLACK";
                    uncle.color = "BLACK";
                    k.parent.parent.color = "RED";
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.leftRotate(k);
                    }
                    k.parent.color = "BLACK";
                    k.parent.parent.color = "RED";
                    this.rightRotate(k.parent.parent);
                }
            } else {
                let uncle = k.parent.parent.left;

                if (uncle.color === "RED") {
                    k.parent.color = "BLACK";
                    uncle.color = "BLACK";
                    k.parent.parent.color = "RED";
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rightRotate(k);
                    }
                    k.parent.color = "BLACK";
                    k.parent.parent.color = "RED";
                    this.leftRotate(k.parent.parent);
                }
            }
        }
    
        this.root.color = "BLACK";
    }

    insert(key, value) {
        let node = new Node(key, value);
        node.left = this.NIL;
        node.right = this.NIL;

        let parent = this.NIL;
        let current = this.root;

        
        while (current !== this.NIL) {
            parent = current;
            if (node.key < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        node.parent = parent;

        if (parent === this.NIL) {
            this.root = node;
        } else if (node.key < parent.key) {
            parent.left = node;
        } else {
            parent.right = node;
        }


        if (node.parent === this.NIL) {
            node.color = "BLACK";
            return;
        }
        if (node.parent.parent === this.NIL) {
            return;
        }

        this.fixInsert(node);
    }

    inorder(node = this.root, result = []) {
        if (node !== this.NIL) {
            this.inorder(node.left, result);
            result.push(`${node.key}(${node.color})`);
            this.inorder(node.right, result);
        }
        return result;
    }

    search(key) {
        let current = this.root;
        while (current !== this.NIL) {
            if (key === current.key) return current.value;
            current = key < current.key ? current.left : current.right;
        }
        return null;
    }



}
