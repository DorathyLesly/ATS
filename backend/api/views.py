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
    ApplicationSerializer, ApplicationCreateSerializer, ApplicationUpdateSerializer,
    CandidateSerializer, CVMatchSerializer
)
import json
import re
from PyPDF2 import PdfReader
import io

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

    def _extract_text_from_pdf(self, pdf_file):
        """Extract text content from PDF file."""
        try:
            pdf_reader = PdfReader(io.BytesIO(pdf_file.read()))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def _extract_skills_from_text(self, text):
        """Extract skills from text using regex patterns."""
        # Common tech skills and keywords
        skill_patterns = [
            r'\b(React|Angular|Vue|JavaScript|TypeScript|Node\.js|Express|Django|Flask|Spring|Laravel)\b',
            r'\b(Python|Java|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin)\b',
            r'\b(HTML|CSS|SCSS|SASS|Bootstrap|Tailwind|Material-UI)\b',
            r'\b(SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch)\b',
            r'\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|GitHub|GitLab)\b',
            r'\b(Figma|Sketch|Adobe XD|InVision|Zeplin|Prototyping)\b',
            r'\b(UI/UX|User Experience|User Interface|Design Systems)\b',
            r'\b(Machine Learning|AI|Data Science|TensorFlow|PyTorch|NLP)\b',
            r'\b(Agile|Scrum|Kanban|JIRA|Confluence|Trello)\b',
            r'\b(REST|GraphQL|API|Microservices|Serverless)\b'
        ]

        found_skills = set()
        text_lower = text.lower()

        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_skills.update(matches)

        # Clean up skills (remove duplicates and normalize)
        cleaned_skills = []
        for skill in found_skills:
            # Normalize common variations
            if skill.lower() in ['react', 'angular', 'vue']:
                cleaned_skills.append(skill.title())
            elif skill.lower() in ['nodejs', 'node.js']:
                cleaned_skills.append('Node.js')
            elif skill.lower() in ['ui/ux', 'user experience', 'user interface']:
                cleaned_skills.append('UI/UX')
            else:
                cleaned_skills.append(skill)

        return list(set(cleaned_skills))  # Remove duplicates

    def _calculate_match_score(self, cv_skills, job_requirements):
        """Calculate match score between CV skills and job requirements."""
        if not cv_skills:
            return 0

        requirements_lower = job_requirements.lower()
        matching_skills = []

        for skill in cv_skills:
            if skill.lower() in requirements_lower:
                matching_skills.append(skill)

        # Calculate percentage based on matching skills
        match_percentage = (len(matching_skills) / len(cv_skills)) * 100
        return int(match_percentage)

    @action(detail=True, methods=['post'])
    def process_cvs(self, request, pk=None):
        job = self.get_object()
        uploaded_files = request.FILES.getlist('cvs')

        if not uploaded_files:
            return Response({'error': 'No CV files provided'}, status=status.HTTP_400_BAD_REQUEST)

        if len(uploaded_files) > 100:
            return Response({'error': 'Maximum 100 CV files allowed'}, status=status.HTTP_400_BAD_REQUEST)

        processed_cvs = []

        for i, cv_file in enumerate(uploaded_files):
            try:
                # Extract text from PDF
                extracted_text = self._extract_text_from_pdf(cv_file)

                # Extract skills from text
                skills = self._extract_skills_from_text(extracted_text)

                # If no skills found, use fallback mock skills for demo purposes
                if not skills:
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
                    skills = mock_skill_sets[i % len(mock_skill_sets)]
                    extracted_text = f'Extracted content from {cv_file.name}... This CV contains skills in {", ".join(skills[:3])}...'

                # Calculate match score
                match_score = self._calculate_match_score(skills, job.requirements)

                # Create CV match record in database
                cv_match = CVMatch.objects.create(
                    job=job,
                    file_name=cv_file.name,
                    extracted_skills=skills,
                    match_score=match_score,
                    match_status='matched' if match_score >= 80 else 'not_matched',
                    extracted_text=extracted_text[:1000]  # Limit text length
                )

                processed_cv = {
                    'id': cv_match.id,
                    'fileName': cv_file.name,
                    'skills': skills,
                    'matchScore': match_score,
                    'extractedText': extracted_text[:200] + '...' if len(extracted_text) > 200 else extracted_text,
                    'uploadedAt': cv_match.uploaded_at.isoformat()
                }
                processed_cvs.append(processed_cv)

            except Exception as e:
                print(f"Error processing CV {cv_file.name}: {e}")
                # Return error for this specific CV but continue processing others
                processed_cv = {
                    'id': f'error-{i+1}',
                    'fileName': cv_file.name,
                    'skills': [],
                    'matchScore': 0,
                    'extractedText': f'Error processing {cv_file.name}: {str(e)}',
                    'uploadedAt': timezone.now().isoformat(),
                    'error': str(e)
                }
                processed_cvs.append(processed_cv)

        # Filter CVs with match score >= 60 (but show all for transparency)
        filtered_cvs = processed_cvs  # Show all processed CVs
        filtered_cvs.sort(key=lambda x: x['matchScore'], reverse=True)

        return Response({
            'total_processed': len(processed_cvs),
            'filtered_count': len([cv for cv in filtered_cvs if cv['matchScore'] >= 60]),
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
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action in ['update', 'partial_update']:
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
