
# Create your views here.
from django.shortcuts import render

def admin_login(request):
    return render(request, "admin_login.html")

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")