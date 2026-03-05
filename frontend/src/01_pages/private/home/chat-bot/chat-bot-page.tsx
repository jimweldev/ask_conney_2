import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaArrowUp, FaRobot, FaUser } from 'react-icons/fa6';
import z from 'zod';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { mainInstance } from '@/07_instances/main-instance';
import MarkdownRenderer from '@/components/code/markdown-renderer';
import SystemDropdownSelect from '@/components/react-select/system-dropdown-select';
import PageHeader from '@/components/typography/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

// Types for conversation messages matching the payload format
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Form validation schema
const FormSchema = z.object({
  question: z.string().min(1, { message: 'Required' }),
});

// Example questions
const EXAMPLE_QUESTIONS = [
  'What is No Call No Show?',
  'How do I file a Paid-Time-Off?',
  'What is Connext?',
];

type FailedQuery = {
  question: string;
  timestamp: number;
};

const ChatBotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [locations, setLocations] = useState<ReactSelectOption[]>([]);
  const [positions, setPositions] = useState<ReactSelectOption[]>([]);
  const [websites, setWebsites] = useState<ReactSelectOption[]>([]);
  const [ticketDraft, setTicketDraft] = useState(null);
  const [conversationState, setConversationState] = useState(null);
  const [failedQuery, setFailedQuery] = useState<FailedQuery | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isLoadingQuery]);

  const executeQuery = (question: string) => {
    setIsLoadingQuery(true);
    setFailedQuery(null);

    // Prepare payload with conversation history
    const payload = {
      question: question,
      history: messages, // Send the entire conversation history
      ticket_data: ticketDraft,
      state: conversationState,
      locations: locations.map(l => l.label),
      positions: positions.map(p => p.label),
      websites: websites.map(w => w.label),
    };

    mainInstance
      .post(`/rag/query`, payload)
      .then(response => {
        if (response.data.state) {
          setConversationState(response.data.state);
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.data.ticket_data) {
          setTicketDraft(response.data.ticket_data);
        }

        if (
          response.data.type === 'create' ||
          response.data.type === 'cancel'
        ) {
          setConversationState(null);
        }
      })
      .catch(error => {
        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content:
            error.response?.data?.error ||
            'An error occurred. Please try again.',
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Store failed query for retry
        setFailedQuery({
          question: question,
          timestamp: Date.now(),
        });
      })
      .finally(() => {
        setIsLoadingQuery(false);
      });
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // Add user message to chat immediately
    const userMessage: Message = { role: 'user', content: data.question };
    setMessages(prev => [...prev, userMessage]);

    executeQuery(data.question);

    form.reset({
      question: '',
    });

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
    }
  };

  const handleRetry = () => {
    if (failedQuery) {
      // Remove the last error message
      setMessages(prev => prev.slice(0, -1));

      // Retry the query
      executeQuery(failedQuery.question);
    }
  };

  const handleExampleClick = (question: string) => {
    form.setValue('question', question);
    // Auto-adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleClearAll = () => {
    // Reset all states
    setMessages([]);
    setTicketDraft(null);
    setConversationState(null);
    setFailedQuery(null);

    // Reset form
    form.reset({
      question: '',
    });

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeader className="mb-3">Ask Conney</PageHeader>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d))}
            autoComplete="off"
            className="flex h-full flex-col"
          >
            <CardHeader className="flex justify-between border-b">
              <div className="flex items-center gap-2">
                <FaRobot className="bg-primary size-8 shrink-0 rounded-full p-1.5 text-white" />
                <h4 className="font-semibold">Ask Conney</h4>
              </div>

              <div className="flex items-center gap-2">
                <SystemDropdownSelect
                  isMulti
                  module="Company"
                  type="Location"
                  placeholder="Select locations"
                  onChange={setLocations}
                  value={locations}
                />
                <SystemDropdownSelect
                  isMulti
                  module="Company"
                  type="Position"
                  placeholder="Select positions"
                  onChange={setPositions}
                  value={positions}
                />
                <SystemDropdownSelect
                  isMulti
                  module="Company"
                  type="Website"
                  placeholder="Select websites"
                  onChange={setWebsites}
                  value={websites}
                />
              </div>
            </CardHeader>

            <CardBody className="flex flex-1 flex-col overflow-y-auto p-0">
              {/* Conversations area */}
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                  <div>
                    <FaRobot className="mx-auto mb-2 size-12 text-gray-400" />
                    <p className="mb-6">
                      Ask me anything about company policies, benefits, or
                      procedures!
                    </p>

                    {/* Example questions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-400">
                        Try asking:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {EXAMPLE_QUESTIONS.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleExampleClick(question)}
                            type="button"
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-layout space-y-4 pb-0">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary text-white">
                            <FaRobot className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div>
                          <MarkdownRenderer text={message.content} />

                          {/* Show retry button if this is the last message and it's an error */}
                          {index === messages.length - 1 &&
                            message.role === 'assistant' &&
                            failedQuery &&
                            !isLoadingQuery && (
                              <div className="mt-2 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={handleRetry}
                                  type="button"
                                >
                                  Retry
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-gray-500 text-white">
                            <FaUser className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoadingQuery && (
                    <div className="flex items-start gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary text-white">
                          <FaRobot className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted max-w-[80%] rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <div className="size-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]"></div>
                          <div className="size-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]"></div>
                          <div className="size-2 animate-bounce rounded-full bg-gray-500"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div className="mt-layout" ref={messagesEndRef} />
                </div>
              )}
            </CardBody>
            <CardFooter className="border-t p-4">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          ref={textareaRef}
                          placeholder="Type your question here..."
                          className="min-h-20 resize-none overflow-y-auto"
                          style={{ maxHeight: '200px' }}
                          onInput={adjustTextareaHeight}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (field.value && !isLoadingQuery) {
                                form.handleSubmit(d => onSubmit(d))();
                                // Reset height after submit
                                setTimeout(() => {
                                  if (textareaRef.current) {
                                    textareaRef.current.style.height = '80px';
                                  }
                                }, 0);
                              }
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="mt-2 flex justify-between gap-2">
                  <div>
                    {/* Clear button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearAll}
                      title="Clear conversation"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button
                      type="submit"
                      className="rounded-full"
                      size="icon"
                      disabled={isLoadingQuery || !form.watch('question')}
                    >
                      <FaArrowUp />
                    </Button>
                  </div>
                </div>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ChatBotPage;
