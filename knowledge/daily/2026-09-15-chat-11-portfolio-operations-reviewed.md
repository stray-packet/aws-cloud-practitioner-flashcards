---
study_date: 2026-09-15
certification: AWS Certified Cloud Practitioner
exam_code: CLF-C02
status: reviewed
source_chat: 2026-09-15 · Chat 11 — AWS Portfolio & Operations
---

# AWS portfolio and operations — reviewed knowledge

## Organization and frameworks

- Tags are key-value metadata used to organize, allocate costs, automate, and control access to resources. Resource Groups create views or actions over resources selected by tags or queries; neither is a relational database.
- The AWS Cloud Adoption Framework helps an organization plan cloud transformation through business and technical perspectives. The Well-Architected Framework evaluates workload design through six pillars.
- EC2 key pairs authenticate operating-system access such as SSH. IAM access keys authenticate programmatic AWS API requests. Tags are labels, not credentials.

## Application and provisioning choices

- Amazon Connect is a cloud contact center; WorkSpaces provides managed virtual desktops; SES sends email at scale; QuickSight is managed business intelligence.
- CloudFormation provisions infrastructure from declarative templates. CDK lets developers define infrastructure using programming languages and synthesizes CloudFormation templates.
- Elastic Beanstalk manages application deployment on AWS resources; App Runner is a simpler managed path from source code or a container image to a web service; Amplify focuses on web/mobile development and hosting.
- AWS Marketplace is a catalog for third-party software and services. AWS Architecture Center provides architecture guidance and patterns.
- License Manager helps track and enforce software-license rules.

## Operations and data services

- CloudTrail records API activity. CloudWatch monitors metrics, logs, events, alarms, and application health. Athena runs serverless SQL queries over data in Amazon S3.
- DynamoDB is a serverless key-value/document database. DocumentDB is document-oriented and MongoDB-compatible. Keyspaces is Cassandra-compatible. Redshift is a data warehouse.
- AWS Glue discovers, catalogs, and transforms data. Lake Formation helps build and govern data lakes. Amazon MSK runs managed Apache Kafka. AWS Data Exchange helps subscribe to and use third-party datasets.

## Retired and transitioning services

- Amazon WorkDocs, the Amazon Chime application, AWS OpsWorks, AWS CodeStar, and Amazon QLDB have ended support. They are preserved only as historical corrections and are not recommended in flashcards.
- Amazon Pinpoint reaches end of support on October 30, 2026; its messaging APIs continue under AWS End User Messaging. Amazon WorkMail reaches end of support March 31, 2027 and is closed to new customers. Neither is taught as a normal new-workload choice.

## Official sources

- [AWS tagging guidance](https://docs.aws.amazon.com/tag-editor/latest/userguide/tagging.html)
- [Cloud Adoption Framework](https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/welcome.html)
- [Well-Architected pillars](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html)
- [Full-shutdown AWS services](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
- [Amazon Pinpoint migration](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html)
- [Amazon WorkMail end of support](https://docs.aws.amazon.com/workmail/latest/adminguide/workmail-end-of-support.html)

