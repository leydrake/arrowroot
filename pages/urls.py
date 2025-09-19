from django.urls import path
from . import views

urlpatterns = [
    path("", views.admin_login, name=""),
    path("admin_login/", views.admin_login, name="home"),
    path("dashboard/", views.admin_dashboard, name="admin_dashboard"),
]
