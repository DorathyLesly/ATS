from django.contrib import admin
from .models import Job, Candidate, Application

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'location', 'status', 'created_at', 'applications_count']
    list_filter = ['status', 'department']
    search_fields = ['title', 'department']

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone']
    search_fields = ['name', 'email']

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job_title', 'status', 'applied_at', 'rating']
    list_filter = ['status', 'applied_at']
    search_fields = ['candidate__name', 'job_title']
