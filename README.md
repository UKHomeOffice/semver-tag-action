# SemVer Tag A Commit

Action that tags a commit with a valid SemVer tag.

## Semantic Tagging Action

### All input options

| Input                                                               | Description                                                                 | Default               | Required |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | -------- |
| [tag](#value) | The tag to use  | | Yes|
| [github_token](#github_token) | Github API token | | Yes |

### Detailed inputs

#### tag

Tag to use, must be a valid SemVer value

#### github_token

Required to make API requests and tagging. pass using `secrets.GITHUB_TOKEN`.

### Usage

This action can only be triggered on the following events: `pull_request`, `pull_request_target`, `workflow_dispatch`. If used on other events the job will fail.

#### Increment tag on repository

```yaml
name: 'SemVer'
on:
  pull_request:
    types: [ closed ]

jobs:
  build:
    name: SemVer
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - id: label
        uses: UKHomeOffice/match-label-action@main
        with:
          labels: minor,major,patch
          mode: singular

      - uses: UKHomeOffice/semver-calculate-action@main
        with:
          increment: ${{ steps.label.outputs.matchedLabels }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          default_to_highest: ${{ github.base_ref == 'main' }}

      - uses: some-provider/any-action@main
        with:
          tag: ${{ steps.label.outputs.version }}

      - uses: UKHomeOffice/semver-tag-action@main
        with:
          tag: ${{ steps.label.outputs.version }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Generating dist/index.js

We use [ncc](https://github.com/vercel/ncc) to package the action into an executable file.
This removes the need to either check in the node_modules folder or build the action prior to using.

We need to ensure that the dist folder is updated whenever there is a functionality change, otherwise we won't be running the correct version within jobs that use this action.

Before creating your Pull Request you should ensure that you have built this file by running `npm run build` within the root directory.

A blocking workflow called [check-dist](.github/workflows/check-dist.yml) is enabled that checks this dist folder for changes at both 'push to main' and on 'pull request events'.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
