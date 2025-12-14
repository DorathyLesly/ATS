from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ApplicationViewSet, CandidateViewSet, CVMatchViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'cv-matches', CVMatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
