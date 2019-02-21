import React from "react";
import Video from "./Video";
import Checkbox from "./Checkboks";
import "../../Style/VideoSelection.css";

export default class VideoSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      UserId: this.props.userId,
      selectedVideos: []
    };
  }

  componentWillMount() {
    console.log(this.props.userId);
    let func = () => {
      fetch(
        `https://portfolio-builder-server-side.herokuapp.com/showprofile?id=${
          this.props.userId
        }`
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          data.videos.map(item => {
            let id = item.split("=")[1];

            fetch(
              `https://portfolio-builder-server-side.herokuapp.com/getVideoDetails?id=${id}`
            )
              .then(response => {
                return response.json();
              })
              .then(data => {
                this.add({
                  id: data.id,
                  title: data.title,
                  description: data.description,
                  thumbnail: data.thumbnail
                });
              });
          });
        })
        .catch(err => console.log(err));

      this.selectedCheckboxes = new Set();
    };

    setTimeout(func, 5000);
  }

  nextID = (videos = []) => {
    let max = videos.reduce(
      (prev, curr) => (prev.index > curr.index ? prev.index : curr.index),
      -1
    );

    return ++max;
  };

  add = ({ id, title, description, thumbnail }) => {
    this.setState(prevState => ({
      videos: [
        ...prevState.videos,
        {
          id: id,
          title: title,
          description: description,
          thumbnail: thumbnail,
          url: `https://www.youtube.com/watch?v=${id}`,
          index: this.nextID(prevState.videos)
        }
      ]
    }));
  };

  eachVideo = (item, i) => {
    return <Video item={item} key={i} />;
  };

  toggleCheckbox = label => {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  };

  createCheckbox = (label, i) => (
    <Checkbox
      label={this.eachVideo(label)}
      handleCheckboxChange={this.toggleCheckbox}
      key={i}
    />
  );

  handleFormSubmit = e => {
    if (this.selectedCheckboxes !== 4) e.preventDefault();

    for (const checkbox of this.selectedCheckboxes) {
      this.setState(prevState => ({
        selectedVideos: [...prevState.selectedVideos, checkbox]
      }));
    }
  };

  saveToDB = items => {
    let choices = new Array();
    items.map(item => {
      item = item.props.item;
      choices.push(item.index);
    });

    fetch(
      `https://portfolio-builder-server-side.herokuapp.com/chooseVideos?id=${
        this.state.UserId
      }&coices=${choices[0]}&coices=${choices[1]}&coices=${choices[2]}&coices=${
        choices[3]
      }`
    )
      .then(response => {
        return response.json();
      })
      .catch(err => console.log(err));

    this.props.onUpdate();
  };

  render() {
    if (!this.state.selectedVideos.length) {
      return (
        <div className="formContainer">
          <h1 className="sectionTitle">Choose your 4 favorite Videos</h1>
          <form onSubmit={this.handleFormSubmit}>
            <div className="form">
              {this.state.videos.map(this.createCheckbox)}
            </div>
            <div className="btn-container">
              <button
                className="ui right labeled icon button btn"
                type="submit"
              >
                <i className="right arrow icon" />
                Save
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      this.saveToDB(this.state.selectedVideos);
      return <div>Updated!</div>;
    }
  }
}
