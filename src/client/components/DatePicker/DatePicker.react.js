import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './DatePicker.less';
import DayPicker from '../DayPicker';
import { spring, presets, Motion } from 'react-motion';
import isEqual from 'lodash/isEqual';
import { Portal } from 'react-portal';
import { getCoords, splitProps, zeroTime } from '../utils';

let springPreset = presets.gentle;
let easeOutCubic = (t) => (--t) * t * t + 1; // eslint-disable-line no-param-reassign

let propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  locale: PropTypes.string,
  modifiers: PropTypes.object,
  onChange: PropTypes.func,
  showToLeft: PropTypes.bool,
  showToTop: PropTypes.bool,
  tabIndex: PropTypes.number,
  value: PropTypes.object
};

let defaultProps = {
  className: '',
  disabled: false,
  locale: 'en',
  modifiers: {},
  onChange: () => {},
  showToLeft: false,
  showToTop: false,
  tabIndex: 0,
  value: null
};

export default
class DatePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPicker: false
    };
  }

  componentDidMount() {
    document.body.addEventListener('click', this.handleBodyClick);
    document.body.addEventListener('keydown', this.handleBodyKeyDown);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.showPicker !== nextState.showPicker ||
      this.props.className !== nextProps.className ||
      this.props.disabled !== nextProps.disabled ||
      this.props.locale !== nextProps.locale ||
      this.props.showToLeft !== nextProps.showToLeft ||
      this.props.showToTop !== nextProps.showToTop ||
      this.props.tabIndex !== nextProps.tabIndex ||
      !isEqual(this.props.value, nextProps.value)
    );
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleBodyClick);
    document.body.removeEventListener('keydown', this.handlePortalClose);
  }

  handlePortalClose = event => {
    this.hidePicker();
  };

  handleDayClick = (value, modifiers) => {
    if (modifiers.disabled) {
      return;
    }

    this.handleDateChange(value);
    this.hidePicker();
  };

  handleToggleClick = () => {
    if (this.state.showPicker) {
      this.hidePicker();
    } else {
      this.showPicker();
    }
  };

  handleDateChange = value => {
    this.props.onChange(zeroTime(value));
  };

  handleBodyClick = event => {
    let clickedOutside = (
      !this.container.contains(event.target) &&
      !this.datePickerRef.contains(event.target)
    );

    if (clickedOutside) {
      this.hidePicker();
    }
  };

  handleBodyKeyDown = event => {
    if (event.which === 9) {
      this.hidePicker();
    }
    if (event.which === 27) { // ESC key
      this.hidePicker();
    }
  };

  showPicker() {
    this.setState({ showPicker: true });
  }

  hidePicker() {
    this.setState({ showPicker: false });
  }

  render() {
    let {
      className,
      disabled,
      locale,
      onChange, // eslint-disable-line no-unused-vars
      showToLeft,
      showToTop,
      tabIndex,
      value,
      ...restProps
    } = this.props;

    let { showPicker } = this.state;

    let splittedProps = splitProps(restProps, Object.keys(DayPicker.propTypes));
    let commonProps = splittedProps[0];
    let dayPickerSpecificProps = splittedProps[1];

    let pickerElement = (
      <DayPicker
        dayPickerRef={el => (this.reactDayPicker = el)}
        locale={locale}
        month={value}
        selectedDays={value}
        tabIndex={-1}
        fixedWeeks={true}
        onDayClick={this.handleDayClick}
        onChange={this.handleDateChange}
        { ...dayPickerSpecificProps }
      />
    );

    let { top, left } = getCoords(this.container, showToTop, showToLeft);

    let pickerMotionElement = (
      <Motion
        defaultStyle={{ x: showPicker ? 1 : 0 }}
        style={{ x: showPicker ? spring(1, springPreset) : spring(0, springPreset) }}
      >
        {interpolatedStyle => (
          <Portal
            isOpened={true}
            onClose={this.handlePortalClose}
          >
            <div
              ref={ref => { this.datePickerRef = ref }}
              className={`opuscapita_date-picker__picker-container`}
              style={{
                maxHeight: `${interpolatedStyle.x * 640}px`,
                opacity: easeOutCubic(interpolatedStyle.x),
                top: `${top}px`,
                left: `${left}px`,
                transform: `translate(${showToLeft ? '-100%' : '0'}, ${showToTop ? '-100%' : '0'})`
              }}
            >
              {pickerElement}
            </div>
          </Portal>
        )}
      </Motion>
    );

    return (
      <div
        className={`opuscapita_date-picker ${className}`}
        ref={el => (this.container = el)}
        { ...commonProps }
      >
        <button
          className="opuscapita_date-picker__toggle-picker btn btn-default"
          disabled={disabled}
          onClick={this.handleToggleClick}
          tabIndex={tabIndex}
          type="button"
        >
          <i className="fa fa-calendar" />
        </button>
        {pickerMotionElement}
      </div>
    );
  }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;
