---
study_date: 2026-08-28
chat_number: 6
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_file: knowledge/inbox/6.txt
---

# Chat 6 — CloudFormation, CDK & Responsibility

- AWS CloudFormation provisions and updates AWS resources from declarative YAML or JSON templates.
- A stack is the managed collection of resources created from a CloudFormation template.
- Deletion and retention policies can preserve selected resources when a stack is deleted.
- AWS CDK expresses infrastructure with programming languages and synthesizes CloudFormation templates.
- `cdk synth` produces a CloudFormation template; `cdk deploy` performs deployment.
- SDKs call service APIs for application or automation logic; CDK defines infrastructure that synthesizes to CloudFormation.
- Access keys contain an access key ID and secret access key; safe rotation overlaps a new key before retiring the old one.
- IAM roles and temporary credentials are preferred over embedded long-lived keys for AWS workloads.
- On EC2, customers patch the guest OS; with Lambda, AWS manages more infrastructure while customers remain responsible for code, libraries, data, IAM, and configuration.
- AWS CloudShell provides a browser-based authenticated shell with limited persistent home-directory storage.

Corrections and official-document validation are retained in `knowledge/daily/2026-08-28-reviewed.md`.

