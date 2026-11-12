import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  PracticeDefinition,
  EmotionType,
  StudentProfile,
  AccessibilitySettings,
} from '../types';
import { pedagogicalEngine } from '../services/pedagogicalEngine';
import { speechService } from '../services/speechService';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  HelpCircle,
} from 'lucide-react';

interface VirtualMentorChatProps {
  practice: PracticeDefinition;
  emotion: EmotionType;
  studentProfile: StudentProfile;
  accessibilitySettings: AccessibilitySettings;
  currentStepTitle: string;
  variablesState: Record<string, any>;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const VirtualMentorChat: React.FC<VirtualMentorChatProps> = ({
  practice,
  emotion,
  studentProfile,
  accessibilitySettings,
  currentStepTitle,
  variablesState,
  isOpen,
  onToggleOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting when practice or emotion changes
  useEffect(() => {
    const greeting = pedagogicalEngine.getInitialGreeting(
      studentProfile,
      emotion,
      accessibilitySettings.simplifiedMode
    );

    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'mentor',
        text: greeting,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [practice.id, emotion, accessibilitySettings.simplifiedMode]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await pedagogicalEngine.queryVirtualMentor({
        message: text,
        practice,
        emotion,
        studentProfile,
        simplifiedMode: accessibilitySettings.simplifiedMode,
        currentStepTitle,
        variablesState,
        chatHistory: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
      });

      const mentorMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: 'mentor',
        text: reply,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mentorMsg]);

      // If voice is enabled, automatically speak the mentor's answer
      if (accessibilitySettings.voiceEnabled) {
        handlePlayMessageVoice(mentorMsg.id, reply);
      }
    } catch (err) {
      console.error('Error fetching mentor reply:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dictate voice to input
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert('Tu navegador no cuenta con soporte nativo de reconocimiento de voz.');
      return;
    }

    setIsRecording(true);
    const recognition = speechService.createRecognition(
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognition) {
      try {
        recognition.start();
      } catch {
        setIsRecording(false);
      }
    }
  };

  // Play audio for a specific message
  const handlePlayMessageVoice = (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      speechService.stopSpeaking();
      setPlayingMessageId(null);
      return;
    }

    speechService.speakText(text, {
      onStart: () => setPlayingMessageId(msgId),
      onEnd: () => setPlayingMessageId(null),
      onError: () => setPlayingMessageId(null),
    });
  };

  const quickQuestions = accessibilitySettings.simplifiedMode
    ? [
        '¿Qué hago en este paso?',
        '¿Qué significa este color?',
        'Dame una pista sencilla',
      ]
    : [
        '¿Qué hago en este paso?',
        '¿Cómo estructuro mi hipótesis?',
        '¿Cómo se relaciona esto con mi especialidad técnica?',
        'Explícame la fórmula matemática',
      ];

  const emotionInfo = pedagogicalEngine.getEmotionBadgeInfo(emotion);

  return (
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="no-print fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-2xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 font-bold text-sm"
          title="Abrir Asistente Virtual Ágora-Lab"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">Tutor Ágora-Lab</span>
          <span className="text-xs bg-slate-900/60 px-2 py-0.5 rounded-full text-teal-200">
            {emotionInfo.icon}
          </span>
        </button>
      )}

      {/* Docked / Floating Chat Window */}
      {isOpen && (
        <div className="no-print fixed bottom-4 right-4 z-50 w-full max-w-[380px] sm:max-w-[420px] h-[520px] max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Ágora-Lab Pedagógica
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-950 text-teal-300 rounded border border-teal-800 font-mono">
                    IA Offline / Gemini
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{emotionInfo.icon} {emotionInfo.label}</span> •{' '}
                  <span className="truncate max-w-[150px]">{currentStepTitle}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleOpen}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
                title="Cerrar ventana de tutoría"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
            {messages.map((msg) => {
              const isMentor = msg.sender === 'mentor';
              const isPlaying = playingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMentor ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isMentor
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isMentor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isMentor
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] opacity-75">
                      <span>{msg.timestamp}</span>
                      {isMentor && (
                        <button
                          onClick={() => handlePlayMessageVoice(msg.id, msg.text)}
                          className="hover:opacity-100 flex items-center gap-1 text-teal-300 ml-2"
                          title={isPlaying ? 'Pausar audio' : 'Escuchar respuesta'}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3 h-3 text-rose-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-teal-400 italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Ágora-Lab está formulando tu pista pedagógica...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe o dicta tu duda a Ágora-Lab..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 pr-16"
              />

              {/* Dictation mic */}
              <button
                onClick={handleToggleVoiceRecording}
                className={`absolute right-10 p-1.5 rounded-lg transition-colors ${
                  isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dictar pregunta con tu voz"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all disabled:opacity-40"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
