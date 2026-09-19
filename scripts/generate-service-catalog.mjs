import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

// name, official category, study groups (pipe-separated), plain-language purpose,
// exam-recognition cue, official AWS Architecture Icon filename
const official = [
  ['Amazon Athena', 'Analytics', 'Analytics & Data', 'run serverless SQL queries directly over data in Amazon S3', 'SQL over S3 without managing servers', 'Arch_Amazon-Athena_64.svg'],
  ['Amazon EMR', 'Analytics', 'Analytics & Data', 'run managed big-data frameworks such as Apache Spark and Hadoop', 'managed Spark or Hadoop clusters', 'Arch_Amazon-EMR_64.svg'],
  ['AWS Glue', 'Analytics', 'Analytics & Data', 'discover, catalog, prepare, and transform data for analytics', 'serverless ETL and the Glue Data Catalog', 'Arch_AWS-Glue_64.svg'],
  ['Amazon Kinesis', 'Analytics', 'Analytics & Data|Messaging & Workflows', 'collect and process real-time streaming data', 'real-time streams such as clicks, logs, or telemetry', 'Arch_Amazon-Kinesis_64.svg'],
  ['Amazon OpenSearch Service', 'Analytics', 'Analytics & Data|Observability & Developer Tools', 'search, analyze, and visualize large volumes of logs or documents', 'managed search and log analytics', 'Arch_Amazon-OpenSearch-Service_64.svg'],
  ['Amazon QuickSight', 'Analytics', 'Analytics & Data|Business & End-user Apps', 'build managed business-intelligence dashboards and visualizations', 'BI dashboards for business users', 'Arch_Amazon-Quick_64.svg'],
  ['Amazon Redshift', 'Analytics', 'Analytics & Data|Databases & Caching', 'analyze large datasets in a cloud data warehouse', 'petabyte-scale OLAP and BI reporting', 'Arch_Amazon-Redshift_64.svg'],

  ['Amazon EventBridge', 'Application Integration', 'Messaging & Workflows', 'route events between applications and AWS services using rules', 'event bus and event-driven routing', 'Arch_Amazon-EventBridge_64.svg'],
  ['Amazon SNS', 'Application Integration', 'Messaging & Workflows', 'push one message to many subscribed endpoints', 'publish/subscribe fan-out and notifications', 'Arch_Amazon-Simple-Notification-Service_64.svg'],
  ['Amazon SQS', 'Application Integration', 'Messaging & Workflows', 'buffer messages in a durable queue so producers and consumers are decoupled', 'pull-based queue for independent workers', 'Arch_Amazon-Simple-Queue-Service_64.svg'],
  ['AWS Step Functions', 'Application Integration', 'Messaging & Workflows|Compute & Serverless', 'coordinate distributed application steps with visual workflows', 'state machines, retries, and workflow orchestration', 'Arch_AWS-Step-Functions_64.svg'],

  ['Amazon Connect', 'Business Applications', 'Business & End-user Apps', 'provide a managed cloud contact center for voice and chat', 'customer contact center and agent routing', 'Arch_Amazon-Connect_64.svg'],
  ['Amazon SES', 'Business Applications', 'Business & End-user Apps|Messaging & Workflows', 'send and receive scalable application email', 'transactional or bulk application email', 'Arch_Amazon-Simple-Email-Service_64.svg'],

  ['AWS Budgets', 'Cloud Financial Management', 'Cost, Marketplace & Support', 'track cost or usage against thresholds and send alerts or actions', 'budget threshold and forecast alerts', 'Arch_AWS-Budgets_64.svg'],
  ['AWS Cost and Usage Reports', 'Cloud Financial Management', 'Cost, Marketplace & Support|Analytics & Data', 'deliver the most detailed AWS cost and usage data for analysis', 'granular billing report files', 'Arch_AWS-Cost-and-Usage-Report_64.svg'],
  ['AWS Cost Explorer', 'Cloud Financial Management', 'Cost, Marketplace & Support|Analytics & Data', 'analyze historical cost and usage and create forecasts', 'visual cost analysis after resources run', 'Arch_AWS-Cost-Explorer_64.svg'],
  ['AWS Marketplace', 'Cloud Financial Management', 'Cost, Marketplace & Support', 'find, buy, and deploy third-party software, data, and services', 'AWS catalog for third-party solutions', 'Arch_AWS-Marketplace_Light_64.svg'],

  ['AWS Batch', 'Compute', 'Compute & Serverless', 'schedule and run batch jobs on automatically provisioned compute', 'queued batch workloads without managing a custom scheduler', 'Arch_AWS-Batch_64.svg'],
  ['Amazon EC2', 'Compute', 'Compute & Serverless', 'run resizable virtual machines with operating-system control', 'virtual servers and instance families', 'Arch_Amazon-EC2_64.svg'],
  ['AWS Elastic Beanstalk', 'Compute', 'Compute & Serverless|Observability & Developer Tools', 'deploy web applications while AWS manages the supporting environment', 'managed application platform with access to underlying resources', 'Arch_AWS-Elastic-Beanstalk_64.svg'],
  ['Amazon Lightsail', 'Compute', 'Compute & Serverless', 'launch simplified virtual servers and common small-workload bundles', 'simple predictable bundle for a small site or app', 'Arch_Amazon-Lightsail_64.svg'],
  ['AWS Outposts', 'Compute', 'Compute & Serverless|Migration & Hybrid', 'run AWS infrastructure and services in an on-premises location', 'AWS hardware and experience on premises', 'Arch_AWS-Outposts-family_64.svg'],

  ['Amazon ECR', 'Containers', 'Containers|Observability & Developer Tools', 'store and manage container images in a private registry', 'container image registry', 'Arch_Amazon-Elastic-Container-Registry_64.svg'],
  ['Amazon ECS', 'Containers', 'Containers|Compute & Serverless', 'orchestrate containers with an AWS-native control plane', 'AWS-native container orchestration', 'Arch_Amazon-Elastic-Container-Service_64.svg'],
  ['Amazon EKS', 'Containers', 'Containers|Compute & Serverless', 'run managed Kubernetes clusters on AWS', 'Kubernetes compatibility and APIs', 'Arch_Amazon-Elastic-Kubernetes-Service_64.svg'],

  ['AWS Support', 'Customer Enablement', 'Cost, Marketplace & Support', 'provide account, billing, and technical support according to the selected plan', 'support plans and access to AWS experts', 'Arch_AWS-Support_64.svg'],

  ['Amazon Aurora', 'Database', 'Databases & Caching', 'run an AWS-built relational database compatible with MySQL or PostgreSQL', 'cloud-native relational performance and high availability', 'Arch_Amazon-Aurora_64.svg'],
  ['Amazon DocumentDB', 'Database', 'Databases & Caching', 'run a managed document database compatible with MongoDB workloads', 'JSON-like document database and MongoDB compatibility', 'Arch_Amazon-DocumentDB_64.svg'],
  ['Amazon DynamoDB', 'Database', 'Databases & Caching|Compute & Serverless', 'store key-value and document data in a serverless NoSQL database', 'single-digit-millisecond NoSQL at scale', 'Arch_Amazon-DynamoDB_64.svg'],
  ['Amazon ElastiCache', 'Database', 'Databases & Caching', 'cache frequently accessed data in memory with Valkey, Memcached, or Redis OSS engines', 'in-memory cache that reduces latency', 'Arch_Amazon-ElastiCache_64.svg'],
  ['Amazon Neptune', 'Database', 'Databases & Caching', 'store and query highly connected graph data', 'relationships, fraud rings, or recommendation graphs', 'Arch_Amazon-Neptune_64.svg'],
  ['Amazon RDS', 'Database', 'Databases & Caching', 'operate managed relational database engines with routine administration handled by AWS', 'managed SQL engines such as MySQL, PostgreSQL, Oracle, and SQL Server', 'Arch_Amazon-RDS_64.svg'],

  ['AWS CLI', 'Developer Tools', 'Observability & Developer Tools', 'manage AWS services from a command-line interface', 'scripted or terminal access to AWS APIs', 'Arch_AWS-Command-Line-Interface_64.svg'],
  ['AWS CodeBuild', 'Developer Tools', 'Observability & Developer Tools', 'compile source code, run tests, and produce build artifacts', 'fully managed build stage', 'Arch_AWS-CodeBuild_64.svg'],
  ['AWS CodePipeline', 'Developer Tools', 'Observability & Developer Tools|Messaging & Workflows', 'automate software release stages from source through deployment', 'continuous delivery pipeline orchestration', 'Arch_AWS-CodePipeline_64.svg'],
  ['AWS X-Ray', 'Developer Tools', 'Observability & Developer Tools', 'trace requests across distributed application components', 'find latency and errors in a request path', 'Arch_AWS-X-Ray_64.svg'],

  ['Amazon AppStream 2.0', 'End User Computing', 'Business & End-user Apps', 'stream desktop applications securely to a web browser', 'stream an application without delivering a full desktop', 'Arch-Category_End-User-Computing_64.svg'],
  ['Amazon WorkSpaces', 'End User Computing', 'Business & End-user Apps', 'deliver managed persistent virtual desktops', 'desktop-as-a-service for employees', 'Arch_Amazon-WorkSpaces_64.svg'],
  ['Amazon WorkSpaces Secure Browser', 'End User Computing', 'Business & End-user Apps|Security & Threat Protection', 'provide isolated, managed browser access to internal sites and SaaS apps', 'secure browser rather than a full virtual desktop', 'Arch_Amazon-WorkSpaces_64.svg'],

  ['AWS Amplify', 'Frontend Web and Mobile', 'Frontend & IoT|Observability & Developer Tools', 'build, deploy, and host web and mobile frontends with managed integrations', 'frontend and mobile developer platform', 'Arch_AWS-Amplify_64.svg'],
  ['AWS IoT Core', 'Internet of Things (IoT)', 'Frontend & IoT|Messaging & Workflows', 'connect and exchange messages with large fleets of IoT devices', 'managed device connectivity and MQTT messaging', 'Arch_AWS-IoT-Core_64.svg'],

  ['Amazon Comprehend', 'Machine Learning', 'AI & ML|Analytics & Data', 'extract sentiment, entities, and meaning from text using managed NLP', 'natural-language insights from text', 'Arch_Amazon-Comprehend_64.svg'],
  ['Amazon Lex', 'Machine Learning', 'AI & ML|Business & End-user Apps', 'build conversational chatbots and voice bots', 'conversation interfaces using voice and text', 'Arch_Amazon-Lex_64.svg'],
  ['Amazon Polly', 'Machine Learning', 'AI & ML|Business & End-user Apps', 'turn text into lifelike speech', 'text-to-speech', 'Arch_Amazon-Polly_64.svg'],
  ['Amazon Q', 'Machine Learning', 'AI & ML|Business & End-user Apps', 'provide generative-AI assistance for work and software development', 'AWS generative AI assistant', 'Arch_Amazon-Q_64.svg'],
  ['Amazon Rekognition', 'Machine Learning', 'AI & ML', 'analyze images and video for objects, faces, text, and unsafe content', 'computer vision for images and video', 'Arch_Amazon-Rekognition_64.svg'],
  ['Amazon SageMaker AI', 'Machine Learning', 'AI & ML|Analytics & Data', 'build, train, and deploy machine-learning models', 'end-to-end custom ML platform', 'Arch_Amazon-SageMaker-AI_64.svg'],
  ['Amazon Textract', 'Machine Learning', 'AI & ML|Analytics & Data', 'extract printed text, handwriting, tables, and forms from documents', 'intelligent document extraction', 'Arch_Amazon-Textract_64.svg'],
  ['Amazon Transcribe', 'Machine Learning', 'AI & ML|Business & End-user Apps', 'convert speech audio into text', 'speech-to-text', 'Arch_Amazon-Transcribe_64.svg'],
  ['Amazon Translate', 'Machine Learning', 'AI & ML|Business & End-user Apps', 'translate text between human languages', 'managed language translation', 'Arch_Amazon-Translate_64.svg'],

  ['AWS Auto Scaling', 'Management and Governance', 'Governance & Operations|Compute & Serverless', 'scale multiple AWS resources to match demand', 'automatic capacity adjustment and elasticity', 'Arch_AWS-Auto-Scaling_64.svg'],
  ['AWS CloudFormation', 'Management and Governance', 'Governance & Operations|Observability & Developer Tools', 'provision AWS resources repeatedly from declarative templates', 'infrastructure as code using stacks', 'Arch_AWS-CloudFormation_64.svg'],
  ['AWS CloudTrail', 'Management and Governance', 'Governance & Operations|Security & Threat Protection|Observability & Developer Tools', 'record AWS account activity and API events for auditing', 'who called which AWS API and when', 'Arch_AWS-CloudTrail_64.svg'],
  ['Amazon CloudWatch', 'Management and Governance', 'Governance & Operations|Observability & Developer Tools', 'collect metrics, logs, and alarms for operational monitoring', 'resource behavior, dashboards, logs, and alarms', 'Arch_Amazon-CloudWatch_64.svg'],
  ['AWS Compute Optimizer', 'Management and Governance', 'Governance & Operations|Cost, Marketplace & Support', 'recommend better-sized compute resources from utilization data', 'rightsizing recommendations', 'Arch_AWS-Compute-Optimizer_64.svg'],
  ['AWS Config', 'Management and Governance', 'Governance & Operations|Security & Threat Protection', 'record resource configurations and evaluate them against rules', 'configuration history, drift, and compliance', 'Arch_AWS-Config_64.svg'],
  ['AWS Control Tower', 'Management and Governance', 'Governance & Operations|Identity & Access', 'set up and govern a standardized multi-account landing zone', 'opinionated multi-account governance and controls', 'Arch_AWS-Control-Tower_64.svg'],
  ['AWS Health Dashboard', 'Management and Governance', 'Governance & Operations|Cost, Marketplace & Support', 'show AWS events and account-specific issues that can affect resources', 'personalized resource health events', 'Arch_AWS-Health-Dashboard_64.svg'],
  ['AWS License Manager', 'Management and Governance', 'Governance & Operations|Cost, Marketplace & Support', 'track and control software licenses across AWS and on premises', 'BYOL license rules and usage tracking', 'Arch_AWS-License-Manager_64.svg'],
  ['AWS Management Console', 'Management and Governance', 'Governance & Operations', 'manage AWS through a web-based graphical interface', 'browser-based access to AWS services', 'Arch_AWS-Management-Console_64.svg'],
  ['AWS Organizations', 'Management and Governance', 'Governance & Operations|Identity & Access|Cost, Marketplace & Support', 'centrally organize accounts, apply policy boundaries, and consolidate billing', 'OUs, SCPs, and consolidated billing', 'Arch_AWS-Organizations_64.svg'],
  ['AWS Service Catalog', 'Management and Governance', 'Governance & Operations', 'publish approved cloud products for users to launch consistently', 'governed catalog of preapproved products', 'Arch_AWS-Service-Catalog_64.svg'],
  ['Service Quotas', 'Management and Governance', 'Governance & Operations', 'view service limits and request increases from one place', 'quotas and limit-increase requests', 'Arch-Category_Management-Tools_64.svg'],
  ['AWS Systems Manager', 'Management and Governance', 'Governance & Operations|Security & Threat Protection', 'operate and automate fleets of AWS and hybrid resources centrally', 'patching, remote commands, inventory, and Parameter Store', 'Arch_AWS-Systems-Manager_64.svg'],
  ['AWS Trusted Advisor', 'Management and Governance', 'Governance & Operations|Cost, Marketplace & Support|Security & Threat Protection', 'inspect an AWS environment and recommend best-practice improvements', 'account-level recommendations across cost, security, performance, and resilience', 'Arch_AWS-Trusted-Advisor_64.svg'],
  ['AWS Well-Architected Tool', 'Management and Governance', 'Governance & Operations', 'document structured workload reviews against Well-Architected pillars', 'workload review questions and improvement plan', 'Arch_AWS-Well-Architected-Tool_64.svg'],

  ['AWS Application Discovery Service', 'Migration and Transfer', 'Migration & Hybrid', 'collect on-premises server usage and dependency data for migration planning', 'discover existing workloads before migration', 'Arch_AWS-Application-Discovery-Service_64.svg'],
  ['AWS Application Migration Service', 'Migration and Transfer', 'Migration & Hybrid|Compute & Serverless', 'lift and shift physical, virtual, or cloud servers into AWS', 'rehost servers with block-level replication', 'Arch_AWS-Application-Migration-Service_64.svg'],
  ['AWS DMS', 'Migration and Transfer', 'Migration & Hybrid|Databases & Caching', 'move or continuously replicate database data with minimal downtime', 'database migration and ongoing replication', 'Arch_AWS-Database-Migration-Service_64.svg'],
  ['Migration Evaluator', 'Migration and Transfer', 'Migration & Hybrid|Cost, Marketplace & Support', 'build a data-driven business case and cost projection for migration', 'migration assessment and TCO business case', 'Arch_AWS-Migration-Evaluator_64.svg'],
  ['AWS Migration Hub', 'Migration and Transfer', 'Migration & Hybrid|Governance & Operations', 'track application migrations across AWS and partner tools in one place', 'central migration progress dashboard', 'Arch_AWS-Migration-Hub_64.svg'],
  ['AWS SCT', 'Migration and Transfer', 'Migration & Hybrid|Databases & Caching', 'assess and convert database schemas for a different target engine', 'heterogeneous database schema conversion', 'Arch_AWS-Database-Migration-Service_64.svg'],

  ['Amazon API Gateway', 'Networking and Content Delivery', 'Networking & Delivery|Compute & Serverless', 'create, publish, protect, and monitor REST, HTTP, and WebSocket APIs', 'managed API front door', 'Arch_Amazon-API-Gateway_64.svg'],
  ['Amazon CloudFront', 'Networking and Content Delivery', 'Networking & Delivery|Security & Threat Protection', 'cache and deliver content globally through edge locations', 'content delivery network and edge caching', 'Arch_Amazon-CloudFront_64.svg'],
  ['AWS Direct Connect', 'Networking and Content Delivery', 'Networking & Delivery|Migration & Hybrid', 'provide a dedicated private network connection from a location to AWS', 'consistent private dedicated connectivity', 'Arch_AWS-Direct-Connect_64.svg'],
  ['AWS Global Accelerator', 'Networking and Content Delivery', 'Networking & Delivery', 'send TCP or UDP traffic through the AWS global network using static anycast IPs', 'global network acceleration without caching', 'Arch_AWS-Global-Accelerator_64.svg'],
  ['AWS PrivateLink', 'Networking and Content Delivery', 'Networking & Delivery|Security & Threat Protection', 'access supported services privately through VPC interface endpoints', 'private service connectivity without public internet', 'Arch_AWS-PrivateLink_64.svg'],
  ['Amazon Route 53', 'Networking and Content Delivery', 'Networking & Delivery', 'provide managed DNS, domain registration, routing policies, and health checks', 'DNS and domain-name traffic routing', 'Arch_Amazon-Route-53_64.svg'],
  ['AWS Transit Gateway', 'Networking and Content Delivery', 'Networking & Delivery|Migration & Hybrid', 'connect many VPCs and on-premises networks through a central hub', 'hub-and-spoke network transit', 'Arch_AWS-Transit-Gateway_64.svg'],
  ['Amazon VPC', 'Networking and Content Delivery', 'Networking & Delivery|Security & Threat Protection', 'create an isolated virtual network for AWS resources', 'subnets, route tables, gateways, and network controls', 'Arch_Amazon-Virtual-Private-Cloud_64.svg'],
  ['AWS VPN', 'Networking and Content Delivery', 'Networking & Delivery|Migration & Hybrid', 'provide encrypted network connectivity over the internet', 'umbrella term for AWS managed VPN options', 'Arch_AWS-Site-to-Site-VPN_64.svg'],
  ['AWS Site-to-Site VPN', 'Networking and Content Delivery', 'Networking & Delivery|Migration & Hybrid', 'connect an on-premises network to a VPC through encrypted IPsec tunnels', 'network-to-network encrypted tunnel', 'Arch_AWS-Site-to-Site-VPN_64.svg'],
  ['AWS Client VPN', 'Networking and Content Delivery', 'Networking & Delivery|Identity & Access', 'connect individual remote users securely to AWS or on-premises networks', 'managed remote-user VPN', 'Arch_AWS-Client-VPN_64.svg'],
  ['Elastic Load Balancing', 'Networking and Content Delivery', 'Networking & Delivery|Compute & Serverless', 'distribute incoming traffic across healthy targets', 'ALB for HTTP routing, NLB for high-performance L4, GWLB for appliances', 'Arch_Elastic-Load-Balancing_64.svg'],

  ['AWS Artifact', 'Security, Identity, and Compliance', 'Security & Threat Protection|Governance & Operations', 'download AWS compliance reports and manage selected agreements', 'AWS audit reports and compliance documents', 'Arch_AWS-Artifact_64.svg'],
  ['AWS Certificate Manager', 'Security, Identity, and Compliance', 'Security & Threat Protection|Identity & Access', 'provision and manage TLS certificates for integrated AWS services', 'managed public and private certificates', 'Arch_AWS-Certificate-Manager_64.svg'],
  ['AWS CloudHSM', 'Security, Identity, and Compliance', 'Security & Threat Protection|Identity & Access', 'operate dedicated single-tenant hardware security modules with customer-controlled keys', 'dedicated HSM and strict key control', 'Arch_AWS-CloudHSM_64.svg'],
  ['Amazon Cognito', 'Security, Identity, and Compliance', 'Identity & Access|Frontend & IoT', 'add customer sign-up, sign-in, and access control to applications', 'application user identity and federation', 'Arch_Amazon-Cognito_64.svg'],
  ['Amazon Detective', 'Security, Identity, and Compliance', 'Security & Threat Protection|Observability & Developer Tools', 'investigate security findings by connecting activity and resource relationships', 'security investigation after a finding', 'Arch_Amazon-Detective_64.svg'],
  ['AWS Directory Service', 'Security, Identity, and Compliance', 'Identity & Access|Migration & Hybrid', 'run or connect Microsoft Active Directory-compatible directories on AWS', 'managed directory and Active Directory integration', 'Arch_AWS-Directory-Service_64.svg'],
  ['AWS Firewall Manager', 'Security, Identity, and Compliance', 'Security & Threat Protection|Governance & Operations', 'centrally apply firewall and protection policies across accounts and resources', 'organization-wide WAF, Shield, and firewall policies', 'Arch_AWS-Firewall-Manager_64.svg'],
  ['Amazon GuardDuty', 'Security, Identity, and Compliance', 'Security & Threat Protection|Observability & Developer Tools', 'detect threats by analyzing AWS logs, events, and runtime signals', 'managed threat detection and suspicious behavior', 'Arch_Amazon-GuardDuty_64.svg'],
  ['AWS IAM', 'Security, Identity, and Compliance', 'Identity & Access|Security & Threat Protection|Governance & Operations', 'control authentication and authorization for AWS identities and resources', 'users, groups, roles, and policies with least privilege', 'Arch_AWS-Identity-and-Access-Management_64.svg'],
  ['AWS IAM Identity Center', 'Security, Identity, and Compliance', 'Identity & Access|Governance & Operations', 'centrally assign workforce access to multiple AWS accounts and applications', 'single sign-on for workforce users', 'Arch_AWS-IAM-Identity-Center_64.svg'],
  ['Amazon Inspector', 'Security, Identity, and Compliance', 'Security & Threat Protection|Observability & Developer Tools', 'continuously scan EC2, ECR images, and Lambda functions for vulnerabilities', 'software vulnerabilities and unintended network exposure', 'Arch_Amazon-Inspector_64.svg'],
  ['AWS KMS', 'Security, Identity, and Compliance', 'Identity & Access|Security & Threat Protection', 'create and control encryption keys through a highly available managed service', 'integrated managed encryption keys', 'Arch_AWS-Key-Management-Service_64.svg'],
  ['Amazon Macie', 'Security, Identity, and Compliance', 'Security & Threat Protection|Analytics & Data', 'discover and protect sensitive data stored in Amazon S3', 'machine-learning discovery of PII in S3', 'Arch_Amazon-Macie_64.svg'],
  ['AWS RAM', 'Security, Identity, and Compliance', 'Identity & Access|Governance & Operations', 'share supported AWS resources across accounts or within an organization', 'cross-account resource sharing without duplication', 'Arch_AWS-Resource-Access-Manager_64.svg'],
  ['AWS Secrets Manager', 'Security, Identity, and Compliance', 'Identity & Access|Security & Threat Protection', 'store, retrieve, and rotate application secrets', 'database passwords, API keys, and automatic rotation', 'Arch_AWS-Secrets-Manager_64.svg'],
  ['AWS Security Hub', 'Security, Identity, and Compliance', 'Security & Threat Protection|Governance & Operations', 'aggregate and prioritize security findings and posture checks', 'central security findings and standards dashboard', 'Arch_AWS-Security-Hub_64.svg'],
  ['AWS Shield', 'Security, Identity, and Compliance', 'Security & Threat Protection|Networking & Delivery', 'protect applications against distributed denial-of-service attacks', 'DDoS protection', 'Arch_AWS-Shield_64.svg'],
  ['AWS WAF', 'Security, Identity, and Compliance', 'Security & Threat Protection|Networking & Delivery', 'filter malicious HTTP and HTTPS requests using web ACL rules', 'web request filtering such as IP, path, or SQL injection', 'Arch_AWS-WAF_64.svg'],

  ['AWS Fargate', 'Serverless', 'Compute & Serverless|Containers', 'run ECS tasks or EKS pods without managing servers', 'serverless compute for containers', 'Arch_AWS-Fargate_64.svg'],
  ['AWS Lambda', 'Serverless', 'Compute & Serverless|Messaging & Workflows', 'run event-driven code without provisioning servers', 'short-lived functions triggered by events', 'Arch_AWS-Lambda_64.svg'],

  ['AWS Backup', 'Storage', 'Storage, Backup & DR|Governance & Operations', 'centrally define and monitor backup policies across supported services', 'centralized policy-based backups', 'Arch_AWS-Backup_64.svg'],
  ['Amazon EBS', 'Storage', 'Storage, Backup & DR|Compute & Serverless', 'provide persistent block volumes for EC2 instances', 'block storage in one Availability Zone', 'Arch_Amazon-Elastic-Block-Store_64.svg'],
  ['Amazon EFS', 'Storage', 'Storage, Backup & DR|Compute & Serverless', 'provide elastic shared file storage for Linux workloads', 'regional NFS file system shared by many instances', 'Arch_Amazon-EFS_64.svg'],
  ['AWS Elastic Disaster Recovery', 'Storage', 'Storage, Backup & DR|Migration & Hybrid', 'replicate servers and recover them quickly in AWS after disruption', 'block-level disaster-recovery replication', 'Arch_AWS-Elastic-Disaster-Recovery_64.svg'],
  ['Amazon FSx', 'Storage', 'Storage, Backup & DR', 'provide managed file systems optimized for Windows, Lustre, NetApp ONTAP, or OpenZFS needs', 'managed specialized file systems', 'Arch_Amazon-FSx_64.svg'],
  ['Amazon S3', 'Storage', 'Storage, Backup & DR|Analytics & Data', 'store durable objects in buckets at virtually unlimited scale', 'object storage, storage classes, and lifecycle policies', 'Arch_Amazon-Simple-Storage-Service_64.svg'],
  ['Amazon S3 Glacier', 'Storage', 'Storage, Backup & DR|Cost, Marketplace & Support', 'archive rarely accessed data in low-cost S3 archival storage classes', 'long-term archive with retrieval tradeoffs', 'Arch_Amazon-Simple-Storage-Service-Glacier_64.svg'],
  ['AWS Storage Gateway', 'Storage', 'Storage, Backup & DR|Migration & Hybrid', 'connect on-premises environments to AWS storage through hybrid file, volume, or tape gateways', 'hybrid storage bridge and local cache', 'Arch_AWS-Storage-Gateway_64.svg'],
]

