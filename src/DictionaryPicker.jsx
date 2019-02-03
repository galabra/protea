import React, { Component } from 'react';

class DictionaryPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dictionariesList: this.props.dictionariesList.reduce((acc, dict) => {let tmp = acc; tmp.push(dict.name); return tmp;}, []),
            currIndex: this.props.dictionaryIndex,
            editElement: {index: -1, ref: null},
            addingNewDictionary: false,
        }
    }

    componentDidMount() {
        let self = this;
        window.addEventListener('click', function(e) {   
            if (self.state.editElement.ref && self.state.editElement.ref.contains(e.target)){
              // Clicked in box
            } else if (! self.state.addingNewDictionary) {
                self.finishEdit();
            }
          });

        for (let i = 0; i < self.list.children.length; i ++) {
            let row = self.list.children[i];
            if (row.classList.contains('editable')) {
                this.setState({
                    editElement: {index: i, ref: row}
                });
                row.children[0].focus();
            }
        }
    }

    addNewDictionary = (newDictionaryName, newDictionaryContent) => {
        let newIndex = 1;
        let keep = true;
        let tmp = this.state.dictionariesList;
        let newDictName = newDictionaryName;

        if (newDictName === '') {
            while (tmp.length > 0 && keep) {
                for (let i = 0; i < this.state.dictionariesList.length; i ++) {
                    let index = this.state.dictionariesList[i].match(/New Dictionary \((\d+)\)/);
                    if (index && index[1]*1 === newIndex) {
                        newIndex ++;
                        break;
                    }
                    else if (i === this.state.dictionariesList.length - 1) {
                        keep = false;
                    }
                }
            }

            newDictName = 'New Dictionary (' + newIndex + ')';
        }
        tmp.push(newDictName);

        let newEditElement = {
            index: tmp.length - 1,
            ref: null
        }

        let self = this;
        this.setState({
            addingNewDictionary: true
        }, () => {
            self.setState({
                editElement: newEditElement,
                dictionariesList: tmp,
                currIndex: newEditElement.index,
            }, () => {
                let ref = self.list.children[self.list.children.length - 1];
                ref.children[0].focus();
                self.setState({
                    editElement: {index: tmp.length - 1, ref: ref},
                })
            })
        });

        setTimeout(() => {
            self.setState({
                addingNewDictionary: false
            })
        }, 100);

        this.props.addNewDictionary({name: newDictName, content: newDictionaryContent});
    }

    uploadNewDictionaryButton = () => {
        this.fileUpload.click();
    }

    finishEdit = () => {
        let index = this.state.editElement.index;
        if (index > -1) {
            let tmp = JSON.parse(localStorage.getItem('dictionaries'));
            tmp[index].name = this.state.dictionariesList[index];
            localStorage.setItem('dictionaries', JSON.stringify(tmp));
        }
        this.setState({
            editElement: {index: -1, ref: null}
        })
    }

    refCallback(ref, i) {
        let self = this;
        if (ref) {
            ref.ondblclick = () => {
                self.setState({editElement: {index: i, ref: ref}});
                ref.children[0].focus();
            }
        }
    }

    handleDictionaryNameEdit = (event, i) => {
        let tmp = this.state.dictionariesList;
        tmp[i] = event.target.value;

        this.setState({
            dictionariesList: tmp
        });
    }

    ifEnterFinishEdit = e => {
        if (13 === e.keyCode) {
            this.finishEdit();
         }
    }

    pickDictionary = i => {
        this.props.pickDictionary(i);
        this.setState({currIndex: i});
    }

    uploadNewFile = (event) => {
        let fullFileName = this.fileUpload.value;
        let dotIndex = fullFileName.lastIndexOf('.');
        let slashIndex = fullFileName.lastIndexOf('\\');
        let fileName = fullFileName.substring(slashIndex + 1, dotIndex);
        let fileExtension = fullFileName.substring(dotIndex);
        
        let reader = new FileReader();
        let self = this;
        reader.onload = function () {
            let fileContent = reader.result.replace('\xEF\xBB\xBF', '');
            self.addNewDictionary(fileName, self.parseDictionaryAsText(fileContent));
        };
        // start reading the file. When it is done, calls the onload event defined above.
        
        if (fileExtension.indexOf('csv') >= 0 || fileExtension.indexOf('txt') >= 0) {
            reader.readAsText(this.fileUpload.files[0], 'ISO-8859-1');
            this.fileUpload.value = '';
        }
        else {
            alert('Sorry, currently only CSV and TXT files are supported');
        }
    }

    parseDictionaryAsText = (newVal) => {
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
        return newDict;
    }

    removeRow = rowIndex => {
        let tmp = this.state.dictionariesList;
        tmp.splice(rowIndex, 1);

        let newIndex = Math.min(tmp.length - 1, this.state.currIndex);

        this.setState({
            dictionariesList: tmp,
            currIndex: newIndex
        });

        this.props.removeRow(rowIndex);
    }

    render() {
        return (
            <div className="menu">
                <div className="menuHeader">
                    Pick a Dictionary:
                </div>
                <div className="dictionaryTable" id="dictionaryPickerTable" ref={ref => this.list = ref}>
                    {
                        this.state.dictionariesList.map((dictionaryName, i) => {
                            return  <div
                                        className={
                                            `fixedDictRow ${i === this.state.currIndex*1 ? 'checked' : ''} ${i === this.state.editElement.index ? 'editable' : ''}`
                                        }
                                        onClick={() => this.pickDictionary(i)}
                                        ref={(ref) => this.refCallback(ref, i)}
                                        key={i}
                                    >
                                        {
                                            i === this.state.editElement.index ?
                                            <input
                                                type="text"
                                                value={dictionaryName}
                                                onChange={e => this.handleDictionaryNameEdit(e, i)}
                                                onKeyDown={this.ifEnterFinishEdit}
                                            />
                                            : <div className="pickerRowContent">
                                                {dictionaryName}
                                                <div>
                                                    <button className="deleteButton" onClick={() => this.removeRow(i)}>
                                                        &#10005;
                                                    </button>
                                                </div>
                                            </div>
                                            }
                                    </div>;
                        })
                    }
                </div>
                <button id="addNewDictionaryButton" onClick={() => this.addNewDictionary('', [])}>
                    New Empty
                </button>
                <button id="uploadNewDictionaryButton" onClick={this.uploadNewDictionaryButton}>
                    Upload
                </button>
                <input type="file" onChange={this.uploadNewFile} ref={(ref) => this.fileUpload = ref}/>
            </div>
        );
    }
}

export default DictionaryPicker;
