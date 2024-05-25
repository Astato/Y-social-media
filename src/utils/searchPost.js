import axios from "axios";
const searchPost = async (post_id) => {
  try {
    const response = await axios.get(
      "http://localhost:5000/social/find-op?getPost=" + post_id
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      return response.error;
    }
  } catch (error) {
    return "Failed to fetched post or was deleted";
  }
};

export default searchPost;
