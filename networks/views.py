from django.shortcuts import render
from django.http import JsonResponse
from .models import Node, Link
from .utils.ryu_client import RyuClient
from .utils.grafana_client import GrafanaClient

from django.conf import settings

def dashboard_view(request):
    """Main dashboard view."""
    context = {
        'grafana_url': getattr(settings, 'GRAFANA_URL', 'http://localhost:3000'),
    }
    return render(request, 'dashboard/index.html', context)

def topology_view(request):
    """Dedicated topology monitoring view."""
    return render(request, 'dashboard/topology.html')

def topology_data(request):
    """API endpoint to fetch topology for the frontend visualization."""
    nodes = list(Node.objects.all().values('id', 'name', 'node_type', 'is_active', 'ip_address'))
    links = list(Link.objects.all().values('id', 'source_id', 'target_id', 'bandwidth', 'is_up', 'source__name', 'target__name'))
    
    return JsonResponse({
        'nodes': nodes,
        'links': links
    })

def ryu_stats(request):
    """Bridge to Ryu Controller stats."""
    client = RyuClient()
    switches = client.get_switches()
    return JsonResponse({'switches': switches})

def grafana_metrics(request):
    """Fetch live metrics from Grafana/Prometheus."""
    client = GrafanaClient()
    
    # Example queries for OVS or general interface traffic
    # Adjust these to match your actual Prometheus metrics
    # Use more flexible queries that exclude loopback and virtual bridges
    default_in = 'sum(rate(node_network_receive_bytes_total{device!~"lo|docker.*|br-.*|veth.*"}[1m])) * 8 / 1000000'
    default_out = 'sum(rate(node_network_transmit_bytes_total{device!~"lo|docker.*|br-.*|veth.*"}[1m])) * 8 / 1000000'
    
    query_in = request.GET.get('query_in', default_in)
    query_out = request.GET.get('query_out', default_out)
    
    data_in = client.get_metric_data(query_in)
    data_out = client.get_metric_data(query_out)
    
    # If API fails or returns no data, provide a structured response with status
    if not data_in or 'data' not in data_in:
        return JsonResponse({
            'status': 'error',
            'message': 'Grafana connection failed or no data',
            'data': None
        })

    return JsonResponse({
        'status': 'success',
        'inbound': data_in.get('data', {}).get('result', []),
        'outbound': data_out.get('data', {}).get('result', [])
    })

def analytics_view(request):
    """Analytics dashboard view."""
    return render(request, 'dashboard/analytics.html')

def security_view(request):
    """Security operations view."""
    return render(request, 'dashboard/security.html')

def settings_view(request):
    """System settings view."""
    return render(request, 'dashboard/settings.html')

def check_grafana(request):
    """Diagnostic endpoint for Grafana connectivity."""
    client = GrafanaClient()
    result = client.test_connection()
    return JsonResponse(result)

def system_overview(request):
    """Unified status for all system components."""
    g_client = GrafanaClient()
    r_client = RyuClient()
    
    # Check Components
    g_health = g_client.test_connection()
    switches = r_client.get_switches()
    iface_stats = g_client.get_interface_stats()
    
    status = {
        'grafana': g_health.get('status') == 'success',
        'prometheus': g_health.get('status') == 'success', # Proxy check
        'ryu': switches is not None,
        'node_count': Node.objects.count(),
        'link_count': Link.objects.count(),
        'active_nodes': Node.objects.filter(is_active=True).count(),
        'interfaces': iface_stats
    }
    
    return JsonResponse(status)
