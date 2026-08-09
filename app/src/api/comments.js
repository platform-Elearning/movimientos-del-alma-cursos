import { instanceCursos, instanceEnrollments } from "./axiosInstances";

//COMENTARIOS

export const createComment = async (comment) => {
  try {
    const response = await instanceCursos.post("/lesson-comments/create-comment", comment);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCommentsByLessonId = async (lesson_id) => {
  //console.log("entoy en get",lesson_id)
  try {
    const response = await instanceCursos.get(`/lesson-comments/get-comments/${lesson_id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};


//SU COMENTARIOS
export const createCommentReply = async (comment) => {
  try {
    const response = await instanceCursos.post("/lesson-comment-replies/create-reply", comment);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getCommentsRepliesByCommentId = async (comment_id) => {
  //console.log("entoy en get",comment_id)
  try {
    const response = await instanceCursos.get(`/lesson-comment-replies/get-replies/${comment_id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};