import React, { Component } from 'react';
import './css/slider.css';

class Slider extends Component {
    componentWillReceiveProps(newProps) {
        if (newProps.clickCounter !== this.props.clickCounter) {
            this.button.click();
        }
    }

    render() {
        return (
            <label className="switch">
                <input type="checkbox" onClick={this.props.onClick} ref={(ref) => this.button = ref} disabled={this.props.isDisabled}/>
                <span className="slider round"></span>
            </label>
        );
    }
}

export default Slider;
