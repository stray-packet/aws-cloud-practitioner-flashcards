---
study_date: 2026-08-28
chat_number: 7
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_file: knowledge/inbox/7.txt
---

# Chat 7 — Compute, Containers, HPC & Storage

- S3 is object storage, EBS is block storage for EC2, and EFS is shared NFS file storage.
- EBS volume persistence on instance termination depends on the attachment’s delete-on-termination setting; supported io1/io2 volumes have a constrained Multi-Attach exception.
- On-Demand fits flexible non-interruptible workloads; Spot fits interruption-tolerant work; Savings Plans exchange a usage commitment for discounts; Reserved Instances are billing benefits rather than dedicated servers.
- Containers share a host kernel; virtual machines include guest operating systems.
- ECS orchestrates containers with AWS-native APIs; EKS provides managed Kubernetes; Fargate supplies serverless compute capacity for supported orchestrators.
- ECR stores container images; Elastic Beanstalk manages application environments; Lightsail offers simplified bundled hosting.
- AWS Batch schedules batch jobs and provisions supported compute environments.
- Compute Optimizer provides rightsizing recommendations without automatically changing resources.
- Nitro offloads infrastructure functions to dedicated hardware; EC2 bare-metal instances expose physical hardware while retaining AWS integrations.
- ParallelCluster automates HPC clusters; cluster placement and EFA support tightly coupled workloads; FSx for Lustre provides a parallel file system.
- AWS Ground Station provides managed access to satellite ground-station antennas and processing workflows.

Corrections and official-document validation are retained in `knowledge/daily/2026-08-28-reviewed.md`.
