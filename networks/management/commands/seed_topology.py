from django.core.management.base import BaseCommand
from networks.models import Node, Link

class Command(BaseCommand):
    help = 'Seeder for initial SDN topology'

    def handle(self, *args, **options):
        # Create Nodes
        s1, _ = Node.objects.get_or_create(name='Spine Switch 1', node_type='switch')
        s2, _ = Node.objects.get_or_create(name='Spine Switch 2', node_type='switch')
        l1, _ = Node.objects.get_or_create(name='Leaf Switch 1', node_type='switch')
        l2, _ = Node.objects.get_or_create(name='Leaf Switch 2', node_type='switch')
        
        h1, _ = Node.objects.get_or_create(name='Hadoop Master', node_type='host', ip_address='10.0.0.1')
        h2, _ = Node.objects.get_or_create(name='Hadoop Worker 1', node_type='host', ip_address='10.0.0.2')
        h3, _ = Node.objects.get_or_create(name='Hadoop Worker 2', node_type='host', ip_address='10.0.0.3')

        # Create Links
        Link.objects.get_or_create(source=s1, target=l1)
        Link.objects.get_or_create(source=s1, target=l2)
        Link.objects.get_or_create(source=s2, target=l1)
        Link.objects.get_or_create(source=s2, target=l2)
        
        Link.objects.get_or_create(source=l1, target=h1)
        Link.objects.get_or_create(source=l2, target=h2)
        Link.objects.get_or_create(source=l2, target=h3)

        self.stdout.write(self.style.SUCCESS('Successfully seeded SDN topology'))
