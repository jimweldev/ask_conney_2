import { useCallback, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  FaArrowUp,
  FaMicrophone,
  FaMicrophoneSlash,
  FaRobot,
  FaStop,
  FaUser,
} from 'react-icons/fa6';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { toast } from 'sonner';
import z from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import MarkdownRenderer from '@/components/code/markdown-renderer';
import PageHeader from '@/components/typography/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
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
  'Who do I file a ticket?',
];

type MicrophoneStatus =
  | 'granted'
  | 'denied'
  | 'not-found'
  | 'unknown'
  | 'unsupported';

const ChatBotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] =
    useState<MicrophoneStatus>('unknown');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: '',
    },
  });

  // Check if speech recognition is supported
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setMicrophoneStatus('unsupported');
      toast.warning(
        'Speech recognition is not supported in your browser. You can still type your questions.',
      );
    }
  }, [browserSupportsSpeechRecognition]);

  // Update form value when transcript changes
  useEffect(() => {
    if (transcript) {
      form.setValue('question', transcript);
      // Auto-adjust textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }
  }, [transcript, form]);

  // Check microphone permission on mount
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      checkMicrophoneAvailability();
    }
  }, [browserSupportsSpeechRecognition]);

  const checkMicrophoneAvailability = async () => {
    try {
      // First check if there are any audio devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophone = devices.some(
        device => device.kind === 'audioinput',
      );

      if (!hasMicrophone) {
        setMicrophoneStatus('not-found');
        return;
      }

      // Check permission status
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });

      setMicrophoneStatus(permissionStatus.state as MicrophoneStatus);

      // Listen for permission changes
      permissionStatus.onchange = () => {
        setMicrophoneStatus(permissionStatus.state as MicrophoneStatus);
      };
    } catch (_error) {
      // Permissions API not supported, try a different approach
      try {
        // Try to get permission without prompting
        const stream = await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .catch(() => null);

        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setMicrophoneStatus('granted');
        } else {
          setMicrophoneStatus('denied');
        }
      } catch {
        setMicrophoneStatus('unknown');
      }
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      // This will trigger the browser's permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks immediately since we don't need the stream
      stream.getTracks().forEach(track => track.stop());

      setMicrophoneStatus('granted');
      toast.success('Microphone access granted!');
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setMicrophoneStatus('denied');
          toast.error(
            'Microphone access denied. Please allow microphone access in your browser settings.',
          );
        } else if (error.name === 'NotFoundError') {
          setMicrophoneStatus('not-found');
          toast.error(
            'No microphone found. Please connect a microphone and try again.',
          );
        } else {
          setMicrophoneStatus('unknown');
          toast.error(
            'Could not access microphone. Please check your device settings.',
          );
        }
      }
      return false;
    }
  };

  const toggleListening = useCallback(async () => {
    if (listening) {
      SpeechRecognition.stopListening();
      toast.info('Voice input stopped');
      return;
    }

    // Handle different microphone statuses
    if (microphoneStatus === 'not-found') {
      toast.error(
        'No microphone detected. Please connect a microphone and try again.',
      );
      return;
    }

    if (microphoneStatus === 'denied') {
      toast.error(
        'Microphone access is blocked. Please enable it in your browser settings.',
      );
      return;
    }

    if (microphoneStatus === 'unsupported') {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    // If status is unknown or not granted, request permission
    if (microphoneStatus !== 'granted') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      resetTranscript();
      await SpeechRecognition.startListening({
        continuous: true,
        language: 'en-US',
        interimResults: true,
      });
      toast.info('Listening... Speak your question');
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Failed to start speech recognition. Please try again.');
    }
  }, [listening, microphoneStatus, resetTranscript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isLoadingQuery]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingQuery(true);

    // Add user message to chat immediately
    const userMessage: Message = { role: 'user', content: data.question };
    setMessages(prev => [...prev, userMessage]);

    // Prepare payload with conversation history
    const payload = {
      question: data.question,
      history: messages, // Send the entire conversation history
    };

    form.reset({
      question: '',
    });

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
    }

    mainInstance
      .post(`/rag/query`, payload)
      .then(response => {
        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
        };
        setMessages(prev => [...prev, assistantMessage]);
      })
      .catch(_error => {
        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content: 'Oops! Something went wrong. Please try again.',
        };
        setMessages(prev => [...prev, assistantMessage]);
      })
      .finally(() => {
        setIsLoadingQuery(false);
      });
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

  const getMicrophoneButtonProps = () => {
    if (
      microphoneStatus === 'not-found' ||
      microphoneStatus === 'unsupported'
    ) {
      return {
        disabled: true,
        title: 'No microphone detected',
        icon: <FaMicrophoneSlash />,
        variant: 'ghost' as const,
      };
    }
    if (microphoneStatus === 'denied') {
      return {
        disabled: false,
        title: 'Microphone access blocked - click to request',
        icon: listening ? <FaStop /> : <FaMicrophone />,
        variant: listening ? 'default' : ('ghost' as const),
      };
    }
    return {
      disabled: false,
      title: listening ? 'Stop listening' : 'Start voice input',
      icon: listening ? <FaStop /> : <FaMicrophone />,
      variant: listening ? 'default' : ('ghost' as const),
    };
  };

  const getMicrophoneStatusMessage = () => {
    switch (microphoneStatus) {
      case 'not-found':
        return 'No microphone detected. Please connect a microphone to use voice input.';
      case 'denied':
        return 'Microphone access blocked. Click the microphone button to request permission.';
      case 'unsupported':
        return 'Speech recognition is not supported in your browser.';
      default:
        return null;
    }
  };

  const statusMessage = getMicrophoneStatusMessage();

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
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <FaRobot className="bg-primary size-8 shrink-0 rounded-full p-1.5 text-white" />
                <h4 className="font-semibold">Ask Conney</h4>
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
                          placeholder="Type your question here or click the microphone to speak..."
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-2 flex justify-between gap-2">
                  <div>
                    {/* Microphone status message */}
                    {/* {statusMessage && (
                      <div className="mt-2 text-sm text-amber-500">
                        <span>{statusMessage}</span>
                      </div>
                    )} */}

                    {/* Listening indicator */}
                    {listening && (
                      <div className="mt-2 flex animate-pulse items-center gap-2 text-sm text-red-500">
                        <div className="size-2 rounded-full bg-red-500"></div>
                        <span>Listening... Speak your question</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex gap-2">
                    {browserSupportsSpeechRecognition && (
                      <Button
                        className={`rounded-full ${
                          listening ? 'bg-red-500 hover:bg-red-600' : ''
                        } ${microphoneStatus === 'not-found' ? 'cursor-not-allowed opacity-50' : ''}`}
                        variant={listening ? 'success' : 'ghost'}
                        size="icon"
                        type="button"
                        onClick={toggleListening}
                        disabled={getMicrophoneButtonProps().disabled}
                        title={getMicrophoneButtonProps().title}
                      >
                        {getMicrophoneButtonProps().icon}
                      </Button>
                    )}
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
