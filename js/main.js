let lastMessage = "";
let allChats = {};

const generateChatID = () => {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

const renderChatHistory = () => {
  const chatHistory = document.querySelector("#chat-history");
  chatHistory.innerHTML = "";
  
  for (let id in allChats) {
    let historyItem = document.createElement("div");
    historyItem.textContent = `Chat from: ${new Date(allChats[id].timestamp).toDateString()}`;
    historyItem.className = "history-item";
    historyItem.onclick = () => {
      document.querySelector("#chat-window").innerHTML = allChats[id].messages;
    };
    chatHistory.appendChild(historyItem);
  }
}

const sendMessage = () => {
  const msg = document.querySelector("#input-field").value;
  lastMessage = msg;
  document.querySelector("#input-field").value = "";

  let messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  let userAvatar = document.createElement("img");
  userAvatar.src = "./assets/user-avatar";
  userAvatar.className = "user-avatar";

  let userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = msg;

  messageContainer.appendChild(userAvatar);
  messageContainer.appendChild(userMessage);
  
  let chatId = generateChatID();
  
  allChats[chatId] = {
    messages: document.querySelector("#chat-window").innerHTML,
    timestamp: Date.now()
  };

  messageContainer.id = `msg-${allChats[chatId].timestamp}`;
  document.getElementById("chat-window").appendChild(messageContainer);

  setTimeout(() => {
    let aiContainer = document.createElement("div");
    aiContainer.className = "message-container";

    let aiAvatar = document.createElement("img");
    aiAvatar.src = "./assets/ai-avatar";
    aiAvatar.className = "ai-avatar";
    aiContainer.appendChild(aiAvatar);

    let aiResponse = document.createElement("div");
    aiResponse.className = "message ai-message";

    aiContainer.appendChild(aiResponse);
    document.querySelector("#chat-window").appendChild(aiContainer);

    aiContainer.id = `ai-${Date.now()}`; 
    document.getElementById(aiContainer.id).scrollIntoView({ behavior: 'smooth' });

    let txt = `Response to '${msg}'`;
    let i = 0;
    let speed = 50;

    const typeWriter = () => {
      if (i < txt.length) {
        aiResponse.textContent += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    };
    typeWriter();
  }, 1000);
  
  renderChatHistory();
  
  const msgElem = document.getElementById(messageContainer.id);
  msgElem.scrollIntoView({ behavior: "smooth" });
}

document.querySelector("#input-field")
  .addEventListener("keyup", (event) => {
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
}

document.querySelector('#regenerate-button').addEventListener('click', () => {
  document.querySelector("#chat-window").innerHTML = '<div>Regenerated Message from AI!</div>';
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
    if(latestMsg) 
      latestMsg.scrollIntoView({behavior: 'smooth'}); 
  }
  