---
study_date: 2026-08-28
chat_number: 3
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_file: knowledge/inbox/3.txt
---

# Chat 3 — Global Infrastructure & VPC

- An AWS Region contains multiple isolated Availability Zones; an AZ can consist of more than one data center.
- A VPC belongs to one Region and can span its Availability Zones; a subnet belongs to exactly one AZ.
- AZ letter mappings can vary by account, while AZ IDs consistently identify the physical zone across accounts.
- Region choice considers latency, regulation, service availability, resilience, and price.
- A public subnet has a route to an internet gateway, but an instance also needs suitable public addressing and security rules for direct reachability.
- Security groups are stateful, allow-only controls on resource network interfaces.
- Network ACLs are stateless subnet-boundary controls supporting ordered allow and deny rules.
- S3 buckets are managed Regional resources outside customer VPC subnets.
- S3 can be Regional while its bucket name remains globally unique in the general-purpose namespace.
- Root-user safety, MFA, and least privilege were reinforced but are grouped primarily with Chat 2 cards to avoid duplication.

Corrections and official-document validation are retained in `knowledge/daily/2026-08-28-reviewed.md`.

