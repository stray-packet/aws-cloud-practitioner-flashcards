---
study_date: 2026-09-01
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source: Gemini chat report supplied in project conversation
source_chat: 2026-09-01 · Chat 8 — Databases, VPC & EC2
reviewed_against_official_aws_docs: 2026-09-01
---

# Databases, VPC networking, and EC2 — reviewed knowledge

This note normalizes the study report into current, exam-oriented facts. It preserves what was studied, removes misleading absolutes, and separates topics that were merely suggested from studied material.

## Relational and specialized data services

- Amazon RDS is a managed relational database service supporting engines including PostgreSQL, MySQL, MariaDB, Oracle Database, Microsoft SQL Server, and IBM Db2. It is a strong choice for relational workloads and migrations that need a familiar engine while AWS manages much of the database infrastructure.
- Amazon Aurora is an AWS-built relational engine compatible with MySQL and PostgreSQL. Its distributed storage is replicated across three Availability Zones and is designed for high availability and cloud-scale performance.
- Amazon Redshift is a managed, petabyte-scale data warehouse for analytics and business-intelligence workloads. The exam cue is analytical SQL and data warehousing, not low-latency transactional processing.
- Amazon ElastiCache is a managed in-memory cache. Current engine choices include Valkey, Memcached, and Redis OSS. It reduces latency and load on databases by keeping frequently accessed data in memory.
- Amazon Neptune is a managed graph database for highly connected data such as fraud networks, social relationships, and recommendation graphs.
- Amazon Timestream for LiveAnalytics is a managed time-series database for timestamped operational, application, and IoT data.
- AWS Database Migration Service (AWS DMS) migrates and replicates databases with minimal downtime. It can support homogeneous and heterogeneous migrations; schema conversion can be required when engines differ.

### Current-service correction: Amazon QLDB

Amazon QLDB reached end of support on July 31, 2025. The source report correctly described its former ledger use case, but QLDB must not be presented as a current service recommendation in this deck. No normal service-selection flashcard is generated for it.

## VPC scope, subnets, and routing

- A VPC is a logically isolated virtual network associated with one AWS Region. Its subnets can be distributed across Availability Zones in that Region.
- A subnet belongs to exactly one Availability Zone. An AZ can contain multiple subnets.
- A public subnet has a route to an internet gateway. An instance also needs an appropriate public IPv4 address or IPv6 address and security rules before it can communicate directly with the internet.
- A private subnet has no direct route to an internet gateway. A NAT gateway can provide outbound IPv4 connectivity for private resources while preventing unsolicited inbound connections initiated from the internet.
- An internet gateway is a horizontally scaled, redundant, highly available VPC component that enables communication between a VPC and the internet.
- A route table contains destination-and-target rules. It chooses a path; it does not allocate IP addresses and it is not a firewall. Each route table includes a local route for communication within the VPC.
- VPC DHCP options provide settings such as domain-name servers. Address assignment and routing are separate responsibilities.

## Network filtering

- Security groups are stateful, attach to resource network interfaces, and contain allow rules. Return traffic for an allowed flow is automatically permitted.
- A newly created security group has no inbound rules and normally includes an outbound allow rule. Rules can be changed, so “all outbound is always allowed” is too absolute.
- Network ACLs are stateless subnet-level controls. They support allow and deny rules, process numbered rules in order, and evaluate inbound and outbound directions separately.
- A security group can be associated with supported resources in different subnets within the same VPC. It is not a subnet-scoped object.
- Route tables determine paths; security groups and network ACLs evaluate traffic permissions.

## Private service connectivity

- A VPC endpoint provides private access to supported services without requiring an internet gateway, NAT device, VPN, or public IP on the client.
- An interface VPC endpoint uses AWS PrivateLink and creates endpoint network interfaces with private IP addresses in selected subnets. Security groups can control traffic to those interfaces, and normal endpoint-hour/data-processing charges apply.
- Gateway VPC endpoints support Amazon S3 and DynamoDB. They add routes to selected route tables and do not use AWS PrivateLink.
- “AWS PrivateLink is only a brand underneath every VPC endpoint” is incomplete: interface endpoints use PrivateLink, while gateway endpoints for S3 and DynamoDB do not.

## EC2 workload categories

- General purpose instances balance compute, memory, and networking; T and M families are common examples.
- Compute optimized instances are suited to CPU-intensive workloads; C families are common examples.
- Memory optimized instances are suited to large in-memory datasets; R and X families are common examples.
- Accelerated computing instances use hardware accelerators such as GPUs; P and G families are common examples.
- Storage optimized instances are suited to high local-storage throughput or IOPS; I and D families are common examples.
- Letter associations can help memory, but expansions such as “T means Tiny” or “M means Medium” are not official selection rules. Choose by workload characteristics.

## EC2 tenancy

- Shared tenancy is the default: instances from multiple AWS accounts can share physical hardware while remaining isolated by the virtualization platform.
- Dedicated Instances run on hardware dedicated to one AWS account, but AWS controls instance placement and the customer does not receive host-level socket, core, or host-ID visibility.
- A Dedicated Host is a physical server dedicated to the customer, with host-level visibility and placement control. It is the stronger fit when server-bound licenses or compliance rules require physical socket/core tracking.
- Tenancy and purchase options answer different questions. Dedicated/Shared describes hardware allocation; On-Demand, Spot, Reserved Instances, and Savings Plans describe pricing or commitment models.

## Sources used for correction and validation

- [CLF-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html)
- [AWS database decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)
- [Aurora Regions and Availability Zones](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.RegionsAndAvailabilityZones.html)
- [ElastiCache engine selection](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html)
- [Amazon QLDB end of support](https://docs.aws.amazon.com/qldb/latest/developerguide/getting-started-step-7.html)
- [AWS PrivateLink concepts](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html)
- [Create an interface endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html)
- [Dedicated Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-instance.html)
