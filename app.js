const app = {
    apiKey: '',
    topic: '',
    history: [],
    phase: 'saq',
    saqIdx: 0,
    qIdx: 0,

    curriculum: {
        'Colles Fracture': {
            saqs: [
                "A 65-year-old woman presents with wrist pain after falling on outstretched hand. Describe the mechanism of injury and clinical presentation of Colles fracture.",
                "Explain the X-ray findings in Colles fracture. What specific features would you look for?",
                "Discuss the management approach for Colles fracture, including when you would consider surgery.",
                "What complications can occur with Colles fracture? How would you prevent and manage them?"
            ],
            mixed: [
                {t: 'LAQ', q: "A 70-year-old osteoporotic woman with Colles fracture. Discuss complete management including complications."},
                {t: 'SAQ', q: "Compare Colles vs Smith fracture in terms of mechanism, deformity, and management."},
                {t: 'MCQ', q: "Most common nerve injury in Colles fracture?", o: ["A) Ulnar", "B) Radial", "C) Median", "D) None"], a: 'C'}
            ],
            mcqs: [
                {q: "Colles fracture occurs within how many cm of distal radius?", o: ["A) 1cm", "B) 2.5cm", "C) 5cm", "D) 7cm"], a: 'B'},
                {q: "Dinner fork deformity is due to:", o: ["A) Volar displacement", "B) Dorsal displacement", "C) Radial deviation", "D) Ulnar deviation"], a: 'B'},
                {q: "Ideal cast position:", o: ["A) Extension", "B) Flexion", "C) Palmar flexion + ulnar deviation", "D) Dorsiflexion"], a: 'C'}
            ]
        }
    },

    init() {
        const saved = localStorage.getItem('api_key');
        if (saved) {
            this.apiKey = saved;
            document.getElementById('apiKeyInput').value = saved;
            this.showScreen('topicScreen');
        }
    },

    showScreen(screen) {
        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('topicScreen').classList.add('hidden');
        document.getElementById('learningScreen').classList.add('hidden');
        document.getElementById(screen).classList.remove('hidden');
    },

    showError(msg) {
        const err = document.getElementById('apiError');
        err.textContent = msg;
        err.classList.remove('hidden');
    },

    hideError() {
        document.getElementById('apiError').classList.add('hidden');
    },

    async saveApiKey() {
        const key = document.getElementById('apiKeyInput').value.trim();
        
        if (!key || !key.startsWith('sk-ant-')) {
            this.showError('Invalid API key format');
            return;
        }

        this.hideError();
        const btn = event.target;
        btn.textContent = 'Testing...';
        btn.disabled = true;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 20,
                    messages: [{role: 'user', content: 'Hi'}]
                })
            });

            const data = await response.json();

            if (data.error) {
                this.showError(data.error.message);
                btn.textContent = 'Save & Test';
                btn.disabled = false;
                return;
            }

            this.apiKey = key;
            localStorage.setItem('api_key', key);
            btn.textContent = '✓ Success!';
            
            setTimeout(() => {
                this.showScreen('topicScreen');
            }, 1000);

        } catch (error) {
            this.showError('Connection error: ' + error.message);
            btn.textContent = 'Save & Test';
            btn.disabled = false;
        }
    },

    resetAPI() {
        localStorage.removeItem('api_key');
        this.apiKey = '';
        this.showScreen('setupScreen');
        document.getElementById('apiKeyInput').value = '';
    },

    startTopic(topic) {
        this.topic = topic;
        this.phase = 'saq';
        this.saqIdx = 0;
        this.qIdx = 0;
        this.history = [];

        document.getElementById('topicTitle').textContent = `📖 Mastering: ${topic}`;
        document.getElementById('chatContainer').innerHTML = '';
        this.showScreen('learningScreen');
        this.updateUI();
        this.startSAQ();
    },

    backToTopics() {
        this.showScreen('topicScreen');
    },

    updateUI() {
        document.getElementById('phase1').classList.toggle('active', this.phase === 'saq');
        document.getElementById('phase2').classList.toggle('active', this.phase === 'mixed');
        document.getElementById('phase3').classList.toggle('active', this.phase === 'mcq');

        const curr = this.curriculum[this.topic];
        const total = curr.saqs.length + curr.mixed.length + curr.mcqs.length;
        const done = this.phase === 'saq' ? this.saqIdx : 
                     this.phase === 'mixed' ? curr.saqs.length + this.qIdx :
                     curr.saqs.length + curr.mixed.length + this.qIdx;
        const pct = (done / total) * 100;
        
        document.getElementById('progressBar').style.width = pct + '%';

        if (this.phase === 'saq') {
            document.getElementById('progressText').textContent = `SAQ ${this.saqIdx + 1}/${curr.saqs.length} - Teaching Mode`;
        } else if (this.phase === 'mixed') {
            document.getElementById('progressText').textContent = `Mixed Practice ${this.qIdx + 1}/${curr.mixed.length}`;
        } else {
            document.getElementById('progressText').textContent = `Final MCQ ${this.qIdx + 1}/${curr.mcqs.length}`;
        }
    },

    async startSAQ() {
        const q = this.curriculum[this.topic].saqs[this.saqIdx];
        const sys = `You are teaching ${this.topic} to a NEET PG student. This is SAQ ${this.saqIdx + 1}/${this.curriculum[this.topic].saqs.length}.

Question: ${q}

Teaching approach:
- Be conversational: "Great!", "Let me explain...", "Think about..."
- Ask probing follow-up questions to build understanding
- Use Socratic method - guide them to discover, don't just give answers
- Use clinical pearls and mnemonics
- Be patient and thorough

When the student demonstrates COMPLETE understanding of ALL aspects of this question, end your response with exactly: NEXT_QUESTION

Start now by presenting this question conversationally.`;

        const ai = await this.callAI(sys, "Start teaching this SAQ");
        if (ai) this.addMessage('ai', ai);
    },

    async sendMessage() {
        const input = document.getElementById('userInput');
        const msg = input.value.trim();
        if (!msg) return;

        input.value = '';
        this.addMessage('user', msg);

        const btn = document.getElementById('sendBtn');
        btn.innerHTML = '<div class="loading"></div>';
        btn.disabled = true;

        const sys = this.buildPrompt();
        const ai = await this.callAI(sys, msg);

        btn.textContent = 'Send';
        btn.disabled = false;

        if (!ai) return;

        if (ai.includes('NEXT_QUESTION')) {
            const clean = ai.replace('NEXT_QUESTION', '').trim();
            if (clean) this.addMessage('ai', clean);
            setTimeout(() => this.moveNext(), 2000);
        } else {
            this.addMessage('ai', ai);
        }
    },

    buildPrompt() {
        const curr = this.curriculum[this.topic];
        
        if (this.phase === 'saq') {
            return `Teaching ${this.topic} SAQ ${this.saqIdx + 1}. Question: ${curr.saqs[this.saqIdx]}

Continue Socratic dialogue. Ask probing questions. When student shows complete understanding, end with: NEXT_QUESTION`;
        } else if (this.phase === 'mixed') {
            const q = curr.mixed[this.qIdx];
            return `Mixed practice ${q.t}: ${q.q}
${q.o ? q.o.join('\n') : ''}

Evaluate answer. Teach what's right/wrong. When done, end with: NEXT_QUESTION`;
        } else {
            const m = curr.mcqs[this.qIdx];
            return `MCQ: ${m.q}
${m.o.join('\n')}

Correct answer: ${m.a}. Check if correct, explain why, then end with: NEXT_QUESTION`;
        }
    },

    moveNext() {
        const curr = this.curriculum[this.topic];
        
        if (this.phase === 'saq') {
            this.saqIdx++;
            if (this.saqIdx < curr.saqs.length) {
                this.history = [];
                this.updateUI();
                this.startSAQ();
            } else {
                this.phase = 'mixed';
                this.qIdx = 0;
                this.history = [];
                this.updateUI();
                const q = curr.mixed[0];
                this.addMessage('ai', `Excellent SAQ work! Now mixed practice:\n\n${q.t}: ${q.q}${q.o ? '\n\n' + q.o.join('\n') : ''}`);
            }
        } else if (this.phase === 'mixed') {
            this.qIdx++;
            if (this.qIdx < curr.mixed.length) {
                this.history = [];
                this.updateUI();
                const q = curr.mixed[this.qIdx];
                this.addMessage('ai', `${q.t}: ${q.q}${q.o ? '\n\n' + q.o.join('\n') : ''}`);
            } else {
                this.phase = 'mcq';
                this.qIdx = 0;
                this.history = [];
                this.updateUI();
                const m = curr.mcqs[0];
                this.addMessage('ai', `Final competency test!\n\n${m.q}\n\n${m.o.join('\n')}`);
            }
        } else {
            this.qIdx++;
            if (this.qIdx < curr.mcqs.length) {
                this.history = [];
                this.updateUI();
                const m = curr.mcqs[this.qIdx];
                this.addMessage('ai', `${m.q}\n\n${m.o.join('\n')}`);
            } else {
                this.addMessage('ai', `🎉 Congratulations! You've completed ${this.topic}!\n\nYou've mastered:\n✅ All SAQs with deep understanding\n✅ Mixed practice questions\n✅ Final MCQ competency test\n\nReady for another topic?`);
                setTimeout(() => this.showScreen('topicScreen'), 5000);
            }
        }
    },

    async callAI(system, userMessage) {
        this.history.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    system: system,
                    messages: this.history
                })
            });

            const data = await response.json();
            
            if (data.error) {
                this.addMessage('ai', `❌ Error: ${data.error.message}`);
                return null;
            }

            const aiMessage = data.content[0].text;
            this.history.push({
                role: 'assistant',
                content: aiMessage
            });

            return aiMessage;

        } catch (error) {
            this.addMessage('ai', `❌ Connection error: ${error.message}`);
            return null;
        }
    },

    addMessage(sender, text) {
        const container = document.getElementById('chatContainer');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + sender;
        msgDiv.innerHTML = `
            <div class="avatar ${sender}">${sender === 'user' ? '👤' : '🦴'}</div>
            <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
        `;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => app.init());
