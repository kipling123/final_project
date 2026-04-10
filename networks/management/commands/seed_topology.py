from django.core.management.base import BaseCommand
from networks.models import Node, Link

class Command(BaseCommand):
    help = 'Seeder for initial SDN topology'

    def handle(self, *args, **options):
        # Clear existing to avoid duplicates if re-running
        Link.objects.all().delete()
        Node.objects.all().delete()

        # Create Switches
        s1 = Node.objects.create(name='S1', node_type='switch')
        s2 = Node.objects.create(name='S2', node_type='switch')
        l1 = Node.objects.create(name='L1', node_type='switch')
        l2 = Node.objects.create(name='L2', node_type='switch')
        
        # Create Hosts
        master = Node.objects.create(name='MASTER', node_type='host', ip_address='10.0.0.100')
        worker1 = Node.objects.create(name='Worker 1', node_type='host', ip_address='10.0.0.1')
        worker2 = Node.objects.create(name='Worker 2', node_type='host', ip_address='10.0.0.2')

        # Create Links
        # Spine -> Leaf Mesh
        Link.objects.create(source=s1, target=l1, bandwidth=100.0)
        Link.objects.create(source=s1, target=l2, bandwidth=100.0)
        Link.objects.create(source=s2, target=l1, bandwidth=100.0)
        Link.objects.create(source=s2, target=l2, bandwidth=100.0)
        
        # Leaf -> Host Connections
        Link.objects.create(source=master, target=l1, bandwidth=10.0)
        Link.objects.create(source=worker1, target=l1, bandwidth=10.0)
        Link.objects.create(source=worker2, target=l2, bandwidth=10.0)

        self.stdout.write(self.style.SUCCESS('Successfully updated topology to match newest requirements'))


