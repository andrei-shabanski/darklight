import React from "react";
import { connect } from "react-redux";

import { changeStatus } from "../actions/actionCreators";
import WelcomeModal from "../components/WelcomeModal";

const WelcomeModalContainer = props => <WelcomeModal {...props} />;

const mapDispatchToProps = dispatch => ({
  changeStatus: text => dispatch(changeStatus(text))
});

export default connect(null, mapDispatchToProps)(WelcomeModalContainer);
