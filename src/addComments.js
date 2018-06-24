'use strict'

const _ = require('lodash');
const async = require('async');
const debug = require('debug')('jira-resource');
const request = require('request');

const debugResponse = require('./debugResponse.js');

module.exports = (issue, source, params, callback) => {
    if (!issue) {
        return callback(null);
    }

    if (!params.comment) {
        return callback(null, issue)
    }

    const commentUrl = source.url + '/rest/api/2/issue/' + issue.id + '/comment/';

    debug('Adding comment...')

    async.each(params.comment,
        (comment, next) => {
            debug('Adding: %s', comment);

            request({
                method: 'POST',
                uri: commentsUrl,
                auth: {
                    username: source.username,
                    password: source.password
                },
                json: comment
            }, (error, response) => {
                debugResponse(response);
                next(error);
            })
        },
        (error) => {
            callback(error, issue);
        }
    );
};
