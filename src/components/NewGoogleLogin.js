import DatePicker from "./DatePicker";
import { useState } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASEURL } from "../App";
const NewGoogleLogin = ({ user, setUser }) => {
  const [dateOfBirth, setDateOFBirth] = useState(null);
  const [username, setUsername] = useState(
    "@" + user.name + randomNumberString()
  );
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  function randomNumberString() {
    const characters = "0123456789";
    let newNumber = "";
    for (let i = 0; i < 9; i++) {
      newNumber += characters.charAt(
        Math.floor(Math.random() * characters.length - 1)
      );
    }
    return newNumber;
  }

  const handleCommonInfoUpdate = async () => {
    const checkUsername = DOMPurify.sanitize(username);
    const regex = /^@?[a-zA-Z0-9]+$/;
    const match = regex.test(checkUsername);

    if (!dateOfBirth) {
      return setErrorMessage("You need to provide a date of birth");
    }

    if (match && dateOfBirth) {
      let finalUsername;
      checkUsername.startsWith("@")
        ? (finalUsername = username)
        : (finalUsername = "@" + username);

      const splitDOB = dateOfBirth.split("/");
      const IsoDate = new Date(
        splitDOB[0],
        splitDOB[1],
        splitDOB[2]
      ).toISOString();
      try {
        finalUsername = DOMPurify.sanitize(finalUsername);
        const response = await axios.get(
          `${BASEURL}/social/common-account-changes?username=${finalUsername}&&date_of_birth=${IsoDate}`
        );
        if (response.status === 200) {
          setUser(response.data);
          navigate("/Profile");
        }
      } catch (error) {
        console.log(error);
        if (error && error.response.data.message) {
          return setErrorMessage(error.response.data.message);
        }
        return setErrorMessage("An unexpected error has ocurred");
      }
    } else {
      return setErrorMessage(
        "Username cannot contain symbols other than @ at the beginning"
      );
    }
  };

  return (
    <div id="new-google-login-page">
      <div>
        <h1>Welcome to Socially!</h1>
        <h3>Let's finish setting up your account</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p>Pick a username</p>
        <input
          type="text"
          className="input-style"
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <p>Date of Birth:</p>
        <DatePicker setDateOFBirth={setDateOFBirth}></DatePicker>
        <p style={{ textAlign: "center", color: "darkorange" }}>
          {errorMessage}
        </p>
        <button className="white-button" onClick={handleCommonInfoUpdate}>
          Finish
        </button>
      </div>
    </div>
  );
};

export default NewGoogleLogin;
