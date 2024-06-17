import { ReactComponent as ViewsIcon } from "../icons/views_icon.svg";
import { ReactComponent as BookmarkIcon } from "../icons/bookmark_icon.svg";
import { ReactComponent as ShareIcon } from "../icons/share_icon.svg";
import { ReactComponent as ReplyIcon } from "../icons/reply_icon.svg";
import { ReactComponent as RepostIcon } from "../icons/repost_icon.svg";
import { ReactComponent as LikeIcon } from "../icons/like_icon.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import { ReactComponent as FilledLikeIcon } from "../icons/filled_like_icon.svg";
import { ReactComponent as FilledBookmarkIcon } from "../icons/bookmark_icon_filled.svg";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";
import CreatePosts from "./Createposts";
import profileDefaultImage from "../icons/profile-default.jpg";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { BASEURL } from "../App";
function abbreviateNumber(number, decPlaces) {
  ///code by Jeff B  https://stackoverflow.com/users/179216/jeff-b
  //https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
  decPlaces = Math.pow(10, decPlaces);
  var abbrev = ["k", "m", "b"];
  for (var i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);
    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;
      if (number === 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }
      number += abbrev[i];
      break;
    }
  }
  return number;
}

const Repost = ({ post_id, repostsCount, user, setUser }) => {
  const [repost, setRepost] = useState(false);
  const [postRepostCount, setPostRepostCount] = useState(repostsCount);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user && user.posts.length >= 0 && user.posts.indexOf(post_id) >= 0) {
      setRepost(true);
    }
  }, [post_id]);

  const handleClick = async () => {
    try {
      if (!repost) {
        const response = await axios.get(
          BASEURL + "/social/postinteraction/reposts?postid=" + post_id
        );
        if (response.status === 200) {
          setPostRepostCount((prev) => prev + 1);
          setRepost(!repost);
          return setUser(response.data);
        }
        return response;
      }
      if (repost) {
        const response = await axios.get(
          BASEURL + "/social/postinteraction/un-repost?postid=" + post_id
        );
        if (response.status === 200) {
          setPostRepostCount((prev) => prev - 1);
          setRepost(!repost);
          return setUser(response.data);
        }
        return response;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  return (
    <div
      id="repost"
      onClick={() => {
        setShowDropdown(!showDropdown);
      }}
      style={{ color: repost ? "rgb(30, 180, 135)" : "gray" }}
    >
      <RepostIcon
        className="common-action"
        style={{ fill: repost ? "rgb(30, 180, 135)" : "gray" }}
      />
      <p>{abbreviateNumber(postRepostCount, 0)}</p>
      <div
        className="repost-dropdown"
        style={{ display: showDropdown ? "flex" : "none" }}
      >
        <p onClick={handleClick}>Repost</p>
        {/* <p>Share</p> */}
      </div>
    </div>
  );
};

const ReplyDialog = ({
  timeDifference,
  postCreatorName,
  postCreatorUsername,
  postCreatorProfileImage,
  setOpenPost,
  postMedia,
  post_content,
  postCreator,
  post_id,
  user,
  repliesCount,
}) => {
  const replyDialogRef = useRef();
  return (
    <>
      <dialog ref={replyDialogRef}>
        <div>
          <CloseIcon
            className="close-button"
            onClick={() => {
              replyDialogRef.current.close();
            }}
          ></CloseIcon>
          <div
            style={{
              color: "white",
              display: "grid",
              gridTemplateColumns: "40px auto",
              columnGap: "1rem",
              marginTop: "1rem",
            }}
          >
            <div>
              <img
                src={postCreatorProfileImage || profileDefaultImage}
                alt="profile"
                style={{
                  width: "35px",
                  display: "flex",
                  borderRadius: "100%",
                  margin: "auto",
                }}
              />
            </div>
            <hr
              style={{
                gridRow: 2,
                margin: "0 auto",
              }}
            ></hr>
            <div
              style={{
                width: "100%",
                margin: "0",
                fontWeight: "900",
              }}
            >
              {postCreatorName}{" "}
              <span style={{ fontWeight: "normal", color: "gray" }}>
                {postCreatorUsername}
              </span>
              <span style={{ color: "gray", fontWeight: "0" }}>
                · {timeDifference}
              </span>
            </div>
            <p style={{ gridColumn: "2", margin: "-13px 0 0px 0" }}>
              {post_content}
            </p>

            <hr
              style={{
                margin: "0 auto",
              }}
            ></hr>
            <p>
              Replying to{" "}
              <a href={"/" + postCreatorUsername}>{postCreatorUsername}</a>
            </p>
          </div>
          <CreatePosts
            id="reply-post"
            placeholderMessage="Post your reply"
            charactersCount={36}
            isReply={true}
            post_id={post_id}
            postCreator={postCreator}
            setOpenPost={setOpenPost}
            postMedia={postMedia}
            user={user}
          />
        </div>
      </dialog>
      <div id="reply" onClick={() => replyDialogRef.current.showModal()}>
        <ReplyIcon className="common-action" />
        <p>{repliesCount}</p>
      </div>
    </>
  );
};

const Like = ({ post_id, likesCount, user, setUser }) => {
  const [like, setLike] = useState(false);
  const [postLikes, setPostLikes] = useState(likesCount);
  const ref = useRef();

  useEffect(() => {
    if (user && user.likes && user.likes.indexOf(post_id) !== -1) {
      setLike(true);
    }
  }, [user, post_id]);

  const handleClick = async () => {
    if (!like) {
      try {
        const response = await axios.get(
          BASEURL + "/social/postinteraction/likes?postid=" + post_id
        );
        if (response.status === 200) {
          setPostLikes((prev) => prev + 1);
          setLike(!like);
          return setUser(response.data);
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    }
    if (like) {
      try {
        const response = await axios.get(
          BASEURL + "/social/postinteraction/un-like?postid=" + post_id
        );
        if (response.status === 200) {
          setPostLikes((prev) => prev - 1);
          setLike(!like);
          return setUser(response.data);
        }
        return response;
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };
  return (
    <div id="like" onClick={() => handleClick()}>
      <LikeIcon
        ref={ref}
        className="common-action"
        style={{ display: like ? "none" : "flex" }}
      />
      <div
        className="filled-heart-container"
        style={{ display: like ? "flex" : "none" }}
      >
        <div className="particle" style={{ rotate: "0deg" }}></div>
        <div className="particle" style={{ rotate: "50deg" }}></div>
        <div className="particle" style={{ rotate: "100deg" }}></div>
        <div className="particle" style={{ rotate: "150deg" }}></div>
        <div className="particle" style={{ rotate: "200deg" }}></div>
        <div className="particle" style={{ rotate: "250deg" }}></div>
        <div className="particle" style={{ rotate: "300deg" }}></div>
        <div className="particle" style={{ rotate: "330deg" }}></div>
        <FilledLikeIcon
          id="filled-heart"
          className="common-action active"
          style={{
            display: like ? "flex" : "none",
          }}
        />
      </div>
      <p>
        {postLikes < 0
          ? 0
          : like
          ? abbreviateNumber(postLikes + 1, 0)
          : abbreviateNumber(postLikes, 0)}
      </p>
    </div>
  );
};

const Bookmark = ({ post_id, user, setUser }) => {
  const [bookmark, setBookmark] = useState(false);
  useEffect(() => {
    if (user && user.bookmarks && user.bookmarks.indexOf(post_id) !== -1) {
      setBookmark(true);
    }
  });

  const handleClick = async (post_id) => {
    if (!bookmark) {
      try {
        const response = await axios.get(
          BASEURL + "/social/bookmarks?add=true&&postID=" + post_id
        );
        if (response.status === 200) {
          setBookmark(!bookmark);
          return setUser(response.data);
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    }
    if (bookmark) {
      try {
        const response = await axios.get(
          BASEURL + "/social/bookmarks?remove=true&&postID=" + post_id
        );
        if (response.status === 200) {
          setBookmark(!bookmark);
          return setUser(response.data);
        }
        return response;
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };
  return (
    <div id="bookmark" onClick={() => handleClick(post_id)}>
      <BookmarkIcon
        className="common-action"
        style={{ display: bookmark ? "none" : "flex" }}
      />

      <FilledBookmarkIcon
        className="common-action active"
        style={{
          display: bookmark ? "flex" : "none",
        }}
      />
    </div>
  );
};

const MoreOptionsDropdown = ({
  setUser,
  post_id,
  userInteractedPosts,
  setUserInteractedPosts,
  isReply,
  post,
  setOpenPost,
  setErrorMessage,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState("none");

  function updateClientProfileUI() {
    if (!isReply) {
      const filterDeletePost = userInteractedPosts.filter(
        (element) => element.isReply === false && element._id !== post_id
      );
      return setUserInteractedPosts(filterDeletePost);
    } else {
      const filterDeletePost = userInteractedPosts.filter(
        (element) => element.isReply === true && element._id !== post_id
      );
      return setUserInteractedPosts(filterDeletePost);
    }
  }

  const handleDeletePost = async () => {
    try {
      const response = await axios.get(
        BASEURL + "/social/delete-post?postID=" + post_id
      );
      if (response.status === 200) {
        setUser(response.data);
        setShowConfirmationDialog("none");
        return updateClientProfileUI();
      }
      return;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleOpenOp = async () => {
    try {
      const response = await axios.get(
        BASEURL + "/social/find-op?replyID=" + post_id
      );
      if (response.status === 200) {
        setOpenPost(
          response.data.creatorID,
          response.data._id,
          ...response.data
        );
      }
    } catch (error) {
      console.log(error);
      setShowConfirmationDialog("none");
      setShowDropdown(false);
      return setErrorMessage("Post not found or was deleted by the author");
    }
  };

  return (
    <div
      id="more-options"
      className="post-options"
      style={{
        marginLeft: "auto",
        marginRight: "20px",
        fontWeight: "900",
        borderRadius: "100%",
      }}
    >
      <p
        style={{ margin: 0 }}
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowConfirmationDialog("none");
        }}
      >
        ···
      </p>
      <div
        className="dropdown"
        style={{ display: showDropdown ? "flex" : "none" }}
      >
        {isReply ? <p onClick={handleOpenOp}>View orignal post</p> : null}
        <p onClick={() => setShowConfirmationDialog("flex")}>Delete</p>
        <div
          className="confirmation-dialog"
          style={{ display: showConfirmationDialog }}
        >
          <p>
            This action cannot be undone. Are you sure you want to delete this
            post?
          </p>
          <div>
            <button
              className="white-button"
              onClick={() => setShowConfirmationDialog("none")}
            >
              Cancel
            </button>
            <button className="black-button" onClick={handleDeletePost}>
              Acept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Post = ({
  userInteractedPosts,
  setUserInteractedPosts,
  userInteractedPostsCount,
  quote,
  onlyFollowingPosts,
  stopPostQuote,
  loadMore,
  setUser,
  setQuote,
  hashtag,
  user,
  setOpenPost,
  openPost,
  updatePosts,
  setThirdPartyUser,
  setUpdatePosts,
}) => {
  const navigate = useNavigate();
  const [postsData, setPostsData] = useState(null);
  const [postsCount, setPostsCount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPostHasQuote, setCurrentPostHasQuote] = useState(true);
  const [currentTab, setCurrentTab] = useState(onlyFollowingPosts);
  const [fetchedPosts, setFetchedPosts] = useState(false);
  const postContentRef = useRef(null);

  async function savePostsID(data) {
    const mapData = data.map((post) => {
      return post._id;
    });
    if (sessionStorage.getItem("fetchedPosts")) {
      const array = sessionStorage.getItem("fetchedPosts").split(",");
      for (const element of mapData) {
        array.push(element);
      }
      sessionStorage.setItem("fetchedPosts", array);
      return setFetchedPosts(array);
    } else {
      sessionStorage.setItem("fetchedPosts", mapData);
      return setFetchedPosts(mapData);
    }
  }

  async function getLatestsPosts(onlyFollowing, hashtag, tabChanged) {
    const postsKeyName =
      onlyFollowingPosts !== "explore" ? "onlyFollowingPostsData" : "postsData";
    const postCountKey =
      onlyFollowingPosts !== "explore"
        ? "onlyFollowingPostsCount"
        : "postsCount";

    try {
      const response = await axios.get(
        `${BASEURL}/social?only_following=${onlyFollowing}&&hashtag_filter=${hashtag}&&hashtag_skip=${
          hashtag && postsData ? postsData.length : 0
        }&&fetched_posts=${onlyFollowing ? false : fetchedPosts}`
      );
      if (response.status === 200 && response.data.posts.length === 0) {
        return;
      }
      if (
        response.status === 200 &&
        response.data.posts.length > 0 &&
        (tabChanged || !postsData)
      ) {
        setPostsData(response.data.posts); /// get actual posts
        setPostsCount(response.data.documentsCount); /// get total applicable post count
        if (typeof sessionStorage !== "undefined" && !hashtag) {
          // if sessions storage is available save fetched posts
          sessionStorage.setItem(
            postsKeyName,
            JSON.stringify(response.data.posts)
          );
          sessionStorage.setItem(postCountKey, response.data.documentsCount);
          await savePostsID(response.data.posts);
        }
        setIsLoading(false);

        return postsData;
      } else if (response.status === 200 && response.data.posts.length > 0) {
        /// if load more posts is triggered,
        setPostsCount(response.data.documentsCount);
        sessionStorage.setItem(postCountKey, response.data.documentsCount);
        if (typeof sessionStorage !== "undefined" && !hashtag) {
          const sessionPosts = JSON.parse(sessionStorage.getItem(postsKeyName));
          if (
            new Date(response.data.posts[0].date) > new Date(postsData[0].date)
          ) {
            sessionPosts.unshift(...response.data.posts);
          } else {
            sessionPosts.push(...response.data.posts);
          }
          setPostsData(sessionPosts);
          sessionStorage.setItem(postsKeyName, JSON.stringify(sessionPosts));
          await savePostsID(response.data.posts);
        }
        if (hashtag) {
          setPostsData((prev) => [...prev, ...response.data.posts]);
        }
        if (updatePosts) {
          setUpdatePosts(false);
          return postsData;
        }
        return postsData;
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  const handleViewUserProfile = (userClicked) => {
    userClicked.clientID = user._id;
    setThirdPartyUser(userClicked);
    navigate(`/profile/${userClicked.username}`);
  };

  const handleNavigate = (creator, id, post, e) => {
    if (
      e.target.className === "input-style" ||
      e.target.className === "option-progress-bar" ||
      e.target.parentElement.className === "option-progress-bar"
    ) {
      return;
    }
    setOpenPost(post);
    navigate(`/${creator}/post/${id}`);
  };

  const handlePollVote = async (poll, choice, postID, isExpired) => {
    const userVoted =
      poll.choice_1_voters && poll.choice_1_voters.indexOf(user._id) !== -1
        ? true
        : poll.choice_2_voters && poll.choice_2_voters.indexOf(user._id) !== -1
        ? true
        : poll.choice_3_voters && poll.choice_3_voters.indexOf(user._id) !== -1
        ? true
        : poll.choice_4_voters && poll.choice_4_voters.indexOf(user._id) !== -1
        ? true
        : false;
    if (userVoted || isExpired) {
      return;
    } else {
      try {
        const response = await axios.get(
          `${BASEURL}/social/poll-vote?postID=${postID}&&choice=${choice}&&userID=${user._id}`
        );
        if (response.status === 200) {
          if (sessionStorage.getItem("postsData")) {
            const parse = await JSON.parse(sessionStorage.getItem("postsData"));
            const findPost = parse.map((element) => {
              if (element._id === postID) {
                element.poll = response.data.poll;
                return element;
              } else {
                return element;
              }
            });
            setPostsData(findPost);
            sessionStorage.setItem("postsData", JSON.stringify(findPost));
          }
          return;
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };

  const parsePosts = async (followingPosts) => {
    const postsKeyName =
      followingPosts !== "explore" ? "onlyFollowingPostsData" : "postsData";
    const postsKeyCount =
      followingPosts !== "explore" ? "onlyFollowingPostsCount" : "postsCount";
    /// if the sessions currently holds posts data, set it to postsData to not fetch them again.
    const posts = await JSON.parse(sessionStorage.getItem(postsKeyName));

    const posts_count = Number(sessionStorage.getItem(postsKeyCount));
    setPostsCount(posts_count);
    setPostsData(posts);
    setIsLoading(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem("fetchedPosts")) {
      setFetchedPosts(sessionStorage.getItem("fetchedPosts").split(","));
    }
    if (hashtag) {
      setFetchedPosts(false);
      getLatestsPosts(false, hashtag);
    }
    if (updatePosts) {
      getLatestsPosts(false, false);
    }
    if (quote) {
      if (quote === "removed") {
        quote = {
          _id: "none",
          creatorID: "none",
          date: "",
          post_content: "[deleted]",
          tags: [],
          replies: [],
          isReply: false,
          shared: 0,
          views: 0,
          likes: 0,
          reposts: 0,
          read: false,
          __v: 0,
          creator: {
            _id: "removed",
            name: "[deleted]",
            username: "",
          },
        };
      }
      setPostsData([quote]);
      setIsLoading(false);
    }
    if (openPost) {
      /// expand post
      setPostsData([openPost]);
      setPostsCount(openPost?.replies.length);
      setIsLoading(false);
    }
    if (userInteractedPosts) {
      ///get replied or liked posts
      setPostsData(userInteractedPosts);
      setPostsCount(userInteractedPosts.length);
      setIsLoading(false);
    }

    if (
      !userInteractedPosts &&
      !openPost &&
      onlyFollowingPosts === "explore" &&
      !hashtag
    ) {
      if (
        sessionStorage.getItem("postsData") !== "null" &&
        sessionStorage.length > 0
      ) {
        setPostsData("");
        parsePosts(onlyFollowingPosts);
      } else {
        setPostsData("");
        setIsLoading(true);
        getLatestsPosts(false, false, true);
      }
    } else if (
      !userInteractedPosts &&
      !openPost &&
      onlyFollowingPosts >= 0 &&
      !hashtag
    ) {
      if (
        sessionStorage.getItem("onlyFollowingPostsData") !== null &&
        sessionStorage.length > 0
      ) {
        setPostsData("");
        parsePosts(onlyFollowingPosts);
      } else {
        setPostsData("");
        setIsLoading(true);
        getLatestsPosts(true, false, true);
      }
    }
  }, [userInteractedPosts, openPost, currentTab, hashtag, updatePosts]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div style={{ width: "5rem" }}>
          <LoadingAnimation></LoadingAnimation>
        </div>
      </div>
    );
  }

  if (onlyFollowingPosts === 0) {
    return (
      <div>
        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bolder",
          }}
        >
          Nothing to show.
          <br /> You are not following anyone yet!
        </p>
      </div>
    );
  }

  if (onlyFollowingPosts > 0 && postsData.length === 0) {
    return (
      <div>
        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bolder",
          }}
        >
          Nothing to show.
          <br /> The people you follow haven't posted yet!
        </p>
      </div>
    );
  }

  const mapData = postsData?.map((post) => {
    const {
      _id,
      post_content,
      date,
      likes,
      reposts,
      replies,
      poll = false,
      media = false,
    } = post;

    let totalVotes;
    let pollExpired = false;

    if (poll) {
      const votes1 = poll.choice_1_voters?.length || 0;
      const votes2 = poll.choice_2_voters?.length || 0;
      const votes3 = poll.choice_3_voters?.length || 0;
      const votes4 = poll.choice_4_voters?.length || 0;

      totalVotes = votes1 + votes2 + votes3 + votes4;

      const now = new Date();
      const pollDate = new Date(date);
      const hoursDifference = differenceInHours(now, pollDate);
      switch (poll.duration) {
        case "6 Hours":
          hoursDifference >= 6 ? (pollExpired = true) : (pollExpired = false);
          break;
        case "12 Hours":
          hoursDifference >= 12 ? (pollExpired = true) : (pollExpired = false);
          break;
        case "1 Day":
          hoursDifference >= 24 ? (pollExpired = true) : (pollExpired = false);
          break;
        case "2 Days":
          hoursDifference >= 48 ? (pollExpired = true) : (pollExpired = false);
          break;
        default:
          pollExpired = false;
          break;
      }
    }

    const postDate = date ? new Date(date) : false;
    const timeDifference = postDate ? formatDistanceToNow(postDate) : "";
    let mimeType;
    if (media && !media.includes("giphy")) {
      mimeType = media.split(";")[0].split(":")[1];
    } else if (media && media.includes("giphy")) {
      mimeType = "GIF";
    }

    let formattedPostContent = false;
    if (
      (post_content && post_content.includes("@")) ||
      (post_content && post_content.includes("#"))
    ) {
      // const userRegex = /@\w+/gi;
      // const hashtahRegex = /#\w+/gi;
      const linkedRegex = /(@|#)\w+/gi;
      const regex = /(@|#)\w+/gi;
      const linked = post_content.match(linkedRegex);
      formattedPostContent = post_content.split(regex);
      for (let i = 0; i < formattedPostContent.length; i++) {
        if (
          formattedPostContent[i] === "@" ||
          formattedPostContent[i] === "#"
        ) {
          formattedPostContent[i] = (
            <a
              className="linked-user"
              href={
                linked[0]?.includes("@")
                  ? "/profile/" + linked[0]
                  : "/hashtags/" + linked[0]?.replace("#", "")
              }
            >
              {linked[0]}
            </a>
          );
          linked.shift();
        } else {
          formattedPostContent[i] = <>{formattedPostContent[i]}</>;
        }
      }
    }

    /* IF the post is a reply made by the client, the server is not fetching de user information 
    // in the server, since post creator is a reply made by the current user,
    // so replace post.creator (which is a third
    // party user), by the client user current information  hence === */
    const name = post.creator ? post.creator.name : user.name;
    const username = post.creator ? post.creator.username : user.username;
    const profile_img = post.creator ? post.creator.profile_img : false;
    const postsAreClients = post.creator ? false : true;
    return (
      <div
        className={quote ? "quote-post" : "post-item"}
        key={quote ? `quote-post${_id}+${Math.random()}` : _id}
      >
        <div
          id="errormessage-container"
          style={{
            display: errorMessage ? "flex" : "none",
            position: "fixed",
          }}
        >
          <p>{errorMessage}</p>
          <CloseIcon
            id="close-btn"
            onClick={() => setErrorMessage("")}
            style={{
              width: "20px",
              fill: "white",
              marginLeft: "2rem",
              stroke: "white",
              strokeWidth: "100",
            }}
          />
        </div>
        <div style={{ display: "flex", height: "100%", width: "70px" }}>
          <img
            alt="profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "100%",
              margin: "10px auto",
              marginRight: "1rem",
            }}
            src={
              postsAreClients
                ? user.profile_img || profileDefaultImage
                : post.creator.profile_img || profileDefaultImage
            }
          />
        </div>
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              height: "3px",
              margin: "9px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                margin: "0",
                height: "14px",
                alignItems: "center",
              }}
            >
              <p
                style={{ fontWeight: "900" }}
                onClick={() => {
                  handleViewUserProfile(post.creator);
                }}
              >
                {name}
              </p>
              <p style={{ marginLeft: "10px", color: "gray" }}>{username}</p>
              <p style={{ marginLeft: "6px", color: "gray" }}>
                · {timeDifference}{" "}
              </p>
            </div>
            {user._id === post.creator?._id || user._id === post.creatorID ? (
              <MoreOptionsDropdown
                post_id={_id}
                setUser={setUser}
                userInteractedPosts={userInteractedPosts}
                setUserInteractedPosts={setUserInteractedPosts}
                isReply={post.isReply}
                post={post}
                setOpenPost={handleNavigate}
                setErrorMessage={setErrorMessage}
              />
            ) : null}
          </div>
          <div
            className="post-content-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              e.bubbles = false;
              if (e.target.nodeName === "A") {
                return;
              }
              handleNavigate(name, _id, post, e);
            }}
          >
            <p className="post-text" ref={postContentRef}>
              {formattedPostContent || post_content}
              {/* stopPostQuote is a boolean to stop infinite rendering when post has a quote */}
              {post.quote && !stopPostQuote && (
                <Post
                  quote={post.quote}
                  user={user}
                  stopPostQuote={true}
                  setOpenPost={setOpenPost}
                  setThirdPartyUser={setThirdPartyUser}
                />
              )}
            </p>
            <div className="post-media-container">
              {media && mimeType.match("image") ? <img src={media} /> : null}
              {media && mimeType.match("video") ? (
                <video controls>
                  <source src={media}></source>
                </video>
              ) : null}
              {media && mimeType === "GIF" ? <img src={media} /> : null}
            </div>
            {poll && (
              <div className="poll-container">
                <div className="poll-options">
                  <p style={{ color: "gray", marginTop: ".3rem" }}>
                    {pollExpired ? "Poll expired" : ""}
                  </p>
                  <div
                    className="input-style"
                    onClick={() =>
                      handlePollVote(poll, "choice_1", _id, pollExpired)
                    }
                  >
                    <div
                      className="option-progress-bar"
                      style={{
                        width:
                          poll.choice_1_voters && poll.choice_1_voters.length
                            ? Math.round(
                                (100 / totalVotes) * poll.choice_1_voters.length
                              ) + "%"
                            : "0%",
                      }}
                    >
                      <p>{poll.choice_1}</p>
                      <p className="choice-votes">
                        {poll.choice_1_voters && poll.choice_1_voters.length
                          ? Math.round(
                              (100 / totalVotes) * poll.choice_1_voters.length
                            ) + "%"
                          : "0%" || 0}
                      </p>
                      <div
                        style={{
                          display:
                            poll.choice_1_voters &&
                            poll.choice_1_voters.indexOf(user._id) !== -1
                              ? "flex"
                              : "none",
                        }}
                      >
                        ✔
                      </div>
                    </div>
                  </div>
                  <div
                    className="input-style"
                    onClick={() =>
                      handlePollVote(poll, "choice_2", _id, pollExpired)
                    }
                  >
                    <div
                      className="option-progress-bar"
                      style={{
                        width:
                          poll.choice_2_voters && poll.choice_2_voters.length
                            ? Math.round(
                                (100 / totalVotes) * poll.choice_2_voters.length
                              ) + "%"
                            : "0%",
                      }}
                    >
                      <p>{poll.choice_2}</p>
                      <p className="choice-votes">
                        {poll.choice_2_voters && poll.choice_2_voters.length
                          ? Math.round(
                              (100 / totalVotes) * poll.choice_2_voters.length
                            ) + "%"
                          : "0%" || 0}
                      </p>
                      <div
                        style={{
                          display:
                            poll.choice_2_voters &&
                            poll.choice_2_voters.indexOf(user._id) !== -1
                              ? "flex"
                              : "none",
                        }}
                      >
                        ✔
                      </div>
                    </div>
                  </div>
                  {poll.choice_3 ? (
                    <div
                      className="input-style"
                      onClick={() =>
                        handlePollVote(poll, "choice_3", _id, pollExpired)
                      }
                    >
                      <div
                        className="option-progress-bar"
                        style={{
                          width:
                            poll.choice_3_voters && poll.choice_3_voters.length
                              ? Math.round(
                                  (100 / totalVotes) *
                                    poll.choice_3_voters.length
                                ) + "%"
                              : "0%",
                        }}
                      >
                        <p>{poll.choice_3}</p>
                        <p className="choice-votes">
                          {poll.choice_3_voters && poll.choice_3_voters.length
                            ? Math.round(
                                (100 / totalVotes) * poll.choice_3_voters.length
                              ) + "%"
                            : "0%" || 0}
                        </p>
                        <div
                          style={{
                            display:
                              poll.choice_3_voters &&
                              poll.choice_3_voters.indexOf(user._id) !== -1
                                ? "flex"
                                : "none",
                          }}
                        >
                          ✔
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {poll.choice_4 ? (
                    <div
                      className="input-style"
                      onClick={() =>
                        handlePollVote(poll, "choice_4", _id, pollExpired)
                      }
                    >
                      <div
                        className="option-progress-bar"
                        style={{
                          width:
                            poll.choice_4_voters && poll.choice_4_voters.length
                              ? Math.round(
                                  (100 / totalVotes) *
                                    poll.choice_4_voters.length
                                ) + "%"
                              : "0%",
                        }}
                      >
                        <p>{poll.choice_4}</p>
                        <p className="choice-votes">
                          {poll.choice_4_voters && poll.choice_4_voters.length
                            ? Math.round(
                                (100 / totalVotes) * poll.choice_4_voters.length
                              ) + "%"
                            : "0%" || 0}
                        </p>
                        <div
                          style={{
                            display:
                              poll.choice_4_voters &&
                              poll.choice_4_voters.indexOf(user._id) !== -1
                                ? "flex"
                                : "none",
                          }}
                        >
                          ✔
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="post-actions">
            <ReplyDialog
              timeDifference={timeDifference}
              setUser={setUser}
              user={user}
              setOpenPost={setOpenPost}
              postCreatorUsername={username}
              post_content={post_content}
              postCreatorName={name}
              postCreatorProfileImage={profile_img}
              post_id={_id}
              postMedia={media}
              repliesCount={replies?.length}
              postCreator={post.creator ? post.creator : ""}
            />
            <Repost
              post_id={_id}
              repostsCount={reposts}
              user={user}
              setUser={setUser}
            />
            <Like
              post_id={_id}
              likesCount={likes}
              user={user}
              setUser={setUser}
            />
            <div
              style={{ display: post.quote || stopPostQuote ? "none" : "flex" }}
              onClick={() => {
                if (post.quote) {
                  return;
                }
                setQuote(post);
              }}
            >
              Quote
            </div>
            <div id="views">
              <ViewsIcon className="common-action" />
              <p>{post.views || 0}</p>
            </div>
            <div
              id="extra-actions"
              style={{ display: "flex", marginRight: "30px", gap: "10px" }}
            >
              <div id="bookmark">
                <Bookmark post_id={_id} user={user} setUser={setUser} />
              </div>
              <div id="share">
                <ShareIcon className="common-action" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      {mapData}
      <InfiniteScroll
        dataLength={postsData?.length}
        initialScrollY={0}
        next={(e) => {
          if (loadMore) {
            loadMore();
          } else if (onlyFollowingPosts !== "explore") {
            getLatestsPosts(true, false);
          } else if (hashtag) {
            getLatestsPosts(false, hashtag);
          } else {
            getLatestsPosts(false, false);
          }
        }}
        hasMore={
          //// (loadMore) profile post lazy loading, only when the client is in /Profile (own or thirdparty)
          openPost /// expannded posts
            ? false
            : loadMore || userInteractedPostsCount
            ? postsData.length === userInteractedPostsCount
              ? false
              : true
            : postsData.length === postsCount /// handles main content (posts)
            ? false
            : true
        }
        loader={
          stopPostQuote ? (
            ""
          ) : (
            <div className="loading-screen">
              <div style={{ width: "5rem" }}>
                <LoadingAnimation></LoadingAnimation>
              </div>
            </div>
          )
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Nothing else to load</b>
          </p>
        }
      ></InfiniteScroll>
    </div>
  );
};

export default Post;
