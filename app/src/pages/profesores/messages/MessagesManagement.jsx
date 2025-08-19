import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthUtils from '../../../utils/authUtils';
import './MessagesManagement.css';

const MessagesManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [students, setStudents] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate('/login');
      return;
    }
    loadMessagesData();
    
    // Si viene de estudiantes con un studentId específico
    const studentId = searchParams.get('student');
    if (studentId) {
      setTimeout(() => {
        const existingConversation = conversations.find(conv => 
          conv.student_id === parseInt(studentId)
        );
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else {
          setSelectedStudent(studentId);
          setShowNewConversation(true);
        }
      }, 1000);
    }
  }, [navigate, searchParams]);

  const loadMessagesData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data
      setTimeout(() => {
        setStudents([
          { id: 1, name: 'Ana García', email: 'ana.garcia@email.com', course: 'Danza Contemporánea' },
          { id: 2, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', course: 'Danza Contemporánea' },
          { id: 3, name: 'María López', email: 'maria.lopez@email.com', course: 'Ballet Clásico' },
          { id: 4, name: 'Luis Fernández', email: 'luis.fernandez@email.com', course: 'Ballet Clásico' }
        ]);
        
        setConversations([
          {
            id: 1,
            student_id: 1,
            student_name: 'Ana García',
            student_avatar: 'https://ui-avatars.com/api/?name=Ana+García&background=4CAF50&color=fff&size=40',
            last_message: '¡Gracias por la explicación sobre las posiciones!',
            last_message_time: '2024-07-15T10:30:00Z',
            unread_count: 2,
            messages: [
              {
                id: 1,
                sender: 'student',
                content: 'Hola profesor, tengo una duda sobre la clase de ayer',
                timestamp: '2024-07-15T09:00:00Z',
                read: true
              },
              {
                id: 2,
                sender: 'teacher',
                content: 'Hola Ana, ¿qué duda tienes? Estaré encantado de ayudarte',
                timestamp: '2024-07-15T09:15:00Z',
                read: true
              },
              {
                id: 3,
                sender: 'student',
                content: '¿Podrías explicarme mejor las transiciones entre las posiciones básicas?',
                timestamp: '2024-07-15T09:30:00Z',
                read: true
              },
              {
                id: 4,
                sender: 'teacher',
                content: 'Por supuesto. Las transiciones deben ser fluidas y naturales. Te sugiero practicar lentamente primero, enfocándote en mantener el centro de gravedad estable.',
                timestamp: '2024-07-15T10:00:00Z',
                read: true
              },
              {
                id: 5,
                sender: 'student',
                content: '¡Gracias por la explicación sobre las posiciones!',
                timestamp: '2024-07-15T10:30:00Z',
                read: false
              }
            ]
          },
          {
            id: 2,
            student_id: 2,
            student_name: 'Carlos Rodríguez',
            student_avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodríguez&background=2196F3&color=fff&size=40',
            last_message: 'Perfecto, nos vemos en la próxima clase',
            last_message_time: '2024-07-14T16:45:00Z',
            unread_count: 0,
            messages: [
              {
                id: 6,
                sender: 'student',
                content: '¿La clase de mañana será a la misma hora?',
                timestamp: '2024-07-14T16:00:00Z',
                read: true
              },
              {
                id: 7,
                sender: 'teacher',
                content: 'Sí Carlos, la clase será a las 10:00 AM como siempre',
                timestamp: '2024-07-14T16:30:00Z',
                read: true
              },
              {
                id: 8,
                sender: 'student',
                content: 'Perfecto, nos vemos en la próxima clase',
                timestamp: '2024-07-14T16:45:00Z',
                read: true
              }
            ]
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const messageObj = {
        id: Date.now(),
        sender: 'teacher',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: true
      };

      if (selectedConversation) {
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, messageObj],
              last_message: newMessage.trim(),
              last_message_time: new Date().toISOString()
            };
            setSelectedConversation(updatedConv);
            return updatedConv;
          }
          return conv;
        }));
      } else if (selectedStudent) {
        const student = students.find(s => s.id === parseInt(selectedStudent));
        const newConversation = {
          id: Date.now(),
          student_id: student.id,
          student_name: student.name,
          student_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4CAF50&color=fff&size=40`,
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          messages: [messageObj]
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setShowNewConversation(false);
        setSelectedStudent('');
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje');
    }
  };

  const markAsRead = async (conversationId) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unread_count: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    }));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="messages-management loading">
        <div className="loading-spinner">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="messages-management">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)} // Volver a la página anterior
        >
          ← Volver
        </button>
        <h1>Mensajes</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowNewConversation(true)}
        >
          ✉️ Nuevo Mensaje
        </button>
      </header>

      <div className="messages-container">
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className="conversations-panel">
          <div className="conversations-header">
            <h2>Conversaciones</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <p>No hay conversaciones</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowNewConversation(true)}
                >
                  Iniciar conversación
                </button>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    if (conversation.unread_count > 0) {
                      markAsRead(conversation.id);
                    }
                  }}
                >
                  <div className="conversation-avatar">
                    <img src={conversation.student_avatar} alt={conversation.student_name} />
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">{conversation.unread_count}</span>
                    )}
                  </div>
                  
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h4>{conversation.student_name}</h4>
                      <span className="conversation-time">
                        {formatTime(conversation.last_message_time)}
                      </span>
                    </div>
                    <p className="last-message">
                      {conversation.last_message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel derecho - Chat */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-student-info">
                  <img 
                    src={selectedConversation.student_avatar} 
                    alt={selectedConversation.student_name}
                    className="chat-avatar"
                  />
                  <div>
                    <h3>{selectedConversation.student_name}</h3>
                    <span className="student-status">En línea hace 2 horas</span>
                  </div>
                </div>
              </div>
              
              <div className="chat-messages">
                {selectedConversation.messages.map(message => (
                  <div 
                    key={message.id}
                    className={`message ${message.sender === 'teacher' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="chat-input">
                <div className="input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    rows="3"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <span className="no-chat-icon">💬</span>
                <h3>Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para ver los mensajes</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowNewConversation(true)}
                >
                  Iniciar nueva conversación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para nueva conversación */}
      {showNewConversation && (
        <div className="modal-overlay">
          <div className="modal new-conversation-modal">
            <div className="modal-header">
              <h3>Nueva Conversación</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowNewConversation(false);
                  setSelectedStudent('');
                  setNewMessage('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar Estudiante</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="student-select"
                >
                  <option value="">Selecciona un estudiante</option>
                  {students
                    .filter(student => !conversations.some(conv => conv.student_id === student.id))
                    .map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.course}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows="4"
                  className="message-textarea"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowNewConversation(false);
                  setSelectedStudent('');
                  setNewMessage('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleSendMessage}
                disabled={!selectedStudent || !newMessage.trim()}
              >
                Enviar Mensaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;
