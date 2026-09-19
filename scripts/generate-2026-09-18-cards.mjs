import fs from 'node:fs/promises'
import path from 'node:path'
import { flashcardSchema } from './card-schema.mjs'

const root = process.cwd()
const chatSource = 'knowledge/daily/2026-09-18-chat-14-security-messaging-elb-reviewed.md'
const gapSource = 'knowledge/gaps/2026-09-18-coverage-audit.md'

const chatCards = [
  ['comparison', 'When should a company choose AWS CloudHSM instead of AWS KMS?', 'Choose CloudHSM when dedicated single-tenant HSMs and direct control of HSM users, keys, and cryptographic operations are required. Choose KMS for the usual managed encryption-key experience integrated with AWS services.', 'Both services protect keys with HSMs. The exam-level difference is operational control and tenancy, not the outdated shortcut that KMS is only “FIPS Level 2.”', 'A bank with a mandate for dedicated HSM appliances may use CloudHSM; an S3 encryption key normally fits KMS.', 'Dedicated single-tenant HSM control = CloudHSM; managed integrated keys = KMS.', ['Encryption', 'Security'], ['AWS CloudHSM', 'AWS KMS'], 2],
  ['recall', 'How is responsibility divided for an AWS CloudHSM cluster?', 'AWS operates the physical service and underlying infrastructure; the customer administers HSM users, keys, policies, and cryptographic use.', 'CloudHSM gives the customer more control and therefore more operational responsibility than KMS.', 'AWS replaces failed hardware, while the customer controls who can use a key inside the HSM.', 'Customer-controlled HSM users and keys.', ['Encryption', 'Shared responsibility'], ['AWS CloudHSM'], 2],
  ['recall', 'What is the primary purpose of AWS Security Hub?', 'It centralizes security posture checks and aggregates findings from AWS security services and partner products.', 'Security Hub gives security teams one prioritized view; it does not replace the services that detect vulnerabilities, threats, or sensitive data.', 'A CISO reviews GuardDuty, Inspector, and Macie findings from one dashboard.', 'Central security findings and standards checks = Security Hub.', ['Security monitoring', 'Governance'], ['AWS Security Hub'], 1],
  ['scenario', 'A company wants one dashboard for GuardDuty threats, Inspector vulnerabilities, and Macie sensitive-data findings. Which service fits?', 'AWS Security Hub.', 'Security Hub consumes and normalizes findings from those services so the team can prioritize remediation centrally.', 'The security team filters all high-severity findings across several AWS accounts.', 'Aggregate findings from multiple security services.', ['Security monitoring'], ['AWS Security Hub', 'Amazon GuardDuty', 'Amazon Inspector', 'Amazon Macie'], 1],
  ['recall', 'What does AWS Audit Manager automate?', 'It continuously collects evidence that helps an organization assess its own AWS usage against audit frameworks.', 'Audit Manager reduces manual evidence gathering for assessments. It does not provide AWS infrastructure compliance reports; those come from Artifact.', 'A compliance team collects configuration evidence for a PCI DSS assessment.', 'Automated evidence collection for your audit = Audit Manager.', ['Compliance', 'Audit'], ['AWS Audit Manager'], 2],
  ['comparison', 'How do AWS Artifact, AWS Config, and AWS Audit Manager differ?', 'Artifact provides AWS compliance documents; Config records and evaluates resource configurations; Audit Manager collects evidence for your organization’s assessments.', 'Remember the verbs: download AWS reports, track configuration, and collect customer audit evidence.', 'Download an AWS SOC report from Artifact, detect a public bucket with Config, and assemble assessment evidence with Audit Manager.', 'Artifact = AWS documents; Config = resource history; Audit Manager = assessment evidence.', ['Compliance', 'Governance'], ['AWS Artifact', 'AWS Config', 'AWS Audit Manager'], 2],
  ['recall', 'What is AWS Artifact used for?', 'It is the self-service place to download AWS compliance reports and manage selected agreements.', 'Artifact documents AWS compliance and the AWS side of shared responsibility; it does not scan customer workloads.', 'An auditor requests AWS SOC reports for the cloud infrastructure.', 'AWS compliance reports and agreements = Artifact.', ['Compliance'], ['AWS Artifact'], 1],
  ['scenario', 'A security team must apply the same AWS WAF policy across many accounts in AWS Organizations. Which service fits?', 'AWS Firewall Manager.', 'Firewall Manager centrally deploys and manages protection policies across accounts and resources.', 'A central team pushes one baseline web ACL policy to applications owned by twenty accounts.', 'Central multi-account firewall policy = Firewall Manager.', ['Security', 'Multi-account'], ['AWS Firewall Manager', 'AWS Organizations', 'AWS WAF'], 1],
  ['comparison', 'How do AWS Config and AWS AppConfig differ?', 'AWS Config tracks AWS resource configurations and compliance; AWS AppConfig safely deploys application settings and feature flags at runtime.', 'The similar names hide different scopes: infrastructure governance versus application behavior.', 'Config flags a public S3 bucket; AppConfig turns on a checkout feature without redeploying code.', 'Resource compliance = Config; runtime feature flag = AppConfig.', ['Configuration auditing', 'Application configuration'], ['AWS Config', 'AWS AppConfig'], 1],
  ['recall', 'What is the primary purpose of Amazon SNS?', 'To publish one message to multiple subscribed endpoints for alerts and fan-out.', 'SNS pushes notifications to subscribers such as SQS, Lambda, HTTP endpoints, SMS, or email.', 'A CloudWatch alarm publishes once and notifies email plus an operations Lambda function.', 'Topic and subscriptions = SNS.', ['Messaging'], ['Amazon SNS'], 1],
  ['recall', 'What is the primary purpose of Amazon SES?', 'To send and receive application email at scale, including transactional and formatted messages.', 'SES is the application-email service, unlike SNS fan-out notifications or WorkMail employee inboxes.', 'An application emails a password-reset link using a branded HTML template.', 'Transactional application email = SES.', ['Email', 'Business applications'], ['Amazon SES'], 1],
  ['comparison', 'How should you distinguish SNS, SES, Pinpoint, and WorkMail?', 'SNS is publish/subscribe notification fan-out; SES is application email; Pinpoint is customer-engagement campaigns; WorkMail is employee email and calendars.', 'Identify the audience and workflow: system subscribers, app-generated email, marketing segments, or employee mailboxes.', 'A billing alarm uses SNS, a receipt uses SES, a campaign uses Pinpoint, and an employee inbox uses WorkMail.', 'Fan-out, app email, campaign, employee mailbox.', ['Messaging', 'Email'], ['Amazon SNS', 'Amazon SES', 'Amazon Pinpoint', 'Amazon WorkMail'], 2],
  ['recall', 'What does Amazon Inspector scan for?', 'It continuously scans supported EC2 workloads, ECR container images, and Lambda functions for software vulnerabilities and unintended network exposure.', 'Inspector produces findings about vulnerable software and exposure. It is not the log-based threat-detection role of GuardDuty.', 'Inspector identifies a critical vulnerable package in an ECR image.', 'Vulnerability management = Inspector.', ['Security', 'Vulnerability management'], ['Amazon Inspector'], 1],
  ['comparison', 'How do Amazon Inspector and Amazon GuardDuty differ?', 'Inspector finds vulnerabilities in supported workloads and images; GuardDuty detects suspicious or malicious activity from security signals.', 'A weakness that could be exploited is a vulnerability. Evidence of an active threat is threat detection.', 'Inspector flags an outdated library; GuardDuty flags unusual credential use from a hostile IP.', 'Vulnerability = Inspector; threat behavior = GuardDuty.', ['Security monitoring'], ['Amazon Inspector', 'Amazon GuardDuty'], 1],
  ['comparison', 'How do Inspector, GuardDuty, Macie, Security Hub, and Trusted Advisor complement one another?', 'Inspector finds vulnerabilities, GuardDuty detects threats, Macie discovers sensitive S3 data, Security Hub aggregates security findings, and Trusted Advisor gives broader account best-practice recommendations.', 'The services operate at different layers, so they are complements rather than replacements.', 'Security Hub displays a GuardDuty threat, an Inspector CVE, and a Macie PII finding together.', 'Vulnerability, threat, sensitive data, aggregation, recommendations.', ['Security monitoring', 'Service selection'], ['Amazon Inspector', 'Amazon GuardDuty', 'Amazon Macie', 'AWS Security Hub', 'AWS Trusted Advisor'], 3],
  ['recall', 'What is Amazon Macie designed to discover?', 'Sensitive data, such as personally identifiable information, stored in Amazon S3.', 'Macie uses managed data discovery and produces findings; it is not a general EC2 vulnerability scanner.', 'Macie finds unprotected passport numbers in an S3 data lake.', 'Sensitive data in S3 = Macie.', ['Security', 'Data governance'], ['Amazon Macie', 'Amazon S3'], 1],
  ['comparison', 'How do AWS Elemental MediaConvert and MediaConnect differ?', 'MediaConvert transcodes file-based video; MediaConnect transports high-quality live video streams.', 'The source material corrected a mislabeled slide: watermarks and file conversion belong to MediaConvert, not MediaConnect.', 'Convert an uploaded movie to streaming formats with MediaConvert; carry a live sports feed with MediaConnect.', 'File conversion = MediaConvert; live transport = MediaConnect.', ['Media', 'Course supplementary'], ['AWS Elemental MediaConvert', 'AWS Elemental MediaConnect'], 2],
  ['recall', 'How should Amazon Elastic Transcoder be treated in new architectures?', 'As a legacy file-transcoding service; AWS Elemental MediaConvert is the modern choice for new file-based workflows.', 'The current CLF-C02 guide lists both services outside its primary exam scope, but this distinction corrects the course material.', 'A legacy pipeline may remain on Elastic Transcoder while a new workflow uses MediaConvert.', 'Legacy transcoding = Elastic Transcoder.', ['Media', 'Course supplementary'], ['Amazon Elastic Transcoder', 'AWS Elemental MediaConvert'], 2],
  ['recall', 'What is the basic purpose of Elastic Load Balancing?', 'To distribute incoming traffic across healthy targets so an application can scale and remain available.', 'A load balancer performs health checks and stops routing traffic to unhealthy registered targets.', 'Traffic is spread across EC2 instances in multiple Availability Zones.', 'Distribute traffic across healthy targets.', ['Load balancing', 'Availability'], ['Elastic Load Balancing'], 1],
  ['scenario', 'A web application must route /images and /api to different target groups. Which load balancer fits?', 'An Application Load Balancer (ALB).', 'ALB operates at Layer 7 and can route HTTP or HTTPS requests by path, host, headers, and other request attributes.', 'Requests for api.example.com go to an API target group while static paths go elsewhere.', 'HTTP request-aware routing = ALB.', ['Load balancing', 'Networking'], ['Elastic Load Balancing'], 1],
  ['scenario', 'A workload needs very high-performance TCP or UDP load balancing and static IP addresses per Availability Zone. Which option fits?', 'A Network Load Balancer (NLB).', 'NLB operates at Layer 4 and is designed for high-throughput, low-latency transport traffic.', 'A real-time game sends UDP traffic through an NLB.', 'TCP/UDP, Layer 4, static IP = NLB.', ['Load balancing', 'Networking'], ['Elastic Load Balancing'], 1],
  ['scenario', 'A company must scale a fleet of third-party firewalls that inspect VPC traffic. Which load balancer fits?', 'A Gateway Load Balancer (GWLB).', 'GWLB operates at Layer 3 and uses GENEVE to insert virtual network appliances transparently into traffic flows.', 'Traffic passes through a scalable fleet of inspection appliances before reaching workloads.', 'Virtual appliances and GENEVE = GWLB.', ['Load balancing', 'Security'], ['Elastic Load Balancing'], 2],
  ['comparison', 'How do ALB, NLB, GWLB, and Classic Load Balancer differ?', 'ALB handles Layer 7 HTTP routing, NLB handles high-performance Layer 4 traffic, GWLB handles Layer 3 virtual appliances, and Classic Load Balancer is the legacy generation.', 'Choose by traffic and target use case, not by which name sounds more powerful.', 'Use ALB for URL paths, NLB for low-latency TCP/UDP, and GWLB for firewall fleets.', 'HTTP = ALB; TCP/UDP = NLB; appliances = GWLB; legacy = CLB.', ['Load balancing', 'Service selection'], ['Elastic Load Balancing'], 2],
]

