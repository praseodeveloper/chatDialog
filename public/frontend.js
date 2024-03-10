document.addEventListener("DOMContentLoaded", function () {
    const chatbox = document.querySelector("#myChat");
    const overlay = document.querySelector(".overlay");
    const openChatboxBtn = document.querySelector("#openBtn");

    const openChatbox = function () {
        chatbox.classList.remove("hidden");
        overlay.classList.remove("hidden");
    };

    openChatboxBtn.addEventListener("click", openChatbox);

    const closeChatbox = function () {
        chatbox.classList.add("hidden");
        overlay.classList.add("hidden");
    };

    chatbox.addEventListener("chatbox-closed-event", closeChatbox);
    overlay.addEventListener("click", closeChatbox);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !chatbox.classList.contains("hidden")) {
            closeChatbox();
        }
    });
});

