// =====================================
// MADUSANKA API - Frontend JavaScript
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("MADUSANKA API loaded 🚀");

    // Smooth navigation
    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });

    });

});


// =====================================
// Test API
// =====================================

async function testAPI() {

    const button = document.querySelector(".test-btn");

    if (button) {
        button.disabled = true;
        button.textContent = "Testing...";
    }

    try {

        const response = await fetch(
            "/api/example?apikey=MADUSANKA-123"
        );

        const data = await response.json();

        console.log("API Response:", data);

        if (data.status === true) {

            showAPIResult(
                "SUCCESS",
                JSON.stringify(data, null, 2)
            );

        } else {

            showAPIResult(
                "ERROR",
                JSON.stringify(data, null, 2)
            );

        }

    } catch (error) {

        console.error("API Error:", error);

        showAPIResult(
            "ERROR",
            "Unable to connect to MADUSANKA API."
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Test API";
        }

    }

}


// =====================================
// Result Popup
// =====================================

function showAPIResult(type, result) {

    const oldPopup = document.querySelector(".api-result-popup");

    if (oldPopup) {
        oldPopup.remove();
    }

    const popup = document.createElement("div");

    popup.className = "api-result-popup";

    popup.innerHTML = `
        <div class="result-box">

            <div class="result-header">

                <div>
                    <span class="result-label">
                        API RESPONSE
                    </span>

                    <h3>
                        MADUSANKA API
                    </h3>
                </div>

                <button
                    class="close-result"
                    onclick="closeAPIResult()"
                >
                    ×
                </button>

            </div>

            <div class="result-status ${type.toLowerCase()}">
                ${type}
            </div>

            <pre>${escapeHTML(result)}</pre>

            <button
                class="copy-result"
                onclick="copyAPIResult()"
            >
                Copy Response
            </button>

        </div>
    `;

    document.body.appendChild(popup);

}


// =====================================
// Close Popup
// =====================================

function closeAPIResult() {

    const popup = document.querySelector(
        ".api-result-popup"
    );

    if (popup) {
        popup.remove();
    }

}


// =====================================
// Copy API Response
// =====================================

async function copyAPIResult() {

    const result = document.querySelector(
        ".result-box pre"
    );

    if (!result) return;

    try {

        await navigator.clipboard.writeText(
            result.textContent
        );

        const button = document.querySelector(
            ".copy-result"
        );

        if (button) {

            button.textContent = "Copied ✓";

            setTimeout(() => {
                button.textContent = "Copy Response";
            }, 1500);

        }

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }

}


// =====================================
// HTML Escape
// =====================================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

  }
