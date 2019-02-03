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

    componentWillReceiveProps(newProps) {
        if (newProps.exitEditModeCounter !== this.props.exitEditModeCounter) {
            this.setState({
                editMode: false
            })
        }
    }

    componentDidMount() {
        let freshValue = '';
        if (this.props.content !== null) {
            freshValue = this.props.content.content.reduce((acc, replacement) => {
                return acc + replacement.original + '\t' + replacement.target + '\n'
            }, '');
        }

        this.setState({
            value: freshValue
        });
    }

    handleTextChange = (newVal) => {
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
        
        this.setState({
            value: newVal,
        });
        let dictName = this.props.content.name;
        this.props.update({name: dictName, content: newDict});
    }

    toggleEditMode = () => {
        if (this.state.editMode) {
            this.setState({
                editMode: false,
            });
        }
        else if (this.props.content !== null) {
            let freshValue = this.props.content.content.reduce((acc, replacement) => {
                return acc + replacement.original + '\t' + replacement.target + '\n'
            }, '');
            
            let self = this;

            this.setState({
                value: freshValue
            }, () => {
                self.setState({
                    editMode: true,
                });
            });
        }
    }

    render() {
        const generateFixedDictionary = () => {
            return this.props.content === null ?
                <div className="dictionaryTable" id="fixedDictionary"></div> :
                <div className={`dictionaryTable ${this.props.content.content.length > 19 ? 'scrollable' : ''}`} id="fixedDictionary">
                    {
                        this.props.content.content.map((replacement, i) => {
                            let from = replacement.original;
                            let to   = replacement.target;

                            let isValid = true;
                            for (let j = 0; j < i; j ++) {
                                if (from.indexOf(this.props.content.content[j].original) !== -1) {
                                    isValid = false;
                                    break;
                                }
                            }

                            return  <div
                                        className={`fixedDictRow ${isValid ? '' : 'invalid'}`}
                                        title={isValid ? '' : 'This expression is blocked by an earlier expression'}
                                        aria-label={isValid ? '' : 'This expression is blocked by an earlier expression'}
                                        key={i}
                                    >
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
                    <Slider
                        isDisabled={this.props.content === null}
                        clickCounter={this.state.toggleEditCounter}
                        onClick={this.toggleEditMode}
                    />
                    &nbsp; Edit Dictionary
                </div>
                {
                    this.state.editMode ?
                    <div className="dictionaryTable" id="editableDictionary">
                        <textarea className="scrollable" value={this.state.value} onChange={e => this.handleTextChange(e.target.value)}>
                        </textarea>
                    </div>
                    : generateFixedDictionary()
                }
            </div>
        );
    }
}

export default Dictionary;
