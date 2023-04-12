import * as React from "react"
import { addPropertyControls, ControlType, Frame } from "framer"

function EmailForm({ apiKey, publicationId }) {
    const [email, setEmail] = React.useState("")
    const [error, setError] = React.useState("")
    const [success, setSuccess] = React.useState(false)

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const getUtmParams = () => {
        const urlSearchParams = new URLSearchParams(window.location.search)
        return {
            utm_source: urlSearchParams.get("utm_source") || "",
            utm_medium: urlSearchParams.get("utm_medium") || "",
            utm_campaign: urlSearchParams.get("utm_campaign") || "",
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!emailPattern.test(email)) {
            setError("Invalid email address")
            return
        }

        setError("")
        const url =
            "https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions"
        const utmParams = getUtmParams()

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer ${apiKey}",
                },
                body: JSON.stringify({
                    email: email,
                    ...utmParams,
                    referring_site: window.location.href,
                    send_welcome_email: true,
                    reactivate_existing: true,
                }),
            })

            if (response.status === 200) {
                setSuccess(true)
            } else {
                const errorData = await response.json()
                console.error(`Error ${response.status}:`, errorData) // Log the error response to the console
                setError(`Error ${response.status}: ${errorData.message}`)
            }
        } catch (err) {
            console.error("An error occurred:", err) // Log the caught error to the console

            // Add more specific error messages
            if (err instanceof TypeError && err.message === "Failed to fetch") {
                setError(
                    "A network error occurred while submitting your email. Please check your internet connection and try again."
                )
            } else {
                setError(
                    "An error occurred while submitting your email. Please try again."
                )
            }
        }
    }

    const handleChange = (e) => {
        setEmail(e.target.value)
    }

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        style={{
                            flexGrow: 1,
                            marginRight: "0.5rem",
                            padding: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            background: "#1a73e8",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Subscribe
                    </button>
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && (
                    <p style={{ color: "green" }}>
                        Email submitted successfully!
                    </p>
                )}
            </form>
        </div>
    )
}

export function beehiivForm({ api, publicationID }) {
    const apiKey = { api }
    const publicationId = { publicationID }

    return (
        <Frame background="none">
            <EmailForm apiKey={apiKey} publicationId={publicationId} />
        </Frame>
    )
}

beehiivForm.defaultProps = {
    api: "",
    publicationID: "",
}

addPropertyControls(beehiivForm, {
    api: {
        type: ControlType.String,
        title: "API Key",
        description:
            "Access to the beehiiv API is a feature of our [Grow](https://www.beehiiv.com/pricing?utm_source=framer&utm_medium=widget) plan. [Click here](https://app.beehiiv.com/settings/integrations?utm_source=framer&utm_medium=widget#api-keys) to create one.",
    },
    publicationID: {
        type: ControlType.String,
        title: "Pub ID",
        description:
            "[Click here](https://app.beehiiv.com/settings/integrations#publication-id?utm_source=framer&utm_medium=widget#api-keys) to view.",
    },
})
