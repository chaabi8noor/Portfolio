// Featured projects and case studies.
// Every statement here was taken from the linked repository (README, docs, CI files
// or commit history) as of 2026-10-13. Keep it that way: if a fact isn't in a source,
// leave it out or put it in `notVerified`.

export type Accent = 'mint' | 'lilac' | 'coral' | 'butter'
export type Evidence = { label: string; href: string }
export type ArchNode = {
  id: string
  label: string
  x: number // position in a 640×380 diagram
  y: number
  role: string
  mine?: boolean // documented as my contribution
  evidence: Evidence[]
}
export type Project = {
  slug: string
  title: string
  kicker: string
  kind: 'Personal project' | 'Team project' | 'Internship · team project' | 'Team contribution' | 'Small experiment'
  when: string
  accent: Accent
  summary: string
  problem: string
  constraints: string[]
  contribution: string[]
  stack: string[]
  architecture?: { caption: string; nodes: ArchNode[]; edges: [string, string][] }
  decisions: { title: string; body: string; source?: Evidence }[]
  results: { text: string; source?: Evidence }[]
  notVerified: string[]
  next: string[]
  source: Evidence
  demo?: Evidence // only set when a real public demo exists
}

const gh = (repo: string, path = '') =>
  `https://github.com/chaabi8noor/${repo}${path ? `/blob/HEAD/${path}` : ''}`
const kao = (path: string) => `https://gitlab.com/kubeaiops/kubeaiops-platform/-/blob/main/${path}`
const riq = (path: string) => `https://gitlab.com/chaabi8noor/resourceiq/-/blob/main/${path}`
const riqTree = (path: string) => `https://gitlab.com/chaabi8noor/resourceiq/-/tree/main/${path}`

