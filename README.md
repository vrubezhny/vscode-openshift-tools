# Visual Studio Code OpenShift Connector

[![Build Status](https://travis-ci.org/redhat-developer/vscode-openshift-tools.svg?branch=master)](https://travis-ci.org/redhat-developer/vscode-openshift-tools)

A Visual Studio Code extension for interacting with OpenShift clusters.

## Commands and features

`vs-openshift-connector` supports a number of commands & actions for interacting with OpenShift clusters; these are accessible via the command menu (`Cmd+Shift+P` <kbd>⌘⇧P</kbd> on macOS or `Ctrl+Shift+P` <kbd>⌃⇧P</kbd> on Windows and Linux) and may be bound to keys in the normal way.

### General Commands

* `OpenShift: Log in to cluster` - Log in to your server and save login for subsequent use.
    * Credentials : Log in to the given server with the given credentials.
    * Token : Login using bearer token for authentication to the API server.
* `OpenShift: List catalog components` - List all available component types from OpenShift's Image Builder.
* `OpenShift: List catalog services` - Lists all available services e.g. mysql
* `OpenShift: New Project` - Create new project inside the cluster.
* `OpenShift: About` - Provides the information about the OpenShift tools.
* `OpenShift: Log out` - Logs out of the current OpenShift cluster.

#### Actions available inside an OpenShift Cluster Project

   * `Project -> New Application` - Create a new application inside the selected project.
   * `Project -> Delete` - Delete an existing project.

#### Actions available for an Application inside a Project

   * `Application ->  New Component` - Create a new component inside the selected application. 
   * `Application ->  New Service` - Perform service catalog operations.
   * `Application -> Describe` - Describe the given application in terminal window.
   * `Application -> Delete` - Delete an existing application.

#### Actions available for a Component in an Application

   * `Component -> Create URL` - Expose component to the outside world. The URLs that are generated using this command, can be used to access the deployed components from outside the cluster.
   * `Component -> Create Storage` - Create storage and mount to a component.
   * `Component ->  Show Log` - Retrieve the log for the given component..
   * `Component ->  Follow Log` - Follow logs for the given component.
   * `Component -> Open in Browser` - Open the exposed URL in a browser.
   * `Component -> Push` - Push source code to a component.
   * `Component -> Watch` - Watch for changes, update component on change..
   * `Component -> Describe` - Describe the given component in terminal window.
   * `Component -> Delete` - Delete an existing component.


#### Actions available inside a storage for a component

   * `Storage -> Delete` - Delete storage from component

#### Action Icons
* ![Log in to cluster](https://github.com/redhat-developer/vscode-openshift-tools/blob/master/images/login.png)
* ![Refresh Cluster](https://github.com/redhat-developer/vscode-openshift-tools/blob/master/images/dark/refresh.png)


### Dependencies

This extension uses two CLI tools to interact with OpenShift cluster:
* OKD CLI client tool `oc` ([download page](https://github.com/openshift/origin/releases))
* OpenShift Do tool `odo` ([download page](https://github.com/redhat-developer/odo/releases))

If `oc` and `odo` tools are located in a directory from `PATH` environment variable they will be used automatically. 
If extension is not able to locate those tools it will ask you if they should be downloaded.

## Known Issues

  * The component creation in an Application currently works only with Node.js components. We will be supporting other languages in the future releases.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**NOTE:** This extension is in PREVIEW mode and first release. So the extension support for OpenShift is strictly experimental - assumptions may break, and commands and behavior may change!

Contributing
===============
This is an open source project open to anyone. This project welcomes contributions and suggestions!!

Download the most recent `openshift-connector-<version>.vsix` file and install it by following the instructions [here](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix). 


Feedback
===============
* File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-openshift-tools/issues)
* Chat with us on [Mattermost](https://chat.openshift.io/developers/channels/adapters)

License
===============
MIT, See [LICENSE](LICENSE) for more information.
