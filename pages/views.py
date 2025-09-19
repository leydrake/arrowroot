
# Create your views here.
from django.shortcuts import render

def admin_login(request):
    return render(request, "base.html")

def admin_dashboard(request):
    return render(request, "base.html")