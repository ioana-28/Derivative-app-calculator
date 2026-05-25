import './App.css';
import 'reactflow/dist/style.css';
import React, { useEffect, useMemo, useState, useRef } from 'react'; // Integrated useRef
import ReactFlow, { Background, Controls } from 'reactflow';
import { hierarchy, tree as d3Tree } from 'd3-hierarchy';
import { parseExpression } from './logic/ShuntingYardAlg';
import printExpression from './logic/printExpression';
import { getDerivativeSteps, getSimplificationSteps } from './logic/computeSteps';
import RBTree from './dataStructures/RBTree';

function buildHierarchy(node, path = "n") {
    if (!node) return null;
    const label = node.value === "D" ? "d/dx" : node.value.toString();
    const data = { id: path, label, children: [] };

    if (node.left) {
        const left = buildHierarchy(node.left, `${path}-l`);
        if (left) data.children.push(left);
    }

    if (node.right) {
        const right = buildHierarchy(node.right, `${path}-r`);
        if (right) data.children.push(right);
    }

    return data;
}

function buildFlowData(treeNode) {
    if (!treeNode) return { nodes: [], edges: [] };

    const rootData = buildHierarchy(treeNode);
    const root = hierarchy(rootData, (d) => d.children);
    const layout = d3Tree().nodeSize([150, 120]);
    layout(root);

    const nodes = root.descendants().map((d) => ({
        id: d.data.id,
        data: { label: d.data.label },
        position: { x: d.x, y: d.y },
        className: 'flow-node'
    }));

    const edges = root.links().map((link) => ({
        id: `e-${link.source.data.id}-${link.target.data.id}`,
        source: link.source.data.id,
        target: link.target.data.id,
        type: 'smoothstep'
    }));

    return { nodes, edges };
}

// function buildRBHierarchyFromSnapshot(snapshotNode, path = "rb") {
//     if (!snapshotNode) return null;

//     const nodeLabel = (
//         <div className="rb-label-container">
//             <div className="rb-key">{snapshotNode.key}</div>
//             <div className="rb-arrow">➔</div>
//             <div className="rb-value">{snapshotNode.computedValue}</div>
//         </div>
//     );

//     const data = {
//         id: path,
//         label: nodeLabel,
//         rbColor: snapshotNode.color,
//         children: []
//     };

//     if (snapshotNode.left) {
//         const left = buildRBHierarchyFromSnapshot(snapshotNode.left, `${path}-l`);
//         if (left) data.children.push(left);
//     }

//     if (snapshotNode.right) {
//         const right = buildRBHierarchyFromSnapshot(snapshotNode.right, `${path}-r`);
//         if (right) data.children.push(right);
//     }

//     return data;
// }


function buildRBHierarchyFromSnapshot(snapshotNode, path = "rb") {
    if (!snapshotNode) return null;

    const nodeLabel = (
        <div className="rb-label-container">
            <div className="rb-key">{snapshotNode.key}</div>
            <div className="rb-arrow">➔</div>
            <div className="rb-value">{snapshotNode.computedValue}</div>
        </div>
    );

    const data = {
        id: path,
        label: nodeLabel,
        rbColor: snapshotNode.color,
        children: []
    };

    if (snapshotNode.left) {
        const left = buildRBHierarchyFromSnapshot(snapshotNode.left, `${path}-l`);
        if (left) data.children.push(left);
    }

    if (snapshotNode.right) {
        const right = buildRBHierarchyFromSnapshot(snapshotNode.right, `${path}-r`);
        if (right) data.children.push(right);
    }

    return data;
}

const RB_NODE_MIN_WIDTH = 180;
const RB_NODE_MAX_WIDTH = 360;
const RB_NODE_MIN_HEIGHT = 88;
const RB_NODE_HORIZONTAL_PADDING = 44;
const RB_NODE_VERTICAL_PADDING = 30;
const RB_TREE_HORIZONTAL_GAP = 90;
const RB_TREE_VERTICAL_GAP = 80;

