import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  portalType: 'student' | 'faculty';
  userName?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ portalType, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      text: `Welcome to the ${portalType === 'student' ? 'Student' : 'Faculty'} Portal! How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [portalType]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Here we'd normally make an API call to your backend service
      // which securely handles the OpenAI API communication
      // Example: const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: inputValue, portalType }) });
      
      // For now, we'll simulate a response based on the portal type and message content
      setTimeout(() => {
        const botResponse = generateBotResponse(inputValue, portalType);
        setMessages(prev => [...prev, {
          text: botResponse,
          isUser: false,
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple response generation based on keywords
  const generateBotResponse = (message: string, portal: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Common responses for both portals
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return `Hello${userName ? ' ' + userName : ''}! How can I assist you today?`;
    }
    if (lowerMsg.includes('thank')) {
      return "You're welcome! Is there anything else you'd like help with?";
    }
    if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye')) {
      return "Goodbye! Feel free to come back if you have more questions.";
    }
    
    // Student portal specific responses
    if (portal === 'student') {
      if (lowerMsg.includes('assignment') || lowerMsg.includes('homework')) {
        return "You can find all your assignments in the Academic Schedule section. You can filter by course to see specific assignments.";
      }
      if (lowerMsg.includes('exam') || lowerMsg.includes('test')) {
        return "Exam schedules are available in the Academic Schedule section. Make sure to check regularly for any updates!";
      }
      if (lowerMsg.includes('grade') || lowerMsg.includes('score') || lowerMsg.includes('marks')) {
        return "Your grades can be viewed in the Performance section. You can see individual grades for each assignment and your overall course average.";
      }
      if (lowerMsg.includes('enroll') || lowerMsg.includes('register') || lowerMsg.includes('sign up')) {
        return "To enroll in courses, go to the Course Registration section and select from the available courses.";
      }
    }
    
    // Faculty portal specific responses
    if (portal === 'faculty') {
      if (lowerMsg.includes('student')) {
        return "You can manage your students in the Students section. From there, you can view their profiles, grades, and attendance records.";
      }
      if (lowerMsg.includes('grade') || lowerMsg.includes('score') || lowerMsg.includes('marks')) {
        return "You can manage and update grades in the Grades section. Select the course first, then you'll see a list of students where you can update their scores.";
      }
      if (lowerMsg.includes('course')) {
        return "Course management is available in the Courses section. You can view enrolled students, course analytics, and manage enrollments there.";
      }
      if (lowerMsg.includes('schedule') || lowerMsg.includes('timetable')) {
        return "You can view and manage your class schedule in the Class Schedule section.";
      }
      if (lowerMsg.includes('resource') || lowerMsg.includes('allocation')) {
        return "Resource allocation can be managed in the Resource Allocation section. You can request and manage classroom resources there.";
      }
      if (lowerMsg.includes('attendance')) {
        return "You can record and manage student attendance in the Students section under the Attendance tab.";
      }
    }
    
    // Default response
    return `I'm here to help with your ${portal === 'student' ? 'learning' : 'teaching'} needs. Could you please be more specific about what you need assistance with?`;
  };

  // Format timestamp to readable time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className={`rounded-full h-12 w-12 flex items-center justify-center shadow-lg ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[30rem] bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col">
          {/* Chat header */}
          <div className="p-4 bg-gray-900 rounded-t-lg border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">
              {portalType === 'student' ? 'Student' : 'Faculty'} Support
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleChat} 
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-800"
            >
              <X size={16} className="text-gray-400" />
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.isUser ? 'flex flex-row-reverse' : 'flex'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex mb-3">
                <div className="bg-gray-700 text-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-700 flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              className="flex-grow bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-4 py-2 h-full"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 