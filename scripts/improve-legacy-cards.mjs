import fs from 'node:fs/promises'
import path from 'node:path'
import { flashcardSchema } from './card-schema.mjs'

const root = process.cwd()
const targets = [
  'flashcards/approved/2026-08-28-reviewed.json',
  'flashcards/approved/2026-09-01-databases-vpc-ec2.json',
]

const answerEnhancements = new Map([
  ['Amazon SQS.', 'Amazon SQS. It buffers each job in a queue until a worker is ready to process it.'],
  ['Amazon SNS.', 'Amazon SNS. It publishes one message to multiple subscribed destinations.'],
  ['Amazon RDS.', 'Amazon RDS. It runs familiar relational database engines while AWS handles much of the infrastructure work.'],
  ['AWS Config.', 'AWS Config. It records resource configuration history and evaluates resources against compliance rules.'],
  ['A network ACL.', 'A network ACL. It can apply an explicit deny rule to traffic crossing the subnet boundary.'],
  ['Amazon CloudFront.', 'Amazon CloudFront. It caches web content near viewers to reduce latency and origin load.'],
  ['S3 Transfer Acceleration.', 'S3 Transfer Acceleration. It uses AWS edge locations and optimized network paths to speed long-distance S3 transfers.'],
  ['AWS Outposts.', 'AWS Outposts. It brings AWS-managed infrastructure and selected services into the customer’s own facility.'],
  ['On-Demand Instances.', 'On-Demand Instances. They require no long-term commitment and are billed for the capacity used.'],
  ['EC2 Spot Instances.', 'EC2 Spot Instances. They use discounted spare capacity but must tolerate possible interruption.'],
  ['Amazon Elastic Container Registry (Amazon ECR).', 'Amazon Elastic Container Registry (Amazon ECR). It securely stores container images that ECS or EKS can later deploy.'],
  ['AWS Elastic Beanstalk.', 'AWS Elastic Beanstalk. It deploys application code while managing resources such as compute, scaling, and load balancing.'],
  ['Amazon Lightsail.', 'Amazon Lightsail. It combines common cloud resources into a simplified bundle with predictable pricing.'],
  ['AWS Batch.', 'AWS Batch. It schedules batch jobs and provisions the supported compute capacity needed to run them.'],
  ['AWS Compute Optimizer.', 'AWS Compute Optimizer. It analyzes utilization and recommends better-sized resources without changing them automatically.'],
  ['An EC2 bare metal instance type.', 'An EC2 bare metal instance. It provides direct access to the physical server while retaining AWS integrations.'],
  ['Amazon FSx for Lustre.', 'Amazon FSx for Lustre. It provides a high-performance parallel file system for data-intensive and HPC workloads.'],
  ['Backup and restore.', 'Backup and restore. Resources are recreated from backups after the incident, keeping ongoing cost low but recovery slower.'],
  ['Warm standby.', 'Warm standby. A smaller but fully working copy runs continuously and scales up during recovery.'],
  ['A CloudFormation template.', 'A CloudFormation template. CDK converts the constructs into this declarative description for deployment.'],
  ['Amazon Aurora MySQL-Compatible Edition.', 'Amazon Aurora MySQL-Compatible Edition. It combines MySQL compatibility with AWS-designed distributed storage.'],
  ['Amazon RDS for Oracle.', 'Amazon RDS for Oracle. It preserves the Oracle engine while AWS manages much of the database infrastructure.'],
  ['Amazon Redshift.', 'Amazon Redshift. It is designed for analytical SQL and data-warehouse reporting over large datasets.'],
  ['An Amazon ElastiCache caching layer.', 'Amazon ElastiCache. It keeps frequently requested results in memory so the application makes fewer database reads.'],
  ['Amazon Neptune.', 'Amazon Neptune. Its graph model is designed to traverse relationships among highly connected entities.'],
  ['Amazon Timestream for LiveAnalytics.', 'Amazon Timestream for LiveAnalytics. It stores and analyzes measurements organized by time.'],
  ['AWS Database Migration Service (AWS DMS).', 'AWS Database Migration Service (AWS DMS). It copies and can continuously replicate database data to reduce migration downtime.'],
  ['A NAT gateway, with the private subnet routed to it.', 'A NAT gateway, with the private subnet routed to it. This gives private instances outbound IPv4 access without accepting new inbound internet sessions.'],
  ['Through the local route.', 'Through the local route. The VPC’s /16 route is more specific than the /0 internet route.'],
  ['An S3 gateway VPC endpoint.', 'An S3 gateway VPC endpoint. It provides private S3 access through route-table entries without an hourly endpoint charge.'],
  ['An interface VPC endpoint.', 'An interface VPC endpoint. It creates private-IP network interfaces that can be protected with security groups.'],
  ['A Dedicated Host.', 'A Dedicated Host. It exposes the physical host, sockets, and cores needed for server-bound licensing.'],
  ['AWS Budgets.', 'AWS Budgets. It compares cost or usage with thresholds and can notify you or run separately configured actions.'],
])