function estimateRBNodeSize(snapshotNode) {
    const keyText = String(snapshotNode.key ?? "");
    const valueText = String(snapshotNode.computedValue ?? "");
    const longestTextLength = Math.max(keyText.length, valueText.length);

    const width = Math.min(
        RB_NODE_MAX_WIDTH,
        Math.max(RB_NODE_MIN_WIDTH, Math.ceil(longestTextLength * 8) + RB_NODE_HORIZONTAL_PADDING)
    );

    const approxCharsPerLine = Math.max(14, Math.floor((width - RB_NODE_HORIZONTAL_PADDING) / 7.5));
    const keyLines = Math.max(1, Math.ceil(keyText.length / approxCharsPerLine));
    const valueLines = Math.max(1, Math.ceil(valueText.length / approxCharsPerLine));
    const height = Math.max(
        RB_NODE_MIN_HEIGHT,
        keyLines * 20 + valueLines * 22 + RB_NODE_VERTICAL_PADDING
    );

    return { width, height };
}

function measureRBTree(snapshotNode) {
    if (!snapshotNode) return { width: RB_NODE_MIN_WIDTH, height: RB_NODE_MIN_HEIGHT };

    const current = estimateRBNodeSize(snapshotNode);
    const left = measureRBTree(snapshotNode.left);
    const right = measureRBTree(snapshotNode.right);

    return {
        width: Math.max(current.width, left.width, right.width),
        height: Math.max(current.height, left.height, right.height)
    };
}

function buildRBFlowData(snapshotRoot) {
    const hierarchyData = buildRBHierarchyFromSnapshot(snapshotRoot);
    if (!hierarchyData) return { nodes: [], edges: [] };

    const { width: nodeWidth, height: nodeHeight } = measureRBTree(snapshotRoot);

    const root = hierarchy(hierarchyData, (d) => d.children);
    const layout = d3Tree().nodeSize([nodeWidth + RB_TREE_HORIZONTAL_GAP, nodeHeight + RB_TREE_VERTICAL_GAP]); 
    layout(root);

    const nodes = root.descendants().map((d) => ({
        id: d.data.id,
        data: { label: d.data.label },
        position: { x: d.x, y: d.y },
        style: {
            width: `${nodeWidth}px`,
            minHeight: `${nodeHeight}px`
        },
        className: d.data.rbColor === "RED" ? "rb-node-red" : "rb-node-black"
    }));

    const edges = root.links().map((link) => ({
        id: `rb-e-${link.source.data.id}-${link.target.data.id}`,
        source: link.source.data.id,
        target: link.target.data.id,
        type: 'smoothstep'
    }));

    return { nodes, edges };
}

