---
study_date: 2026-09-15
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_chat: 2026-09-15 · Chat 9 — EC2 Pricing & Security
---

# EC2 pricing and security — reviewed knowledge

## EC2 commitments and capacity

- A Reserved Instance (RI) is a billing discount, not a running server. A Regional RI gives instance-size flexibility within a family on Linux/UNIX shared tenancy, but does not reserve capacity. A Zonal RI applies in one Availability Zone and includes a capacity reservation.
- An On-Demand Capacity Reservation holds capacity in a specific Availability Zone. You pay for the reserved capacity whether or not an instance uses it. A matching RI or Savings Plan can discount the compute charge, but capacity and discount remain separate ideas.
- Standard RIs normally provide the larger discount and can be modified in limited ways. Convertible RIs trade some discount for the ability to exchange the commitment for different instance attributes.
- Spot Instances use spare EC2 capacity at a large discount and can be interrupted. They fit fault-tolerant, flexible workloads—not a database that must remain continuously available.
- Current Savings Plans include Compute, EC2 Instance, SageMaker AI, and Database Savings Plans. The exam principle is to distinguish a spend commitment from a particular capacity reservation.
- Shared, Dedicated Instance, and Dedicated Host describe hardware tenancy. A Dedicated Host provides host-level visibility and placement control for server-bound licensing. It is not a Spot purchase option.

## Identity, governance, and detection

- IAM policies define allowed or denied actions. Conditions narrow when a statement applies, such as requiring a source IP, tag, or MFA context.
- Service control policies (SCPs) set the maximum permissions available to member accounts in AWS Organizations. They do not grant permissions by themselves and do not restrict the management account.
- CloudTrail records AWS API and account activity: who did what, when, and from where. GuardDuty analyzes signals to detect suspicious activity. Detective helps investigate and visualize relationships after a finding.
- AWS WAF filters web requests at layer 7. AWS Shield protects against distributed denial-of-service attacks; Shield Standard is included automatically, while Shield Advanced adds enhanced protection and response features.
- AWS KMS manages encryption keys and integrates with AWS services. IAM Identity Center centralizes workforce access to multiple AWS accounts and applications.

## Important current corrections

- The source's Spot partial-hour billing shortcut is too broad; interruption billing depends on the operating system, billing unit, and whether AWS or the user ends the instance. The certification-level takeaway is interruption tolerance.
- Savings Plans are no longer limited to the older three-type list; AWS now documents four plan types, including Database Savings Plans.
- Dedicated Hosts are purchased On-Demand or through Dedicated Host Reservations; they should not be taught as Spot hosts.

## Official sources

- [Reserved Instances overview](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html)
- [How Regional and Zonal RI benefits apply](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/apply_ri.html)
- [Capacity Reservation billing](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/capacity-reservations-pricing-billing.html)
- [Dedicated Hosts](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html)
- [Savings Plans types](https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html)
- [Spot interruption billing](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/billing-for-interrupted-spot-instances.html)
- [SCP effects](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)

