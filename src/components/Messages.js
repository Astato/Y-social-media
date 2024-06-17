import { useEffect, useState, useRef } from "react";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";
import { ReactComponent as BackIcon } from "../icons/back_icon.svg";
import { BASEURL } from "../App";
import defaultProfileImage from "../icons/profile-default.jpg";
import { ReactComponent as EmojiIcon } from "../icons/emoji_icon.svg";
import DOMPurify from "dompurify";
import EmojiPicker from "emoji-picker-react";

import axios from "axios";
const Messages = ({ user }) => {
  const [following, setFollowing] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [messageReceiver, setMessageReceiver] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(true);
  const [conversationsPreview, setConversationsPreview] = useState("");
  const [confirmationMessage, setConfirmationMessage] =
    useState("Message Sent");
  const [openChat, setOpenChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const contactDialog = useRef(null);
  const sendMessageDialog = useRef(null);
  const getFollowingData = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/social/following-followers?get=${"following"}&thirdPartyUserId=${false}`
      );
      if (response.data && response.status === 200) {
        setFollowing(response.data);
        setContactsLoading(false);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const getConversationsPreview = async () => {
    try {
      const response = await axios.get(
        BASEURL + "/social/get-private-messages?preview=true"
      );
      if (response.data.length > 0 && response.status === 200) {
        setIsLoading(false);
        return setConversationsPreview(response.data);
      }
    } catch (error) {
      console.log(error);
      if (error && error.response.data.message) {
        return;
      } else {
        return setErrorMessage("An unexpected error has ocurred");
      }
    }
  };

  const handleSetReciever = (target) => {
    setMessageReceiver(target);
    contactDialog.current.close();
    sendMessageDialog.current.showModal();
    return;
  };

  const handleOpenDialog = async () => {
    if (!following) {
      getFollowingData();
    }
    contactDialog.current.showModal();
    return;
  };

  const handleShowEmojiPicker = (arg) => {
    const emojiPicker = document.querySelector(
      ".EmojiPickerReact.epr-main.epr-dark-theme "
    );

    setShowEmojiPicker(!showEmojiPicker);
    showEmojiPicker
      ? (emojiPicker.style.display = "flex")
      : (emojiPicker.style.display = "none");
  };

  const handleStartNewConversation = async () => {
    const message = {
      message_content: DOMPurify.sanitize(messageContent),
      targetUser: messageReceiver._id,
      time: new Date().toISOString(),
    };
    const options = {
      method: "POST",
      url: BASEURL + "/social/send-private-message",
      data: message,
      Headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios(options);
    if (response.status === 200) {
      setConfirmationMessage(response.data.message);
      setMessageReceiver(messageReceiver);
      setMessageContent("");
      return setOpenChat(response.data.conversation);
    }
  };

  const handleOpenChat = async (target) => {
    try {
      const response = await axios.get(
        BASEURL + "/social/get-private-messages?target=" + target
      );
      if (response.data.length > 0 && response.status === 200) {
        setMessageReceiver(response.data[0].participants[0]);
        return setOpenChat(response.data[0]);
      }
    } catch (error) {
      console.log(error);
      if (error && error.response.data.message) {
        return;
      } else {
        return setErrorMessage("An unexpected error has ocurred");
      }
    }
  };

  useEffect(() => {
    if (!conversationsPreview) {
      getConversationsPreview();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen" style={{ position: "inherit" }}>
        <div style={{ width: "5rem" }}>
          <LoadingAnimation></LoadingAnimation>
        </div>
      </div>
    );
  }

  const MessageCreator = (
    <div
      style={{
        display: "flex",
        margin: "auto",
      }}
    >
      <textarea
        style={{
          alignSelf: "center",
          margin: "auto",
          marginLeft: "2rem",
        }}
        maxLength={300}
        cols={31}
        rows={12}
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
      />
      <EmojiIcon
        className="close-button"
        onClick={handleShowEmojiPicker}
        style={{
          position: "relative",
          width: "30px",
          bottom: "-16rem",
          left: "-2.5rem",
          fill: "rgb(29, 155, 240)",
          stroke: "none",
        }}
      />
      <div style={{ width: "auto" }}>
        <EmojiPicker
          theme="dark"
          previewConfig={{ showPreview: false }}
          searchDisabled={true}
          onEmojiClick={(e) => {
            messageContent.length < 300
              ? setMessageContent((prev) => prev + e.emoji)
              : setMessageContent(messageContent);
          }}
        />
      </div>
    </div>
  );

  return (
    <div id="messages-container">
      {isLoading}
      <dialog
        ref={sendMessageDialog}
        id="send-message-dialog"
        style={{
          marginLeft: showEmojiPicker ? "auto" : "calc(50% - 242px)",
        }}
      >
        <CloseIcon
          className="close-button"
          onClick={() => sendMessageDialog.current.close()}
        ></CloseIcon>
        <div
          style={{ display: "flex", flexDirection: "column", margin: "auto" }}
        >
          <div
            id="receiver-info"
            style={{
              display: "flex",
              color: "white",
              alignItems: "center",
            }}
          >
            <img
              style={{ width: "40px", height: "40px", borderRadius: "100%" }}
              src={messageReceiver.profile_img || defaultProfileImage}
              alt={""}
            />
            <div style={{ diplay: "none", marginLeft: "1rem" }}>
              <p>
                {messageReceiver.name},{" "}
                <span style={{ color: "gray" }}>
                  {messageReceiver.username}
                </span>
              </p>
            </div>
          </div>
          {MessageCreator}
          <button
            className="blue-button"
            disabled={/\w/gi.test(messageContent) ? false : true}
            onClick={handleStartNewConversation}
          >
            Send Message
          </button>
        </div>
      </dialog>
      <dialog ref={contactDialog} id="contacts-dialog">
        <div>
          <CloseIcon
            className="close-button"
            onClick={() => contactDialog.current.close()}
          ></CloseIcon>
          <h2 style={{ color: "white", textAlign: "center" }}>Following</h2>
          {contactsLoading ? (
            <div className="loading-screen" style={{ width: "90%" }}>
              <div style={{ width: "5rem" }}>
                <LoadingAnimation></LoadingAnimation>
              </div>
            </div>
          ) : (
            following.map((element) => {
              return (
                <div
                  key={element._id}
                  className="followers-following-userlist"
                  onClick={() => handleSetReciever(element)}
                >
                  <img src={defaultProfileImage} alt="" />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p>
                      {element.name} <span>{element.username}</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </dialog>
      <div className="main topbar">
        {openChat ? (
          <BackIcon
            className="close-button"
            style={{
              margin: "0 .5rem",
            }}
            onClick={() => {
              setOpenChat("");
              setMessageReceiver("");
              setMessageContent("");
              setShowEmojiPicker(true);
            }}
          ></BackIcon>
        ) : null}
        {openChat ? (
          <h3>Messaging {messageReceiver.username}</h3>
        ) : (
          <h3>Messages</h3>
        )}
      </div>
      {openChat ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "solid 1px rgba(128, 128, 128, 0.4)",
            maxHeight: "92vh",
          }}
        >
          <div id="chat-container">
            {openChat.messages.map((element) => {
              return (
                <div
                  key={element._id}
                  className={
                    element.sender === user._id
                      ? "client-sent-message"
                      : "client-received-message"
                  }
                >
                  {element.sender === user._id ? (
                    <p className="chat-username">
                      You <span>{new Date(element.sent).toLocaleString()}</span>
                    </p>
                  ) : (
                    <p className="chat-username">
                      {messageReceiver.name}
                      <span>{new Date(element.sent).toLocaleString()}</span>
                    </p>
                  )}
                  <p className="chat-content">{element.message_content}</p>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              height: "fit-content",
              justifySelf: "flex-end",
            }}
          >
            <textarea
              style={{
                margin: " auto",
                marginTop: "1rem",
                border: "solid white 1px",
                overflowY: "auto",
              }}
              placeholder="Type a new message..."
              maxLength={300}
              cols={42}
              rows={5}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <EmojiIcon
              className="close-button"
              style={{
                position: "relative",
                width: "30px",
                left: "485px",
                bottom: "120px",
                fill: "rgb(29, 155, 240)",
                stroke: "none",
              }}
              onClick={() => handleShowEmojiPicker("open-chat-emoji-picker")}
            />
            <button
              className="white-button"
              style={{ margin: "auto auto 1rem auto" }}
              onClick={handleStartNewConversation}
            >
              Send
            </button>
            {!showEmojiPicker ? (
              <EmojiPicker
                theme="dark"
                previewConfig={{ showPreview: false }}
                searchDisabled={true}
                className="openchat-emojipicker"
                width={"100%"}
                height={"15rem"}
                onEmojiClick={(e) => {
                  messageContent.length < 300
                    ? setMessageContent((prev) => prev + e.emoji)
                    : setMessageContent(messageContent);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <h2>Welcome to your Inbox</h2>
          <div>
            {conversationsPreview.length > 0 ? (
              <div>
                {conversationsPreview.map((element) => {
                  const {
                    profile_img = false,
                    username,
                    name,
                    _id,
                  } = element.participants[0];
                  const unread = element.unread;
                  const { message_content, sent } = element.messages[0];
                  return (
                    <div
                      key={element._id}
                      className="chat-preview-container"
                      onClick={() => handleOpenChat(_id)}
                    >
                      {unread === user._id ? (
                        <div className="message-notification-dot"></div>
                      ) : (
                        <div
                          className="message-notification-dot"
                          style={{ opacity: 0 }}
                        ></div>
                      )}
                      <img alt="" src={profile_img || defaultProfileImage} />
                      <div style={{ display: "flex" }}>
                        <p className="chat-user">
                          {name} <span>{username}</span>
                        </p>
                        <p className="chat-date">
                          {new Date(sent).toLocaleString()}
                        </p>
                      </div>
                      <p className="chat-message">{message_content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>You don't have any conversations yet</div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              margin: "auto",
              marginTop: "3rem",
            }}
          >
            {user.following && user.following.length > 0 ? (
              <button className="blue-button" onClick={handleOpenDialog}>
                New Conversation
              </button>
            ) : (
              <h3> You can only send message to people you are following</h3>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default Messages;
