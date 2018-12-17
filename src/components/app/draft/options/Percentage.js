import React from "react";
import { round } from "../../../../utils";
import Slider from "@material-ui/lab/Slider";
import Button from "@material-ui/core/Button";
import { FormattedMessage } from "react-intl";
import CloseIcon from "@material-ui/icons/Close";

class Percentage extends React.Component {
  state = {
    value: this.props.value,
    dragging: false
  };

  updateOption = (evt, value) => {
    this.setState({ value: round(value) });
    let factor = this.props.mm ? 1 : 100;
    if (!this.state.dragging)
      this.props.updateOption(this.props.option, value / factor);
  };

  startDrag = () => {
    this.setState({ dragging: true });
  };

  endDrag = (evt, value) => {
    this.setState({ dragging: false });
    this.updateOption(false, this.state.value);
  };

  render() {
    let step = 0.1;
    if (this.props.mm) {
      step = this.props.units === "imperial" ? 0.79375 : 1;
    }
    return (
      <div className="option-wrapper">
        <div className="slider">
          <Slider
            value={this.state.value}
            min={this.props.config.min}
            max={this.props.config.max}
            step={step}
            onDragStart={this.startDrag}
            onDragEnd={this.endDrag}
            onChange={this.updateOption}
            classes={{
              track: "slider-track",
              thumb: "slider-thumb"
            }}
          />
        </div>
        <p className="option-desc">{this.props.desc}</p>
        <p className="option-actions">
          {this.state.value === this.props.config.pct ? (
            ""
          ) : (
            <Button
              variant="outlined"
              onClick={() => this.updateOption(false, this.props.dflt)}
              className="mr1"
            >
              <FormattedMessage id="app.reset" />
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() =>
              this.props.showDocs(this.props.docs ? false : this.props.option)
            }
          >
            {this.props.docs ? <CloseIcon className="mr1" /> : ""}
            <FormattedMessage id="app.docs" />
          </Button>
        </p>
      </div>
    );
  }
}

export default Percentage;