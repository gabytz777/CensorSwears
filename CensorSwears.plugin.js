/**
 * @name CensorSwears
 * @version 1.0.1
 * @description Censors bad words in chat and allows revealing them by clicking "See Swear 👀"
 * @author nuny3
 */

module.exports = class CensorSwears {
    constructor() {
        this.observer = null;
        this.defaultBadWords = [
            "arse", "arsehead", "arsehole", "ass", "ass hole", "asshole",
    "bastard", "bitch", "bloody", "bollocks", "brotherfucker", "bugger", "bullshit",
    "child-fucker", "Christ on a bike", "Christ on a cracker", "cock", "cocksucker", "crap", "cunt",
    "dammit", "damn", "damned", "damn it", "dick", "dick-head", "dickhead", "dumb ass", "dumb-ass", "dumbass", "dyke",
    "faggot", "father-fucker", "fatherfucker", "fuck", "fucker", "fucking",
    "god dammit", "goddammit", "God damn", "god damn", "goddamn", "Goddamn", "goddamned", "goddamnit", "godsdamn",
    "hell", "holy shit", "horseshit",
    "in shit",
    "jackarse", "jack-ass", "jackass", "Jesus Christ", "Jesus fuck", "Jesus Harold Christ", "Jesus H. Christ", "Jesus, Mary and Joseph", "Jesus wept",
    "kike",
    "mother fucker", "mother-fucker", "motherfucker",
    "nigga", "nigra",
    "pigfucker", "piss", "prick", "pussy",
    "shit", "shit ass", "shite", "sibling fucker", "sisterfuck", "sisterfucker", "slut", "son of a bitch", "son of a whore", "spastic", "sweet Jesus",
    "twat",
    "wanker","dumb"
        ];
        this.settings = {
            enabled: true,
            customBadWords: [],
            censorChar: '*'
        };

        // Add CSS styles when plugin loads
        BdApi.injectCSS('CensorSwears', `
            .censor-reveal-button {
                background: #000000;
                color: white;
                border: none;
                border-radius: 12px;
                padding: 4px 12px;
                margin-left: 8px;
                font-size: 12px;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s;
            }
            
            .censor-reveal-button:hover {
                background: #1a1a1a;
                transform: scale(1.05);
            }
            
            .censor-reveal-button:active {
                transform: scale(0.95);
            }
        `);
    }

    start() {
        try {
            this.loadSettings();
            this.observeMessages();
        } catch (error) {
            console.error('[CensorSwears] Failed to start:', error);
        }
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        // Remove CSS when plugin stops
        BdApi.clearCSS('CensorSwears');
    }

    loadSettings() {
        const savedSettings = BdApi.getData('CensorSwears', 'settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    }

    observeMessages() {
        if (this.observer) {
            this.stop();
        }

        this.observer = new MutationObserver((mutations) => {
            try {
                for (const mutation of mutations) {
                    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                this.censorMessage(node);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('[CensorSwears] Error processing mutation:', error);
            }
        });

        this.observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    censorMessage(node) {
        const messageSelectors = [
            '.messageContent-2t3eCI',
            '[class*="messageContent"]',
            '[class*="message-content"]'
        ];

        const messages = node.querySelectorAll(messageSelectors.join(','));
        if (!messages.length) return;

        messages.forEach(message => {
            if (message.getAttribute('data-censored')) return;

            let text = message.textContent;
            let censored = false;
            const badWords = [...this.defaultBadWords, ...this.settings.customBadWords];

            badWords.forEach(word => {
                const regex = new RegExp(word, 'gi');
                if (regex.test(text)) {
                    censored = true;
                    text = text.replace(regex, match => 
                        this.settings.censorChar.repeat(match.length)
                    );
                }
            });

            if (censored) {
                const originalText = message.textContent;
                message.textContent = text;
                message.setAttribute('data-censored', 'true');
                
                const revealButton = document.createElement('button');
                revealButton.textContent = 'See Swear 👀';
                revealButton.className = 'censor-reveal-button';
                revealButton.onclick = () => {
                    message.textContent = originalText;
                    revealButton.remove();
                };
                
                message.parentElement.appendChild(revealButton);
            }
        });
    }
};
