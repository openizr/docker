# Contribution Guide

Thank you for contributing to this repository, your help is greatly appreciated !
In ordrer to keep the project clear and make the contribution process as easy as possible, please
read this contribution guide and follow the described guidelines.


## Table of Contents

[Semantic Versioning](#semantic-versioning)

[Branch organization](#branch-organization)

[Contacts](#contacts)

[Labels naming convention](#labels-naming-convention)
 * [Type](#type)
 * [Status](#status)
 * [Difficulty](#difficulty)

[Reporting bugs](#reporting-bugs)

[Proposing changes](#proposing-changes)

[Pull Requests](#pull-requests)
 * [Naming convention](#naming-convention)
 * [Prerequisities](#prerequisities)

[Development workflow and tools](#development-workflow-and-tools)

[Guidelines](#guidelines)
 * [Typescript](#typescript)
 * [Git commits](#git-commits)

[Project structure](#project-structure)

[License](#license)


## Semantic Versioning

Docker images releases follow [semantic versioning](https://semver.org/).


## Branches organization

`master` is the main branch, and contains latest stable code that passes all the tests. We generate
new releases **from this banch only**. Please do not push your code directly on `master`, open a
pull request first so it can be validated by the community. Branches should be named after the
issue they fix, such as `issue-<ISSUE_ID>`, so it is easier for everyone to understand what they
are meant for. If there is no related issue, please open one (see below).


## Contacts

Feel free to open an issue on this repository, I will reply as soon as I can. You can also contact
me directly on:
  - [Twitter](https://twitter.com/MJaxi0m)
  - [StackOverflow](https://stackoverflow.com/users/13561063/matthieu-jabbour)
  - [LinkedIn](https://www.linkedin.com/in/matthieujabbour)


## Reporting bugs

If you think you found a bug in the code, you can open an issue to report it, so the community can
then work to fix it. Before opening a new issue, make sure the topic is not already being discussed
in another issue, to prevent duplicates. Try to be as clear and exhaustive as possible, so people
can quickly understand what is going on. You can use the following guidelines:

 * **Issue title** explaining the bug in a small and concise sentence.
 * **Version** on which you are experiencing the bug.
 * **Test case** to reproduce the bug. You can link a [JSFiddle](https://jsfiddle.net/), [JSBin](https://jsbin.com/), [CodePen](https://codepen.io/#) or any other code snippet to help.
 * **Steps to reproduce** if you don't have any test case link, you can provide a step-by-step process to reproduce the bug.
 * **Expected behaviour** describing what should normally happen.
 * **Actual behaviour** describing what actually happens.
 * **Additional information** like comments, images, GIFs, anything that can help community to correct the issue...

Of course, don't forget to set the correct labels to your issue.


## Proposing changes

As for bugs, feel free to suggest any interesting improvement or new feature. Again, before opening
this kind of request, make sure it is not already a work in progress by checking first the issues
list. You can as well use a similar guideline as the one describe before to make a new request.
Just keep in mind that other contributors have to understand your idea to put it into code.


## Pull Requests

Ready to contribute to the code? That is great, thank you and welcome in the contributors team!
You can create a new branch and open a new pull request to propose your code to the community.

### Naming convention

As for branches name, you should name your pull requests accordingly with the issue they solve
(e.g. `issue-164`). If you wish to give additional information related to that issue, you can fill
the pull request description.

### Prerequisities

To technically contribute to this project, here are the software you will need:
 * A UNIX terminal and an IDE ;)
 * [git](https://git-scm.com/)
 * [docker](https://docs.docker.com/get-docker/)
 * [docker-compose](https://docs.docker.com/compose/install/)


## Development workflow and tools

1. `git clone git@github.com:openizr/docker.git`
2. `cd docker`

You can then test and build images.


## Build & Deployment

You don't have to worry about deploying the code and publishing it on `npm`, the CI/CD system does
it for you (using Github Actions). Each time a new release is created on the `master` branch, Github Actions
will automatically build and deploy this release on `npm` with the version you specified in your
release name. Of course, all tests must pass otherwise code won't be deployed. However, if you want
to get an preview of the distributed package, you can run `docker exec <PROJECT_NAME>_<PACKAGE> yarn run build`.
Assets will be compiled into the `dist` directory of the proper package.


## Guidelines

### Git commits

To provide good and clear git commit messages, you should follow [these guidelines](https://chris.beams.io/posts/git-commit/).


## License

[MIT](https://github.com/openizr/docker/blob/master/LICENSE)

Copyright (c) Openizr. All Rights Reserved.