function App() {
    const [inputString, setInputString] = useState("x^2 + 5x + 10");
    const [steps, setSteps] = useState([]);
    const [index, setIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(850);

    // References to control view pans and zooms imperatively
    const exprInstanceRef = useRef(null);
    const rbInstanceRef = useRef(null);

    // Animate the expression tree layout transitions smoothly
    useEffect(() => {
        if (!exprInstanceRef.current || steps.length === 0) return undefined;
        
        // Short macro-task buffer gives ReactFlow a split second to measure new dimensions first
        const timer = setTimeout(() => {
            exprInstanceRef.current.fitView({ padding: 0.2, duration: 500 });
        }, 40);
        
        return () => clearTimeout(timer);
    }, [index, steps]);

    // Animate the Red-Black tree growth smoothly
    useEffect(() => {
        if (!rbInstanceRef.current || steps.length === 0) return undefined;
        
        const timer = setTimeout(() => {
            rbInstanceRef.current.fitView({ padding: 0.25, duration: 500 });
        }, 40);
        
        return () => clearTimeout(timer);
    }, [index, steps]);

    useEffect(() => {
        handleRun(inputString);
    }, []);

    useEffect(() => {
        if (!isPlaying || steps.length === 0) return undefined;
        const interval = setInterval(() => {
            setIndex((current) => (current < steps.length - 1 ? current + 1 : current));
        }, speed);
        return () => clearInterval(interval);
    }, [isPlaying, speed, steps.length]);

    useEffect(() => {
        if (index >= steps.length - 1) {
            setIsPlaying(false);
        }
    }, [index, steps.length]);

    const handleRun = (input) => {
        try {
            const freshCache = new RBTree(); 
            const originalTree = parseExpression(input);
            const timeline = [{ tree: originalTree, label: "Original expression", phase: "Input", cacheSnapshot: null }];

            const { steps: derivSteps, finalTree } = getDerivativeSteps(originalTree, freshCache);
            derivSteps.forEach((step) => {
                timeline.push({ tree: step.tree, label: step.label, phase: "Differentiation", cacheSnapshot: step.cacheSnapshot });
            });

            const simplSteps = getSimplificationSteps(finalTree, freshCache);
            simplSteps.forEach((step) => {
                timeline.push({ tree: step.tree, label: step.label, phase: "Simplification", cacheSnapshot: step.cacheSnapshot });
            });

            setSteps(timeline);
            setIndex(0);
            setIsPlaying(false);
        } catch (error) {
            console.error("Parsing error:", error);
            alert("Invalid mathematical expression.");
        }
    };

    const currentStep = steps[index];
    const currentExpression = currentStep ? printExpression(currentStep.tree) : "";
    const flowData = useMemo(() => buildFlowData(currentStep?.tree), [currentStep]);
    const rbFlowData = useMemo(() => buildRBFlowData(currentStep?.cacheSnapshot), [currentStep]);

    return (
        <div className="app-container">
            <h1>Derivative Visualizer</h1>
            <p className="subtitle">Trace each differentiation rule, then simplify one rule at a time.</p>

            <div className="input-group">
                <input
                    type="text"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Enter expression (e.g., sin(x^2), tan(x), sqrt(x))"
                />
                <button onClick={() => handleRun(inputString)}>Compute</button>
            </div>

            <div className="hint">Supported: + - * / ^, sin, cos, tan, ln, sqrt, x, constants.</div>

            <hr />

            <div className="controls">
                <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Back</button>
                <span> Step {steps.length ? index + 1 : 0} of {steps.length} </span>
                <button
                    disabled={steps.length === 0 || index === steps.length - 1}
                    onClick={() => setIndex((i) => i + 1)}
                >
                    Next
                </button>
                <button className="play" disabled={steps.length === 0} onClick={() => setIsPlaying((value) => !value)}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <label className="speed-control">
                    <span>Speed</span>
                    <input
                        type="range"
                        min="300"
                        max="1800"
                        step="100"
                        value={speed}
                        onChange={(event) => setSpeed(Number(event.target.value))}
                    />
                    <span>{(speed / 1000).toFixed(1)}s</span>
                </label>
            </div>

            {currentStep && (
                <div className={`step-meta ${currentStep.label.includes('Cache hit') ? 'cache-hit-style' : ''}`}>
                    <div className="step-header">
                        <div className="step-phase">{currentStep.phase}</div>
                        {currentStep.label.includes('Cache hit') && (
                            <span className="cache-hit-badge">From RB Tree Cache</span>
                        )}
                    </div>
                    <div className="step-label">{currentStep.label}</div>
                    <div className="step-expression">{currentExpression}</div>
                </div>
            )}

            <div className="visualizer-grid">
                <section className="panel-container">
                    <h3 className="panel-title">Step Visualization</h3>
                    <div className="tree-panel">
                        <ReactFlow
                            onInit={(instance) => { exprInstanceRef.current = instance; }}
                            nodes={flowData.nodes}
                            edges={flowData.edges}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnDrag={true}
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            zoomOnDoubleClick={false}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            minZoom={0.2}
                            maxZoom={1.1}
                            proOptions={{ hideAttribution: true }}
                        >
                            <Background color="rgba(27, 42, 39, 0.08)" gap={18} size={1} />
                            <Controls showInteractive={false} position="bottom-right" />
                        </ReactFlow>
                    </div>
                </section>

                <section className="panel-container">
                    <h3 className="panel-title">Memoization Cache</h3>
                    <div className="tree-panel cache-panel">
                        <ReactFlow
                            onInit={(instance) => { rbInstanceRef.current = instance; }}
                            nodes={rbFlowData.nodes}
                            edges={rbFlowData.edges}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnDrag={true}
                            zoomOnScroll={true}
                            zoomOnPinch={true}
                            zoomOnDoubleClick={true}
                            fitView
                            fitViewOptions={{ padding: 0.25 }}
                            minZoom={0.15}
                            maxZoom={1.0}
                            proOptions={{ hideAttribution: true }}
                        >
                            <Background color="rgba(0, 0, 0, 0.08)" gap={20} size={1} />
                            <Controls showInteractive={false} position="bottom-right" />
                        </ReactFlow>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;