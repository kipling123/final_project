from django.urls import path
from . import views

app_name = 'networks'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('topology/', views.topology_view, name='topology'),
    path('api/topology/', views.topology_data, name='topology_api'),
    path('api/ryu/stats/', views.ryu_stats, name='ryu_stats'),
    path('api/grafana/metrics/', views.grafana_metrics, name='grafana_metrics'),
    path('api/grafana/check/', views.check_grafana, name='grafana_check'),
    path('api/system/overview/', views.system_overview, name='system_overview'),
    
    # Feature Pages
    path('analytics/', views.analytics_view, name='analytics'),
    path('security/', views.security_view, name='security'),
    path('settings/', views.settings_view, name='settings'),
]
