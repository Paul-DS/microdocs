import React from 'react';

export default class File extends React.Component {
  componentDidMount() {
    if (this.props.path == decodeURI(this.props.selectedFile) && this.props.onExpand) {
      this.props.onExpand();
    }
  }

  render () {
    return (
      <div className={this.props.selectedFile == this.props.path ? "file selected" : "file"} onClick={() => this.handleClick()}>
        <span className="fa fa-file"></span> {this.props.name}
      </div>
    );
  }

  handleClick() {
    var path = this.props.path ? this.props.path : this.props.name;
    this.props.onClick(path);
  }
}
