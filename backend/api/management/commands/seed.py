from django.core.management.base import BaseCommand
from api.models import Job, Candidate, Application
from datetime import datetime

class Command(BaseCommand):
    help = 'Seed database with mock data'

    def handle(self, *args, **options):
        # Clear existing data
        Application.objects.all().delete()
        Job.objects.all().delete()
        Candidate.objects.all().delete()

        # Seed jobs
        jobs_data = [
            {
                "id": "job-1",
                "title": "Senior Frontend Developer",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "requirements": "5+ years React, TypeScript, Node.js, GraphQL, AWS. Bachelor's in CS. Experience with modern frontend frameworks and cloud services.",
                "status": "Open",
                "created_at": datetime(2024, 11, 1),
                "applications_count": 8,
            },
            {
                "id": "job-2",
                "title": "Product Designer",
                "department": "Design",
                "location": "Remote",
                "requirements": "3+ years UX/UI design, Figma, prototyping, user research. Portfolio required. Experience with design systems and agile methodologies.",
                "status": "Open",
                "created_at": datetime(2024, 11, 10),
                "applications_count": 5,
            },
            {
                "id": "job-3",
                "title": "Backend Engineer",
                "department": "Engineering",
                "location": "New York, NY",
                "requirements": "4+ years Python/Django, PostgreSQL, REST APIs, Docker. Experience with microservices and cloud platforms (AWS/GCP).",
                "status": "Open",
                "created_at": datetime(2024, 11, 15),
                "applications_count": 3,
            },
            {
                "id": "job-4",
                "title": "Marketing Manager",
                "department": "Marketing",
                "location": "Austin, TX",
                "requirements": "3+ years digital marketing, Google Analytics, SEO/SEM, social media. Experience with marketing automation and A/B testing.",
                "status": "Closed",
                "created_at": datetime(2024, 10, 1),
                "applications_count": 12,
            },
            {
                "id": "job-5",
                "title": "Data Analyst",
                "department": "Analytics",
                "location": "Chicago, IL",
                "requirements": "2+ years SQL, Python/R, Tableau/Power BI, statistical analysis. Experience with data visualization and business intelligence.",
                "status": "Open",
                "created_at": datetime(2024, 11, 20),
                "applications_count": 2,
            },
        ]

        jobs = {}
        for job_data in jobs_data:
            job = Job.objects.create(
                id=job_data['id'],
                title=job_data['title'],
                department=job_data['department'],
                location=job_data['location'],
                requirements=job_data['requirements'],
                status=job_data['status'],
                created_at=job_data['created_at'],
                applications_count=job_data['applications_count'],
            )
            jobs[job_data['id']] = job

        # Seed candidates
        candidates_data = [
            {
                "name": "Sarah Chen",
                "email": "sarah.chen@email.com",
                "phone": "+1 (555) 123-4567",
                "skills": ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker"],
                "resume_url": "/resumes/sarah-chen.pdf",
            },
            {
                "name": "Marcus Johnson",
                "email": "m.johnson@email.com",
                "phone": "+1 (555) 234-5678",
                "skills": ["Figma", "UI/UX", "Prototyping", "User Research", "Design Systems", "Adobe Creative Suite"],
                "resume_url": "/resumes/marcus-johnson.pdf",
            },
            {
                "name": "Alex Rodriguez",
                "email": "alex.rodriguez@email.com",
                "phone": "+1 (555) 345-6789",
                "skills": ["Python", "Django", "PostgreSQL", "REST APIs", "Docker", "AWS", "Kubernetes"],
                "resume_url": "/resumes/alex-rodriguez.pdf",
            },
            {
                "name": "Emily Davis",
                "email": "emily.davis@email.com",
                "phone": "+1 (555) 456-7890",
                "skills": ["Google Analytics", "SEO", "SEM", "Social Media Marketing", "Content Marketing", "HubSpot"],
                "resume_url": "/resumes/emily-davis.pdf",
            },
            {
                "name": "David Kim",
                "email": "david.kim@email.com",
                "phone": "+1 (555) 567-8901",
                "skills": ["SQL", "Python", "R", "Tableau", "Power BI", "Statistical Analysis", "Machine Learning"],
                "resume_url": "/resumes/david-kim.pdf",
            },
            {
                "name": "Jessica Liu",
                "email": "jessica.liu@email.com",
                "phone": "+1 (555) 678-9012",
                "skills": ["React", "Vue.js", "JavaScript", "CSS", "HTML", "Git"],
                "resume_url": "/resumes/jessica-liu.pdf",
            },
            {
                "name": "Michael Brown",
                "email": "michael.brown@email.com",
                "phone": "+1 (555) 789-0123",
                "skills": ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "AWS"],
                "resume_url": "/resumes/michael-brown.pdf",
            },
            {
                "name": "Lisa Wang",
                "email": "lisa.wang@email.com",
                "phone": "+1 (555) 890-1234",
                "skills": ["Sketch", "InVision", "Principle", "User Testing", "Wireframing", "Usability Testing"],
                "resume_url": "/resumes/lisa-wang.pdf",
            },
        ]

        candidates = {}
        for i, cand_data in enumerate(candidates_data, 1):
            cand = Candidate.objects.create(
                name=cand_data['name'],
                email=cand_data['email'],
                phone=cand_data['phone'],
                skills=cand_data['skills'],
                resume_url=cand_data['resume_url'],
            )
            candidates[f"cand-{i}"] = cand

        # Seed applications - match candidates to jobs based on skills
        applications_data = [
            # Frontend Developer job applications
            {
                "candidate": candidates["cand-1"],  # Sarah Chen - perfect match
                "job": jobs["job-1"],
                "job_title": "Senior Frontend Developer",
                "status": "Interview",
                "applied_at": datetime(2024, 12, 1),
                "rating": 5,
                "notes": "Excellent match - has all required skills including React, TypeScript, Node.js, GraphQL, AWS.",
                "ai_summary": "Senior frontend developer with 6+ years experience. Strong in modern web technologies.",
            },
            {
                "candidate": candidates["cand-6"],  # Jessica Liu - partial match
                "job": jobs["job-1"],
                "job_title": "Senior Frontend Developer",
                "status": "Screening",
                "applied_at": datetime(2024, 12, 3),
                "rating": 3,
                "notes": "Good frontend skills but lacks TypeScript and GraphQL experience.",
                "ai_summary": "Mid-level frontend developer with solid JavaScript and React skills.",
            },

            # Product Designer job applications
            {
                "candidate": candidates["cand-2"],  # Marcus Johnson - perfect match
                "job": jobs["job-2"],
                "job_title": "Product Designer",
                "status": "Interview",
                "applied_at": datetime(2024, 12, 2),
                "rating": 5,
                "notes": "Outstanding portfolio and experience in UX/UI design with Figma.",
                "ai_summary": "Experienced product designer with comprehensive UX/UI skill set.",
            },
            {
                "candidate": candidates["cand-8"],  # Lisa Wang - good match
                "job": jobs["job-2"],
                "job_title": "Product Designer",
                "status": "Applied",
                "applied_at": datetime(2024, 12, 4),
                "rating": 4,
                "notes": "Strong design skills, experience with prototyping tools.",
                "ai_summary": "Skilled UX designer with focus on user testing and wireframing.",
            },

            # Backend Engineer job applications
            {
                "candidate": candidates["cand-3"],  # Alex Rodriguez - perfect match
                "job": jobs["job-3"],
                "job_title": "Backend Engineer",
                "status": "Interview",
                "applied_at": datetime(2024, 12, 1),
                "rating": 5,
                "notes": "Excellent Python/Django developer with cloud experience.",
                "ai_summary": "Senior backend engineer specializing in Python and cloud technologies.",
            },

            # Marketing Manager job applications
            {
                "candidate": candidates["cand-4"],  # Emily Davis - perfect match
                "job": jobs["job-4"],
                "job_title": "Marketing Manager",
                "status": "Offer",
                "applied_at": datetime(2024, 11, 15),
                "rating": 5,
                "notes": "Digital marketing expert with proven track record.",
                "ai_summary": "Experienced marketing manager with expertise in digital campaigns.",
            },

            # Data Analyst job applications
            {
                "candidate": candidates["cand-5"],  # David Kim - perfect match
                "job": jobs["job-5"],
                "job_title": "Data Analyst",
                "status": "Screening",
                "applied_at": datetime(2024, 12, 5),
                "rating": 4,
                "notes": "Strong analytical skills with experience in BI tools.",
                "ai_summary": "Data analyst with expertise in SQL, Python, and visualization tools.",
            },

            # Additional applications for variety
            {
                "candidate": candidates["cand-7"],  # Michael Brown - backend skills for frontend job
                "job": jobs["job-1"],
                "job_title": "Senior Frontend Developer",
                "status": "Applied",
                "applied_at": datetime(2024, 12, 6),
                "rating": 2,
                "notes": "Backend-focused developer, limited frontend experience.",
                "ai_summary": "Java backend developer exploring frontend opportunities.",
            },
        ]

        for app_data in applications_data:
            Application.objects.create(**app_data)

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
