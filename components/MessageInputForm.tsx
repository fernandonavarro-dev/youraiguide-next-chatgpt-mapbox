// MessageInputForm.tsx
import React from 'react';

type MessageInputFormProps = {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const MessageInputForm: React.FC<MessageInputFormProps> = ({
  inputValue,
  setInputValue,
  handleSubmit,
}) => {
  return (
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
  );
};
