import requests
from django.conf import settings

class RyuClient:
    def __init__(self, base_url=None):
        self.base_url = base_url or getattr(settings, 'RYU_BASE_URL', 'http://localhost:8080').rstrip('/')

    def get_switches(self):
        """Fetch all connected switches."""
        try:
            response = requests.get(f"{self.base_url}/stats/switches", timeout=3)
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return None # Return None to indicate failure

    def get_topology(self):
        """Fetch links and ports for all switches."""
        try:
            links = requests.get(f"{self.base_url}/topology/links", timeout=3).json()
            switches = requests.get(f"{self.base_url}/topology/switches", timeout=3).json()
            return {"links": links, "switches": switches}
        except requests.RequestException:
            return {"links": [], "switches": []}

    def get_flow_stats(self, dpid):
        """Get flow statistics for a specific switch."""
        try:
            response = requests.get(f"{self.base_url}/stats/flow/{dpid}", timeout=3)
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return {}

    def set_port_status(self, dpid, port_no, status):
        """Enable or disable a port (mocked/simulated if Ryu API is limited)."""
        print(f"Setting port {port_no} on switch {dpid} to {status}")
        return True