const toChatCard = (raw, index) => {
  const [type, prompt, answer, explanation, example, examCue, topics, services, difficulty] = raw
  const securityTopics = ['Encryption', 'Security', 'Shared responsibility', 'Security monitoring', 'Governance', 'Compliance', 'Audit', 'Multi-account', 'Configuration auditing', 'Vulnerability management', 'Data governance']
  return flashcardSchema.parse({
    id: `clf-c02-2026-09-18-${String(index + 1).padStart(3, '0')}`,
    certification: 'CLF-C02', studyDate: '2026-09-18',
    sourceChat: '2026-09-18 · Chat 14 — Security, Messaging & Load Balancing',
    collection: 'studied',
    domain: topics.some((topic) => securityTopics.includes(topic)) ? 'Security and Compliance' : 'Cloud Technology and Services',
    topics, services, type, prompt, answer, explanation, example, examCue,
    sourceRef: chatSource, difficulty, status: 'approved', version: 1,
  })
}

const extraServiceNames = [
  'Amazon EMR', 'Amazon OpenSearch Service', 'Amazon EventBridge', 'AWS Step Functions',
  'AWS Cost and Usage Reports', 'AWS CLI', 'AWS CodeBuild', 'AWS CodePipeline',
  'Amazon AppStream 2.0', 'Amazon WorkSpaces Secure Browser', 'AWS IoT Core',
  'Amazon Comprehend', 'Amazon Lex', 'Amazon Polly', 'Amazon Rekognition', 'Amazon SageMaker AI',
  'Amazon Textract', 'Amazon Transcribe', 'Amazon Translate', 'AWS Auto Scaling',
  'AWS Health Dashboard', 'AWS Service Catalog', 'Service Quotas', 'AWS Systems Manager',
  'AWS Application Discovery Service', 'AWS Application Migration Service', 'Migration Evaluator',
  'AWS Migration Hub', 'AWS SCT', 'Amazon Route 53', 'AWS Transit Gateway', 'AWS VPN',
  'AWS Site-to-Site VPN', 'AWS Client VPN', 'AWS Certificate Manager', 'Amazon Cognito',
  'AWS Directory Service', 'AWS RAM', 'AWS Secrets Manager', 'AWS Backup',
  'AWS Elastic Disaster Recovery', 'Amazon S3 Glacier', 'AWS Storage Gateway',
]

