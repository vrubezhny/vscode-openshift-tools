/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as sourceMapSupport from 'source-map-support';
import { backupKubeConfig, loadKubeConfigFromBackup } from './common/kubeConfigUtils.js';
import { testAddCluster } from './suite/addCluster.js';
import { checkAboutCommand } from './suite/command-about.js';
import { testComponentCommands } from './suite/componentCommands.js';
import { testComponentContextMenu } from './suite/componentContextMenu.js';
import { testCreateComponent } from './suite/createComponent.js';
import { testDevfileRegistries } from './suite/devfileRegistries.js';
import { checkExtension } from './suite/extension.js';
import { checkFocusOnCommands } from './suite/focusOn.js';
import { kubernetesContextTest } from './suite/kubernetesContext.js';
import { checkOpenshiftView } from './suite/openshift.js';
import { operatorBackedServiceTest } from './suite/operatorBackedService.js';
import { projectTest } from './suite/project.js';
import { testCreateServerlessFunction } from './suite/serverlessFunction.js';

sourceMapSupport.install();

describe('Extension public-facing UI tests', function() {
    const contextFolder = path.join(__dirname, 'context');
    let clusterIsSet = false;

    describe('Non-cluster tests', function() {
        before(async function() {
            await backupKubeConfig();
        });

        checkExtension();
        checkOpenshiftView();
        testAddCluster();
        testDevfileRegistries();
        checkFocusOnCommands();
        testCreateComponent(contextFolder);
        testCreateServerlessFunction(contextFolder);
        checkAboutCommand(clusterIsSet);
    });

    describe('Extension public-facing UI tests with Kind cluster', function() {
        clusterIsSet = true;

        before(async function() {
            await loadKubeConfigFromBackup();
        });

        checkAboutCommand(clusterIsSet);
        testComponentContextMenu();
        testComponentCommands(contextFolder);
        projectTest(false)
        kubernetesContextTest(false);
        operatorBackedServiceTest();
    });
});
