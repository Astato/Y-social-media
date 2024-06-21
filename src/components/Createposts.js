import { ReactComponent as ImageIcon } from "../icons/image_icon.svg";
import { ReactComponent as GifIcon } from "../icons/gif_icon.svg";
import { ReactComponent as PollIcon } from "../icons/ballot_icon.svg";
import { ReactComponent as EmojiIcon } from "../icons/emoji_icon.svg";
import { ReactComponent as SearchLogo } from "../icons/search_icon.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import EmojiPicker from "emoji-picker-react";
import Post from "./Posts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import defaultProfileImage from "../icons/profile-default.jpg";
import { useRef, useState } from "react";
import DOMPurify from "dompurify";
import { socket } from "../socket";
import { BASEURL } from "../App";

// import { ReactComponent as RepostIcon } from "../icons/repost_icon.svg";

const CreatePosts = ({
  placeholderMessage,
  isReply,
  post_id,
  displayButtons,
  postMedia,
  setOpenPost,
  postCreator,
  quote,
  setQuote,
  user,
}) => {
  const mediaInputRef = useRef();
  const pollOptionsRef = useRef();
  const textareaRef = useRef();
  const [showErrorMessage, setShowErrorMessage] = useState("none");
  const [pollChoice, setPollChoice] = useState(2);
  const [textareaContent, setTextareaContent] = useState("");
  const [pollForm, setPollForm] = useState("");
  const [pollContent, setPollContent] = useState({ duration: "6 Hours" });
  const [disableOptions, setDisableOptions] = useState(false);
  const [buttonsDisplay, setButtonsDisplay] = useState(displayButtons);
  const [textareaPlaceholder, setTextareaPlaceholder] = useState(
    placeholderMessage || "What is happening?!"
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageData, setImageData] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState("");
  const [videoData, setVideoData] = useState("");
  const [videoMimetype, setVideoMimetype] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [startSearch, setStartSearch] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [gifTrending, setGifTrending] = useState("");
  const [gifData, setGifData] = useState("");
  const [mentions, setMentions] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [searchType, setSearchType] = useState("");
  const [gifSearchTerm, setGifSearchTerm] = useState("");
  const [gifSearchResult, setGifSearchResult] = useState("");
  const [selectedGif, setSelectedGif] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

  const handleMediaClick = () => {
    /// disable option works when createPoll is activated, so no images can be upload and user cannot innteract with it
    /// currently is does nothing since createPoll is no implemented
    if (disableOptions) {
      return;
    }
    const click = new MouseEvent("click");
    ///on icon click dsipatch a click to the files input element to open up the files upload pop-up
    mediaInputRef.current.dispatchEvent(click);
  };

  const checkFileSize = (e) => {
    setSelectedGif("");
    const filesize = e.target.files[0].size;
    if (filesize > 26214400) {
      e.target = "";
      return setShowErrorMessage("flex");
    }
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onloadend = () => {
      const result = reader.result;
      const fileType = result.split(";")[0].split(":")[1];
      if (fileType.match("video")) {
        setVideoData(result);
        setVideoMimetype(fileType);
        setImageData("");
        setUploadedImage("");
        return setUploadedVideo(e.target.files[0]);
      } else {
        setImageData(result);
        setVideoData("");
        setUploadedVideo("");
        return setUploadedImage(e.target.files[0]);
      }
    };
  };

  async function searchForUsernameandHashtags(value) {
    try {
      const search = await axios.get(
        `${BASEURL}/social/search?type=${searchType}&searchValue=${value}`
      );
      if (search.status === 200) {
        if (value.length === 5 && search.data.length === 0) {
          setStartSearch(false);
        }
        if (search.data) {
          const filterResults = search.data.filter((element) =>
            searchType === "user"
              ? mentions.indexOf(element.username) === -1
              : hashtags.indexOf(element.hashtag) === -1
          );
          return setSearchResult(filterResults);
        }
        return;
      }
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  const handleSearchUserOnInput = (e) => {
    const userRegex = /@\w+\S/g;
    const searchValue = e.target.textContent.match(userRegex);
    const hashtagregex = /#\w+\S/g;
    const hashtagValue = e.target.textContent.match(hashtagregex);
    if (mentions.length > 0) {
      /// if user deletes username delete it from mentions array
      const filterMentions = mentions.filter((username) =>
        e.target.textContent.includes(username)
      );
      setMentions(filterMentions);
    }
    if (hashtags.length > 0) {
      const filterHashtags = hashtags.filter((hashtag) =>
        e.target.textContent.includes(hashtag)
      );
      setHashtags(filterHashtags);
    }

    if (
      (hashtagValue && hashtagValue.length > 4 && searchType === "hashtag") ||
      (searchValue && searchValue.length > 2 && searchType === "user")
    ) {
      setSearchType("");
      setSearchResult("");
      setStartSearch(false);
      return;
    }

    if (hashtagValue && startSearch && searchType === "hashtag") {
      const hashtagName = hashtagValue[hashtagValue.length - 1].split("#");
      searchForUsernameandHashtags(hashtagName[1]);
    }

    if (searchValue && startSearch && searchType === "user") {
      searchForUsernameandHashtags(searchValue[searchValue.length - 1]);
    }

    //removeMentions just in case filter fails
    if (e.target.textContent.length === 0) {
      setMentions([]);
      setHashtags([]);
    }
  };

  const handleNewPost = async () => {
    if (pollForm && (!pollContent.choice_1 || !pollContent.choice_2)) {
      return;
    } else if (pollForm) {
      if (pollContent.choice_1.length === 0 || !pollContent.choice_2) {
        return;
      } else if (!pollContent.choice_4 && pollChoice === 4) {
        handleSetPollContent(4, "reset");
      } else if (!pollContent.choice_3 && pollChoice === 3) {
        handleSetPollContent(3, "reset");
      }
    }

    let media = imageData || videoData;
    if (!media && selectedGif) {
      media = { gif: selectedGif };
    }
    const quoteID = quote ? quote._id : "";

    let postContent = textareaContent.replace(/&nbsp;/g, " ");
    postContent = DOMPurify.sanitize(postContent);
    const poll =
      pollForm && pollContent.choice_1 && pollContent.choice_2
        ? pollContent
        : "";
    if (isReply) {
      const newPost = {
        creatorID: user._id,
        date: new Date().toISOString(),
        post_content: postContent,
        postID: post_id,
        isReply: true,
        media: media,
        mentions: mentions,
        quote: quoteID,
        hashtags: hashtags,
        poll: poll,
      };
      const options = {
        method: "POST",
        url: BASEURL + "/social/newpost",
        data: newPost,
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios(options);
        if (response.status === 200 && response.data) {
          /// since the page doesn't change, nor the post creator since it's a reply made by the client,
          /// once the updated post return with the new reply, add the post creator information to the updated post fetched
          /// to be rendered.properly
          const updatedPost = response.data;
          updatedPost.creator = postCreator;
          updatedPost.media = postMedia;
          setTextareaContent("");
          navigate(`/${postCreator.username}/post/${post_id}`);
          setIsPosting(false);
          return setOpenPost(updatedPost);
        }
      } catch (error) {
        console.log(error);
        setIsPosting(false);

        return error;
      }
    }
    if (!isReply) {
      const newPost = {
        creatorID: user._id,
        date: new Date().toISOString(),
        post_content: postContent,
        isReply: false,
        media: media,
        mentions: mentions,
        quote: quoteID,
        hashtags: hashtags,
        poll: poll,
      };
      const options = {
        method: "POST",
        url: BASEURL + "/social/newpost",
        data: newPost,
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const post = await axios(options);
        if (post.status === 200) {
          /// since i'ts a new post made by the client, redirect it to the post created.
          console.log(post, "HERE ");
          setOpenPost(post.data);
          if (media) {
            post.data.media = media;
          }
          navigate(`/${user.username}/post/${post.data._id}`);
          setIsPosting(false);
          socket.emit("New Post");
          return setTextareaContent("");
        }
      } catch (error) {
        console.log(error);
        setIsPosting(false);

        return error;
      }
    }
  };

  const handleOpenEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleAddPoll = () => {
    setPollForm(true);
    setDisableOptions(true);
  };

  const handleGetGifs = async () => {
    if (showGifs && gifData) {
      return setShowGifs(false);
    }
    if (!showGifs && gifData) {
      return setShowGifs(true);
    }
    try {
      const response = await axios.get(
        "https://api.giphy.com/v1/gifs/trending?api_key=xJjpeXOvZrE6HcU6WdkHT87eVEMsMj2w&&limit=20&&rating=pg",
        { withCredentials: false }
      );
      if (response.data && response.status === 200) {
        setGifTrending(response.data.data);
        setShowGifs(true);
        return setGifData(response.data.data);
      }
    } catch (error) {
      console.log(error, "ERROR");
      return setGifTrending("Error while getting the images");
    }
  };

  const handleGifSearch = async () => {
    if (gifSearchTerm.length < 3) {
      return;
    } else {
      try {
        const response = await axios.get(
          "https://api.giphy.com/v1/gifs/search?api_key=xJjpeXOvZrE6HcU6WdkHT87eVEMsMj2w&&limit=28&&rating=pg&&q=" +
            gifSearchTerm,
          { withCredentials: false }
        );
        if (response.status === 200 && response.data) {
          setGifSearchResult(response.data.data);
          return setGifData(response.data.data);
        }
      } catch (error) {
        console.log(error, "ERROR");
        return setGifTrending("Error while getting the images");
      }
    }
  };

  const handleSetPollContent = (e, input) => {
    if (input !== "reset") {
      const sanitized = DOMPurify.sanitize(e.target.value);
      return setPollContent((prev) => ({ ...prev, [input]: sanitized }));
    }
    if (input === "reset") {
      const newState = { ...pollContent };
      e === 4 ? delete newState.choice_4 : delete newState.choice_3;
      return setPollContent(newState);
    }
  };

  function handleSelectGif(gif) {
    setSelectedGif(gif);
    setUploadedImage("");
    setUploadedVideo("");
    setVideoData("");
    setImageData("");
    setShowGifs(false);
  }

  function handleMentions(e, isHashtag) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const mention = document.createElement("a");
    !isHashtag
      ? mention.classList.add("mentions")
      : mention.classList.add("hashtag");
    mention.contentEditable = true;
    !isHashtag ? (mention.innerText = "@") : (mention.innerText = "#");
    range.deleteContents();
    range.insertNode(mention);

    const textNode = document.createTextNode("");
    mention.appendChild(textNode);
    range.setStart(textNode, 0);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
    mention.focus();

    e.preventDefault();
    setStartSearch(true);
  }

  const handleAutocomplete = (value) => {
    const regex = searchType === "user" ? /@[^@]*$/ : /#[^#]*$/;
    const lastMatch =
      searchType === "user"
        ? textareaContent.lastIndexOf("@")
        : textareaContent.lastIndexOf("#");
    const str = textareaContent.slice(lastMatch, textareaContent.length);
    if (!value) {
      value = str;
    }
    const replaced = textareaContent.replace(regex, value);

    setTextareaContent(replaced);
    setSearchResult("");
    setStartSearch(false);
    textareaRef.current.innerHTML = textareaRef.current.innerHTML.replace(
      regex,
      `<a class="mentions-link" href="null">${value}</a>`
      /// href here, is only declared because if href is removed it won't get unfocus the element
      // when pŕessing space and fulfilling the operation, with the cursor getting stuck inside the anchor
      /// being unable to exit
    );

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode("");
    textareaRef.current.appendChild(textNode);
    range.setStart(textNode, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    if (mentions.indexOf(value) === -1 && searchType === "user") {
      setSearchType("");
      return setMentions([...mentions, value]);
    } else if (hashtags.indexOf(value) === -1 && searchType === "hashtag") {
      setSearchType("");
      setHashtags([...hashtags, value]);
    } else return;
  };

  return (
    <div id="create-post" style={{ cursor: isPosting ? "wait" : "default" }}>
      <div id="file-size-error" style={{ display: showErrorMessage }}>
        <p>File size is to large! Maximum size allowed is 25MB</p>
        <CloseIcon
          id="close-btn"
          onClick={() => setShowErrorMessage("none")}
          style={{
            width: "20px",
            fill: "white",
            marginLeft: "2rem",
            stroke: "white",
            strokeWidth: "100",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          margin: "20px auto",
        }}
      >
        <img
          className="client-profile-image"
          src={(user && user.profile_img) || defaultProfileImage}
          alt="profile"
        />
      </div>
      <div style={{ marginTop: "1.5rem", marginRight: "1rem" }}>
        <div
          suppressContentEditableWarning={true}
          contentEditable={true}
          ref={textareaRef}
          id="textarea"
          style={{ color: textareaPlaceholder ? "gray" : "white" }}
          onClick={(e) => {
            setTextareaPlaceholder("");
          }}
          onBlur={() => {
            if (textareaContent.length === 0) {
              setTextareaPlaceholder(
                placeholderMessage || "What is happening?!"
              );
            }
          }}
          maxLength={200}
          onKeyDown={(e) => {
            if (e.key === "@" && mentions.length <= 2) {
              setSearchType("user");
              return handleMentions(e);
            }
            if (e.key === "#" && mentions.length <= 2) {
              setSearchType("hashtag");
              return handleMentions(e, "hashtag");
            }
            if (e.key === "Backspace" && textareaContent.length === 0) {
              /// to prevent the deletion of the span showing the placeholder message when nothing is typed in the textarea
              return;
            }
            if (e.code === "Space" || /[^\w\s]/.test(e.key)) {
              if (searchResult[0] && searchType === "user") {
                return handleAutocomplete(searchResult[0].username);
              } else if (searchResult[0] && searchType === "hashtag") {
                return handleAutocomplete(searchResult[0].hashtag);
              } else if (searchType) {
                return handleAutocomplete(false);
              }
            }
          }}
          onInput={(e) => {
            if (e.target.textContent.length === 201) {
              return (e.target.textContent = textareaContent);
            }
            handleSearchUserOnInput(e);

            setTextareaContent(e.target.textContent);
          }}
          value={textareaContent}
          onFocus={() => {
            if (buttonsDisplay === "false") setButtonsDisplay("true");
          }}
        >
          {textareaPlaceholder}
        </div>
        {uploadedImage && (
          <div className="post-media-container" style={{ maxWidth: "90%" }}>
            <img src={URL.createObjectURL(uploadedImage)} alt="" />
            <button
              className="white-button"
              onClick={() => {
                setUploadedImage("");
                setImageData("");
              }}
              style={{
                height: "fit-content",
                width: "fit-content",
                margin: "1rem 0",
              }}
            >
              Delete
            </button>
          </div>
        )}
        {selectedGif && (
          <div
            className="post-media-container"
            style={{ maxWidth: "450px", margin: "0" }}
          >
            <img src={selectedGif} />
            <button
              className="white-button"
              onClick={() => setSelectedGif("")}
              style={{
                height: "fit-content",
                width: "fit-content",
                margin: "1rem 0",
              }}
            >
              Delete
            </button>
          </div>
        )}
        {videoData && (
          <div className="post-media-container">
            <video controls>
              <source
                src={URL.createObjectURL(uploadedVideo)}
                type={videoMimetype}
              ></source>
            </video>
            <button
              className="white-button"
              onClick={() => {
                setUploadedVideo("");
                setVideoData("");
              }}
              style={{
                height: "fit-content",
                width: "fit-content",
                margin: "1rem 0",
              }}
            >
              Delete
            </button>
          </div>
        )}
        {quote ? (
          <div id="quotePost">
            <CloseIcon
              className="close-button"
              onClick={() => setQuote(false)}
            />
            <Post quote={quote} user={user} />
          </div>
        ) : null}
        <div className="search-results">
          {searchResult && startSearch
            ? searchResult.map((element) => {
                return (
                  <div
                    key={element._id}
                    onClick={() =>
                      handleAutocomplete(element.username || element.hashtag)
                    }
                  >
                    {element.username && <img src={defaultProfileImage} />}
                    <p style={{ fontWeight: 900, fontSize: "18px" }}>
                      {element.name || element.hashtag}
                    </p>
                    {element.username && (
                      <p style={{ color: "gray", gridColumn: 2 }}>
                        {element.username}
                      </p>
                    )}
                  </div>
                );
              })
            : null}
        </div>
        {pollForm && (
          /// not implemented....
          <div className="poll-container">
            <div ref={pollOptionsRef} className="poll-options">
              <input
                placeholder="Choice 1"
                maxLength={25}
                className="input-style"
                onChange={(e) => handleSetPollContent(e, "choice_1")}
              />
              <input
                placeholder="Choice 2"
                maxLength={25}
                className="input-style"
                onChange={(e) => handleSetPollContent(e, "choice_2")}
              />
              <input
                placeholder="Choice 3"
                maxLength={25}
                className="input-style"
                style={{ display: pollChoice >= 3 ? "flex" : "none" }}
                onChange={(e) => handleSetPollContent(e, "choice_3")}
              />
              {pollChoice === 3 && (
                <button
                  onClick={() => {
                    setPollChoice(2);
                    handleSetPollContent(3, "reset");
                  }}
                >
                  -
                </button>
              )}
              <input
                placeholder="Choice 4"
                maxLength={25}
                className="input-style"
                style={{ display: pollChoice === 4 ? "flex" : "none" }}
                onChange={(e) => handleSetPollContent(e, "choice_4")}
              />

              <button
                onClick={() => {
                  if (pollChoice === 4) {
                    setPollChoice(3);
                    handleSetPollContent(4, "reset");
                  } else {
                    setPollChoice((prev) => prev + 1);
                  }
                }}
              >
                {pollChoice === 4 ? "-" : "+"}
              </button>
            </div>
            <div className="poll-duration">
              <label>
                Duration:
                <select
                  onChange={(e) =>
                    setPollContent((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                >
                  <option>6 Hours</option>
                  <option>12 Hours</option>
                  <option>1 Day</option>
                  <option>2 Day</option>
                </select>
              </label>
              <button
                className="black-button"
                style={{ width: "fti-content", margin: "20px auto auto 0" }}
                onClick={() => {
                  setPollForm(false);
                  setPollChoice(2);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <p
          style={{
            margin: "0 1rem",
            textAlign: "right",
            marginTop: "-14px",
            fontSize: "14px",
            color: "gray",
          }}
        >
          {(textareaContent.length || 0) + "/" + 200}
        </p>
        <hr
          style={{
            border: "solid rgba(128, 128, 128, 0.25) 1px",
            width: "80%",
            marginTop: "1px",
          }}
        ></hr>
        <div
          className="create-post-buttons-container"
          style={{
            display: !displayButtons
              ? "flex"
              : displayButtons && buttonsDisplay === "true"
              ? "flex"
              : "none",
            alignItems: "center",
            maxHeight: "40px",
            justifyContent: "center",
          }}
        >
          <div id="create-actions-wrapper">
            <div onClick={handleMediaClick}>
              <ImageIcon className="create-action" />
              <input
                ref={mediaInputRef}
                type="file"
                hidden={true}
                aria-hidden={true}
                accept="image/png, image/jpeg, video/mp4 video/webm"
                onChange={checkFileSize}
              />
              <p className="tooltip">Media</p>
            </div>
            <div onClick={handleGetGifs}>
              <GifIcon className="create-action" />
              <p className="tooltip">GIF</p>
            </div>
            <div onClick={handleAddPoll}>
              <PollIcon className="create-action" />
              <p className="tooltip">Poll</p>
            </div>
            <div>
              <EmojiIcon
                className="create-action"
                onClick={handleOpenEmojiPicker}
              />
              <p className="tooltip">Emoji</p>
            </div>
          </div>
          {showEmojiPicker && (
            <div
              id="postcreator-emoji-picker"
              style={{ display: showEmojiPicker ? "flex" : "none" }}
            >
              <EmojiPicker
                theme="dark"
                onEmojiClick={(e) => {
                  setTextareaContent((prev) => prev + e.emoji);
                }}
              />
            </div>
          )}
          {showGifs && gifTrending && (
            <div id="gifs-container">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gridColumn: "span 4",
                  marginBottom: ".5rem",
                }}
              >
                {gifSearchResult && (
                  <CloseIcon
                    className="close-button"
                    onClick={() => {
                      setGifData(gifTrending);
                      setGifSearchResult("");
                      setGifSearchTerm("");
                    }}
                  />
                )}
                <input
                  type="text"
                  className="input-style"
                  minLength={3}
                  value={gifSearchTerm}
                  onChange={(e) => setGifSearchTerm(e.target.value)}
                />
                <SearchLogo id="search-button" onClick={handleGifSearch} />
                <p
                  style={{
                    display: "flex",
                    gridColumn: "span 4",
                    fontWeight: 900,
                    margin: "0 1rem",
                  }}
                >
                  Powered By Gyphy
                </p>
              </div>
              {gifData.map((gif) => {
                return (
                  <div
                    key={gif.id}
                    className="gif-item"
                    onClick={() => handleSelectGif(gif.images.downsized.url)}
                  >
                    <div className="gif-tooltip" aria-hidden={true}>
                      <p>{gif.title.toLowerCase()}</p>
                    </div>
                    <img
                      className="gif-image"
                      src={gif.images.downsized.url}
                      alt={gif.title}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <button
            className="blue-button"
            disabled={isPosting || !textareaContent.length}
            onClick={() => {
              setIsPosting(true);
              handleNewPost();
            }}
            style={{
              marginRight: "1rem",
              marginBottom: "9px",
              marginLeft: showEmojiPicker
                ? "-6rem"
                : selectedGif && showGifs
                ? "-18rem"
                : "",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePosts;