const catalog = JSON.parse(await fs.readFile(path.join(root, 'src', 'data', 'service-catalog.json'), 'utf8'))
const catalogByName = new Map(catalog.map((service) => [service.name, service]))
const extraCards = extraServiceNames.map((name, index) => {
  const service = catalogByName.get(name)
  if (!service) throw new Error(`Missing service catalog entry for ${name}`)
  const domain = service.officialCategory === 'Security, Identity, and Compliance'
    ? 'Security and Compliance'
    : ['Cloud Financial Management', 'Customer Enablement'].includes(service.officialCategory)
      ? 'Billing, Pricing, and Support'
      : 'Cloud Technology and Services'
  return flashcardSchema.parse({
    id: `clf-c02-2026-09-18-${String(101 + index).padStart(3, '0')}`,
    certification: 'CLF-C02', studyDate: '2026-09-18',
    sourceChat: 'Extra · Official CLF-C02 coverage audit', collection: 'extra', domain,
    topics: ['Extra official coverage', service.officialCategory, ...service.groups], services: [service.name],
    type: 'recall',
    prompt: `What is the primary purpose of ${service.name}?`,
    answer: service.purpose,
    explanation: `For CLF-C02, recognize this service when the requirement mentions ${service.examCue}. Deep implementation details are not required.`,
    example: `A question asks for ${service.examCue}; ${service.name} is the service to evaluate.`,
    examCue: `Look for: ${service.examCue}.`,
    sourceRef: gapSource, difficulty: 2, status: 'approved', version: 1,
  })
})

const approvedDir = path.join(root, 'flashcards', 'approved')
await fs.writeFile(path.join(approvedDir, '2026-09-18-chat-14-security-messaging-elb.json'), `${JSON.stringify(chatCards.map(toChatCard), null, 2)}\n`, 'utf8')
await fs.writeFile(path.join(approvedDir, '2026-09-18-extra-official-coverage.json'), `${JSON.stringify(extraCards, null, 2)}\n`, 'utf8')
console.log(`Generated ${chatCards.length} Chat 14 cards and ${extraCards.length} Extra coverage cards.`)
