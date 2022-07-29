# SemVer Tag A Commit

Action that tags a commit with a valid SemVer tag.
Optionally creates or moves a 'Major' tag to the current commit i.e. 'v1' when tagging '1.2.3'

## Semantic Tagging Action

### All input options

| Input                                                               | Description                                                                 | Default               | Required |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | -------- |
| [tag](#tag) | The tag to use  | | Yes |
| [github_token](#github_token) | Github API token | | Yes |
| [move_major_tag](#move_major_tag) | Create or move a 'Major' tag | false | No|

### Detailed inputs

#### tag

Tag to use, must be a valid SemVer value

#### move_major_tag

Some projects like GitHub actions, reference 'Major' tags e.g 

```yaml
UKHomeOffice/match-label-action@v1
```

If true a 'Major' tag will be created or moved to this commit.
It will contain a 'v' if the Semver value passed does not contain one.
Example:

| merge_major_tag value       | [tag](#tag) value    | Tags Created  |
| ----------------------------|--------------------- | --------------|
| true  | v1.2.3 | v1.2.3, v1|
| false  | v1.2.3 | 1.2.3|
| true  | 1.2.3 | 1.2.3, v1|
| false  | 1.2.3 | 1.2.3|


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

      - name: Calculate SemVer value
        id: calculate
        uses: UKHomeOffice/semver-calculate-action@main
        with:
          increment: ${{ steps.label.outputs.matchedLabels }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          default_to_highest: ${{ github.base_ref == 'main' }}

      - uses: some-provider/any-action@main
        with:
          tag: ${{ steps.calculate.outputs.version }}

      - name: Tag Repository
        uses: UKHomeOffice/semver-tag-action@main
        with:
          tag: ${{ steps.calculate.outputs.version }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          move_major_tag: true
```

### Generating dist/index.js

We use [ncc](https://github.com/vercel/ncc) to package the action into an executable file.
This removes the need to either check in the node_modules folder or build the action prior to using.

We need to ensure that the dist folder is updated whenever there is a functionality change, otherwise we won't be running the correct version within jobs that use this action.

Before creating your Pull Request you should ensure that you have built this file by running `npm run build` within the root directory.

A blocking workflow called [check-dist](.github/workflows/check-dist.yml) is enabled that checks this dist folder for changes at both 'push to main' and on 'pull request events'.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
