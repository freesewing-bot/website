import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import TextField from "./TextField";
import DistanceField from "./DistanceField";
import RadioField from "./RadioField";
import MarkdownField from "./MarkdownField";
import ImageField from "./ImageField";

const Field = props => {
  let field;
  switch (props.config.type) {
    case "text":
      field = <TextField {...props} key={props.item} />;
      break;
    case "markdown":
      field = <MarkdownField {...props} key={props.item} />;
      break;
    case "distance":
      field = <DistanceField {...props} key={props.item} />;
      break;
    case "image":
      field = <ImageField {...props} key={props.item} />;
      break;
    case "radio":
      field = <RadioField {...props} key={props.item} />;
      break;
    default:
      throw new Error("Unsuported field type in field component");
  }
  let mdNote = (
    <small>
      {" "}
      (<FormattedMessage id="app.thisFieldSupportsMarkdown" />)
    </small>
  );
  return (
    <React-Fragment>
      <h5>
        <FormattedMessage id={props.config.label} />
        {props.config.type === "markdown" ? mdNote : ""}
      </h5>
      {field}
    </React-Fragment>
  );
};

Field.propTypes = {
  config: PropTypes.object.isRequired,
  methods: PropTypes.object.isRequired
};

export default Field;