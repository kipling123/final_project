import requests
import os

class RyuClient:
    def __init__(self, base_url=None):
        self.base_url = base_url or os.getenv('RYU_BASE_URL', 'http://localhost:8080')

    def get_switches(self):
        """Fetch all connected switches."""
        try:
            response = requests.get(f"{self.base_url}/stats/switches")
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return []

    def get_topology(self):
        """Fetch links and ports for all switches."""
        try:
            links = requests.get(f"{self.base_url}/topology/links").json()
            switches = requests.get(f"{self.base_url}/topology/switches").json()
            return {"links": links, "switches": switches}
        except requests.RequestException:
            return {"links": [], "switches": []}

    def get_flow_stats(self, dpid):
        """Get flow statistics for a specific switch."""
        try:
            response = requests.get(f"{self.base_url}/stats/flow/{dpid}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return {}

    def set_port_status(self, dpid, port_no, status):
        """Enable or disable a port (mocked/simulated if Ryu API is limited)."""
        # Note: Standard Ryu REST API might require specific apps (rest_topology, etc.)
        # This is a placeholder for actual control logic.
        print(f"Setting port {port_no} on switch {dpid} to {status}")
        return True
