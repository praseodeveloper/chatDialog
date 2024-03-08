function createFragmentFromHTML(htmlString) {
    const range = document.createRange();
    range.selectNode(document.body); // Select any existing node as the context
    const fragment = range.createContextualFragment(htmlString);
    return fragment;
}

document.addEventListener("DOMContentLoaded", function () {
    const chatbox = document.querySelector(".chatbox");
    const messageContainer = document.querySelector(".card-body");
    const overlay = document.querySelector(".overlay");
    const openChatboxBtn = document.querySelector("#openBtn");
    const closeChatboxBtn = document.querySelector("#btn-close");
    const messageInput = document.querySelector("#input");
    const submitBtn = document.querySelector('#submit');

    const openChatbox = function () {
        chatbox.classList.remove("hidden");
        overlay.classList.remove("hidden");
    };

    openChatboxBtn.addEventListener("click", openChatbox);

    const closeChatbox = function () {
        chatbox.classList.add("hidden");
        overlay.classList.add("hidden");
    };

    closeChatboxBtn.addEventListener("click", closeChatbox);
    overlay.addEventListener("click", closeChatbox);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !chatbox.classList.contains("hidden")) {
            closeChatbox();
        }
    });

    const addMessage = function (sender, text) {
        if (!text) {
            return;
        }

        let newMessage;
        if (sender === "user") {
            newMessage = `
                <div class="d-flex align-items-baseline text-end justify-content-end mb-4">
                    <div class="pe-2">
                        <div>
                            <div class="card card-text d-inline-block p-2 px-3 m-1">
                                ${text}
                            </div>
                        </div>
                    </div>
                    <div class="position-relative avatar">
                        <img src="user.png" class="img-fluid rounded-circle" alt="" />
                    </div>
                </div>
            `;
        } else if (sender === "bot") {
            newMessage = `
                <div class="d-flex align-items-baseline mb-4">
                    <div class="position-relative avatar">
                        <img src="assistant.png" class="img-fluid rounded-circle" alt="" />
                    </div>
                    <div class="pe-2">
                        <div>
                            <div class="card card-text d-inline-block p-2 px-3 m-1">
                                ${text}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const messageElement = createFragmentFromHTML(newMessage);
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    const processInput = function () {
        const msg = messageInput.value;
        addMessage("user", msg);
        messageInput.value = "";
    }

    messageInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            processInput();
        }
    });

    submitBtn.addEventListener("click", () => {
        processInput();
    });
});

