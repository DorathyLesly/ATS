from rest_framework import serializers
from .models import Job, Candidate, Application, CVMatch

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class CVMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVMatch
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = CandidateSerializer(read_only=True)

    class Meta:
        model = Application
        fields = '__all__'

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        exclude = ['id', 'created_at', 'applications_count']

class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'notes', 'rating']
