from django.urls import path
from . import views

app_name = 'networks'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('api/topology/', views.topology_data, name='topology_api'),
    path('api/ryu/stats/', views.ryu_stats, name='ryu_stats'),
]
