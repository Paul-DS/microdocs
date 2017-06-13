import React from 'react';
import classNames from 'classnames';
import File from './File.jsx';

export default class Folder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: props.expanded };
  }

  render () {
    return (
      <div className="folder">
        <div className={classNames('file', 'file-dir', { selected: this.props.path == this.props.selectedFile })} onClick={() => this.handleClick()}><span className={this.state.isExpanded ? 'fa fa-folder-open' : 'fa fa-folder'}></span> {this.props.name}</div>
        <div className="files" style={this.state.isExpanded ? null : { display: 'none' }}>
          {
            this.props.files.map(file => file.type == 'dir'
              ? (<Folder key={file.name} path={this.props.path ? this.props.path + '/' + file.name : file.name} name={file.name} selectedFile={this.props.selectedFile} onExpand={() => this.handleExpand()} onClick={this.props.onClick} files={file.files} />)
              : (<File key={file.name} path={this.props.path ? this.props.path + '/' + file.name : file.name} name={file.name} selectedFile={this.props.selectedFile} onExpand={() => this.handleExpand()} onClick={this.props.onClick} />))
          }
        </div>
      </div>
    );
  }

  handleExpand() {
    this.setState({ isExpanded: true });

    if (this.props.onExpand) {
      this.props.onExpand();
    }
  }

  handleClick() {
    if (!this.props.expanded) {
      if (!this.state.isExpanded || (this.state.isExpanded && this.props.path == this.props.selectedFile)) {
        // Close only if selected
        this.setState({ isExpanded: !this.state.isExpanded });
      }
    }

    this.props.onClick(this.props.path);
  }
}
