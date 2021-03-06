import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { register, getSocket } from './api';
import OAuth from './OAuth';

const styles = {
  registrationFields: {
    height: 510,
    overflowY: 'scroll',
  },
  fields: {
    width: '100%',
    margin: 'auto',
    paddingLeft: '10%',
  },
  completeRegistration: {
    textAlign: 'center',
  },
  socialButtonsContainer: {
    marginTop: '40px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  textField: {
    width: '100%',
  },
  textField2: {
    width: '40%',
    marginLeft: '10px',
  },
  submit: {
    display: 'block',
    marginTop: '20px'
  }
};

const PROVIDERS = [
  'facebook',
  'linkedin',
  'google'
];

class RegisterForm extends React.Component {
  state = {
    email: '',
    password: '',
    isLoggedInWithSocial: false,
  }

  socket = getSocket()

  updateUser = provider => ({ name, id, exists, photo }) => {
    if (exists) {
      return alert('You are already registered. Please go to the login tab')
    }

    this.setState({
      isLoggedInWithSocial: !this.state.isLoggedInWithSocial,
      name,
      id,
      provider,
      photo,
    });

    this.props.setUser({
      name,
      id,
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onClickSubmit = () => {
    const { isLoggedInWithSocial, name, email, password, confirmPassword, company, nmlsNumber, phone, provider, id } = this.state;
    const checkFields = ['name', 'company', 'email', 'nmlsNumber', 'phone'];

    if (!isLoggedInWithSocial) {
      if (!password || password !== confirmPassword) {
        return alert('Passwords must match');
      }
    }

    const failedValidation = checkFields.some((field) => {
      if (!this.state[field]) {
        alert(`Oops! Please make sure the ${field} field is filled in`);
        return true;
      } else {
        return false;
      }
    });

    if (failedValidation) return;
    let providerId = {};

    if (provider) {
      const PROVIDER_MAP = {
        'facebook': 'fb_id',
        'linkedin': 'li_id',
        'google': 'google_id',
      };

      providerId = {
        [PROVIDER_MAP[provider]]: id,
      };
    }

    register({
      name,
      company,
      email,
      password,
      nmls_number: nmlsNumber,
      phone,
      ...providerId
    });

    this.props.setUser({ name });
    this.props.closeModal();
  }

  renderSocial = () => {
    return PROVIDERS.map(provider =>
      <OAuth
        provider={provider}
        key={provider}
        socket={this.socket}
        updateUser={this.updateUser(provider)}
      />
    );
  }

  renderIsLoggedInWithSocial = () => {
    const { classes } = this.props;
    const { company, email, nmlsNumber, phone } = this.state;

    return <div className={classes.completeRegistration}>
      <p>Nice! Please fill in the rest of the required fields to finish registering.</p>
      <TextField
        className={classes.textField}
        label="Company"
        value={company}
        onChange={this.handleChange('company')}
      />
      <TextField
        className={classes.textField}
        label="Email"
        value={email}
        onChange={this.handleChange('email')}
      />
      <TextField
        className={classes.textField}
        label="NMLS # or BRE #"
        value={nmlsNumber}
        onChange={this.handleChange('nmlsNumber')}
      />
      <TextField
        className={classes.textField}
        label="Phone"
        value={phone}
        onChange={this.handleChange('phone')}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={this.onClickSubmit}
        className={classes.submit}
      >
        Submit
      </Button>
    </div>
  }

  renderIsNotLoggedInWithSocial = () => {
    const { classes } = this.props;
    const { name, email, password, confirmPassword, company, nmlsNumber, phone } = this.state;

    return (
      <div className={classes.registrationFields}>
        <div className={classes.socialButtonsContainer}>
          {this.renderSocial()}
        </div>
        <div className={classes.fields}>
          <TextField
            className={classes.textField2}
            label="Name"
            value={name}
            onChange={this.handleChange('name')}
          />
          <TextField
            className={classes.textField2}
            label="Email"
            value={email}
            onChange={this.handleChange('email')}
          />
          <TextField
            className={classes.textField2}
            label="Password"
            type="password"
            value={password}
            onChange={this.handleChange('password')}
          />
          <TextField
            className={classes.textField2}
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={this.handleChange('confirmPassword')}
          />
          <TextField
            className={classes.textField2}
            label="Company"
            value={company}
            onChange={this.handleChange('company')}
          />
          <TextField
            className={classes.textField2}
            label="NMLS # or BRE #"
            value={nmlsNumber}
            onChange={this.handleChange('nmlsNumber')}
          />
          <TextField
            className={classes.textField2}
            label="Phone"
            value={phone}
            onChange={this.handleChange('phone')}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={this.onClickSubmit}
            className={classes.submit}
          >
            Submit
          </Button>
        </div>
      </div>
    )
  }

  render() {
    return this.state.isLoggedInWithSocial
      ? this.renderIsLoggedInWithSocial()
      : this.renderIsNotLoggedInWithSocial();
  }
}
export default withStyles(styles)(RegisterForm);
