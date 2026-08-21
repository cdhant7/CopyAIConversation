(() => {

    const hostname = window.location.hostname;

    let provider = "Unknown";
    let messages = [];


    // ============================================================
    // PROVIDER DETECTION
    // ============================================================

    if (
        hostname === "chatgpt.com" ||
        hostname.endsWith(".chatgpt.com")
    ) {
        provider = "ChatGPT";
        messages = extractChatGPT();
    }

    else if (
        hostname === "claude.ai" ||
        hostname.endsWith(".claude.ai")
    ) {
        provider = "Claude";
        messages = extractClaude();
    }

    else if (
        hostname === "gemini.google.com" ||
        hostname.endsWith(".gemini.google.com")
    ) {
        provider = "Gemini";
        messages = extractGemini();
    }

    else if (
        hostname === "m365.cloud.microsoft" ||
        hostname.endsWith(".m365.cloud.microsoft") ||
        hostname === "copilot.microsoft.com" ||
        hostname.endsWith(".copilot.microsoft.com")
    ) {
        provider = "Copilot";
        messages = extractM365Copilot();
    }

    else {
        provider = "Generic";
        messages = extractGeneric();
    }


    // ============================================================
    // CHATGPT
    // ============================================================

    function extractChatGPT() {

        const elements = document.querySelectorAll(
            '[data-message-author-role]'
        );

        const messages = [];

        for (const element of elements) {

            const role =
                element.getAttribute(
                    'data-message-author-role'
                );

            if (
                role !== "user" &&
                role !== "assistant"
            ) {
                continue;
            }

            const plainText =
                cleanText(element.innerText);

            const markdown =
                htmlToMarkdown(element);

            if (!plainText && !markdown) {
                continue;
            }

            messages.push({
                role,
                plainText,
                markdown
            });
        }

        return messages;
    }


    // ============================================================
    // CLAUDE
    // ============================================================

    function extractClaude() {

        const messages = [];

        const messageElements =
            document.querySelectorAll(
                '[data-testid="user-message"], .font-claude-response'
            );

        for (const element of messageElements) {

            let role;
            let plainText = "";
            let markdown = "";

            if (
                element.matches(
                    '[data-testid="user-message"]'
                )
            ) {
                role = "user";

                plainText =
                    cleanText(element.innerText);

                markdown =
                    htmlToMarkdown(element);
            }

            else if (
                element.matches(
                    '.font-claude-response'
                )
            ) {
                role = "assistant";

                plainText =
                    extractClaudeFinalAnswerPlainText(
                        element
                    );

                markdown =
                    extractClaudeFinalAnswerMarkdown(
                        element
                    );
            }

            else {
                continue;
            }

            if (!plainText && !markdown) {
                continue;
            }

            messages.push({
                role,
                plainText,
                markdown
            });
        }

        return messages;
    }


    function getClaudeFinalBlocks(element) {

        return Array.from(
            element.querySelectorAll(
                '.standard-markdown, .progressive-markdown'
            )
        )
            .filter(block =>
                !block.closest(
                    '[data-cds="Collapsible"]'
                )
            );
    }


    function extractClaudeFinalAnswerPlainText(
        element
    ) {

        const blocks =
            getClaudeFinalBlocks(element);

        const parts = [];

        for (const block of blocks) {

            const text =
                cleanText(block.innerText);

            if (text) {
                parts.push(text);
            }
        }

        return cleanText(
            parts.join("\n\n")
        );
    }


    function extractClaudeFinalAnswerMarkdown(
        element
    ) {

        const blocks =
            getClaudeFinalBlocks(element);

        const parts = [];

        for (const block of blocks) {

            const text =
                htmlToMarkdown(block);

            if (text) {
                parts.push(text);
            }
        }

        return cleanMarkdown(
            parts.join("\n\n")
        );
    }


    // ============================================================
    // GEMINI
    // ============================================================

    function extractGemini() {

        const messages = [];

        const messageElements =
            document.querySelectorAll(
                '.user-query-container, ' +
                'structured-content-container.model-response-text'
            );

        for (const element of messageElements) {

            let role;
            let plainText = "";
            let markdown = "";

            if (
                element.matches(
                    '.user-query-container'
                )
            ) {
                role = "user";

                const result =
                    extractGeminiUserMessage(
                        element
                    );

                plainText =
                    result.plainText;

                markdown =
                    result.markdown;
            }

            else if (
                element.matches(
                    'structured-content-container.model-response-text'
                )
            ) {
                role = "assistant";

                const result =
                    extractGeminiAnswer(
                        element
                    );

                plainText =
                    result.plainText;

                markdown =
                    result.markdown;
            }

            else {
                continue;
            }

            if (!plainText && !markdown) {
                continue;
            }

            messages.push({
                role,
                plainText,
                markdown
            });
        }


        // Gemini sometimes keeps duplicate DOM
        // copies of the same logical message.
        //
        // Only remove consecutive duplicates.
        const uniqueMessages = [];

        for (const message of messages) {

            const previous =
                uniqueMessages[
                uniqueMessages.length - 1
                ];

            if (
                previous &&
                previous.role === message.role &&
                previous.plainText ===
                message.plainText &&
                previous.markdown ===
                message.markdown
            ) {
                continue;
            }

            uniqueMessages.push(message);
        }

        return uniqueMessages;
    }


    function extractGeminiUserMessage(
        element
    ) {

        const queryElement =
            element.querySelector(
                '.query-text'
            );

        if (!queryElement) {
            return {
                plainText: "",
                markdown: ""
            };
        }

        const clone =
            queryElement.cloneNode(true);

        clone.querySelectorAll(
            '.cdk-visually-hidden, ' +
            '.screen-reader-user-query-label'
        ).forEach(el => el.remove());

        return {
            plainText:
                cleanText(clone.innerText),

            markdown:
                htmlToMarkdown(clone)
        };
    }


    function extractGeminiAnswer(
        element
    ) {

        const response =
            element.querySelector(
                '.markdown-main-panel'
            );

        if (!response) {
            return {
                plainText: "",
                markdown: ""
            };
        }

        const clone =
            response.cloneNode(true);

        clone.querySelectorAll(
            'button, ' +
            'gem-icon-button, ' +
            '[role="button"], ' +
            '[role="toolbar"]'
        ).forEach(el => el.remove());

        return {
            plainText:
                cleanText(clone.innerText),

            markdown:
                htmlToMarkdown(clone)
        };
    }


    // ============================================================
    // MICROSOFT 365 COPILOT
    // ============================================================

    function extractM365Copilot() {

        const messages = [];

        const messageElements =
            document.querySelectorAll(
                '[id^="user-message-"], ' +
                '[id^="copilot-message-"]'
            );

        for (const element of messageElements) {

            let role;
            let plainText = "";
            let markdown = "";

            if (
                element.id.startsWith(
                    "user-message-"
                )
            ) {
                role = "user";

                const result =
                    extractM365CopilotUserMessage(
                        element
                    );

                plainText =
                    result.plainText;

                markdown =
                    result.markdown;
            }

            else if (
                element.id.startsWith(
                    "copilot-message-"
                )
            ) {
                role = "assistant";

                const result =
                    extractM365CopilotAnswer(
                        element
                    );

                plainText =
                    result.plainText;

                markdown =
                    result.markdown;
            }

            else {
                continue;
            }

            if (!plainText && !markdown) {
                continue;
            }

            const previous =
                messages[
                messages.length - 1
                ];

            if (
                previous &&
                previous.role === role &&
                previous.plainText ===
                plainText &&
                previous.markdown ===
                markdown
            ) {
                continue;
            }

            messages.push({
                role,
                plainText,
                markdown
            });
        }

        return messages;
    }


    function extractM365CopilotUserMessage(
        element
    ) {

        const message =
            element.querySelector(
                '[data-testid="chatOutput"]'
            );

        if (!message) {
            return {
                plainText: "",
                markdown: ""
            };
        }

        return {
            plainText:
                cleanText(message.innerText),

            markdown:
                htmlToMarkdown(message)
        };
    }


    function extractM365CopilotAnswer(
        element
    ) {

        const reply =
            element.querySelector(
                '[data-testid="markdown-reply"]'
            );

        if (!reply) {
            return {
                plainText: "",
                markdown: ""
            };
        }

        const clone =
            reply.cloneNode(true);

        clone.querySelectorAll(
            'button, ' +
            '[role="button"], ' +
            '[role="toolbar"], ' +
            '[aria-hidden="true"]'
        ).forEach(el => el.remove());

        return {
            plainText:
                cleanText(clone.innerText),

            markdown:
                htmlToMarkdown(clone)
        };
    }


    // ============================================================
    // GENERIC FALLBACK
    // ============================================================

    function extractGeneric() {
        return [];
    }


    // ============================================================
    // HTML -> MARKDOWN
    // ============================================================

    function htmlToMarkdown(element) {

        if (!element) {
            return "";
        }

        const clone =
            element.cloneNode(true);

        clone.querySelectorAll(
            [
                "script",
                "style",
                "button",
                '[role="button"]',
                '[role="toolbar"]',
                ".cdk-visually-hidden",
                ".screen-reader-user-query-label"
            ].join(",")
        ).forEach(el => el.remove());

        const markdown =
            nodeToMarkdown(clone);

        return cleanMarkdown(markdown);
    }


    function nodeToMarkdown(
        node,
        context = {}
    ) {

        if (
            node.nodeType ===
            Node.TEXT_NODE
        ) {
            return node.textContent || "";
        }

        if (
            node.nodeType !==
            Node.ELEMENT_NODE
        ) {
            return "";
        }

        const tag =
            node.tagName.toLowerCase();


        // ----------------------------------------
        // PRE / CODE BLOCK
        // ----------------------------------------

        if (tag === "pre") {

            const codeElement =
                node.querySelector("code");

            const code =
                (
                    codeElement?.innerText ??
                    node.innerText ??
                    ""
                )
                    .replace(/\n+$/, "");

            const language =
                detectCodeLanguage(
                    codeElement || node
                );

            return (
                "\n\n```" +
                language +
                "\n" +
                code +
                "\n```\n\n"
            );
        }


        // ----------------------------------------
        // TABLE
        // ----------------------------------------

        if (tag === "table") {
            return tableToMarkdown(node);
        }


        // ----------------------------------------
        // LISTS
        // ----------------------------------------

        if (tag === "ul") {
            return listToMarkdown(
                node,
                false,
                context.listDepth || 0
            );
        }

        if (tag === "ol") {
            return listToMarkdown(
                node,
                true,
                context.listDepth || 0
            );
        }


        const children =
            Array
                .from(node.childNodes)
                .map(child =>
                    nodeToMarkdown(
                        child,
                        context
                    )
                )
                .join("");


        switch (tag) {

            case "h1":
                return (
                    `\n\n# ${children.trim()}\n\n`
                );

            case "h2":
                return (
                    `\n\n## ${children.trim()}\n\n`
                );

            case "h3":
                return (
                    `\n\n### ${children.trim()}\n\n`
                );

            case "h4":
                return (
                    `\n\n#### ${children.trim()}\n\n`
                );

            case "h5":
                return (
                    `\n\n##### ${children.trim()}\n\n`
                );

            case "h6":
                return (
                    `\n\n###### ${children.trim()}\n\n`
                );

            case "p":
                return (
                    `${children.trim()}\n\n`
                );

            case "strong":
            case "b": {

                const value =
                    children.trim();

                if (!value) {
                    return "";
                }

                return `**${value}**`;
            }

            case "em":
            case "i": {

                const value =
                    children.trim();

                if (!value) {
                    return "";
                }

                return `*${value}*`;
            }

            case "del":
            case "s": {

                const value =
                    children.trim();

                if (!value) {
                    return "";
                }

                return `~~${value}~~`;
            }

            case "code": {

                if (
                    node.parentElement &&
                    node.parentElement
                        .tagName
                        .toLowerCase() ===
                    "pre"
                ) {
                    return children;
                }

                const code =
                    (
                        node.textContent || ""
                    ).trim();

                if (!code) {
                    return "";
                }

                if (
                    code.includes("`")
                ) {
                    return (
                        `\`\`${code}\`\``
                    );
                }

                return `\`${code}\``;
            }

            case "br":
                return "\n";

            case "hr":
                return "\n\n---\n\n";

            case "blockquote": {

                const value =
                    cleanMarkdown(children);

                if (!value) {
                    return "";
                }

                return (
                    "\n\n" +
                    value
                        .split("\n")
                        .map(line =>
                            `> ${line}`
                        )
                        .join("\n") +
                    "\n\n"
                );
            }

            case "a": {

                const href =
                    node.getAttribute(
                        "href"
                    );

                const text =
                    children.trim();

                if (!href) {
                    return text;
                }

                if (!text) {
                    return href;
                }

                if (text === href) {
                    return href;
                }

                return (
                    `[${text}](${href})`
                );
            }

            case "img": {

                const alt =
                    node.getAttribute(
                        "alt"
                    ) || "";

                const src =
                    node.getAttribute(
                        "src"
                    ) || "";

                if (!src) {
                    return alt;
                }

                return (
                    `![${alt}](${src})`
                );
            }

            case "li":
                return children.trim();

            default:
                return children;
        }
    }


    // ============================================================
    // LIST CONVERSION
    // ============================================================

    function listToMarkdown(
        listElement,
        ordered,
        depth
    ) {

        const lines = [];

        const items =
            Array
                .from(
                    listElement.children
                )
                .filter(child =>
                    child.tagName &&
                    child.tagName
                        .toLowerCase() ===
                    "li"
                );

        items.forEach(
            (item, index) => {

                const indent =
                    "  ".repeat(depth);

                const marker =
                    ordered
                        ? `${index + 1}.`
                        : "-";

                const textParts = [];
                const nestedLists = [];

                for (
                    const child
                    of item.childNodes
                ) {

                    if (
                        child.nodeType ===
                        Node.ELEMENT_NODE
                    ) {

                        const childTag =
                            child.tagName
                                .toLowerCase();

                        if (
                            childTag === "ul" ||
                            childTag === "ol"
                        ) {

                            nestedLists.push(
                                nodeToMarkdown(
                                    child,
                                    {
                                        listDepth:
                                            depth + 1
                                    }
                                )
                            );

                            continue;
                        }
                    }

                    textParts.push(
                        nodeToMarkdown(
                            child,
                            {
                                listDepth:
                                    depth
                            }
                        )
                    );
                }

                const itemText =
                    cleanInlineMarkdown(
                        textParts.join("")
                    );

                lines.push(
                    `${indent}${marker} ${itemText}`
                );

                for (
                    const nested
                    of nestedLists
                ) {

                    if (nested.trim()) {
                        lines.push(
                            nested.trimEnd()
                        );
                    }
                }
            }
        );

        return (
            "\n" +
            lines.join("\n") +
            "\n\n"
        );
    }


    // ============================================================
    // TABLE CONVERSION
    // ============================================================

    function tableToMarkdown(table) {

        const rows =
            Array.from(
                table.querySelectorAll(
                    "tr"
                )
            );

        if (!rows.length) {
            return "";
        }

        const parsedRows =
            rows
                .map(row => {

                    return Array
                        .from(row.children)
                        .filter(cell => {

                            const tag =
                                cell.tagName
                                    .toLowerCase();

                            return (
                                tag === "th" ||
                                tag === "td"
                            );
                        })
                        .map(cell => {

                            const value =
                                cleanInlineMarkdown(
                                    Array
                                        .from(
                                            cell.childNodes
                                        )
                                        .map(child =>
                                            nodeToMarkdown(
                                                child
                                            )
                                        )
                                        .join("")
                                );

                            return (
                                escapeTableCell(
                                    value
                                )
                            );
                        });
                })
                .filter(row =>
                    row.length > 0
                );

        if (!parsedRows.length) {
            return "";
        }

        const columnCount =
            Math.max(
                ...parsedRows.map(
                    row => row.length
                )
            );

        for (
            const row
            of parsedRows
        ) {

            while (
                row.length <
                columnCount
            ) {
                row.push("");
            }
        }

        const firstRow =
            parsedRows[0];

        const lines = [];

        lines.push(
            `| ${firstRow.join(" | ")} |`
        );

        lines.push(
            `| ${firstRow
                .map(() => "---")
                .join(" | ")} |`
        );

        for (
            let i = 1;
            i < parsedRows.length;
            i++
        ) {

            lines.push(
                `| ${parsedRows[i]
                    .join(" | ")} |`
            );
        }

        return (
            "\n\n" +
            lines.join("\n") +
            "\n\n"
        );
    }


    function escapeTableCell(text) {

        return text
            .replace(/\|/g, "\\|")
            .replace(/\n+/g, "<br>")
            .trim();
    }


    // ============================================================
    // CODE LANGUAGE DETECTION
    // ============================================================

    function detectCodeLanguage(
        element
    ) {

        if (!element) {
            return "";
        }

        const classNames =
            Array.from(
                element.classList || []
            );

        for (
            const className
            of classNames
        ) {

            if (
                className.startsWith(
                    "language-"
                )
            ) {
                return className
                    .substring(
                        "language-"
                            .length
                    )
                    .trim();
            }

            if (
                className.startsWith(
                    "lang-"
                )
            ) {
                return className
                    .substring(
                        "lang-".length
                    )
                    .trim();
            }
        }

        return "";
    }


    // ============================================================
    // CLEANING
    // ============================================================

    function cleanText(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/\u00a0/g, " ")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }


    function cleanMarkdown(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/\u00a0/g, " ")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }


    function cleanInlineMarkdown(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/\u00a0/g, " ")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(
                /[ \t]*\n[ \t]*/g,
                " "
            )
            .replace(
                /[ \t]{2,}/g,
                " "
            )
            .trim();
    }
    return {provider,messages};
})();