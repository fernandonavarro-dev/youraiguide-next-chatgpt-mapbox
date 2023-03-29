import { useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ExpandCollapseToggle } from './ExpandCollapseToggle';
import axios from 'axios';

type ChatGPTAssistantProps = {
  location: string;
  shouldExpand: boolean;
};

type MessageObject = {
  message: string;
  direction?: string;
  sender: string;
  sentTime?: string;
};

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

function ChatGPTAssistant({ location, shouldExpand }: ChatGPTAssistantProps) {
  const systemMessage = {
    role: 'system',
    content: `I am an AI trained like a hotel concierge to assist with recommendations for food, drinks, sightseeing, and activities within a 5-mile radius of ${location}.`,
  };
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<MessageObject[]>([
    {
      message:
        "Hello, I'm ChatGPT Location Assistant! Let me know if you need help with some recommendations near you!",
      sentTime: 'just now',
      sender: 'ChatGPT',
    },
  ]);
  const [conversationState, setConversationState] = useState<
    'idle' | 'waitingForFoodType'
  >('idle');

  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (location && shouldExpand) {
      const formattedLocation = location.replace(/[\[\]']+/g, '');
      setMessages([
        {
          message: `Hello! I see you're at ${formattedLocation}. I can provide recommendations for food, drinks, sightseeing, and activities nearby. `,
          sentTime: 'just now',
          sender: 'ChatGPT',
        },
      ]);
      setExpanded(true);
    }
  }, [location, shouldExpand]);

  const fetchYelpRecommendations = async (
    location: string,
    categories: string,
    term: string
  ) => {
    try {
      const response = await axios.get('/api/yelp', {
        params: { location, categories, term },
      });

      // Sort by rating and return top 5
      const sortedData = response.data
        .sort((a: any, b: any) => b.rating - a.rating)
        .slice(0, 5);
      return sortedData;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user's message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: inputValue, sender: 'user' },
    ]);

    // Check the state of the conversation and take action accordingly
    switch (conversationState) {
      case 'idle':
        // Check if the user's input message is a query for recommendations
        if (
          inputValue.includes('recommend') ||
          inputValue.includes('good options to eat')
        ) {
          // Ask the user for the type of food
          const newMessage = {
            message: 'What type of food are you looking for?',
            sender: 'ChatGPT',
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          setConversationState('waitingForFoodType');
        } else {
          // Process the message using ChatGPT
          await handleSend(inputValue);
        }
        break;
      case 'waitingForFoodType':
        // Define the categories (e.g., 'restaurants') based on user query
        const categories = 'restaurants';

        // Use user's input as the term (e.g., 'sushi')
        const term = inputValue;

        // Fetch recommendations from Yelp API
        const recommendations = await fetchYelpRecommendations(
          location,
          categories,
          term
        );

        // Format and display the recommendations to the user
        const formattedRecommendations = recommendations
          .map(
            (item: any, index: number) =>
              `${index + 1}. ${item.name} (${item.rating} stars)`
          )
          .join('\n');

        const newMessage = {
          message: `These are the 5 highest ranked options for what you're looking for:\n${formattedRecommendations}`,
          sender: 'ChatGPT',
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversationState('idle');
        break;
      default:
        break;
    }

    setInputValue('');
  };

  // Add a function to toggle the expand/collapse state
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleSend = async (message: string) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages: MessageObject[]) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject: MessageObject) => {
      let role = '';
      if (messageObject.sender === 'ChatGPT') {
        role = 'assistant';
      } else {
        role = 'user';
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiRequestBody),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data from the ChatGPT API');
      }

      const data = await response.json();
      console.log(data);
      setMessages([
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: 'ChatGPT',
        },
      ]);
      setTyping(false);
    } catch (error) {
      console.error(error);
      setTyping(false);
    }
  }

  function formatAssistantMessage(message: string) {
    const parts = message.split(/("[^"]+")/);
    return parts.map((part, index) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <>
            <br key={`before-${index}`} />
            <p key={index} className="mb-0 mt-2 font-bold">
              {part.slice(1, -1)}
            </p>
            <br key={`after-${index}`} />
          </>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }

  return (
    <div
      className={`fixed bottom-3 right-4 w-2/5 z-10 text-gray-200 ${
        expanded ? 'h-96' : 'h-16'
      } bg-gray-700 p-4 rounded-lg shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold mb-4">ChatGPT Location Guide</div>
        <ExpandCollapseToggle
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)}
        />
      </div>

      {expanded && (
        <>
          <div className="h-64 overflow-y-auto mb-4 p-1">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}
              >
                <span
                  className={
                    message.sender === 'user'
                      ? 'text-blue-400'
                      : 'text-green-400'
                  }
                >
                  {message.sender === 'user' ? 'You: ' : 'Assistant: '}
                </span>
                {message.sender === 'ChatGPT'
                  ? formatAssistantMessage(message.message)
                  : message.message}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              className="flex-grow bg-gray-500 text-gray-200 rounded-l-lg p-2"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 p-2 rounded-r-lg">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatGPTAssistant;
