import axios from "axios";
import { useEffect, useState } from "react";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";
import Post from "./Posts";
import { BASEURL } from "../App";
const Bookmarks = ({ user, setUser }) => {
  const [bookmarkedPost, setBookmarkedPost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  async function getBookmarks() {
    try {
      const response = await axios.get(BASEURL + "/social/getBookmarks");
      if (response.status === 200) {
        setBookmarkedPost(response.data);
        return setIsLoading(false);
      }
    } catch (error) {}
  }

  useEffect(() => {
    if (!bookmarkedPost) {
      getBookmarks();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div style={{ width: "5rem" }}>
          <LoadingAnimation></LoadingAnimation>
        </div>
      </div>
    );
  }

  return (
    <div id="bookmarks-container">
      <div className="main topbar">
        <h3 style={{ fontSize: "25px" }}>Bookmarks</h3>
      </div>
      <main className="posts-container">
        <Post
          user={user}
          setUser={setUser}
          userInteractedPosts={bookmarkedPost}
          userInteractedPostsCount={bookmarkedPost.length}
        ></Post>
      </main>
    </div>
  );
};

export default Bookmarks;
