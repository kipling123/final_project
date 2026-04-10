// static/js/topology.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Topology Engine Initializing... v3.0 (Perfected)');
    
    // Core Cytoscape instance
    const cy = window.cy = cytoscape({
        container: document.getElementById('topology-container'),
        boxSelectionEnabled: false,
        autounselectify: true,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#1e293b',
                    'label': 'data(name)',
                    'color': '#f8fafc',
                    'font-family': "'Inter', sans-serif",
                    'font-size': '12px',
                    'font-weight': '600',
                    'text-valign': 'bottom',
                    'text-margin-y': '8px',
                    'width': 45,
                    'height': 45,
                    'border-width': '2px',
                    'border-color': 'rgba(255,255,255,0.1)',
                    'overlay-padding': '8px',
                    'z-index': '10',
                    'transition-property': 'background-color, line-color, target-arrow-color, width, height, border-width, border-color, shadow-blur, scale',
                    'transition-duration': '0.4s'
                }
            },
            {
                selector: 'node.switch-new',
                style: {
                    'background-color': '#0ea5e9',
                    'shape': 'round-rectangle',
                    'width': 60,
                    'height': 60,
                    'border-width': 3,
                    'border-color': '#38bdf8',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'label': 'data(name)',
                    'color': '#ffffff',
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'z-index': 80,
                    'shadow-blur': 15,
                    'shadow-color': 'rgba(14, 165, 233, 0.4)',
                    'shadow-opacity': 0.6
                }
            },
            {
                selector: 'node.master',
                style: {
                    'background-color': '#f59e0b',
                    'shape': 'diamond',
                    'width': 75,
                    'height': 75,
                    'border-width': 3,
                    'border-color': '#fbbf24',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'label': 'data(name)',
                    'color': '#000000',
                    'font-size': '14px',
                    'font-weight': '900',
                    'z-index': 100,
                    'shadow-blur': 25,
                    'shadow-color': 'rgba(245, 158, 11, 0.5)',
                    'shadow-opacity': 0.8
                }
            },
            {
                selector: 'node.worker',
                style: {
                    'background-color': '#10b981',
                    'shape': 'rectangle',
                    'width': 90,
                    'height': 45,
                    'border-width': 2,
                    'border-color': '#34d399',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'label': 'data(name)',
                    'color': '#ffffff',
                    'font-size': '12px',
                    'font-weight': 'bold',
                    'z-index': 50,
                    'corner-radius': 6
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': 'rgba(148, 163, 184, 0.15)',
                    'target-arrow-shape': 'none',
                    'curve-style': 'bezier',
                    'label': 'data(bandwidth)',
                    'font-size': '8px',
                    'color': '#64748b',
                    'text-rotation': 'autorotate',
                    'text-margin-y': '-12px',
                    'text-background-opacity': 0,
                    'transition-property': 'line-color, width, opacity, line-dash-offset',
                    'transition-duration': '0.4s'
                }
            },
            {
                selector: '.edge-active',
                style: {
                    'line-color': '#0ea5e9',
                    'width': 3,
                    'line-style': 'dashed',
                    'line-dash-pattern': [8, 5],
                    'line-dash-offset': 0,
                    'shadow-blur': 12,
                    'shadow-color': '#0ea5e9',
                    'shadow-opacity': 0.8
                }
            },
            {
                selector: '.edge-animating',
                style: {
                    'line-dash-offset': 0
                }
            },
            {
                selector: ':selected',
                style: {
                    'border-width': '4px',
                    'border-color': '#ffffff',
                    'shadow-blur': 25,
                    'shadow-color': '#ffffff'
                }
            },
            {
                selector: '.search-match',
                style: {
                    'border-color': '#f472b6',
                    'border-width': '6px',
                    'shadow-blur': 40,
                    'shadow-color': '#f472b6'
                }
            },
            {
                selector: '.faded',
                style: {
                    'opacity': 0.15,
                    'text-opacity': 0
                }
            }
        ],
        layout: {
            name: 'cose',
            padding: 60,
            animate: true
        }
    });

    // Crawling ants animation for active edges
    let offset = 0;
    function animateActiveEdges() {
        offset = (offset + 0.5) % 13; // Match the dash pattern [8, 5] (sum is 13)
        cy.edges('.edge-animating').style('line-dash-offset', -offset);
        requestAnimationFrame(animateActiveEdges);
    }
    animateActiveEdges();

    function loadTopology() {
        console.log('Syncing Topology Data...');
        fetch('/api/topology/')
            .then(res => res.json())
            .then(data => {
                const elements = [];
                
                // Process Nodes
                data.nodes.forEach(node => {
                    let customClass = 'container';
                    const name = (node.name || '').trim().toUpperCase();

                    if (name === 'MASTER' || name.includes('K8S-MASTER')) {
                        customClass = 'master';
                    } else if (name.includes('WORKER')) {
                        customClass = 'worker';
                    } else if (node.node_type === 'switch' || name.startsWith('S')) {
                        customClass = 'switch-new';
                    }

                    elements.push({
                        data: {
                            id: node.id.toString(),
                            name: node.name,
                            node_type: node.node_type,
                            ip: node.ip_address || 'N/A'
                        },
                        classes: customClass
                    });
                });

                // Process Links
                data.links.forEach((link, idx) => {
                    if (link.source_id && link.target_id) {
                        elements.push({
                            data: {
                                id: `l${link.id || idx}`,
                                source: link.source_id.toString(),
                                target: link.target_id.toString(),
                                bandwidth: link.bandwidth ? `${link.bandwidth}G` : '10G'
                            },
                            classes: link.is_up ? 'edge-active edge-animating' : ''
                        });
                    }
                });

                cy.elements().remove();
                cy.add(elements);

                // Smart Layout Positioning
                const roots = cy.nodes().filter(n => 
                    n.classes().includes('master') || 
                    n.classes().includes('switch-new') || 
                    ['S1', 'S2', 'OVSC'].includes(n.data('name').toUpperCase())
                );

                cy.layout({ 
                    name: 'breadthfirst',
                    roots: roots.length > 0 ? roots : cy.nodes().first(),
                    directed: true,
                    padding: 80,
                    animate: true,
                    animationDuration: 1000,
                    spacingFactor: 1.2,
                    avoidOverlap: true
                }).run();
                
                cy.fit(80);
            })
            .catch(err => {
                console.error('Topology Load Failed:', err);
                showToast('Topology Sync Failed', 'error');
            });
    }

    function showToast(msg, type = 'info') {
        // Log to console or use a small UI notification if available
        console.log(`[TOAST ${type.toUpperCase()}] ${msg}`);
    }

    // Interaction Handlers
    cy.on('mouseover', 'node', (e) => {
        document.body.style.cursor = 'pointer';
        e.target.animate({ 
            style: { 'scale': 1.15, 'shadow-blur': 30 } 
        }, { duration: 250 });
    });

    cy.on('mouseout', 'node', (e) => {
        document.body.style.cursor = 'default';
        if (!e.target.hasClass('search-match')) {
            e.target.animate({ 
                style: { 'scale': 1.0, 'shadow-blur': 15 } 
            }, { duration: 250 });
        }
    });

    cy.on('tap', 'node', (evt) => {
        const node = evt.target.data();
        openDrawer(node);
    });

    function openDrawer(node) {
        const drawer = document.getElementById('details-drawer');
        if (!drawer) return;

        document.getElementById('drawer-title').innerText = node.name;
        document.getElementById('drawer-subtitle').innerText = `ID: ${node.id}`;
        document.getElementById('detail-type').innerText = (node.node_type || 'Unknown').toUpperCase();
        document.getElementById('detail-ip').innerText = node.ip || 'N/A';
        
        // Dynamic Status
        const statusEl = document.getElementById('detail-status');
        statusEl.innerHTML = '<span class="status-pill online">ONLINE</span>';
        
        drawer.classList.add('open');
        
        // Refresh detail chart if exists
        if (window.detailChart) {
            window.detailChart.data.datasets[0].data = Array(15).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
            window.detailChart.update();
        }
    }

    cy.on('tap', (e) => { 
        if (e.target === cy) {
            document.getElementById('details-drawer')?.classList.remove('open');
            cy.elements().removeClass('faded search-match');
        }
    });

    // Control listeners
    document.getElementById('fit-btn')?.addEventListener('click', () => {
        cy.animate({ fit: { padding: 60 }, duration: 800, easing: 'ease-in-out-cubic' });
    });

    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        loadTopology();
    });

    // Search Feature
    const searchInput = document.getElementById('node-search');
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        cy.elements().removeClass('faded search-match');
        
        if (term.length > 0) {
            const matches = cy.nodes().filter(node => 
                node.data('name').toLowerCase().includes(term) ||
                node.data('ip').toLowerCase().includes(term)
            );
            
            if (matches.length > 0) {
                cy.elements().addClass('faded');
                matches.removeClass('faded').addClass('search-match');
                // Auto-zoom to matches if only a few
                if (matches.length <= 3) {
                    cy.animate({ zoom: 1.2, center: { eles: matches } }, { duration: 500 });
                }
            }
        } else {
            cy.elements().removeClass('faded search-match');
        }
    });

    // Initial sequence
    loadTopology();
});