document.addEventListener('DOMContentLoaded', function() {
    const cy = cytoscape({
        container: document.getElementById('topology-container'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#3b82f6',
                    'label': 'data(name)',
                    'color': '#f8fafc',
                    'font-size': '12px',
                    'text-valign': 'bottom',
                    'text-margin-y': '5px',
                    'width': '40px',
                    'height': '40px',
                    'overlay-padding': '6px',
                    'z-index': '10'
                }
            },
            {
                selector: 'node[node_type="switch"]',
                style: {
                    'background-color': '#8b5cf6',
                    'shape': 'round-rectangle'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#475569',
                    'target-arrow-color': '#475569',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: ':selected',
                style: {
                    'background-color': '#f59e0b',
                    'line-color': '#f59e0b',
                    'target-arrow-color': '#f59e0b',
                    'source-arrow-color': '#f59e0b'
                }
            }
        ],
        layout: {
            name: 'cose',
            padding: 50
        }
    });

    function loadTopology() {
        fetch('/api/topology/')
            .then(res => res.json())
            .then(data => {
                const elements = [];
                
                // Add nodes
                data.nodes.forEach(node => {
                    elements.push({
                        data: {
                            id: node.id.toString(),
                            name: node.name,
                            node_type: node.node_type
                        }
                    });
                });

                // Add links
                data.links.forEach(link => {
                    elements.push({
                        data: {
                            id: `l${link.id}`,
                            source: link.source_id.toString(),
                            target: link.target_id.toString()
                        }
                    });
                });

                cy.elements().remove();
                cy.add(elements);
                cy.layout({ name: 'cose' }).run();
            })
            .catch(err => console.error('Error loading topology:', err));
    }

    // Initial load
    loadTopology();

    // UI Buttons
    document.getElementById('fit-btn').addEventListener('click', () => {
        cy.fit();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadTopology();
    });

    // Handle node selection for "Advanced Config"
    cy.on('tap', 'node', function(evt){
        const node = evt.target.data();
        console.log('Selected node:', node);
        // Here we can trigger a modal or terminal view
    });
});
