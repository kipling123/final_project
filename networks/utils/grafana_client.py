import requests
from django.conf import settings

class GrafanaClient:
    def __init__(self):
        self.base_url = getattr(settings, 'GRAFANA_URL', 'http://localhost:3000').rstrip('/')
        self.api_key = getattr(settings, 'GRAFANA_API_KEY', '')
        self.headers = {
            'Content-Type': 'application/json',
        }
        if self.api_key:
            self.headers['Authorization'] = f'Bearer {self.api_key}'
        self._prometheus_id = None

    def test_connection(self):
        """Check if Grafana API is reachable and token is valid."""
        endpoint = f"{self.base_url}/api/health"
        try:
            response = requests.get(endpoint, headers=self.headers, timeout=3)
            return {
                'status': 'success' if response.status_code == 200 else 'error',
                'code': response.status_code,
                'message': response.json().get('message', 'OK') if response.status_code == 200 else 'Unauthorized or Error'
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def _get_prometheus_ds_id(self):
        """Discover the ID of the Prometheus datasource."""
        if self._prometheus_id:
            return self._prometheus_id
        
        endpoint = f"{self.base_url}/api/datasources"
        try:
            response = requests.get(endpoint, headers=self.headers, timeout=3)
            if response.status_code == 200:
                datasources = response.json()
                for ds in datasources:
                    if ds.get('type') == 'prometheus':
                        self._prometheus_id = ds.get('id')
                        return self._prometheus_id
        except:
            pass
        return 1 # Fallback to 1

    def get_metric_data(self, query, start=None, end=None, step='15s'):
        """Fetch data from Prometheus through Grafana Datasource Proxy."""
        ds_id = self._get_prometheus_ds_id()
        endpoint = f"{self.base_url}/api/datasources/proxy/{ds_id}/api/v1/query_range"
        
        import time
        if not end:
            end = int(time.time())
        if not start:
            start = end - 300 # 5 minutes
            
        params = {
            'query': query,
            'start': start,
            'end': end,
            'step': step
        }
        
        try:
            response = requests.get(endpoint, headers=self.headers, params=params, timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Grafana API Error: {e} | Endpoint: {endpoint}")
            return None

    def get_interface_stats(self):
        """Fetch TX/RX rates for all interfaces discovered in Prometheus."""
        ds_id = self._get_prometheus_ds_id()
        endpoint = f"{self.base_url}/api/datasources/proxy/{ds_id}/api/v1/query"
        
        # Queries for current rate
        q_rx = 'rate(node_network_receive_bytes_total{device!~"lo"}[1m]) * 8'
        q_tx = 'rate(node_network_transmit_bytes_total{device!~"lo"}[1m]) * 8'
        
        results = {}
        try:
            rx_data = requests.get(endpoint, headers=self.headers, params={'query': q_rx}, timeout=5).json()
            tx_data = requests.get(endpoint, headers=self.headers, params={'query': q_tx}, timeout=5).json()
            
            # Merge results by device/instance
            if rx_data.get('status') == 'success':
                for res in rx_data.get('data', {}).get('result', []):
                    dev = res['metric'].get('device', 'unknown')
                    val = float(res['value'][1])
                    if dev not in results: results[dev] = {'rx': 0, 'tx': 0, 'host': res['metric'].get('instance', 'N/A')}
                    results[dev]['rx'] = val
            
            if tx_data.get('status') == 'success':
                for res in tx_data.get('data', {}).get('result', []):
                    dev = res['metric'].get('device', 'unknown')
                    val = float(res['value'][1])
                    if dev not in results: results[dev] = {'rx': 0, 'tx': 0, 'host': res['metric'].get('instance', 'N/A')}
                    results[dev]['tx'] = val
            
            return results
        except Exception as e:
            print(f"Interface Stats Error: {e}")
            return {}
