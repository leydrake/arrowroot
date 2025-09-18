from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
    path("admin/login/", views.admin_login, name="admin_login"),
    path("admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),
]