const exampleOverrides = new Map([
  ['clf-c02-2026-08-28-014', 'An order is placed in SQS for one worker to process, while an SNS topic sends the order notification to email, Lambda, and another queue.'],
  ['clf-c02-2026-08-28-016', 'One CloudWatch alarm publishes to an SNS topic whose subscribers include an email address, a Lambda function, and an SQS queue.'],
  ['clf-c02-2026-08-28-017', 'A team launches a Linux EC2 instance, selects its CPU and memory size, and installs its own web application.'],
  ['clf-c02-2026-08-28-022', 'Terraform compares configuration with current infrastructure, creates a plan, and calls provider APIs; it never compiles the web application itself.'],
  ['clf-c02-2026-08-28-029', 'The name company-receipts must be globally unique, but its objects can still reside only in the selected eu-west-1 Region.'],
  ['clf-c02-2026-08-28-025', 'A VPC in eu-west-1 can contain subnets in several AZs there, but it cannot extend into eu-central-1.'],
  ['clf-c02-2026-08-28-033', 'Signing in proves Alice’s identity; her policies then decide whether she may read a particular S3 bucket.'],
  ['clf-c02-2026-08-28-034', 'A newly created analyst user cannot open an S3 report until an applicable policy explicitly grants read access.'],
  ['clf-c02-2026-08-28-037', 'A CLI profile may contain AKIA… as the access key ID and a separate secret value used together to sign requests.'],
  ['clf-c02-2026-08-28-038', 'Create a second key, switch and test the application with it, and only then deactivate and remove the first key.'],
  ['clf-c02-2026-08-28-044', 'Customer records may physically reside in Germany, while applicable law determines which government has legal authority over them.'],
  ['clf-c02-2026-08-28-048', 'Use a security group to allow HTTPS to selected servers; add a NACL when the whole subnet needs a coarse rule such as denying one CIDR.'],
  ['clf-c02-2026-08-28-051', 'An S3 bucket is not launched into 10.0.1.0/24; private VPC resources reach the Regional S3 service through an endpoint.'],
  ['clf-c02-2026-08-28-052', 'A route table can send private S3 or DynamoDB traffic through a free gateway endpoint instead of a NAT gateway.'],
  ['clf-c02-2026-08-28-059', 'CloudFront caches website images near viewers; Global Accelerator instead speeds a non-cacheable game connection through static anycast IPs.'],
  ['clf-c02-2026-08-28-061', 'A metro rendering workload may use a Local Zone, while a 5G vehicle application may use a Wavelength Zone inside a carrier network.'],
  ['clf-c02-2026-08-28-067', 'Store photos as S3 objects, attach EBS as one server’s disk, and mount EFS when many Linux servers need the same directory.'],
  ['clf-c02-2026-08-28-060', 'Users in several continents upload large video files to one distant S3 bucket through nearby AWS edge locations.'],
  ['clf-c02-2026-08-28-065', 'Two supported Nitro instances in one AZ attach the same io2 volume, while a cluster-aware application coordinates their writes.'],
  ['clf-c02-2026-08-28-068', 'A root EBS volume marked delete-on-termination disappears with the instance, while a retained data volume can survive.'],
  ['clf-c02-2026-08-28-073', 'Use Cost Explorer to discover last month’s increase, then create an AWS Budget to alert when next month’s forecast reaches $500.'],
  ['clf-c02-2026-08-28-074', 'CloudWatch alarms when application latency rises; AWS Budgets alerts when forecasted monthly spending crosses a financial threshold.'],
  ['clf-c02-2026-08-28-072', 'Crossing an $500 Budget threshold sends an alert, but the running EC2 instances continue unless a separate budget action is configured.'],
  ['clf-c02-2026-08-28-078', 'A running matching EC2 instance receives an RI billing discount; purchasing the RI did not create or dedicate that server.'],
  ['clf-c02-2026-08-28-079', 'Several containers share one host kernel, while each virtual machine boots and maintains its own guest operating system.'],
  ['clf-c02-2026-08-28-081', 'Use ECS for AWS-native orchestration, EKS for Kubernetes compatibility, and Fargate with either when you do not want to manage worker servers.'],
  ['clf-c02-2026-08-28-082', 'A CI pipeline pushes version 2.0 of an image to ECR, and an ECS service later pulls that image for deployment.'],
  ['clf-c02-2026-08-28-085', 'A basic company website may use a fixed Lightsail bundle; a web application needing configurable autoscaling and load balancing may use Beanstalk.'],
  ['clf-c02-2026-08-28-095', 'A highly available service recovers quickly after a node fails; a fault-tolerant design continues serving without interruption.'],
  ['clf-c02-2026-08-28-096', 'An RPO of 15 minutes permits 15 minutes of lost changes, while an RTO of one hour permits one hour to restore service.'],
  ['clf-c02-2026-08-28-097', 'After a disaster, the team restores database backups and redeploys servers, accepting slower recovery for very low standby cost.'],
  ['clf-c02-2026-08-28-099', 'Pilot light keeps only the critical core ready; warm standby keeps a scaled-down but complete application already running.'],
  ['clf-c02-2026-08-28-100', 'A small working environment serves minimal capacity in the recovery Region and scales up when the primary Region fails.'],
  ['clf-c02-2026-08-28-101', 'Two Regions may already serve traffic, yet asynchronous database replication can still leave the recovery copy several seconds behind.'],
  ['clf-c02-2026-08-28-102', 'A synchronous write waits for both copies and can target zero data loss; an asynchronous replica may remain several seconds behind.'],
  ['clf-c02-2026-08-28-107', 'Application code uses an SDK to upload an object; infrastructure code uses CDK to define the bucket and synthesize CloudFormation.'],
  ['clf-c02-2026-08-28-106', 'A TypeScript CDK definition of a bucket becomes a declarative CloudFormation template when cdk synth runs.'],
  ['clf-c02-2026-08-28-111', 'CDK code can use loops and functions, but the result deployed by CloudFormation is still a declarative template.'],
  ['clf-c02-2026-08-28-110', 'An EC2 API call targets a named Region such as us-west-2, while a centralized global service may expose an endpoint without a Region in its hostname.'],
  ['clf-c02-2026-08-28-112', 'SQS buffers each order for one worker, while SNS independently publishes an order event to several interested subscribers.'],
  ['clf-c02-2026-08-28-116', 'The globally unique bucket name company-receipts can still store its objects only in the selected eu-west-1 Region.'],
  ['clf-c02-2026-08-28-118', 'A global multiplayer game uses Global Accelerator’s static anycast IPs to improve UDP paths without caching packets.'],
  ['clf-c02-2026-08-28-120', 'AWS maintains the physical EC2 host, while the customer patches the guest OS and decides which security-group traffic to allow.'],
  ['clf-c02-2026-08-28-126', 'Active/active Regions can make application failover almost immediate, but asynchronous database writes may still create a nonzero RPO.'],
  ['clf-c02-2026-08-28-127', 'Running cdk synth on a TypeScript stack outputs the CloudFormation template that describes its resources.'],
  ['clf-c02-2026-08-28-129', 'A factory processes data on AWS-managed Outposts racks installed inside its own facility.'],
  ['clf-c02-2026-09-01-005', 'Choose Aurora for an AWS-built MySQL-compatible design; choose RDS for SQL Server when the application must keep the Microsoft engine.'],
  ['clf-c02-2026-09-01-003', 'A legacy application keeps Microsoft SQL Server while moving to RDS so AWS manages backups and database infrastructure.'],
  ['clf-c02-2026-09-01-007', 'A new application keeps the MySQL protocol but uses Aurora MySQL-Compatible Edition for an AWS-built relational design.'],
  ['clf-c02-2026-09-01-008', 'An application that depends on Oracle-specific features moves to RDS for Oracle instead of changing database engines.'],
  ['clf-c02-2026-09-01-011', 'An application records individual orders in RDS, then analysts summarize years of order history in a Redshift warehouse.'],
  ['clf-c02-2026-09-01-014', 'An application can choose Valkey or Redis OSS for feature-rich caching, or Memcached for a simpler distributed cache.'],
  ['clf-c02-2026-09-01-019', 'Millions of devices write timestamped readings to Timestream so operators can query how measurements changed over time.'],
  ['clf-c02-2026-09-01-022', 'An Oracle-to-PostgreSQL migration converts incompatible table definitions and stored code before DMS moves the data.'],
  ['clf-c02-2026-09-01-023', 'A VPC in us-east-1 can contain subnets in us-east-1a and us-east-1b, but it cannot extend into us-west-2.'],
  ['clf-c02-2026-09-01-025', 'A web subnet has a default route to an internet gateway; a database subnet has no direct internet-gateway route.'],
  ['clf-c02-2026-09-01-029', 'A publicly addressed web server connects directly through an internet gateway; a private server downloads updates through a NAT gateway.'],
  ['clf-c02-2026-09-01-030', 'The rule 0.0.0.0/0 → internet gateway pairs the destination range with the component that receives matching traffic.'],
  ['clf-c02-2026-09-01-031', 'A route table sends traffic toward an internet gateway; a security group separately decides whether HTTPS is allowed.'],
  ['clf-c02-2026-09-01-033', 'Traffic for 10.0.2.15 chooses the 10.0.0.0/16 local route because /16 is more specific than the /0 internet route.'],
  ['clf-c02-2026-09-01-037', 'A security group allows HTTPS to one server and automatically permits replies; a subnet NACL separately allows or denies both traffic directions.'],
  ['clf-c02-2026-09-01-040', 'The same WebServers security group can protect EC2 instances in two different subnets of the same VPC.'],
  ['clf-c02-2026-09-01-042', 'A private EC2 instance reaches a supported AWS service through a VPC endpoint without a public IP, NAT gateway, or internet gateway.'],
  ['clf-c02-2026-09-01-044', 'A VPC can add route-table-based gateway endpoints for S3 and DynamoDB; other services generally use interface endpoints.'],
  ['clf-c02-2026-09-01-045', 'Private S3 traffic can use a gateway endpoint route, while private Secrets Manager traffic can use an interface endpoint ENI.'],
  ['clf-c02-2026-09-01-047', 'A private application reaches Secrets Manager through an interface endpoint’s private IPs and restricts access with its security group.'],
  ['clf-c02-2026-09-01-048', 'A DynamoDB gateway endpoint adds service routes to selected route tables instead of creating PrivateLink network interfaces.'],
  ['clf-c02-2026-09-01-049', 'A general-purpose M family instance fits a web application that needs a balanced mix of CPU, memory, and networking.'],
  ['clf-c02-2026-09-01-052', 'A machine-learning training job uses GPU-backed P family instances to accelerate matrix calculations.'],
  ['clf-c02-2026-09-01-054', 'A normal server uses shared tenancy, a compliance workload may use Dedicated Instances, and a socket-bound license uses a Dedicated Host.'],
  ['clf-c02-2026-09-01-055', 'A database license tied to physical sockets runs on a Dedicated Host so the company can audit cores and host placement.'],
  ['clf-c02-2026-09-01-056', 'A server can use dedicated tenancy for isolation while also using an On-Demand or commitment-based purchase option for cost.'],
])

