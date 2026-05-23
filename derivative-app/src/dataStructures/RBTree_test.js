import RBTree from './RBTree.js';

function runRBTreeTests() {
    console.log("====================================");
    console.log("      RED-BLACK TREE TEST SUITE     ");
    console.log("====================================\n");

    const tree = new RBTree();

    // 1. Test Insertion
    console.log("--- 1. Testing Insertion ---");
    const testData = [
        { key: 10, value: "Value A" },
        { key: 20, value: "Value B" },
        { key: 30, value: "Value C" }, // This should trigger a left rotation
        { key: 15, value: "Value D" }, // This should trigger recoloring
        { key: 5,  value: "Value E" }
    ];

    testData.forEach(data => {
        tree.insert(data.key, data.value);
        console.log(`Inserted Key: ${data.key}`);
    });

    // Use the inorder method to verify structure and colors
    console.log("\nTree Structure (Inorder):");
    console.log(tree.inorder().join("  ->  "));


    // 2. Test Search
    console.log("--- 2. Testing Search ---");
    const searchKey1 = 15;
    const searchResult1 = tree.search(searchKey1);
    console.log(`Search for key ${searchKey1}:`, searchResult1 !== null ? `Found '${searchResult1}'` : "Not Found");

    const searchKey2 = 99;
    const searchResult2 = tree.search(searchKey2);
    console.log(`Search for key ${searchKey2}:`, searchResult2 !== null ? `Found '${searchResult2}'` : "Not Found");
    console.log();

    // 3. Test Minimum
    console.log("--- 3. Testing Minimum ---");
    const minNode = tree.minimum();
    // Remember that minimum() returns the actual Node object, not just the value
    console.log(`Minimum Key in Tree: ${minNode.key} (Value: ${minNode.value})\n`);

    // 4. Test Deletion
    console.log("--- 4. Testing Deletion ---");
    const deleteKey = 20;
    console.log(`Deleting Key: ${deleteKey}...`);
    tree.deleteNode(deleteKey);

    console.log(`Search for key ${deleteKey} after deletion:`, tree.search(deleteKey) !== null ? "Found" : "Not Found");
    
    console.log("\nTree Structure After Deletion (Inorder):");
    console.log(tree.inorder().join("  ->  "));
    

    // 5. Test Update (Duplicate Key)
    console.log("--- 5. Testing Cache Update (Duplicate Key) ---");
    console.log(`Inserting Key 10 with new value "UPDATED VALUE"...`);
    tree.insert(10, "UPDATED VALUE");
    console.log(`Search for key 10: Found '${tree.search(10)}'`);
    
    console.log("\n====================================");
    console.log("            TESTS COMPLETE          ");
    console.log("====================================");
}

// Execute the tests
runRBTreeTests();