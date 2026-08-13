import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";
import {
  getCommentsByLessonId,
  createComment,
  updateComment,
  deleteComment,
  createCommentReply,
  getCommentsRepliesByCommentId,
  updateCommentReply,
  deleteCommentReply,
} from "../../../api/comments";
import { useAuth } from "../../../services/authContext";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const getEmbedUrl = (url) => {
  if (!url) {
    return { type: 'unsupported', url: '' };
  }

  // PDF
  if (url.toLowerCase().endsWith('.pdf')) {
    return { type: 'pdf', url: url };
  }

  // Google Drive
  if (url.includes("drive.google.com")) {
    // Asumimos que es un enlace para visualizar, puede necesitar ajustes para 'preview'
    return { type: 'drive', url: url.replace("/view", "/preview") };
  }
  
  // YouTube
  let videoIdMatch;
  if (url.includes("youtube.com/watch")) {
    videoIdMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  } else if (url.includes("youtu.be")) {
    videoIdMatch = url.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
  }

  if (videoIdMatch && videoIdMatch[1]) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${videoIdMatch[1]}` };
  }

  // Si no es ninguno de los anteriores, es no soportado
  return { type: 'unsupported', url: url };
};

const Clase = () => {
  const { alumnoId, cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  const content = getEmbedUrl(classItem?.lessonUrl || classItem?.url);

  const { userId, userName, userLastname } = useAuth();
  const token = Cookies.get("token") || localStorage.getItem("token");
  const userEmail = useMemo(() => {
    try {
      return token ? jwtDecode(token).email || "" : "";
    } catch {
      return "";
    }
  }, [token]);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [savingCommentId, setSavingCommentId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deleteErrors, setDeleteErrors] = useState({});

  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [repliesError, setRepliesError] = useState({});
  const [openReplyFor, setOpenReplyFor] = useState({});
  const [newReplyText, setNewReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState({});
  const [replySendError, setReplySendError] = useState({});

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [replyEditError, setReplyEditError] = useState(null);
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const [replyDeleteErrors, setReplyDeleteErrors] = useState({});


  const loadComments = useCallback(async () => {
    if (!classItem?.id) return;

    setLoadingComments(true);
    setCommentsError(null);
    try {
      const data = await getCommentsByLessonId(classItem.id);

      let commentsArray = [];
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (data && Array.isArray(data.comments)) {
        commentsArray = data.comments;
      } else if (data && Array.isArray(data.data)) {
        commentsArray = data.data;
      } else if (data && typeof data === "object" && data.comment) {
        // Si el backend devuelve un solo comentario como objeto
        commentsArray = [data];
      }

      setComments(commentsArray);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setCommentsError(`No se pudieron cargar los comentarios${status ? ` (${status})` : ""}: ${message}`);
    } finally {
      setLoadingComments(false);
    }
  }, [classItem?.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !classItem?.id || !userId) return;

    setSendingComment(true);
    setSendError(null);
    try {
      const commentData = {
        lesson_id: classItem.id,
        user_id: userId,
        nombre: userName || "",
        apellido: userLastname || "",
        email: userEmail || "",
        comment: newComment.trim(),
      };
      await createComment(commentData);
      setNewComment("");
      await loadComments();
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setSendError(`No se pudo enviar el comentario${status ? ` (${status})` : ""}: ${message}`);
    } finally {
      setSendingComment(false);
    }
  };

  const handleStartEditComment = (comment, commentId) => {
    setEditingCommentId(commentId);
    setEditCommentText(comment.comment || "");
    setEditError(null);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
    setEditError(null);
  };

  const handleSaveEditComment = async (commentId) => {
    const text = editCommentText.trim();
    if (!text) return;

    setSavingCommentId(commentId);
    setEditError(null);
    try {
      await updateComment(commentId, text);
      setEditingCommentId(null);
      setEditCommentText("");
      await loadComments();
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setEditError(`No se pudo editar el comentario${status ? ` (${status})` : ""}: ${message}`);
    } finally {
      setSavingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Seguro que querés eliminar este comentario?")) return;

    setDeletingCommentId(commentId);
    setDeleteErrors((prev) => ({ ...prev, [commentId]: null }));
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setDeleteErrors((prev) => ({
        ...prev,
        [commentId]: `No se pudo eliminar el comentario${status ? ` (${status})` : ""}: ${message}`,
      }));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const loadRepliesForComment = useCallback(async (commentId) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    setRepliesError((prev) => ({ ...prev, [commentId]: null }));
    try {
      const data = await getCommentsRepliesByCommentId(commentId);

      let repliesArray = [];
      if (Array.isArray(data)) {
        repliesArray = data;
      } else if (data && Array.isArray(data.data)) {
        repliesArray = data.data;
      } else if (data && Array.isArray(data.replies)) {
        repliesArray = data.replies;
      } else if (data && typeof data === "object" && (data.reply || data.comment)) {
        repliesArray = [data];
      }

      setReplies((prev) => ({ ...prev, [commentId]: repliesArray }));
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setRepliesError((prev) => ({
        ...prev,
        [commentId]: `No se pudieron cargar las respuestas${status ? ` (${status})` : ""}: ${message}`,
      }));
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  }, []);

  const toggleReplyBox = (commentId) => {
    setOpenReplyFor((prev) => {
      const isOpen = !prev[commentId];
      if (isOpen && !replies[commentId]) {
        loadRepliesForComment(commentId);
      }
      return { ...prev, [commentId]: isOpen };
    });
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    const text = (newReplyText[commentId] || "").trim();
    if (!text || !userId) return;

    setSendingReply((prev) => ({ ...prev, [commentId]: true }));
    setReplySendError((prev) => ({ ...prev, [commentId]: null }));
    try {
      const replyData = {
        comment_id: commentId,
        reply: text,
        nombre: userName || "",
        apellido: userLastname || "",
      };
      await createCommentReply(replyData);
      setNewReplyText((prev) => ({ ...prev, [commentId]: "" }));
      await loadRepliesForComment(commentId);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setReplySendError((prev) => ({
        ...prev,
        [commentId]: `No se pudo enviar la respuesta${status ? ` (${status})` : ""}: ${message}`,
      }));
    } finally {
      setSendingReply((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleStartEditReply = (reply, replyId) => {
    setEditingReplyId(replyId);
    setEditReplyText(reply.reply || "");
    setReplyEditError(null);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyText("");
    setReplyEditError(null);
  };

  const handleSaveEditReply = async (replyId, commentId) => {
    const text = editReplyText.trim();
    if (!text) return;

    setSavingReplyId(replyId);
    setReplyEditError(null);
    try {
      await updateCommentReply(replyId, text);
      setEditingReplyId(null);
      setEditReplyText("");
      await loadRepliesForComment(commentId);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setReplyEditError(`No se pudo editar la respuesta${status ? ` (${status})` : ""}: ${message}`);
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleDeleteReply = async (replyId, commentId) => {
    if (!window.confirm("¿Seguro que querés eliminar esta respuesta?")) return;

    setDeletingReplyId(replyId);
    setReplyDeleteErrors((prev) => ({ ...prev, [replyId]: null }));
    try {
      await deleteCommentReply(replyId);
      await loadRepliesForComment(commentId);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Error desconocido";
      setReplyDeleteErrors((prev) => ({
        ...prev,
        [replyId]: `No se pudo eliminar la respuesta${status ? ` (${status})` : ""}: ${message}`,
      }));
    } finally {
      setDeletingReplyId(null);
    }
  };

  if (!classItem) {
    return (
      <p>
        Clase no encontrada. Por favor, regresa y selecciona una clase válida.
      </p>
    );
  }

  const goToCourse = () => {
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date) ? "" : date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = () => {
    switch (content.type) {
      case 'youtube':
      case 'pdf':
      case 'drive':
        return (
          <iframe
            width="80%"
            height="480"
            src={content.url}
            title={classItem.lessonTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'unsupported':
      default:
        return <p>El contenido de esta clase no se puede mostrar aquí. <a href={content.url} target="_blank" rel="noopener noreferrer">Ábrelo en una nueva pestaña</a>.</p>;
    }
  };

  return (
    <div className="class-details-container">
      <BackLink
        title="Volver al Material"
        onClick={goToCourse}
      />
      <h2>
        {classItem.lessonTitle}: {classItem.lessonDescription}
      </h2>

      <div className="video-container">
        {content.url ? renderContent() : <p>No hay contenido disponible para esta clase.</p>}
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Comentarios</h3>

        {loadingComments && <p>Cargando comentarios...</p>}

        {commentsError && <p className="comments-error">{commentsError}</p>}

        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            className="comment-input"
            rows="3"
            placeholder="Escribí tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={sendingComment}
            required
          />
          <button
            className="comment-submit"
            type="submit"
            disabled={!newComment.trim() || sendingComment || !userId}
          >
            {sendingComment ? "Enviando..." : "Enviar comentario"}
          </button>
          {sendError && <p className="send-error">{sendError}</p>}
        </form>

        {!loadingComments && !commentsError && comments.length === 0 && (
          <p className="no-comments">No hay comentarios aún.</p>
        )}

        {!loadingComments && comments.length > 0 && (
          <ul className="comments-list">
            {comments.map((comment, index) => {
              const commentId = comment.id ?? comment._id ?? comment.comment_id;
              const isReplyOpen = !!openReplyFor[commentId];
              const commentReplies = replies[commentId] || [];
              const isOwnComment = userId && String(comment.user_id) === String(userId);
              const isEditing = editingCommentId === commentId;

              return (
                <li key={commentId || `comment-${index}`} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {`${comment.nombre || ""} ${comment.apellido || ""}`.trim() || comment.email || "Usuario"}
                    </span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>

                  {isEditing ? (
                    <div className="edit-form">
                      <textarea
                        className="comment-input"
                        rows="3"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        disabled={savingCommentId === commentId}
                      />
                      <div className="edit-actions">
                        <button
                          type="button"
                          className="comment-submit"
                          onClick={() => handleSaveEditComment(commentId)}
                          disabled={!editCommentText.trim() || savingCommentId === commentId}
                        >
                          {savingCommentId === commentId ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={handleCancelEditComment}
                          disabled={savingCommentId === commentId}
                        >
                          Cancelar
                        </button>
                      </div>
                      {editError && <p className="send-error">{editError}</p>}
                    </div>
                  ) : (
                    <p className="comment-text">{comment.comment}</p>
                  )}

                  {isOwnComment && !isEditing && (
                    <div className="comment-actions">
                      <button
                        type="button"
                        className="comment-action-button"
                        onClick={() => handleStartEditComment(comment, commentId)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="comment-action-button delete"
                        onClick={() => handleDeleteComment(commentId)}
                        disabled={deletingCommentId === commentId}
                      >
                        {deletingCommentId === commentId ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  )}

                  {deleteErrors[commentId] && (
                    <p className="send-error">{deleteErrors[commentId]}</p>
                  )}

                  {commentId && (
                    <button
                      type="button"
                      className="reply-toggle"
                      onClick={() => toggleReplyBox(commentId)}
                    >
                      {isReplyOpen ? "Ocultar respuestas" : "Responder"}
                    </button>
                  )}

                  {commentId && isReplyOpen && (
                    <div className="replies-section">
                      {loadingReplies[commentId] && <p>Cargando respuestas...</p>}

                      {repliesError[commentId] && (
                        <p className="comments-error">{repliesError[commentId]}</p>
                      )}

                      {!loadingReplies[commentId] && commentReplies.length === 0 && !repliesError[commentId] && (
                        <p className="no-comments">Sin respuestas aún.</p>
                      )}

                      {commentReplies.length > 0 && (
                        <ul className="replies-list">
                          {commentReplies.map((reply, replyIndex) => {
                            const replyId = reply.id ?? reply._id;
                            const isOwnReply = userId && String(reply.user_id) === String(userId);
                            const isEditingReply = editingReplyId === replyId;

                            return (
                              <li
                                key={replyId || `reply-${commentId}-${replyIndex}`}
                                className="reply-item"
                              >
                                <div className="comment-header">
                                  <span className="comment-author">
                                    {`${reply.nombre || ""} ${reply.apellido || ""}`.trim() || reply.email || "Usuario"}
                                  </span>
                                  <span className="comment-date">{formatDate(reply.created_at)}</span>
                                </div>

                                {isEditingReply ? (
                                  <div className="edit-form">
                                    <textarea
                                      className="comment-input reply-input"
                                      rows="2"
                                      value={editReplyText}
                                      onChange={(e) => setEditReplyText(e.target.value)}
                                      disabled={savingReplyId === replyId}
                                    />
                                    <div className="edit-actions">
                                      <button
                                        type="button"
                                        className="comment-submit reply-submit"
                                        onClick={() => handleSaveEditReply(replyId, commentId)}
                                        disabled={!editReplyText.trim() || savingReplyId === replyId}
                                      >
                                        {savingReplyId === replyId ? "Guardando..." : "Guardar"}
                                      </button>
                                      <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={handleCancelEditReply}
                                        disabled={savingReplyId === replyId}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                    {replyEditError && <p className="send-error">{replyEditError}</p>}
                                  </div>
                                ) : (
                                  <p className="comment-text">{reply.reply}</p>
                                )}

                                {isOwnReply && !isEditingReply && replyId && (
                                  <div className="comment-actions">
                                    <button
                                      type="button"
                                      className="comment-action-button"
                                      onClick={() => handleStartEditReply(reply, replyId)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="comment-action-button delete"
                                      onClick={() => handleDeleteReply(replyId, commentId)}
                                      disabled={deletingReplyId === replyId}
                                    >
                                      {deletingReplyId === replyId ? "Eliminando..." : "Eliminar"}
                                    </button>
                                  </div>
                                )}

                                {replyId && replyDeleteErrors[replyId] && (
                                  <p className="send-error">{replyDeleteErrors[replyId]}</p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <form
                        className="reply-form"
                        onSubmit={(e) => handleSubmitReply(e, commentId)}
                      >
                        <textarea
                          className="comment-input reply-input"
                          rows="2"
                          placeholder="Escribí una respuesta..."
                          value={newReplyText[commentId] || ""}
                          onChange={(e) =>
                            setNewReplyText((prev) => ({ ...prev, [commentId]: e.target.value }))
                          }
                          disabled={sendingReply[commentId]}
                          required
                        />
                        <button
                          className="comment-submit reply-submit"
                          type="submit"
                          disabled={
                            !(newReplyText[commentId] || "").trim() ||
                            sendingReply[commentId] ||
                            !userId
                          }
                        >
                          {sendingReply[commentId] ? "Enviando..." : "Responder"}
                        </button>
                        {replySendError[commentId] && (
                          <p className="send-error">{replySendError[commentId]}</p>
                        )}
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Clase;
