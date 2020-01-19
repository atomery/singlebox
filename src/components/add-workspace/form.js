import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../helpers/connect-component';
import isUrl from '../../helpers/is-url';
import getMailtoUrl from '../../helpers/get-mailto-url';

import {
  getIconFromInternet,
  save,
  updateForm,
} from '../../state/add-workspace/actions';

import defaultIcon from '../../images/default-icon.png';

import EnhancedDialogTitle from './enhanced-dialog-title';

const styles = (theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100vh',
    width: '100vw',
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
  },
  flexGrow: {
    flex: 1,
  },
  button: {
    float: 'right',
  },
  textField: {
    marginBottom: theme.spacing.unit * 3,
  },
  avatarFlex: {
    display: 'flex',
  },
  avatarLeft: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: 0,
    paddingRight: theme.spacing.unit,
  },
  avatarRight: {
    flex: 1,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    paddingRight: 0,
  },
  avatar: {
    fontFamily: theme.typography.fontFamily,
    height: 64,
    width: 64,
    background: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.common.white,
    borderRadius: 4,
    color: theme.palette.getContrastText(theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.common.white),
    fontSize: '32px',
    lineHeight: '64px',
    textAlign: 'center',
    fontWeight: 500,
    textTransform: 'uppercase',
    userSelect: 'none',
    boxShadow: theme.shadows[1],
  },
  avatarPicture: {
    height: 64,
    width: 64,
    borderRadius: 4,
  },
  buttonBot: {
    marginTop: theme.spacing.unit,
  },
});

const getValidIconPath = (iconPath, internetIcon) => {
  if (iconPath) {
    if (isUrl(iconPath)) return iconPath;
    return `file://${iconPath}`;
  }
  if (internetIcon) {
    return internetIcon;
  }
  return defaultIcon;
};

const AddWorkspaceCustom = ({
  classes,
  downloadingIcon,
  homeUrl,
  homeUrlError,
  internetIcon,
  isMailApp,
  name,
  nameError,
  onGetIconFromInternet,
  onSave,
  onUpdateForm,
  picturePath,
}) => (
  <div className={classes.root}>
    <EnhancedDialogTitle>
      Add Custom Workspace
    </EnhancedDialogTitle>
    <div>
      <TextField
        id="outlined-full-width"
        label={nameError || 'Name'}
        error={Boolean(nameError)}
        placeholder="Example: Singlebox"
        fullWidth
        margin="dense"
        variant="outlined"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        value={name}
        onChange={(e) => onUpdateForm({ name: e.target.value })}
      />
      <TextField
        id="outlined-full-width"
        label={homeUrlError || 'Home URL'}
        error={Boolean(homeUrlError)}
        placeholder="Example: https://singleboxapp.com"
        fullWidth
        margin="dense"
        variant="outlined"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        value={homeUrl}
        onChange={(e) => onUpdateForm({ homeUrl: e.target.value })}
        helperText={!homeUrlError && isMailApp && 'Email app detected.'}
      />
      <div className={classes.avatarFlex}>
        <div className={classes.avatarLeft}>
          <div className={classes.avatar}>
            <img alt="Icon" className={classes.avatarPicture} src={getValidIconPath(picturePath, internetIcon)} />
          </div>
        </div>
        <div className={classes.avatarRight}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const { remote } = window.require('electron');
              const opts = {
                properties: ['openFile'],
                filters: [
                  { name: 'PNG (Portable Network Graphics)', extensions: ['png'] },
                  { name: 'JPEG (Joint Photographic Experts Group)', extensions: ['jpg', 'jpeg'] },
                ],
              };
              remote.dialog.showOpenDialog(remote.getCurrentWindow(), opts)
                .then(({ canceled, filePaths }) => {
                  if (!canceled && filePaths.length > 0) {
                    onUpdateForm({ picturePath: filePaths[0] });
                  }
                });
            }}
          >
            Select Local Image...
          </Button>
          <Typography variant="caption">
            PNG or JPEG.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            className={classes.buttonBot}
            disabled={!homeUrl || homeUrlError || downloadingIcon}
            onClick={() => onGetIconFromInternet(true)}
          >
            {downloadingIcon ? 'Downloading Icon from the Internet...' : 'Download Icon from the Internet'}
          </Button>
          <br />
          <Button
            variant="outlined"
            size="small"
            className={classes.buttonBot}
            onClick={() => onUpdateForm({ picturePath: null, internetIcon: null })}
            disabled={!(picturePath || internetIcon)}
          >
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
    <div>
      <Button color="primary" variant="contained" className={classes.button} onClick={onSave}>
        Add
      </Button>
    </div>
  </div>
);

AddWorkspaceCustom.defaultProps = {
  homeUrl: '',
  homeUrlError: null,
  internetIcon: null,
  name: '',
  nameError: null,
  picturePath: null,
};

AddWorkspaceCustom.propTypes = {
  classes: PropTypes.object.isRequired,
  downloadingIcon: PropTypes.bool.isRequired,
  homeUrl: PropTypes.string,
  homeUrlError: PropTypes.string,
  internetIcon: PropTypes.string,
  isMailApp: PropTypes.bool.isRequired,
  name: PropTypes.string,
  nameError: PropTypes.string,
  onGetIconFromInternet: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  picturePath: PropTypes.string,
};

const mapStateToProps = (state) => ({
  downloadingIcon: state.addWorkspace.downloadingIcon,
  homeUrl: state.addWorkspace.form.homeUrl,
  homeUrlError: state.addWorkspace.form.homeUrlError,
  internetIcon: state.addWorkspace.form.internetIcon,
  isMailApp: Boolean(getMailtoUrl(state.addWorkspace.form.homeUrl)),
  name: state.addWorkspace.form.name,
  nameError: state.addWorkspace.form.nameError,
  picturePath: state.addWorkspace.form.picturePath,
});

const actionCreators = {
  getIconFromInternet,
  save,
  updateForm,
};

export default connectComponent(
  AddWorkspaceCustom,
  mapStateToProps,
  actionCreators,
  styles,
);
