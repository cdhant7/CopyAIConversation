const copyButton = document.getElementById("copyButton");
const preview = document.getElementById("preview");
const markdownMode = document.getElementById("markdownMode");

copyButton.addEventListener("click", async () => {
    copyButton.disabled = true;
    preview.value = "";

    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) {
            throw new Error("Could not find the active tab.");
        }

        const results = await chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: [ "js/extractor.js" ]
        });

        if (!results || results.length === 0) {
            throw new Error("Could not read the page.");
        }
        const result = results[0].result;

        if (!result) {
            throw new Error("No result returned from extractor.");
        }

        if (!result.messages || result.messages.length === 0) {
            status.textContent =`No conversation found on ${result.provider || "this page"}.`;
            return;
        }
        const useMarkdown = markdownMode.checked;
        const finalConversation = formatConversation(result.messages, useMarkdown);
        if (!finalConversation) {
            status.textContent ="Conversation was found, but no text could be extracted.";
            return;
        }
        preview.value = finalConversation;

        await navigator.clipboard.writeText(finalConversation);
        const formatName =useMarkdown? "Markdown": "plain text";
        status.textContent =`Copied ${result.messages.length} messages from ${result.provider}.`;
    }
    catch (error) {
        console.error(error);

        status.textContent = "Could not copy conversation.";

        preview.value =error?.message || "Unknown error.";
    }
    finally {
        copyButton.disabled = false;
    }
});


function formatConversation(messages,useMarkdown) {

    return messages
        .map(message => {
            const content = useMarkdown ? message.markdown : message.plainText;
            if (!content) {
                return null;
            }
            if (message.role === "user") {
                return `question: ${content}`;
            }

            if (message.role === "assistant") {
                return `botanswer: ${content}`;
            }

            return null;
        }).filter(Boolean).join("\n\n");
}