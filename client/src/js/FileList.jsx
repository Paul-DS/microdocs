import React from 'react';
import File from './File.jsx';
import Folder from './Folder.jsx';
import DocService from './services/DocService.jsx';

require('../styles/FileList.scss');

export default class FileList extends React.Component {
  constructor(props) {
    super();

    this.state = { files: [] };

    DocService.getFiles(files => {
      this.setState({ files: files });

      if (!this.props.selectedPage) {
        this.props.onSelectFile("");
      }
    });
  }

  render () {
    var mapFiles = file => {
      return file.type == 'dir'
        ? (<Folder key={file.name} path={file.name} name={file.name} files={file.files} selectedFile={this.props.selectedPage} onClick={(path) => this.handleFileClick(path)} />)
        : (<File key={file.name} path={file.name} name={file.name} selectedFile={this.props.selectedPage} onClick={(path) => this.handleFileClick(path)} />);
    };

    var files = this.state.files.map(mapFiles);

    return (
      <div id="file-list">
        <Folder key="/" path="" name="Docs" files={this.state.files} selectedFile={this.props.selectedPage} onClick={(path) => this.handleFileClick(path)} expanded={true} />
      </div>
    );
  }

  handleFileClick(path) {
    this.props.onSelectFile(path);
  }
}
