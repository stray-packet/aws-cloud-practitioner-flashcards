---
study_date: 2026-09-18
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
source_chat: 2026-09-18 · Chat 14
status: reviewed
---

# Security, messaging, media, and load balancing

## Exam-priority material

- AWS CloudHSM versus AWS KMS: CloudHSM provides dedicated single-tenant HSMs and more customer administration; KMS is the standard highly available managed key service integrated across AWS.
- Current correction: do not memorize “KMS is FIPS Level 2.” AWS KMS currently uses FIPS 140-3 Security Level 3 validated HSMs. The durable exam distinction is dedicated control versus managed integration.
- AWS Security Hub aggregates and prioritizes security findings and posture checks. It complements GuardDuty, Inspector, and Macie rather than replacing them.
- AWS Artifact supplies AWS compliance reports and selected agreements. AWS Config tracks resource configuration and compliance. AWS Audit Manager automates evidence collection for customer assessments.
- AWS Firewall Manager centrally applies security policies across accounts and resources.
- Amazon Inspector finds vulnerabilities in EC2 workloads, ECR images, and Lambda functions. GuardDuty detects suspicious behavior. Macie discovers sensitive data in S3.
- Amazon SNS provides publish/subscribe fan-out. Amazon SES provides application email.
- Elastic Load Balancing distributes traffic across healthy targets. ALB is request-aware Layer 7 HTTP/HTTPS routing; NLB is high-performance Layer 4 TCP/TLS/UDP/QUIC; GWLB inserts virtual appliances at Layer 3; CLB is the legacy generation.

## Course supplementary material

The current official CLF-C02 guide lists the following discussed services outside its primary in-scope list. Cards are retained to preserve the course material, but they should not displace study time from official in-scope services.

- AWS AppConfig: runtime application configuration and feature flags.
- Amazon Pinpoint: segmented customer engagement campaigns.
- Amazon WorkMail: managed employee email and calendars.
- AWS Elemental MediaConvert: file-based video transcoding.
- AWS Elemental MediaConnect: live-video transport.
- Amazon Elastic Transcoder: legacy file transcoding.

## Corrected confusion

- MediaConvert handles file conversion, watermarks, captions, and packaging. MediaConnect transports live video; the original slide had these names reversed.
- Inspector is continuous vulnerability management, not merely a one-time PDF report generator.
- Trusted Advisor currently spans broad best-practice recommendations; it is not a substitute for workload vulnerability scanning or threat detection.

## Sources checked

- AWS Certified Cloud Practitioner CLF-C02 exam guide and current in-scope/out-of-scope service lists.
- AWS KMS Developer Guide, data protection section.
- AWS CloudHSM User Guide.
- Elastic Load Balancing documentation for ALB, NLB, GWLB, and CLB behavior.
