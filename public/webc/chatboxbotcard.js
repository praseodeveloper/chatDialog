class ChatBoxBotCard extends HTMLElement {
    static observedAttributes = ["width", "message"];

    constructor() {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );
        if (this.innerHTML) {
            const msgCard = this.querySelector(".card-text");
            const content = this.querySelector(".card-pre code");
            if (name === "width") {
                msgCard.style.maxWidth = newValue;
            } else if (name === "message") {
                content.textContent = newValue;
            }
        }
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="d-flex align-items-baseline mb-4">
                <div class="position-relative avatar">
                    <img src="webc/img/assistant.png" class="img-fluid rounded-circle" alt="" />
                </div>
                <div class="pe-2">
                    <div>
                        <div class="card card-text d-inline-block p-2 px-3 m-1" style="max-width: ${this.getAttribute("width")}">
                            <pre class="card-pre"><code>${this._replaceURLWithHTMLLinks(this.getAttribute("message"))}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _replaceURLWithHTMLLinks(text) {
        // Regular expression to match URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        // Replace each URL with an <a> tag
        return text.replace(urlRegex, "<a href='$1'>$1</a>");
    }
}

customElements.define('chat-box-bot-card', ChatBoxBotCard);