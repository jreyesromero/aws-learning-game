# Case 2: The Ghost Address

## Case Design Document

### Overview
Ana, director of BrightPath Academy, stops her server Friday evening to save costs and starts it Monday morning for online classes. When students can't reach the website, Ana is baffled—the server is clearly running. The detective must realize that EC2 public IPs change on stop/start, not on reboot.

### Learning Objectives
- Understand that EC2 public IPs change on stop/start (but not on reboot)
- Learn about Elastic IPs as fixed, permanent addresses
- Understand how DNS A records map domains to IPs
- Recognize that a healthy instance ≠ reachable instance
- Best practice: use IAM users instead of root account
- AWS cost optimization vs. infrastructure reliability trade-off

### Architecture
```
Students (Internet)
    ↓
Route 53 (DNS)
    ↓
EC2 Instance (Web Server)
```

### Timeline
- **Friday 18:30 UTC** - Ana adds SSH security group rule for office access
- **Friday 19:02 UTC** - Ana stops the instance (via root account) to save costs over weekend
  - Old public IP: 3.120.45.67 is released
- **Monday 07:45 UTC** - Ana starts the instance for Monday's classes
  - New public IP: 18.195.88.21 is assigned
  - DNS record still points to 3.120.45.67
- **Monday 08:00 UTC** - Students try to access learn.brightpath.example
  - DNS resolves to 3.120.45.67 (old IP, unreachable)
  - Connection times out
- **Present** - Still broken; all students locked out

### Root Cause
The instance's public IP changed from 3.120.45.67 to 18.195.88.21 due to stop/start. The Route 53 A record was never updated, so DNS still points to the old IP, which is no longer assigned to the instance.

### Evidence Progression

#### Evidence 1: Student Report
**Purpose**: Establish the symptom (timeout error)
**Key Detail**: Timeout ≠ DNS error ≠ certificate error
**Hint**: Browser can't reach the IP that DNS points to

#### Evidence 2: DNS Resolution Check (dig)
**Purpose**: Show what DNS currently returns
**Key Detail**: Points to 3.120.45.67 with TTL 300
**Hint**: Is that still the instance's current IP?

#### Evidence 3: Route 53 A Record
**Purpose**: Confirm DNS configuration from AWS side
**Key Detail**: Same IP in Route 53: 3.120.45.67
**Hint**: Compare this with the instance's actual IP

#### Evidence 4: EC2 Instance Details
**Purpose**: Reveal the IP mismatch!
**Key Detail**: Instance currently has 18.195.88.21, no Elastic IP
**Warning message**: "Public IP changed from 3.120.45.67 to 18.195.88.21"
**Hint**: The IPs don't match! DNS points to 3.120.45.67 but the instance is at 18.195.88.21

#### Evidence 5: Direct Connection Test (curl)
**Purpose**: Prove the theory
**Key Detail**: Connecting directly to 18.195.88.21 → 200 OK (works!)
             Connecting to 3.120.45.67 → timeout (doesn't work)
**Hint**: This proves the server is fine, but the old IP is unreachable

#### Evidence 6: CloudTrail Audit Log
**Purpose**: Show what happened to the IP
**Key Detail**: StopInstances (Friday 19:02), StartInstances (Monday 07:45)
             Both by Root user
**Warning**: Start/stop changes public IP; reboot doesn't
**Hint**: There's a difference between stop/start and reboot

#### Evidence 7: Security Groups
**Purpose**: Rule out security group blocking
**Key Detail**: Ports 80 and 443 are open to 0.0.0.0/0
**Hint**: Security group isn't the problem here

#### Evidence 8: SSL Certificate Warning
**Purpose**: Red herring email
**Key Detail**: Expires in 25 days (not yet expired)
**Status**: NOT EXPIRED YET
**Hint**: The error is timeout, not certificate error

### Red Herrings

**Security Group** (from Case 1 experience)
- Players will suspect port blocking after the last case
- Evidence shows ports 80/443 are open from anywhere
- The Friday evening SSH rule addition is irrelevant

**SSL Certificate**
- There's an email warning the certificate expires in 25 days
- But it hasn't expired yet
- Timeout errors mean the client never reaches the server to check the certificate

**DNS TTL**
- TTL is 300 seconds (5 minutes)
- Some players might think it's "cached" and needs to expire
- But 5 minutes is reasonable, and even if cached, direct IP would work

**Instance Health**
- Status checks show 2/2 passed
- CPU is normal
- Direct connection to the new IP works
- The instance is actually fine; it's the DNS routing that's wrong

### Correct Answers

**Root Cause**: `cause-ip-change`
- The instance's public IP changed after stop/start, and DNS still points to the old IP

**Key Evidence**: `evidence-ip-mismatch`
- Shows mismatch: DNS points to 3.120.45.67, but instance has 18.195.88.21

**The Fix**: `fix-elastic-ip`
- Allocate an Elastic IP, associate it with the instance, update Route 53

### Incorrect Options (Red Herrings)

**cause-sg-blocking** - Security group is open; not the issue
**cause-ssl-expired** - Certificate hasn't expired; error is timeout not cert error
**cause-instance-crashed** - Status checks pass; instance is healthy
**cause-ttl-issue** - TTL is 5 minutes (reasonable); direct IP test proves DNS isn't the blocker

### Hidden Bonus: Root Account Usage
CloudTrail shows Ana (or more precisely "Root" user) performed StopInstances and StartInstances. Best practice: protect root with MFA and use IAM users for daily tasks.

### Scoring

**Base Score**: 100 points

**Deductions**:
- Each hint: -10 points (max 3 hints = -30)

**Bonuses**:
- All three accusations correct: +20 points
- Hidden issue (root account): +20 points

**Max Score**: 140 points

### Educational Content

#### Key Concepts Taught

1. **EC2 Public IP Management**
   - Regular public IPs: change on stop/start, released back to AWS
   - Reboot: keeps the same public IP
   - Elastic IP: fixed address you own until you release it

2. **DNS and IP Mapping**
   - DNS A records point domains to IPs
   - If IP changes, DNS must change too
   - DNS TTL affects caching, but does not change the core problem

3. **Instance Lifecycle**
   - Stop ≠ Reboot: different implications for IPs and state
   - Start: instance gets a new public IP if using regular IPs
   - Reboot: IP stays the same

4. **Infrastructure Resilience**
   - One EC2 instance with a regular IP is fragile
   - Elastic IP provides stability for single instances
   - Load balancers with Route 53 aliases are even better (no need to manage IPs)

5. **Cost vs. Reliability**
   - Stopping instances to save money is a valid strategy
   - But it requires planning: use Elastic IPs if you'll stop/start
   - Or accept re-configuring DNS when you restart

6. **IAM Best Practices**
   - Never use root account for daily tasks
   - Use IAM users with specific permissions
   - Protect root with MFA

### Case Variations (Future)

- Same incident but with Elastic IP already in place (would require different root cause)
- Multi-AZ setup with load balancer (demonstrates scalability path)
- Using Route 53 health checks to detect the problem automatically
- Cost optimization with scheduled start/stop using Lambda

### Real-World Relevance

This is a **very common real-world incident**:
- Startups often stop instances on weekends to save money
- Developers forget to use Elastic IPs
- Infrastructure wasn't designed for stop/start cycles
- The fix is simple once understood, but mysterious before diagnosis

The case teaches the distinction between:
- Instance health (is it running?) ← YES
- Reachability (can we reach it?) ← NO
- Configuration mismatch (DNS wrong) ← YES
