let lastMessage = "";
let allChats = {};

const generateChatID = () => {
  return `_${Math.random().toString(36).substr(2, 9)}`;
};

function renderChatHistory() {
  const chatHistory = document.getElementById('chat-history');
  chatHistory.innerHTML = '';

  const groupedChats = groupChatsByDate(allChats);

  for (const date in groupedChats) {
    const chatGroup = groupedChats[date];

    // Create a date header
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header';
    dateHeader.textContent = formatChatDate(date);
    chatHistory.appendChild(dateHeader);

    // Create history items for this date
    for (const id of chatGroup) {
      const chat = allChats[id];
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      // Create a message icon (you can use any suitable emoji or icon)
      const messageIcon = document.createElement('span');
      messageIcon.className = 'message-icon';
      messageIcon.textContent = `📩`;

      // Store the entire chat history (both user input and AI responses)
      const chatHistoryContent = getChatHistoryContent(chat.messages);

      // Set the content of the history item
      historyItem.appendChild(messageIcon);
      historyItem.textContent += chatHistoryContent.userInputPreview;

      historyItem.onclick = (id => () => {
        // Display the entire chat history when clicked
        document.getElementById('chat-window').innerHTML = chatHistoryContent.fullChatHistory;
      })(id);

      chatHistory.appendChild(historyItem);
    }
  }
}

function groupChatsByDate(chats) {
  const groupedChats = {};

  for (const id in chats) {
    const chat = chats[id];
    const date = formatDateForGrouping(chat.timestamp);

    if (!groupedChats[date]) {
      groupedChats[date] = [];
    }

    groupedChats[date].push(id);
  }

  return groupedChats;
}

function formatDateForGrouping(timestamp) {
  const date = new Date(timestamp);
  return date.toDateString();
}

function formatChatDate(dateString) {
  const date = new Date(dateString);
  return date.toDateString();
}

function getChatHistoryContent(messages) {
  // Split messages by newline character to separate individual messages
  const messageLines = messages.split('\n');
  let userInput = '';
  let aiResponses = '';
  let isUserMessage = true;

  for (const message of messageLines) {
    const trimmedMessage = message.trim();
    if (trimmedMessage.startsWith('User:')) {
      userInput += `${isUserMessage ? '' : '\n'}${trimmedMessage.substring(6)}`;
      isUserMessage = false;
    } else {
      aiResponses += `${isUserMessage ? '' : '\n'}${trimmedMessage}`;
    }
  }

  // Combine user input and AI responses into the full chat history
  const fullChatHistory = `User:${userInput}\nAI:${aiResponses}`;

  // Return a preview of user input (first 50 characters)
  const userInputPreview = userInput.length > 50 ? `${userInput.substring(0, 50)}...` : userInput;

  return {
    fullChatHistory,
    userInputPreview,
  };
}

