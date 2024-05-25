import { useEffect, useState } from "react";
import { ReactComponent as BackIcon } from "../icons/back_icon.svg";
import Post from "./Posts";
import CreatePosts from "./Createposts";
import axios from "axios";
const PostExpand = ({
  openPost,
  user,
  setUser,
  setOpenPost,
  setThirdPartyUser,
}) => {
  const [postReplies, setPostReplies] = useState(null);
  const [stopPostQuote, setStopPostQuote] = useState(
    openPost.quote ? false : true
  );

  const getPostReplies = async () => {
    try {
      const getReplies = await axios.get(
        "http://localhost:5000/social/post-replies?postID=" + openPost._id
      );
      if (getReplies.status === 200) {
        return setPostReplies(getReplies.data);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  useEffect(() => {
    // if (openPost.replies && openPost.replies.length >= 1) {
    getPostReplies();
    // }
    // if (openPost.replies && openPost.replies.length === 0) {
    //   updatePostViews()
    //   setPostReplies(false);
    // }
  }, [openPost]);

  return (
    <div id="open-post">
      <div className="main topbar">
        <BackIcon
          className="close-button"
          style={{ marginRight: "1rem" }}
          aria-label="back"
          onClick={() => window.history.back()}
        />
        <h3>Post</h3>
      </div>
      <main className="posts-container" style={{ overflow: "hidden" }}>
        <Post
          user={user}
          setUser={setUser}
          setOpenPost={setOpenPost}
          openPost={openPost}
          setThirdPartyUser={setThirdPartyUser}
          stopPostQuote={stopPostQuote}
        />
        <CreatePosts
          displayButtons={"false"}
          placeholderMessage={"Post your reply"}
          id="reply-post"
          charactersCount={36}
          isReply={true}
          post_id={openPost._id}
          postCreator={openPost.creator} /// keep the current post creator information on user reply/comment
          setOpenPost={setOpenPost}
          user={user}
        />
        <div className="post-container replies">
          {postReplies ? (
            ///render the replies / comments made in the post opened
            <Post
              user={user}
              setUser={setUser}
              setOpenPost={setOpenPost}
              openPost={openPost}
              userInteractedPosts={postReplies}
              setThirdPartyUser={setThirdPartyUser}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default PostExpand;
