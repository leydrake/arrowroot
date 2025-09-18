
# Create your views here.
from django.shortcuts import render

def home(request):
    return render(request, "home.html")

def about(request):
    return render(request, "about.html")

def contact(request):
    return render(request, "contact.html")

def admin_login(request):
    return render(request, "admin_login.html")

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")