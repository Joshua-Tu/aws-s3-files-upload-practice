import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null, //for single file upload
      selectedFiles: null //for multiple file upload
    };
  }

  singleFileChangedHandler = event => {
    //console.log(event.target.files); //this will show you whats inside the event target.
    this.setState({
      selectedFile: event.target.files[0]
    });
  };

  singleFileUploadHandler = event => {
    const data = new FormData();
    // If file selected
    if (this.state.selectedFile) {
      data.append(
        "profileImage",
        this.state.selectedFile,
        this.state.selectedFile.name
      );
      axios
        .post("/api/profile/profile-img-upload", data, {
          //this is important for the file tobe accepted on serverside
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`
          }
        })
        .then(response => {
          if (response.status === 200) {
            // If file size is larger than expected.
            if (response.data.error) {
              if (response.data.error.code === "LIMIT_FILE_SIZE") {
                this.ocShowAlert("Max size: 2MB", "red");
              } else {
                console.log(response.data);
                // If not the given file type
                this.ocShowAlert(response.data.error, "red");
              }
            } else {
              // Success
              let fileData = response.data;
              console.log("file data image name", fileData.image);
              console.log("file data image location", fileData.location);
              this.ocShowAlert("File Uploaded", "#3089cf");
            }
          }
        })
        .catch(error => {
          // If another error
          this.ocShowAlert(error, "red");
        });
    } else {
      // if file not selected throw error
      this.ocShowAlert("Please upload file", "red");
    }
  };

  // ShowAlert Function
  ocShowAlert = (message, background = "#3089cf") => {
    let alertContainer = document.querySelector("#oc-alert-container"),
      alertEl = document.createElement("div"),
      textNode = document.createTextNode(message);
    alertEl.setAttribute("class", "oc-alert-pop-up");
    $(alertEl).css("background", background);
    alertEl.appendChild(textNode);
    alertContainer.appendChild(alertEl);
    setTimeout(function() {
      $(alertEl).fadeOut("slow");
      $(alertEl).remove();
    }, 3000);
  };

  //////I'll figure out how to use the image location url here.
  getProfileImage() {
    let profileImageContainer = document.querySelector("#profile-image-pic");
  }

  render() {
    //console.log(this.state); //this will show the information for state of selectedFile state, which will change after you choose a file, it contains file information as well
    return (
      <div className="container">
        {/* For Alert box*/}
        <div id="oc-alert-container" />
        {/* Once you upload your profile picture, it should appear here  */}
        <div id="profile-image-pic" />
        {/* Single File Upload*/}
        <div
          className="card border-light mb-3 mt-5"
          style={{ boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)" }}
        >
          <div className="card-header">
            <h3 style={{ color: "#555", marginLeft: "12px" }}>
              Single Image Upload
            </h3>
            <p className="text-muted" style={{ marginLeft: "12px" }}>
              Upload Size: 250px x 250px ( Max 2MB )
            </p>
          </div>
          <div className="card-body">
            <p className="card-text">Please upload an image for your profile</p>
            <input type="file" onChange={this.singleFileChangedHandler} />
            <div className="mt-5">
              <button
                className="btn btn-info"
                onClick={this.singleFileUploadHandler}
              >
                Upload!
              </button>
            </div>
          </div>

          {/* Multiple File Upload */}
          <div
            className="card border-light mb-3"
            style={{ boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)" }}
          >
            <div className="card-header">
              <h3 style={{ color: "#555", marginLeft: "12px" }}>
                Upload Muliple Images
              </h3>
              <p className="text-muted" style={{ marginLeft: "12px" }}>
                Upload Size: 400px x 400px ( Max 2MB )
              </p>
            </div>
            <div className="card-body">
              <p className="card-text">
                Please upload the Gallery Images for your gallery
              </p>

              {/* NOTICE THERE IS A MULTIPLE ATTRIBUTE IN THIS INPUT TAG */}
              <input
                type="file"
                multiple
                onChange={this.multipleFileChangedHandler}
              />
              <div className="mt-5">
                <button
                  className="btn btn-info"
                  onClick={this.multipleFileUploadHandler}
                >
                  Upload!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
