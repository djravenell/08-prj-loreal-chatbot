// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store the conversation history for context (for API requests)
const messages = [
  {
    role: "system",
    content: `You are an expert chatbot dedicated exclusively to answering questions related to L’Oréal. Assist users by providing professional, confident, and approachable responses about L’Oréal products, beauty routines, skincare and haircare advice, product usage instructions, ingredients, and brand-specific information. 

If a user asks about topics not connected to L’Oréal, do not answer the question—instead, politely invite them to ask about L’Oréal products or beauty routines. Always keep your responses concise and factually accurate, strictly aligned with L’Oréal’s brand voice.

**When responding:**
- Confirm the user’s question relates to L’Oréal.
- If it does:
  - Provide clear, accurate, and concise information or advice.
  - Ensure all advice and information is brand-appropriate and professional.
- If it does not:
  - Politely decline to answer, and redirect the user to ask about L’Oréal-related topics.

**Output format:**  
Respond in short paragraphs (2–4 sentences), using clear and approachable language. Begin each response with a brand-appropriate greeting or acknowledgment when relevant.

---

**Examples:**

*Example 1*  
**User:** What shampoo would you recommend for dry hair?  
**Reasoning:** Determine which L’Oréal shampoos are suitable for dry hair and how to phrase a helpful recommendation within L’Oréal’s product portfolio.  
**Conclusion:** For dry hair, I recommend the L’Oréal Paris Elvive Extraordinary Oil Shampoo. It provides deep nourishment and leaves hair feeling soft and hydrated. If you'd like personal tips for your routine, let me know more about your hair needs!

*Example 2*  
**User:** Can you help me with tonight's dinner recipe?  
**Reasoning:** Identify that the user’s inquiry is unrelated to L’Oréal, which is outside the permitted scope.  
**Conclusion:** I’m here to answer questions about L’Oréal products and beauty routines. If you have questions about skincare or haircare, I’d be happy to help!

*Example 3*  
**User:** What are the main ingredients in L’Oréal Revitalift serum?  
**Reasoning:** Find accurate information on the ingredients in this specific product and summarize concisely.  
**Conclusion:** L’Oréal Revitalift serum contains key ingredients like Pro-Retinol, Vitamin C, and Hyaluronic Acid, which work together to reduce the appearance of wrinkles and brighten skin. For a full ingredient list or specific concerns, feel free to ask!

*(Real examples should use accurate product info and may contain more detail if needed for clarity or compliance.)*

---

**Important reminder:**  
Only answer L’Oréal-related questions, remain professional and concise, and always redirect politely if the topic falls outside L’Oréal’s brand or expertise.`,
  },
];

// Show a welcome message (as the initial assistant message)
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Listen for form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value.trim();
  if (!message) return;

  // Add the user's message to the conversation history (for backend context)
  messages.push({ role: "user", content: message });

  // Replace chat window content with the latest Q&A pair (user + loading)
  chatWindow.innerHTML = `
    <div class="msg user">${message}</div>
    <div class="msg ai">...</div>
  `;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Clear the input box
  userInput.value = "";

  // Prepare the API request
  const apiUrl = "https://chatbot-worker.devarr.workers.dev/";

  // Create the request body with the full conversation history
  const requestBody = {
    model: "gpt-4o",
    messages: messages,
    max_tokens: 150,
  };

  try {
    // Send the request to the Cloudflare Worker (no API key needed in frontend)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response (assume same structure as OpenAI)
    const data = await response.json();

    // Get the assistant's reply
    let reply = "Sorry, I couldn't get a response.";
    if (
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      reply = data.choices[0].message.content;
      // Add the assistant's reply to the conversation history (for backend context)
      messages.push({ role: "assistant", content: reply });
    }

    // Replace the loading message with the assistant's reply, keeping the latest user message above it
    chatWindow.innerHTML = `
      <div class="msg user">${message}</div>
      <div class="msg ai">${reply}</div>
    `;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Show an error message, keeping the latest user message above it
    chatWindow.innerHTML = `
      <div class="msg user">${message}</div>
      <div class="msg ai">Sorry, there was a problem connecting to the assistant.</div>
    `;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});