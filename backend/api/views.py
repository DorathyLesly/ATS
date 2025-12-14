from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Job, Application, Candidate, CVMatch
from .serializers import (
    JobSerializer, JobCreateSerializer,
    ApplicationSerializer, ApplicationUpdateSerializer,
    CandidateSerializer, CVMatchSerializer
)
import json

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        import uuid
        job = serializer.save(id=f"job-{uuid.uuid4().hex[:8]}")

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        job = self.get_object()
        job.status = 'Closed' if job.status == 'Open' else 'Open'
        job.save()
        serializer = self.get_serializer(job)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def process_cvs(self, request, pk=None):
        job = self.get_object()
        uploaded_files = request.FILES.getlist('cvs')

        if not uploaded_files:
            return Response({'error': 'No CV files provided'}, status=status.HTTP_400_BAD_REQUEST)

        if len(uploaded_files) > 100:
            return Response({'error': 'Maximum 100 CV files allowed'}, status=status.HTTP_400_BAD_REQUEST)

        processed_cvs = []

        # Mock CV processing - in real implementation, you'd use NLP libraries
        mock_skill_sets = [
            ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker'],
            ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
            ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems'],
            ['JavaScript', 'Vue.js', 'CSS', 'HTML', 'Git', 'Webpack'],
            ['SQL', 'Python', 'Tableau', 'Power BI', 'Data Analysis', 'Statistics'],
            ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'],
            ['Google Analytics', 'SEO', 'SEM', 'Content Marketing', 'HubSpot'],
            ['Sketch', 'InVision', 'Principle', 'Wireframing', 'Usability Testing']
        ]

        for i, cv_file in enumerate(uploaded_files):
            # Mock text extraction and skill identification
            skill_set = mock_skill_sets[i % len(mock_skill_sets)]

            # Calculate match score based on job requirements
            requirements_text = job.requirements.lower()
            matching_skills = [skill for skill in skill_set if skill.lower() in requirements_text]
            match_score = int((len(matching_skills) / len(skill_set)) * 100) if skill_set else 0

            processed_cv = {
                'id': f'cv-{i+1}',
                'fileName': cv_file.name,
                'skills': skill_set,
                'matchScore': match_score,
                'extractedText': f'Extracted content from {cv_file.name}... This CV contains skills in {", ".join(skill_set[:3])}...',
                'uploadedAt': timezone.now().isoformat()
            }
            processed_cvs.append(processed_cv)

        # Filter CVs with match score >= 60 and sort by score descending
        filtered_cvs = [cv for cv in processed_cvs if cv['matchScore'] >= 60]
        filtered_cvs.sort(key=lambda x: x['matchScore'], reverse=True)

        return Response({
            'total_processed': len(processed_cvs),
            'filtered_count': len(filtered_cvs),
            'filtered_cvs': filtered_cvs
        })

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer

class CVMatchViewSet(viewsets.ModelViewSet):
    queryset = CVMatch.objects.all()
    serializer_class = CVMatchSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ApplicationUpdateSerializer
        return ApplicationSerializer

    def perform_update(self, serializer):
        # Get the old status before updating
        old_status = self.get_object().status

        # Update the application
        application = serializer.save()
        new_status = application.status

        # Send email notification based on status change
        self._send_status_change_email(application, old_status, new_status)

    def _send_status_change_email(self, application, old_status, new_status):
        """Send email notifications based on application status changes."""
        candidate = application.candidate
        job = application.job

        # Screening → Interview
        if old_status == 'Screening' and new_status == 'Interview':
            subject = f'Interview Invitation – {job.title}'
            message = f"""
Hello {candidate.name},

We are pleased to move forward with your application for the {job.title} position.

Your application has been reviewed and we would like to invite you for an interview.

Please reply to this email to schedule a convenient time for your interview.

Best regards,
Talent Flow Hiring Team
            """.strip()

        # Screening/Interview → Offer
        elif (old_status in ['Screening', 'Interview']) and new_status == 'Offer':
            subject = f'Offer Letter – {job.title}'
            message = f"""
Hello {candidate.name},

Congratulations! We are excited to offer you the position of {job.title}.

Please review the attached offer letter and let us know if you have any questions.

We look forward to welcoming you to the team!

Best regards,
Talent Flow Hiring Team
            """.strip()

        # Any → Rejected
        elif new_status == 'Rejected':
            subject = f'Application Update – {job.title}'
            message = f"""
Hello {candidate.name},

Thank you for your interest in the {job.title} position and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest in our company and encourage you to apply for future opportunities that align with your skills and experience.

Best regards,
Talent Flow Hiring Team
            """.strip()

        else:
            # No email needed for other status changes
            return

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@talentflow.com',
                recipient_list=[candidate.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't fail the status update
            print(f"Failed to send email to {candidate.email}: {e}")

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        serializer = ApplicationUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_notes(self, request, pk=None):
        application = self.get_object()
        notes = request.data.get('notes', '')
        application.notes = notes
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_rating(self, request, pk=None):
        application = self.get_object()
        rating = request.data.get('rating', 0)
        application.rating = rating
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
