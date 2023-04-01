import { useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';
import { MessageList } from './MessageList';
import { MessageInputForm } from './MessageInputForm';
import { ChatHeader } from './ChatHeader';

type ChatGPTAssistantProps = {
  location: string;
  shouldExpand: boolean;
  radius: number;
  setRecommendations: (recommendations: any[]) => void;
};

type MessageObject = {
  message: string;
  direction?: string;
  sender: string;
  sentTime?: string;
  structuredData?: any;
};
export type { MessageObject };

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

function ChatGPTAssistant({
  location,
  shouldExpand,
  radius,
  setRecommendations,
}: ChatGPTAssistantProps) {
  const systemMessage = {
    role: 'system',
    content: `I am an AI trained like a hotel concierge to assist with recommendations for food, drinks, sightseeing, and activities within a ${radius} radius of ${location}. Your response should have 2 parts. The first is your original natural language response, which should only include the name of the recommendations and a good short description. The second should begin with a marker "---JSON---" and provide a JSON formatted message array of this shape 
    {
      "name": recommendation name,
      "address": recommendation address,
      "coordinates": {"longitude": recommendation's longitude, "latitude": recommendation's latitude},
      "description": recommendation's description
    } for each recommendation in the first part of the response.`,
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

  // const fetchYelpRecommendations = async (
  //   location: string,
  //   categories: string,
  //   term: string
  // ) => {
  //   try {
  //     const response = await axios.get('/api/yelp', {
  //       params: { location, categories, term },
  //     });

  //     // Sort by rating and return top 5
  //     const sortedData = response.data
  //       .sort((a: any, b: any) => b.rating - a.rating)
  //       .slice(0, 5);
  //     return sortedData;
  //   } catch (error) {
  //     console.error('Error fetching recommendations:', error);
  //     return null;
  //   }
  // };

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
          // inputValue.includes('recommend') ||
          inputValue.includes('good options to eat or not eat right now')
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
      // case 'waitingForFoodType':
      //   // Define the categories (e.g., 'restaurants') based on user query
      //   const categories = 'restaurants';

      //   // Use user's input as the term (e.g., 'sushi')
      //   const term = inputValue;

      //   // Fetch recommendations from Yelp API
      //   const recommendations = await fetchYelpRecommendations(
      //     location,
      //     categories,
      //     term
      //   );

      //   // Format and display the recommendations to the user
      //   const formattedRecommendations = recommendations
      //     .map(
      //       (item: any, index: number) =>
      //         `${index + 1}. ${item.name} (${item.rating} stars)`
      //     )
      //     .join('\n');

      //   const newMessage = {
      //     message: `These are the 5 highest ranked options for what you're looking for:\n${formattedRecommendations}`,
      //     sender: 'ChatGPT',
      //   };
      //   setMessages((prevMessages) => [...prevMessages, newMessage]);
      //   setConversationState('idle');
      //   break;
      default:
        break;
    }

    setInputValue('');
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
      // Extract natural language message
      const [message, jsonStr] =
        data.choices[0].message.content.split('---JSON---');

      // Extract JSON to map recommendations as markers, if JSON string is provided
      let structuredData = null;
      if (jsonStr) {
        const jsonStrWithoutEllipsis = jsonStr.replace('...', '').trim();
        structuredData = jsonStrWithoutEllipsis
          ? JSON.parse(jsonStrWithoutEllipsis.replace(/`/g, ''))
          : null;
      }

      setMessages([
        ...chatMessages,
        {
          message: message.trim(),
          sender: 'ChatGPT',
          structuredData: structuredData,
        },
      ]);
      setTyping(false);
      setRecommendations(structuredData);
    } catch (error) {
      console.error(error);
      setTyping(false);
    }
  }

  return (
    <div
      className={`fixed bottom-3 right-4 w-2/5 z-10 text-gray-200 ${
        expanded ? 'h-96' : 'h-16'
      } bg-gray-700 p-4 rounded-lg shadow-lg`}
    >
      <ChatHeader expanded={expanded} setExpanded={setExpanded} />
      {expanded && (
        <>
          <MessageList messages={messages} />
          {typing && (
            <div className="flex flex-col justify-between h-20">
              <div className="h-6 text-left text-gray-200 pl-3 mb-1">
                ChatGPT is typing...
              </div>
            </div>
          )}
          <MessageInputForm
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}

export default ChatGPTAssistant;
