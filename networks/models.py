from django.db import models

class Node(models.Model):
    NODE_TYPES = (
        ('switch', 'Switch'),
        ('host', 'Host'),
    )
    name = models.CharField(max_length=100, unique=True)
    node_type = models.CharField(max_length=10, choices=NODE_TYPES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Link(models.Model):
    source = models.ForeignKey(Node, related_name='outgoing_links', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='incoming_links', on_delete=models.CASCADE)
    bandwidth = models.FloatField(default=100.0) # in Mbps
    latency = models.FloatField(default=0.0) # in ms
    is_up = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.source.name} <-> {self.target.name}"
