import React, { Component } from 'react';
import Slider from './Slider.jsx';

class Dictionary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            value: '',
            toggleEditCounter: 0,
        }
    }

    componentDidMount() {
        let freshValue = this.props.content.reduce((acc, replacement) => {
            return acc + replacement.original + '\t' + replacement.target + '\n'
        }, '');

        this.setState({
            value: freshValue
        });
    }

    handleDictionaryTextChange = (newVal, isNewDictFromFile) => {
        let newDict = [];
        newVal = newVal.replace(new RegExp(/[ \t\r]+|,/, 'g'), '\t');

        let rows = newVal.split('\n');
        for (let row of rows) {
            let content = row.split(/\s+/);
            let rowFrom = content[0];
            let rowTo   = content[1];

            if (rowFrom && rowTo) {
                let newRow = {
                    original: rowFrom,
                    target: rowTo
                };
                newDict.push(newRow);
            }
        }

        /*
        this.setState({
            value: newVal,
        });
        this.props.update(newDict);
        */

        if (isNewDictFromFile) {
            this.props.addNewDictionaryFromFile(newDict);
        }
    }

    uploadNewCsv = (event) => {
        let fileExtension = this.fileUpload.value;
        fileExtension = fileExtension.substring(fileExtension.lastIndexOf('.'));
        
        let reader = new FileReader();
        let self = this;
        reader.onload = function () {
            let csvContent = reader.result.replace('\xEF\xBB\xBF', '');
            self.handleDictionaryTextChange(csvContent, true);
        };
        // start reading the file. When it is done, calls the onload event defined above.
        
        if (fileExtension.indexOf('csv') >= 0 || fileExtension.indexOf('txt') >= 0) {
            reader.readAsText(this.fileUpload.files[0], 'ISO-8859-1');
            this.fileUpload.value = '';
            this.setState({
                toggleEditCounter: this.state.toggleEditCounter + 1,
            });
        }
        else {
            alert('Sorry, currently only CSV and TXT files are supported');
        }
    }

    toggleEditMode = () => {
        this.setState({
            editMode: !this.state.editMode,
        });
    }

    handleUploadClick = () => {
        this.fileUpload.click();
    }

    render() {
        const dictionaryTable = () => {
            return <div className={`dictionaryTable ${this.props.content.length > 19 ? 'scrollable' : ''}`} id="fixedDictionary">
                {
                    this.props.content.map((replacement, i) => {
                        let from = replacement.original;
                        let to   = replacement.target;
                        return  <div className="fixedDictRow" key={i}>
                                    <div>{from}</div>
                                    <div>&rarr;</div>
                                    <div>{to}</div>
                                </div>;
                    })
                }
            </div>
        }

        return (
            <div className="menu" id="dictionary">
                <div className="menuHeader">
                    <Slider clickCounter={this.state.toggleEditCounter} onClick={this.toggleEditMode}/>&nbsp; Edit Dictionary
                </div>
                {
                    this.state.editMode ? <div className="dictionaryTable" id="editableDictionary">
                        <textarea className="scrollable" value={this.state.value} onChange={e => this.handleDictionaryTextChange(e.target.value, false)}>
                        </textarea>
                        <input type="file" onChange={this.uploadNewCsv} ref={(ref) => this.fileUpload = ref}/>
                    </div> : dictionaryTable()
                }
                {
                    this.state.editMode && <button onClick={this.handleUploadClick} ref={(ref) => this.fileUploadButton = ref}>
                            Upload Dictionary
                        </button>
                }
            </div>
        );
    }
}

export default Dictionary;
