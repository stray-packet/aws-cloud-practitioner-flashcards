---
study_date: 2026-08-28
chat_number: 5
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_file: knowledge/inbox/5.txt
---

# Chat 5 — Disaster Recovery & AWS APIs

- Recovery Time Objective is the acceptable time to restore service; Recovery Point Objective is the acceptable amount of data loss measured in time.
- Backup and restore usually minimizes steady-state cost but has the longest recovery time.
- Pilot light keeps only critical core components ready; warm standby runs a small functional environment.
- Multi-site active/active serves traffic from multiple sites and generally has the highest cost and fastest recovery potential.
- Active/active does not automatically guarantee zero data loss; replication and data architecture determine RPO.
- Synchronous replication reduces potential data loss but can add latency; asynchronous replication can expose a lag window.
- Amazon Resource Names identify AWS resources in policies, APIs, and integrations.
- Signature Version 4 authenticates and integrity-protects signed AWS API requests.
- Regional endpoints target a particular Region; a small set of AWS services use global endpoints.
- Public endpoints and VPC endpoints describe different network paths to service APIs.

Corrections and official-document validation are retained in `knowledge/daily/2026-08-28-reviewed.md`.

