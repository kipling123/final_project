// static/js/topology.js
document.addEventListener('DOMContentLoaded', function() {
    const cy = cytoscape({
        container: document.getElementById('topology-container'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#32d1ff', /* --accent */
                    'label': 'data(name)',
                    'color': '#d8d9da', /* --text-primary */
                    'font-family': 'Inter, sans-serif',
                    'font-size': '10px',
                    'text-valign': 'bottom',
                    'text-margin-y': '8px',
                    'width': '34px',
                    'height': '34px',
                    'border-width': '2px',
                    'border-color': '#111217',
                    'overlay-padding': '6px',
                    'z-index': '10'
                }
            },
            {
                selector: '.switch',
                style: {
                    'background-color': '#ff9d2a', /* --accent-orange */
                    'shape': 'rectangle',
                    'width': '46px',
                    'height': '32px'
                }
            },
            {
                selector: '.container',
                style: {
                    'background-color': '#73bf69',
                    'shape': 'ellipse'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': 'rgba(115, 191, 105, 0.5)', /* --online transparentish */
                    'target-arrow-color': 'rgba(115, 191, 105, 0.5)',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(bandwidth)',
                    'font-size': '8px',
                    'color': '#909192',
                    'text-rotation': 'autorotate',
                    'text-margin-y': '-10px'
                }
            },
            {
                selector: ':selected',
                style: {
                    'background-color': '#ffffff',
                    'line-color': '#ffffff',
                    'target-arrow-color': '#ffffff',
                    'source-arrow-color': '#ffffff',
                    'border-color': '#32d1ff',
                    'border-width': '3px'
                }
            },
            {
                selector: '.edge-active',
                style: {
                    'line-style': 'dashed',
                    'line-dash-pattern': [6, 3]
                }
            }
        ],
        layout: {
            name: 'cose',
            padding: 50
        }
    });

    function loadTopology() {
        console.log('Fetching topology data...');
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
                        },
                        // Map node_type to classes for styling
                        classes: node.node_type === 'switch' ? 'switch' : 'container'
                    });
                });

                // Add links
                data.links.forEach(link => {
                    elements.push({
                        data: {
                            id: `l${link.id}`,
                            source: link.source_id.toString(),
                            target: link.target_id.toString(),
                            bandwidth: link.bandwidth || 'N/A' // Use bandwidth if available
                        },
                        classes: (link.bandwidth && parseFloat(link.bandwidth) > 0) ? 'edge-active' : ''
                    });
                });

                cy.elements().remove();
                cy.add(elements);
                cy.layout({ name: 'cose', animate: true }).run();
            })
            .catch(err => console.error('Error loading topology:', err));
    }

    // Initial load
    loadTopology();

    // UI Buttons
    const fitBtn = document.getElementById('fit-btn');
    if (fitBtn) fitBtn.addEventListener('click', () => cy.fit());

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => loadTopology());

    // Handle node selection
    cy.on('tap', 'node', function(evt){
        const node = evt.target.data();
        console.log('Selected node:', node);
    });
});