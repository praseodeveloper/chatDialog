class ChatBox extends HTMLElement {
    static observedAttributes = ["width", "height", "headertext"];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="webc/css/chatbox.css" />
            <link rel="stylesheet" href="webc/css/chatboxcard.css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.2/css/bootstrap.min.css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

            <div class="card mx-auto">
    
                <div class="card-header">
                    <div class="navbar navbar-expand p-0">
                        <ul class="navbar-nav me-auto align-items-center">
                            <li class="nav-item text-dark">${this.getAttribute("headertext") ?? "Chat assistant"}</li>
                        </ul>
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link">
                                    <i id="btn-close" class="fas fa-window-minimize"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
    
                <div class="card-body p-3 bg-light bg-gradient">
                    <chat-box-bot-card message="Hi! How may I help you today?" hidefeedback="true"></chat-box-bot-card>
                </div>
    
                <div class="busy-indicator hidden">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
    
                <div class="card-footer w-100 bottom-0 m-0 p-1">
                    <div class="input-group border-1">
                        <button id="reset" width="4rem" class="btn btn-danger text-secondary">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    
                        <textarea class="form-control" id="input" cols="40" rows="2" placeholder="Enter your query here..."></textarea>
                        
                        <button id="submit" width="4rem" class="btn btn-light text-secondary">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event handlers
        const messageInput = this.shadowRoot.querySelector("#input");
        messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                this._processInput();
                event.preventDefault(); // To prevent cursor movement to next line
            }
        });

        const resetBtn = this.shadowRoot.querySelector("#reset");
        resetBtn.addEventListener("click", () => {
            this._processReset();
        });

        const submitBtn = this.shadowRoot.querySelector("#submit");
        submitBtn.addEventListener("click", () => {
            this._processInput();
        });

        const closeChatboxBtn = this.shadowRoot.querySelector("#btn-close");
        closeChatboxBtn.addEventListener("click", this._closeChatbox.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );
        const box = this.shadowRoot.querySelector(".card.mx-auto");
        const msgCards = this.shadowRoot.querySelectorAll("chat-box-user-card, chat-box-bot-card");
        const cardHeader = this.shadowRoot.querySelector(".card-header li");
        if (name === "height") {
            box.style.height = newValue;
        } else if (name === "width") {
            box.style.width = newValue;
            msgCards.forEach(msgCard => {
                msgCard.setAttribute("width", `calc(${newValue} - 100px)`);
            });
        } else if (name === "headertext") {
            cardHeader.textContent = newValue;
        }
    }

    addMessage(sender, text) {
        let messageElement;
        if (sender === "user") {
            messageElement = document.createElement('chat-box-user-card');
            this.lastUserMessage = text;

        } else if (sender === "bot") {
            messageElement = document.createElement('chat-box-bot-card');
            messageElement.addEventListener("chatboxbotcard-dislike-event", (evt) => {
                console.log(`Last user message : ${this.lastUserMessage}`);
                console.log(`Last bot reply : ${evt.detail.reply}`);
            });
        }

        if (messageElement) {
            const chatboxWidth = this.getAttribute("width") ?? "600px";
            messageElement.setAttribute("width", `calc(${chatboxWidth} - 100px)`);
            messageElement.setAttribute("message", text);
            const messageContainer = this.shadowRoot.querySelector(".card-body");
            messageContainer.appendChild(messageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

    clearMessages() {
        const messageContainer = this.shadowRoot.querySelector(".card-body");
        messageContainer.replaceChildren([]);
    }

    _closeChatbox() {
        this.classList.add("hidden");
        const customEvent = new CustomEvent('chatbox-closed-event', {
            bubbles: false, // Disable event to bubble up the DOM tree
            composed: true, // Allow event to cross shadow DOM boundaries
            detail: { id: this.id }
        });
        this.shadowRoot.dispatchEvent(customEvent);
    };

    _processReset() {
        const busyIndicator = this.shadowRoot.querySelector(".busy-indicator");
        busyIndicator.classList.remove("hidden");
        this._sendReset(). //
            then((reply) => {
                busyIndicator.classList.add("hidden");
                this.clearMessages();
                this.addMessage("bot", reply.response);
            }). //
            catch((ex) => {
                busyIndicator.classList.add("hidden");
                this.addMessage("bot", `An error occurred : ${ex}`);
            });
    }

    _processInput() {
        const messageInput = this.shadowRoot.querySelector("#input");
        const busyIndicator = this.shadowRoot.querySelector(".busy-indicator");
        const msg = messageInput.value;
        if (msg) {
            this.addMessage("user", msg);
            messageInput.value = "";
            busyIndicator.classList.remove("hidden");
            this._sendPrompt(msg). //
                then((reply) => {
                    busyIndicator.classList.add("hidden");
                    this.addMessage("bot", reply.response);
                }). //
                catch((ex) => {
                    busyIndicator.classList.add("hidden");
                    this.addMessage("bot", `An error occurred : ${ex}`);
                });
        }
    }

    _sendReset() {
        return fetch(`/reset`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        }).then((response) => response.json()). //
            catch((err) => { throw new Error(err); });
    }

    _sendPrompt(msg) {
        return fetch(`/sendPrompt`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                prompt: msg
            })
        }).then((response) => response.json()). //
            catch((err) => { throw new Error(err); });
    }

}

customElements.define('chat-box', ChatBox);