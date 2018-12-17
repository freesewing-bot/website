import React from "react";
import { distance, patternOption } from "../../../utils";
import { FormattedMessage, injectIntl } from "react-intl";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SelectIcon from "@material-ui/icons/KeyboardArrowRight";
import CollapseIcon from "@material-ui/icons/KeyboardArrowDown";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import TuneIcon from "@material-ui/icons/Tune";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Option from "./options/Container";

class SettingsPicker extends React.Component {
  state = {
    expanded: {},
    option: false
  };

  componentDidMount() {
    let expanded = {};
    for (let option of this.props.options) {
      if (typeof option !== "string") {
        let key = Object.keys(option).pop();
        expanded[key] = false;
        for (let subOption of option[key]) {
          if (typeof subOption !== "string") {
            let subKey = Object.keys(subOption).pop();
            expanded[subKey] = false;
          }
        }
      }
    }
    this.setState({ expanded });
  }

  optionGroup(key, options, level = 0) {
    let heading = (
      <ListItem key={key} button onClick={() => this.toggleGroup(key)}>
        <ListItemIcon>
          <TuneIcon className={"indent" + level} />
        </ListItemIcon>
        <ListItemText inset>
          <h6>
            <FormattedMessage id={"optiongroups." + key} />
          </h6>
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton aria-label="toggle">
            {this.state.expanded[key] ? (
              <CollapseIcon color="primary" />
            ) : (
              <SelectIcon color="primary" />
            )}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
    let items = [heading];
    let colItems = [];
    // Sort items regardless of language
    let sorted = {};
    for (let subOption of options) {
      let label = "";
      if (typeof subOption === "string") {
        label = this.props.intl.formatMessage({
          id: "options." + subOption + ".title"
        });
      } else {
        label = Object.keys(subOption).pop();
        label =
          "__" + this.props.intl.formatMessage({ id: "optiongroups." + label });
      }
      sorted[label] = subOption;
    }
    for (let label of Object.keys(sorted).sort()) {
      let subOption = sorted[label];
      if (typeof subOption !== "string") {
        let subKey = Object.keys(subOption).pop();
        let subItems = this.optionGroup(subKey, subOption[subKey], level + 2);
        for (let s of subItems) colItems.push(s);
      } else {
        let optConf, optVal, dfltVal, dflt, displayVal;
        if (typeof this.props.units === "string") {
          // Draft options
          optConf = subOption; // No config, just pass name
          optVal = this.props.settings[subOption]; // Draft options are always set in state
          // Default value requires some work
          switch (subOption) {
            case "paperless":
              dfltVal = false;
              displayVal = (
                <FormattedMessage id={optVal ? "app.yes" : "app.no"} />
              );
              break;
            case "complete":
              dfltVal = true;
              displayVal = (
                <FormattedMessage id={optVal ? "app.yes" : "app.no"} />
              );
              break;
            case "units":
              dfltVal = this.props.units;
              displayVal = <FormattedMessage id={"app." + optVal + "Units"} />;
              break;
            case "locale":
              dfltVal = this.props.language;
              displayVal = <FormattedMessage id={"i18n." + optVal} />;
              break;
            case "only":
              dfltVal = false;
              if (optVal === undefined) optVal = false;
              let displayId = "default";
              if (Array.isArray(optVal)) displayId = "custom";
              displayVal = <FormattedMessage id={"app." + displayId} />;
              break;
            case "margin":
              dfltVal = this.props.units === "imperial" ? 2.38125 : 2;
              displayVal = (
                <span
                  dangerouslySetInnerHTML={{
                    __html: distance.asHtml(optVal, this.props.units)
                  }}
                />
              );
              break;
            case "sa":
              dfltVal = 0;
              if (optVal === 0) displayVal = <FormattedMessage id="app.no" />;
              else
                displayVal = (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: distance.asHtml(optVal, this.props.units)
                    }}
                  />
                );
              break;
            default:
              break;
          }
          if (dfltVal === optVal) dflt = true;
          else dflt = false;
        } else {
          // Pattern options
          optConf = this.props.optionConfig[subOption];
          if (
            typeof this.props.settings.options !== "undefined" &&
            typeof this.props.settings.options[subOption] !== "undefined"
          )
            optVal = this.props.settings.options[subOption];
          dfltVal = patternOption.dflt(optConf);
          dflt = optVal === dfltVal ? true : false;
          if (typeof optVal === "undefined") dflt = true;
          if (dflt) optVal = dfltVal;
          displayVal = patternOption.format(optVal, optConf);
        }
        colItems.push(
          <ListItem
            button
            key={subOption}
            onClick={() => this.editOption(subOption)}
            className={
              this.state.option === subOption
                ? "option-header selected"
                : "option-header"
            }
          >
            <ListItemIcon>
              {this.state.option === subOption ? (
                <CollapseIcon className={"indent" + (level + 1)} />
              ) : (
                <SelectIcon className={"indent" + (level + 1)} />
              )}
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
            <ListItemSecondaryAction>
              <span
                className={dflt ? "option-value dflt" : "option-value non-dflt"}
              >
                {displayVal}
              </span>
            </ListItemSecondaryAction>
          </ListItem>
        );
        colItems.push(
          <Collapse
            in={this.state.option === subOption ? true : false}
            timeout="auto"
            unmountOnExit
            key={"sub-" + subOption}
          >
            <Option
              option={subOption}
              pattern={this.props.pattern.config.name}
              patternInfo={
                subOption === "sa" || subOption === "only"
                  ? this.props.pattern
                  : false
              }
              config={optConf}
              value={optVal}
              language={this.props.language}
              updateOption={this.props.updateOption}
              showDocs={this.props.showDocs}
              docs={this.props.docs}
              settings={this.props.settings || false}
              units={this.props.units}
              dflt={dfltVal}
            />
          </Collapse>
        );
      }
    }
    items.push(
      <Collapse
        in={this.state.expanded[key]}
        key={"col-" + key}
        timeout="auto"
        unmountOnExit
      >
        {colItems}
      </Collapse>
    );

    return items;
  }

  toggleGroup(key) {
    let expanded = { ...this.state.expanded };
    expanded[key] = !this.state.expanded[key];
    this.setState({ expanded });
    this.props.showDocs(false);
  }

  editOption(key) {
    if (this.state.option === key) key = false;
    this.setState({ option: key });
    this.props.showDocs(false);
  }

  optionGroups = this.props.pattern.optionGroups;
  render() {
    return (
      <List component="nav">
        {this.props.options.map((option, index) => {
          let key = Object.keys(option).pop();
          return this.optionGroup(key, option[key]);
        })}
      </List>
    );
  }
}

export default injectIntl(SettingsPicker);