/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import { workspace } from 'vscode';
import fetch = require('make-fetch-happen');

export enum SBAPIEndpoint {
    SIGNUP = '/api/v1/signup',
    VERIFICATION = '/api/v1/signup/verification'
}

export interface SBStatus {
     ready: boolean;
     reason: 'Provisioned' | 'PendingApproval';
     verificationRequired: boolean;
 }

 export interface SBSignupResponse {
    apiEndpoint: string;
    cheDashboardURL: string;
    clusterName: string;
    company: string;
    compliantUsername: string;
    consoleUrl: string;
    familyName: string;
    givenName: string;
    status: SBStatus;
    username: string;
 }

export function getSandboxAPIUrl(): string {
    return workspace.getConfiguration('openshiftConnector').get('sandboxAPIHostUrl');
}

export interface SandboxAPI {
    getSignUpStatus(): SBSignupResponse;
    signUp(): Promise<boolean>;
    requestVerificationCode(areaCode: string, phoneNumber: string);
    validateVerificationCode(code: string);
}

export async function getSignUpStatus(token: string): Promise<SBSignupResponse | undefined> {
    const signupResponse = await fetch(`${getSandboxAPIUrl()}${SBAPIEndpoint.SIGNUP}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 10000
        });
    return signupResponse.ok ? signupResponse.json() as Promise<SBSignupResponse> : undefined;
}

export async function signUp(token: string): Promise<boolean> {
    const signupResponse = await fetch(`${getSandboxAPIUrl()}${SBAPIEndpoint.SIGNUP}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 10000
        });
    return signupResponse.ok;
}

export async function requestVerificationCode(token: string, countryCode: string, phoneNumber: string): Promise<boolean> {
    const verificationCodeRequestResponse = await fetch(`${getSandboxAPIUrl()}${SBAPIEndpoint.VERIFICATION}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        },
        timeout: 10000,
        body: JSON.stringify({
            'country_code': countryCode,
            'phone_number': phoneNumber
        })
    });

    return verificationCodeRequestResponse.ok;
}

export async function validateVerificationCode(token: string, code: string): Promise<boolean> {
    const validationRequestResponse = await fetch(`${getSandboxAPIUrl()}${SBAPIEndpoint.VERIFICATION}/${code}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        },
        timeout: 10000
    });

    return validationRequestResponse.ok;
}

// export function createSandboxAPI(): SandboxAPI {
//     return
// }
