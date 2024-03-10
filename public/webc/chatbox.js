class ChatBox extends HTMLElement {
    static observedAttributes = ["width", "height"];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .card.mx-auto {
                    height: 600px;
                    width: 600px;
                }

                a.nav-link {
                    color: gray;
                    font-size: 18px;
                    padding: 0;
                }
                
                .avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 2px solid #009999;
                    padding: 2px;
                    flex: none;
                }
                
                input:focus {
                    outline: 0px !important;
                    box-shadow: none !important;
                }

                .card-body {
                    overflow: auto;
                }
                
                .card-text {
                    border: 2px solid #91cdc9;
                    border-radius: 4px;
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                }
                
                .btn {
                    display: inline-block;
                    padding: 0.8rem 1.4rem;
                    font-weight: 700;
                    background-color: black;
                    color: white;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 1em;
                }
                
                .busy-indicator {
                    justify-content: center;
                    display: flex;
                    padding-bottom: 1rem;
                }
                
                .hidden {
                    display: none;
                }

                .card-pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .card-pre code {
                    font-size : 12px;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.2/css/bootstrap.min.css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            
            <div class="card mx-auto">
    
                <div class="card-header">
                    <div class="navbar navbar-expand p-0">
                        <ul class="navbar-nav me-auto align-items-center">
                            <li class="nav-item">
                                <a href="#!" class="nav-link text-dark">Piloting AI Assistant</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a href="#!" class="nav-link">
                                    <i id="btn-close" class="fas fa-window-minimize"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
    
                <div class="card-body p-3">
                </div>
    
                <div class="busy-indicator hidden">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
    
                <div class="card-footer w-100 bottom-0 m-0 p-1">
                    <div class="input-group border-1">
                        <textarea class="form-control" id="input" cols="40" rows="3" placeholder="Enter your query here..."></textarea>
                        <div class="input-group-text bg-transparent">
                            <button id="submit" class="btn btn-light text-secondary">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event handlers
        const messageInput = this.shadowRoot.querySelector("#input");
        messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                this.processInput();
                event.preventDefault(); // To prevent cursor movement to next line
            }
        });

        const submitBtn = this.shadowRoot.querySelector("#submit");
        submitBtn.addEventListener("click", () => {
            this.processInput();
        });

        const closeChatboxBtn = this.shadowRoot.querySelector("#btn-close");
        closeChatboxBtn.addEventListener("click", this.closeChatbox.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );
        const box = this.shadowRoot.querySelector(".card.mx-auto");
        const msgCards = this.shadowRoot.querySelectorAll(".card-text");
        if (name === "height") {
            box.style.height = newValue;
        } else if (name === "width") {
            box.style.width = newValue;
            msgCards.forEach(msgCard => {
                msgCard.style.maxWidth = `calc(${newValue} - 100px)`;
            });
        }
    }

    closeChatbox() {
        this.classList.add("hidden");
        const customEvent = new CustomEvent('chatbox-closed-event', {
            bubbles: true, // Allow event to bubble up the DOM tree
            composed: true, // Allow event to cross shadow DOM boundaries
            detail: { id: this.id }
        });
        this.shadowRoot.dispatchEvent(customEvent);
    };

    processInput() {
        const messageInput = this.shadowRoot.querySelector("#input");
        const busyIndicator = this.shadowRoot.querySelector(".busy-indicator");
        const msg = messageInput.value;
        if (msg) {
            this.addMessage("user", msg);
            messageInput.value = "";
            busyIndicator.classList.remove("hidden");
            this.sendPrompt(msg). //
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

    addMessage(sender, text) {
        let newMessage;
        if (sender === "user") {
            newMessage = `
                <div class="d-flex align-items-baseline text-end justify-content-end mb-4">
                    <div class="pe-2">
                        <div>
                            <div class="card card-text d-inline-block p-2 px-3 m-1" style="max-width: calc(${this.getAttribute("width") ?? "600px"} - 100px)">
                                <pre class="card-pre"><code>${text}</code></pre>
                            </div>
                        </div>
                    </div>
                    <div class="position-relative avatar">
                        <img src="webc/img/account.png" class="img-fluid rounded-circle" alt="" />
                    </div>
                </div>
            `;
        } else if (sender === "bot") {
            newMessage = `
                <div class="d-flex align-items-baseline mb-4">
                    <div class="position-relative avatar">
                        <img src="webc/img/assistant.png" class="img-fluid rounded-circle" alt="" />
                    </div>
                    <div class="pe-2">
                        <div>
                            <div class="card card-text d-inline-block p-2 px-3 m-1" style="max-width: calc(${this.getAttribute("width") ?? "600px"} - 100px)">
                                <pre class="card-pre"><code>${text}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const messageElement = document.createElement("div");
        messageElement.innerHTML = newMessage;
        const messageContainer = this.shadowRoot.querySelector(".card-body");
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    sendPrompt(msg) {
        const fqdn = this.getAttribute("endpoint");
        return fetch(`${fqdn}/sendPrompt`, {
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