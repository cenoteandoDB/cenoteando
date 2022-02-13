# How to contribute to this project

Thank you for taking your time to make this project better.
In order to make this process as efficient as possible we ask you to follow the guidelines we present in this page,
always respecting our [code of conduct](https://www.github.com/cenoteandoDB/cenoteando/blob/main/CODE_OF_CONDUCT.md).

## Setup

You may follow the instructions on setting up the development environment and interacting with the application on the [README](https://www.github.com/cenoteandoDB/cenoteando/blob/main/README.md).

For external contributions we follow the [Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

## How to submit your changes

* Create a new branch based on the dev branch
  ```
  git checkout dev
  git checkout -b YOUR-BRANCH
  ```
* Make your changes and commit often
* After you have made your changes run ```make lint```
* Make sure your branch is rebased onto the dev branch of this repository with
  ```
  git checkout dev
  git pull
  git checkout YOUR-BRANCH
  git rebase -i dev
  ```
* Cleanup your commit history
* Make your pull request (try to address one issue per pull request)
* Your pull request will be submitted to a review process
* When your pull request passes the review process it will be merged with the dev branch

### Commits

When cleaning up your commit history try to make each commit's message logical and descriptive.
Try to explain **WHAT** has changed and **WHY**.

### Pull requests

Pull requests should have a minimal amount of lines changed in order to facilitate the review process.
Try to address a single issue per pull request.

The description should contain a high level overview of what changed and the logic behind each decision.
It should also have a [reference](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) to the issue addressed.
