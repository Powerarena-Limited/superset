import React, { PropTypes } from 'react';
import { ControlLabel } from 'react-bootstrap';
import InfoTooltipWithTrigger from '../../components/InfoTooltipWithTrigger';

const propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
};

const defaultProps = {
  label: null,
  description: null,
};

export default function ControlLabelWithTooltip({ label, description }) {
  return (
    <ControlLabel>
      {label} &nbsp;
      {description &&
        <InfoTooltipWithTrigger label={label} tooltip={description} />
      }
    </ControlLabel>
  );
}

ControlLabelWithTooltip.propTypes = propTypes;
ControlLabelWithTooltip.defaultProps = defaultProps;
