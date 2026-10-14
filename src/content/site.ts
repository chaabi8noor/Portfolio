// Identity, links, about copy, capabilities and experience.
// Sources: Chaabi_Nour_El_Houda_CV.pdf (supplied by the owner, 2026-10-14) and the
// public GitHub / GitLab repositories. Anything set to `null` is hidden on the site.

export const identity = {
  name: 'Chaabi Nour El Houda',
  wordmark: 'chaabi nour', // small header mark
  bigWord: 'Nour El Houda', // the giant hero word
  role: 'DevOps & Cloud Engineering Student',
  headline: ['Cloud & DevOps engineering', 'for systems you can trust.'],
  intro:
    'Engineering student at ESPRIT, specializing in Cloud Engineering. I build cloud infrastructure, CI/CD pipelines and Kubernetes platforms that are reproducible, secure and observable.',
  statement: [
    'I design and automate cloud infrastructure, CI/CD pipelines and Kubernetes platforms',
    ' that are reproducible, secure and observable by default.',
  ],
}

export const links = {
  github: 'https://github.com/chaabi8noor',
  gitlab: 'https://gitlab.com/chaabi8noor',
  email: 'Chaabi.NourElHouda@esprit.tn' as string | null,
  linkedin: 'https://www.linkedin.com/in/nour-el-houda-chaabi-10064913a/' as string | null,
  resume: 'Chaabi_Nour_El_Houda_CV.pdf' as string | null, // path under /public
}

export const availability: string | null = 'Seeking a 6-month PFE (end-of-studies internship), available from January 2027.'

// Hero cut-out: the owner's supplied photo with its background removed. Face untouched.
export const heroPhoto = {
  src: 'me/hero.webp',
  width: 922,
  height: 1099,
  alt: 'Chaabi Nour El Houda in a black blazer, resting her cheek on her hand behind a laptop, smiling.',
}

export type Capability = { icon: 'cloud' | 'pipeline' | 'cube' | 'shield'; title: string; body: string; tags: string[] }

// Grouped from the CV's "Technical Skills".
export const capabilities: Capability[] = [
  {
    icon: 'cloud',
    title: 'Cloud & Infrastructure as Code',
    body: 'Provisioning private and public cloud infrastructure declaratively, from networks and security groups to VMs.',
    tags: ['OpenStack', 'AWS', 'Azure', 'Terraform', 'Ansible', 'Pulumi'],
  },
  {
    icon: 'pipeline',
    title: 'CI/CD & GitOps',
    body: 'Pipelines that test, scan, build and ship, with Git as the source of truth for what runs.',
    tags: ['GitLab CI/CD', 'GitHub Actions', 'Jenkins', 'Zuul', 'Argo CD'],
  },
  {
    icon: 'cube',
    title: 'Containers & Kubernetes',
    body: 'Containerizing applications and running them on reproducible Kubernetes environments packaged with Helm.',
    tags: ['Docker', 'Docker Compose', 'Kubernetes', 'Helm'],
  },
  {
    icon: 'shield',
    title: 'Security & Observability',
    body: 'Preventive gates, runtime detection and the metrics and alerts that show what a system is actually doing.',
    tags: ['Falco', 'Kyverno', 'Trivy', 'Cilium', 'Prometheus', 'Grafana', 'Alertmanager'],
  },
]

export const languagesCode = ['Python', 'Bash/Shell', 'YAML', 'FastAPI', 'Git']

export type Job = { org: string; role: string; when: string; where: string; points: string[]; project?: string }

// From the CV's "Professional Experience & Projects". `project` links to a case study.
export const experience: Job[] = [
  {
    org: 'FelCloud',
    role: 'Cloud Infrastructure & DevOps Intern',
    when: 'Jul – Aug 2026',
    where: 'Remote',
    points: [
      'Deployed a private OpenStack infrastructure with Pulumi (IaC): 10 VMs, 76 resources, a dedicated network and SNAT router.',
      'Isolated services by role with a bastion-host architecture, 6 security groups and 2 anti-affinity groups.',
      'Optimized the Zuul/GitLab CI/CD pipeline with pytest-xdist: test time reduced from 65 s to 36 s.',
    ],
  },
  {
    org: '3LM Solution',
    role: 'DevOps Intern',
    when: 'Jun – Jul 2026',
    where: 'Remote',
    points: [
      'Containerized a full-stack application (FastAPI, React, MariaDB) with Docker and Docker Compose.',
      'Automated security scans (Trivy, Gitleaks, Bandit) in a GitHub Actions CI pipeline.',
      'Configured Prometheus and Grafana monitoring with alerts on availability, 5xx errors and p95 latency.',
    ],
  },
  {
    org: 'ESPRIT · KubeAIOps Platform',
    role: 'DevOps/MLOps Intern',
    when: 'Jul – Aug 2026',
    where: 'Remote',
    project: 'kubeaiops-capacity',
    points: [
      'Developed a FastAPI service for Kubernetes capacity recommendation based on traffic forecasts and CPU utilization.',
      'Deployed a reproducible Kubernetes environment via Helm on Kind, monitored with Prometheus, Grafana and Alertmanager.',
      'Built a complete GitLab CI/CD pipeline: tests, vulnerability scan, image build/push and k6 load tests.',
    ],
  },
  {
    org: 'OpenStack Cloud Infrastructure with AI',
    role: 'Academic project',
    when: '',
    where: 'ESPRIT',
    points: [
      'Automated an OpenStack deployment with Terraform and Ansible in a hybrid setup (OpenStack backend, Azure frontend), with anomaly detection and AI-based autoscaling.',
      'Developed a full-stack B2B platform (Angular, Spring Boot), containerized with Docker and orchestrated on Kubernetes.',
      'Integrated Azure Copilot so the Kubernetes cluster can be queried in natural language about its status and resources.',
    ],
  },
]
