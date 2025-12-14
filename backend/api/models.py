from django.db import models

class Job(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Closed', 'Closed'),
    ]

    id = models.CharField(max_length=20, primary_key=True)
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    requirements = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    applications_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class Candidate(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    skills = models.JSONField(default=list)
    resume_url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class CVMatch(models.Model):
    MATCH_STATUS_CHOICES = [
        ('matched', 'Matched'),
        ('not_matched', 'Not Matched'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    extracted_skills = models.JSONField(default=list)
    match_score = models.IntegerField(default=0, help_text="Match score 0-100")
    match_status = models.CharField(
        max_length=20,
        choices=MATCH_STATUS_CHOICES,
        default='not_matched'
    )
    extracted_text = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['job', 'file_name']

    def __str__(self):
        return f"{self.file_name} - {self.job.title} ({self.match_score}%)"

class Application(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Screening', 'Screening'),
        ('Interview', 'Interview'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    job_title = models.CharField(max_length=200)  # Denormalized for easier queries
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    rating = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    ai_summary = models.TextField(blank=True)

    # CV Matching fields
    match_score = models.IntegerField(default=0, help_text="Match score 0-100")
    match_status = models.CharField(
        max_length=20,
        choices=[
            ('matched', 'Matched'),
            ('not_matched', 'Not Matched'),
        ],
        default='not_matched',
        help_text="CV matching status"
    )

    def __str__(self):
        return f"{self.candidate.name} - {self.job.title}"
