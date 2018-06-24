Jira Ticket Resource
===================================

Create and update Jira tickets via Concourse CI

Quick Example
-------------
```yaml
- name: update-jira
  plan:
  - put: jira
    params:
      issue_type: Change
      summary: Build v1.0.1
      fields:
        description: With some text
```

Source Configuration
--------------------

```yaml
resources:
- name: jira
  type: jira-resource
  source:
    url: https://xxxxx.atlassian.net
    username: xxxxx
    password: xxxxx
    project: APROJECT
```


Behavior
--------

### `out`: Creates, updates and transitions a Jira ticket

#### $TEXT

The `summary`, `fields` and `custom_fields` can be either a string value, or an object with `text` / `file` fields. If just the `file` is specified it is used to populate the field, if both `file` and `text` are specified then the file is substituted in to replace $FILE in the text.
   
e.g. 

```yaml
description: An awesome ticket
-------
description:
  file: messages/this-will-be-the-description
-------
description:
  text: |
    Substitute text into this messaage
        
    $TEXT
  file: messages/jira-message
```

#### Parameters

* `summary`: *required* The summary of the Jira Ticket. This is used as a unique identifier for the ticket for the purpose of updating / modifying. As such it's recommended you include something unique in the summary, such as the build version.
```yaml
summary: Ticket Summary
-------
summary:
  text: Build v$FILE
  file: version/version
```
* `issue_type`: The issue type for the ticket
```yaml
issue_type: Bug
```
* `fields`: A list of fields to be set with specified values
```yaml
fields:
  description:
    text: |
      Routine Release
            
      $FILE
    file: messages/jira-release-notes
  environment: Prod
  duedate: $NOW+1h
```
 
#### Order of execution

When executing the Jira job the ticket is updated in the following order:

* Search for existing issue matching `summary` given
* Create ticket / update ticket
* Add watchers
* Perform transitions

#### Example for your build
```yaml
jobs:
- name: update-jira
  plan:
  - get: jira-resource
  - put: jira
    params:
      issue_type: Epic
      summary: Lets move it ahead now to Test
      fields:
        description: sample Description
      Labels:
        - Test
        - Test1
      comment:
        - Hello Team, please check the failed build`
      watchers:
        - Sahotay
	- Rahul
      custom_fields:
        this_text_doesnt_matter:
          id: 10105
          value: ((jira-sprint))

resources:
  - name: jira-resource
    type: git
    source:
      uri: ((git-repo))
      branch: master
      private_key: ((private-repo-key))

  - name: jira
    type: jira
    source:
      url: ((jira-url))
      username: ((jira-username))
      password: ((jira-password))
      project: ((jira-project))

resource_types:
- name: jira
  type: docker-image
  source:
    email: ((docker-hub-email))
    username: ((docker-hub-username))
    password: ((docker-hub-password))
    repository: sahotay/jira
    tag: testversion

