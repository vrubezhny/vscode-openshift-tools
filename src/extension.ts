/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

// import { Context as KcuContext } from '@kubernetes/client-node/dist/config_types';
import { Context as KcuContext } from '@kubernetes/client-node';
import {
    authentication,
    commands, env, ExtensionContext, languages, QuickPickItemKind,
    StatusBarAlignment,
    StatusBarItem, window,
    workspace
} from 'vscode';
import { extension as k8sExtension } from 'vscode-kubernetes-tools-api';
import { REDHAT_CLOUD_PROVIDER } from './cloudProvider/redhatCloudProvider.js';
import { ComponentsTreeDataProvider } from './componentsView.js';
import { DebugSessionsView } from './debug.js';
import { Deployment } from './deployment.js';
import { OpenShiftExplorer } from './explorer.js';
import { Feedback } from './feedback.js';
import { ManageRepository as HelmManageRepository } from './helm/manageRepository.js';
import { verifyBinariesInRemoteContainer } from './installToolsInRemote.js';
import { Build as K8sBuild } from './k8s/build.js';
import { extendClusterExplorer } from './k8s/clusterExplorer.js';
import { Console as K8sConsole } from './k8s/console.js';
import { DeploymentConfig as K8sDeploymentConfig } from './k8s/deploymentConfig.js';
import { Route as K8sRoute } from './k8s/route.js';
import { KubernetesResourceLinkProvider } from './k8s/vfs/kuberesources.linkprovider.js';
import { K8S_RESOURCE_SCHEME, K8S_RESOURCE_SCHEME_READONLY, KubernetesResourceVirtualFileSystemProvider } from './k8s/vfs/kuberesources.virtualfs.js';
import { Oc } from './oc/ocWrapper.js';
import { OdoPreference } from './odo/odoPreference.js';
import { Cluster } from './openshift/cluster.js';
import { Component } from './openshift/component.js';
import { Project as OpenshiftProject } from './openshift/project.js';
import { Route as OpenshiftRoute } from './openshift/route.js';
import { Service as OpenshiftService } from './openshift/service.js';
import { ComponentTypesView } from './registriesView.js';
import { ManageRepository as ServerlessManageRepository } from './serverlessFunction/manageRepository.js';
import { ServerlessFunctionView } from './serverlessFunction/view.js';
import { startTelemetry } from './telemetry.js';
import { ToolsConfig } from './tools.js';
import { TokenStore } from './util/credentialManager.js';
import { getNamespaceKind, KubeConfigUtils, setKubeConfig } from './util/kubeUtils.js';
import { setupWorkspaceDevfileContext } from './util/workspace.js';
import { registerCommands } from './vscommand.js';
import ClusterViewLoader from './webview/cluster/clusterViewLoader.js';
import CreateDeploymentLoader from './webview/create-deployment/createDeploymentLoader.js';
import RegistryViewLoader from './webview/devfile-registry/registryViewLoader.js';
import HelmChartLoader, { HelmCommand } from './webview/helm-chart/helmChartLoader.js';
import ManageRepositoryViewLoader from './webview/helm-manage-repository/manageRepositoryLoader.js';
import { OpenShiftTerminalManager } from './webview/openshift-terminal/openShiftTerminal.js';
import { WelcomePage } from './welcomePage.js';
import { registerYamlHandlers } from './yaml/yamlDocumentFeatures.js';
import { YamlFileCommands } from './yamlFileCommands.js';

// eslint-disable-next-line @typescript-eslint/no-empty-function
// this method is called when your extension is deactivated
export function deactivate(): void {
    // intentionally left blank
}

async function verifyBundledBinaries(): Promise<{ odoPath: string, ocPath: string, helmPath: string }> {
    return {
        odoPath: await ToolsConfig.detect('odo'),
        ocPath: await ToolsConfig.detect('oc'),
        helmPath: await ToolsConfig.detect('helm'),
    };
}

async function registerKubernetesCloudProvider(): Promise<void> {
    const cloudProvider = await k8sExtension.cloudExplorer.v1;
    if (cloudProvider.available) {
        cloudProvider.api.registerCloudProvider(REDHAT_CLOUD_PROVIDER);
    }
}