const sendMessage = async () => {
  const msg = document.querySelector("#input-field").value;
  lastMessage = msg;
  document.querySelector("#input-field").value = "";

  showLoadingIndicator();
  disableSendButton();
  scrollToLatestChat();

  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  const userAvatar = document.createElement("img");
  userAvatar.src = "./assets/user-avatar";
  userAvatar.className = "user-avatar";

  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = `User: ${msg}`;

  messageContainer.appendChild(userAvatar);
  messageContainer.appendChild(userMessage);

  // Append user message only to the chat window
  const chatWindow = document.getElementById("chat-window");
  if (chatWindow) {
    chatWindow.appendChild(messageContainer);
  }

  const chatId = generateChatID();

  allChats[chatId] = {
    messages: `\nUser: ${msg}`, // Append user's input to messages
    timestamp: Date.now()
  };

  try {
    // Call the API to have an interactive conversation
    const aiResponseMarkdown = await interactWithAI(msg);

    // Create a new chat container for the AI response
    const aiContainer = document.createElement("div");
    aiContainer.className = "message-container";

    const aiAvatar = document.createElement("img");
    aiAvatar.src = "./assets/ai-avatar";
    aiAvatar.className = "ai-avatar";
    aiContainer.appendChild(aiAvatar);

    const aiResponseDiv = document.createElement("div");
    aiResponseDiv.className = "message ai-message";

    // Convert Markdown to HTML
    const aiResponseHTML = convertMarkdownToHTML(aiResponseMarkdown);
    const aiResponseContent = aiResponseHTML;

    const aiTempContainer = document.createElement("div");
    aiTempContainer.innerHTML = aiResponseContent
    console.log(`🚀 ~ file: main.js:180 ~ sendMessage ~ aiTempContainer:`, aiTempContainer);
    console.log(`🚀 ~ file: main.js:180 ~ sendMessage ~ aiTempContainer.textContent:`, aiTempContainer.textContent);
    console.log(`🚀 ~ file: main.js:178 ~ sendMessage ~ aiResponseContent:`, aiResponseContent);
    // Use innerHTML to render HTML
    // aiResponseDiv.innerHTML = aiResponseHTML;

    aiContainer.appendChild(aiResponseDiv);

    // Append AI response to the chat window with typewriter effect
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
      chatWindow.appendChild(aiContainer);

      aiContainer.id = `ai-${Date.now()}`;
      const aiContainerElement = document.getElementById(aiContainer.id);

      if (aiContainerElement) {
        aiContainerElement.scrollIntoView({ behavior: 'smooth' });

        const txt = aiTempContainer.textContent;
        let i = 0;
        const speed = 50;

        const typeWriter = () => {
          if (i < txt.length) {
            aiResponseDiv.innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
          }
        };

        typeWriter();
      }
      renderChatHistory();
    }
  } catch (error) {
    console.error("Error communicating with AI:", error);
  }
};

const loadingIndicator = document.getElementById('loading-indicator');
const sendButton = document.getElementById('send-button');
const inputField = document.querySelector("#input-field");

document.querySelector("#input-field").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  } else if (event.key === "ArrowUp") {
    document.querySelector("#input-field").value = lastMessage;
  }
});

document.querySelector("#send-button").addEventListener("click", sendMessage);

const resetChat = () => {
  lastMessage = "";
  allChats = {};
  document.querySelector("#chat-window").innerHTML = '';
  renderChatHistory();
};

document.querySelector('#regenerate-button').addEventListener('click', () => {
    sendMessage();
});

document.querySelector('#share-button').addEventListener('click', () => {
  alert('Feature to share chat history coming soon...');
});

document.querySelector('#reset-chat-button').addEventListener('click', resetChat);

document.querySelector('#new-chat-button').addEventListener('click', () => {
  document.querySelector("#chat-window").innerHTML = '';
});

document.querySelector('#clear-context-button').addEventListener('click', resetChat);

document.querySelector("#down-arrow-button").addEventListener("click", scrollToLatestChat);

inputField.addEventListener('input', () => {
  if (inputField.value.trim().length > 0) {
    enableSendButton();
  } else {
    disableSendButton();
  }
});

function showLoadingIndicator() {
  loadingIndicator.style.display = 'block';
}

function hideLoadingIndicator() {
  loadingIndicator.style.display = 'none';
}

function enableSendButton() {
  sendButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

function scrollToLatestChat() {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to continuously scroll to the latest chat message
function continuouslyScrollToLatestChat() {
  scrollToLatestChat();
  requestAnimationFrame(continuouslyScrollToLatestChat);
}

// Start continuously scrolling to the latest chat message
continuouslyScrollToLatestChat();

// Function to interact with the AI
async function interactWithAI(userInput) {
    const response = await fetch('http://10.6.0.3:8087/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        prompt: `${userInput}. Respond in markdown.`
    }),
  });
  if (response.ok) {
    const data = await response.json();
    hideLoadingIndicator();
    if (inputField.value.trim().length > 0 && loadingIndicator.style.display === 'none') {
      enableSendButton();
    }
    console.log(`🚀 ~ file: main.js:285 ~ interactWithAI ~ data:`, data);
    return data.answer;
  } else {
    hideLoadingIndicator();
    if (inputField.value.trim().length > 0 && loadingIndicator.style.display === 'none') {
      enableSendButton();
    }
    throw new Error('Failed to communicate with AI');
  }
}

function convertMarkdownToHTML(markdown) {
  // Use marked.js to convert Markdown to HTML
  return marked.parse(markdown);
}

// Call renderChatHistory to initialize chat history
renderChatHistory();