export const projects: Project[] = [
  {
    slug: 'k8s-autoguard',
    title: 'K8s AutoGuard',
    kicker: 'Kubernetes DevSecOps lab: preventive gates, runtime detection, guarded remediation',
    kind: 'Personal project',
    when: 'Jul – Aug 2026',
    accent: 'mint',
    summary:
      'A local, reproducible Kubernetes lab that layers supply-chain gates, admission control, network policy and runtime detection — then feeds security events to an anomaly model and a remediation API that starts in dry-run.',
    problem:
      'Kubernetes security controls are easy to list and hard to demonstrate. I wanted one lab where each control has an expected outcome you can rerun: the untrusted client is denied, the insecure pod is rejected, the shell in a container is noticed.',
    constraints: [
      'Runs entirely on a laptop: a two-node KIND cluster under Docker Desktop with WSL 2.',
      'Remediation must be safe by default — dry-run first, scoped to one demo namespace.',
      'Metrics are from synthetic scenarios, so they are reported as such, not as production numbers.',
    ],
    contribution: [
      'Built it solo through a series of pull requests, from the KIND baseline to the final observability delivery.',
      'Wrote validation scripts for Cilium, Falco, Kyverno and Trivy, each with an expected security outcome.',
      'Trained an Isolation Forest on a generated security-event dataset and served it through FastAPI.',
      'Wrote eight architecture decision records plus evidence pages for the runtime, preventive, model and observability work.',
      'Added GitHub Actions security gates (Kyverno policy tests, Trivy manifest and image scans) and a pytest quality gate.',
    ],
    stack: ['KIND', 'Cilium', 'Hubble', 'Falco', 'Kyverno', 'Trivy', 'FastAPI', 'Prometheus', 'Loki', 'Grafana', 'Terraform', 'Ansible', 'Argo CD', 'GitHub Actions'],
    architecture: {
      caption: 'Event flow as described in the README’s architecture section.',
      nodes: [
        { id: 'git', label: 'Push / PR', x: 60, y: 70, mine: true, role: 'Every push and pull request runs the security gates before anything is merged.', evidence: [{ label: 'security-scans.yaml', href: gh('k8s-autoguard', '.github/workflows/security-scans.yaml') }] },
        { id: 'trivy', label: 'Trivy gates', x: 210, y: 70, mine: true, role: 'Blocks HIGH and CRITICAL manifest misconfigurations and reports vulnerabilities for the pinned image.', evidence: [{ label: 'scan-trivy.sh', href: gh('k8s-autoguard', 'scripts/scan-trivy.sh') }, { label: 'ADR 005', href: gh('k8s-autoguard', 'docs/adr/005-trivy-supply-chain-scanning.md') }] },
        { id: 'kyverno', label: 'Kyverno', x: 360, y: 70, mine: true, role: 'Admission control: enforces a Restricted Pod Security policy, admitting the secure fixture and rejecting the insecure one before scheduling.', evidence: [{ label: 'pod-security policy', href: gh('k8s-autoguard', 'security/kyverno-policies/autoguard-require-pod-security.yaml') }, { label: 'ADR 004', href: gh('k8s-autoguard', 'docs/adr/004-kyverno-admission-control.md') }] },
        { id: 'cilium', label: 'Cilium + Hubble', x: 510, y: 70, mine: true, role: 'Identity-aware network policy: the trusted client reaches the API, the untrusted one is denied. Hubble shows the flows.', evidence: [{ label: 'ingress policy', href: gh('k8s-autoguard', 'security/cilium-policies/api-ingress-from-trusted-client.yaml') }, { label: 'ADR 002', href: gh('k8s-autoguard', 'docs/adr/002-cilium-network-security.md') }] },
        { id: 'falco', label: 'Falco', x: 510, y: 200, mine: true, role: 'eBPF runtime detection emitting structured JSON events; detected a controlled command and an interactive container shell.', evidence: [{ label: 'Falco rule', href: gh('k8s-autoguard', 'security/falco-rules/shell-test-workload.yaml') }, { label: 'runtime evidence', href: gh('k8s-autoguard', 'docs/evidence/003-falco-runtime-validation.md') }] },
        { id: 'ml', label: 'Anomaly API', x: 360, y: 200, mine: true, role: 'Isolation Forest trained on a deterministic, generated security-event dataset, served through FastAPI.', evidence: [{ label: 'ml/model.py', href: gh('k8s-autoguard', 'ml/model.py') }, { label: 'ml/api/main.py', href: gh('k8s-autoguard', 'ml/api/main.py') }] },
        { id: 'remediate', label: 'Guarded remediation', x: 210, y: 200, mine: true, role: 'Starts in dry-run. Active mode is limited by namespace, severity, risk threshold and narrow RBAC, and can only create Cilium isolation policies in autoguard-demo.', evidence: [{ label: 'remediation/engine.py', href: gh('k8s-autoguard', 'remediation/engine.py') }, { label: 'ADR 007', href: gh('k8s-autoguard', 'docs/adr/007-guarded-anomaly-remediation.md') }] },
        { id: 'obs', label: 'Prometheus · Loki · Grafana', x: 60, y: 200, mine: true, role: 'Local observability stack tracking predictions, latest risk, remediation mode and platform logs. 24-hour retention, disposable storage.', evidence: [{ label: 'dashboard', href: gh('k8s-autoguard', 'observability/dashboards/autoguard-security-overview.yaml') }, { label: 'ADR 008', href: gh('k8s-autoguard', 'docs/adr/008-local-observability-stack.md') }] },
        { id: 'gitops', label: 'Terraform · Ansible · Argo CD', x: 285, y: 320, mine: true, role: 'Terraform declares the KIND topology, Ansible runs the installers, and Argo CD reconciles the platform from main after reviewed merges.', evidence: [{ label: 'main.tf', href: gh('k8s-autoguard', 'infra/terraform/main.tf') }, { label: 'Argo CD app', href: gh('k8s-autoguard', 'gitops/argocd/autoguard-platform-application.yaml') }, { label: 'ADR 006', href: gh('k8s-autoguard', 'docs/adr/006-gitops-and-iac.md') }] },
      ],
      edges: [['git', 'trivy'], ['trivy', 'kyverno'], ['kyverno', 'cilium'], ['cilium', 'falco'], ['falco', 'ml'], ['ml', 'remediate'], ['remediate', 'obs'], ['remediate', 'cilium'], ['gitops', 'ml'], ['gitops', 'remediate']],
    },
    decisions: [
      { title: 'KIND as the baseline', body: 'A disposable, two-node local cluster keeps every experiment reproducible and free to throw away.', source: { label: 'ADR 001', href: gh('k8s-autoguard', 'docs/adr/001-kind-baseline.md') } },
      { title: 'Prevent before you detect', body: 'Trivy and Kyverno stop bad manifests and pods early; Falco and the model handle what gets through.', source: { label: 'ADR 004', href: gh('k8s-autoguard', 'docs/adr/004-kyverno-admission-control.md') } },
      { title: 'Remediation behind guardrails', body: 'Dry-run by default, one namespace, a severity and risk threshold, and minimal RBAC. Automation should be boring to trust.', source: { label: 'ADR 007', href: gh('k8s-autoguard', 'docs/adr/007-guarded-anomaly-remediation.md') } },
    ],
    results: [
      { text: 'Cilium connectivity validation: 77 applicable tests and 320 actions passed.', source: { label: 'README · Evidence', href: gh('k8s-autoguard', 'README.md') } },
      { text: 'Kyverno admits the secure fixture and rejects the insecure one; the Trivy manifest gate passed with zero HIGH or CRITICAL findings.', source: { label: 'preventive evidence', href: gh('k8s-autoguard', 'docs/evidence/004-preventive-security-validation.md') } },
      { text: 'Benchmark on 520 labelled synthetic scenario events: 1.00 recall, 0.08 false-positive rate, 38.69 ms P95 in-process latency. These are synthetic, in-process figures, not production MTTD/MTTR.', source: { label: 'model benchmark', href: gh('k8s-autoguard', 'docs/evidence/005-model-benchmark.md') } },
    ],
    notVerified: [
      'Live deployment, Argo CD install and end-to-end cluster evidence need to be rerun once Docker Desktop WSL integration is enabled again (per the README’s status section).',
    ],
    next: [
      'Rerun and record end-to-end cluster evidence on a fresh lab.',
      'Measure the model against replayed real Falco events instead of synthetic scenarios only.',
    ],
    source: { label: 'chaabi8noor/k8s-autoguard', href: gh('k8s-autoguard') },
  },
  {
    slug: 'kubeaiops-capacity',
    title: 'KubeAIOps · Capacity service',
    kicker: 'Replica forecasting delivered through CI, Helm and GitOps',
    kind: 'Internship · team project',
    when: 'Summer 2026',
    accent: 'lilac',
    summary:
      'A three-person Kubernetes AIOps platform. I owned the capacity-management stream: an instrumented workload, a forecasting model, a recommendation API, and the CI, Helm, GitOps and load-test plumbing around it.',
    problem:
      'Autoscaling reacts after load arrives. This stream asks whether a small, well-validated forecast can recommend replica counts ahead of time, within strict bounds, and be delivered the same way as any other service.',
    constraints: [
      'Three parallel streams (infrastructure anomaly, release risk, capacity) had to agree on shared API, metrics and deployment contracts.',
      'Local Kind for development; a separate staging values file references a published image instead of local builds.',
      'Recommendations stay inside a bounded replica policy.',
    ],
    contribution: [
      'Built the capacity-api recommendation service and an instrumented demo-workload exporting bounded Prometheus metrics.',
      'Containerised both as non-root images and wrote the Helm deployment, initial HPAs, PromQL rules and a Grafana dashboard.',
      'Built the data pipeline, leakage-safe features, a persistence baseline and a frozen primary model with a model card.',
      'Wrote GitLab CI jobs for Python, Helm and GitOps validation, tests, image build, image scan, container smoke and load-test contract checks.',
      'Added Argo CD applications and a local GitOps rehearsal integrating my teammates’ services, plus five parameterised k6 scenarios.',
    ],
    stack: ['Python', 'Prometheus', 'Grafana', 'Helm', 'Kind', 'Argo CD', 'GitLab CI', 'Docker', 'k6'],
    architecture: {
      caption: 'The capacity stream as documented in the repository README and docs/member-3.',
      nodes: [
        { id: 'workload', label: 'demo-workload', x: 70, y: 80, mine: true, role: 'Instrumented workload exporting bounded Prometheus metrics, the signal everything else learns from.', evidence: [{ label: 'README', href: kao('README.md') }] },
        { id: 'k6', label: 'k6 scenarios', x: 70, y: 220, mine: true, role: 'Five parameterised load scenarios plus a protected pod-recovery test.', evidence: [{ label: 'capacity validation', href: kao('docs/member-3/capacity-validation.md') }] },
        { id: 'prom', label: 'Prometheus', x: 230, y: 80, mine: true, role: 'Scrapes the workload; PromQL rules and an extractor feed the dataset pipeline. The API also reads capacity decisions from it.', evidence: [{ label: 'data pipeline', href: kao('docs/member-3/capacity-data-pipeline.md') }] },
        { id: 'model', label: 'Forecast model', x: 380, y: 80, mine: true, role: 'Persistence baseline, then a frozen primary forecasting model with a model card and saved evaluation evidence.', evidence: [{ label: 'forecasting baseline', href: kao('docs/member-3/capacity-forecasting-baseline.md') }, { label: 'primary model', href: kao('docs/member-3/primary-model-and-gitops.md') }] },
        { id: 'api', label: 'capacity-api', x: 530, y: 80, mine: true, role: 'Contract-aligned service returning replica recommendations through a bounded replica policy.', evidence: [{ label: 'API contract', href: kao('docs/contracts/api-contract.md') }] },
        { id: 'hpa', label: 'HPAs', x: 530, y: 220, mine: true, role: 'Initial Horizontal Pod Autoscalers deployed with the Helm chart.', evidence: [{ label: 'local deployment', href: kao('docs/member-3/local-deployment.md') }] },
        { id: 'grafana', label: 'Grafana', x: 230, y: 220, mine: true, role: 'Dashboard for the capacity service, provisioned with the observability setup.', evidence: [{ label: 'operations runbook', href: kao('docs/member-3/capacity-operations-runbook.md') }] },
        { id: 'ci', label: 'GitLab CI', x: 380, y: 320, mine: true, role: 'validate → test → package → verify: Python, Helm and GitOps checks, tests, image build, scan, smoke test and load-test contract.', evidence: [{ label: '.gitlab-ci.yml', href: kao('.gitlab-ci.yml') }] },
        { id: 'argo', label: 'Argo CD', x: 530, y: 320, mine: true, role: 'Versioned local Argo CD applications for the capacity, infrastructure-anomaly and release-risk services.', evidence: [{ label: 'primary model & GitOps', href: kao('docs/member-3/primary-model-and-gitops.md') }] },
      ],
      edges: [['workload', 'prom'], ['k6', 'workload'], ['prom', 'model'], ['model', 'api'], ['prom', 'grafana'], ['api', 'hpa'], ['ci', 'argo'], ['argo', 'api']],
    },
    decisions: [
      { title: 'Contracts before code', body: 'API, metrics and deployment contracts were written first so three streams could integrate without guessing.', source: { label: 'contracts', href: kao('docs/contracts/api-contract.md') } },
      { title: 'Baseline first', body: 'A persistence baseline sets the bar the primary model must beat before it gets frozen and shipped.', source: { label: 'forecasting baseline', href: kao('docs/member-3/capacity-forecasting-baseline.md') } },
      { title: 'Local vs staging, explicitly', body: 'values-local.yaml uses local images with imagePullPolicy: Never; staging values point at a published registry image.', source: { label: 'README · environments', href: kao('README.md') } },
    ],
    results: [
      { text: 'Implemented a GitLab CI pipeline covering validation, tests, image packaging, scanning and container smoke checks.', source: { label: '.gitlab-ci.yml', href: kao('.gitlab-ci.yml') } },
      { text: 'Documented a validation campaign, operations runbook, peer-reproduction handover and demonstration guide.', source: { label: 'handover', href: kao('docs/member-3/capacity-handover.md') } },
      { text: 'Tracked cross-stream dependencies and the conditions for resuming paused integration work.', source: { label: 'dependency register', href: kao('docs/member-3/integration-dependency-register.md') } },
    ],
    notVerified: ['The shared/mentor environment is documented, but the sources don’t establish a long-running deployment, so none is claimed here.'],
    next: ['Compare HPA-only scaling with forecast-assisted recommendations under the same k6 scenarios.'],
    source: { label: 'kubeaiops/kubeaiops-platform', href: 'https://gitlab.com/kubeaiops/kubeaiops-platform' },
  },
  {
    slug: 'resourceiq',
    title: 'ResourceIQ',
    kicker: 'Idle OpenStack resource detection with human-approved, reversible remediation',
    kind: 'Team project',
    when: 'Aug – Sep 2026',
    accent: 'coral',
    summary:
      'An AI-assisted pipeline that spots idle OpenStack instances, orphaned volumes and unused floating IPs, ranks them by estimated waste, and reclaims them only through reversible, human-approved actions.',
    problem:
      'Idle cloud resources quietly cost money, but deleting the wrong one is worse. The goal is a review loop: detect, explain, ask for approval, act reversibly, and learn from rejections.',
    constraints: [
      'No component should be blocked on cloud access, so everything runs against a committed synthetic fixture first.',
      'Five frozen data contracts between modules (docs/CONTRACTS.md).',
      'Production-tagged resources must never be actioned.',
    ],
    contribution: [
      'Scaffolded the project and its module layout.',
      'Built the approve/reject dashboard, then a React + TypeScript “command center” wired to the Flask API, falling back to mock data when the API is unreachable.',
      'Added an auto-approve policy tier for low-risk resources and a hash-chained decision log with tamper detection.',
      'Wrote the feedback retraining script that feeds rejected resources back into training.',
      'Verified both Containerfiles build and run, and documented the podman-compose and Windows gotchas.',
      'A teammate built the detection pipeline and the live OpenStack collector.',
    ],
    stack: ['Python', 'PyOD', 'Flask', 'React', 'TypeScript', 'Podman', 'OpenStack'],
    architecture: {
      caption: 'Module flow as drawn in the README’s “five data contracts” section.',
      nodes: [
        { id: 'connectors', label: 'connectors', x: 70, y: 80, role: 'OpenStack collection plus the synthetic fixture generator (407 records with held-out ground truth). Built by a teammate.', evidence: [{ label: 'connectors/', href: riqTree('connectors') }] },
        { id: 'detection', label: 'detection', x: 230, y: 80, role: 'PyOD Isolation Forest + Autoencoder ensemble producing scores. Built by a teammate.', evidence: [{ label: 'detection/score.py', href: riq('detection/score.py') }] },
        { id: 'policy', label: 'policy', x: 400, y: 80, mine: true, role: 'Cost model, waste score, ranking, guardrails and TTL. I added the auto-approve tier for low-risk resources.', evidence: [{ label: 'policy/engine.py', href: riq('policy/engine.py') }] },
        { id: 'llm', label: 'llm', x: 230, y: 220, role: 'Plain-language explanations. The template fallback works; the Ollama path is pending.', evidence: [{ label: 'llm/explain.py', href: riq('llm/explain.py') }] },
        { id: 'dashboard', label: 'dashboard', x: 400, y: 220, mine: true, role: 'Flask reference UI and API (/api/report, /api/decide, /api/rollback) plus the React dashboard. Approve → remediate → log loop.', evidence: [{ label: 'dashboard/app.py', href: riq('dashboard/app.py') }, { label: 'services/dashboard', href: riqTree('services/dashboard') }] },
        { id: 'pulumi', label: 'remediation', x: 560, y: 220, role: 'Dry-run stub matching the contract; returns a rollback token.', evidence: [{ label: 'pulumi/actions.py', href: riq('pulumi/actions.py') }] },
        { id: 'log', label: 'decision log', x: 400, y: 330, mine: true, role: 'Append-only, hash-chained log of every decision with tamper detection.', evidence: [{ label: 'feedback/', href: riqTree('feedback') }] },
        { id: 'feedback', label: 'feedback', x: 230, y: 330, mine: true, role: 'Retraining that reinforces rejected resources into the training set; supports --simulate before real rejections exist.', evidence: [{ label: 'feedback/retrain.py', href: riq('feedback/retrain.py') }] },
      ],
      edges: [['connectors', 'detection'], ['detection', 'policy'], ['detection', 'llm'], ['policy', 'dashboard'], ['llm', 'dashboard'], ['dashboard', 'pulumi'], ['dashboard', 'log'], ['log', 'feedback'], ['feedback', 'detection']],
    },
    decisions: [
      { title: 'Working stubs everywhere', body: 'Every module emits correctly shaped output from day one, so integration means replacing stubs rather than reconciling schemas.', source: { label: 'README', href: riq('README.md') } },
      { title: 'Reversible by design', body: 'Actions return a rollback token and are logged; production-tagged resources get an HTTP 403.', source: { label: 'README · Verified', href: riq('README.md') } },
      { title: 'Write down what isn’t verified', body: 'The README keeps an explicit “NOT verified” list next to the verified results.', source: { label: 'README', href: riq('README.md') } },
    ],
    results: [
      { text: 'Re-run on a second machine: all 407 fixture records validate against the schema; ROC AUC 0.952 (dormant/zombie vs active) on synthetic data.', source: { label: 'README · Verified', href: riq('README.md') } },
      { text: 'Actioning a production-tagged resource returned HTTP 403 against a live Flask process; rollback was exercised and restored the resource to “needs review”.', source: { label: 'README · Verified', href: riq('README.md') } },
      { text: 'Simulated feedback retraining: rejected set went from 4/6 flagged to 0/6, with no change to other bursty resources.', source: { label: 'README · Verified', href: riq('README.md') } },
    ],
    notVerified: [
      'AUC figures are measured on synthetic data and say nothing yet about a real fleet.',
      'Pulumi and LLM layers run on their fallbacks; podman-compose orchestration had not run successfully on Windows when the README was written.',
    ],
    next: ['Replace the dry-run remediation stub with real, reversible actions behind the same guardrails.'],
    source: { label: 'chaabi8noor/resourceiq', href: 'https://gitlab.com/chaabi8noor/resourceiq' },
  },
  {
    slug: 'internhub-devops',
    title: 'InternHub · DevOps hardening',
    kicker: 'Migrations, health checks and a real CI gate for a team app',
    kind: 'Team contribution',
    when: 'Jul 2026',
    accent: 'butter',
    summary:
      'InternHub is a FastAPI + React app for admins and interns. My work was making it start reliably, migrate safely and pass a real CI gate before anyone deploys it.',
    problem:
      'The app ran on a developer’s machine. To hand it to a hosting platform it needed versioned migrations, health checks, a CI gate that exercises a real database, and a runbook a teammate could follow.',
    constraints: [
      'No production default password; local admin seeding is opt-in.',
      'Production settings come from the hosting platform’s secret manager; the backend rejects wildcard CORS and missing critical settings.',
    ],
    contribution: [
      'Established the runtime foundation. The app exposes /health and /ready, and /ready checks PostgreSQL.',
      'Introduced versioned Alembic migrations applied before startup.',
      'Added a GitHub Actions CI gate: frontend tests and build, backend tests, a real PostgreSQL migration, both container builds and Compose validation.',
      'Wrote the platform deployment runbook and added production-readiness controls: secret scanning, CodeQL, dependency review, image scans and smoke checks.',
    ],
    stack: ['FastAPI', 'PostgreSQL', 'Alembic', 'React', 'Docker Compose', 'GitHub Actions', 'CodeQL'],
    decisions: [
      { title: 'Migrations, not create_all', body: 'Versioned Alembic migrations, with a documented one-time stamping procedure for existing databases.', source: { label: 'alembic/README.md', href: gh('app-stage', 'backend/alembic/README.md') } },
      { title: 'Test the real thing in CI', body: 'CI runs migrations against a real PostgreSQL service rather than a mock.', source: { label: 'ci.yml', href: gh('app-stage', '.github/workflows/ci.yml') } },
    ],
    results: [
      { text: 'Implemented a documented CI build workflow that validates every PR and push to main or devops/* branches.', source: { label: 'ci.yml', href: gh('app-stage', '.github/workflows/ci.yml') } },
      { text: 'Delivered through pull requests from devops/* branches.', source: { label: 'commit history', href: 'https://github.com/chaabi8noor/app-stage/commits' } },
    ],
    notVerified: ['The frontend is configured for Vercel and the API for Railway, but the sources don’t confirm a live deployment, so no demo link is shown.'],
    next: [],
    source: { label: 'chaabi8noor/app-stage', href: gh('app-stage') },
  },
  {
    slug: 'spotify-terraform',
    title: 'spotify-terraform',
    kicker: 'Terraform driving a non-cloud API, fed by a local LLM',
    kind: 'Small experiment',
    when: 'Aug 2026',
    accent: 'mint',
    summary:
      'A PowerShell script asks for a mood, a local Llama 3.2 model (via Ollama) suggests tracks, and the result becomes a Terraform variables file, shown as output or turned into a real playlist by a community Spotify provider.',
    problem: 'A playful way to practise Terraform variables, providers and secret hygiene on an API that isn’t a cloud provider.',
    constraints: ['Creating a real playlist may require the Spotify app owner to have Premium, so a local-only mode was kept.'],
    contribution: ['Personal learning project: script, Terraform configuration and README.'],
    stack: ['Terraform', 'PowerShell', 'Ollama', 'Spotify provider'],
    architecture: {
      caption: 'The two-mode flow from the README.',
      nodes: [
        { id: 'input', label: 'User input', x: 70, y: 150, mine: true, role: 'Playlist name, vibe, genres, energy, things to avoid, track count.', evidence: [{ label: 'README', href: gh('spotify-terraform', 'README.md') }] },
        { id: 'ps', label: 'PowerShell', x: 210, y: 150, mine: true, role: 'Collects input, prompts the model and writes generated.auto.tfvars.json.', evidence: [{ label: 'generate_tracks.ps1', href: gh('spotify-terraform', 'scripts/generate_tracks.ps1') }] },
        { id: 'ollama', label: 'Ollama · llama3.2', x: 210, y: 290, mine: true, role: 'Local model that suggests tracks and hands them back to the script. No cloud AI call.', evidence: [{ label: 'README', href: gh('spotify-terraform', 'README.md') }] },
        { id: 'tf', label: 'Terraform', x: 380, y: 150, mine: true, role: 'Auto-loads the .auto.tfvars.json file; fmt, validate and plan.', evidence: [{ label: 'playlist.tf', href: gh('spotify-terraform', 'terraform/playlist.tf') }] },
        { id: 'out', label: 'Mode 1 · output', x: 540, y: 80, mine: true, role: 'Terraform prints the playlist. Works without Premium.', evidence: [{ label: 'outputs.tf', href: gh('spotify-terraform', 'terraform/outputs.tf') }] },
        { id: 'spotify', label: 'Mode 2 · Spotify', x: 540, y: 230, mine: true, role: 'Community provider conradludgate/spotify creates the real playlist, depending on API access.', evidence: [{ label: 'provider.tf', href: gh('spotify-terraform', 'terraform/provider.tf') }] },
      ],
      edges: [['input', 'ps'], ['ps', 'ollama'], ['ps', 'tf'], ['tf', 'out'], ['tf', 'spotify']],
    },
    decisions: [{ title: 'Secrets stay local', body: 'Example files are committed; .env, tfvars and state are gitignored.', source: { label: 'README · Git security', href: gh('spotify-terraform', 'README.md') } }],
    results: [{ text: 'Mode 1 (local AI + Terraform output) works; Mode 2 is ready but depends on Spotify API access.', source: { label: 'README · Status', href: gh('spotify-terraform', 'README.md') } }],
    notVerified: [],
    next: ['Add the GitHub Actions terraform fmt/validate check listed in the README’s future improvements.'],
    source: { label: 'chaabi8noor/spotify-terraform', href: gh('spotify-terraform') },
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
