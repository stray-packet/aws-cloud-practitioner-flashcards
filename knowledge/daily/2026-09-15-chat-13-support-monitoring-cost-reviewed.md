---
study_date: 2026-09-15
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_chat: 2026-09-15 · Chat 13 — Support, Monitoring & Cost
---

# Support, monitoring, and cost — reviewed knowledge

## Advice, monitoring, and audit

- Trusted Advisor checks an AWS environment and recommends improvements in six categories: Cost Optimization, Performance, Security, Fault Tolerance, Service Limits, and Operational Excellence.
- The Well-Architected Tool reviews a workload against architectural best practices. Trusted Advisor inspects account resources; the Well-Architected Tool guides a structured workload review.
- CloudWatch answers “how is it behaving?” with metrics, logs, alarms, and dashboards. CloudTrail answers “who made this API call?” AWS Config answers “what was this resource's configuration, and was it compliant?”
- AWS Health reports AWS events. The service health view shows broad service events; account-specific views show events that may affect the customer's resources.

## Support and responsibility

- Basic Support is included. AWS currently offers Business Support+, Enterprise Support, and Unified Operations as premium plans. Older Developer and Business naming is transitioning and should not be memorized as the durable current model.
- Trusted Advisor recommendation access varies by support plan and feature. Do not memorize the old shortcut “seven checks versus all checks” as a universal current rule.
- AWS Trust & Safety accepts reports of AWS resources being used for abuse. Under the shared responsibility model, customers remain responsible for their content, identities, permissions, and lawful use.
- An AWS SLA can provide service credits when its conditions and claim process are satisfied; it is not an automatic cash refund.

## Cost and migration

- Pricing Calculator estimates cost before deployment. Cost Explorer analyzes actual and forecasted spend. AWS Budgets alerts or takes configured actions when cost or usage crosses thresholds.
- AWS DMS moves or continuously replicates data with low downtime. For heterogeneous migrations, use DMS Schema Conversion to assess and convert schemas; AWS Schema Conversion Tool is now the legacy path.
- AWS Architecture Center provides reference architectures and guidance. AWS Marketplace provides deployable third-party offerings.

## Official sources

- [Trusted Advisor categories](https://docs.aws.amazon.com/awssupport/latest/user/get-started-with-aws-trusted-advisor.html)
- [Trusted Advisor access](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html)
- [Current AWS Support plans](https://aws.amazon.com/premiumsupport/plans/)
- [AWS Health concepts](https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html)
- [DMS Schema Conversion](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_SchemaConversion.html)
- [Legacy AWS SCT guidance](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.SCT.html)

