from django.shortcuts import render
from django.http import JsonResponse
from .models import Node, Link
from .utils.ryu_client import RyuClient

def dashboard_view(request):
    """Main dashboard view."""
    return render(request, 'dashboard/index.html')

def topology_data(request):
    """API endpoint to fetch topology for the frontend visualization."""
    nodes = list(Node.objects.all().values('id', 'name', 'node_type', 'is_active'))
    links = list(Link.objects.all().values('id', 'source_id', 'target_id', 'bandwidth', 'is_up'))
    
    return JsonResponse({
        'nodes': nodes,
        'links': links
    })

def ryu_stats(request):
    """Bridge to Ryu Controller stats."""
    client = RyuClient()
    switches = client.get_switches()
    return JsonResponse({'switches': switches})
