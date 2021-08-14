import React, { Component } from 'react';
import Dictionary from './Dictionary.jsx';
import DictionaryPicker from './DictionaryPicker.jsx';
import './css/App.css';

class App extends Component {
    constructor(props) {
        super(props);

        let dictionaryIndex_LS = localStorage.getItem('currentDictionaryIndex');;
        let dictionariesList_LS = JSON.parse(localStorage.getItem('dictionaries'));
        let dictionary_LS = dictionariesList_LS && dictionariesList_LS[dictionaryIndex_LS];

        this.state = {
            text: '',
            translated: '',
            exitEditModeCounter: 0,
            dictionaryIndex: dictionaryIndex_LS || 0,
            dictionariesList: dictionariesList_LS || [],
            currentDictionary: dictionary_LS || null
        }
    }

    clearInputText = () => {
        let dummyEvent = {
            target: {
                value: ''
            }
        }
        this.handleInputText(dummyEvent);
    }

    handleInputText = (event) => {
        let val = event.target.value;
        let new_val = this.translate(val);

        this.setState({
            text: val,
            translated: new_val,
        });
    }

    translate = (original) => {
        if (this.state.currentDictionary !== null) {
            this.state.currentDictionary.content.map(replacement => {
                let from = replacement.original;
                let to   = replacement.target;
                original = original.replace(new RegExp(from, 'g'), to);
                return 0; // just to prevent compiler warning
            });
        }
        return original;
    }

    updateCurrentDictionary = (newDict) => {
        let tmp_dictionariesList = this.state.dictionariesList;
        tmp_dictionariesList[this.state.dictionaryIndex] = newDict;

        let self = this;
        this.setState({
                currentDictionary: newDict,
                dictionariesList: tmp_dictionariesList
            },
            () => {
                self.setState({
                    translated: self.translate(self.state.text)
                });
            }
        );

        if (localStorage.getItem('dictionaries') === null) {
            localStorage.setItem('currentDictionaryIndex', this.state.dictionaryIndex);
        }
        localStorage.setItem('dictionary', JSON.stringify(newDict));
        localStorage.setItem('dictionaries', JSON.stringify(tmp_dictionariesList));
    }

    addNewDictionary = (newDict) => {
        let self = this;
        let tmp_dictionariesList_LS = this.state.dictionariesList;
        tmp_dictionariesList_LS.push(newDict);

        this.setState({
            exitEditModeCounter: this.state.exitEditModeCounter + 1,
            currentDictionary: newDict,
            dictionariesList: tmp_dictionariesList_LS,
            dictionaryIndex: tmp_dictionariesList_LS.length - 1
        }, () => {
            self.setState({
                translated: self.translate(self.state.text)
            });
        });

        localStorage.setItem('dictionary', JSON.stringify(newDict));
        localStorage.setItem('dictionaries', JSON.stringify(tmp_dictionariesList_LS));
        localStorage.setItem('currentDictionaryIndex', tmp_dictionariesList_LS.length - 1);
    }

    copyTarget = () => {
        this.targetTextElement.disabled = false;
        this.targetTextElement.select();
        document.execCommand('copy', false);
        window.getSelection().removeAllRanges();
        this.targetTextElement.disabled = true;
    }

    handleUploadClick = () => {
        this.inputFileUpload.click();
    }

    uploadNewInputFile = (event) => {
        let fileExtension = this.inputFileUpload.value;
        fileExtension = fileExtension.substring(fileExtension.lastIndexOf('.'));

        let reader = new FileReader();
        let self = this;
        reader.onload = function () {
            let val = reader.result.replace('\xEF\xBB\xBF', '');
            let dummyEvent = {
                target: {
                    value: val
                }
            }
            self.handleInputText(dummyEvent);
        };
        // start reading the file. When it is done, calls the onload event defined above.

        if (fileExtension.indexOf('txt') >= 0) {
            reader.readAsText(this.inputFileUpload.files[0], 'ISO-8859-1');
        }
        else {
            alert('Sorry, currently only TXT files are supported');
        }
        this.inputFileUpload.value = '';
    }

