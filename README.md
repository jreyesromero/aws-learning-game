# Cloud Detective

An interactive web game for learning AWS cloud architecture and troubleshooting. Investigate realistic cloud incidents by analyzing logs, metrics, and audit trails to find the root cause. Progress through a campaign with recurring characters and an evolving story.

**Play it here:** [cloud-detective on GitHub Pages]

## Features

- **Campaign Mode** – 11 cases across 5 chapters with recurring characters and story progression.
- **Player Ranking** – Start as Junior Detective and advance to Legend as you solve cases (🔵 → 🟡 → 🔴 → ⭐ → 👑).
- **Story Scenes** – Character dialogue before and after each case (skippable).
- **No build step** – Plain HTML, CSS, and vanilla JavaScript. Just open `index.html`.
- **Responsive design** – Works on desktop, tablet, and mobile.
- **Light/dark mode** – Toggleable theme with persistent preference.
- **AWS Console Style** – Interact with services like Route 53, CloudWatch, EC2, CloudTrail, and more.
- **Hints System** – Ask Rosa for hints (costs 10 points each, max 3 per case).
- **Scoring** – Base 100 points, bonuses for correct answers and spotting hidden issues.
- **Progress Tracking** – Campaign progress and scores saved in localStorage.

## The Campaign

**Cloud Detective Agency** – A 5-chapter story where you investigate cloud incidents for multiple clients.

### Chapters & Cases

#### Chapter 1: First Day
- **Case 1**: The Website That Vanished at Midnight
  - Client: Martha (The Digital Bakery)
  - Concept: Security groups, ALB health checks, CloudTrail
  - Problem: Intern Luke deleted a critical security group rule

#### Chapter 2: Growing Pains
- **Case 2**: The Ghost Address ⭐ (NEW)
  - Client: Ana (BrightPath Academy)
  - Concept: Elastic IPs, public IPs, DNS, Route 53
  - Problem: Instance's public IP changed after stop/start, DNS not updated
- **Case 3**: The Missing Photos
  - Client: Martha (The Digital Bakery)
  - Concept: S3 bucket policies, access control
  - Problem: Luke "improved security" but broke the photo gallery

#### Chapter 3: Hidden Problems
- **Case 4**: The Disk Nobody Watched
  - Client: Ana (BrightPath Academy)
  - Concept: EBS, disk space, CloudWatch monitoring
  - Problem: Full disk undetected, no monitoring in place
- **Case 5**: The Impatient Function
  - Client: Dev (PixelForge)
  - Concept: Lambda timeouts, external API calls
  - Problem: Function times out at peak hours (slow external API)

#### Chapter 4: Scaling Up
- **Case 6**: Access Denied
  - Client: Dev (PixelForge)
  - Concept: IAM policies, regions, ARNs
  - Problem: Permissions work in one region but not others
- **Case 7**: The Isolated Server
  - Client: Ana (BrightPath Academy)
  - Concept: VPC networking, NAT Gateway, routing
  - Problem: Missing route prevents external connectivity
- **Case 8**: The Impossible Bill
  - Client: Dev (PixelForge)
  - Concept: Lambda cost optimization, recursive loops
  - Problem: Accidental recursive loop drains credits

#### Chapter 5: The Big Leagues
- **Case 9**: Too Many at the Door
  - Client: Martha (The Digital Bakery)
  - Concept: RDS connections, connection pooling, RDS Proxy
  - Problem: Connection pool exhaustion at peak load
- **Case 10**: The Zone Blackout
  - Client: Martha (The Digital Bakery)
  - Concept: Multi-AZ, availability zones, disaster recovery
  - Problem: No Multi-AZ setup; datacenter outage = total failure
- **Case 11**: Shadow Miners (Finale)
  - Client: Martha (The Digital Bakery), featuring Luke's redemption
  - Concept: Leaked credentials, security compromise, forensics
  - Problem: Access keys in GitHub repo; unknown instances in hidden region

## Characters

The game features recurring characters with evolving arcs:

- **Rosa** 👩‍💼 – Your mentor at Cloud Detective Agency. She provides hints and story context.
- **Martha** 👩‍🍳 – Owner of The Digital Bakery. Her business grows throughout the game; incidents get more complex.
- **Luke** 👨‍💻 – Well-meaning intern at The Digital Bakery. Causes early incidents, learns from them, helps solve the finale.
- **Ana** 👩‍🏫 – Director of BrightPath Academy. Runs an online school with tight budget; faces monitoring and scaling challenges.
- **Dev** 🚀 – Founder of PixelForge. Fast-growing startup that prioritizes speed; incidents stem from rushing.

## How to Play

1. **Open** `index.html` in a web browser.
2. **View Campaign Map** – See all chapters and cases. Cases unlock as you complete previous ones.
3. **Read Briefing** – Meet the client and see the system architecture.
4. **Investigate** – Query AWS services (Route 53, CloudWatch, EC2, CloudTrail, etc.) to gather evidence.
5. **Ask Rosa** – Use hints if stuck (3 hints available per case, -10 points each).
6. **Make Accusation** – Choose the root cause, key evidence, and the fix.
7. **Review Results** – See your score, the explanation, and any hidden bonuses you found.
8. **Progress** – Complete cases to unlock new chapters and advance your rank.

## Scoring

- **Base**: 100 points per case
- **Per hint**: -10 points (max 3 hints = -30)
- **Correct solution**: +20 bonus points
- **Hidden bonus**: +20 points (each case has a security or architectural insight)

**Max score per case**: 140 points

## Player Ranks

Advance your rank as you solve more cases:
- 🔵 **Junior Detective** (0 cases)
- 🟡 **Investigator** (3+ cases)
- 🔴 **Senior Investigator** (6+ cases)
- ⭐ **Master Detective** (9+ cases)
- 👑 **Legend** (11 cases – campaign complete!)

## Project Structure

```
cloud-detective/
├── index.html              # Main game interface
├── css/
│   └── styles.css          # Styling with light/dark mode & responsive layout
├── js/
│   └── game.js             # Game logic & campaign system
├── data/
│   ├── characters.json     # Character definitions & bios
│   └── story.json          # Campaign structure & story events
├── cases/
│   ├── case-01.json        # The Website That Vanished at Midnight
│   ├── case-02.json        # The Ghost Address (NEW)
│   ├── case-03.json        # The Missing Photos (placeholder)
│   ├── ...
│   └── case-11.json        # Shadow Miners (placeholder)
├── docs/
│   ├── case-01.md          # Case 1 design documentation
│   ├── case-02.md          # Case 2 design documentation (NEW)
│   └── ...
└── README.md               # This file
```

## Case Status

| Chapter | Case | Title | Status |
|---------|------|-------|--------|
| 1 | 01 | The Website That Vanished at Midnight | ✅ Complete |
| 2 | 02 | The Ghost Address | ✅ Complete |
| 2 | 03 | The Missing Photos | 🔄 Placeholder |
| 3 | 04 | The Disk Nobody Watched | 🔄 Placeholder |
| 3 | 05 | The Impatient Function | 🔄 Placeholder |
| 4 | 06 | Access Denied | 🔄 Placeholder |
| 4 | 07 | The Isolated Server | 🔄 Placeholder |
| 4 | 08 | The Impossible Bill | 🔄 Placeholder |
| 5 | 09 | Too Many at the Door | 🔄 Placeholder |
| 5 | 10 | The Zone Blackout | 🔄 Placeholder |
| 5 | 11 | Shadow Miners | 🔄 Placeholder |

## Adding a New Case

Cases are defined in JSON files in the `/cases` directory. To add a new case:

1. **Create a new JSON file** (e.g., `cases/case-03.json`):

