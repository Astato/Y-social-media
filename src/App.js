import Sidebar from "./components/Sidebar";
import Maincontent from "./components/Maincontent";
import Rightsidebar from "./components/Rightsidebar";
import Profile from "./components/Profile";
import Notifications from "./components/Notifications";
import Bookmarks from "./components/Bookmarks";
import Messages from "./components/Messages";
import PostExpand from "./components/PostExpand";
import LoginScreen from "./components/LoginScreen";
import Settings from "./components/Settings";
import NewGoogleLogin from "./components/NewGoogleLogin";
import Followers from "./components/Followers";
import { ReactComponent as LoadingAnimation } from "./icons/tube-spinner.svg";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

export const BASEURL = "https://hubapi.fly.dev";
// export const BASEURL = "http://localhost:5000";

function App() {
  const [user, setUser] = useState("");
  const [openPost, setOpenPost] = useState(false);
  const [unreadNotification, setUnreadNotification] = useState(false);
  const [thirdPartyUser, setThirdPartyUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hashtagFilter, setHashTagFilter] = useState("");
  const [settingsPage, setSettingsPage] = useState(false);
  const [showNewPostsNotification, setShowNewPostsNotification] =
    useState(false);
  const checkForSession = async () => {
    try {
      const response = await axios.get(`${BASEURL}/social/isLogged`);
      if (response.status === 200) {
        setUser(response.data);
        return setIsLoading(false);
      }
    } catch (error) {
      return setIsLoading(false);
    }
  };

  const checkForNotifications = () => {
    if (user.notifications && user.notifications.length > 0) {
      /// get last item  so if the are new notifications checking the last one should be enough.
      const lastNotification =
        user.notifications[user.notifications.length - 1];
      if (lastNotification.read === false) {
        setUnreadNotification(true);
        return setIsLoading(false);
      }
    }
  };

  const searchPost = async (post_id) => {
    try {
      const response = await axios.get(
        `${BASEURL}/social/find-op?getPost=` + post_id
      );
      if (response.status === 200 && response.data) {
        return setOpenPost(...response.data);
      }
    } catch (error) {
      return error;
    }
  };

  const getProfile = async (username) => {
    try {
      const response = await axios.get(
        `${BASEURL}/social/getProfile?username=` + username
      );
      if (response.status === 200 && response.data) {
        return setThirdPartyUser(response.data);
      }
    } catch (error) {
      return error;
    }
  };

  const currentURL = window.location.pathname;
  const isPostRegex = /^[/]@?\w+[/]post[/]\w+/gi;
  const isProfileRegex = /^[/]profile[/]@?\w+/gi;
  const isHashtagRegex = /^[/]\w+[/]\w+/gi;

  useEffect(() => {
    if (!user) {
      const matchedPostPath = currentURL.match(isPostRegex);
      const matchedProfilePäth = currentURL.match(isProfileRegex);
      const matchedHashtagPath = currentURL.match(isHashtagRegex);

      if (!matchedHashtagPath && hashtagFilter) {
        setHashTagFilter("");
      }

      if (matchedHashtagPath) {
        const hashtag = matchedHashtagPath[0].split("/")[2];
        setHashTagFilter(hashtag);
      }
      if (matchedPostPath && !openPost) {
        const postId = matchedPostPath[0].split("/")[3];
        searchPost(postId);
      }
      if (matchedProfilePäth && !thirdPartyUser) {
        const profileUsername = matchedProfilePäth[0].split("/")[2];
        getProfile(profileUsername);
      }
      checkForSession();
    }

    if (user) {
      checkForNotifications();
    }
  }, [user]);

  const settingsPageStyling = {
    display: "flex",
    width: "60%",
    // gridTemplateColumns: "916px",
  };

  if (isLoading) {
    return (
      <div className="loading-screen" style={{ width: "100%", height: "50%" }}>
        <div style={{ width: "5rem" }}>
          <LoadingAnimation></LoadingAnimation>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        {!user ? (
          <LoginScreen setUser={setUser} user={user} />
        ) : (
          <>
            <div style={{ maxWidth: "fit-content" }}>
              <Sidebar
                unreadNotification={unreadNotification}
                setThirdPartyUser={setThirdPartyUser}
                setSettingsPage={setSettingsPage}
                setOpenPost={setOpenPost}
                setHashTagFilter={setHashTagFilter}
                setShowNewPostsNotification={setShowNewPostsNotification}
                user={user}
                key="sidebar"
              ></Sidebar>
            </div>
            <div
              id="maincontent"
              style={settingsPage ? settingsPageStyling : null}
            >
              <Routes>
                <Route
                  path="/*"
                  element={[
                    <Maincontent
                      key="maincontent"
                      user={user}
                      setUser={setUser}
                      setOpenPost={setOpenPost}
                      setThirdPartyUser={setThirdPartyUser}
                      hashtag={hashtagFilter}
                      setHashTagFilter={setHashTagFilter}
                      setShowNewPostsNotification={setShowNewPostsNotification}
                      showNewPostsNotification={showNewPostsNotification}
                    />,
                    <Rightsidebar key="maincontent-rightSidebar" />,
                  ]}
                />
                <Route
                  path="/profile"
                  element={[
                    <Profile
                      key="profile"
                      user={user}
                      setUser={setUser}
                      isThirdParty={false}
                      setOpenPost={setOpenPost}
                    />,
                    <Rightsidebar key="profile-rightSidebar" />,
                  ]}
                />
                <Route
                  path="/profile/:thirdPartyUser"
                  element={[
                    <Profile
                      key="thirdparty-profile"
                      user={thirdPartyUser}
                      setUser={setUser}
                      isThirdParty={true}
                      setThirdPartyUser={setThirdPartyUser}
                      setOpenPost={setOpenPost}
                    />,
                    <Rightsidebar key="thirparty-profile-rightSidebar" />,
                  ]}
                />
                <Route
                  path="/notifications"
                  element={[
                    <Notifications
                      key="notifications"
                      setUser={setUser}
                      user={user}
                      setOpenPost={setOpenPost}
                      setThirdPartyUser={setThirdPartyUser}
                    />,
                    <Rightsidebar key="notifications-rightSidebar" />,
                  ]}
                />
                <Route
                  path="/bookmarks"
                  element={[
                    <Bookmarks key="bookmarks" user={user} setUser={setUser} />,
                    <Rightsidebar key="sidebar-bookmarks" />,
                  ]}
                />
                <Route
                  path="/messages"
                  element={[
                    <Messages key="messages" user={user} />,
                    <Rightsidebar key="merssages-sidebar" />,
                  ]}
                />
                {/* <Route
                  path="/explore"
                  element={[
                    <Explore key="test11" />,
                    <Rightsidebar
setHashTagFilter={setHashTagFilter}
                      setThirdPartyUser={setThirdPartyUser}
                      key="test12"
                    />,
                  ]}
                /> */}
                <Route
                  path="/:creatorname/post/:id"
                  element={[
                    <PostExpand
                      openPost={openPost}
                      user={user}
                      key="post-expand"
                      setUser={setUser}
                      setOpenPost={setOpenPost}
                      setThirdPartyUser={setThirdPartyUser}
                    />,
                    <Rightsidebar key="postexpand-sidebar" />,
                  ]}
                />
                <Route
                  path="/Settings"
                  element={[
                    <Settings user={user} setUser={setUser} key="settings" />,
                  ]}
                />
                <Route
                  path={"/:creatorusername/followers"}
                  element={[
                    <Followers
                      key={"followers"}
                      user={user}
                      setUser={setUser}
                      thirdPartyUser={thirdPartyUser}
                      isThirdParty={thirdPartyUser ? true : false}
                      show={"Followers"}
                      setThirdPartyUser={setThirdPartyUser}
                    />,
                    <Rightsidebar key="followers-sidebar" />,
                  ]}
                />{" "}
                <Route
                  path="/:creatorusername/following"
                  element={[
                    <Followers
                      key={"following"}
                      user={user}
                      thirdPartyUser={thirdPartyUser}
                      setUser={setUser}
                      isThirdParty={thirdPartyUser ? true : false}
                      show={"Following"}
                      setThirdPartyUser={setThirdPartyUser}
                    />,
                    <Rightsidebar key="following-sidebar" />,
                  ]}
                />
                <Route
                  path="/Profile/newGoogleLogin"
                  element={
                    <NewGoogleLogin
                      user={user}
                      setUser={setUser}
                      key="newGoogleLogin"
                    ></NewGoogleLogin>
                  }
                />
              </Routes>
            </div>
          </>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