    pickDictionary = rowIndex => {
        let nextDict = rowIndex === -1 ? null : this.state.dictionariesList[rowIndex];

        this.setState({
            exitEditModeCounter: this.state.exitEditModeCounter + 1,
            currentDictionary: nextDict,
            dictionaryIndex: rowIndex,
        }, () => {
            this.setState({
                translated: this.translate(this.state.text),
            })
        });

        localStorage.setItem('dictionary', rowIndex === -1 ? null : JSON.stringify(nextDict));
        localStorage.setItem('currentDictionaryIndex', rowIndex);
    }

    removeRow = rowIndex => {
        let tmp_dictionariesList_LS = JSON.parse(localStorage.getItem('dictionaries'));
        tmp_dictionariesList_LS.splice(rowIndex, 1);
        let newIndex = Math.min(tmp_dictionariesList_LS.length - 1, this.state.dictionaryIndex);

        localStorage.setItem('dictionaries', JSON.stringify(tmp_dictionariesList_LS));

        let newCurrentDictionary = newIndex === -1 ? null : tmp_dictionariesList_LS[newIndex];

        this.setState({
            dictionaryIndex: rowIndex,
            dictionariesList: tmp_dictionariesList_LS,
            currentDictionary: newCurrentDictionary,
        }, () => this.pickDictionary(newIndex));
    }

    render() {
        return (
            <div id="wrapper">
                <div id="headline">
                    <div>
                        <div>
                            <div>
                                <a href="https://en.wikipedia.org/wiki/Protea#Etymology" target="_blank" rel="noopener noreferrer">
                                    Protea
                                </a>
                            </div>
                            <div>
                                t<p>3</p>xt conv<p>3</p>rt<p>3</p>r
                            </div>
                        </div>
                    </div>
                </div>
                <div id="columns">
                    <div className="column" id="col1">
                        <DictionaryPicker
                            dictionariesList={this.state.dictionariesList}
                            dictionaryIndex={this.state.dictionaryIndex}
                            pickDictionary={this.pickDictionary}
                            addNewDictionary={this.addNewDictionary}
                            removeRow={this.removeRow}
                        />
                    </div>
                    <div className="column" id="col2">
                        <Dictionary
                            content={this.state.currentDictionary}
                            update={this.updateCurrentDictionary}
                            exitEditModeCounter={this.state.exitEditModeCounter}
                        />
                    </div>
                    <div className="column" id="col3">
                        <div className="textWrapper" id="sourceText">
                            <div className="textWrapperHeader">
                                <div>
                                    Source Text
                                </div>
                                <div>
                                    <button className="textareaButton" onClick={this.handleUploadClick}>Upload</button>
                                    <button className="textareaButton" onClick={this.clearInputText}>Clear</button>
                                </div>
                            </div>
                            <textarea
                                className="mainTextarea"
                                value={this.state.text}
                                onChange={this.handleInputText}
                                placeholder="Please insert text here"
                            ></textarea>
                        </div>
                        <div className="textWrapper" id="targetText">
                            <div className="textWrapperHeader">
                                <div>
                                    Target Text
                                </div>
                                <button className="textareaButton" id="copyTarget" onClick={this.copyTarget}>Copy</button>
                            </div>
                            <textarea
                                className="mainTextarea"
                                value={this.state.translated}
                                ref={(ref) => this.targetTextElement = ref}
                                placeholder="Magically, the converted text will appear here"
                                onChange={() => false}
                            ></textarea>

                            <input type="file" onChange={this.uploadNewInputFile} ref={(ref) => this.inputFileUpload = ref}/>
                        </div>
                    </div>
                </div>
                <div id="footer">
                    <a href="https://www.linkedin.com/in/galabra/" target="_blank" rel="noopener noreferrer">
                        Gal Abramovitz
                    </a>
                    , 2019
                </div>
            </div>
        );
    }
}

export default App;
