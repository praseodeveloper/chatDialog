class ChatBoxBotCard extends HTMLElement {
    static observedAttributes = ["width", "message"];

    constructor() {
        super();
        this.onLikeBtnPress = () => this._likeReply();
        this.onDislikeBtnPress = () => this._dislikeReply();
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
                            <div class="card-btn-container align-content-center">
                                <i class="like-btn fas fa-thumbs-up"></i>
                                <i class="dislike-btn fas fa-thumbs-down"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const likeBtn = this.querySelector(".like-btn");
        likeBtn.addEventListener("click", this.onLikeBtnPress);

        const dislikeBtn = this.querySelector(".dislike-btn");
        dislikeBtn.addEventListener("click", this.onDislikeBtnPress);
    }

    disconnectedCallback() {
        const likeBtn = this.querySelector(".like-btn");
        likeBtn.removeEventListener("click", this.onLikeBtnPress);

        const dislikeBtn = this.querySelector(".dislike-btn");
        dislikeBtn.removeEventListener("click", this.onDislikeBtnPress);
    }

    _likeReply() {
        // alert("Thank you for your feedback for : " + this.getAttribute("message"));
    }

    _dislikeReply() {
        const reply = this.getAttribute("message");
        // alert("We are sorry to hear this for : " + reply);
        const customEvent = new CustomEvent('chatboxbotcard-dislike-event', {
            bubbles: false, // Disable event to bubble up the DOM tree
            composed: true, // Allow event to cross shadow DOM boundaries
            detail: {
                reply: reply
            }
        });
        this.dispatchEvent(customEvent);
    }

    _replaceURLWithHTMLLinks(text) {
        // Regular expression to match URLs
        const urlRegex = /(https?:\/\/[^\s]+([^\. ]+))/g;

        // Replace each URL with an <a> tag
        return text.replace(urlRegex, "<a href='$1'>link</a>");
    }
}

customElements.define('chat-box-bot-card', ChatBoxBotCard);