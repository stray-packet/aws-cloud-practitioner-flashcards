---
study_date: 2026-09-15
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_chat: 2026-09-15 · Chat 12 — Analytics & Application Integration
source_date_note: Original report contained [STUDY_DATE]; normalized to the supplied date 2026-09-15.
---

# Analytics and application integration — reviewed knowledge

## Analytics

- Amazon Athena runs serverless SQL directly against data in Amazon S3. AWS Glue discovers schemas, maintains the Data Catalog, and runs extract-transform-load (ETL) jobs.
- A Glue crawler scans data and creates or updates metadata tables. A Glue worker is compute capacity used by an ETL job; it is not a human role.
- RDS is for relational transaction processing, DynamoDB for serverless key-value/document workloads, and Redshift for analytical data warehousing.

## Messaging and APIs

- Amazon SQS is a queue: consumers pull messages and process them independently. Amazon SNS is publish/subscribe: one publication can fan out to many subscribers.
- Amazon Kinesis handles real-time data streams with ordered records and multiple readers. Amazon MSK is managed Apache Kafka. Amazon MQ runs managed ActiveMQ or RabbitMQ for compatibility with existing broker-based applications.
- API Gateway publishes and manages REST, HTTP, and WebSocket APIs. AWS AppSync provides managed GraphQL APIs and real-time data synchronization.

## Networking, recovery, and edge

- Gateway VPC endpoints support S3 and DynamoDB through route tables. Interface endpoints use AWS PrivateLink and private IP addresses in endpoint network interfaces.
- RPO is the acceptable amount of data loss measured in time; RTO is the acceptable time to restore service.
- Backup and restore is usually cheapest and slowest to recover. Pilot light keeps core components running. Warm standby runs a scaled-down environment. Multi-site active/active offers the fastest recovery at the highest cost.
- Local Zones place AWS compute and storage closer to a metro area. Wavelength Zones place AWS services in telecom networks for ultra-low-latency 5G applications.
- An ARN uniquely identifies an AWS resource. AWS API requests are normally signed so AWS can authenticate and authorize them.

## Official sources

- [Athena concepts](https://docs.aws.amazon.com/athena/latest/ug/what-is.html)
- [AWS Glue components](https://docs.aws.amazon.com/glue/latest/dg/components-key-concepts.html)
- [AWS application integration decision guide](https://docs.aws.amazon.com/decision-guides/latest/application-integration-on-aws-how-to-choose/application-integration-on-aws-how-to-choose.html)
- [VPC endpoint concepts](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html)
- [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

