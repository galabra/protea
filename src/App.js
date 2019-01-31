import React, { Component } from 'react';
import Dictionary from './Dictionary.jsx';
import DictionaryPicker from './DictionaryPicker.jsx';
import './css/App.css';

class App extends Component {
    constructor(props) {
        super(props);

        let dictionaryIndexFromLocalStorage = localStorage.getItem('currentDictionaryIndex');;
        let dictionariesListFromLocalStorage = JSON.parse(localStorage.getItem('dictionaries'));
        let dictionaryFromLocalStorage = dictionariesListFromLocalStorage && dictionariesListFromLocalStorage[dictionaryIndexFromLocalStorage];
        this.state = {
            text: '',
            translated: '',
            dictionaryIndex: dictionaryIndexFromLocalStorage || 0,
            dictionariesList: dictionariesListFromLocalStorage || [{name: 'Yidish'}, {name: 'Hebrew'}, {name: 'Arabic'}],
            dictionary: dictionaryFromLocalStorage || [{original: 'a', target: '1'}, {original: 'b', target: '2'}, {original: 'c', target: '3'}]
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
        this.state.dictionary.map(replacement => {
            let from = replacement.original;
            let to   = replacement.target;
            original = original.replace(new RegExp(from, 'g'), to);
            return 0;
        });
        return original;
    }

    updateDictionary = (newDict) => {
        let self = this;
        this.setState(
            { dictionary: newDict },
            () => {
                self.setState({
                    translated: self.translate(self.state.text)
                });
                localStorage.setItem('dictionary', JSON.stringify(newDict));
            }
        );
    }

    addNewDictionaryFromFile = (content) => {
        let dictionariesNamesList = this.state.dictionariesList.reduce((acc, dict) => {
            let tmp = acc;
            tmp.push(dict.name);
            return tmp;
        }, []);
        let newIndex = 1;
        let keep = true;

        while (keep) {
            for (let i = 0; i < dictionariesNamesList.length; i ++) {
                let index = dictionariesNamesList[i].match(/New Dictionary \((\d+)\)/);
                if (index && index[1]*1 === newIndex) {
                    newIndex ++;
                    break;
                }
                else if (i === dictionariesNamesList.length - 1) {
                    keep = false;
                }
            }
        }

        let newDictName = 'New Dictionary (' + newIndex + ')';
        let newDict = {
            name: newDictName,
            content: content
        }

        let tmp = this.state.dictionariesList;
        tmp.push(newDict);
        
        this.setState({
            dictionaryIndex: tmp.length - 1,
            dictionariesList: tmp,
            dictionary: content
        });
        alert(JSON.stringify(this.state.dictionariesList));
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

    pickDictionary = i => {
        this.setState({
            dictionaryIndex: i
        })
    }

    render() {
        return (
            <div id="wrapper">
                <div id="headline">
                    <div>
                        <div>
                            <a href="https://en.wikipedia.org/wiki/Protea#Etymology" target="_blank" rel="noopener noreferrer">
                                Pr<p>o</p>tea
                            </a>
                        </div>
                        <div>
                            t3xt conv3rt3r
                        </div>
                    </div>
                </div>
                <div id="columns">
                    <div className="column" id="col1">
                        <DictionaryPicker
                            dictionariesList={this.state.dictionariesList}
                            dictionaryIndex={this.state.dictionaryIndex}
                            pickDictionary={this.pickDictionary}
                        />
                    </div>
                    <div className="column" id="col2">
                        <Dictionary
                            content={this.state.dictionary}
                            update={this.updateDictionary}
                            addNewDictionaryFromFile={this.addNewDictionaryFromFile}
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
            </div>
        );
    }
}

export default App;