const supplementary = [
  ['AWS Audit Manager', 'Course supplementary', 'Security & Threat Protection|Governance & Operations', 'automate evidence collection for customer compliance assessments', 'audit evidence and assessment reports', 'Arch_AWS-Audit-Manager_64.svg'],
  ['AWS AppConfig', 'Course supplementary', 'Governance & Operations|Observability & Developer Tools', 'deploy application configuration and feature flags safely at runtime', 'feature flags without redeploying code', 'Arch_AWS-AppConfig_64.svg'],
  ['Amazon Pinpoint', 'Course supplementary', 'Business & End-user Apps|Messaging & Workflows', 'build segmented customer-engagement campaigns', 'marketing journeys and audience segments', 'Arch_Amazon-Pinpoint_64.svg'],
  ['Amazon WorkMail', 'Course supplementary', 'Business & End-user Apps', 'provide managed business email and calendars', 'employee mailbox and calendar service', 'Arch_Amazon-WorkMail_64.svg'],
  ['AWS Elemental MediaConvert', 'Course supplementary', 'Business & End-user Apps', 'transcode file-based video into delivery formats', 'file-based video conversion and packaging', 'Arch_AWS-Elemental-MediaConvert_64.svg'],
  ['AWS Elemental MediaConnect', 'Course supplementary', 'Business & End-user Apps|Networking & Delivery', 'transport high-quality live video streams', 'reliable live video contribution transport', 'Arch_AWS-Elemental-MediaConnect_64.svg'],
  ['Amazon Elastic Transcoder', 'Course supplementary', 'Business & End-user Apps', 'transcode media files using a legacy AWS service', 'legacy file transcoding; prefer MediaConvert for new work', 'Arch-Category_Media-Services_64.svg'],
  ['Amazon Timestream', 'Course supplementary', 'Databases & Caching|Analytics & Data', 'store and analyze time-series data such as IoT metrics', 'time-stamped measurements', 'Arch_Amazon-Timestream_64.svg'],
  ['Amazon QLDB', 'Course supplementary', 'Databases & Caching', 'store an immutable and cryptographically verifiable transaction journal', 'ledger history', 'Arch-Category_Databases_64.svg'],
  ['AWS Wavelength', 'Course supplementary', 'Networking & Delivery|Compute & Serverless', 'place AWS compute and storage within telecom networks for low-latency 5G applications', 'carrier-network edge computing', 'Arch_AWS-Wavelength_64.svg'],
  ['AWS Network Firewall', 'Course supplementary', 'Security & Threat Protection|Networking & Delivery', 'inspect and filter VPC network traffic with a managed stateful firewall', 'managed VPC network firewall', 'Arch_AWS-Network-Firewall_64.svg'],
]

const toEntry = (raw, scope) => {
  const [name, officialCategory, groups, purpose, examCue, icon] = raw
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    officialCategory,
    groups: groups.split('|'),
    scope,
    purpose: `${name} helps you ${purpose}.`,
    hint: `Think: ${examCue}.`,
    examCue,
    icon,
  }
}

const catalog = [
  ...official.map((service) => toEntry(service, 'official')),
  ...supplementary.map((service) => toEntry(service, 'supplementary')),
]

const duplicateIds = catalog.filter((service, index) => catalog.findIndex((candidate) => candidate.id === service.id) !== index)
if (duplicateIds.length) throw new Error(`Duplicate service ids: ${duplicateIds.map((service) => service.id).join(', ')}`)

await fs.writeFile(path.join(root, 'src', 'data', 'service-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
console.log(`Generated ${catalog.length} service study cards (${official.length} official, ${supplementary.length} supplementary).`)
