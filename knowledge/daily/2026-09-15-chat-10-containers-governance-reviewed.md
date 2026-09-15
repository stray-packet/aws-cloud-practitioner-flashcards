---
study_date: 2026-09-15
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_chat: 2026-09-15 · Chat 10 — Containers & Multi-Account Governance
---

# Containers and multi-account governance — reviewed knowledge

## Containers and application platforms

- A container packages an application and its dependencies. Kubernetes coordinates containers; a Pod is its smallest deployable unit and can hold one or more tightly related containers.
- Amazon ECS is AWS's native container orchestrator. Amazon EKS is managed Kubernetes. AWS Fargate is serverless compute for ECS or EKS, so AWS manages the underlying servers.
- Amazon ECR stores container images. It is a registry, not an orchestrator or runtime.
- Elastic Beanstalk deploys and manages web applications while still exposing the underlying AWS resources. Lightsail offers simplified bundles for small projects. Amplify targets web and mobile frontends with hosting and backend integration.
- AWS X-Ray traces requests across distributed applications to help locate latency and errors.

## Organizations and Control Tower

- AWS Organizations groups independent AWS accounts for centralized governance and consolidated billing. An organizational unit (OU) is a logical account grouping; an IAM user is only an identity inside one account.
- Keep the management account focused on organization administration and billing; place normal workloads in member accounts.
- SCPs limit the maximum available permissions in member accounts but do not grant access.
- AWS Control Tower builds and governs a multi-account landing zone using AWS Organizations and other services. Account Factory creates standardized accounts.
- AWS now calls guardrails **controls**. Preventive controls stop disallowed actions, detective controls identify noncompliance, and proactive controls check resources before provisioning.
- AWS Config records resource configuration and evaluates compliance over time. CloudTrail records API activity; CloudWatch monitors metrics, logs, alarms, and operational behavior.

## Official sources

- [Choosing an AWS container service](https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/containers.html)
- [AWS Organizations terminology](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html)
- [Control Tower terminology](https://docs.aws.amazon.com/controltower/latest/userguide/terminology.html)
- [Control Tower controls](https://docs.aws.amazon.com/controltower/latest/controlreference/controls.html)
- [AWS Config concepts](https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html)

