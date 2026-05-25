# Derivative Visualizer & Calculator

## Project Overview
This project is an interactive, web-based Derivative Calculator designed to compute symbolic derivatives step-by-step. Developed to demonstrate the practical application of advanced data structures, the application not only solves complex mathematical expressions but visually exposes the underlying algorithms in real-time.

The application parses standard mathematical notation, applies fundamental calculus rules (e.g., Chain Rule, Product Rule, Quotient Rule), simplifies the resulting expressions, and provides a graphical step-by-step playback. Users can observe the exact structural transformations of the abstract syntax tree (AST) alongside the real-time growth of a self-balancing memoization cache.

## Advanced Data Structures Implemented

The core of this application relies on several advanced data structures to efficiently parse, evaluate, and cache mathematical expressions.

### 1. Finite Automaton (Lexical Analyzer)
* **Source:** `src/dataStructures/FiniteAutomaton.js`
* **Role:** Tokenization and pre-processing of the input string.
* **Mechanism:** Before mathematical rules can be applied, the raw string input (e.g., `sin(2x) + 5`) must be broken down into meaningful tokens. The Deterministic Finite Automaton (DFA) reads the string character by character, transitioning through explicit states (`START`, `INTEGER`, `DECIMAL`, `WORD`). This ensures digits are accurately grouped into multidigit or decimal numbers, and letters are grouped into known functions (like `sin` or `ln`). The tokenization phase also seamlessly handles preprocessing, such as injecting implicit multiplication (converting `2x` to `2*x` or `x(` to `x*(`).

### 2. Expression Tree (Abstract Syntax Tree)
* **Source:** `src/dataStructures/ExprTreeNode.js`, `src/logic/ShuntingYardAlg.js`
* **Role:** Structural representation of the mathematical formula.
* **Mechanism:** Once tokenized, the sequence is converted from infix notation (human-readable) to postfix notation (machine-readable) utilizing the Shunting Yard algorithm. This postfix array constructs the Expression Tree—a binary tree where internal nodes are operators (`+`, `-`, `*`, `^`, `D`) or unary functions, and leaf nodes are operands (numbers or variables). The core differentiation logic recursively traverses this binary tree structure, transforming and returning new subtrees as calculus rules are applied.

### 3. Red-Black Tree (Memoization Cache)
* **Source:** `src/dataStructures/RBTree.js`
* **Role:** Algorithmic optimization of the differentiation process via caching.
* **Mechanism:** Symbolic differentiation can be highly repetitive; deriving the same sub-expression multiple times is computationally expensive. To optimize this, a custom Red-Black Tree is utilized as a memoization cache, storing expressions as keys and their computed `ExprTreeNode` results as values.
    * **Search (Retrieval):** At each computation step, before the engine calculates a derivative, the `search` method is used to check if that exact mathematical expression has been computed before. If a cache hit occurs, it instantly retrieves the previously computed branch, saving significant computational cycles.
    * **Insertion:** If the expression is not found in the cache, the derivative is calculated, and the `insert` method is used to add this new node into the Red-Black Tree.
    * **Balancing (`fixInsert`, `leftRotate`, `rightRotate`):** Every new node is initially inserted as a RED node, which can violate Red-Black tree rules (such as having two consecutive red nodes). To maintain the strict properties of a Red-Black tree (guaranteeing $O(\log n)$ height), the `fixInsert` method is automatically triggered. This helper function evaluates the colors of the parent and "uncle" nodes, applying automated node recoloring and structural adjustments using the `leftRotate` and `rightRotate` functions. These rotations rearrange the tree's pointers without breaking the binary search order, ensuring the cache remains perfectly balanced and lightning-fast.

## Core Logic Modules

In addition to the data structures, the application relies on several dedicated logic modules to process the mathematical operations:

* **`src/logic/computeSteps.js` (Calculus Engine):** The mathematical core of the application. It applies calculus rules (Product, Quotient, Chain rules, etc.) recursively to the expression tree. It records the tree's state after each transformation to generate the step-by-step timeline for the UI, while coordinating with the Red-Black Tree cache to optimize calculations.
* **`src/logic/simplify.js` (Simplification):** Scans the generated trees post-differentiation to perform algebraic simplifications. It handles constant folding (evaluating static math like `2 * 3`) and applies mathematical identities (e.g., removing redundant nodes like `+ 0`, `* 1`, or `x ^ 1`).
* **`src/logic/printExpression.js`:** A utility module that recursively traverses the `ExprTreeNode` structure and converts it back into standard, human-readable mathematical strings. This is critical for rendering the expressions in the UI and for generating the unique string keys used by the Red-Black Tree cache.

## How to Run the Program

### Prerequisites
Ensure you have a recent version of [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Execution
1.  **Open your terminal** and navigate to the root directory of the project (where the `package.json` file is located).
2.  **Install Dependencies:** Run the following command to install the required packages (`react`, `reactflow`, `d3-hierarchy`, etc.):
    ```bash
    npm install
    ```
3.  **Start the Development Server:** Launch the application locally by executing:
    ```bash
    npm run dev
    ```
    *(Note: If the project was bootstrapped with standard Create React App instead of Vite, use `npm start` instead).*
4.  **Access the Application:** Open your web browser and navigate to the local host address provided in your terminal (`http://localhost:5173`).

## Usage Guide
* **Input Expression:** Enter a valid mathematical expression in the top input field (e.g., `x^2 + 5x + 10`, `sin(x)*cos(x)`, `ln(x^2)`).
* **Compute:** Click the **Compute** button to trigger the parsing, differentiation, and simplification engines.
* **Playback Controls:** Use the **Play**, **Next**, and **Back** buttons to step chronologically through the calculation. You can adjust the timeline speed using the slider.
* **Visualizers:**
    * *Step Visualization (Left Panel):* Watch the Abstract Syntax Tree mutate as mathematical rules are actively applied and simplified.
    * *Memoization Cache (Right Panel):* Observe the Red-Black Tree growing dynamically as intermediate derivatives are cached. Nodes are color-coded (Red/Black) to reflect the data structure's internal balancing state.