# Case 1: The Website That Vanished at Midnight

## Case Design Document

### Overview
A bakery website goes down during peak holiday sales due to a deleted security group rule. Players investigate cloud incident evidence to find the root cause.

### Learning Objectives
- Understand ALB health checks and how they work
- Recognize 503 vs 504 HTTP errors and what they mean
- Learn that security group rules can silently break connectivity
- Discover the importance of CloudTrail for audit logging
- Identify configuration issues vs application failures
- Security awareness: SSH exposure to 0.0.0.0/0

### Architecture
```
Internet Users
    ↓
   ALB (Application Load Balancer)
    ↓
  EC2 Instance 1  EC2 Instance 2
    ↓              ↓
   RDS Database
    (MySQL)
```

### Timeline
- **22:00** - Version 2.1.0 deployed successfully to both instances
- **23:30** - Scheduled backup starts (causes CPU spike to 85%)
- **23:45** - Backup completes (CPU returns to 20%)
- **23:58** - Intern-luke runs: `aws ec2 revoke-security-group-ingress` removing port 80 rule
- **23:59** - ALB health check fails for both instances (no response on port 80)
- **23:59** - ALB marks both targets as unhealthy
- **00:00** - ALB returns 503 to all incoming requests (no healthy targets)
- **Present** - Still broken, waiting for investigation

### Root Cause
The security group rule allowing ALB → EC2 instances traffic on port 80 was deleted. This broke the health check mechanism, causing the ALB to consider all targets unhealthy.

### Evidence Progression

#### Evidence 1: What Users See
**Purpose**: Establish the symptom - a 503 error
**Key Detail**: 503 = no healthy backends, not a timeout (504)
**Hint**: Suggests ALB has no healthy instances to route to

#### Evidence 2: CloudWatch Metrics
**Purpose**: Show health check failures at exact time
**Key Detail**: Both instances failed at 23:59, CPU was fine at that time
**Red Herring**: CPU spike at 23:30 might seem related but timing is wrong
**Hint**: What could cause both instances to stop responding simultaneously?

#### Evidence 3: Target Group Details
**Purpose**: Confirm instances are unhealthy, health checks use port 80
**Key Detail**: "Request timed out" = instances not responding on port 80
**Hint**: Why would both stop listening on port 80 at the same moment?

#### Evidence 4: Recent Deployments
**Purpose**: Rule out code deployment as cause
**Key Detail**: Deployment succeeded, app ran fine for 2 hours
**Red Herring**: Might seem suspicious but timing doesn't match
**Hint**: Look for what changed at 23:59, not 22:00

#### Evidence 5: CloudTrail Audit Log
**Purpose**: Reveal the actual cause
**Key Detail**: Security group rule revoked at 23:58:42
**The Fix**: Re-add the TCP 80 inbound rule from sg-alb

### Correct Accusations

**Root Cause**: `cause-sg-rule`
- Deleted security group rule removed ALB's access to instances on port 80

**Key Evidence**: `evidence-cloudtrail`
- CloudTrail log showing security group rule was revoked
- This is the smoking gun that proves what happened

**The Fix**: `fix-sg`
- Re-add the TCP 80 inbound rule from sg-alb to sg-web-instances
- Restores ALB health checks, instances become healthy again
- ALB returns normal responses instead of 503

### Incorrect Accusations (Red Herrings)

**CPU Spike**: The 85% CPU at 23:30 was a scheduled backup
- Spike lasted 15 minutes and resolved
- Instances continued to respond normally until 23:59
- Doesn't explain the sudden failure 29 minutes later

**Code Deployment**: Version 2.1.0 deployed at 22:00
- Deployment was successful
- App ran fine for 2 hours
- Bad deployments fail quickly, not hours later
- No errors in deployment logs

**DDoS Attack**: "Request timed out" could suggest attack
- But attack logs would show in VPC Flow Logs
- Both instances would crash or use all CPU
- Instances are running fine, just unreachable on port 80

### Hidden Bonus: Security Risk
SSH (port 22) is open to 0.0.0.0/0 (entire internet)
- Allows brute-force login attempts
- Should restrict to specific IPs or use bastion host
- Found by examining the current security group rules

### Scoring

**Base Score**: 100 points

**Deductions**:
- Each hint used: -10 points (max 3 hints = -30)
- Incorrect answers: No penalty, but doesn't get bonus

**Bonuses**:
- All three accusations correct: +20 points
- Hidden security risk spotted: +20 points (shown in results if found)

**Maximum Score**: 140 points (100 + 20 + 20)

### Educational Content

#### Key Concepts Taught

1. **ALB Health Checks**
   - ALBs use health checks to verify targets are healthy
   - Failed checks = instance marked unhealthy
   - No healthy instances = ALB returns 503

2. **HTTP Error Codes**
   - 503 Service Unavailable = no healthy backends
   - 504 Gateway Timeout = target took too long to respond
   - These have very different root causes

3. **Security Groups**
   - Act as firewalls at the instance level
   - Rules can break connectivity silently (no error, just no response)
   - Source can be an IP or another security group

4. **CloudTrail**
   - Records ALL AWS API calls (including who, what, when)
   - Essential for debugging "who changed what"
   - Saved in S3, can be queried and analyzed

5. **Debugging Methodology**
   - Distinguish symptoms from root causes
   - Check the timeline carefully
   - Use audit logs to find configuration changes
   - Test hypotheses against the evidence

### Case Variations (for future)
- Same incident but SSH port isn't exposed
- SSH is exposed but with proper IAM restrictions
- Multiple root causes in sequence (broken health check + database issue)
- Incident caused by incorrect IAM policy instead of security group

### Real-World Relevance
This is a real incident pattern that happens in production:
- Developers accidentally modify rules while troubleshooting
- Quick fixes can cause cascading failures
- Security group changes often lack proper review/approval
- Proper change control and CloudTrail monitoring prevent this