```json
{
  "id": "case-03",
  "title": "Case Title",
  "description": "Short description",
  "chapter": 2,
  "client": "martha",
  "characters": ["martha", "luke"],
  "keywords": ["S3", "Bucket Policy"],
  "intro": "Rosa: Story intro dialogue",
  "outro": "Rosa: Story outro dialogue",
  "briefing": {
    "clientMessage": "The client's problem statement",
    "architecture": "ASCII art architecture diagram"
  },
  "evidence": [
    {
      "service": "S3",
      "label": "Evidence Name",
      "text": "Evidence content with $ aws commands",
      "hint": "Rosa: Hint in Rosa's voice"
    }
  ],
  "accusations": {
    "rootCauses": [
      {"id": "cause-1", "text": "Option 1"},
      {"id": "cause-2", "text": "Option 2"}
    ],
    "keyEvidence": [
      {"id": "ev-1", "text": "Evidence option 1"},
      {"id": "ev-2", "text": "Evidence option 2"}
    ],
    "fixes": [
      {"id": "fix-1", "text": "Fix option 1"},
      {"id": "fix-2", "text": "Fix option 2"}
    ]
  },
  "solution": {
    "rootCause": "cause-1",
    "keyEvidence": "ev-1",
    "fix": "fix-1"
  },
  "explanation": "Explanation of what happened and key concepts learned",
  "hiddenBonus": "A security or architectural insight bonus (+20 pts)"
}
```

2. **Create a design document** (e.g., `docs/case-03.md`):
   - Learning objectives
   - Architecture diagram
   - Timeline of events
   - Root cause
   - Evidence progression and hints
   - Red herrings
   - Educational content
   - Real-world relevance

3. **Update `data/story.json`**:
   - Add case ID to the appropriate chapter
   - Add case-XX_intro and case-XX_outro dialogue

4. **No code changes needed** – The game automatically loads all cases.

## Case Design Guidelines

- **Make it realistic** – Base cases on actual AWS incident patterns.
- **Progressive revelation** – Early evidence is vague, later evidence points to the answer.
- **Include red herrings** – Add 3-4 plausible but incorrect explanations.
- **Use AWS CLI** – Format evidence with `$ aws service command` output.
- **Hidden bonus** – Include a security best practice or architecture insight (+20 pts).
- **Hints in character voice** – All hints should sound like Rosa speaking to the player.
- **Educational hook** – Each case teaches one core AWS concept.

## Technical Details

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (all modern versions)
- Requires JavaScript enabled
- Uses `localStorage` for progress and scores

### Theme System
- Light mode (default) / Dark mode toggle
- CSS custom properties for theming
- Preference saved to `localStorage`

### Data Loading
- Characters loaded from `data/characters.json`
- Campaign structure from `data/story.json`
- Cases loaded from `cases/*.json`
- All loaded via `fetch()` on game start

### Progress Persistence
- Campaign progress: `localStorage['campaign-progress']`
- Case scores: `localStorage['case-scores']`
- Player theme: `localStorage['theme']`
- Reset available in-game

## Deployment to GitHub Pages

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cloud Detective with full campaign"
   ```

2. **Create GitHub repository**:
   ```bash
   gh repo create cloud-detective --public --source=. --remote=origin --push
   ```

3. **Enable GitHub Pages**:
   - Go to repository settings → Pages
   - Set source to `main` branch
   - URL: `https://YOUR-USERNAME.github.io/cloud-detective/`

## Development Notes

- **No frameworks** – Vanilla JavaScript for simplicity and fast loading.
- **No build step** – Open `index.html` directly in browser.
- **CSS custom properties** – For theming; no preprocessor needed.
- **Responsive** – CSS Grid and Flexbox for all screen sizes.
- **Accessible** – Semantic HTML with ARIA labels.

## Learning Path

This game teaches AWS concepts in progression:

1. **Basics** (Ch. 1): Security groups, load balancers, audit trails
2. **Networking** (Ch. 2): DNS, public IPs, Elastic IPs
3. **Monitoring** (Ch. 3): CloudWatch, metrics, visibility
4. **Identity & Access** (Ch. 4): IAM, permissions, least privilege
5. **Scale & Reliability** (Ch. 5): RDS, Multi-AZ, security compliance

## License

This project is open source and available for educational use.

## Contributing

To contribute new cases or improvements:
1. Fork the repository
2. Create a new branch: `git checkout -b case/my-case`
3. Follow the case design guidelines in `docs/`
4. Test locally with `python3 -m http.server 8000`
5. Submit a pull request

## Feedback

Found a bug or have a case idea? Open an issue in the GitHub repository.
