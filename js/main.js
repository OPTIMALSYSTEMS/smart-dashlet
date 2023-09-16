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

// Function to extract the first 50 characters of the user's input from chat messages
function getUserFirstInput(messages) {
  // Split messages by newline character to separate individual messages
  const messageLines = messages.split('\n');

  // Find the first user message (not AI)
  for (const message of messageLines.reverse()) {
    const trimmedMessage = message.trim();
    if (trimmedMessage.startsWith('User:')) {
      // Extract the user's input (assuming it starts with "User:")
      const userInput = trimmedMessage.substring(6);
      // Return the first 50 characters or the entire input if it's shorter
      return userInput.length > 50 ? `${userInput.substring(0, 50)}...` : userInput;
    }
  }
  // If no user message is found, return a default message
  return 'No user input found';
}

const sendMessage = async () => {
  const msg = document.querySelector("#input-field").value;
  lastMessage = msg;
  document.querySelector("#input-field").value = "";

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
    // Call the OpenAI API to have an interactive conversation
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

    // Use innerHTML to render HTML
    aiResponseDiv.innerHTML = aiResponseHTML;

    aiContainer.appendChild(aiResponseDiv);

    // Append AI response to the chat window with typewriter effect
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
      chatWindow.appendChild(aiContainer);

      aiContainer.id = `ai-${Date.now()}`;
      const aiContainerElement = document.getElementById(aiContainer.id);

      if (aiContainerElement) {
        aiContainerElement.scrollIntoView({ behavior: 'smooth' });

        // Implement the typewriter effect
        const txt = aiResponseMarkdown;
        let i = 0;
        const speed = 50;

        const typeWriter = () => {
          if (i < txt.length) {
            aiResponseDiv.innerHTML += txt.charAt(i);
            i++;
            // setTimeout(typeWriter, speed);
          }
        };

        typeWriter();
      }
    }
  } catch (error) {
    console.error("Error communicating with AI:", error);
  }
};

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

function scrollToLatestChat() {
  let chatWindow = document.querySelector("#chat-window");
  let latestMsg = chatWindow.lastElementChild;
  if (latestMsg)
    latestMsg.scrollIntoView({ behavior: 'smooth' });
}


// Function to interact with the AI using OpenAI API
async function interactWithAI(userInput) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Ensure code is written in Markdown. Do not mention Markdown in your response.' },
        { role: 'user', content: userInput },
      ],
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`🚀 ~ file: main.js:299 ~ interactWithAI ~ data.choices[0].message.content:`, data.choices[0].message.content);

    return data.choices[0].message.content.trim();
  } else {
    throw new Error('Failed to communicate with AI');
  }
}

function convertMarkdownToHTML(markdown) {
  // Use marked.js to convert Markdown to HTML
  return marked.parse(markdown);
}

// Call renderChatHistory to initialize chat history
renderChatHistory();