export async function activate(extensionContext: ExtensionContext): Promise<unknown> {
    void WelcomePage.createOrShow();
    void commands.executeCommand('setContext', 'isVSCode', env.uiKind);

    Cluster.extensionContext = extensionContext;
    TokenStore.extensionContext = extensionContext;

    // Temporarily loaded resource providers
    const resourceDocProvider = new KubernetesResourceVirtualFileSystemProvider();

    // Link from resources to referenced resources
    const resourceLinkProvider = new KubernetesResourceLinkProvider();

    // pick kube config in case multiple are configured
    const setKubeConfigPromise = setKubeConfig();

    const crcStatusItem = window.createStatusBarItem(StatusBarAlignment.Left);
    crcStatusItem.command = 'openshift.explorer.stopCluster';

    const activeNamespaceStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
    activeNamespaceStatusBarItem.command = 'openshift.project.set';

    const activeContextStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 2);
    activeContextStatusBarItem.command = 'openshift.explorer.switchContext';

    const disposable = [
        crcStatusItem,
        activeNamespaceStatusBarItem,
        activeContextStatusBarItem,
        new DebugSessionsView().createTreeView('openshiftDebugView'),
        ...Component.init(),
        ComponentTypesView.instance.createTreeView('openshiftComponentTypesView'),
        ServerlessFunctionView.getInstance(),
        ComponentsTreeDataProvider.instance.createTreeView('openshiftComponentsView'),
        setupWorkspaceDevfileContext(),
        window.registerWebviewViewProvider('openShiftTerminalView', OpenShiftTerminalManager.getInstance(), { webviewOptions: { retainContextWhenHidden: true, } }),
        ...registerYamlHandlers(),

        // These modules are required to be bundled into the resulting `extension.js`,
        // so they need to be explicitly referenced before 'registerCommands()' is invoked.
        K8sBuild.getInstance(),
        K8sDeploymentConfig.getInstance(),
        K8sRoute.getInstance(),
        K8sConsole.getInstance(),
        OpenshiftProject.getInstance(),
        OpenshiftService.getInstance(),
        OpenshiftRoute.getInstance(),
        OpenShiftExplorer.getInstance(),
        YamlFileCommands.getInstance(),
        Cluster.getInstance(),
        ClusterViewLoader.getInstance(),
        RegistryViewLoader.getInstance(),
        HelmCommand.getInstance(),
        HelmChartLoader.getInstance(),
        ManageRepositoryViewLoader.getInstance(),
        CreateDeploymentLoader.getInstance(),
        HelmManageRepository.getInstance(),
        ServerlessManageRepository.getInstance(),
        Feedback.getInstance(),
        Deployment.getInstance(),

        // Temporarily loaded resource providers
        workspace.registerFileSystemProvider(K8S_RESOURCE_SCHEME, resourceDocProvider, { /* TODO: case sensitive? */ }),
        workspace.registerFileSystemProvider(K8S_RESOURCE_SCHEME_READONLY, resourceDocProvider, { isReadonly: true }),

        // Link from resources to referenced resources
        languages.registerDocumentLinkProvider({ scheme: K8S_RESOURCE_SCHEME }, resourceLinkProvider),
    ];

    disposable.push(...registerCommands());
    disposable.forEach((value) => extensionContext.subscriptions.push(value));

    // activate "Sign in with Red Hat ..."
    void authentication.getSession('redhat-account-auth', ['openid'], { silent: false });

    const statusBarFunctions = function() {
        return commands.registerCommand('openshift.openStatusBar', async () => {
            const selection = await window.showQuickPick(
                [
                    {
                        label: '',
                        kind: QuickPickItemKind.Separator
                    },
                    {
                        label: 'Add OpenShift Cluster'
                    },
                    {
                        label: 'Login to Cluster'
                    },
                    {
                        label: 'Switch Kubernetes Context',
                    },
                    {
                        label: '',
                        kind: QuickPickItemKind.Separator
                    },
                    {
                        label: 'Create Component'
                    },
                    {
                        label: '',
                        kind: QuickPickItemKind.Separator
                    },
                    {
                        label: 'Open Welcome Page',
                    },
                    {
                        label: 'Getting Started Walkthrough'
                    },
                    {
                        label: 'Getting Started Serverless Function Walkthrough'
                    }
                ]);
            switch (selection?.label) {
                case 'Add OpenShift Cluster':
                    await commands.executeCommand('openshift.explorer.addCluster');
                    break;
                case 'Login to Cluster':
                    await commands.executeCommand('openshift.explorer.login');
                    break;
                case 'Switch Kubernetes Context':
                    await commands.executeCommand('openshift.explorer.switchContext');
                    break;
                case 'Create Component':
                    await commands.executeCommand('openshift.component.openCreateComponent');
                    break;
                case 'Open Welcome Page':
                    await commands.executeCommand('openshift.welcome');
                    break;
                case 'Getting Started Walkthrough':
                    await commands.executeCommand('openshift.getStarted', 'openshiftWalkthrough');
                    break;
                case 'Getting Started Serverless Function Walkthrough':
                    await commands.executeCommand('openshift.getStarted', 'serverlessFunctionWalkthrough');
                    break;
                default:
                    break;
            }
        });
    }

    const createOpenShiftStatusBarItem = function(context: ExtensionContext) {
        const item = window.createStatusBarItem(StatusBarAlignment.Left, 3);
        item.command = 'openshift.openStatusBar';
        context.subscriptions.push(item);
        context.subscriptions.push(statusBarFunctions());
        item.text = '$(cloud) OpenShift';
        item.show();
    }

    createOpenShiftStatusBarItem(extensionContext);

    const updateStatusBarItem = function(statusBarItem: StatusBarItem, text: string): void {
        if (!workspace.getConfiguration('openshiftToolkit').get('crcBinaryLocation')) {
            statusBarItem.hide();
            return;
        }
        statusBarItem.text = `$(debug-stop) ${text}`;
        statusBarItem.show();
    }

    // Disable the k8s extension displaying its context/namespace status bar items...
    // ...and setup our own context and namespace status bar informer/picker items

    // if true will disable displaying the namespace from the status bar
    const isNamespaceInfoStatusBarDisabled = function(): boolean {
        // If k8s extension's Namespace Picker is eenabled - do not show the OS Tools's one
        if (workspace.getConfiguration('vs-kubernetes').get('vs-kubernetes.disable-namespace-info-status-bar') === false) {
            return true;
        }
        return workspace.getConfiguration('openshiftToolkit').get['openshiftToolkit.disable-namespace-info-status-bar'];
    }

    // if true will disable displaying the context from the status bar
    const isContextInfoStatusBarDisabled = function(): boolean {
        // If k8s extension's Namespace Picker is eenabled - do not show the OS Tools's one
        if (workspace.getConfiguration('vs-kubernetes').get('vs-kubernetes.disable-context-info-status-bar') === false) {
            return true;
        }
        return workspace.getConfiguration('openshiftToolkit').get['openshiftToolkit.disable-context-info-status-bar'];
    }

    const updateContextStatusBarItem = function(statusBarItem: StatusBarItem, iconId: string, text: string, tooltip: string, show: boolean): void {
        statusBarItem.text = `$(${iconId}) ${text}`;
        statusBarItem.tooltip = tooltip;
        if (show && text) {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    }

    const updateContextAndProjectStatusBarItems = async function(context?: string): Promise<void> {
        const kind = await getNamespaceKind();
        const namespace = await Oc.Instance.getActiveProject();
        if (namespace) {
            updateContextStatusBarItem(activeNamespaceStatusBarItem, 'project-node', namespace, `Current ${kind}: ${namespace}`,
                !isNamespaceInfoStatusBarDisabled());
        } else {
            updateContextStatusBarItem(activeNamespaceStatusBarItem, 'project-node', '', '', false);
        }

        const kcu: KubeConfigUtils = new KubeConfigUtils();
        const currentContext: KcuContext = kcu.findContext(context ? context : kcu.currentContext);
        updateContextStatusBarItem(activeContextStatusBarItem, 'current-context', currentContext?.name, `${currentContext?.name}\nCluster: ${currentContext?.cluster}`,
            !isContextInfoStatusBarDisabled());
    }

    OpenShiftExplorer.getInstance().onDidChangeContextEmitter.event((context) => {
        void updateContextAndProjectStatusBarItems(context);
    });

    void updateContextAndProjectStatusBarItems();

    updateStatusBarItem(crcStatusItem, 'Stop CRC');

    void extendClusterExplorer();

    await registerKubernetesCloudProvider();
    void startTelemetry(extensionContext);
    await verifyBinariesInRemoteContainer();

    void OdoPreference.Instance.getRegistries(); // Initializes '~/.odo/preference.json', if not initialized yet

    // Wait for finishing Kube Config setup
    await setKubeConfigPromise;

    return {
        verifyBundledBinaries
    };
}
