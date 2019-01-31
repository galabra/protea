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
        this.setState({
            //dictionariesList: this.props.dictionariesList
        });

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

    finishEdit = () => {
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

    onKeyPressed = e => {
        if (13 === e.keyCode) {
            this.finishEdit();
         }
    }

    pickDictionary = i => {
        this.props.pickDictionary(i);
        this.setState({currIndex: i});
    }

    render() {
        let dictionariesNamesList = this.props.dictionariesList.reduce((acc, dict) => {let tmp = acc; tmp.push(dict.name); return tmp;}, []);
        return (
            <div className="menu">
                <div className="menuHeader">
                    Pick a Dictionary:
                </div>
                <div className="dictionaryTable" id="dictionaryPickerTable" ref={ref => this.list = ref}>
                    {
                        dictionariesNamesList.map((dictionaryName, i) => {
                            return  <div
                                        className={`fixedDictRow ${i === this.state.currIndex ? 'checked' : ''} ${i === this.state.editElement.index ? 'editable' : ''}`}
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
                                                onKeyDown={this.onKeyPressed}
                                            />
                                            : dictionaryName
                                            }
                                    </div>;
                        })
                    }
                </div>
                <button id="addNewDictionaryButton" onClick={this.addNewDictionaryButton}>
                    Add New Dictionary
                </button>
            </div>
        );
    }
}

export default DictionaryPicker;
