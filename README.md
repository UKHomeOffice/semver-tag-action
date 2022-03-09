# SemVer Tag A Commit

Action that identifies the latest SemVer tag, increments it and tags the version on the current commit.

## Semantic Tagging Action

### All input options

| Input                                                               | Description                                                                 | Default               | Required |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | -------- |
| [increment](#increment) | The amount to increment the tag by | | Yes |
| [github_token](#github_token) | Github API token | | Yes |


### Detailed inputs

#### increment

Accepted values are 
* `major` e.g. 1.4.5 -> 2.0.0
* `minor` e.g. 1.4.5 -> 1.5.0
* `patch` e.g. 1.4.5 -> 1.4.6

#### github_token

Requried to make API requests and tagging. pass using `secrets.GITHUB_TOKEN`

### List of outputs

| Output | Description |
| --- | --- |
| version | The new SemVer tag based on the existing tag + increment |

### Usage

This action can only be triggered on the following events: `pull_request` and `pull_request_target`. If used on other events the job will fail.

#### SemVer tag the commit

```yaml
name: 'SemVer tag the commit'
on:
  pull_request:
    types: [ labeled, unlabeled, opened, reopened, synchronize ]

jobs:
  build:
    name: SemVer tag the commit
    runs-on: ubuntu-latest
    steps:
      - id: label
        uses: UKHomeOffice/match-label-action@main
        with:
          labels: minor,major,patch
          mode: singular
      - uses: UKHomeOffice/semver-tag-action@main
        with:
        increment: ${{ steps.label.outputs.matchedLabels }}
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Generating dist/index.js

We use [ncc](https://github.com/vercel/ncc) to package the action into an executable file. 
This removes the need to either check in the node_modules folder or build the action prior to using.

We need to ensure that the dist folder is updated whenever there is a functionality change, otherwise we won't be running the correct version within jobs that use this action.

Before checking creating your Pull Request you should ensure that you have built this file by running `npm run build` within the root directory. 

A blocking workflow called [check-dist](.github/workflows/check-dist.yml) is enabled that checks this dist folder for changes happens at both push to main and on pull request events.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
