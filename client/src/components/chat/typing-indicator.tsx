export default function TypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="typing-indicator">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-medium-purple rounded-2xl rounded-bl-md p-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-light-purple rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-light-purple rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-light-purple rounded-full animate-bounce"></div>
            </div>
            <span className="text-light-purple text-xs ml-2">Маріанна печатає...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