const exampleFor = (card) => {
  const text = `${card.prompt} ${card.answer} ${card.topics.join(' ')} ${card.services.join(' ')}`.toLowerCase()
  const has = (...needles) => needles.some((needle) => text.includes(needle))

  if (has('sqs', 'work queue')) return 'An online store places each order in a queue, and available workers process the orders at their own pace.'
  if (has('sns', 'fan-out')) return 'One monitoring alarm publishes to a topic that notifies email, Lambda, and an SQS queue at the same time.'
  if (has('amazon rds', 'rds for')) return 'A company runs PostgreSQL on RDS so AWS handles backups and database infrastructure while the team manages its schema and data.'
  if (has('aurora')) return 'A new payment application uses Aurora PostgreSQL for relational SQL with storage designed to remain available across multiple AZs.'
  if (has('redshift')) return 'A retailer loads years of sales data into Redshift so analysts can run large business-intelligence reports.'
  if (has('elasticache')) return 'A catalog page reads popular product details from memory instead of querying the database on every visit.'
  if (has('neptune', 'graph data')) return 'A fraud analyst follows links among accounts, devices, addresses, and transactions to discover a fraud ring.'
  if (has('timestream', 'time-series')) return 'Millions of sensors store timestamped temperature readings for analysis over time.'
  if (has('database migration', ' dms', 'schema conversion')) return 'A company copies its on-premises database to AWS while ongoing changes continue to replicate until cutover.'
  if (has('root user')) return 'An administrator uses a normal role every day and opens the root account only for a task that specifically requires root.'
  if (has('iam user')) return 'A developer can have an IAM identity inside the company account without owning a separate AWS account, email subscription, or payment method.'
  if (has('access key', 'temporary security credentials', 'iam role')) return 'An EC2 application assumes a role and receives temporary credentials instead of storing a secret key in a file.'
  if (has('authentication', 'authorization')) return 'Signing in proves Alice’s identity; her policies then decide whether she may read a particular S3 bucket.'
  if (has('least privilege', 'permissions does a newly')) return 'A reporting user receives only read access to one reports bucket, not administrator access to the account.'
  if (has('iam policy', 'condition')) return 'A policy permits an administrative action only when the request is authenticated with MFA.'
  if (has('service control polic', 'scp')) return 'An SCP blocks member accounts from disabling CloudTrail, but an IAM role still needs its own permission to use CloudTrail.'
  if (has('aws config')) return 'Config shows that a security group became noncompliant after someone opened port 22 to the whole internet.'
  if (has('residency', 'sovereignty')) return 'Data may reside in Germany while also being subject to laws that govern the organization controlling it.'
  if (has('govcloud')) return 'An eligible U.S. government contractor runs a regulated workload in an isolated AWS GovCloud (US) Region.'
  if (has('security group')) return 'A web server security group permits inbound HTTPS, and the response traffic is allowed automatically.'
  if (has('network acl', 'nacl')) return 'A subnet NACL denies a known malicious CIDR and separately permits the required inbound and outbound traffic.'
  if (has('gateway vpc endpoint', 'gateway endpoint')) return 'Private instances reach S3 through a route-table entry without using a NAT gateway.'
  if (has('interface vpc endpoint', 'interface endpoint', 'privatelink')) return 'A private application reaches Secrets Manager through private endpoint IP addresses protected by a security group.'
  if (has('internet gateway')) return 'A public web server needs a public IP, a route to the internet gateway, and security rules allowing HTTPS.'
  if (has('nat gateway')) return 'Private application servers download operating-system updates through a NAT gateway but cannot receive unsolicited internet connections.'
  if (has('route table', 'local route', 'most specific')) return 'Traffic for 10.0.2.15 follows the 10.0.0.0/16 local route instead of the less-specific 0.0.0.0/0 route.'
  if (has('dhcp')) return 'A VPC DHCP options set supplies DNS settings to a newly launched EC2 instance.'
  if (has('subnet')) return 'A company creates one public and one private subnet in each of two Availability Zones for resilience.'
  if (has('availability zone id', 'us-east-1a')) return 'Two accounts compare the AZ ID use1-az2 because the label us-east-1a may map differently in each account.'
  if (has('availability zone', 'region contains')) return 'A workload runs in two AZs in the same Region so one data-center failure does not stop the service.'
  if (has('region selection')) return 'A company chooses Frankfurt because its users are nearby, required services are available, and data must remain in the EU.'
  if (has('amazon vpc', 'vpc span', 'vpc belongs')) return 'A VPC in eu-west-1 can use several AZs there, but it cannot extend into eu-central-1.'
  if (has('s3 bucket', 'amazon s3', 's3 =')) return 'A photo is stored as an object in a bucket and retrieved through an S3 API request rather than mounted as a disk block.'
  if (has('cloudfront invalidation')) return 'After correcting a CSS file, a team invalidates that path so viewers receive the new version before the old TTL expires.'
  if (has('cloudfront')) return 'A website caches images at edge locations so distant visitors do not fetch every image from the origin Region.'
  if (has('global accelerator')) return 'A global game uses two fixed anycast IP addresses to route UDP players onto the AWS network without caching content.'
  if (has('transfer acceleration')) return 'Users in several continents upload large video files faster to one distant S3 bucket through nearby edge locations.'
  if (has('local zones', 'wavelength')) return 'A metro rendering workload may use a Local Zone, while a 5G vehicle application may use a Wavelength Zone in a carrier network.'
  if (has('outposts')) return 'A factory processes data locally on AWS-managed racks installed in its own building because it needs very low on-premises latency.'
  if (has('direct connect')) return 'A data center uses a dedicated link to AWS for more consistent hybrid network performance than an internet-based connection.'
  if (has('amazon ebs', 'ebs volume', 'ebs =')) return 'A database server attaches an EBS volume as a block device in the same Availability Zone.'
  if (has('amazon efs', 'efs =')) return 'Hundreds of Linux EC2 instances mount the same EFS directory over NFS.'
  if (has('cloudshell')) return 'A script saved in the CloudShell home directory remains available when the user returns to that Region later.'
  if (has('cloudwatch agent', 'guest-memory')) return 'The CloudWatch agent running inside an EC2 instance publishes memory utilization that EC2 does not provide by default.'
  if (has('cloudwatch')) return 'A CloudWatch alarm sends a notification when an application’s error metric exceeds its threshold.'
  if (has('budget', 'cost explorer')) return 'Finance explores last month’s spend in Cost Explorer and creates a Budget alert for next month’s forecast.'
  if (has('on-demand')) return 'A temporary test server runs for two days with no commitment and is then terminated.'
  if (has('spot')) return 'A rendering job saves checkpoints so it can resume elsewhere if AWS interrupts its discounted Spot instance.'
  if (has('savings plan')) return 'A company commits to a predictable hourly amount of compute usage for one year to receive lower prices.'
  if (has('reserved instance')) return 'A continuously running, matching EC2 instance receives the RI billing discount; buying the RI did not launch that server.'
  if (has('container differ', 'virtual machine')) return 'Several containers share one host kernel, while each virtual machine boots and maintains its own guest operating system.'
  if (has('cluster itself')) return 'A group of EC2 capacity forms a cluster, but ECS or Kubernetes decides where the containers should run.'
  if (has('ecs', 'eks', 'fargate')) return 'A team uses EKS for Kubernetes and Fargate so it does not have to provision the worker servers.'
  if (has('ecr')) return 'A deployment pipeline pushes version 3 of an application image to ECR, and ECS later pulls that image.'
  if (has('beanstalk')) return 'Developers upload a web application, and Beanstalk creates and monitors the EC2, scaling, and load-balancing environment.'
  if (has('lightsail')) return 'A small company launches a basic website using a bundle that includes a virtual server, storage, and transfer allowance.'
  if (has('aws batch')) return 'A nightly scientific workload submits thousands of jobs, and AWS Batch schedules them onto suitable compute capacity.'
  if (has('compute optimizer')) return 'Compute Optimizer notices a lightly used EC2 instance and recommends a smaller type; the owner decides whether to change it.'
  if (has('nitro')) return 'Nitro hardware offloads networking and storage tasks so more of the host resources can serve EC2 workloads securely.'
  if (has('bare metal')) return 'A licensing or performance workload accesses the physical processor directly while still using VPC networking and EBS.'
  if (has('bottlerocket')) return 'An ECS node runs Bottlerocket with a minimal software footprint focused on hosting containers.'
  if (has('parallelcluster')) return 'A researcher describes an HPC cluster in configuration, and ParallelCluster creates its scheduler, instances, and networking.'
  if (has('placement group', 'elastic fabric adapter', 'tightly coupled')) return 'Simulation nodes use a cluster placement group and EFA to exchange data with very low latency.'
  if (has('lustre')) return 'Compute nodes read and write a shared high-throughput dataset through an FSx for Lustre file system.'
  if (has('ground station')) return 'A satellite operator schedules an antenna contact and sends the received data directly into AWS services.'
  if (has('high availability', 'fault tolerance')) return 'A highly available service recovers quickly after a node fails; a fault-tolerant design continues without interruption.'
  if (has('rto', 'rpo', '15 minutes')) return 'An RPO of 15 minutes permits up to 15 minutes of lost changes, while an RTO of one hour permits one hour to restore service.'
  if (has('backup and restore')) return 'After a disaster, the team restores database backups and redeploys servers, accepting a longer recovery time for lower ongoing cost.'
  if (has('pilot light')) return 'The recovery Region keeps replicated data and essential core services ready, then launches the remaining application during failover.'
  if (has('warm standby')) return 'A small working copy serves minimal capacity in the recovery Region and scales up when the primary Region fails.'
  if (has('active/active', 'multi-site')) return 'Two Regions serve users at once, but asynchronously copied database changes could still leave a small RPO.'
  if (has('synchronous', 'asynchronous replication')) return 'A synchronous write waits for both copies; an asynchronous copy may trail the primary by several seconds.'
  if (has('cloudformation stack', 'deleting a cloudformation')) return 'One stack manages a VPC, load balancer, and servers together, while a retained database can survive stack deletion.'
  if (has('cloudformation')) return 'The same reviewed YAML template creates an identical test environment and production environment.'
  if (has('cdk synth', 'aws cdk')) return 'A developer defines a bucket in TypeScript CDK code, then synthesizes a CloudFormation template for deployment.'
  if (has('aws sdk')) return 'Application code uses an AWS SDK to upload an object, while CDK code defines the bucket itself as infrastructure.'
  if (has('terraform')) return 'Terraform compares configuration with current infrastructure, creates a plan, and calls provider APIs to make the required changes.'
  if (has('infrastructure as code')) return 'A version-controlled template creates the same network in development and production instead of relying on manual clicks.'
  if (has('management console', 'service api')) return 'Creating a bucket through the console or CLI ultimately results in a request to the S3 service API.'
  if (has('infrastructure as a service', 'iaas')) return 'AWS supplies the EC2 hardware and virtualization, while the customer patches the guest OS and manages the application.'
  if (has('amazon resource name', 'arn')) return 'An IAM policy uses a bucket ARN to grant access to exactly that resource.'
  if (has('signature version 4', 'signed')) return 'The AWS CLI hashes and signs a request so AWS can verify both the caller and the request contents.'
  if (has('regional service endpoint', 'global endpoint')) return 'An application calls a Region-specific EC2 endpoint, while IAM uses a centralized global endpoint pattern.'
  if (has('ec2 provide', 'virtual compute')) return 'A team launches a Linux EC2 instance, selects its CPU and memory size, and installs its own web application.'
  if (has('lambda security')) return 'AWS patches Lambda infrastructure, while the customer fixes a vulnerable library bundled with the function.'
  if (has('customer responsibilities', 'patches the guest')) return 'For EC2, AWS maintains the physical host, but the customer installs operating-system security updates.'
  if (has('general purpose')) return 'A small web application uses a general-purpose M family because it needs balanced CPU and memory.'
  if (has('compute optimized')) return 'A CPU-heavy media-encoding job uses a C family instance.'
  if (has('memory optimized')) return 'A large in-memory database uses an R family instance because RAM is the main constraint.'
  if (has('accelerated computing', 'gpu')) return 'A machine-learning training job uses GPU-based accelerated computing instances.'
  if (has('storage optimized', 'nvme')) return 'A high-IOPS local database evaluates an I family instance with NVMe instance storage.'
  if (has('dedicated host', 'dedicated instances', 'shared tenancy')) return 'General workloads use shared tenancy, compliance isolation may use Dedicated Instances, and socket-bound licenses use a Dedicated Host.'
  if (has('ec2 tenancy', 'purchasing models')) return 'A server can use dedicated tenancy for isolation while also using an On-Demand or commitment-based pricing option for cost.'
  throw new Error(`No useful example rule for ${card.id}: ${card.prompt}`)
}

let changed = 0
for (const relativePath of targets) {
  const file = path.join(root, relativePath)
  const cards = JSON.parse(await fs.readFile(file, 'utf8'))
  const improved = cards.map((original) => {
    const answer = answerEnhancements.get(original.answer) ?? original.answer
    const card = flashcardSchema.parse({
      ...original,
      answer,
      example: exampleOverrides.get(original.id) ?? original.example ?? exampleFor({ ...original, answer }),
      version: Math.max(original.version, 2),
    })
    changed += 1
    return card
  })
  await fs.writeFile(file, `${JSON.stringify(improved, null, 2)}\n`, 'utf8')
}

console.log(`Improved ${changed} legacy cards without changing their IDs.`)
