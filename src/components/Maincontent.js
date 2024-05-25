import { ReactComponent as SettingsIcon } from "../icons/settings_icon.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";

import Posts from "./Posts";

import { useEffect, useRef, useState } from "react";
import CreatePosts from "./Createposts";

const Maincontent = ({
  user,
  setUser,
  setOpenPost,
  setThirdPartyUser,
  hashtag,
  setShowNewPostsNotification,
  showNewPostsNotification,
  setHashTagFilter,
}) => {
  const dialogRef = useRef(null);
  const targetRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("explore");
  const [quote, setQuote] = useState(false);
  // const [showNewPostsNotification, setShowNewPostsNotification] =
  //   useState(false);
  const [newPostCount, setNewPostCount] = useState(
    Number(sessionStorage.getItem("newPostsCount")) || 0
  );
  const [updatePosts, setUpdatePosts] = useState(false);

  const handleBackToTop = () => {
    setShowNewPostsNotification(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // useEffect(() => {
  //   const newPostUnread = Number(sessionStorage.getItem("newPostsCount"));
  //   if (newPostUnread > 0 && newPostCount === 0) {
  //     setNewPostCount(newPostUnread);
  //   }
  //   function onNewPost() {
  //     setNewPostCount((prev) => prev + 1);
  //     setShowNewPostsNotification(true);
  //     sessionStorage.setItem("newPostsCount", newPostCount + 1);
  //   }

  //   socket.on("New Post Notification", onNewPost);
  //   return () => {
  //     socket.off("New Post Notification", onNewPost);
  //   };
  // }, []);

  const handleLoadPosts = () => {
    sessionStorage.setItem("newPostsCount", 0);
    setNewPostCount(0);
    setUpdatePosts(true);
    return sessionStorage;
  };

  useEffect(() => {
    setNewPostCount(Number(sessionStorage.getItem("newPostsCount")));
  }, [showNewPostsNotification]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((element) => {
        if (element.isIntersecting) {
          if (newPostCount > 0) {
            setShowNewPostsNotification(false);
          } else {
            setShowNewPostsNotification(true);
          }
        }
      });
    });
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
  });

  return (
    <main>
      <div className="main topbar">
        <div style={{ width: "0px", height: 0 }} id="new-posts-notification">
          <div
            id="new-posts-notification"
            onClick={handleBackToTop}
            style={{
              display:
                showNewPostsNotification && selectedTab === "explore"
                  ? "flex"
                  : "none",
            }}
          >
            <p>New Posts! </p>
          </div>
        </div>
        <div
          className="tab"
          onClick={() => {
            setSelectedTab("explore");
            setHashTagFilter("");
          }}
        >
          <div>
            Explore
            <hr
              className="border"
              style={{ opacity: selectedTab === "explore" ? 1 : 0 }}
            ></hr>
          </div>
        </div>
        <div
          className="tab"
          onClick={() => {
            setSelectedTab("following");
            setHashTagFilter("");
          }}
        >
          <div>
            Following
            <hr
              className="border"
              style={{ opacity: selectedTab === "following" ? 1 : 0 }}
            ></hr>
          </div>
        </div>
        <div
          style={{
            fill: "white",
            display: "flex",
            justifyContent: "center",
            width: "50px",
          }}
        >
          {/* <SettingsIcon
            onClick={() => dialogRef.current.showModal()}
            id="settings-icon"
          ></SettingsIcon> */}
          <dialog ref={dialogRef} id="new-google-login">
            <div
              style={{
                color: "white",
                display: "flex",
                alignItems: "flex-start",
                position: "absolute",
                width: "100%",
                top: "0",
                left: "0",
              }}
            >
              <div style={{ display: "flex" }}>
                <CloseIcon
                  style={{ width: "20px" }}
                  onClick={() => dialogRef.current.close()}
                />
                <h3>Timeline</h3>
              </div>
              <button>Done</button>
            </div>
          </dialog>
        </div>
      </div>
      <CreatePosts
        creatorID={user._id}
        user={user}
        setOpenPost={setOpenPost}
        quote={quote}
        setQuote={setQuote}
      ></CreatePosts>
      <div id="show-posts"></div>
      <div
        id="load-posts"
        onClick={handleLoadPosts}
        ref={targetRef}
        style={{
          display:
            newPostCount > 0 && selectedTab === "explore" ? "flex" : "none",
        }}
      >
        <p>Show {newPostCount} Posts</p>
      </div>
      <div className="posts-container">
        {selectedTab === "explore" ? (
          <Posts
            user={user}
            setUser={setUser}
            setOpenPost={setOpenPost}
            setThirdPartyUser={setThirdPartyUser}
            hashtag={hashtag}
            onlyFollowingPosts={"explore"}
            setQuote={setQuote}
            updatePosts={updatePosts}
            setUpdatePosts={setUpdatePosts}
          />
        ) : (
          <Posts
            user={user}
            setUser={setUser}
            setOpenPost={setOpenPost}
            setThirdPartyUser={setThirdPartyUser}
            onlyFollowingPosts={user.following.length}
            setQuote={setQuote}
          />
        )}
      </div>
    </main>
  );
};
export default Maincontent;
