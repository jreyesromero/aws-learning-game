class CloudDetectiveGame {
    constructor() {
        this.cases = [];
        this.characters = {};
        this.story = {};
        this.currentCase = null;
        this.currentCaseData = null;
        this.score = 100;
        this.hintsUsed = 0;
        this.playerAnswers = {};
        this.scores = this.loadScores();
        this.progress = this.loadProgress();
        this.initTheme();
        this.setupEventListeners();
        this.loadGameData();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);
    }

    updateThemeButton(theme) {
        const button = document.getElementById('themeToggle');
        button.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('backFromBriefing').addEventListener('click', () => {
            this.renderCampaignScreen();
            this.showScreen('campaign');
        });
        document.getElementById('startInvestigation').addEventListener('click', () => this.showScreen('evidence'));
        document.getElementById('backFromEvidence').addEventListener('click', () => this.showScreen('briefing'));
        document.getElementById('backFromAccusation').addEventListener('click', () => this.showScreen('evidence'));
        document.getElementById('playAgain').addEventListener('click', () => this.resetCase());
        document.getElementById('backToStart').addEventListener('click', () => {
            this.renderCampaignScreen();
            this.showScreen('campaign');
        });
        document.getElementById('clearLog').addEventListener('click', () => this.clearConsoleLog());
        document.getElementById('askHelp').addEventListener('click', () => this.askForHelp());
        document.getElementById('makeAccusation').addEventListener('click', () => this.showScreen('accusation'));
        document.getElementById('submitAccusation').addEventListener('click', () => this.submitAccusation());
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeButton(newTheme);
    }

    async loadGameData() {
        try {
            const [charResponse, storyResponse] = await Promise.all([
                fetch('data/characters.json'),
                fetch('data/story.json')
            ]);

            this.characters = await charResponse.json();
            this.story = await storyResponse.json();

            // Load all cases
            const caseIds = this.story.chapters.flatMap(ch => ch.cases);
            const casePromises = caseIds.map(id =>
                fetch(`cases/${id}.json`).then(r => r.json())
            );
            const caseDataArray = await Promise.all(casePromises);
            this.cases = caseDataArray;

            this.updateHeader();
            this.renderCampaignScreen();
        } catch (error) {
            console.error('Error loading game data:', error);
            document.body.innerHTML = '<p>Error loading game data. Please check your files.</p>';
        }
    }

    updateHeader() {
        const rank = this.getPlayerRank();
        const headerRank = document.getElementById('playerRank');
        if (headerRank) {
            headerRank.textContent = `${rank.title} ${rank.emoji}`;
        }
    }

    getPlayerRank() {
        const completedCount = Object.keys(this.progress).filter(id => this.progress[id]).length;

        if (completedCount === 0) return { title: 'Junior Detective', emoji: '🔵', level: 0 };
        if (completedCount < 3) return { title: 'Junior Detective', emoji: '🔵', level: 0 };
        if (completedCount < 6) return { title: 'Investigator', emoji: '🟡', level: 1 };
        if (completedCount < 9) return { title: 'Senior Investigator', emoji: '🔴', level: 2 };
        if (completedCount < 11) return { title: 'Master Detective', emoji: '⭐', level: 3 };
        return { title: 'Legend', emoji: '👑', level: 4 };
    }

    renderCampaignScreen() {
        const campaignScreen = document.getElementById('campaignScreen');
        campaignScreen.innerHTML = '';

        const rank = this.getPlayerRank();
        const header = document.createElement('div');
        header.className = 'campaign-header';
        header.innerHTML = `
            <h2>Campaign Map</h2>
            <p>${rank.emoji} ${rank.title}</p>
            <p class="campaign-progress">${Object.keys(this.progress).filter(id => this.progress[id]).length} / 11 cases solved</p>
        `;
        campaignScreen.appendChild(header);

        this.story.chapters.forEach(chapter => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter-section';

            const chapterTitle = document.createElement('h3');
            chapterTitle.textContent = `📌 Chapter ${chapter.number}: ${chapter.title}`;
            chapterDiv.appendChild(chapterTitle);

            const caseGrid = document.createElement('div');
            caseGrid.className = 'case-grid';

            chapter.cases.forEach(caseId => {
                const caseData = this.cases.find(c => c.id === caseId);
                if (!caseData) return;

                const isCompleted = this.progress[caseId];
                const isUnlocked = this.isCaseUnlocked(caseId);

                const caseCard = document.createElement('div');
                caseCard.className = `case-card-campaign ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;

                let statusIcon = '🔒';
                if (isCompleted) statusIcon = '✅';
                else if (isUnlocked) statusIcon = '🔓';

                caseCard.innerHTML = `
                    <div class="case-card-header">${statusIcon} ${caseData.title}</div>
                    <p>${caseData.description}</p>
                    ${this.scores[caseId] ? `<div class="case-score">Best: ${this.scores[caseId]} pts</div>` : ''}
                `;

                if (isUnlocked) {
                    // Check if case is not a placeholder
                    if (!caseData.briefing.clientMessage.includes('Coming soon')) {
                        caseCard.style.cursor = 'pointer';
                        caseCard.addEventListener('click', () => this.startCaseWithStory(caseId));
                    } else {
                        caseCard.style.opacity = '0.7';
                    }
                }

                caseGrid.appendChild(caseCard);
            });

            chapterDiv.appendChild(caseGrid);
            campaignScreen.appendChild(chapterDiv);
        });

        const resetDiv = document.createElement('div');
        resetDiv.className = 'campaign-footer';
        resetDiv.innerHTML = '<button id="resetProgress" class="btn-secondary">Reset Progress</button>';
        campaignScreen.appendChild(resetDiv);

        document.getElementById('resetProgress').addEventListener('click', () => {
            if (confirm('Are you sure? This will reset all progress.')) {
                localStorage.removeItem('campaign-progress');
                localStorage.removeItem('case-scores');
                location.reload();
            }
        });

        this.showScreen('campaign');
    }

    isCaseUnlocked(caseId) {
        // First case is always unlocked
        if (caseId === 'case-01') return true;

        // Find which case comes before this one
        const allCases = this.story.chapters.flatMap(ch => ch.cases);
        const caseIndex = allCases.indexOf(caseId);

        if (caseIndex <= 0) return true;

        const previousCaseId = allCases[caseIndex - 1];
        return this.progress[previousCaseId] === true;
    }

    startCaseWithStory(caseId) {
        const caseData = this.cases.find(c => c.id === caseId);
        if (!caseData || !this.isCaseUnlocked(caseId)) return;

        this.currentCase = caseId;
        this.currentCaseData = caseData;
        this.score = 100;
        this.hintsUsed = 0;
        this.playerAnswers = {};

        if (caseData.intro) {
            this.showStoryScene(caseData.intro, () => {
                this.renderBriefing();
                this.showScreen('briefing');
            });
        } else {
            this.renderBriefing();
            this.showScreen('briefing');
        }
    }

    showStoryScene(dialogue, onSkip) {
        const storyScreen = document.getElementById('storyScreen');
        storyScreen.innerHTML = '';

        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'story-scene';

        // Parse "Character: dialogue" format
        const parts = dialogue.split(':');
        const characterName = parts[0].trim();
        const dialogueText = parts.slice(1).join(':').trim();
        const character = Object.values(this.characters).find(c => c.name === characterName);

        if (character) {
            sceneDiv.innerHTML = `
                <div class="story-character" style="--char-color: ${character.color}">
                    <div class="story-avatar">${character.avatar}</div>
                    <div class="story-bubble">
                        <div class="story-name">${character.name}</div>
                        <div class="story-dialogue">${dialogueText}</div>
                    </div>
                </div>
                <button id="skipStory" class="btn-primary">Continue →</button>
            `;
        } else {
            sceneDiv.innerHTML = `
                <div class="story-bubble">
                    <div class="story-dialogue">${dialogue}</div>
                </div>
                <button id="skipStory" class="btn-primary">Continue →</button>
            `;
        }

        storyScreen.appendChild(sceneDiv);
        this.showScreen('story');
        document.getElementById('skipStory').addEventListener('click', onSkip);
    }

    renderBriefing() {
        const clientName = this.currentCaseData.client;
        const client = Object.values(this.characters).find(c =>
            Object.keys(this.characters).find(key =>
                this.characters[key].name.toLowerCase() === clientName.toLowerCase() || key === clientName
            ) === Object.keys(this.characters).find(key => this.characters[key] === c)
        );

        document.getElementById('briefingTitle').textContent = this.currentCaseData.title;
        document.getElementById('briefingMessage').textContent = this.currentCaseData.briefing.clientMessage;
        document.getElementById('architectureDiagram').textContent = this.currentCaseData.briefing.architecture;
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));

        switch (screenName) {
            case 'campaign':
                document.getElementById('campaignScreen').classList.remove('hidden');
                break;
            case 'story':
                document.getElementById('storyScreen').classList.remove('hidden');
                break;
            case 'briefing':
                document.getElementById('briefingScreen').classList.remove('hidden');
                break;
            case 'evidence':
                this.renderEvidenceScreen();
                document.getElementById('evidenceScreen').classList.remove('hidden');
                break;
            case 'accusation':
                this.renderAccusationScreen();
                document.getElementById('accusationScreen').classList.remove('hidden');
                break;
            case 'results':
                this.renderResultsScreen();
                document.getElementById('resultsScreen').classList.remove('hidden');
                break;
        }
    }

    renderEvidenceScreen() {
        this.updateScoreDisplay();
        this.renderServiceMenu();
        this.clearConsoleLog();
    }

    updateScoreDisplay() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('hintsUsed').textContent = this.hintsUsed;
    }

    renderServiceMenu() {
        const container = document.getElementById('serviceButtons');
        container.innerHTML = '';

        const uniqueServices = [...new Set(this.currentCaseData.evidence.map(e => e.service))];

        uniqueServices.forEach(service => {
            const btn = document.createElement('button');
            btn.className = 'service-btn';
            btn.textContent = service;
            btn.addEventListener('click', () => this.queryService(service, btn));
            container.appendChild(btn);
        });
    }

    queryService(service, button) {
        button.classList.add('clicked');
        const log = document.getElementById('evidenceLog');

        const serviceEvidences = this.currentCaseData.evidence.filter(e => e.service === service);

        serviceEvidences.forEach(evidence => {
            const container = document.createElement('div');
            container.className = 'console-output';

            let html = '';

            const lines = evidence.text.split('\n');
            let commandLine = '';
            let outputLines = [];

            lines.forEach((line, index) => {
                if (line.trim().startsWith('$')) {
                    commandLine = line.trim();
                } else if (commandLine !== '' || index > 0) {
                    outputLines.push(line);
                }
            });

            if (commandLine) {
                html += `<div class="console-command"><strong>${this.escapeHtml(commandLine)}</strong></div>`;
            }

            if (outputLines.length > 0) {
                let outputText = outputLines.join('\n');
                outputText = this.escapeHtml(outputText);
                outputText = outputText.replace(/^(\w+:)/gm, '<strong>$1</strong>');

                html += `<pre style="margin: 0; font-family: 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word;">${outputText}</pre>`;
            }

            if (evidence.hint && this.hintsUsed > 0) {
                html += `<div class="console-hint" style="margin-top: 10px;">${this.escapeHtml(evidence.hint)}</div>`;
            }

            container.innerHTML = html;
            log.appendChild(container);
        });

        log.scrollTop = log.scrollHeight;
        this.updateAccusationButton();
    }

    clearConsoleLog() {
        document.getElementById('evidenceLog').innerHTML = '<div style="color: var(--text-secondary); font-size: 13px; padding: 20px; text-align: center;">Click an AWS service above to query the console and investigate the incident.</div>';
        document.querySelectorAll('.service-btn').forEach(btn => btn.classList.remove('clicked'));
        this.updateAccusationButton();
    }

    askForHelp() {
        if (this.hintsUsed < 3) {
            this.hintsUsed++;
            this.score = Math.max(0, this.score - 10);
            this.updateScoreDisplay();

            const log = document.getElementById('evidenceLog');
            const hintOutput = document.createElement('div');
            hintOutput.className = 'console-output';
            hintOutput.innerHTML = '<div class="console-hint">💡 Hint active - check the evidence above for additional guidance.</div>';
            log.appendChild(hintOutput);

            document.querySelectorAll('.console-hint').forEach(hint => {
                hint.style.display = 'block';
            });
        }
    }

    updateAccusationButton() {
        const accuseBtn = document.getElementById('makeAccusation');
        const hasClickedServices = document.querySelectorAll('.service-btn.clicked').length > 0;
        accuseBtn.disabled = !hasClickedServices;
    }

    renderAccusationScreen() {
        const causes = this.currentCaseData.accusations.rootCauses;
        const evidence = this.currentCaseData.accusations.keyEvidence;
        const fixes = this.currentCaseData.accusations.fixes;

        this.populateSelect('rootCauseSelect', causes);
        this.populateSelect('keyEvidenceSelect', evidence);
        this.populateSelect('fixSelect', fixes);
    }

    populateSelect(elementId, options) {
        const select = document.getElementById(elementId);
        select.innerHTML = '<option value="">-- Select --</option>';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.text;
            select.appendChild(opt);
        });
    }

    submitAccusation() {
        const cause = document.getElementById('rootCauseSelect').value;
        const evidence = document.getElementById('keyEvidenceSelect').value;
        const fix = document.getElementById('fixSelect').value;

        if (!cause || !evidence || !fix) {
            alert('Please select all three options before submitting.');
            return;
        }

        this.playerAnswers = { cause, evidence, fix };
        this.evaluateAccusation();
        this.showScreen('results');
    }

    evaluateAccusation() {
        const correct = this.currentCaseData.solution;
        const answers = this.playerAnswers;

        this.playerAnswers.causeCorrect = answers.cause === correct.rootCause;
        this.playerAnswers.evidenceCorrect = answers.evidence === correct.keyEvidence;
        this.playerAnswers.fixCorrect = answers.fix === correct.fix;

        const allCorrect = this.playerAnswers.causeCorrect &&
                          this.playerAnswers.evidenceCorrect &&
                          this.playerAnswers.fixCorrect;

        if (allCorrect) {
            this.score += 20;
            this.progress[this.currentCase] = true;
            this.saveProgress();
        }

        this.saveScore();
    }

    renderResultsScreen() {
        const allCorrect = this.playerAnswers.causeCorrect &&
                          this.playerAnswers.evidenceCorrect &&
                          this.playerAnswers.fixCorrect;

        document.getElementById('resultTitle').textContent = allCorrect ?
            '✓ Case Solved!' : '✗ Case Failed';

        const content = document.getElementById('resultContent');
        content.innerHTML = '';

        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<div class="final-score-label">Final Score</div><div class="final-score">${this.score}</div>`;
        content.appendChild(scoreDiv);

        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `
            <div class="result-box ${this.playerAnswers.causeCorrect ? 'correct' : 'incorrect'}">
                <h4>Root Cause</h4>
                <p><strong>Your answer:</strong> ${this.getOptionText('rootCauses', this.playerAnswers.cause)}</p>
                <p><strong>Correct:</strong> ${this.getOptionText('rootCauses', this.currentCaseData.solution.rootCause)}</p>
            </div>

            <div class="result-box ${this.playerAnswers.evidenceCorrect ? 'correct' : 'incorrect'}">
                <h4>Key Evidence</h4>
                <p><strong>Your answer:</strong> ${this.getOptionText('keyEvidence', this.playerAnswers.evidence)}</p>
                <p><strong>Correct:</strong> ${this.getOptionText('keyEvidence', this.currentCaseData.solution.keyEvidence)}</p>
            </div>

            <div class="result-box ${this.playerAnswers.fixCorrect ? 'correct' : 'incorrect'}">
                <h4>The Fix</h4>
                <p><strong>Your answer:</strong> ${this.getOptionText('fixes', this.playerAnswers.fix)}</p>
                <p><strong>Correct:</strong> ${this.getOptionText('fixes', this.currentCaseData.solution.fix)}</p>
            </div>
        `;
        content.appendChild(resultDiv);

        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'result-box';
        explanationDiv.innerHTML = `
            <h4>What Happened?</h4>
            <p>${this.escapeHtml(this.currentCaseData.explanation)}</p>
        `;
        content.appendChild(explanationDiv);

        if (this.currentCaseData.hiddenBonus) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'result-box bonus';
            bonusDiv.innerHTML = `
                <h4>🎁 Hidden Issue Spotted!</h4>
                <p>${this.escapeHtml(this.currentCaseData.hiddenBonus)}</p>
                <p><strong>Bonus: +20 pts</strong></p>
            `;
            content.appendChild(bonusDiv);
        }

        if (allCorrect && this.currentCaseData.outro) {
            const outroDiv = document.createElement('div');
            outroDiv.className = 'result-box';
            outroDiv.innerHTML = `
                <h4>Rosa's Debrief</h4>
                <p><em>"${this.currentCaseData.outro}"</em></p>
            `;
            content.appendChild(outroDiv);
        }
    }

    getOptionText(category, id) {
        const options = this.currentCaseData.accusations[category];
        const option = options.find(o => o.id === id);
        return option ? option.text : 'Unknown';
    }

    resetCase() {
        this.score = 100;
        this.hintsUsed = 0;
        this.playerAnswers = {};
        this.renderBriefing();
        this.showScreen('briefing');
    }

    saveScore() {
        if (this.currentCase) {
            const bestScore = this.scores[this.currentCase];
            if (bestScore === undefined || this.score > bestScore) {
                this.scores[this.currentCase] = this.score;
                localStorage.setItem('case-scores', JSON.stringify(this.scores));
            }
        }
    }

    loadScores() {
        const saved = localStorage.getItem('case-scores');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('campaign-progress', JSON.stringify(this.progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('campaign-progress');
        return saved ? JSON.parse(saved) : {};
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CloudDetectiveGame();
});
