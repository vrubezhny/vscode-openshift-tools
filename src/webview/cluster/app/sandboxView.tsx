/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import { Button, CircularProgress, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import * as ClusterViewStyles from './clusterView.style';

const useStyles = makeStyles(ClusterViewStyles.useStyles);

export default function addSandboxView(props): JSX.Element {
    const classes = useStyles();
    const [currentState, setCurrentState] = React.useState({
        action: 'sandboxPageDetectAuthSession',
        statusInfo: '',
        consoleDashboard: '',
        errorCode: undefined
    });

    const messageListener = (event) => {
        if (event?.data?.action) {
            setCurrentState(event.data);
        }
    }

    window.addEventListener('message', messageListener);

    function postMessage(action: string, payload?: any): void {
        window.vscodeApi.postMessage({ action, payload });
    }

    React.useEffect(() => {
        postMessage('sandboxCheckAuthSession');
    }, []);

    const DetectAuthSession = () => {
        return (
            <>
                {(currentState.action === 'sandboxPageDetectAuthSession') && (
                    <div>
                        <CircularProgress color="secondary" size={20} style={{ marginRight: '20px' }}/>
                        <Typography component="p">Detecting Authentication Session</Typography>
                    </div>
                )}
            </>
        );
    };

    const Login = () => {

        const [inProgress, setInProgress] = React.useState(false)

        const handleLoginButton = () => {
            setInProgress(true);
            postMessage('sandboxLoginRequest');
        }

        return (
            <>
                {( currentState.action === 'sandboxPageLoginRequired' ) && (
                    <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static" style={{ background: 'var(--vscode-list-inactiveSelectionBackground)' }}>
                        <Toolbar>
                            <Typography variant="body2" component="p" sx={{ flexGrow: 1 }}>
                                Sign up a new Red Hat developer account or Login to existing account<br/>to start using Developer Sandbox on Red Hat OpenShift.
                            </Typography>
                            {(currentState.errorCode === 'loginTimedOut') && (
                                <div>Login command timed out. Please try again.</div>
                            )}
                            <Tooltip title="Register a new Red Hat account" placement="bottom">
                                <Button
                                    href='https://www.redhat.com/en/program-developers'
                                    variant="contained"
                                    className={classes.buttonSecondary}
                                    style= {{ marginRight: '10px' }}>
                                        Sign Up
                                </Button>
                            </Tooltip>
                            <Tooltip title="Login to Red Hat account" placement="bottom">
                                <Button
                                    className={classes.button}
                                    disabled={inProgress}
                                    variant='contained'
                                    onClick={ handleLoginButton }>
                                    Login to Red Hat{ inProgress && <CircularProgress style= {{ marginLeft: '10px' }} size={20}/>}
                                </Button>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    </Box>
                )}
            </>
        )
    };

    const DetectStatus = () => {

        React.useEffect(() => {
            if (currentState.action === 'sandboxPageDetectStatus' && currentState.errorCode === undefined) {
                postMessage('sandboxDetectStatus');
            }
        }, []);

        const handleTryAgainButton = () => {
            setCurrentState({
                action: currentState.action,
                consoleDashboard: currentState.consoleDashboard,
                statusInfo: currentState.statusInfo,
                errorCode: undefined
            });
            postMessage('sandboxDetectStatus');
        }

        return (
            <>
                {( currentState.action === 'sandboxPageDetectStatus' ) && (
                    <div>
                        {(currentState.errorCode === undefined) && (
                            <>
                                <CircularProgress color="secondary" size={20} style={{ marginRight: '20px' }}/>
                                <Typography component="p">
                                    Detecting Developer Sandbox instance status
                                </Typography>
                            </>
                        )}
                        {(currentState.errorCode) && (
                            <>
                                <Typography component="p">
                                    Could not detect Developer Sandbox instance status
                                </Typography>
                                <Button style= {{ margin: '20px' }} className={classes.button} variant='contained' onClick={handleTryAgainButton}>Try Again</Button>
                            </>
                        )}
                    </div>
                )}
            </>
        )
    };

    const Signup = () => {

        const [inProgress, setInProgress] = React.useState(false)

        const handleSignupButton = (event) => {
            setInProgress(true);
            postMessage('sandboxRequestSignup');
        }
        return (
            <>
                {( currentState.action === 'sandboxPageRequestSignup' ) && (
                    <div>
                        You have not signed up for Developer Sandbox for Red Hat OpenShift.<br/>
                        Provision your free Red Hat OpenShift development cluster and get started.
                        <Button
                            style= {{ margin: '20px' }}
                            className={classes.button}
                            disabled={inProgress}
                            variant='contained'
                            onClick={handleSignupButton}>Get started in the Sandbox{ inProgress && <CircularProgress style= {{  marginLeft: '10px' }} size={20}/>}</Button>
                    </div>
                )}
            </>
        )
    };

    const RequestVerificationCode = () => {

        const [phoneNumber, setPhoneNumber] = React.useState('');
        const [countryCode, setCountryCode] = React.useState('');

        const handlePhoneNumber = (value, country) => {
            setPhoneNumber(value);
            setCountryCode(country.dialCode);
        }

        const [inProgress, setInProgress] = React.useState(false)

        const handleRequestVerificationCode = () => {
            const rawPhoneNumber = phoneNumber.slice(countryCode.length);
            const fullCountryCode = '+' + countryCode;
            
            setInProgress(true);
            postMessage('sandboxRequestVerificationCode', { rawPhoneNumber, fullCountryCode });
        }

        const isValid = (value, country) => {
            const validNumberCount = (country.format.match(/\./g) || []).length;
            return value.length === validNumberCount;
        };

        return (
            <>
                {( currentState.action === 'sandboxPageRequestVerificationCode' ) && (
                    <div style = {{ margin: '20px', position: 'relative', display: 'inline-block', width: '100%' }}>
                        <PhoneInput
                        country={"us"}
                        value={phoneNumber}
                        onChange={handlePhoneNumber}
                        isValid={isValid}
                        disabled={inProgress}
                        containerStyle={{display: 'inline-flex', width: 'unset'}}
                        dropdownStyle={{position: 'fixed', margin: '0px 0 10px -1px'}}
                        inputStyle={{width: 'unset'}}
                        />
                        <Button
                            style = {{ margin: '20px 20px 22px 20px' }}
                            className={classes.button}
                            size="medium"
                            disabled={inProgress}
                            variant='contained'
                            onClick={handleRequestVerificationCode}>Send Verification Code { inProgress && <CircularProgress style= {{  marginLeft: '10px' }} size={20}/>}</Button>
                    </div>
                )}
            </>
        )
    }

    const EnterVerificationCode = () => {
        const [verificationCode, setVerificationCode] = React.useState('');

        const [inProgress, setInProgress] = React.useState(false)

        const handleVerifyCode = (event) => {
            setVerificationCode(event.target.value);
        }

        const handleCheckVerificationCode = () => {
            setInProgress(true);
            postMessage('sandboxValidateVerificationCode', {verificationCode});
        }

        const handlRequesteNewCodeRequest = () => {
            setCurrentState({
                action: 'sandboxPageRequestVerificationCode',
                statusInfo: '',
                consoleDashboard: '',
                errorCode: undefined
            });
        }

        return (
            <>
                {( currentState.action === 'sandboxPageEnterVerificationCode' ) && (
                    <div style={{ margin: '20px' }}>
                        <TextField id='code'
                            style={{ marginRight: '10px', marginTop: '8px', color: 'var(--vscode-input-foreground)' }}
                            disabled={inProgress}
                            onChange={handleVerifyCode}
                            label='Verification Code'
                            variant='outlined'
                            size='small'
                        />
                        <Button
                            style = {{ marginRight: '10px' }}
                            className={classes.button}
                            size="medium"
                            disabled={inProgress}
                            variant='outlined'
                            onClick={handleCheckVerificationCode}>
                                Verify { inProgress && <CircularProgress style= {{  marginLeft: '10px' }} size={20}/>}
                        </Button>
                        <Button className={classes.buttonSecondary} size="medium" variant='outlined' onClick={ handlRequesteNewCodeRequest }>Request New Code</Button>
                    </div>
                )}
            </>
        )
    }

    const WaitingForApproval = () => {
        React.useEffect(() => {
            if (currentState.action === 'sandboxPageWaitingForApproval') {
                setTimeout(()=>postMessage('sandboxDetectStatus'), 1000);
            }
        }, []);
        return (
            <>
                {( currentState.action === 'sandboxPageWaitingForApproval' ) && (
                    <div>
                        <CircularProgress color="secondary" size={20} style={{ marginRight: '20px' }}/>
                        <Typography component="p">Waiting for Sandbox instance approval</Typography>
                    </div>
                )}
            </>
        )
    }

    const WaitingForProvision = () => {
        React.useEffect(() => {
            if (currentState.action === 'sandboxPageWaitingForProvision') {
                setTimeout(()=>postMessage('sandboxDetectStatus'), 1000);
            }
        }, []);
        return (
            <>
                {( currentState.action === 'sandboxPageWaitingForProvision' ) && (
                    <div>
                        <CircularProgress color="secondary" size={20} style={{ marginRight: '20px' }}/>
                        <Typography component="p">Sandbox instance has been approved, waiting for provision to finish</Typography>
                    </div>
                )}
            </>
        )
    }

    const Provisioned = () => {

        const handleLoginButton = () => {
            postMessage('sandboxLoginUsingDataInClipboard');
        };
        return (
            <>
                {( currentState.action === 'sandboxPageProvisioned' ) && (
                    <Box sx={{ flexGrow: 1 }}>
                        <AppBar position="static" style={{ background: 'var(--vscode-list-inactiveSelectionBackground)' }}>
                            <Toolbar>
                                <Typography variant="body1" component="p" style={{ flexGrow: 1, color: 'var(--vscode-foreground)', padding: 20, margin: 0 }}>
                                    <Tooltip title={currentState.statusInfo}>
                                            <IconButton
                                                size="large"
                                                aria-label="account of current user"
                                                aria-controls="menu-appbar"
                                                aria-haspopup="true"
                                                color="inherit"
                                            >
                                                <AccountCircle />
                                            </IconButton>
                                        </Tooltip>
                                    Your sandbox account has been provisioned and is ready to use.
                                </Typography>
                                <Tooltip title="Launch your Sandbox console in browser" placement="bottom">
                                    <Button variant="contained" className={classes.button} href={currentState.consoleDashboard}>Open Dashboard</Button>
                                </Tooltip>
                                <Tooltip title="Connect in OpenShift Application View" placement="bottom">
                                    <Button variant="contained" className={classes.buttonSecondary} onClick={handleLoginButton}>Login to Sandbox</Button>
                                </Tooltip>
                            </Toolbar>
                            <Typography variant="caption" display="block" style={{ textAlign:'left', margin: '20px 70px', color: 'var(--vscode-foreground)' }}>
                                Next steps to connect with Developer Sandbox:<br></br>
                                1. Click on <strong>Open Dashboard button</strong>. In the browser, login using <strong>DevSandbox</strong> and once loggedin, click on username dropdown.<br></br>
                                2. Select <strong>Copy Login command</strong>. Once the new tab is opened, copy the entire <strong>Log in with this token</strong> command.<br></br>
                                3. Come back to IDE and press <strong>'Login To Sandbox'</strong> Button. This will login your DevSandbox in OpenShift Application View.<br></br>
                                4. Once successfully logged in, start creating applications and deploy on cluster.
                            </Typography>
                        </AppBar>
                    </Box>
                )}
            </>
        )
    }

    return (
        <>
            <DetectAuthSession />
            <Login />
            <DetectStatus />
            <Signup />
            <RequestVerificationCode />
            <EnterVerificationCode />
            <WaitingForApproval />
            <WaitingForProvision />
            <Provisioned />
        </>
    )
}